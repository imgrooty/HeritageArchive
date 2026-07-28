from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("heritage_sites.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    site = relationship("HeritageSite", back_populates="comments")
    user = relationship("User", foreign_keys=[user_id])


class Like(Base):
    __tablename__ = "likes"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    site_id = Column(Integer, ForeignKey("heritage_sites.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("user_id", "site_id"),
    )

    # Relationships
    site = relationship("HeritageSite", back_populates="likes")
    user = relationship("User", foreign_keys=[user_id])


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("heritage_sites.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    result = Column(String, nullable=False)  # supports | disputes
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    site = relationship("HeritageSite", back_populates="verifications")
    user = relationship("User", foreign_keys=[user_id])


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("heritage_sites.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending | reviewed | action_taken
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    site = relationship("HeritageSite", back_populates="reports")
    user = relationship("User", foreign_keys=[user_id])


class Revision(Base):
    __tablename__ = "revisions"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("heritage_sites.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    change_summary = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    site = relationship("HeritageSite", back_populates="revisions")
    user = relationship("User", foreign_keys=[user_id])
