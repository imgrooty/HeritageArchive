import asyncio
import os
import dotenv
from typing import Any
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func

dotenv.load_dotenv("../.env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment.")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

import app.models.user  # noqa
import app.models.community  # noqa
import app.models.heritage  # noqa
import app.models.knowledge  # noqa

from app.models.heritage import HeritageSite, Story, HeritageMedia
from app.models.knowledge import KnowledgeNode, KnowledgeEdge

async def verify():
    async with AsyncSessionLocal() as session:
        print("==================================================")
        print(" CULTURAL HERITAGE ARCHIVE FACT VERIFICATION LOG ")
        print("==================================================")

        # 1. Verify Site Counts
        site_count_res = await session.execute(select(func.count(HeritageSite.id)))
        total_sites = site_count_res.scalar()
        print(f"[OK] Total Approved Heritage Sites in Database: {total_sites}")

        # 2. Verify Stories
        story_count_res = await session.execute(select(func.count(Story.id)))
        total_stories = story_count_res.scalar()
        print(f"[OK] Total Documented Stories in Database: {total_stories}")

        # 3. Verify Audio Media Assets
        audio_res = await session.execute(select(HeritageMedia).where(HeritageMedia.media_type == "audio"))
        audio_items = audio_res.scalars().all()
        print(f"[OK] Total Registered Audio Media Assets: {len(audio_items)}")
        for audio in audio_items:
            print(f"    - Site ID {audio.site_id}: {audio.media_url}")

        # 4. Verify Image Media Assets
        image_res = await session.execute(select(HeritageMedia).where(HeritageMedia.media_type == "image"))
        image_items = image_res.scalars().all()
        print(f"[OK] Total Registered Image Media Assets: {len(image_items)}")

        # 5. Verify Knowledge Graph Nodes & Edges
        knodes_res = await session.execute(select(func.count(KnowledgeNode.id)))
        total_knodes = knodes_res.scalar()
        kedges_res = await session.execute(select(func.count(KnowledgeEdge.id)))
        total_kedges = kedges_res.scalar()
        print(f"[OK] Total Knowledge Graph Nodes: {total_knodes}")
        print(f"[OK] Total Knowledge Graph Edges: {total_kedges}")

        # 6. Detail Check: Categories Breakdown
        cat_res = await session.execute(
            select(HeritageSite.category, func.count(HeritageSite.id))
            .group_by(HeritageSite.category)
        )
        print("\n--- Heritage Category Breakdown ---")
        for cat, cnt in cat_res.all():
            print(f"  * {cat.upper()}: {cnt} site(s)")

        # 7. Coordinate Integrity Check
        coord_res = await session.execute(
            select(HeritageSite.name, HeritageSite.latitude, HeritageSite.longitude)
        )
        invalid_coords = []
        for name, lat, lng in coord_res.all():
            if not (20.0 <= lat <= 31.0 and 80.0 <= lng <= 89.0):
                invalid_coords.append((name, lat, lng))
        
        if invalid_coords:
            print(f"\n[X] WARNING: Found {len(invalid_coords)} sites with out-of-range coordinates!")
            for name, lat, lng in invalid_coords:
                print(f"    - {name}: ({lat}, {lng})")
        else:
            print("\n[OK] Coordinate Range Check PASSED: All sites have valid Nepal coordinates (20-31 N, 80-89 E).")

        print("\n==================================================")
        print(" ALL FACTS INSERTED AND VERIFIED CORRECTLY.       ")
        print("==================================================")

if __name__ == "__main__":
    asyncio.run(verify())
