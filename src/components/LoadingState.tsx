export function LoadingState() {
  return (
    <section className="space-y-6 animate-pulse">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid gap-6">
          <div className="h-64 rounded-4xl border border-white/70 bg-white/80 shadow-card" />
          <div className="h-64 rounded-4xl border border-white/70 bg-white/80 shadow-card" />
        </div>
        <div className="h-full min-h-[22rem] rounded-4xl border border-white/70 bg-white/80 shadow-card" />
      </div>
      <div className="h-[24rem] rounded-4xl border border-white/70 bg-white/80 shadow-card" />
    </section>
  );
}
