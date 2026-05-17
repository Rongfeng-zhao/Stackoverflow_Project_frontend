import { CardShell } from '../../../shared/components/CardShell';
import type { StockNewsItem } from '../model/stockAnalysis.domainTypes';
import { NewsItem } from './NewsItem';

interface NewsListProps {
  items: StockNewsItem[];
  provider: string;
}

export function NewsList({ items, provider }: NewsListProps) {
  return (
    <CardShell
      title="Recent News"
      subtitle={`Recent headlines included in the sentiment snapshot. Source: ${provider}`}
    >
      <div className="space-y-4">
        {items.map((item) => (
          <NewsItem key={`${item.source}-${item.publishedAt}-${item.title}`} item={item} />
        ))}
      </div>
    </CardShell>
  );
}
