from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Spotify Clone API"
    API_V1_STR: str = "/api/v1"
    
    # JWT security settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520
    
    # Database connection string (e.g. postgresql+asyncpg://user:pass@host:port/db)
    DATABASE_URL: str

    # Enable loading configurations from a .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
