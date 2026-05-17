from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..schemas import ErrorResponse, StockAnalysisResponse
from ..services.stock_analysis_service import StockAnalysisServiceError, stock_analysis_service


router = APIRouter(tags=["stock-analysis"])


def _raise_for_service_error(error: StockAnalysisServiceError) -> None:
    status_code_map = {
        "invalid_ticker": 400,
        "unsupported_market": 400,
        "stock_not_found": 404,
        "no_news": 404,
        "provider_failure": 502,
        "invalid_provider_response": 502,
    }
    raise HTTPException(
        status_code=status_code_map.get(error.code, 500),
        detail={"code": error.code, "message": error.message},
    ) from error


@router.get(
    "/api/stock-analysis",
    response_model=StockAnalysisResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
def get_stock_analysis(
    market: str = Query(..., description="Currently only US is supported."),
    ticker: str = Query(..., description="US stock ticker such as AAPL or BRK.B."),
) -> StockAnalysisResponse:
    try:
        return stock_analysis_service.analyze_stock(market, ticker)
    except StockAnalysisServiceError as error:
        _raise_for_service_error(error)
