"""Application settings, loaded once from the environment.

We keep a single Settings object so the rest of the app never reads os.environ
directly — it just imports `settings`.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ShaktiScale AI"
    environment: str = "development"

    # Everything under /api/v1 lives behind this prefix.
    api_v1_prefix: str = "/api/v1"

    # If unset, AI endpoints degrade to their deterministic fallback — never a 500.
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-4o-mini"
    openrouter_timeout_seconds: int = 15

    log_level: str = "INFO"

    # Origins allowed to call the API. The Next.js dev server runs on 3000.
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
