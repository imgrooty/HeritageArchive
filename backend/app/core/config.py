import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve the workspace root directory containing the .env file
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Database Configuration
    DATABASE_URL: str
    SYNC_DATABASE_URL: str

    # Security & Authentication
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Server Configuration
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"

settings = Settings()
