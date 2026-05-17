export type ApiSentimentLabel = 'Positive' | 'Negative' | 'Neutral';

export interface StockAnalysisApiRequest {
  market: 'US';
  ticker: string;
  provider_symbol: string;
}

export interface StockAnalysisApiStockInfo {
  ticker: string;
  company_name: string | null;
  market: 'US';
  sector: string | null;
  industry: string | null;
  description: string | null;
  exchange: string | null;
  currency: string | null;
  market_cap: number | null;
  latest_price: number | null;
  day_change_percent: number | null;
  volume: number | null;
}

export interface StockAnalysisApiPriceHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockAnalysisApiSentimentSummary {
  overall_sentiment: ApiSentimentLabel;
  confidence: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  article_count: number;
  model_name: 'local_rule_based_v1';
}

export interface StockAnalysisApiNewsItem {
  title: string;
  source: string;
  published_at: string;
  sentiment: ApiSentimentLabel;
  confidence: number | null;
  snippet: string;
  url: string;
}

export interface StockAnalysisApiResponse {
  request: StockAnalysisApiRequest;
  stock_info: StockAnalysisApiStockInfo;
  price_history: StockAnalysisApiPriceHistoryPoint[];
  sentiment_summary: StockAnalysisApiSentimentSummary;
  news_items: StockAnalysisApiNewsItem[];
  analysis_time: string;
  data_sources: {
    price_provider: 'finnhub';
    news_provider: 'finnhub' | 'newsapi' | 'alpha_vantage' | 'none';
    sentiment_provider: 'local_rule_based';
  };
}

export interface StockAnalysisApiErrorResponse {
  detail?: {
    code?:
      | 'invalid_ticker'
      | 'unsupported_market'
      | 'stock_not_found'
      | 'no_news'
      | 'provider_failure'
      | 'invalid_provider_response';
    message?: string;
  };
}
