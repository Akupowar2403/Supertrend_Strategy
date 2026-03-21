"""
config/settings.py — Single source of truth for all configuration.
Reads .env once at startup, validates every value with Pydantic.
Any module that needs a config value imports: from config.settings import settings
"""

from pathlib import Path
from pydantic_settings import BaseSettings

# Always points to Backend/.env regardless of where Python is run from
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):

    # ── Zerodha ───────────────────────────────────────────────────────────────
    kite_api_key:    str
    kite_api_secret: str
    kite_user_id:    str
    kite_password:   str
    kite_totp_key:   str

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

    # ── Security ──────────────────────────────────────────────────────────────
    fernet_key: str   # Fernet key for encrypting credentials in DB

    # ── Keycloak ──────────────────────────────────────────────────────────────
    keycloak_url:             str = "http://localhost:8080"
    keycloak_realm:           str = "swts"
    keycloak_client_id:       str = "swts-backend"
    keycloak_client_secret:   str = ""
    keycloak_admin_user:      str = "admin"
    keycloak_admin_password:  str = "admin123"

    # ── Trading mode ──────────────────────────────────────────────────────────
    broker_mode: str = "forward_test"   # "forward_test" | "live"
    segment:     str = "equity"         # "equity" | "fno"
    timeframe:   str = "5minute"        # minute | 3minute | 5minute | 10minute | 15minute | 30minute | 60minute | day

    # ── Indicator toggles ─────────────────────────────────────────────────────
    use_supertrend: bool = True
    use_atr:        bool = True

    # ── Supertrend params ─────────────────────────────────────────────────────
    st_length:     int   = 10
    st_multiplier: float = 3.0

    # ── ATR params ────────────────────────────────────────────────────────────
    atr_period:    int   = 14
    atr_threshold: float = 1.0

    # ── Risk / position limits ────────────────────────────────────────────────
    max_open_positions: int = 3
    session_end_time:   str = "15:15"   # IST — auto square-off time

    # ── Exit conditions ───────────────────────────────────────────────────────
    target_type:  str   = "points"      # "points" | "percentage" | "atr_multiple"
    target_value: float = 20.0
    sl_type:      str   = "points"      # "points" | "percentage"
    sl_value:     float = 10.0
    trailing_sl:  bool  = True
    trail_value:  float = 5.0
    exit_on_st_red: bool = True

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = "INFO"             # DEBUG | INFO | WARNING | ERROR

    class Config:
        env_file = _ENV_FILE
        env_file_encoding = "utf-8"
        extra = "ignore"                # ignore unknown keys in .env


settings = Settings()
