import { hierarchy, treemap } from 'd3';
import type { HierarchyRectangularNode } from 'd3';
import { useEffect, useRef, useState } from 'react';
import { fetchMarketSentiment } from '../services/marketSentimentApi';
import type { DataSourceMode, MarketSentimentOverview, MarketTreemapItem, Sentiment } from '../types/stock';
import { formatDateTime } from '../utils/formatters';
import { CardShell } from './CardShell';
import { DataSourceBadge } from './DataSourceBadge';
import { SentimentBadge } from './SentimentBadge';

interface HeatmapTooltipData {
  x: number;
  y: number;
  title: string;
  subtitle: string;
  change: string;
  sentiment: string;
  heat: string;
  volume: string;
  summary: string;
}

interface SectorGroup {
  name: string;
  sentiment: Sentiment;
  avgChange: number;
  heat: number;
  volume: number;
  stocks: MarketTreemapItem[];
}

type TreemapDatum =
  | {
      name: string;
      kind: 'root';
      children: SectorGroupDatum[];
    }
  | SectorGroupDatum
  | StockLeafDatum;

interface SectorGroupDatum {
  name: string;
  kind: 'sector';
  sentiment: Sentiment;
  avgChange: number;
  heat: number;
  volume: number;
  children: StockLeafDatum[];
}

interface StockLeafDatum extends MarketTreemapItem {
  name: string;
  kind: 'stock';
  value: number;
}

const BOARD_HEIGHT = 640;

function getColor(change: number): string {
  if (change >= 2.5) return '#0f7a31';
  if (change >= 1.2) return '#1f9d45';
  if (change > 0) return '#42b55b';
  if (change === 0) return '#5c6675';
  if (change > -1.2) return '#c54c57';
  if (change > -2.5) return '#a72e3c';
  return '#7f1721';
}

function getSectorStroke(sentiment: Sentiment): string {
  if (sentiment === 'Positive') return 'rgba(74, 222, 128, 0.45)';
  if (sentiment === 'Negative') return 'rgba(251, 113, 133, 0.45)';
  return 'rgba(148, 163, 184, 0.4)';
}

function buildSectors(overview: MarketSentimentOverview): SectorGroup[] {
  const groups = new Map<string, MarketTreemapItem[]>();

  overview.heatmap.forEach((item) => {
    const current = groups.get(item.sector) ?? [];
    current.push(item);
    groups.set(item.sector, current);
  });

  return [...groups.entries()]
    .map(([name, stocks]) => {
      const avgChange = stocks.reduce((sum, stock) => sum + stock.change_percent, 0) / stocks.length;
      const heat = Math.round(
        stocks.reduce((sum, stock) => sum + (stock.heat_score ?? 50), 0) / stocks.length,
      );
      const volume = Math.round(
        stocks.reduce((sum, stock) => sum + (stock.volume_score ?? 50), 0) / stocks.length,
      );
      const sentiment: Sentiment =
        avgChange > 0.2 ? 'Positive' : avgChange < -0.2 ? 'Negative' : 'Neutral';

      return {
        name,
        sentiment,
        avgChange,
        heat,
        volume,
        stocks,
      };
    })
    .sort((left, right) => right.volume - left.volume);
}

function stockValue(stock: MarketTreemapItem): number {
  return stock.weight * 10 + (stock.volume_score ?? 50) * 0.9 + (stock.heat_score ?? 50) * 0.7;
}

function buildTreemapData(overview: MarketSentimentOverview, selectedSector: string | null): TreemapDatum {
  const sectors = buildSectors(overview);

  if (selectedSector) {
    const sector = sectors.find((item) => item.name === selectedSector);
    if (!sector) {
      return buildTreemapData(overview, null);
    }

    return {
      name: sector.name,
      kind: 'root',
      children: [
        {
          name: sector.name,
          kind: 'sector',
          sentiment: sector.sentiment,
          avgChange: sector.avgChange,
          heat: sector.heat,
          volume: sector.volume,
          children: sector.stocks.map((stock) => ({
            ...stock,
            name: stock.ticker,
            kind: 'stock',
            value: stockValue(stock),
          })),
        },
      ],
    };
  }

  return {
    name: 'ASX',
    kind: 'root',
    children: sectors.map((sector) => ({
      name: sector.name,
      kind: 'sector',
      sentiment: sector.sentiment,
      avgChange: sector.avgChange,
      heat: sector.heat,
      volume: sector.volume,
      children: sector.stocks.map((stock) => ({
        ...stock,
        name: stock.ticker,
        kind: 'stock',
        value: stockValue(stock),
      })),
    })),
  };
}

