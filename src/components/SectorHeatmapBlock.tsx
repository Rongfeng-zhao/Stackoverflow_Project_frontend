import type { MouseEvent } from 'react';

interface SectorHeatmapBlockProps {
  name: string;
  stockCount: number;
  avgMove: number;
  hottest: number;
  volume: number;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  colSpan: number;
  rowSpan: number;
  onClick: () => void;
  onHover: (event: MouseEvent<HTMLButtonElement>) => void;
  onLeave: () => void;
}

const sectorTone = {
  Positive:
    'from-mint-600 via-emerald-700 to-emerald-900 border-mint-400/30 text-white',
  Neutral:
    'from-slate-600 via-slate-700 to-slate-900 border-slate-400/30 text-white',
  Negative:
    'from-rose-600 via-red-700 to-red-900 border-rose-400/30 text-white',
} as const;

export function SectorHeatmapBlock({
  name,
  stockCount,
  avgMove,
  hottest,
  volume,
  sentiment,
  colSpan,
  rowSpan,
  onClick,
  onHover,
  onLeave,
}: SectorHeatmapBlockProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseMove={onHover}
      onMouseLeave={onLeave}
      className={`relative flex min-h-[12rem] flex-col justify-between overflow-hidden rounded-[1.7rem] border bg-gradient-to-br p-5 text-left transition duration-200 hover:scale-[1.015] ${sectorTone[sentiment]}`}
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        gridRow: `span ${rowSpan} / span ${rowSpan}`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
      <div className="relative">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/65">
          Sector
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight">{name}</h3>
      </div>

      <div className="relative space-y-4">
        <div>
          <p className="text-4xl font-bold tracking-tight">
            {avgMove > 0 ? '+' : ''}
            {avgMove.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-white/70">Average move</p>
        </div>

        <div className="flex items-end justify-between gap-3 text-sm">
          <div>
            <p className="text-white/60">Stocks</p>
            <p className="mt-1 font-semibold">{stockCount}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60">Heat / Vol</p>
            <p className="mt-1 font-semibold">
              {hottest} / {volume}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
