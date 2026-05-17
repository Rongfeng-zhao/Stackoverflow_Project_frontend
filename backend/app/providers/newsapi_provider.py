from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

from ..core.config import settings


KNOWN_COMPANY_QUERIES: dict[str, str] = {
    "AAPL": "Apple stock",
    "MSFT": "Microsoft stock",
    "NVDA": "Nvidia stock",
    "TSLA": "Tesla stock",
}


class NewsApiProviderError(Exception):
    pass


@dataclass
class NewsApiProvider:
    api_key: str = settings.newsapi_key
    base_url: str = settings.newsapi_base_url

    def search_company_news(self, ticker: str, company_name: str | None = None) -> list[dict[str, Any]]:
        if not self.api_key:
            raise NewsApiProviderError("NEWSAPI_KEY is not configured.")

        query = KNOWN_COMPANY_QUERIES.get(ticker) or (
            f"{company_name} stock" if company_name else f"{ticker} stock"
        )

        try:
            response = requests.get(
                f"{self.base_url.rstrip('/')}/everything",
                params={
                    "q": query,
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": "10",
                    "searchIn": "title,description",
                },
                headers={
                    "X-Api-Key": self.api_key,
                    "Accept": "application/json",
                },
                timeout=20,
            )
            response.raise_for_status()
            payload = response.json()
        except requests.RequestException as exc:
            raise NewsApiProviderError(f"NewsAPI request failed: {exc}") from exc

        articles = payload.get("articles", [])
        return articles if isinstance(articles, list) else []
