from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # site | tradition | festival | community
    site_id = Column(Integer, ForeignKey("heritage_sites.id", ondelete="SET NULL"), nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Optional relationship linking back to our main archive records
    site = relationship("HeritageSite")

class KnowledgeEdge(Base):
    __tablename__ = "knowledge_edges"

    id = Column(Integer, primary_key=True, index=True)
    source_node_id = Column(Integer, ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    target_node_id = Column(Integer, ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String, nullable=False)  # located_in | celebrates | practiced_by | dedicated_to | built_by | related_to

    __table_args__ = (
        UniqueConstraint("source_node_id", "target_node_id", "relationship_type", name="unique_edge"),
    )

    source_node = relationship("KnowledgeNode", foreign_keys=[source_node_id])
    target_node = relationship("KnowledgeNode", foreign_keys=[target_node_id])
