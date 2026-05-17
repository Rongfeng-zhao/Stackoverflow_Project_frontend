export type StockSentimentLabel = 'Positive' | 'Negative' | 'Neutral';
export type StockAnalysisStatus = 'idle' | 'loading' | 'success' | 'error';
export type StockAnalysisErrorType =
  | 'invalid_ticker'
  | 'unsupported_market'
  | 'stock_not_found'
  | 'no_news'
  | 'provider_failure'
  | 'invalid_provider_response';

export interface StockNewsItem {
  title: string;
  source: string;
  publishedAt: string;
  sentiment: StockSentimentLabel;
  confidence: number | null;
  snippet: string;
  url: string;
}

export interface StockPriceHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockAnalysisResult {
  market: 'US';
  ticker: string;
  providerSymbol: string;
  companyName: string | null;
  sector: string | null;
  industry: string | null;
  description: string | null;
  exchange: string | null;
  currency: string | null;
  marketCap: number | null;
  latestPrice: number | null;
  dayChangePercent: number | null;
  volume: number | null;
  priceHistory: StockPriceHistoryPoint[];
  overallSentiment: StockSentimentLabel;
  confidence: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  articleCount: number;
  modelName: string;
  newsItems: StockNewsItem[];
  analysisTime: string;
  priceProvider: 'finnhub';
  newsProvider: 'finnhub' | 'newsapi' | 'alpha_vantage' | 'none';
  sentimentProvider: 'local_rule_based';
}
