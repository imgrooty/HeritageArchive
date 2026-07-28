from datetime import datetime
from pydantic import BaseModel, Field

class StoryCreate(BaseModel):
    # Language: en | ne | mai | bho
    language: str = Field(..., pattern="^(en|ne|mai|bho)$")
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)

class StoryResponse(StoryCreate):
    id: int
    site_id: int
    contributor_id: int
    created_at: datetime
    is_translation: bool
    translation_method: str
    translation_status: str
    original_story_id: int | None = None

    class Config:
        from_attributes = True


class MediaCreate(BaseModel):
    media_url: str
    media_type: str = Field("image", pattern="^(image|video|audio)$")

class MediaResponse(MediaCreate):
    id: int
    site_id: int
    contributor_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class HeritageSiteCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    category: str = Field(..., pattern="^(temple|monument|festival|tradition|traditional_practice|architecture|natural|natural_heritage|history|historical_site)$")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    initial_story: StoryCreate

class HeritageSiteResponse(BaseModel):
    id: int
    name: str
    category: str
    latitude: float
    longitude: float
    status: str
    moderator_notes: str | None
    creator_id: int
    created_at: datetime
    updated_at: datetime
    stories: list[StoryResponse] = []
    media: list[MediaResponse] = []

    class Config:
        from_attributes = True


class HeritageSiteUpdate(BaseModel):
    name: str | None = Field(None, min_length=3, max_length=200)
    category: str | None = Field(None, pattern="^(temple|monument|festival|tradition|traditional_practice|architecture|natural|natural_heritage|history|historical_site)$")
    latitude: float | None = Field(None, ge=-90.0, le=90.0)
    longitude: float | None = Field(None, ge=-180.0, le=180.0)

