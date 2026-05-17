# FastAPI Backend

US stock analysis backend for the frontend MVP.

## Endpoint

```http
GET /api/stock-analysis?market=US&ticker=AAPL
```

## Providers

- Price and company profile: Finnhub
- Primary news: Finnhub company news
- Fallback news: NewsAPI
- Optional fallback news: Alpha Vantage News Sentiment
- Sentiment classifier: local rule-based placeholder

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Environment

```env
FINNHUB_API_KEY=
NEWSAPI_KEY=
ALPHA_VANTAGE_API_KEY=
CORS_ORIGINS=http://localhost:5173
```

## Health Check

```http
GET /health
```

## Error Codes

- `invalid_ticker`
- `unsupported_market`
- `stock_not_found`
- `no_news`
- `provider_failure`
- `invalid_provider_response`
