import { CardShell } from '../../../shared/components/CardShell';
import { SentimentBadge } from '../../../shared/components/SentimentBadge';
import { formatConfidence } from '../../../shared/lib/formatters';
import type { StockSentimentLabel } from '../model/stockAnalysis.domainTypes';

interface SentimentCardProps {
  sentiment: StockSentimentLabel;
  confidence: number;
  articleCount: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  modelName: string;
}

export function SentimentCard({
  sentiment,
  confidence,
  articleCount,
  positiveCount,
  negativeCount,
  neutralCount,
  modelName,
}: SentimentCardProps) {
  return (
    <CardShell title="Sentiment Overview" subtitle="Aggregated from article-level sentiment outputs">
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

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-mint-50 px-4 py-3">
            <p className="text-sm font-medium text-mint-700">Positive</p>
            <p className="mt-1 text-2xl font-semibold text-mint-700">{positiveCount}</p>
          </div>
          <div className="rounded-3xl bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-700">Neutral</p>
            <p className="mt-1 text-2xl font-semibold text-amber-700">{neutralCount}</p>
          </div>
          <div className="rounded-3xl bg-rose-50 px-4 py-3">
            <p className="text-sm font-medium text-rose-700">Negative</p>
            <p className="mt-1 text-2xl font-semibold text-rose-700">{negativeCount}</p>
          </div>
        </div>

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

        <div className="rounded-3xl bg-ink-50 px-4 py-3">
          <p className="text-sm font-medium text-ink-500">Sentiment model</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">{modelName}</p>
        </div>
      </div>
    </CardShell>
  );
}
