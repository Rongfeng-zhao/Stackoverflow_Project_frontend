from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

import requests

from ..core.config import settings


class FinnhubProviderError(Exception):
    pass


@dataclass
class FinnhubProvider:
    api_key: str = settings.finnhub_api_key
    base_url: str = settings.finnhub_base_url

    def _get(self, path: str, params: dict[str, Any]) -> Any:
        if not self.api_key:
            raise FinnhubProviderError("FINNHUB_API_KEY is not configured.")

        try:
            response = requests.get(
                f"{self.base_url.rstrip('/')}/{path.lstrip('/')}",
                params={**params, "token": self.api_key},
                headers={"Accept": "application/json"},
                timeout=20,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as exc:
            raise FinnhubProviderError(f"Finnhub request failed for {path}: {exc}") from exc

    def get_quote(self, ticker: str) -> dict[str, Any]:
        return self._get("/quote", {"symbol": ticker})

    def get_company_profile(self, ticker: str) -> dict[str, Any]:
        return self._get("/stock/profile2", {"symbol": ticker})

    def get_stock_candles(self, ticker: str, period_days: int = 30) -> dict[str, Any]:
        # Use a conservative historical window ending yesterday to avoid provider
        # issues around partial/intraday daily bars near the current trading day.
        end = datetime.now(timezone.utc).date() - timedelta(days=1)
        start = end - timedelta(days=max(period_days * 3, 90))
        return self._get(
            "/stock/candle",
            {
                "symbol": ticker,
                "resolution": "D",
                "from": int(datetime.combine(start, datetime.min.time(), tzinfo=timezone.utc).timestamp()),
                "to": int(datetime.combine(end, datetime.max.time(), tzinfo=timezone.utc).timestamp()),
            },
        )

    def get_company_news(self, ticker: str, from_date: str, to_date: str) -> list[dict[str, Any]]:
        payload = self._get(
            "/company-news",
            {
                "symbol": ticker,
                "from": from_date,
                "to": to_date,
            },
        )
        return payload if isinstance(payload, list) else []

    def get_news_sentiment(self, ticker: str) -> dict[str, Any] | None:
        try:
            payload = self._get("/news-sentiment", {"symbol": ticker})
        except FinnhubProviderError:
            return None
        return payload if isinstance(payload, dict) else None
