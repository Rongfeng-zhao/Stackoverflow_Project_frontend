from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


SentimentLabel = Literal["Positive", "Negative", "Neutral"]
MarketLabel = Literal["US"]


class AnalysisRequest(BaseModel):
    market: MarketLabel = "US"
    ticker: str
    provider_symbol: str


class StockInfo(BaseModel):
    ticker: str
    company_name: str | None = None
    market: MarketLabel = "US"
    sector: str | None = None
    industry: str | None = None
    description: str | None = None
    exchange: str | None = None
    currency: str | None = None
    market_cap: float | None = None
    latest_price: float | None = None
    day_change_percent: float | None = None
    volume: int | None = None


class PriceHistoryPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class SentimentSummary(BaseModel):
    overall_sentiment: SentimentLabel
    confidence: float = Field(..., ge=0, le=1)
    positive_count: int = Field(..., ge=0)
    negative_count: int = Field(..., ge=0)
    neutral_count: int = Field(..., ge=0)
    article_count: int = Field(..., ge=0)
    model_name: Literal["local_rule_based_v1"] = "local_rule_based_v1"


class NewsItem(BaseModel):
    title: str
    source: str
    published_at: str
    sentiment: SentimentLabel
    confidence: float | None = Field(default=None, ge=0, le=1)
    snippet: str
    url: HttpUrl


class DataSources(BaseModel):
    price_provider: Literal["finnhub"] = "finnhub"
    news_provider: Literal["finnhub", "newsapi", "alpha_vantage", "none"]
    sentiment_provider: Literal["local_rule_based"] = "local_rule_based"


class StockAnalysisResponse(BaseModel):
    request: AnalysisRequest
    stock_info: StockInfo
    price_history: list[PriceHistoryPoint]
    sentiment_summary: SentimentSummary
    news_items: list[NewsItem]
    analysis_time: str
    data_sources: DataSources


class ErrorDetail(BaseModel):
    code: Literal[
        "invalid_ticker",
        "unsupported_market",
        "stock_not_found",
        "no_news",
        "provider_failure",
        "invalid_provider_response",
    ]
    message: str


class ErrorResponse(BaseModel):
    detail: ErrorDetail


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str = "stock-analysis-api"
