"""Environment-based configuration. Secrets are read from .env / process env only."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

PLACEHOLDER_PREFIX = "your-"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Personal AI Assistant API"
    ai_provider: str = "demo"  # demo | gemini | openai

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.0-flash"

    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    max_message_chars: int = 1000
    max_history_messages: int = 10
    provider_timeout_seconds: float = 20.0

    rate_limit_requests: int = 30
    rate_limit_window_seconds: int = 60

    enable_docs: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def provider_key(self) -> str | None:
        if self.ai_provider == "gemini":
            return self.gemini_api_key
        if self.ai_provider == "openai":
            return self.openai_api_key
        return None

    @property
    def effective_provider(self) -> str:
        """Falls back to demo when the configured provider has no usable key."""
        key = self.provider_key
        if self.ai_provider in ("gemini", "openai") and key and not key.startswith(PLACEHOLDER_PREFIX):
            return self.ai_provider
        return "demo"


@lru_cache
def get_settings() -> Settings:
    return Settings()
