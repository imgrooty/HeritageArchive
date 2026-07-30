from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base
# Import models to ensure they are registered with Base metadata
import app.models.user  # noqa
import app.models.heritage  # noqa
import app.models.community  # noqa
import app.models.knowledge  # noqa

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
    # Startup: Initialize tables and verify connectivity
    await init_db()
    yield
    # Shutdown: Clean up connections
    await engine.dispose()

app = FastAPI(
    title="Cultural Heritage Archive API",
    description="Backend API for documenting, translating, and mapping local cultural heritage.",
    version="1.0.0",
    lifespan=lifespan,
)

@app.middleware("http")
async def strip_api_prefix(request, call_next):
    path = request.scope.get("path", "")
    if path.startswith("/api/backend"):
        new_path = path[len("/api/backend"):] or "/"
        request.scope["path"] = new_path
    elif path in ("/api/index", "/api", "/api/index.py"):
        path_param = request.query_params.get("path")
        if path_param:
            request.scope["path"] = path_param if path_param.startswith("/") else f"/{path_param}"
        else:
            request.scope["path"] = "/"
    return await call_next(request)

# Enable CORS for the frontend application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folder to host uploaded media assets
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register modular routes
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
