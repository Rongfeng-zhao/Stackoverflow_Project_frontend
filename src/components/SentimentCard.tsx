import type { Sentiment } from '../types/stock';
import { formatConfidence } from '../utils/formatters';
import { CardShell } from './CardShell';
import { SentimentBadge } from './SentimentBadge';

interface SentimentCardProps {
  sentiment: Sentiment;
  confidence: number;
  articleCount: number;
  positiveCount?: number;
  negativeCount?: number;
}

export function SentimentCard({
  sentiment,
  confidence,
  articleCount,
  positiveCount,
  negativeCount,
}: SentimentCardProps) {
  return (
    <CardShell title="Sentiment Overview" subtitle="Aggregated from per-article positive/negative model outputs">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink-500">Overall sentiment</p>
            <div className="mt-2">
              <SentimentBadge sentiment={sentiment} />
            </div>
          </div>
          <div className="rounded-3xl bg-ink-50 px-4 py-3 text-right">
            <p className="text-sm font-medium text-ink-500">Articles analyzed</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{articleCount}</p>
          </div>
        </div>

        {typeof positiveCount === 'number' && typeof negativeCount === 'number' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-mint-50 px-4 py-3">
              <p className="text-sm font-medium text-mint-700">Positive news</p>
              <p className="mt-1 text-2xl font-semibold text-mint-700">{positiveCount}</p>
            </div>
            <div className="rounded-3xl bg-rose-50 px-4 py-3">
              <p className="text-sm font-medium text-rose-700">Negative news</p>
              <p className="mt-1 text-2xl font-semibold text-rose-700">{negativeCount}</p>
            </div>
          </div>
        ) : null}

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink-500">Confidence score</p>
            <p className="text-lg font-semibold text-ink-900">{formatConfidence(confidence)}</p>
          </div>
          <div className="mt-3 h-3 rounded-full bg-ink-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-ocean-500 to-mint-500"
              style={{ width: `${Math.max(confidence * 100, 8)}%` }}
            />
          </div>
        </div>
      </div>
    </CardShell>
  );
}
