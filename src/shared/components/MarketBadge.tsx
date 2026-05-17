interface MarketBadgeProps {
  label: string;
}

export function MarketBadge({ label }: MarketBadgeProps) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-ocean-100 bg-ocean-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-ocean-700">
      {label}
    </span>
  );
}
