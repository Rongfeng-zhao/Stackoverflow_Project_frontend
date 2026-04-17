from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


SentimentLabel = Literal["Positive", "Negative", "Neutral"]


class NewsItem(BaseModel):
    title: str
    source: str
    published_at: str
    sentiment: SentimentLabel
    confidence: float | None = Field(default=None, ge=0, le=1)
    snippet: str
    url: HttpUrl


class StockInfo(BaseModel):
    ticker: str = Field(..., examples=["BHP"])
    company_name: str
    market: Literal["ASX"] = "ASX"
    sector: str | None = None
    industry: str | None = None
    description: str | None = None
    exchange: str | None = None
    currency: str | None = None
    market_cap: str | None = None
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
    article_count: int = Field(..., ge=0)


class StockAnalysisResponse(BaseModel):
    ticker: str = Field(..., examples=["BHP"])
    market: Literal["ASX"] = "ASX"
    stock_info: StockInfo
    price_history: list[PriceHistoryPoint]
    sentiment_summary: SentimentSummary
    news_items: list[NewsItem]


class StockSentimentResponse(StockInfo):
    overall_sentiment: SentimentLabel
    confidence: float = Field(..., ge=0, le=1)
    summary: str
    article_count: int = Field(..., ge=0)
    news_items: list[NewsItem]


class MarketTreemapItem(BaseModel):
    ticker: str
    company_name: str
    sector: str
    sentiment: SentimentLabel
    weight: int = Field(..., gt=0)
    change_percent: float
    summary: str


class MarketOverviewResponse(BaseModel):
    market: Literal["ASX"] = "ASX"
    overall_sentiment: SentimentLabel
    summary: str
    updated_at: str
    advancing_blocks: int = Field(..., ge=0)
    declining_blocks: int = Field(..., ge=0)
    neutral_blocks: int = Field(..., ge=0)
    heatmap: list[MarketTreemapItem]


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str = "asx-sentiment-api"
