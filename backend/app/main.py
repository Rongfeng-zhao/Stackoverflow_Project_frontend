from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from .schemas import HealthResponse, MarketOverviewResponse, StockAnalysisResponse, StockSentimentResponse
from .services import (
    SentimentServiceError,
    get_market_overview,
    get_stock_analysis,
    get_stock_sentiment,
    predict_text_sentiment,
)


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1)


class PredictResponse(BaseModel):
    sentiment: str
    confidence: float


app = FastAPI(
    title="ASX Sentiment API",
    version="0.1.0",
    description="Demo-friendly backend for the ASX Stock Sentiment Dashboard.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse()


@app.get("/sentiment", response_model=StockSentimentResponse)
def sentiment(ticker: str = Query(..., min_length=3, max_length=4)) -> StockSentimentResponse:
    try:
        return get_stock_sentiment(ticker)
    except SentimentServiceError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "message": exc.message}) from exc


@app.get("/api/stock-analysis", response_model=StockAnalysisResponse)
def stock_analysis(ticker: str = Query(..., min_length=3, max_length=4)) -> StockAnalysisResponse:
    try:
        return get_stock_analysis(ticker)
    except SentimentServiceError as exc:
        raise HTTPException(status_code=400, detail={"code": exc.code, "message": exc.message}) from exc


@app.get("/market-overview", response_model=MarketOverviewResponse)
def market_overview() -> MarketOverviewResponse:
    return get_market_overview()


@app.post("/predict-text", response_model=PredictResponse)
def predict_text(payload: PredictRequest) -> PredictResponse:
    return PredictResponse(**predict_text_sentiment(payload.text))
