from copy import deepcopy
from datetime import datetime, timedelta, timezone
import requests

from .mock_data import MOCK_MARKET_OVERVIEW, MOCK_STOCK_SENTIMENT
from .schemas import (
    MarketOverviewResponse,
    MarketTreemapItem,
    NewsItem,
    PriceHistoryPoint,
    SentimentSummary,
    StockAnalysisResponse,
    StockInfo,
    StockSentimentResponse,
)
from .settings import (
    ALPHA_VANTAGE_API_BASE_URL,
    ALPHA_VANTAGE_API_KEY,
    NEWS_API_BASE_URL,
    NEWS_API_KEY,
    NEWS_API_LANGUAGE,
    NEWS_API_PAGE_SIZE,
    TWELVE_DATA_API_BASE_URL,
    TWELVE_DATA_API_KEY,
)
from .ticker_mapping import ASX_TICKER_SEARCH


VALID_TICKERS = set(MOCK_STOCK_SENTIMENT.keys())


class StockBasics(dict):
    pass


class SentimentServiceError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _days_ago_iso(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def validate_ticker(ticker: str) -> str:
    normalized = ticker.strip().upper()

    if not normalized.isalpha() or not 3 <= len(normalized) <= 4:
        raise SentimentServiceError(
            "invalid_ticker",
            "Enter a valid ASX ticker using 3 to 4 uppercase letters, such as BHP or CSL.",
        )

    return normalized


def _score_to_sentiment(score: float) -> str:
    if score > 0.2:
        return "Positive"
    if score < -0.2:
        return "Negative"
    return "Neutral"


def _score_to_model_sentiment(score: float) -> str:
    return "Positive" if score >= 0 else "Negative"


def _score_to_model_confidence(score: float, text: str) -> float:
    signal_strength = abs(score)
    length_factor = min(len(text) / 280, 0.18)
    return round(min(0.96, 0.58 + signal_strength * 0.26 + length_factor), 2)


def _headline_sentiment_score(text: str) -> float:
    normalized = text.lower()
    positive_terms = (
        "strong",
        "growth",
        "beat",
        "positive",
        "improved",
        "surge",
        "gain",
        "rise",
        "higher",
        "record",
        "bullish",
        "upgrade",
        "beats",
        "buy",
        "outperform",
        "optimistic",
        "expands",
        "contract win",
    )
    negative_terms = (
        "weak",
        "fall",
        "miss",
        "negative",
        "decline",
        "drop",
        "risk",
        "lower",
        "pressure",
        "slump",
        "bearish",
        "downgrade",
        "misses",
        "selloff",
        "warning",
        "cuts",
        "underperform",
    )

    positive_hits = sum(term in normalized for term in positive_terms)
    negative_hits = sum(term in normalized for term in negative_terms)
    total_hits = positive_hits + negative_hits

    if total_hits == 0:
        return 0.0

    return (positive_hits - negative_hits) / total_hits


def _request_news_api(params: dict[str, str]) -> dict:
    if not NEWS_API_KEY:
        raise SentimentServiceError(
            "api_failure",
            "NEWS_API_KEY is not configured. Add it to backend/.env or your shell environment.",
        )

    try:
        response = requests.get(
            f"{NEWS_API_BASE_URL}/everything",
            params=params,
            headers={
                "X-Api-Key": NEWS_API_KEY,
                "Accept": "application/json",
            },
            timeout=20,
        )
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as exc:
        status_code = exc.response.status_code if exc.response is not None else "unknown"
        raise SentimentServiceError(
            "api_failure",
            f"NewsAPI request failed with status {status_code}.",
        ) from exc


def _request_alpha_vantage(params: dict[str, str]) -> dict:
    if not ALPHA_VANTAGE_API_KEY:
        return {}

    try:
        response = requests.get(
            ALPHA_VANTAGE_API_BASE_URL,
            params={**params, "apikey": ALPHA_VANTAGE_API_KEY},
            headers={"Accept": "application/json"},
            timeout=20,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return {}


def _request_twelve_data(path: str, params: dict[str, str]) -> dict:
    if not TWELVE_DATA_API_KEY:
        return {}

    try:
        response = requests.get(
            f"{TWELVE_DATA_API_BASE_URL.rstrip('/')}/{path.lstrip('/')}",
            params={**params, "apikey": TWELVE_DATA_API_KEY},
            headers={"Accept": "application/json"},
            timeout=20,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return {}
    except requests.RequestException as exc:
        raise SentimentServiceError(
            "api_failure",
            f"NewsAPI request failed: {exc}",
        ) from exc


def _map_news_items(articles: list[dict]) -> list[NewsItem]:
    items: list[NewsItem] = []

    for article in articles:
        title = (article.get("title") or "").strip()
        url = (article.get("url") or "").strip()

        if not title or not url:
            continue

        snippet = (
            article.get("description")
            or article.get("content")
            or "No summary snippet was provided for this article."
        ).strip()
        model_text = f"{title} {snippet}"
        score = _headline_sentiment_score(model_text)

        items.append(
            NewsItem(
                title=title,
                source=(article.get("source") or {}).get("name") or "NewsAPI",
                published_at=article.get("publishedAt") or _utc_now_iso(),
                # Replace this placeholder with the real classification model call:
                # prediction = model.predict(model_text)
                sentiment=_score_to_model_sentiment(score),
                confidence=_score_to_model_confidence(score, model_text),
                snippet=snippet,
                url=url,
            )
        )

    return items


def _article_matches_company(article: dict, keywords: list[str]) -> bool:
    haystack = " ".join(
        [
            article.get("title") or "",
            article.get("description") or "",
            article.get("content") or "",
        ]
    ).lower()
    return any(keyword.lower() in haystack for keyword in keywords)


def _fetch_stock_basics(ticker: str) -> StockBasics:
    mapping = ASX_TICKER_SEARCH[ticker]
    alpha_payload = _request_alpha_vantage(
        {
            "function": "OVERVIEW",
            "symbol": mapping["alpha_symbol"],
        }
    )
    quote_payload = _request_twelve_data(
        "quote",
        {
            "symbol": mapping["twelve_symbol"],
        },
    )

    mock_stock = MOCK_STOCK_SENTIMENT[ticker]
    latest_price = quote_payload.get("close") or quote_payload.get("price")
    day_change_percent = quote_payload.get("percent_change")
    volume = quote_payload.get("volume")

    try:
        latest_price_value = float(latest_price) if latest_price is not None else mock_stock.latest_price
    except (TypeError, ValueError):
        latest_price_value = mock_stock.latest_price

    try:
        day_change_percent_value = (
            float(day_change_percent) if day_change_percent is not None else mock_stock.day_change_percent
        )
    except (TypeError, ValueError):
        day_change_percent_value = mock_stock.day_change_percent

    try:
        volume_value = int(float(volume)) if volume is not None else mock_stock.volume
    except (TypeError, ValueError):
        volume_value = mock_stock.volume

    return StockBasics(
        ticker=ticker,
        company_name=alpha_payload.get("Name") or quote_payload.get("name") or mapping["company_name"],
        market="ASX",
        sector=alpha_payload.get("Sector") or mock_stock.sector,
        industry=alpha_payload.get("Industry") or mock_stock.industry,
        description=alpha_payload.get("Description") or mock_stock.description,
        exchange=quote_payload.get("exchange") or quote_payload.get("mic_code") or mock_stock.exchange,
        currency=quote_payload.get("currency") or alpha_payload.get("Currency") or mock_stock.currency,
        market_cap=alpha_payload.get("MarketCapitalization") or mock_stock.market_cap,
        latest_price=latest_price_value,
        day_change_percent=day_change_percent_value,
        volume=volume_value,
    )


def _build_mock_price_history(latest_price: float | None, latest_volume: int | None) -> list[PriceHistoryPoint]:
    close = latest_price or 50.0
    base_volume = latest_volume or 1_000_000
    points: list[PriceHistoryPoint] = []

    for index in range(20):
        days_from_latest = 19 - index
        wave = ((index % 6) - 2.5) * 0.18
        trend = (index - 10) * 0.04
        day_close = round(max(0.5, close - days_from_latest * 0.08 + trend + wave), 2)
        day_open = round(day_close * (1 - 0.003 + (index % 3) * 0.002), 2)
        high = round(max(day_open, day_close) * 1.008, 2)
        low = round(min(day_open, day_close) * 0.992, 2)
        volume = int(base_volume * (0.76 + (index % 5) * 0.08))
        date = (datetime.now(timezone.utc) - timedelta(days=days_from_latest)).date().isoformat()

        points.append(
            PriceHistoryPoint(
                date=date,
                open=day_open,
                high=high,
                low=low,
                close=day_close,
                volume=volume,
            )
        )

    return points


def _fetch_price_history(ticker: str, basics: StockBasics) -> list[PriceHistoryPoint]:
    mapping = ASX_TICKER_SEARCH[ticker]
    payload = _request_twelve_data(
        "time_series",
        {
            "symbol": mapping["twelve_symbol"],
            "interval": "1day",
            "outputsize": "20",
        },
    )
    values = payload.get("values")

    if not isinstance(values, list) or not values:
        return _build_mock_price_history(basics.get("latest_price"), basics.get("volume"))

    points: list[PriceHistoryPoint] = []
    for item in reversed(values[:20]):
        try:
            points.append(
                PriceHistoryPoint(
                    date=str(item["datetime"]),
                    open=float(item["open"]),
                    high=float(item["high"]),
                    low=float(item["low"]),
                    close=float(item["close"]),
                    volume=int(float(item.get("volume") or basics.get("volume") or 0)),
                )
            )
        except (KeyError, TypeError, ValueError):
            continue

    return points or _build_mock_price_history(basics.get("latest_price"), basics.get("volume"))


def _build_stock_summary(ticker: str, company_name: str, overall_sentiment: str, items: list[NewsItem]) -> str:
    lead = {
        "Positive": f"Recent news flow for {company_name} ({ticker}) is broadly positive.",
        "Negative": f"Recent news flow for {company_name} ({ticker}) is leaning negative.",
        "Neutral": f"Recent news flow for {company_name} ({ticker}) is mixed overall.",
    }[overall_sentiment]

    headline_blurb = " ".join(item.title for item in items[:2])
    return f"{lead} Key coverage includes: {headline_blurb}" if headline_blurb else lead


def _fetch_news_for_ticker(ticker: str) -> StockSentimentResponse:
    mapping = ASX_TICKER_SEARCH.get(ticker)
    if not mapping:
        raise SentimentServiceError("no_news", f"No NewsAPI mapping is configured for {ticker}.")

    queries = mapping.get("search_queries", [mapping["search_query"]])
    collected_articles: list[dict] = []
    seen_urls: set[str] = set()

    for query in queries:
        payload = _request_news_api(
            {
                "q": query,
                "language": NEWS_API_LANGUAGE,
                "sortBy": "publishedAt",
                "pageSize": str(NEWS_API_PAGE_SIZE),
                "from": _days_ago_iso(10),
            }
        )

        for article in payload.get("articles", []):
            url = (article.get("url") or "").strip()
            if not url or url in seen_urls:
                continue
            if not _article_matches_company(article, mapping.get("keywords", [])):
                continue
            seen_urls.add(url)
            collected_articles.append(article)

        if len(collected_articles) >= 5:
            break

    articles = collected_articles
    items = _map_news_items(articles)

    if not items:
        raise SentimentServiceError("no_news", f"No recent ASX news items were found for {ticker}.")

    positive_count = len([item for item in items if item.sentiment == "Positive"])
    negative_count = len([item for item in items if item.sentiment == "Negative"])
    overall_sentiment = (
        "Positive"
        if positive_count > negative_count
        else "Negative"
        if negative_count > positive_count
        else "Neutral"
    )
    confidence = round(
        min(
            0.95,
            0.55
            + abs(positive_count - negative_count) / max(len(items), 1) * 0.24
            + min(len(items), 8) * 0.02,
        ),
        2,
    )
    basics = _fetch_stock_basics(ticker)

    return StockSentimentResponse(
        ticker=ticker,
        company_name=basics["company_name"],
        market="ASX",
        sector=basics["sector"],
        industry=basics["industry"],
        description=basics["description"],
        exchange=basics["exchange"],
        currency=basics["currency"],
        market_cap=basics["market_cap"],
        latest_price=basics["latest_price"],
        day_change_percent=basics["day_change_percent"],
        volume=basics["volume"],
        overall_sentiment=overall_sentiment,
        confidence=confidence,
        summary=_build_stock_summary(ticker, basics["company_name"], overall_sentiment, items),
        article_count=len(items),
        news_items=items,
    )


def _market_item_from_stock(ticker: str, stock: StockSentimentResponse) -> MarketTreemapItem:
    mapping = ASX_TICKER_SEARCH[ticker]
    score = sum(_headline_sentiment_score(f"{item.title} {item.snippet}") for item in stock.news_items) / max(
        len(stock.news_items), 1
    )
    article_factor = min(len(stock.news_items), 6) / 6
    confidence_factor = max(stock.confidence, 0.45)
    change_percent = round(score * (4.2 + article_factor * 1.4) * confidence_factor, 1)

    summary = {
        "Positive": "Recent business coverage is constructive and supports a firmer market read.",
        "Negative": "Recent business coverage is softer and weighs on market sentiment.",
        "Neutral": "Coverage is balanced, leaving the stock in a more neutral market bucket.",
    }[stock.overall_sentiment]

    return MarketTreemapItem(
        ticker=ticker,
        company_name=mapping["company_name"],
        sector=mapping["sector"],
        sentiment=stock.overall_sentiment,
        weight=mapping["weight"],
        change_percent=change_percent,
        heat_score=max(24, min(100, round(abs(score) * 85 + stock.confidence * 18))),
        volume_score=max(28, min(100, round(mapping["weight"] * 3.8 + len(stock.news_items) * 6))),
        summary=summary,
    )


def get_stock_sentiment(ticker: str) -> StockSentimentResponse:
    normalized = validate_ticker(ticker)

    if normalized not in VALID_TICKERS:
        raise SentimentServiceError("no_news", f"No recent ASX news items were found for {normalized}.")

    try:
        return _fetch_news_for_ticker(normalized)
    except SentimentServiceError as exc:
        if exc.code == "no_news":
            raise

        return deepcopy(MOCK_STOCK_SENTIMENT[normalized])


def get_stock_analysis(ticker: str) -> StockAnalysisResponse:
    sentiment = get_stock_sentiment(ticker)
    basics = StockInfo(
        ticker=sentiment.ticker,
        company_name=sentiment.company_name,
        market=sentiment.market,
        sector=sentiment.sector,
        industry=sentiment.industry,
        description=sentiment.description,
        exchange=sentiment.exchange,
        currency=sentiment.currency,
        market_cap=sentiment.market_cap,
        latest_price=sentiment.latest_price,
        day_change_percent=sentiment.day_change_percent,
        volume=sentiment.volume,
    )
    positive_count = len([item for item in sentiment.news_items if item.sentiment == "Positive"])
    negative_count = len([item for item in sentiment.news_items if item.sentiment == "Negative"])

    return StockAnalysisResponse(
        ticker=sentiment.ticker,
        market="ASX",
        stock_info=basics,
        price_history=_fetch_price_history(sentiment.ticker, StockBasics(**basics.model_dump())),
        sentiment_summary=SentimentSummary(
            overall_sentiment=sentiment.overall_sentiment,
            confidence=sentiment.confidence,
            positive_count=positive_count,
            negative_count=negative_count,
            article_count=sentiment.article_count,
        ),
        news_items=sentiment.news_items,
    )


def get_market_overview() -> MarketOverviewResponse:
    tracked = ["BHP", "CBA", "CSL", "WES", "NAB", "FMG", "MQG", "WOW"]
    stocks: list[StockSentimentResponse] = []

    for ticker in tracked:
        try:
            stocks.append(get_stock_sentiment(ticker))
        except SentimentServiceError:
            mock_stock = MOCK_STOCK_SENTIMENT.get(ticker)
            if mock_stock is not None:
                stocks.append(deepcopy(mock_stock))

    if not stocks:
        overview = deepcopy(MOCK_MARKET_OVERVIEW)
        overview.updated_at = _utc_now_iso()
        return overview

    heatmap = [_market_item_from_stock(stock.ticker, stock) for stock in stocks]

    advancing = len([item for item in heatmap if item.sentiment == "Positive"])
    declining = len([item for item in heatmap if item.sentiment == "Negative"])
    neutral = len([item for item in heatmap if item.sentiment == "Neutral"])
    overall_score = (advancing - declining) / max(len(heatmap), 1)
    overall_sentiment = _score_to_sentiment(overall_score)

    summary = {
        "Positive": "ASX market tone is constructive based on recent business headlines across tracked large-cap names.",
        "Negative": "ASX market tone is cautious based on recent business headlines across tracked large-cap names.",
        "Neutral": "ASX market tone is mixed, with balanced business headline momentum across tracked names.",
    }[overall_sentiment]

    return MarketOverviewResponse(
        market="ASX",
        overall_sentiment=overall_sentiment,
        summary=summary,
        updated_at=_utc_now_iso(),
        advancing_blocks=advancing,
        declining_blocks=declining,
        neutral_blocks=neutral,
        heatmap=heatmap,
    )


def predict_text_sentiment(text: str) -> dict[str, str | float]:
    normalized = text.lower()

    positive_terms = ("strong", "growth", "beat", "positive", "improved", "surge", "gain")
    negative_terms = ("weak", "fall", "miss", "negative", "decline", "drop", "risk")

    positive_hits = sum(term in normalized for term in positive_terms)
    negative_hits = sum(term in normalized for term in negative_terms)

    raw_score = positive_hits - negative_hits
    confidence = min(0.95, 0.55 + 0.08 * (positive_hits + negative_hits))

    if raw_score > 0:
        sentiment = "Positive"
    elif raw_score < 0:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    return {
        "sentiment": sentiment,
        "confidence": round(confidence, 2),
    }
