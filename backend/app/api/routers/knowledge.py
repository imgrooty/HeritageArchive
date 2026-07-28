from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.knowledge import KnowledgeNode, KnowledgeEdge
from app.schemas.knowledge import KnowledgeGraphResponse

router = APIRouter(prefix="/knowledge", tags=["Knowledge Graph"])

# 1. Get entire Knowledge Graph
@router.get("/graph", response_model=KnowledgeGraphResponse)
async def get_full_graph(db: AsyncSession = Depends(get_db)):
    nodes_result = await db.execute(select(KnowledgeNode))
    nodes = nodes_result.scalars().all()

    edges_result = await db.execute(select(KnowledgeEdge))
    edges = edges_result.scalars().all()

    return {"nodes": nodes, "edges": edges}

# 2. Get local subgraph connected to a specific heritage site
@router.get("/site/{site_id}", response_model=KnowledgeGraphResponse)
async def get_site_subgraph(site_id: int, db: AsyncSession = Depends(get_db)):
    # Find the node representing this site
    node_result = await db.execute(
        select(KnowledgeNode).where(KnowledgeNode.site_id == site_id)
    )
    site_node = node_result.scalar_one_or_none()
    if not site_node:
        return {"nodes": [], "edges": []}

    # Fetch edges linked to this site's node
    edges_result = await db.execute(
        select(KnowledgeEdge).where(
            or_(
                KnowledgeEdge.source_node_id == site_node.id,
                KnowledgeEdge.target_node_id == site_node.id
            )
        )
    )
    edges = edges_result.scalars().all()

    # Collect all participating node IDs
    node_ids = {site_node.id}
    for edge in edges:
        node_ids.add(edge.source_node_id)
        node_ids.add(edge.target_node_id)

    connected_nodes = []
    if node_ids:
        nodes_result = await db.execute(
            select(KnowledgeNode).where(KnowledgeNode.id.in_(list(node_ids)))
        )
        connected_nodes = nodes_result.scalars().all()

    return {"nodes": connected_nodes, "edges": edges}
