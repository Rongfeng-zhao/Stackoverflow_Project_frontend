const VALID_ASX_TICKER_REGEX = /^[A-Z]{3,4}$/;

export function sanitizeTickerInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
}

export function normalizeTicker(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidAsxTicker(value: string): boolean {
  return VALID_ASX_TICKER_REGEX.test(normalizeTicker(value));
}
