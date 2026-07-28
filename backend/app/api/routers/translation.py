from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.heritage import HeritageSite, Story
from app.models.community import Revision
from app.schemas.heritage import StoryCreate, StoryResponse
from app.services.translation import trigger_auto_translation

router = APIRouter(prefix="/heritage", tags=["Translations"])

# 1. Add / Edit Translation
@router.post("/{id}/stories", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def add_or_correct_translation(
    id: int,
    story_in: StoryCreate,
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

    # Check if a story already exists for this language
    existing_result = await db.execute(
        select(Story).where(and_(Story.site_id == id, Story.language == story_in.language))
    )
    existing_story = existing_result.scalar_one_or_none()

    if existing_story:
        # Permission check: If it's an original or already a human translation, only creator/moderators can edit.
        # If it is machine-generated, anyone can correct it! (PRD: "Community translation corrections")
        if existing_story.translation_method == "original" or existing_story.translation_method == "human":
            if current_user.id != site.creator_id and current_user.role not in ["moderator", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the creator or moderators can edit original or community-verified stories."
                )

        # Apply correction
        changes = {
            "title": {"old": existing_story.title, "new": story_in.title},
            "content": {"old": existing_story.content, "new": story_in.content}
        }
        
        existing_story.title = story_in.title
        existing_story.content = story_in.content
        existing_story.translation_method = "human"
        existing_story.contributor_id = current_user.id
        
        # Log Revision
        revision = Revision(
            site_id=id,
            user_id=current_user.id,
            change_summary=f"Corrected {story_in.language.upper()} translation",
            details=changes
        )
        db.add(revision)
        await db.commit()

        # Update search embedding index with new correction content
        from app.services.embeddings import generate_and_store_embedding
        await generate_and_store_embedding(id, story_in.title, story_in.content, db)

        await db.refresh(existing_story)
        return existing_story

    else:
        # Create a new story translation
        # Get an original story ID to map as original_story_id reference
        orig_result = await db.execute(
            select(Story.id).where(and_(Story.site_id == id, Story.translation_method == "original"))
        )
        original_id = orig_result.scalar() or None

        new_story = Story(
            site_id=id,
            language=story_in.language,
            title=story_in.title,
            content=story_in.content,
            contributor_id=current_user.id,
            is_translation=True,
            translation_method="human",
            translation_status="approved",
            original_story_id=original_id
        )
        db.add(new_story)
        
        # Log Revision
        revision = Revision(
            site_id=id,
            user_id=current_user.id,
            change_summary=f"Contributed {story_in.language.upper()} story translation",
            details=None
        )
        db.add(revision)
        await db.commit()

        # Update search embedding index with new translation content
        from app.services.embeddings import generate_and_store_embedding
        await generate_and_store_embedding(id, story_in.title, story_in.content, db)

        await db.refresh(new_story)
        return new_story


# 2. Manually Trigger Auto-Translation Pipeline
@router.post("/{id}/translate/trigger", status_code=status.HTTP_200_OK)
async def trigger_translation_pipeline(
    id: int,
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

    # Permission check: creator or moderators/admins
    if current_user.id != site.creator_id and current_user.role not in ["moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to trigger auto-translation."
        )

    # Get original story
    orig_result = await db.execute(
        select(Story).where(and_(Story.site_id == id, Story.translation_method == "original"))
    )
    original_story = orig_result.scalar_one_or_none()
    if not original_story:
        # Grab any first story
        any_result = await db.execute(select(Story).where(Story.site_id == id).limit(1))
        original_story = any_result.scalar_one_or_none()

    if not original_story:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No original story exists to translate from."
        )

    await trigger_auto_translation(id, original_story, db)
    return {"message": "Auto-translation pipeline completed successfully."}
