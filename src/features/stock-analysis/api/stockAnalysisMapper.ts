import type { StockAnalysisApiResponse } from '../model/stockAnalysis.apiTypes';
import type { StockAnalysisResult } from '../model/stockAnalysis.domainTypes';

function normalizeConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const normalized = value > 1 ? value / 100 : value;
  return Math.min(1, Math.max(0, normalized));
}

export function mapStockAnalysisApiResponseToResult(
  response: StockAnalysisApiResponse,
): StockAnalysisResult {
  return {
    market: response.request.market,
    ticker: response.stock_info.ticker,
    providerSymbol: response.request.provider_symbol,
    companyName: response.stock_info.company_name,
    sector: response.stock_info.sector,
    industry: response.stock_info.industry,
    description: response.stock_info.description,
    exchange: response.stock_info.exchange,
    currency: response.stock_info.currency,
    marketCap: response.stock_info.market_cap,
    latestPrice: response.stock_info.latest_price,
    dayChangePercent: response.stock_info.day_change_percent,
    volume: response.stock_info.volume,
    priceHistory: response.price_history,
    overallSentiment: response.sentiment_summary.overall_sentiment,
    confidence: normalizeConfidence(response.sentiment_summary.confidence),
    positiveCount: response.sentiment_summary.positive_count,
    negativeCount: response.sentiment_summary.negative_count,
    neutralCount: response.sentiment_summary.neutral_count,
    articleCount: response.sentiment_summary.article_count,
    modelName: response.sentiment_summary.model_name,
    newsItems: response.news_items.map((item) => ({
      title: item.title,
      source: item.source,
      publishedAt: item.published_at,
      sentiment: item.sentiment,
      confidence: item.confidence === null ? null : normalizeConfidence(item.confidence),
      snippet: item.snippet,
      url: item.url,
    })),
    analysisTime: response.analysis_time,
    priceProvider: response.data_sources.price_provider,
    newsProvider: response.data_sources.news_provider,
    sentimentProvider: response.data_sources.sentiment_provider,
  };
}
