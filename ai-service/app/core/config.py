"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # --- Application ---
    ENVIRONMENT: Literal["development", "production", "test"] = "development"
    SERVICE_SECRET: str = "change_this_internal_service_secret"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # --- Database ---
    DATABASE_URL: str = "postgresql+psycopg://teacherai:teacherai_secret@localhost:5432/teacherai_db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- LLM Service ---
    OPENAI_API_KEY: str = "mock-key-for-development"
    OPENAI_MODEL: str = "gpt-4o"
    ANTHROPIC_API_KEY: str = ""
    LLM_PROVIDER: Literal["openai", "anthropic"] = "openai"

    # --- S3 Storage ---
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "teacherai-uploads"

    # --- Rate Limiting ---
    RATE_LIMIT_CHAT_WINDOW: int = 60  # seconds
    RATE_LIMIT_CHAT_MAX: int = 30  # requests per window

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            import json

            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
