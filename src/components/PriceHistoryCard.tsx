import type { PriceHistoryPoint } from '../types/stock';
import { formatCompactNumber, formatCurrency } from '../utils/formatters';
import { CardShell } from './CardShell';

interface PriceHistoryCardProps {
  points: PriceHistoryPoint[];
  currency?: string | null;
}

function buildPath(points: PriceHistoryPoint[], width: number, height: number, padding: number) {
  if (points.length === 0) {
    return '';
  }

  const closes = points.map((point) => point.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((point.close - min) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function PriceHistoryCard({ points, currency = 'AUD' }: PriceHistoryCardProps) {
  const latest = points.length > 0 ? points[points.length - 1] : undefined;
  const first = points.length > 0 ? points[0] : undefined;
  const change =
    latest && first ? ((latest.close - first.close) / Math.max(first.close, 0.01)) * 100 : null;
  const path = buildPath(points, 640, 220, 24);

  return (
    <CardShell
      title="Price History"
      subtitle="Daily K-line data returned by the backend analysis pipeline"
      className="overflow-hidden"
    >
      {points.length > 0 && latest ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-500">Latest close</p>
              <p className="mt-1 font-display text-3xl font-semibold text-ink-900">
                {formatCurrency(latest.close, currency ?? 'AUD')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-4">
              <div className="rounded-2xl bg-ink-50 px-3 py-2">
                <p className="text-xs text-ink-500">Open</p>
                <p className="text-sm font-semibold text-ink-900">{formatCurrency(latest.open, currency ?? 'AUD')}</p>
              </div>
              <div className="rounded-2xl bg-ink-50 px-3 py-2">
                <p className="text-xs text-ink-500">High</p>
                <p className="text-sm font-semibold text-ink-900">{formatCurrency(latest.high, currency ?? 'AUD')}</p>
              </div>
              <div className="rounded-2xl bg-ink-50 px-3 py-2">
                <p className="text-xs text-ink-500">Volume</p>
                <p className="text-sm font-semibold text-ink-900">{formatCompactNumber(latest.volume)}</p>
              </div>
              <div className="rounded-2xl bg-ink-50 px-3 py-2">
                <p className="text-xs text-ink-500">Period</p>
                <p
                  className={`text-sm font-semibold ${
                    change !== null && change < 0 ? 'text-rose-600' : 'text-mint-600'
                  }`}
                >
                  {change === null ? 'N/A' : `${change > 0 ? '+' : ''}${change.toFixed(2)}%`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700 p-4">
            <svg viewBox="0 0 640 220" role="img" aria-label="Stock price history line chart" className="h-64 w-full">
              <defs>
                <linearGradient id="priceFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${path} L 616 196 L 24 196 Z`} fill="url(#priceFill)" />
              <path d={path} fill="none" stroke="#7dd3fc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
              {points.map((point, index) => {
                const closes = points.map((item) => item.close);
                const min = Math.min(...closes);
                const max = Math.max(...closes);
                const range = max - min || 1;
                const x = 24 + (index / Math.max(points.length - 1, 1)) * 592;
                const y = 196 - ((point.close - min) / range) * 172;

                return (
                  <circle
                    key={`${point.date}-${point.close}`}
                    cx={x}
                    cy={y}
                    r={index === points.length - 1 ? 5 : 2.5}
                    fill={index === points.length - 1 ? '#f8fafc' : '#38bdf8'}
                    opacity={index === points.length - 1 ? 1 : 0.58}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-ink-50 p-5 text-sm text-ink-600">
          No price history was returned for this ticker yet.
        </div>
      )}
    </CardShell>
  );
}
