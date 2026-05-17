import { mapStockAnalysisApiResponseToResult } from './stockAnalysisMapper';
import type {
  StockAnalysisApiErrorResponse,
  StockAnalysisApiResponse,
} from '../model/stockAnalysis.apiTypes';
import type {
  StockAnalysisErrorType,
  StockAnalysisResult,
} from '../model/stockAnalysis.domainTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export class StockAnalysisApiError extends Error {
  readonly type: StockAnalysisErrorType;

  constructor(type: StockAnalysisErrorType, message: string) {
    super(message);
    this.name = 'StockAnalysisApiError';
    this.type = type;
  }
}

const mockApiResponses: Record<string, StockAnalysisApiResponse> = {
  AAPL: {
    request: { market: 'US', ticker: 'AAPL', provider_symbol: 'AAPL' },
    stock_info: {
      ticker: 'AAPL',
      company_name: 'Apple Inc.',
      market: 'US',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      description: 'Apple designs consumer devices, software, and services.',
      exchange: 'NASDAQ',
      currency: 'USD',
      market_cap: 2870000000000,
      latest_price: 213.45,
      day_change_percent: 1.24,
      volume: 53420000,
    },
    price_history: Array.from({ length: 30 }, (_, index) => ({
      date: new Date(Date.now() - (29 - index) * 86400000).toISOString().slice(0, 10),
      open: 201 + index * 0.35,
      high: 202 + index * 0.38,
      low: 200 + index * 0.33,
      close: 201.2 + index * 0.42,
      volume: 42000000 + index * 210000,
    })),
    sentiment_summary: {
      overall_sentiment: 'Positive',
      confidence: 0.81,
      positive_count: 5,
      negative_count: 1,
      neutral_count: 2,
      article_count: 8,
      model_name: 'local_rule_based_v1',
    },
    news_items: [
      {
        title: 'Apple expands enterprise partnership to strengthen services growth',
        source: 'Mock Wire',
        published_at: new Date().toISOString(),
        sentiment: 'Positive',
        confidence: 0.84,
        snippet: 'Recent coverage highlights partnership momentum and resilient service revenue growth.',
        url: 'https://example.com/apple-partnership',
      },
      {
        title: 'Apple faces antitrust scrutiny in app ecosystem debate',
        source: 'Mock Finance',
        published_at: new Date(Date.now() - 3600000).toISOString(),
        sentiment: 'Negative',
        confidence: 0.72,
        snippet: 'Regulatory headlines remain a watchpoint even as the broader product narrative stays strong.',
        url: 'https://example.com/apple-antitrust',
      },
    ],
    analysis_time: new Date().toISOString(),
    data_sources: {
      price_provider: 'finnhub',
      news_provider: 'newsapi',
      sentiment_provider: 'local_rule_based',
    },
  },
};

function normalizeTicker(value: string): string {
  return value.trim().toUpperCase();
}

export function sanitizeTickerInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z.-]/g, '').slice(0, 10);
}

function validateUsTickerOrThrow(ticker: string): string {
  const normalizedTicker = normalizeTicker(ticker);
  if (!/^[A-Z.-]{1,10}$/.test(normalizedTicker)) {
    throw new StockAnalysisApiError(
      'invalid_ticker',
      'Enter a valid US ticker using uppercase letters, dot, or hyphen, such as AAPL or BRK.B.',
    );
  }
  return normalizedTicker;
}

async function createApiErrorFromResponse(response: Response): Promise<StockAnalysisApiError> {
  try {
    const payload = (await response.json()) as StockAnalysisApiErrorResponse;
    return new StockAnalysisApiError(
      payload.detail?.code ?? 'provider_failure',
      payload.detail?.message ?? `Stock analysis request failed with status ${response.status}.`,
    );
  } catch {
    return new StockAnalysisApiError(
      'provider_failure',
      `Stock analysis request failed with status ${response.status}.`,
    );
  }
}

export async function fetchStockAnalysis(ticker: string): Promise<StockAnalysisResult> {
  const normalizedTicker = validateUsTickerOrThrow(ticker);

  if (!API_BASE_URL) {
    const mock = mockApiResponses[normalizedTicker];
    if (!mock) {
      throw new StockAnalysisApiError('stock_not_found', `No mock result is configured for ${normalizedTicker}.`);
    }
    return mapStockAnalysisApiResponseToResult(mock);
  }

  const requestUrl = new URL('/api/stock-analysis', API_BASE_URL);
  requestUrl.searchParams.set('market', 'US');
  requestUrl.searchParams.set('ticker', normalizedTicker);

  const response = await fetch(requestUrl.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await createApiErrorFromResponse(response);
  }

  const payload = (await response.json()) as StockAnalysisApiResponse;
  return mapStockAnalysisApiResponseToResult(payload);
}
