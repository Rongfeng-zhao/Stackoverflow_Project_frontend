interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <section className="rounded-4xl border border-rose-100 bg-white p-8 shadow-card">
      <div className="w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
        Error state
      </div>
      <h2 className="mt-4 font-display text-3xl font-semibold text-ink-900">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-ink-900 px-5 text-sm font-semibold text-white transition hover:bg-ink-700"
        >
          Try again
        </button>
      ) : null}
    </section>
  );
}
