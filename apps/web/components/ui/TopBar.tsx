'use client';

import { useRouter } from 'next/navigation';
import { colors, borders, radius } from '../../lib/tokens';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { BrandLogo } from './BrandLogo';

interface TopBarProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

export function TopBar({ onMenuToggle, sidebarOpen }: TopBarProps) {
  const router = useRouter();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  return (
    <header
      className="flex items-center justify-between px-4 h-14 shrink-0"
      style={{ background: colors.surfaceContainer, borderBottom: borders.default }}
    >
      <div className="flex items-center gap-3">
        {/* Burger — visible uniquement sur tablet/desktop */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={sidebarOpen}
          className="hidden md:flex w-10 h-10 items-center justify-center cursor-pointer transition-colors duration-150"
          style={{ color: colors.onSurfaceVariant, borderRadius: radius.lg }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <BrandLogo height={28} />
      </div>

      <button
        type="button"
        onClick={() => router.push('/notifications')}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
            : 'Notifications'
        }
        className="relative w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-150"
        style={{ color: colors.onSurfaceVariant, borderRadius: radius.lg }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6ZM8.5 16.5a1.5 1.5 0 0 0 3 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[10px] font-semibold leading-none"
            style={{ background: colors.error, color: colors.onError }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
