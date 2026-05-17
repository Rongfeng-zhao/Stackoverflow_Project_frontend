import type { MarketTreemapItem } from '../types/stock';

interface MarketTreemapTileProps {
  item: MarketTreemapItem;
}

const tileTone = {
  Positive:
    'border-mint-500/20 bg-gradient-to-br from-mint-500 to-emerald-700 text-white shadow-[0_18px_36px_rgba(16,185,129,0.24)]',
  Neutral:
    'border-amber-500/20 bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-[0_18px_36px_rgba(245,158,11,0.22)]',
  Negative:
    'border-rose-500/20 bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-[0_18px_36px_rgba(244,63,94,0.22)]',
} as const;

export function MarketTreemapTile({ item }: MarketTreemapTileProps) {
  const changePrefix = item.change_percent > 0 ? '+' : '';
  const prominence = ((item.volume_score ?? 50) * 0.55 + (item.heat_score ?? 50) * 0.45) / 10;
  const minHeight = 180 + ((item.heat_score ?? 50) / 100) * 110;
  const metricBarWidth = `${item.volume_score ?? 50}%`;
  const heatBarWidth = `${item.heat_score ?? 50}%`;

  return (
    <article
      className={`relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border p-5 ${tileTone[item.sentiment]}`}
      style={{
        flexGrow: prominence,
        flexBasis: `${Math.max(item.weight * 3.3, 24)}%`,
        minHeight,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_30%)]" />
      <div className="flex items-start justify-between gap-3">
        <div className="relative">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/70">
            {item.sector}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{item.ticker}</p>
          <p className="mt-1 max-w-[18rem] text-sm font-medium text-white/80">{item.company_name}</p>
        </div>
        <div className="rounded-2xl bg-white/15 px-3 py-2 text-right">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/70">
            Daily move
          </p>
          <p className="mt-1 text-2xl font-bold">
            {changePrefix}
            {item.change_percent.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="relative mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-black/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/70">Heat</p>
              <p className="text-sm font-semibold text-white">{item.heat_score ?? 50}</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div className="h-2 rounded-full bg-white" style={{ width: heatBarWidth }} />
            </div>
          </div>
          <div className="rounded-2xl bg-black/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/70">Volume</p>
              <p className="text-sm font-semibold text-white">{item.volume_score ?? 50}</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div className="h-2 rounded-full bg-white" style={{ width: metricBarWidth }} />
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">Sentiment</p>
            <p className="mt-1 text-lg font-semibold">{item.sentiment}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">Tile size</p>
            <p className="mt-1 text-sm font-semibold text-white/90">Heat + volume</p>
          </div>
        </div>

        <p className="text-sm leading-6 text-white/85">{item.summary}</p>
      </div>
    </article>
  );
}
