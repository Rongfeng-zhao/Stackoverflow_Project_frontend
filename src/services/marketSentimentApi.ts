import {
  DATA_SOURCE_MODE,
  LIVE_API_BASE_URL,
  TWELVE_DATA_API_BASE_URL,
  TWELVE_DATA_API_KEY,
} from '../config/api';
import { asxTrackedCompanies } from '../data/asxUniverse';
import { mockMarketSentiment } from '../data/mockMarketSentiment';
import type {
  MarketSentimentEnvelope,
  MarketSentimentOverview,
  MarketTreemapItem,
  Sentiment,
} from '../types/stock';

interface TwelveDataQuoteResponse {
  name?: string;
  percent_change?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function enrichHeatmap(items: MarketTreemapItem[]): MarketTreemapItem[] {
  const maxWeight = Math.max(...items.map((item) => item.weight), 1);

  return items.map((item) => {
    const volumeScore =
      item.volume_score ?? clamp(Math.round((item.weight / maxWeight) * 100), 28, 100);
    const heatScore =
      item.heat_score ?? clamp(Math.round(Math.abs(item.change_percent) * 26 + volumeScore * 0.18), 24, 100);

    return {
      ...item,
      volume_score: volumeScore,
      heat_score: heatScore,
    };
  });
}

function scoreToSentiment(score: number): Sentiment {
  if (score > 0.35) {
    return 'Positive';
  }

  if (score < -0.35) {
    return 'Negative';
  }

  return 'Neutral';
}

function summarizeTreemapTone(sentiment: Sentiment, changePercent: number): string {
  if (sentiment === 'Positive') {
    return `Shares are trading firmer, with a ${changePercent.toFixed(1)}% move supporting a positive read.`;
  }

  if (sentiment === 'Negative') {
    return `Shares are softer, with a ${Math.abs(changePercent).toFixed(1)}% decline weighing on sentiment.`;
  }

  return `Price action is relatively balanced, with the stock holding near flat at ${changePercent.toFixed(1)}%.`;
}

async function fetchQuote(symbol: string): Promise<TwelveDataQuoteResponse> {
  const requestUrl = new URL('/quote', TWELVE_DATA_API_BASE_URL);
  requestUrl.searchParams.set('symbol', symbol);
  requestUrl.searchParams.set('apikey', TWELVE_DATA_API_KEY);

  const response = await fetch(requestUrl.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Quote request failed with status ${response.status}`);
  }

  return (await response.json()) as TwelveDataQuoteResponse;
}

function buildOverview(heatmap: MarketTreemapItem[]): MarketSentimentOverview {
  const enrichedHeatmap = enrichHeatmap(heatmap);
  const score =
    enrichedHeatmap.reduce((sum, item) => {
      if (item.sentiment === 'Positive') {
        return sum + 1;
      }

      if (item.sentiment === 'Negative') {
        return sum - 1;
      }

      return sum;
    }, 0) / Math.max(heatmap.length, 1);

  const overallSentiment = scoreToSentiment(score);
  const advancing = enrichedHeatmap.filter((item) => item.sentiment === 'Positive').length;
  const declining = enrichedHeatmap.filter((item) => item.sentiment === 'Negative').length;
  const neutral = enrichedHeatmap.filter((item) => item.sentiment === 'Neutral').length;

  return {
    market: 'ASX',
    overall_sentiment: overallSentiment,
    summary:
      overallSentiment === 'Positive'
        ? 'Live ASX market tone is constructive, with more tracked large-cap names trading higher than lower.'
        : overallSentiment === 'Negative'
          ? 'Live ASX market tone is cautious, with weakness outweighing strength across the tracked names.'
          : 'Live ASX market tone is balanced, with mixed performance across the tracked names.',
    updated_at: new Date().toISOString(),
    advancing_blocks: advancing,
    declining_blocks: declining,
    neutral_blocks: neutral,
    heatmap: enrichedHeatmap,
  };
}

async function fetchLiveMarketSentiment(): Promise<MarketSentimentEnvelope> {
  if (LIVE_API_BASE_URL) {
    const requestUrl = new URL('/market-overview', LIVE_API_BASE_URL);
    const response = await fetch(requestUrl.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Market overview request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as MarketSentimentOverview;

    return {
      data_source: 'live',
      result: {
        ...payload,
        heatmap: enrichHeatmap(payload.heatmap),
      },
    };
  }

  if (!TWELVE_DATA_API_KEY) {
    throw new Error('VITE_TWELVE_DATA_API_KEY is not configured.');
  }

  const heatmap = await Promise.all(
    asxTrackedCompanies.map(async (company) => {
      const quote = await fetchQuote(company.twelve_data_symbol);
      const changePercent = Number.parseFloat(quote.percent_change ?? '0');
      const sentiment = scoreToSentiment(changePercent);

      return {
        ticker: company.ticker,
        company_name: quote.name ?? company.company_name,
        sector: company.sector,
        sentiment,
        weight: company.weight,
        change_percent: Number.isFinite(changePercent) ? changePercent : 0,
        volume_score: clamp(Math.round((company.weight / 18) * 100), 28, 100),
        heat_score: clamp(Math.round(Math.abs(changePercent) * 26 + (company.weight / 18) * 18), 24, 100),
        summary: summarizeTreemapTone(sentiment, Number.isFinite(changePercent) ? changePercent : 0),
      } satisfies MarketTreemapItem;
    }),
  );

  return {
    data_source: 'live',
    result: buildOverview(heatmap),
  };
}

export async function fetchMarketSentiment(): Promise<MarketSentimentEnvelope> {
  if (DATA_SOURCE_MODE !== 'live') {
    return {
      data_source: 'mock',
      result: {
        ...mockMarketSentiment,
        heatmap: enrichHeatmap(mockMarketSentiment.heatmap),
      },
    };
  }

  try {
    return await fetchLiveMarketSentiment();
  } catch {
    return {
      data_source: 'mock',
      result: {
        ...mockMarketSentiment,
        heatmap: enrichHeatmap(mockMarketSentiment.heatmap),
      },
    };
  }
}
