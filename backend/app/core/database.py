from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Initialize asynchronous engine
db_url = settings.DATABASE_URL

# Normalize postgres URL scheme for SQLAlchemy asyncpg driver
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

if "?prepared_statements=false" in db_url:
    db_url = db_url.replace("?prepared_statements=false", "")
elif "&prepared_statements=false" in db_url:
    db_url = db_url.replace("&prepared_statements=false", "")

connect_args = {}
if "postgresql" in db_url:
    connect_args["statement_cache_size"] = 0

engine = create_async_engine(
    db_url,
    echo=True if settings.ENVIRONMENT == "development" else False,
    future=True,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Session factory for generating async database sessions
SessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

# Base class for SQLAlchemy ORM models
Base = declarative_base()

# Async dependency injection provider yielding a database session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
