import type { DataSourceMode } from '../types/stock';

interface DataSourceBadgeProps {
  mode: DataSourceMode;
}

const styles: Record<DataSourceMode, string> = {
  mock: 'border-amber-100 bg-amber-50 text-amber-600',
  live: 'border-mint-50 bg-mint-50 text-mint-600',
};

const labels: Record<DataSourceMode, string> = {
  mock: 'Mock data',
  live: 'Live API',
};

export function DataSourceBadge({ mode }: DataSourceBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${styles[mode]}`}
    >
      {labels[mode]}
    </span>
  );
}
