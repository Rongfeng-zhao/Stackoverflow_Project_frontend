import type { StockSentimentApiResponse } from '../types/stock';

export const mockStockSentimentDatabase: Record<string, StockSentimentApiResponse> = {
  BHP: {
    ticker: 'BHP',
    company_name: 'BHP Group Ltd',
    market: 'ASX',
    overall_sentiment: 'Positive',
    confidence: 0.84,
    summary:
      'Recent coverage points to constructive investor sentiment around BHP, driven by stable production commentary, resilient iron ore demand expectations, and continued focus on disciplined capital allocation.',
    article_count: 6,
    news_items: [
      {
        title: 'BHP shares lift after quarterly production update meets market expectations',
        source: 'Reuters',
        published_at: '2026-04-10T09:30:00Z',
        sentiment: 'Positive',
        snippet:
          'Investors responded positively after BHP reported steady output across key operations and reiterated its focus on operational reliability.',
        url: 'https://example.com/bhp-production-update',
      },
      {
        title: 'Analysts point to resilient iron ore demand as support for BHP outlook',
        source: 'Australian Financial Review',
        published_at: '2026-04-10T05:10:00Z',
        sentiment: 'Positive',
        snippet:
          'Broker commentary highlighted supportive commodity demand assumptions and relatively stable near-term earnings expectations.',
        url: 'https://example.com/bhp-demand-outlook',
      },
      {
        title: 'Miners trade mixed as currency moves offset commodity gains',
        source: 'The Australian',
        published_at: '2026-04-09T22:45:00Z',
        sentiment: 'Neutral',
        snippet:
          'Sector reporting noted that BHP remained comparatively resilient even as broader resource names reacted unevenly to macro drivers.',
        url: 'https://example.com/bhp-sector-wrap',
      },
      {
        title: 'BHP seen maintaining balance sheet flexibility amid expansion planning',
        source: 'MarketWatch',
        published_at: '2026-04-09T11:20:00Z',
        sentiment: 'Positive',
        snippet:
          'Coverage emphasized management discipline on spending and the company’s ability to fund growth while preserving financial strength.',
        url: 'https://example.com/bhp-balance-sheet',
      },
    ],
  },
  CBA: {
    ticker: 'CBA',
    company_name: 'Commonwealth Bank of Australia',
    market: 'ASX',
    overall_sentiment: 'Neutral',
    confidence: 0.76,
    summary:
      'News sentiment around CBA is balanced, with strength in deposit franchise commentary offset by scrutiny on valuation and the pace of margin normalization.',
    article_count: 5,
    news_items: [
      {
        title: 'CBA holds gains as investors assess earnings resilience across major banks',
        source: 'Reuters',
        published_at: '2026-04-10T06:50:00Z',
        sentiment: 'Neutral',
        snippet:
          'Analysts described CBA as operationally solid, though some cautioned that premium valuation leaves less room for upside surprises.',
        url: 'https://example.com/cba-earnings-resilience',
      },
      {
        title: 'Broker note says deposit competition may pressure bank margins',
        source: 'The Sydney Morning Herald',
        published_at: '2026-04-10T02:30:00Z',
        sentiment: 'Negative',
        snippet:
          'Coverage focused on tighter funding competition and how that may moderate net interest margin expansion in the coming quarters.',
        url: 'https://example.com/cba-margin-pressure',
      },
      {
        title: 'CBA digital investment continues to support customer growth narrative',
        source: 'The Australian Financial Review',
        published_at: '2026-04-09T23:15:00Z',
        sentiment: 'Positive',
        snippet:
          'Recent reporting highlighted continued engagement improvements from digital banking features and strong customer retention signals.',
        url: 'https://example.com/cba-digital-growth',
      },
    ],
  },
  CSL: {
    ticker: 'CSL',
    company_name: 'CSL Limited',
    market: 'ASX',
    overall_sentiment: 'Positive',
    confidence: 0.81,
    summary:
      'Sentiment for CSL remains positive as coverage emphasizes plasma collection momentum, margin recovery expectations, and demand support across core therapies.',
    article_count: 4,
    news_items: [
      {
        title: 'CSL advances after analysts cite improving plasma collection trends',
        source: 'Reuters',
        published_at: '2026-04-10T08:05:00Z',
        sentiment: 'Positive',
        snippet:
          'Market commentary pointed to better donor center productivity and the potential for continued margin normalization through the second half.',
        url: 'https://example.com/csl-plasma-trends',
      },
      {
        title: 'Healthcare sector note highlights defensive appeal of CSL earnings profile',
        source: 'Morningstar',
        published_at: '2026-04-10T01:40:00Z',
        sentiment: 'Positive',
        snippet:
          'Analysts said CSL’s diversified therapy portfolio continues to offer relative earnings visibility compared with cyclically exposed sectors.',
        url: 'https://example.com/csl-defensive-appeal',
      },
      {
        title: 'FX headwinds still part of CSL investment debate',
        source: 'The Australian',
        published_at: '2026-04-09T20:20:00Z',
        sentiment: 'Neutral',
        snippet:
          'Reporting noted that while operational indicators are improving, currency moves remain a watchpoint for near-term reported numbers.',
        url: 'https://example.com/csl-fx-headwinds',
      },
    ],
  },
  WES: {
    ticker: 'WES',
    company_name: 'Wesfarmers Limited',
    market: 'ASX',
    overall_sentiment: 'Positive',
    confidence: 0.79,
    summary:
      'Recent Wesfarmers news flow is moderately positive, reflecting confidence in retail execution, stable consumer demand pockets, and continued portfolio discipline.',
    article_count: 4,
    news_items: [
      {
        title: 'Wesfarmers edges higher as Bunnings update reinforces earnings stability',
        source: 'Reuters',
        published_at: '2026-04-10T07:10:00Z',
        sentiment: 'Positive',
        snippet:
          'Investors welcomed signs of steady trading conditions and ongoing demand resilience in core home improvement categories.',
        url: 'https://example.com/wes-bunnings-update',
      },
      {
        title: 'Retail analysts see selective consumer strength supporting Wesfarmers',
        source: 'The Australian Financial Review',
        published_at: '2026-04-10T00:55:00Z',
        sentiment: 'Positive',
        snippet:
          'Coverage suggested the group’s diversified retail exposure is helping cushion weaker discretionary segments elsewhere in the market.',
        url: 'https://example.com/wes-consumer-strength',
      },
      {
        title: 'Cost inflation remains a watchpoint for diversified retailers',
        source: 'The Sydney Morning Herald',
        published_at: '2026-04-09T19:40:00Z',
        sentiment: 'Neutral',
        snippet:
          'Reporting noted that margin discipline remains important even as sales trends stay constructive across major brands.',
        url: 'https://example.com/wes-cost-inflation',
      },
    ],
  },
};
