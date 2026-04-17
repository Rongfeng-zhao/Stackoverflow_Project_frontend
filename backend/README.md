# ASX Sentiment Backend

Minimal FastAPI backend for the frontend dashboard.

## Endpoints

- `GET /health`
- `GET /api/stock-analysis?ticker=BHP`
- `GET /sentiment?ticker=BHP`
- `GET /market-overview`
- `POST /predict-text`

`/api/stock-analysis` is the frontend-facing MVP endpoint. It accepts one ASX ticker and returns:

- `stock_info`
- `price_history`
- `sentiment_summary`
- `news_items`

The current sentiment logic is a placeholder that mimics the future binary classification model. Replace the marked section in `app/services.py` with the real model call when the trained model is wrapped by the backend.

AI summary generation is intentionally out of scope for the current MVP.

## Run locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8088
```

## Environment

Create `backend/.env` from the template:

```bash
cp .env.example .env
```

Then add your key:

```env
NEWS_API_KEY=your_newsapi_key_here
```

If you want the shell to load it before running:

```bash
export $(grep -v '^#' .env | xargs)
uvicorn app.main:app --reload --port 8088
```

## Frontend connection

Use this in the frontend `.env`:

```env
VITE_SENTIMENT_DATA_SOURCE=live
VITE_SENTIMENT_API_BASE_URL=http://localhost:8088
```

## Notes

- The backend now tries to fetch ASX-related company news from NewsAPI `everything` first.
- If `NEWS_API_KEY` is missing or the provider fails, stock and market endpoints fall back to mock data.
- Query mapping for ASX tickers lives in `app/ticker_mapping.py`.
- `POST /predict-text` is included as a simple model-inference placeholder.
