interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  subtitle: string;
  accent?: boolean;
}

export function StatCard({ icon, label, value, unit, subtitle, accent }: StatCardProps) {
  return (
    <section
      aria-labelledby={`stat-${label}`}
      className="rounded-xl p-4"
      style={{ background: 'var(--color-surface-container)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: accent ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>
          {icon}
        </span>
        <h2
          id={`stat-${label}`}
          className="text-xs font-semibold uppercase tracking-widest"
          style={{
            color: accent ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </h2>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-on-surface)' }}>
        {value} {unit && <span className="text-xl font-semibold">{unit}</span>}
      </p>
      <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
        {subtitle}
      </p>
    </section>
  );
}
