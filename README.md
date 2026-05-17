# US Stock News Interpreter MVP

React + TypeScript + Tailwind + Vite frontend with a FastAPI backend for live US stock news interpretation.

## What This MVP Does

- Focuses on US stocks only
- Lets users search a ticker such as `AAPL`, `MSFT`, `NVDA`, or `TSLA`
- Shows stock information, price history, sentiment summary, and related news
- Uses the backend as the only data gateway
- Does not expose third-party API keys to the browser
- Does not provide buy or sell recommendations
- Does not include the legacy market dashboard in the current flow

## Architecture

Frontend:

- `src/features/stock-analysis/`
  - `api/`
  - `hooks/`
  - `model/`
  - `components/`
- `src/shared/`
  - `components/`
  - `lib/`
- `src/legacy/market-dashboard/`
  - old treemap and dashboard experiments, not used in the current MVP

Backend:

- `backend/app/core/config.py`
- `backend/app/providers/`
- `backend/app/services/`
- `backend/app/routers/`
- `backend/app/main.py`

## Frontend to Backend Contract

Frontend calls only this endpoint:

```http
GET /api/stock-analysis?market=US&ticker=AAPL
```

Example local request:

```text
http://localhost:8000/api/stock-analysis?market=US&ticker=AAPL
```

## Backend Response Shape

```json
{
  "request": {
    "market": "US",
    "ticker": "AAPL",
    "provider_symbol": "AAPL"
  },
  "stock_info": {
    "ticker": "AAPL",
    "company_name": "Apple Inc.",
    "market": "US",
    "sector": null,
    "industry": "Technology",
    "description": null,
    "exchange": "NASDAQ",
    "currency": "USD",
    "market_cap": 2870000000000,
    "latest_price": 213.45,
    "day_change_percent": 1.24,
    "volume": 53420000
  },
  "price_history": [],
  "sentiment_summary": {
    "overall_sentiment": "Positive",
    "confidence": 0.81,
    "positive_count": 5,
    "negative_count": 1,
    "neutral_count": 2,
    "article_count": 8,
    "model_name": "local_rule_based_v1"
  },
  "news_items": [],
  "analysis_time": "2026-05-16T00:00:00Z",
  "data_sources": {
    "price_provider": "finnhub",
    "news_provider": "finnhub",
    "sentiment_provider": "local_rule_based"
  }
}
```

## Data Providers

Primary provider:

- Finnhub

Fallback news provider:

- NewsAPI

Optional fallback:

- Alpha Vantage News Sentiment

## How To Get API Keys

Finnhub:

1. Go to [Finnhub](https://finnhub.io/).
2. Create a free account.
3. Generate an API key from the dashboard.

NewsAPI:

1. Go to [NewsAPI](https://newsapi.org/).
2. Register for a developer account.
3. Copy your API key from the account page.

Alpha Vantage:

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key).
2. Request a free API key.
3. Use it only as an optional fallback.

## Environment Variables

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Backend `backend/.env`:

```env
FINNHUB_API_KEY=
NEWSAPI_KEY=
ALPHA_VANTAGE_API_KEY=
CORS_ORIGINS=http://localhost:5173
```

## Run The Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Run The Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Vite default URL:

```text
http://localhost:5173
```

## Validation Rules

- `market` must be `US`
- `ticker` must be uppercase
- `ticker` supports letters, dot, and hyphen
- `ticker` max length is 10

## Structured Error Codes

- `invalid_ticker`
- `unsupported_market`
- `stock_not_found`
- `no_news`
- `provider_failure`
- `invalid_provider_response`

## Notes

- The frontend never calls Finnhub, NewsAPI, or Alpha Vantage directly.
- The current sentiment logic is a local rule-based placeholder for a future BERT model.
- The current price chart is a hand-written SVG chart to keep the MVP lightweight.
- Legacy market dashboard components are isolated under `src/legacy/market-dashboard`.
