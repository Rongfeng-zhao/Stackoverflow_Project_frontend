from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

from ..core.config import settings


class AlphaVantageProviderError(Exception):
    pass


@dataclass
class AlphaVantageProvider:
    api_key: str = settings.alpha_vantage_api_key
    base_url: str = settings.alpha_vantage_base_url

    def get_news_sentiment(self, ticker: str) -> list[dict[str, Any]]:
        if not self.api_key:
            return []

        try:
            response = requests.get(
                self.base_url,
                params={
                    "function": "NEWS_SENTIMENT",
                    "tickers": ticker,
                    "sort": "LATEST",
                    "limit": "10",
                    "apikey": self.api_key,
                },
                headers={"Accept": "application/json"},
                timeout=20,
            )
            response.raise_for_status()
            payload = response.json()
        except requests.RequestException as exc:
            raise AlphaVantageProviderError(f"Alpha Vantage request failed: {exc}") from exc

        feed = payload.get("feed", [])
        return feed if isinstance(feed, list) else []
