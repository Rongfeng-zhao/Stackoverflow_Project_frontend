import type { NewsItemData } from '../types/stock';
import { CardShell } from './CardShell';
import { NewsItem } from './NewsItem';

interface NewsListProps {
  items: NewsItemData[];
}

export function NewsList({ items }: NewsListProps) {
  return (
    <CardShell
      title="Recent News"
      subtitle="Recent headlines included in the sentiment analysis snapshot"
    >
      <div className="space-y-4">
        {items.map((item) => (
          <NewsItem key={`${item.source}-${item.published_at}-${item.title}`} item={item} />
        ))}
      </div>
    </CardShell>
  );
}
