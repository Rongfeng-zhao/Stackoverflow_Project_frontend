import type { DataSourceMode } from '../types/stock';

export const DATA_SOURCE_MODE: DataSourceMode =
  import.meta.env.VITE_SENTIMENT_DATA_SOURCE === 'live' ? 'live' : 'mock';

export const LIVE_API_BASE_URL = import.meta.env.VITE_SENTIMENT_API_BASE_URL?.trim() ?? '';
export const TWELVE_DATA_API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY?.trim() ?? '';
export const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY?.trim() ?? '';
export const TWELVE_DATA_API_BASE_URL =
  import.meta.env.VITE_TWELVE_DATA_API_BASE_URL?.trim() ?? 'https://api.twelvedata.com';
export const ALPHA_VANTAGE_API_BASE_URL =
  import.meta.env.VITE_ALPHA_VANTAGE_API_BASE_URL?.trim() ??
  'https://www.alphavantage.co/query';
