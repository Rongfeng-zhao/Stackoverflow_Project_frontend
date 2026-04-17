import {
  ALPHA_VANTAGE_API_BASE_URL,
  ALPHA_VANTAGE_API_KEY,
  DATA_SOURCE_MODE,
  LIVE_API_BASE_URL,
  TWELVE_DATA_API_BASE_URL,
  TWELVE_DATA_API_KEY,
} from '../config/api';
import { findTrackedCompany } from '../data/asxUniverse';
import { mockStockSentimentDatabase } from '../data/mockStockSentiment';
import type {
  DataSourceMode,
  SentimentApiErrorType,
  StockAnalysisApiResponse,
  StockSentimentApiResponse,
  SentimentApiEnvelope,
  Sentiment,
  StockSentimentResult,
} from '../types/stock';
import { isValidAsxTicker, normalizeTicker } from '../utils/ticker';

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

interface AlphaVantageNewsFeedItem {
  title?: string;
  source?: string;
  time_published?: string;
  overall_sentiment_score?: number | string;
  overall_sentiment_label?: string;
  summary?: string;
  url?: string;
}

interface AlphaVantageNewsResponse {
  feed?: AlphaVantageNewsFeedItem[];
}

interface TwelveDataQuoteResponse {
  name?: string;
}

interface BackendErrorPayload {
  detail?: {
    code?: SentimentApiErrorType;
    message?: string;
  };
}

export class SentimentApiError extends Error {
  readonly type: SentimentApiErrorType;

  constructor(type: SentimentApiErrorType, message: string) {
    super(message);
    this.name = 'SentimentApiError';
    this.type = type;
  }
}

function normalizeConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const normalized = value > 1 ? value / 100 : value;
  return Math.min(1, Math.max(0, normalized));
}

function normalizeStockSentimentResponse(payload: StockSentimentApiResponse): StockSentimentApiResponse {
  return {
    ...payload,
    confidence: normalizeConfidence(payload.confidence),
    sentiment_summary: payload.sentiment_summary
      ? {
          ...payload.sentiment_summary,
          confidence: normalizeConfidence(payload.sentiment_summary.confidence),
        }
      : undefined,
  };
}

function stampAnalysisTime(payload: StockSentimentApiResponse): StockSentimentResult {
  return {
    ...normalizeStockSentimentResponse(payload),
    analysis_time: new Date().toISOString(),
  };
}

function validateTickerOrThrow(ticker: string): string {
  const normalizedTicker = normalizeTicker(ticker);

  if (!isValidAsxTicker(normalizedTicker)) {
    throw new SentimentApiError(
      'invalid_ticker',
      'Enter a valid ASX ticker using 3 to 4 uppercase letters, such as BHP or CSL.',
    );
  }

  return normalizedTicker;
}

function assertAnalysisApiResponseShape(payload: unknown): asserts payload is StockAnalysisApiResponse {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('ticker' in payload) ||
    !('market' in payload) ||
    !('stock_info' in payload) ||
    !('price_history' in payload) ||
    !('sentiment_summary' in payload) ||
    !('news_items' in payload)
  ) {
    throw new SentimentApiError(
      'api_failure',
      'The API response shape is invalid for the stock analysis dashboard.',
    );
  }
}

function normalizeStockAnalysisResponse(payload: StockAnalysisApiResponse): StockSentimentApiResponse {
  const confidence = normalizeConfidence(payload.sentiment_summary.confidence);

  return {
    ...payload.stock_info,
    ticker: payload.ticker,
    market: payload.market,
    overall_sentiment: payload.sentiment_summary.overall_sentiment,
    confidence,
    summary: payload.summary,
    article_count: payload.sentiment_summary.article_count,
    news_items: payload.news_items,
    price_history: payload.price_history,
    sentiment_summary: {
      ...payload.sentiment_summary,
      confidence,
    },
  };
}

async function createApiErrorFromResponse(response: Response): Promise<SentimentApiError> {
  try {
    const payload = (await response.json()) as BackendErrorPayload;
    const code = payload.detail?.code ?? 'api_failure';
    const message =
      payload.detail?.message ?? `The sentiment API request failed with status ${response.status}.`;

    return new SentimentApiError(code, message);
  } catch {
    return new SentimentApiError(
      'api_failure',
      `The sentiment API request failed with status ${response.status}.`,
    );
  }
}

