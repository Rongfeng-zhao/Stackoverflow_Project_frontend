import type { MarketSentimentOverview } from '../types/stock';
import { asxTrackedCompanies } from './asxUniverse';

export const mockMarketSentiment: MarketSentimentOverview = {
  market: 'ASX',
  overall_sentiment: 'Positive',
  summary:
    'ASX market mood is mildly constructive today, with strength concentrated in large-cap miners, healthcare, and selective consumer names, while banks remain more mixed on valuation and margin outlook.',
  updated_at: '2026-04-10T14:10:00Z',
  advancing_blocks: 6,
  declining_blocks: 2,
  neutral_blocks: 2,
  heatmap: [
    {
      ...asxTrackedCompanies[0],
      sentiment: 'Positive',
      change_percent: 1.8,
      volume_score: 94,
      heat_score: 83,
      summary: 'Production stability and firmer commodity sentiment supported miners.',
    },
    {
      ...asxTrackedCompanies[1],
      sentiment: 'Neutral',
      change_percent: 0.2,
      volume_score: 90,
      heat_score: 44,
      summary: 'Banks were steady as investors balanced resilience against valuation concerns.',
    },
    {
      ...asxTrackedCompanies[2],
      sentiment: 'Positive',
      change_percent: 1.4,
      volume_score: 84,
      heat_score: 76,
      summary: 'Healthcare sentiment improved on margin recovery expectations.',
    },
    {
      ...asxTrackedCompanies[3],
      sentiment: 'Positive',
      change_percent: 1.1,
      volume_score: 69,
      heat_score: 66,
      summary: 'Retail execution and resilient demand pockets helped consumer names.',
    },
    {
      ...asxTrackedCompanies[4],
      sentiment: 'Negative',
      change_percent: -0.9,
      volume_score: 62,
      heat_score: 61,
      summary: 'Margin pressure concerns kept sentiment softer across parts of the banking sector.',
    },
    {
      ...asxTrackedCompanies[5],
      sentiment: 'Positive',
      change_percent: 2.3,
      volume_score: 58,
      heat_score: 92,
      summary: 'Stronger iron ore narrative pushed sentiment higher for bulk commodity names.',
    },
    {
      ...asxTrackedCompanies[6],
      sentiment: 'Neutral',
      change_percent: 0.1,
      volume_score: 51,
      heat_score: 38,
      summary: 'Investor stance stayed balanced while awaiting clearer earnings catalysts.',
    },
    {
      ...asxTrackedCompanies[7],
      sentiment: 'Negative',
      change_percent: -0.6,
      volume_score: 49,
      heat_score: 54,
      summary: 'Competitive pressure kept grocery sentiment a little more cautious.',
    },
  ],
};
