import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, ALGORITHM
from app.models.user import User
from app.models.heritage import HeritageSite, Story, HeritageMedia
from app.models.community import Revision
from app.schemas.heritage import HeritageSiteCreate, HeritageSiteResponse, MediaResponse, HeritageSiteUpdate

router = APIRouter(prefix="/heritage", tags=["Heritage Sites"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper function to optionally authenticate user for reading public endpoints
async def get_current_user_optional(request: Request, db: AsyncSession = Depends(get_db)) -> User | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        result = await db.execute(select(User).where(User.id == int(user_id)))
        return result.scalar_one_or_none()
    except JWTError:
        return None

@router.get("", response_model=list[HeritageSiteResponse])
async def list_heritage_sites(
    category: str | None = None,
    search: str | None = None,
    include_pending: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    # Eager load stories and media relations to prevent N+1 queries
    query = select(HeritageSite).options(
        selectinload(HeritageSite.stories),
        selectinload(HeritageSite.media)
    )
    
    # Filter by approval status: public gets only approved.
    if include_pending:
        if not current_user or current_user.role not in ["moderator", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted. Only moderators and admins can view pending items."
            )
    else:
        query = query.where(HeritageSite.status == "approved")
        
    if category:
        query = query.where(HeritageSite.category == category)
        
    if search:
        query = query.join(HeritageSite.stories).where(
            or_(
                HeritageSite.name.ilike(f"%{search}%"),
                Story.title.ilike(f"%{search}%"),
                Story.content.ilike(f"%{search}%")
            )
        ).distinct()
        
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=HeritageSiteResponse, status_code=status.HTTP_201_CREATED)
async def create_heritage_site(
    site_in: HeritageSiteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Setup new heritage site record (default status is pending review)
    site = HeritageSite(
        name=site_in.name,
        category=site_in.category,
        latitude=site_in.latitude,
        longitude=site_in.longitude,
        creator_id=current_user.id,
        status="pending"
    )
    db.add(site)
    await db.flush() # Flush to resolve database generated primary key site.id
    
    # Setup the initial multilingual story link
    story = Story(
        site_id=site.id,
        language=site_in.initial_story.language,
        title=site_in.initial_story.title,
        content=site_in.initial_story.content,
        contributor_id=current_user.id
    )
    db.add(story)
    await db.commit()

    # Trigger translation pipeline in the background to generate multilingual stories
    from app.services.translation import trigger_auto_translation
    await trigger_auto_translation(site.id, story, db)

    # Trigger semantic embedding generation for discovery index
    from app.services.embeddings import generate_and_store_embedding
    await generate_and_store_embedding(site.id, story.title, story.content, db)
    
    # Reload site with relationships fully resolved for serialized response
    result = await db.execute(
        select(HeritageSite)
        .options(selectinload(HeritageSite.stories), selectinload(HeritageSite.media))
        .where(HeritageSite.id == site.id)
    )
    return result.scalar_one()

@router.get("/{id}", response_model=HeritageSiteResponse)
async def get_heritage_site(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
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
        
    if site.status != "approved":
        # Block access to non-approved items unless user is creator or moderator
        if not current_user or (current_user.id != site.creator_id and current_user.role not in ["moderator", "admin"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted. Item is currently in review."
            )
            
    return site

@router.post("/{id}/media", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_heritage_media(
    id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(HeritageSite).where(HeritageSite.id == id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Heritage site record not found."
        )
        
    # Check permissions (only creator or moderator/admin)
    if current_user.id != site.creator_id and current_user.role not in ["moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to attach media to this heritage site."
        )
        
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    # Map extensions to media types
    image_exts = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    video_exts = [".mp4", ".mov", ".avi", ".mkv", ".webm"]
    audio_exts = [".mp3", ".wav", ".ogg", ".m4a", ".aac"]
    
    if file_ext in image_exts:
        media_type = "image"
    elif file_ext in video_exts:
        media_type = "video"
    elif file_ext in audio_exts:
        media_type = "audio"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported media format. Supported: Images (.jpg, .png, .gif, .webp), Videos (.mp4, .mov, .webm), Audios (.mp3, .wav, .m4a)."
        )
        
    # Create unique filename and save to static folder
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    media_url = f"/static/uploads/{unique_filename}"
    media = HeritageMedia(
        site_id=id,
        media_url=media_url,
        media_type=media_type,
        contributor_id=current_user.id
    )
    db.add(media)
    await db.commit()
    await db.refresh(media)
    return media


@router.patch("/{id}", response_model=HeritageSiteResponse)
async def update_heritage_site(
    id: int,
    site_in: HeritageSiteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
        
    # Only creator or moderator/admin can edit
    if current_user.id != site.creator_id and current_user.role not in ["moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this heritage site."
        )
        
    # Capture changes for revision log
    changes = {}
    change_summary_parts = []
    
    update_data = site_in.model_dump(exclude_unset=True)
    if not update_data:
        return site

    for key, val in update_data.items():
        old_val = getattr(site, key)
        if old_val != val:
            changes[key] = {"old": old_val, "new": val}
            change_summary_parts.append(f"Updated {key}")
            setattr(site, key, val)
            
    if changes:
        summary = ", ".join(change_summary_parts)
        revision = Revision(
            site_id=id,
            user_id=current_user.id,
            change_summary=summary,
            details=changes
        )
        db.add(revision)
        await db.commit()
        await db.refresh(site)
        
    return site

