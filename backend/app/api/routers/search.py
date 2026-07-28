from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.models.heritage import HeritageSite, Story
from app.schemas.heritage import HeritageSiteResponse
from app.services.embeddings import get_text_embedding

router = APIRouter(tags=["Search & AI Intelligence"])

class SearchQuery(BaseModel):
    query: str

class CategorySuggestionRequest(BaseModel):
    title: str
    content: str

class DuplicateCheckRequest(BaseModel):
    title: str
    content: str
    latitude: float
    longitude: float

# Categories mapped to keyword matches
CATEGORY_KEYWORDS = {
    "temple": ["temple", "shrine", "mandir", "stupa", "monastery", "gumba", "pagoda", "devalaya", "मन्दिर", "गुम्बा"],
    "monument": ["monument", "statue", "dharahara", "pillar", "sculpture", "tower", "स्मारक", "मूर्ति"],
    "festival": ["festival", "jatra", "parba", "celebrate", "pujan", "chhat", "dashain", "tihar", "चाडपर्व", "जात्रा"],
    "traditional_practice": ["practice", "craft", "pottery", "woodcarving", "thangka", "dance", "folk", "painting", "custom", "ritual", "कला"],
    "architecture": ["architecture", "design", "woodwork", "palace", "durbar", "gate", "structural", "style", "building", "दरबार"],
    "natural_heritage": ["lake", "pond", "pokhari", "tal", "sagar", "river", "mountain", "forest", "nature", "conservation", "water", "पोखरी", "ताल"],
    "historical_site": ["history", "ancient", "era", "century", "dynasty", "archaeological", "ruins", "old", "malla", "lichhavi", "king", "इतिहास"]
}

# 1. AI Semantic Search
@router.get("/search/semantic")
async def semantic_search(query: str, db: AsyncSession = Depends(get_db)):
    if not query.strip():
        # Fallback to all approved sites
        result = await db.execute(
            select(HeritageSite)
            .options(selectinload(HeritageSite.stories), selectinload(HeritageSite.media))
            .where(HeritageSite.status == "approved")
        )
        sites = result.scalars().all()
        return [{"site": site, "similarity": 1.0} for site in sites]

    try:
        # Generate query embedding
        query_vector = get_text_embedding(query, query)
        vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"

        # Perform pgvector cosine distance query (similarity = 1 - cosine_distance)
        sql_query = text("""
            SELECT site_id, 1 - (embedding <=> :query_vector::vector) AS similarity
            FROM site_embeddings
            ORDER BY embedding <=> :query_vector::vector
            LIMIT 10
        """)
        res = await db.execute(sql_query, {"query_vector": vector_str})
        rows = res.all()

        matched_sites = []
        for site_id, similarity in rows:
            site_res = await db.execute(
                select(HeritageSite)
                .options(selectinload(HeritageSite.stories), selectinload(HeritageSite.media))
                .where(HeritageSite.id == site_id, HeritageSite.status == "approved")
            )
            site = site_res.scalar_one_or_none()
            if site:
                matched_sites.append({
                    "site": site,
                    "similarity": round(max(0.0, float(similarity)), 4)
                })

        return matched_sites
    except Exception:
        # Soft Fallback: Keyword search across title/content/name if pgvector is unavailable
        from sqlalchemy import or_
        fallback_query = (
            select(HeritageSite)
            .options(selectinload(HeritageSite.stories), selectinload(HeritageSite.media))
            .join(HeritageSite.stories)
            .where(
                HeritageSite.status == "approved",
                or_(
                    HeritageSite.name.ilike(f"%{query}%"),
                    Story.title.ilike(f"%{query}%"),
                    Story.content.ilike(f"%{query}%")
                )
            )
            .distinct()
            .limit(10)
        )
        fallback_res = await db.execute(fallback_query)
        sites = fallback_res.scalars().all()
        return [{"site": site, "similarity": 0.85} for site in sites]

