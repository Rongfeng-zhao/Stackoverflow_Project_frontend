import type { StockAnalysisResult } from '../model/stockAnalysis.domainTypes';
import { CardShell } from '../../../shared/components/CardShell';
import { formatCompactNumber, formatCurrency, formatDateTime } from '../../../shared/lib/formatters';

interface StockInfoCardProps {
  stock: StockAnalysisResult;
}

const detailRows = (stock: StockAnalysisResult) => [
  { label: 'Company name', value: stock.companyName ?? 'N/A' },
  { label: 'Ticker', value: stock.ticker },
  { label: 'Market', value: stock.market },
  { label: 'Exchange', value: stock.exchange ?? 'N/A' },
  { label: 'Sector', value: stock.sector ?? 'N/A' },
  { label: 'Industry', value: stock.industry ?? 'N/A' },
  {
    label: 'Latest price',
    value: typeof stock.latestPrice === 'number' ? formatCurrency(stock.latestPrice, stock.currency ?? 'USD') : 'N/A',
  },
  {
    label: 'Day change',
    value:
      typeof stock.dayChangePercent === 'number'
        ? `${stock.dayChangePercent > 0 ? '+' : ''}${stock.dayChangePercent.toFixed(2)}%`
        : 'N/A',
  },
  {
    label: 'Volume',
    value: typeof stock.volume === 'number' ? formatCompactNumber(stock.volume) : 'N/A',
  },
  {
    label: 'Market cap',
    value: typeof stock.marketCap === 'number' ? formatCompactNumber(stock.marketCap) : 'N/A',
  },
  { label: 'Analysis time', value: formatDateTime(stock.analysisTime) },
];

export function StockInfoCard({ stock }: StockInfoCardProps) {
  return (
    <CardShell title="Stock Info" subtitle="Core company context for the selected US stock">
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
