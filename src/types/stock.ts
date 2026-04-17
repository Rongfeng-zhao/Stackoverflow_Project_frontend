export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

export type DashboardStatus = 'idle' | 'loading' | 'success' | 'error';

export type SentimentApiErrorType = 'invalid_ticker' | 'no_news' | 'api_failure';

export type DataSourceMode = 'mock' | 'live';

export interface NewsItemData {
  title: string;
  source: string;
  published_at: string;
  sentiment: Sentiment;
  confidence?: number | null;
  snippet: string;
  url: string;
}

export interface StockInfo {
  ticker: string;
  company_name: string;
  market: 'ASX';
  sector?: string | null;
  industry?: string | null;
  description?: string | null;
  exchange?: string | null;
  currency?: string | null;
  market_cap?: string | null;
  latest_price?: number | null;
  day_change_percent?: number | null;
  volume?: number | null;
}

export interface PriceHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SentimentSummary {
  overall_sentiment: Sentiment;
  confidence: number;
  positive_count?: number;
  negative_count?: number;
  article_count: number;
}

export interface StockAnalysisApiResponse {
  ticker: string;
  market: 'ASX';
  stock_info: StockInfo;
  price_history: PriceHistoryPoint[];
  sentiment_summary: SentimentSummary;
  summary?: string;
  news_items: NewsItemData[];
}

export interface StockSentimentApiResponse extends StockInfo {
  overall_sentiment: Sentiment;
  confidence: number;
  summary?: string;
  article_count: number;
  news_items: NewsItemData[];
  price_history?: PriceHistoryPoint[];
  sentiment_summary?: SentimentSummary;
}

export interface StockSentimentResult extends StockSentimentApiResponse {
  analysis_time: string;
}

export interface SentimentApiEnvelope {
  data_source: DataSourceMode;
  result: StockSentimentResult;
}

export interface MarketTreemapItem {
  ticker: string;
  company_name: string;
  sector: string;
  sentiment: Sentiment;
  weight: number;
  change_percent: number;
  volume_score?: number;
  heat_score?: number;
  summary: string;
}

export interface MarketSentimentOverview {
  market: 'ASX';
  overall_sentiment: Sentiment;
  summary: string;
  updated_at: string;
  advancing_blocks: number;
  declining_blocks: number;
  neutral_blocks: number;
  heatmap: MarketTreemapItem[];
}

export interface MarketSentimentEnvelope {
  data_source: DataSourceMode;
  result: MarketSentimentOverview;
}
