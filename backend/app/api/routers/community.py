from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.user import User
from app.models.community import HeritageVerification, VerificationStatus, CommunityComment
from app.schemas.community import VerificationCreate, VerificationResponse, CommentCreate, CommentResponse
from app.api.routers.auth import get_current_active_user

router = APIRouter(prefix="/community", tags=["Community Verification & Discussion"])

@router.post("/verify", response_model=VerificationResponse, status_code=status.HTTP_201_CREATED)
async def submit_verification(
    verification_in: VerificationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(HeritageVerification).where(
            HeritageVerification.heritage_site_id == verification_in.heritage_site_id,
            HeritageVerification.verifier_id == current_user.id
        )
    )
    existing = result.scalars().first()
    if existing:
        existing.status = verification_in.status
        existing.feedback_notes = verification_in.feedback_notes
        await db.commit()
        await db.refresh(existing)
        return existing
    
    new_verification = HeritageVerification(
        heritage_site_id=verification_in.heritage_site_id,
        verifier_id=current_user.id,
        status=verification_in.status,
        feedback_notes=verification_in.feedback_notes
    )
    db.add(new_verification)
    current_user.reputation_score += 5
    await db.commit()
    await db.refresh(new_verification)
    return new_verification

@router.get("/verifications/{site_id}", response_model=List[VerificationResponse])
async def get_site_verifications(site_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HeritageVerification).where(HeritageVerification.heritage_site_id == site_id)
    )
    return result.scalars().all()

@router.post("/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    comment = CommunityComment(
        heritage_site_id=comment_in.heritage_site_id,
        user_id=current_user.id,
        content=comment_in.content
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment

@router.get("/comments/{site_id}", response_model=List[CommentResponse])
async def get_site_comments(site_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CommunityComment).where(CommunityComment.heritage_site_id == site_id)
    )
    return result.scalars().all()
