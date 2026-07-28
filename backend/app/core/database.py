from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Initialize asynchronous engine
# Echo SQL queries in development mode for tracing
# Strip prepared_statements parameter from URL to prevent asyncpg driver errors
# and disable the statement cache via prepared_statement_cache_size=0 instead.
db_url = settings.DATABASE_URL
if "?prepared_statements=false" in db_url:
    db_url = db_url.replace("?prepared_statements=false", "")
elif "&prepared_statements=false" in db_url:
    db_url = db_url.replace("&prepared_statements=false", "")

engine = create_async_engine(
    db_url,
    echo=True if settings.ENVIRONMENT == "development" else False,
    future=True,
    connect_args={"statement_cache_size": 0},
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
