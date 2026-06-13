'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors, borders, radius, typography } from '../../lib/tokens';

const NAV_ITEMS = [
  {
    label: 'Recherche',
    href: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 13l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Activité',
    href: '/activite',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M2 12l4-5 3 3 3-4 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Profil',
    href: '/profil',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Navigation principale"
      className="hidden md:flex flex-col w-56 shrink-0 py-4"
      style={{ background: colors.surfaceContainerLow, borderRight: borders.default }}
    >
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = href === '/' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="flex items-center gap-3 px-3 py-3 min-h-[44px] transition-colors duration-150"
              style={{
                ...typography.bodySm,
                fontWeight: '500',
                borderRadius: radius.lg,
                ...(active
                  ? { background: colors.secondaryContainer, color: colors.onSecondaryContainer }
                  : { color: colors.onSurfaceVariant }),
              }}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
