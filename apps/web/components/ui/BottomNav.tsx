'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors, borders, radius, typography } from '../../lib/tokens';

const NAV_ITEMS = [
  {
    label: 'Recherche',
    href: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Activité',
    href: '/activite',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2 13l4-5.5 3.5 3.5 3.5-5 4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Profil',
    href: '/profil',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 17c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 inset-x-0 flex items-center justify-around px-4 h-16 z-10"
      style={{ background: colors.surfaceContainerLowest, borderTop: borders.default }}
    >
      {NAV_ITEMS.map(({ label, href, icon }) => {
        const active = href === '/' ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className="flex flex-col items-center gap-1 min-w-[64px] py-1 transition-colors duration-150"
            style={{
              ...typography.labelMd,
              textTransform: 'none',
              letterSpacing: 0,
              color: active ? colors.onSecondaryContainer : colors.onSurfaceVariant,
            }}
          >
            <span
              className="flex items-center justify-center w-14 h-8 transition-colors duration-150"
              style={{
                borderRadius: radius.full,
                background: active ? colors.secondaryContainer : 'transparent',
              }}
            >
              {icon}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
