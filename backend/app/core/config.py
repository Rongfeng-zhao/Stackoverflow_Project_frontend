from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv


load_dotenv()


def _split_csv(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    finnhub_api_key: str = os.getenv("FINNHUB_API_KEY", "").strip()
    newsapi_key: str = os.getenv("NEWSAPI_KEY", "").strip()
    alpha_vantage_api_key: str = os.getenv("ALPHA_VANTAGE_API_KEY", "").strip()
    cors_origins: list[str] = None  # type: ignore[assignment]
    finnhub_base_url: str = os.getenv("FINNHUB_BASE_URL", "https://finnhub.io/api/v1").strip()
    newsapi_base_url: str = os.getenv("NEWSAPI_BASE_URL", "https://newsapi.org/v2").strip()
    alpha_vantage_base_url: str = os.getenv(
        "ALPHA_VANTAGE_BASE_URL", "https://www.alphavantage.co/query"
    ).strip()

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "cors_origins",
            _split_csv(
                os.getenv("CORS_ORIGINS"),
                ["http://localhost:5173", "http://127.0.0.1:5173"],
            ),
        )


settings = Settings()
