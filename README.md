# ASX Stock Intelligence Search

A focused MVP for analyzing ASX-listed companies using stock market data, recent news, and a financial news sentiment model.

The frontend sends an ASX ticker, such as `BHP`, `CBA`, `CSL`, or `WES`, to a FastAPI backend. The backend is responsible for collecting stock information, price history, and related news, then classifying each news item as `Positive` or `Negative`.

AI-generated summary is intentionally out of scope for the current MVP.

## Current MVP Scope

- ASX market only
- Search by ASX ticker
- Stock information display
- Daily price history display
- Recent related news list
- Per-news sentiment label and confidence score
- Overall sentiment aggregation
- No login system
- No trading execution
- No portfolio management
- No AI summary for now

## Project Structure

```text
.
├── src/                  # React + TypeScript frontend
├── backend/              # Local FastAPI backend scaffold for integration testing
├── package.json          # Frontend scripts and dependencies
├── .env.example          # Frontend environment template
└── README.md
```

The final GitHub structure can later be reorganized into:

```text
project-root/
├── frontend/
├── backend/
└── docs/
```

For now, this repository keeps the frontend at the root and a lightweight backend scaffold in `backend/`.

## Frontend

Tech stack:

- React
- TypeScript
- Tailwind CSS
- Vite

Run the frontend:

```bash
npm install
npm run dev
```

The frontend expects the backend URL from `.env`:

```env
VITE_SENTIMENT_DATA_SOURCE=live
VITE_SENTIMENT_API_BASE_URL=http://localhost:8088
```

Do not commit real API keys in `.env`. Use `.env.example` for placeholders.

## Backend

The backend scaffold uses FastAPI and provides the frontend-facing stock analysis endpoint.

Run the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8088
```

If the virtual environment already exists:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8088
```

Backend environment:

```env
NEWS_API_KEY=your_newsapi_key_here
ALPHA_VANTAGE_API_KEY=optional_key_here
TWELVE_DATA_API_KEY=optional_key_here
```

## API Contract

Frontend calls:

```http
GET /api/stock-analysis?ticker=BHP
```

Response shape:

```json
{
  "ticker": "BHP",
  "market": "ASX",
  "stock_info": {
    "ticker": "BHP",
    "company_name": "BHP Group Ltd",
    "market": "ASX",
    "sector": "Materials",
    "industry": "Metals & Mining",
    "description": "BHP Group Ltd is a diversified resources company.",
    "exchange": "ASX",
    "currency": "AUD",
    "market_cap": "220B",
    "latest_price": 46.28,
    "day_change_percent": 1.8,
    "volume": 15420000
  },
  "price_history": [
    {
      "date": "2026-04-17",
      "open": 46.32,
      "high": 46.74,
      "low": 45.95,
      "close": 46.37,
      "volume": 16653600
    }
  ],
  "sentiment_summary": {
    "overall_sentiment": "Positive",
    "confidence": 0.83,
    "positive_count": 2,
    "negative_count": 0,
    "article_count": 2
  },
  "news_items": [
    {
      "title": "BHP shares rise after production update",
      "source": "Reuters",
      "published_at": "2026-04-10T09:30:00Z",
      "sentiment": "Positive",
      "confidence": 0.91,
      "snippet": "Investors reacted positively to the latest production announcement.",
      "url": "https://example.com/article1"
    }
  ]
}
```

Notes for backend integration:

- `news_items[].sentiment` should come from the classification model.
- The current model only supports binary output: `Positive` or `Negative`.
- `sentiment_summary.overall_sentiment` may be `Positive`, `Negative`, or `Neutral`, because it is an aggregation result.
- `confidence` should be a decimal between `0` and `1`.
- AI summary is not required in this response.

## Backend Integration Plan

The real backend team can connect their ML project in this order:

1. Wrap the existing `predict.py` logic in FastAPI.
2. Load the tokenizer and model once when the API starts.
3. Add `POST /api/predict` for single text classification.
4. Add or complete `GET /api/stock-analysis?ticker=BHP`.
5. Inside `stock-analysis`, fetch stock info, price history, and related news.
6. Run each news item through the model using `title + snippet`.
7. Return the API contract shown above.

Recommended internal flow:

```text
ASX ticker
  ↓
Validate ticker
  ↓
Fetch stock information
  ↓
Fetch price history
  ↓
Fetch related news
  ↓
Classify each news item with the ML model
  ↓
Aggregate sentiment counts
  ↓
Return stock_info, price_history, sentiment_summary, news_items
```

## Error Format

Recommended backend error response:

```json
{
  "detail": {
    "code": "invalid_ticker",
    "message": "Enter a valid ASX ticker."
  }
}
```

Suggested error codes:

- `invalid_ticker`
- `stock_not_found`
- `no_news`
- `market_data_unavailable`
- `model_unavailable`
- `api_failure`

## Build

```bash
npm run build
```

## Important Git Notes

Do not commit:

- `.env`
- `node_modules/`
- `dist/`
- `backend/.venv/`
- large model artifacts such as `artifacts/final_model/`
- API keys or secrets

Use `.env.example` files for configuration templates.
