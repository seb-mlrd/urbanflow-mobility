import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <nav
        className="flex items-center justify-between px-6 h-14 shrink-0"
        style={{ background: 'var(--color-surface-container)', borderBottom: '1px solid var(--color-outline-variant)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ color: 'var(--color-primary)' }}>
            <path d="M13 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0ZM6.5 8.5l2-3 1.5 2 1-1.5 3 4H5l1.5-2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 12v5M8 17h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>UrbanFlow</span>
        </div>
        <Link
          href="/"
          className="text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150"
          style={{ color: 'var(--color-on-surface-variant)', border: '1px solid var(--color-outline-variant)' }}
        >
          Retour à l&apos;accueil
        </Link>
      </nav>
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
