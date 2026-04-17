import { MarketBadge } from './MarketBadge';

export function Header() {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card backdrop-blur">
      <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-ocean-50/80 to-transparent lg:block" />
      <div className="relative flex flex-col gap-4 lg:max-w-3xl">
        <MarketBadge label="ASX only" />
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            ASX Stock Intelligence Search
          </h1>
          <p className="max-w-2xl text-base leading-7 text-ink-500 sm:text-lg">
            Send one ASX ticker to the backend, then display stock info, price history, related
            news, and model-based positive or negative sentiment.
          </p>
        </div>
      </div>
    </header>
  );
}
