import type { MouseEvent } from 'react';
import type { MarketTreemapItem } from '../types/stock';

interface StockHeatmapBlockProps {
  item: MarketTreemapItem;
  colSpan: number;
  rowSpan: number;
  onHover: (event: MouseEvent<HTMLButtonElement>) => void;
  onLeave: () => void;
}

const stockTone = {
  Positive:
    'from-mint-500 via-emerald-600 to-emerald-800 border-mint-400/30 text-white',
  Neutral:
    'from-slate-500 via-slate-600 to-slate-800 border-slate-400/30 text-white',
  Negative:
    'from-rose-500 via-red-600 to-red-800 border-rose-400/30 text-white',
} as const;

export function StockHeatmapBlock({
  item,
  colSpan,
  rowSpan,
  onHover,
  onLeave,
}: StockHeatmapBlockProps) {
  return (
    <button
      type="button"
      onMouseMove={onHover}
      onMouseLeave={onLeave}
      className={`relative flex min-h-[9rem] flex-col justify-end overflow-hidden rounded-[1.35rem] border bg-gradient-to-br p-4 text-left transition duration-200 hover:scale-[1.015] ${stockTone[item.sentiment]}`}
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        gridRow: `span ${rowSpan} / span ${rowSpan}`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
      <div className="relative">
        <p className="text-3xl font-bold tracking-tight">{item.ticker}</p>
        <p className="mt-1 text-xl font-semibold">
          {item.change_percent > 0 ? '+' : ''}
          {item.change_percent.toFixed(1)}%
        </p>
      </div>
    </button>
  );
}
