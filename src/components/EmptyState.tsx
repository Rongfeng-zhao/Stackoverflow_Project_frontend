export function EmptyState() {
  return (
    <section className="rounded-4xl border border-dashed border-ink-300 bg-white/60 p-10 text-center shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink-500">
        Ready to analyze
      </p>
      <h2 className="mt-4 font-display text-3xl font-semibold text-ink-900">
        Search an ASX-listed company to start analysis
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-ink-500">
        Start with a ticker like BHP, CBA, CSL, or WES to view stock basics, daily price history,
        sentiment aggregation, and related news in one focused result page.
      </p>
    </section>
  );
}
