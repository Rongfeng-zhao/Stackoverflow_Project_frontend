import type { StockSentimentResult } from '../types/stock';
import { formatCompactNumber, formatCurrency, formatDateTime } from '../utils/formatters';
import { CardShell } from './CardShell';

interface StockInfoCardProps {
  stock: StockSentimentResult;
}

const detailRows = (stock: StockSentimentResult) => [
  {
    label: 'Company name',
    value: stock.company_name,
  },
  {
    label: 'Ticker',
    value: stock.ticker,
  },
  {
    label: 'Market',
    value: stock.market,
  },
  {
    label: 'Sector',
    value: stock.sector ?? 'N/A',
  },
  {
    label: 'Industry',
    value: stock.industry ?? 'N/A',
  },
  {
    label: 'Last price',
    value:
      typeof stock.latest_price === 'number'
        ? formatCurrency(stock.latest_price, stock.currency ?? 'AUD')
        : 'N/A',
  },
  {
    label: 'Day change',
    value:
      typeof stock.day_change_percent === 'number'
        ? `${stock.day_change_percent > 0 ? '+' : ''}${stock.day_change_percent.toFixed(2)}%`
        : 'N/A',
  },
  {
    label: 'Volume',
    value: typeof stock.volume === 'number' ? formatCompactNumber(stock.volume) : 'N/A',
  },
  {
    label: 'Market cap',
    value: stock.market_cap ?? 'N/A',
  },
  {
    label: 'Analysis time',
    value: formatDateTime(stock.analysis_time),
  },
];

export function StockInfoCard({ stock }: StockInfoCardProps) {
  return (
    <CardShell title="Stock Info" subtitle="Core company snapshot for this ASX sentiment check">
      <div className="space-y-5">
        {detailRows(stock).map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 border-b border-ink-100 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium text-ink-500">{row.label}</span>
            <span className="text-sm font-semibold text-ink-900 sm:text-base">{row.value}</span>
          </div>
        ))}

        {stock.description ? (
          <div className="rounded-3xl bg-ink-50/80 p-4">
            <p className="text-sm font-medium text-ink-500">Business description</p>
            <p className="mt-2 text-sm leading-7 text-ink-700">{stock.description}</p>
          </div>
        ) : null}
      </div>
    </CardShell>
  );
}
