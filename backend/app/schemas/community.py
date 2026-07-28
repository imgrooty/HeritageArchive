from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentAuthor(BaseModel):
    id: int
    username: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class CommentResponse(BaseModel):
    id: int
    site_id: int
    user_id: int
    content: str
    created_at: datetime
    user: CommentAuthor

    model_config = ConfigDict(from_attributes=True)


class LikeResponse(BaseModel):
    likes_count: int
    has_liked: bool


class VerificationCreate(BaseModel):
    result: str = Field(..., description="Must be 'supports' or 'disputes'")
    comment: str | None = Field(None, max_length=500)


class VerificationResponse(BaseModel):
    id: int
    site_id: int
    user_id: int
    result: str
    comment: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VerificationStats(BaseModel):
    supports_count: int
    disputes_count: int
    user_vote: str | None = None # 'supports' | 'disputes' | None


class ReportCreate(BaseModel):
    reason: str = Field(..., min_length=3, max_length=100)
    description: str | None = Field(None, max_length=1000)


class ReportResponse(BaseModel):
    id: int
    site_id: int
    user_id: int
    reason: str
    description: str | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RevisionAuthor(BaseModel):
    username: str

    model_config = ConfigDict(from_attributes=True)


class RevisionResponse(BaseModel):
    id: int
    site_id: int
    user_id: int
    change_summary: str
    details: dict | None = None
    created_at: datetime
    user: RevisionAuthor

    model_config = ConfigDict(from_attributes=True)


class ProfileSiteResponse(BaseModel):
    id: int
    name: str
    category: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(BaseModel):
    id: int
    username: str
    role: str
    reputation_score: int
    created_at: datetime
    submissions: list[ProfileSiteResponse]

    model_config = ConfigDict(from_attributes=True)
