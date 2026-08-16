import Link from 'next/link';
import type { ReactNode } from 'react';
import { colors, typography, borders } from '../../lib/tokens';
import { BrandLogo } from '../ui/BrandLogo';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: colors.surface }}>
      <nav
        className="flex items-center justify-between px-6 h-14 shrink-0"
        style={{ background: colors.surfaceContainer, borderBottom: borders.default }}
      >
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo height={18} />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150"
          style={{ color: colors.onSurfaceVariant, border: borders.default }}
        >
          Retour à l&apos;accueil
        </Link>
      </nav>

      <main id="main-content" className="flex flex-1 justify-center px-6 py-10 md:py-14">
        <div className="w-full max-w-2xl flex flex-col gap-8">
          <header className="flex flex-col gap-2">
            <h1 style={{ ...typography.headlineLgMobile, color: colors.onSurface }}>{title}</h1>
            <p style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>
              Dernière mise à jour : {lastUpdated}
            </p>
          </header>

          <div className="flex flex-col gap-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 style={{ ...typography.bodyMd, fontWeight: '700', color: colors.onSurface }}>{title}</h2>
      <div
        className="flex flex-col gap-3"
        style={{ ...typography.bodyMd, color: colors.onSurfaceVariant, lineHeight: '1.65rem' }}
      >
        {children}
      </div>
    </section>
  );
}
