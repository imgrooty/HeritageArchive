from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.heritage import HeritageSite
from app.models.community import Comment, Like, Verification, Report, Revision
from app.schemas.community import (
    CommentCreate, CommentResponse, LikeResponse,
    VerificationCreate, VerificationResponse, VerificationStats,
    ReportCreate, ReportResponse, RevisionResponse, UserProfileResponse
)

router = APIRouter(tags=["Community & Interaction"])

# 1. Toggle Like
@router.post("/heritage/{id}/like", response_model=LikeResponse)
async def toggle_like(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check site exists
    result = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )

    # Check if already liked
    like_result = await db.execute(
        select(Like).where(and_(Like.user_id == current_user.id, Like.site_id == id))
    )
    existing_like = like_result.scalar_one_or_none()

    if existing_like:
        await db.delete(existing_like)
        has_liked = False
    else:
        new_like = Like(user_id=current_user.id, site_id=id)
        db.add(new_like)
        has_liked = True

    await db.commit()

    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(Like).where(Like.site_id == id)
    )
    count = count_result.scalar() or 0

    return LikeResponse(likes_count=count, has_liked=has_liked)


# 2. Get Likes Info
@router.get("/heritage/{id}/likes", response_model=LikeResponse)
async def get_likes(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    # Check site exists
    result = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )

    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(Like).where(Like.site_id == id)
    )
    count = count_result.scalar() or 0

    has_liked = False
    if current_user:
        like_result = await db.execute(
            select(Like).where(and_(Like.user_id == current_user.id, Like.site_id == id))
        )
        if like_result.scalar_one_or_none():
            has_liked = True

    return LikeResponse(likes_count=count, has_liked=has_liked)


# 3. Create Comment
@router.post("/heritage/{id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    id: int,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check site exists
    result = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )

    new_comment = Comment(
        site_id=id,
        user_id=current_user.id,
        content=comment_in.content
    )
    db.add(new_comment)
    await db.commit()

    # Reload with author relationships
    reload_result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.id == new_comment.id)
    )
    return reload_result.scalar_one()


# 4. List Comments
@router.get("/heritage/{id}/comments", response_model=list[CommentResponse])
async def list_comments(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.site_id == id)
        .order_by(Comment.created_at.desc())
    )
    return result.scalars().all()


# 5. Cast Verification Review (updates reputation)
@router.post("/heritage/{id}/verify", response_model=VerificationResponse, status_code=status.HTTP_201_CREATED)
async def verify_site(
    id: int,
    vote_in: VerificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check site exists
    site_result = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
    site = site_result.scalar_one_or_none()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )

    # Check that they haven't already voted
    existing_result = await db.execute(
        select(Verification).where(and_(Verification.user_id == current_user.id, Verification.site_id == id))
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a verification review for this heritage site."
        )

    new_vote = Verification(
        site_id=id,
        user_id=current_user.id,
        result=vote_in.result,
        comment=vote_in.comment
    )
    db.add(new_vote)
    
    # Award +1 reputation point to the verifier for contributing to community moderation
    user_result = await db.execute(select(User).where(User.id == current_user.id))
    db_user = user_result.scalar_one()
    db_user.reputation_score += 1
    
    await db.commit()
    await db.refresh(new_vote)
    return new_vote


# 6. Fetch Verification Stats
@router.get("/heritage/{id}/verify/stats", response_model=VerificationStats)
async def get_verification_stats(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    # Check site exists
    site_result = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
    if not site_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )

    # Query counts
    supports_result = await db.execute(
        select(func.count()).select_from(Verification).where(and_(Verification.site_id == id, Verification.result == "supports"))
    )
    supports = supports_result.scalar() or 0

    disputes_result = await db.execute(
        select(func.count()).select_from(Verification).where(and_(Verification.site_id == id, Verification.result == "disputes"))
    )
    disputes = disputes_result.scalar() or 0

    user_vote = None
    if current_user:
        existing_result = await db.execute(
            select(Verification).where(and_(Verification.user_id == current_user.id, Verification.site_id == id))
        )
        vote_record = existing_result.scalar_one_or_none()
        if vote_record:
            user_vote = vote_record.result

    return VerificationStats(
        supports_count=supports,
        disputes_count=disputes,
        user_vote=user_vote
    )


# 7. Submit Report
@router.post("/heritage/{id}/report", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def report_site(
    id: int,
    report_in: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check site exists
    site_result = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
    if not site_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )

    new_report = Report(
        site_id=id,
        user_id=current_user.id,
        reason=report_in.reason,
        description=report_in.description
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report


# 8. Get Revision Logs
@router.get("/heritage/{id}/revisions", response_model=list[RevisionResponse])
async def get_site_revisions(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    # Check site exists
    site_result = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
    if not site_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )

    result = await db.execute(
        select(Revision)
        .options(selectinload(Revision.user))
        .where(Revision.site_id == id)
        .order_by(Revision.created_at.desc())
    )
    return result.scalars().all()


# 9. Get Public Contributor Profile
@router.get("/users/{id}/profile", response_model=UserProfileResponse)
async def get_user_profile(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    # Fetch User
    user_result = await db.execute(select(User).where(User.id == id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Fetch User's Site Submissions
    submissions_result = await db.execute(
        select(HeritageSite)
        .where(HeritageSite.creator_id == id)
        .order_by(HeritageSite.created_at.desc())
    )
    submissions = submissions_result.scalars().all()

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        role=user.role,
        reputation_score=user.reputation_score,
        created_at=user.created_at,
        submissions=submissions
    )
