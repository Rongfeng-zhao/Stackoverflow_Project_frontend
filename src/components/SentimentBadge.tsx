import type { Sentiment } from '../types/stock';

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

const sentimentStyles: Record<Sentiment, string> = {
  Positive: 'border-mint-50 bg-mint-50 text-mint-600',
  Neutral: 'border-amber-50 bg-amber-50 text-amber-600',
  Negative: 'border-rose-50 bg-rose-50 text-rose-600',
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${sentimentStyles[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}
