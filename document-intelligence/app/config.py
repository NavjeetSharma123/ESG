from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DI_", env_file=".env", extra="ignore")

    database_url: str
    supabase_url: str
    jwt_secret: str | None = None
    storage_root: str = "./private-documents"
    max_upload_bytes: int = 50 * 1024 * 1024
    max_document_pages: int = 500
    parser_timeout_seconds: int = 900
    max_attempts: int = 3
    api_cors_origins: str = "http://localhost:3000"


settings = Settings()
