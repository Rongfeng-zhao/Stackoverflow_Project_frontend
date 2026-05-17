interface HeatmapTooltipProps {
  title: string;
  subtitle: string;
  sentiment: string;
  changeLabel: string;
  heatLabel: string;
  volumeLabel: string;
  summary: string;
  left: number;
  top: number;
}

export function HeatmapTooltip({
  title,
  subtitle,
  sentiment,
  changeLabel,
  heatLabel,
  volumeLabel,
  summary,
  left,
  top,
}: HeatmapTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-30 hidden w-72 rounded-3xl border border-white/70 bg-ink-900/95 p-4 text-white shadow-2xl lg:block"
      style={{ left, top }}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/55">
        {subtitle}
      </p>
      <p className="mt-2 text-xl font-bold tracking-tight">{title}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55">Sentiment</p>
          <p className="mt-1 text-sm font-semibold">{sentiment}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55">Move</p>
          <p className="mt-1 text-sm font-semibold">{changeLabel}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55">Heat</p>
          <p className="mt-1 text-sm font-semibold">{heatLabel}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/55">Volume</p>
          <p className="mt-1 text-sm font-semibold">{volumeLabel}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/78">{summary}</p>
    </div>
  );
}
