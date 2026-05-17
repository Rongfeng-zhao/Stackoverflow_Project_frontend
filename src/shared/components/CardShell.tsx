import type { ReactNode } from 'react';

interface CardShellProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

export function CardShell({ title, subtitle, className = '', children }: CardShellProps) {
  return (
    <section
      className={`rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card backdrop-blur ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
