import Link from 'next/link';
import type { ReactNode } from 'react';
import { colors, typography, radius, borders } from '../../lib/tokens';
import { BrandLogo } from '../ui/BrandLogo';

interface StatusAction {
  href: string;
  label: string;
}

interface StatusPageProps {
  code: string;
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction: StatusAction;
  secondaryAction?: StatusAction;
}

export function StatusPage({
  code,
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: StatusPageProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: colors.surface }}>
      <nav
        className="flex items-center px-6 h-14 shrink-0"
        style={{ background: colors.surfaceContainer, borderBottom: borders.default }}
      >
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo height={18} />
        </Link>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-16 gap-6">
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-20 h-20"
          style={{
            borderRadius: radius.full,
            background: colors.surfaceContainerHigh,
            color: colors.onSurfaceVariant,
          }}
        >
          {icon}
        </span>

        <div className="flex flex-col gap-2 max-w-md">
          <span style={{ ...typography.labelMd, color: colors.primary }}>Erreur {code}</span>
          <h1 style={{ ...typography.headlineLgMobile, color: colors.onSurface }}>{title}</h1>
          <p style={{ ...typography.bodyMd, color: colors.onSurfaceVariant }}>{description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-xs sm:max-w-none sm:w-auto">
          <Link
            href={primaryAction.href}
            className="flex items-center justify-center px-6 h-12 min-h-[44px] transition-colors duration-150"
            style={{
              ...typography.bodyMd,
              fontWeight: '600',
              borderRadius: radius.xl,
              background: colors.primary,
              color: colors.onPrimary,
            }}
          >
            {primaryAction.label}
          </Link>
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="flex items-center justify-center px-6 h-12 min-h-[44px] transition-colors duration-150"
              style={{
                ...typography.bodyMd,
                fontWeight: '600',
                borderRadius: radius.xl,
                border: `1px solid ${colors.outlineVariant}`,
                color: colors.onSurfaceVariant,
              }}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
