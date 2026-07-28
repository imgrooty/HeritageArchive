from pydantic import BaseModel
from datetime import datetime

class KnowledgeNodeResponse(BaseModel):
    id: int
    name: str
    type: str  # site | tradition | festival | community
    site_id: int | None = None
    description: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class KnowledgeEdgeResponse(BaseModel):
    id: int
    source_node_id: int
    target_node_id: int
    relationship_type: str  # located_in | celebrates | practiced_by | dedicated_to | built_by | related_to

    class Config:
        from_attributes = True

class KnowledgeGraphResponse(BaseModel):
    nodes: list[KnowledgeNodeResponse]
    edges: list[KnowledgeEdgeResponse]
