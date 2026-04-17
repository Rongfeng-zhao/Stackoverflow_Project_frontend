import type { NewsItemData } from '../types/stock';
import { formatConfidence, formatDateTime } from '../utils/formatters';
import { SentimentBadge } from './SentimentBadge';

interface NewsItemProps {
  item: NewsItemData;
}

export function NewsItem({ item }: NewsItemProps) {
  return (
    <article className="rounded-3xl border border-ink-100 bg-ink-50/60 p-5 transition hover:border-ocean-100 hover:bg-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <SentimentBadge sentiment={item.sentiment} />
            {typeof item.confidence === 'number' ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-500">
                {formatConfidence(item.confidence)} confidence
              </span>
            ) : null}
            <p className="text-sm text-ink-500">
              {item.source} • {formatDateTime(item.published_at)}
            </p>
          </div>
          <h3 className="text-lg font-semibold text-ink-900">{item.title}</h3>
          <p className="max-w-3xl text-sm leading-7 text-ink-600">{item.snippet}</p>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition hover:border-ocean-100 hover:bg-ocean-50 hover:text-ocean-700"
        >
          Open article
        </a>
      </div>
    </article>
  );
}
