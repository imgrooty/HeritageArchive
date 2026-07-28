from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import shutil, uuid, os

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.heritage import HeritageSite, HeritageCategory, ContentStatus, MediaAsset, MediaType
from app.schemas.heritage import HeritageSiteCreate, HeritageSiteResponse, HeritageSiteUpdate, MediaAssetResponse
from app.api.routers.auth import get_current_active_user

router = APIRouter(prefix="/heritage", tags=["Heritage Discovery & Content"])

@router.get("/sites", response_model=List[HeritageSiteResponse])
async def list_heritage_sites(
    category: Optional[HeritageCategory] = None,
    status_filter: Optional[ContentStatus] = ContentStatus.PUBLISHED,
    db: AsyncSession = Depends(get_db)
):
    query = select(HeritageSite)
    if status_filter:
        query = query.where(HeritageSite.status == status_filter)
    if category:
        query = query.where(HeritageSite.category == category)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/sites", response_model=HeritageSiteResponse, status_code=status.HTTP_201_CREATED)
async def create_heritage_site(
    site_in: HeritageSiteCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    new_site = HeritageSite(
        title=site_in.title,
        alternative_names=site_in.alternative_names,
        description=site_in.description,
        historical_summary=site_in.historical_summary,
        cultural_significance=site_in.cultural_significance,
        category=site_in.category,
        region=site_in.region,
        latitude=site_in.latitude,
        longitude=site_in.longitude,
        original_language=site_in.original_language,
        contributor_id=current_user.id,
        status=ContentStatus.SUBMITTED
    )
    db.add(new_site)
    await db.commit()
    await db.refresh(new_site)
    return new_site

@router.get("/sites/{site_id}", response_model=HeritageSiteResponse)
async def get_heritage_site(site_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeritageSite).where(HeritageSite.id == site_id))
    site = result.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Heritage site not found")
    return site

@router.post("/sites/{site_id}/media", response_model=MediaAssetResponse)
async def upload_site_media(
    site_id: int,
    file: UploadFile = File(...),
    media_type: MediaType = Form(MediaType.IMAGE),
    caption: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(HeritageSite).where(HeritageSite.id == site_id))
    site = result.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Heritage site not found")
    
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    public_url = f"/static/uploads/{unique_filename}"
    media = MediaAsset(
        heritage_site_id=site_id,
        media_type=media_type,
        url=public_url,
        caption=caption,
        uploader_id=current_user.id
    )
    db.add(media)
    await db.commit()
    await db.refresh(media)
    return media
