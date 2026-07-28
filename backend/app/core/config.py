from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/heritage_archive"
    SYNC_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/heritage_archive"
    SECRET_KEY: str = "949b29cf1639d6778f69e6b36be9f2a00c6d3eb6e72c5a08992e5910fae13cd5"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
