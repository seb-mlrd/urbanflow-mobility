'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors, borders, radius, typography } from '../../lib/tokens';
import { useAuthStore } from '../../store/useAuthStore';

const HOME_ITEM = {
  label: 'Itinéraire',
  href: '/',
  icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 16V9a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="4" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="15" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

const AUTHENTICATED_ITEMS = [
  {
    label: 'Activité',
    href: '/activite',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M2 13l4-5.5 3.5 3.5 3.5-5 4 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Planification',
    href: '/planification',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Profil',
    href: '/profil',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3.5 17c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const GUEST_ITEMS = [
  {
    label: 'Connexion',
    href: '/login',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M11 7l3 3-3 3M14 10H7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Inscription',
    href: '/register',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2.5 17c0-3.038 2.462-5.5 5.5-5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15 8v5M12.5 10.5h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const navItems = [HOME_ITEM, ...(accessToken ? AUTHENTICATED_ITEMS : GUEST_ITEMS)];

  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 inset-x-0 flex items-center justify-around px-4 h-16 z-10"
      style={{ background: colors.surfaceContainerLowest, borderTop: borders.default }}
    >
      {navItems.map(({ label, href, icon }) => {
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
