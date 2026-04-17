import { MarketBadge } from './MarketBadge';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onQuickSelect: (ticker: string) => void;
  isLoading: boolean;
  exampleTickers: string[];
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onQuickSelect,
  isLoading,
  exampleTickers,
}: SearchBarProps) {
  return (
    <section className="rounded-4xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Search</h2>
            <MarketBadge label="ASX ticker" />
          </div>
          <p className="text-sm leading-6 text-ink-500">
            Enter a listed Australian equity code. The backend handles stock basics, K-line data,
            news retrieval, and per-article sentiment classification.
          </p>
        </div>

        <form
          className="w-full max-w-3xl"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="block text-sm font-semibold text-ink-700" htmlFor="ticker-input">
            ASX Ticker
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="ticker-input"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={4}
              disabled={isLoading}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Enter ASX ticker, e.g. BHP or CBA"
              className="min-h-14 flex-1 rounded-2xl border border-ink-100 bg-ink-50/60 px-4 text-base font-medium text-ink-900 outline-none transition focus:border-ocean-500 focus:bg-white focus:ring-4 focus:ring-ocean-100 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-500"
            />
            <button
              type="submit"
              disabled={isLoading || value.trim().length === 0}
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-ink-900 px-6 text-sm font-semibold text-white transition hover:bg-ink-700 disabled:cursor-not-allowed disabled:bg-ink-300"
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {exampleTickers.map((ticker) => (
              <button
                key={ticker}
                type="button"
                disabled={isLoading}
                onClick={() => onQuickSelect(ticker)}
                className="rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-ocean-100 hover:bg-ocean-50 hover:text-ocean-700 disabled:cursor-not-allowed disabled:border-ink-100 disabled:bg-ink-100 disabled:text-ink-400"
              >
                {ticker}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
