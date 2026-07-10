# from pydantic_settings import BaseSettings, SettingsConfigDict
# from pydantic import field_validator
# from typing import List

# class Settings(BaseSettings):
#     PROJECT_NAME: str = "Spotify Clone API"
#     API_V1_STR: str = "/api/v1"
    
#     # JWT security settings
#     SECRET_KEY: str
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520
    
#     # Database connection string (e.g. postgresql+asyncpg://user:pass@host:port/db)
#     DATABASE_URL: str

#     @field_validator("DATABASE_URL", mode="before")
#     @classmethod
#     def fix_database_url(cls, v: str) -> str:
#         # Render provides postgres:// but SQLAlchemy async needs postgresql+asyncpg://
#         if v.startswith("postgres://"):
#             v = v.replace("postgres://", "postgresql+asyncpg://", 1)
#         return v

#     # Enable loading configurations from a .env file
#     model_config = SettingsConfigDict(
#         env_file=".env",
#         env_file_encoding="utf-8",
#         case_sensitive=True,
#         extra="ignore"
#     )

# settings = Settings()


from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "Spotify Clone API"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520

    DATABASE_URL: str

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()