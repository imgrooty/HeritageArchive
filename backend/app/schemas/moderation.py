from pydantic import BaseModel, Field

class ModerationAction(BaseModel):
    # Allowed moderation states
    status: str = Field(..., pattern="^(approved|rejected|changes_requested)$")
    notes: str | None = Field(None, max_length=1000)
