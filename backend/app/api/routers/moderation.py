from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import RoleChecker
from app.models.user import User
from app.models.heritage import HeritageSite
from app.schemas.heritage import HeritageSiteResponse
from app.schemas.moderation import ModerationAction

# Secure all route handlers in this module to only allow moderators and administrators
router = APIRouter(
    prefix="/moderation",
    tags=["Moderation Queue"],
    dependencies=[Depends(RoleChecker(allowed_roles=["moderator", "admin"]))]
)

@router.get("/queue", response_model=list[HeritageSiteResponse])
async def get_moderation_queue(db: AsyncSession = Depends(get_db)):
    """Fetch all pending heritage sites awaiting review."""
    result = await db.execute(
        select(HeritageSite)
        .options(selectinload(HeritageSite.stories), selectinload(HeritageSite.media))
        .where(HeritageSite.status == "pending")
    )
    return result.scalars().all()

@router.post("/{id}/action", response_model=HeritageSiteResponse)
async def moderate_site(
    id: int,
    action: ModerationAction,
    db: AsyncSession = Depends(get_db)
):
    """Approve, reject, or request changes on a submitted heritage site."""
    result = await db.execute(
        select(HeritageSite)
        .options(selectinload(HeritageSite.stories), selectinload(HeritageSite.media))
        .where(HeritageSite.id == id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )
        
    site.status = action.status
    site.moderator_notes = action.notes
    
    # Award contributor +5 reputation points if their heritage site submission is approved
    if action.status == "approved":
        creator_result = await db.execute(select(User).where(User.id == site.creator_id))
        creator = creator_result.scalar_one_or_none()
        if creator:
            creator.reputation_score += 5
            
    await db.commit()
    await db.refresh(site)
    return site