# 2. Related Heritage recommendations
@router.get("/heritage/{id}/related")
async def get_related_sites(id: int, db: AsyncSession = Depends(get_db)):
    try:
        # Grab target site embedding
        emb_res = await db.execute(text("SELECT embedding FROM site_embeddings WHERE site_id = :id"), {"id": id})
        target_embedding = emb_res.scalar()
        
        if not target_embedding:
            raise ValueError("No vector embedding found for target site, falling back to category match")

        # Get most similar sites based on cosine similarity
        sql_query = text("""
            SELECT site_id, 1 - (embedding <=> :target_embedding::vector) AS similarity
            FROM site_embeddings
            WHERE site_id != :id
            ORDER BY embedding <=> :target_embedding::vector
            LIMIT 4
        """)
        res = await db.execute(sql_query, {"id": id, "target_embedding": target_embedding})
        rows = res.all()

        related = []
        for site_id, similarity in rows:
            site_res = await db.execute(
                select(HeritageSite)
                .options(selectinload(HeritageSite.stories), selectinload(HeritageSite.media))
                .where(HeritageSite.id == site_id, HeritageSite.status == "approved")
            )
            site = site_res.scalar_one_or_none()
            if site:
                related.append({
                    "site": site,
                    "similarity": round(float(similarity), 4)
                })
        return related
    except Exception:
        # Soft Fallback: Return heritage sites in the same category
        target_res = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
        target_site = target_res.scalar_one_or_none()
        if not target_site:
            return []
        
        cat_query = (
            select(HeritageSite)
            .options(selectinload(HeritageSite.stories), selectinload(HeritageSite.media))
            .where(
                HeritageSite.id != id,
                HeritageSite.category == target_site.category,
                HeritageSite.status == "approved"
            )
            .limit(4)
        )
        cat_res = await db.execute(cat_query)
        sites = cat_res.scalars().all()
        return [{"site": site, "similarity": 0.75} for site in sites]

# 3. AI Category Auto-Suggest
@router.post("/heritage/suggest-category")
async def suggest_category(req: CategorySuggestionRequest):
    text_corpus = (req.title + " " + req.content).lower()
    scores = {cat: 0 for cat in CATEGORY_KEYWORDS.keys()}
    
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for word in keywords:
            scores[cat] += text_corpus.count(word.lower())

    # Get highest scoring category
    best_cat = max(scores, key=lambda k: scores[k])
    if scores[best_cat] == 0:
        return {"category": "historical_site"}  # default fallback
    return {"category": best_cat}

# 4. Duplicate Check Warning (Semantics & Proximity)
@router.post("/heritage/check-duplicate")
async def check_duplicate(req: DuplicateCheckRequest, db: AsyncSession = Depends(get_db)):
    # 1. Check geographic proximity (within 150 meters)
    # Using standard Haversine approximation (150m is approx 0.00135 degrees lat/lng)
    prox_query = await db.execute(
        select(HeritageSite).where(
            text("abs(latitude - :lat) < 0.00135 AND abs(longitude - :lon) < 0.00135")
        ),
        {"lat": req.latitude, "lon": req.longitude}
    )
    nearby_site = prox_query.scalar_one_or_none()
    if nearby_site:
        return {
            "duplicate": True,
            "reason": f"A site named '{nearby_site.name}' already exists nearby (within 150m).",
            "site_id": nearby_site.id
        }

    # 2. Check semantic story similarity if pgvector is active
    try:
        query_vector = get_text_embedding(req.title, req.content)
        vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"

        sql_query = text("""
            SELECT site_id, 1 - (embedding <=> :query_vector::vector) AS similarity
            FROM site_embeddings
            ORDER BY embedding <=> :query_vector::vector
            LIMIT 1
        """)
        res = await db.execute(sql_query, {"query_vector": vector_str})
        row = res.one_or_none()

        if row and row.similarity > 0.88:
            site_id = row.site_id
            site_res = await db.execute(select(HeritageSite).where(HeritageSite.id == site_id))
            matched_site = site_res.scalar_one_or_none()
            if matched_site:
                return {
                    "duplicate": True,
                    "reason": f"An entry with a highly similar description ('{matched_site.name}') already exists in the database.",
                    "site_id": matched_site.id
                }
    except Exception:
        pass

    return {"duplicate": False, "reason": "No duplicates detected."}
