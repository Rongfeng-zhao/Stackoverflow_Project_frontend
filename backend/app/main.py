from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .routers.stock_analysis import router as stock_analysis_router
from .schemas import HealthResponse

load_dotenv()

app = FastAPI(
    title="US Stock Analysis API",
    version="0.2.0",
    description="FastAPI backend for US stock news interpretation and sentiment analysis.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stock_analysis_router)


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health_check() -> HealthResponse:
    return HealthResponse()
