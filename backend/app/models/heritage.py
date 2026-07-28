from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class HeritageSite(Base):
    __tablename__ = "heritage_sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    
    # Categories: temple | monument | festival | tradition | architecture | natural | history
    category = Column(String, index=True, nullable=False)
    
    # Geographic location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Moderation states: pending | approved | rejected | changes_requested
    status = Column(String, default="pending", index=True, nullable=False)
    moderator_notes = Column(String, nullable=True)
    
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    creator = relationship("User", foreign_keys=[creator_id])
    stories = relationship("Story", back_populates="site", cascade="all, delete-orphan")
    media = relationship("HeritageMedia", back_populates="site", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="site", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="site", cascade="all, delete-orphan")
    verifications = relationship("Verification", back_populates="site", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="site", cascade="all, delete-orphan")
    revisions = relationship("Revision", back_populates="site", cascade="all, delete-orphan")


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("heritage_sites.id"), nullable=False)
    
    # Language: en | ne | mai | bho
    language = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    
    contributor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Translation Metadata
    is_translation = Column(Boolean, default=False, nullable=False)
    translation_method = Column(String, default="original", nullable=False) # original | machine | human
    translation_status = Column(String, default="approved", nullable=False) # pending_review | approved
    original_story_id = Column(Integer, ForeignKey("stories.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    site = relationship("HeritageSite", back_populates="stories")
    contributor = relationship("User", foreign_keys=[contributor_id])
    original_story = relationship("Story", remote_side=[id])


class HeritageMedia(Base):
    __tablename__ = "heritage_media"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("heritage_sites.id"), nullable=False)
    
    media_url = Column(String, nullable=False)
    # Media Types: image | video | audio
    media_type = Column(String, default="image", nullable=False)
    
    contributor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    site = relationship("HeritageSite", back_populates="media")
    contributor = relationship("User", foreign_keys=[contributor_id])
