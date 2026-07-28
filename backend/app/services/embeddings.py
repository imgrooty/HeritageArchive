import re
import math
import hashlib
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# 50 topics mapped to vector indices (0 to 49) to simulate contextual semantic spaces
TOPIC_KEYWORDS: dict[str, tuple[int, list[str]]] = {
    "temple": (0, ["temple", "mandir", "shrine", "devalaya", "pagoda", "gumba", "stupa", "monastery", "chorten", "मन्दिर", "गुम्बा"]),
    "festival": (1, ["festival", "jatra", "parba", "pujan", "chhat", "dashain", "tihar", "bibaha", "panchami", "चाडपर्व", "जात्रा"]),
    "monument": (2, ["monument", "dharahara", "statue", "heritage", "site", "structure", "pillar", "स्मारक"]),
    "palace": (3, ["palace", "durbar", "mahal", "palatial", "royal", "court", "दरबार"]),
    "art": (4, ["art", "woodcarving", "sculpture", "painting", "thangka", "craft", "terracotta", "कला", "मूर्ति"]),
    "water": (5, ["lake", "pond", "pokhari", "tal", "kunda", "sagar", "river", "water", "ghat", "पोखरी", "ताल", "नदी"]),
    "history": (6, ["history", "ancient", "era", "century", "king", "dynasty", "historical", "malla", "lichhavi", "shah", "इतिहास"]),
    "bhaktapur": (7, ["bhaktapur", "nyatapola", "khwopa", "bhadgaon", "भक्तपुर"]),
    "janakpur": (8, ["janakpur", "mithila", "janaki", "videha", "rama", "sita", "जनकपुर"]),
    "kathmandu": (9, ["kathmandu", "patan", "lalitpur", "swoyambhu", "boudha", "pashupati", "काठमाडौं", "पाटन"]),
    "nature": (10, ["nature", "mountain", "hills", "forest", "conservation", "wildlife", "national park", "प्रकृति"]),
    "community": (11, ["community", "tradition", "culture", "indigenous", "newar", "maithil", "bhojpuri", "tharu", "sherpa", "संस्कृति"]),
    "buddhism": (12, ["buddha", "buddhist", "lumbini", "stupa", "dharma", "monk", "शाक्यमुनि"]),
    "hinduism": (13, ["hindu", "deity", "god", "goddess", "shiva", "vishnu", "krishna", "devi", "भैरव", "भगवती"]),
}

def get_text_embedding(title: str, content: str) -> list[float]:
    text_corpus = (title + " " + content).lower()
    vector = [0.0] * 384

    # 1. Populate top dimensions (0-49) by scanning matched keywords
    for topic, (idx, keywords) in TOPIC_KEYWORDS.items():
        weight = 0.0
        for keyword in keywords:
            weight += text_corpus.count(keyword.lower()) * 1.5
        if weight > 0:
            vector[idx] = min(weight, 5.0)

    # 2. Populate remaining latent dimensions (50-383) using deterministic word hashing
    words = re.findall(r'\w+', text_corpus)
    for word in words:
        if len(word) > 2:  # Skip short stop-words
            h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
            idx = 50 + (h % 334)
            vector[idx] += 0.25

    # 3. L2 Normalization to unit length (cosine similarity becomes simple dot product)
    magnitude = math.sqrt(sum(v*v for v in vector))
    if magnitude > 0:
        vector = [v / magnitude for v in vector]
    else:
        vector[0] = 1.0
    return vector

async def generate_and_store_embedding(site_id: int, title: str, content: str, db: AsyncSession):
    try:
        embedding_vector = get_text_embedding(title, content)
        
        # Format array as pgvector string representation: '[x1,x2,...]'
        vector_str = "[" + ",".join(str(v) for v in embedding_vector) + "]"
        
        query = text("""
            INSERT INTO site_embeddings (site_id, embedding)
            VALUES (:site_id, :embedding::vector)
            ON CONFLICT (site_id)
            DO UPDATE SET embedding = EXCLUDED.embedding
        """)
        await db.execute(query, {"site_id": site_id, "embedding": vector_str})
        await db.commit()
    except Exception as e:
        print(f"Notice: Could not store embedding for site #{site_id} (pgvector table unavailable): {e}")