function mapSentimentLabel(label?: string, score?: number): Sentiment {
  const normalizedLabel = label?.toLowerCase() ?? '';

  if (normalizedLabel.includes('bullish') || normalizedLabel.includes('positive')) {
    return 'Positive';
  }

  if (normalizedLabel.includes('bearish') || normalizedLabel.includes('negative')) {
    return 'Negative';
  }

  if (typeof score === 'number') {
    if (score > 0.15) {
      return 'Positive';
    }

    if (score < -0.15) {
      return 'Negative';
    }
  }

  return 'Neutral';
}

function toIsoFromAlphaTimestamp(value?: string): string {
  if (!value) {
    return new Date().toISOString();
  }

  const safe = value.trim();

  if (safe.length >= 15) {
    const year = safe.slice(0, 4);
    const month = safe.slice(4, 6);
    const day = safe.slice(6, 8);
    const hours = safe.slice(9, 11);
    const minutes = safe.slice(11, 13);
    const seconds = safe.slice(13, 15);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  }

  return new Date().toISOString();
}

function buildSummary(ticker: string, sentiment: Sentiment, headlines: string[]): string {
  const lead =
    sentiment === 'Positive'
      ? `${ticker} is attracting mostly positive news sentiment.`
      : sentiment === 'Negative'
        ? `${ticker} is seeing weaker news sentiment in recent coverage.`
        : `${ticker} is showing mixed-to-neutral news sentiment.`;

  const headlineSummary = headlines.slice(0, 2).join(' ');

  return headlineSummary ? `${lead} Key coverage includes: ${headlineSummary}` : lead;
}

async function fetchAlphaVantageNews(symbol: string): Promise<AlphaVantageNewsResponse> {
  const requestUrl = new URL(ALPHA_VANTAGE_API_BASE_URL);
  requestUrl.searchParams.set('function', 'NEWS_SENTIMENT');
  requestUrl.searchParams.set('tickers', symbol);
  requestUrl.searchParams.set('sort', 'LATEST');
  requestUrl.searchParams.set('limit', '6');
  requestUrl.searchParams.set('apikey', ALPHA_VANTAGE_API_KEY);

  const response = await fetch(requestUrl.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new SentimentApiError(
      'api_failure',
      `The Alpha Vantage news request failed with status ${response.status}.`,
    );
  }

  return (await response.json()) as AlphaVantageNewsResponse;
}

async function fetchTwelveDataQuote(symbol: string): Promise<TwelveDataQuoteResponse> {
  const requestUrl = new URL('/quote', TWELVE_DATA_API_BASE_URL);
  requestUrl.searchParams.set('symbol', symbol);
  requestUrl.searchParams.set('apikey', TWELVE_DATA_API_KEY);

  const response = await fetch(requestUrl.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new SentimentApiError(
      'api_failure',
      `The Twelve Data quote request failed with status ${response.status}.`,
    );
  }

  return (await response.json()) as TwelveDataQuoteResponse;
}

async function fetchMockStockSentiment(normalizedTicker: string): Promise<SentimentApiEnvelope> {
  await delay(1100);

  if (normalizedTicker === 'FAIL') {
    throw new SentimentApiError(
      'api_failure',
      'The sentiment service is temporarily unavailable. Please try again shortly.',
    );
  }

  const mockRecord = mockStockSentimentDatabase[normalizedTicker];

  if (!mockRecord || mockRecord.news_items.length === 0) {
    throw new SentimentApiError(
      'no_news',
      `No recent ASX news items were found for ${normalizedTicker}.`,
    );
  }

  // Future API integration:
  // Replace the mock lookup below with a real fetch call while keeping the same
  // response shape so the UI components do not need to change.

  return {
    data_source: 'mock',
    result: stampAnalysisTime(mockRecord),
  };
}

