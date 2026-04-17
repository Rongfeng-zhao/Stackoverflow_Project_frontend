/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTIMENT_DATA_SOURCE?: 'mock' | 'live';
  readonly VITE_SENTIMENT_API_BASE_URL?: string;
  readonly VITE_TWELVE_DATA_API_BASE_URL?: string;
  readonly VITE_ALPHA_VANTAGE_API_BASE_URL?: string;
  readonly VITE_TWELVE_DATA_API_KEY?: string;
  readonly VITE_ALPHA_VANTAGE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