export function MarketSentimentTreemap() {
  const [overview, setOverview] = useState<MarketSentimentOverview | null>(null);
  const [sourceMode, setSourceMode] = useState<DataSourceMode>('mock');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<HeatmapTooltipData | null>(null);
  const [boardWidth, setBoardWidth] = useState(1100);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    void fetchMarketSentiment().then((response) => {
      if (!active) {
        return;
      }

      setOverview(response.result);
      setSourceMode(response.data_source);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!boardRef.current) {
      return;
    }

    const element = boardRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setBoardWidth(Math.max(320, Math.floor(entry.contentRect.width)));
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!overview) {
    return (
      <section className="h-[24rem] animate-pulse rounded-4xl border border-white/70 bg-white/80 shadow-card" />
    );
  }

  const treemapData = buildTreemapData(overview, selectedSector);
  const root = hierarchy<TreemapDatum>(treemapData)
    .sum((node) => ('value' in node ? node.value : 0))
    .sort((left, right) => (right.value ?? 0) - (left.value ?? 0));

  const layout = treemap<TreemapDatum>()
    .size([boardWidth, BOARD_HEIGHT])
    .paddingInner(2)
    .paddingOuter(2)
    .paddingTop((node) => (node.depth === 1 ? 18 : 0));

  const treemapRoot = layout(root);

  const sectors = (treemapRoot.children ?? []) as HierarchyRectangularNode<TreemapDatum>[];
  const leaves = treemapRoot.leaves() as HierarchyRectangularNode<TreemapDatum>[];

  return (
    <CardShell
      title="ASX Market Sentiment"
      subtitle="Interactive market heatmap with sector grouping, hover details, and click-to-drill-down"
    >
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-[1.75rem] bg-ink-900 p-5 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <SentimentBadge sentiment={overview.overall_sentiment} />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                {overview.market} overview
              </span>
              <DataSourceBadge mode={sourceMode} />
            </div>
            <p className="mt-4 text-lg leading-8 text-white/88">{overview.summary}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-[1.75rem] bg-mint-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint-600">
                Advancing
              </p>
              <p className="mt-3 text-3xl font-bold text-ink-900">{overview.advancing_blocks}</p>
            </div>
            <div className="rounded-[1.75rem] bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                Neutral
              </p>
              <p className="mt-3 text-3xl font-bold text-ink-900">{overview.neutral_blocks}</p>
            </div>
            <div className="rounded-[1.75rem] bg-rose-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
                Declining
              </p>
              <p className="mt-3 text-3xl font-bold text-ink-900">{overview.declining_blocks}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-ink-600">Move</p>
            <div className="flex items-center gap-1">
              {['#7f1721', '#a72e3c', '#c54c57', '#5c6675', '#42b55b', '#1f9d45', '#0f7a31'].map(
                (color) => (
                  <span
                    key={color}
                    className="h-3.5 w-7 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ),
              )}
            </div>
            <p className="text-sm font-medium text-ink-600">Heat</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {selectedSector ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedSector(null);
                  setTooltip(null);
                }}
                className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-ocean-100 hover:bg-ocean-50 hover:text-ocean-700"
              >
                Back to sectors
              </button>
            ) : null}
            <p className="text-sm text-ink-500">
              {selectedSector
                ? `Viewing stocks inside ${selectedSector}`
                : 'Click a sector label to zoom into its stocks'}
            </p>
          </div>
        </div>

        <div
          ref={boardRef}
          className="relative overflow-hidden rounded-[2rem] border border-ink-100 bg-[#111827]"
        >
          <svg
            viewBox={`0 0 ${boardWidth} ${BOARD_HEIGHT}`}
            className="block h-[640px] w-full"
            role="img"
            aria-label="ASX market treemap"
          >
            <rect x="0" y="0" width={boardWidth} height={BOARD_HEIGHT} fill="#111827" />

            {sectors.map((sector) => {
              const datum = sector.data as SectorGroupDatum;
              return (
                <g key={`sector-${datum.name}`}>
                  <rect
                    x={sector.x0}
                    y={sector.y0}
                    width={Math.max(0, sector.x1 - sector.x0)}
                    height={Math.max(0, sector.y1 - sector.y0)}
                    fill="rgba(255,255,255,0.03)"
                    stroke={getSectorStroke(datum.sentiment)}
                    strokeWidth={1}
                    rx={3}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedSector(datum.name);
                      setTooltip(null);
                    }}
                    onMouseMove={(event) => {
                      const bounds = boardRef.current?.getBoundingClientRect();
                      if (!bounds) return;
                      setTooltip({
                        x: event.clientX - bounds.left + 14,
                        y: event.clientY - bounds.top - 18,
                        title: datum.name,
                        subtitle: 'Sector overview',
                        change: `${datum.avgChange > 0 ? '+' : ''}${datum.avgChange.toFixed(1)}%`,
                        sentiment: datum.sentiment,
                        heat: `${datum.heat}`,
                        volume: `${datum.volume}`,
                        summary: `Average move ${datum.avgChange.toFixed(1)}% across ${datum.children.length} tracked stocks.`,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <text
                    x={sector.x0 + 6}
                    y={sector.y0 + 13}
                    fill="rgba(255,255,255,0.72)"
                    fontSize="10"
                    fontWeight="600"
                    style={{ letterSpacing: '0.12em', textTransform: 'uppercase', pointerEvents: 'none' }}
                  >
                    {datum.name.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {leaves.map((leaf) => {
              const datum = leaf.data as StockLeafDatum;
              const width = Math.max(0, leaf.x1 - leaf.x0 - 1);
              const height = Math.max(0, leaf.y1 - leaf.y0 - 1);
              const showChange = width > 54 && height > 38;
              const large = width > 120 && height > 80;
              const medium = width > 72 && height > 46;
              const tickerSize = large ? 17 : medium ? 11 : 8;
              const changeSize = large ? 10 : 8;

              return (
                <g key={`${datum.sector}-${datum.ticker}`} transform={`translate(${leaf.x0},${leaf.y0})`}>
                  <rect
                    width={width}
                    height={height}
                    rx={2}
                    fill={getColor(datum.change_percent)}
                    className="cursor-pointer"
                    onMouseMove={(event) => {
                      const bounds = boardRef.current?.getBoundingClientRect();
                      if (!bounds) return;
                      setTooltip({
                        x: event.clientX - bounds.left + 14,
                        y: event.clientY - bounds.top - 18,
                        title: datum.ticker,
                        subtitle: datum.company_name,
                        change: `${datum.change_percent > 0 ? '+' : ''}${datum.change_percent.toFixed(2)}%`,
                        sentiment: datum.sentiment,
                        heat: `${datum.heat_score ?? 0}`,
                        volume: `${datum.volume_score ?? 0}`,
                        summary: datum.summary,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />

                  {width > 28 && height > 18 ? (
                    <text
                      x={width / 2}
                      y={height / 2 + (showChange ? -6 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={tickerSize}
                      fontWeight="700"
                      style={{ pointerEvents: 'none' }}
                    >
                      {datum.ticker}
                    </text>
                  ) : null}

                  {showChange ? (
                    <text
                      x={width / 2}
                      y={height / 2 + tickerSize}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.9)"
                      fontSize={changeSize}
                      fontWeight="600"
                      style={{ pointerEvents: 'none' }}
                    >
                      {datum.change_percent > 0 ? '+' : ''}
                      {datum.change_percent.toFixed(2)}%
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>

          {tooltip ? (
            <div
              className="pointer-events-none absolute z-20 hidden w-72 rounded-3xl border border-white/10 bg-black/90 p-4 text-white shadow-2xl lg:block"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/55">
                {tooltip.subtitle}
              </p>
              <p className="mt-2 text-xl font-bold tracking-tight">{tooltip.title}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55">Move</p>
                  <p className="mt-1 text-sm font-semibold">{tooltip.change}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55">Sentiment</p>
                  <p className="mt-1 text-sm font-semibold">{tooltip.sentiment}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55">Heat</p>
                  <p className="mt-1 text-sm font-semibold">{tooltip.heat}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55">Volume</p>
                  <p className="mt-1 text-sm font-semibold">{tooltip.volume}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/78">{tooltip.summary}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-ink-100 pt-4 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Treemap area scales with market influence, volume, and news heat. Color intensity maps
            percentage move, and click interaction zooms the board into a selected sector.
          </p>
          <p>Updated {formatDateTime(overview.updated_at)}</p>
        </div>
      </div>
    </CardShell>
  );
}