async function fetchLiveStockSentiment(normalizedTicker: string): Promise<SentimentApiEnvelope> {
  if (LIVE_API_BASE_URL) {
    const requestUrl = new URL('/api/stock-analysis', LIVE_API_BASE_URL);
    requestUrl.searchParams.set('ticker', normalizedTicker);

    const response = await fetch(requestUrl.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw await createApiErrorFromResponse(response);
    }

    const payload: unknown = await response.json();
    assertAnalysisApiResponseShape(payload);

    if (!Array.isArray(payload.news_items) || payload.news_items.length === 0) {
      throw new SentimentApiError(
        'no_news',
        `No recent ASX news items were found for ${normalizedTicker}.`,
      );
    }

    return {
      data_source: 'live',
      result: stampAnalysisTime(normalizeStockAnalysisResponse(payload)),
    };
  }

  if (!ALPHA_VANTAGE_API_KEY || !TWELVE_DATA_API_KEY) {
    throw new SentimentApiError(
      'api_failure',
      'Live mode requires either VITE_SENTIMENT_API_BASE_URL or both VITE_ALPHA_VANTAGE_API_KEY and VITE_TWELVE_DATA_API_KEY.',
    );
  }

  const trackedCompany = findTrackedCompany(normalizedTicker);

  if (!trackedCompany) {
    throw new SentimentApiError(
      'no_news',
      `Live provider mapping is not configured for ${normalizedTicker}.`,
    );
  }

  const [newsResponse, quoteResponse] = await Promise.all([
    fetchAlphaVantageNews(trackedCompany.alpha_vantage_symbol),
    fetchTwelveDataQuote(trackedCompany.twelve_data_symbol),
  ]);

  const newsItems = (newsResponse.feed ?? [])
    .filter((item) => item.title && item.url)
    .slice(0, 6)
    .map((item) => {
      const sentimentScore =
        typeof item.overall_sentiment_score === 'string'
          ? Number.parseFloat(item.overall_sentiment_score)
          : item.overall_sentiment_score;
      return {
        title: item.title ?? `${normalizedTicker} market update`,
        source: item.source ?? 'Alpha Vantage',
        published_at: toIsoFromAlphaTimestamp(item.time_published),
        sentiment: mapSentimentLabel(item.overall_sentiment_label, sentimentScore),
        snippet: item.summary ?? 'No summary provided for this article.',
        url: item.url ?? '#',
      };
    });

  if (newsItems.length === 0) {
    throw new SentimentApiError(
      'no_news',
      `No recent ASX news items were found for ${normalizedTicker}.`,
    );
  }

  const sentimentScores = (newsResponse.feed ?? [])
    .map((item) =>
      typeof item.overall_sentiment_score === 'string'
        ? Number.parseFloat(item.overall_sentiment_score)
        : item.overall_sentiment_score,
    )
    .filter((score): score is number => typeof score === 'number' && Number.isFinite(score));

  const averageScore =
    sentimentScores.reduce((sum, score) => sum + score, 0) / Math.max(sentimentScores.length, 1);
  const overallSentiment = mapSentimentLabel(undefined, averageScore);
  const confidence = Math.min(0.98, 0.55 + Math.min(Math.abs(averageScore), 1) * 0.35);

  return {
    data_source: 'live',
    result: stampAnalysisTime({
      ticker: normalizedTicker,
      company_name: quoteResponse.name ?? trackedCompany.company_name,
      market: 'ASX',
      overall_sentiment: overallSentiment,
      confidence,
      summary: buildSummary(
        normalizedTicker,
        overallSentiment,
        newsItems.map((item) => item.title),
      ),
      article_count: newsItems.length,
      news_items: newsItems,
    }),
  };
}

export function getSentimentDataSourceMode(): DataSourceMode {
  return DATA_SOURCE_MODE;
}

export async function fetchStockSentiment(ticker: string): Promise<SentimentApiEnvelope> {
  const normalizedTicker = validateTickerOrThrow(ticker);

  if (DATA_SOURCE_MODE === 'live') {
    try {
      return await fetchLiveStockSentiment(normalizedTicker);
    } catch (error) {
      if (LIVE_API_BASE_URL && error instanceof SentimentApiError) {
        throw error;
      }

      const mockFallback = mockStockSentimentDatabase[normalizedTicker];

      if (mockFallback) {
        return {
          data_source: 'mock',
          result: stampAnalysisTime(mockFallback),
        };
      }

      throw new SentimentApiError(
        'api_failure',
        'Live sentiment providers failed and no mock fallback is available for this ticker.',
      );
    }
  }

  return fetchMockStockSentiment(normalizedTicker);
}
