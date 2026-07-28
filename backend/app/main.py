from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base
import app.models.user
import app.models.heritage
import app.models.community
import app.models.knowledge

from app.api.routers.auth import router as auth_router
from app.api.routers.heritage import router as heritage_router
from app.api.routers.moderation import router as moderation_router
from app.api.routers.community import router as community_router
from app.api.routers.translation import router as translation_router
from app.api.routers.search import router as search_router
from app.api.routers.knowledge import router as knowledge_router

async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS site_embeddings (
                        site_id INTEGER PRIMARY KEY REFERENCES heritage_sites(id) ON DELETE CASCADE,
                        embedding vector(384)
                    );
                """))
            except Exception as e:
                print(f"Notice: pgvector extension not initialized. Vector search will soft-fallback. Detail: {e}")
        print("Database schema and tables verified/created successfully.")
    except Exception as e:
        print(f"Warning: Database initialization check encountered an issue: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await engine.dispose()

app = FastAPI(
    title="Cultural Heritage Archive API",
    description="Backend API for documenting, translating, and mapping local cultural heritage.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router)
app.include_router(heritage_router)
app.include_router(moderation_router)
app.include_router(community_router)
app.include_router(translation_router)
app.include_router(search_router)
app.include_router(knowledge_router)

@app.get("/")
def read_root():
    return {
        "name": "Cultural Heritage Archive API",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
