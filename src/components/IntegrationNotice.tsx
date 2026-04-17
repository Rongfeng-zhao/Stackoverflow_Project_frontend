import type { DataSourceMode } from '../types/stock';
import { DataSourceBadge } from './DataSourceBadge';

interface IntegrationNoticeProps {
  mode: DataSourceMode;
}

export function IntegrationNotice({ mode }: IntegrationNoticeProps) {
  const copy =
    mode === 'live'
      ? 'The dashboard is currently reading from a configured API endpoint.'
      : 'The dashboard is currently using local mock ASX sentiment data. Switch to live mode with VITE_SENTIMENT_DATA_SOURCE=live.';

  return (
    <section className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-card backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-900">Data source</p>
          <p className="mt-1 text-sm leading-6 text-ink-500">{copy}</p>
        </div>
        <DataSourceBadge mode={mode} />
      </div>
    </section>
  );
}
