'use client';

import { usePathname } from 'next/navigation';
import { useInstallPrompt } from '../lib/hooks/useInstallPrompt';

const HIDDEN_PATHS = ['/login', '/register'];

export function InstallPwaPrompt() {
  const pathname = usePathname();
  const { canInstall, isInstalled, isIOS, isDismissed, promptInstall, dismiss } =
    useInstallPrompt();

  const isHiddenRoute = HIDDEN_PATHS.some((path) => pathname?.startsWith(path));
  const isEligible = canInstall || isIOS;

  if (isHiddenRoute || isInstalled || isDismissed || !isEligible) return null;

  return (
    <div
      role="region"
      aria-label="Installer l'application"
      className="fixed inset-x-0 bottom-16 md:bottom-0 px-4 pb-3 md:pb-4"
      style={{ zIndex: 1100 }}
    >
      <div
        className="mx-auto max-w-xl flex items-center gap-3 rounded-xl px-4 py-3"
        style={{
          background: 'var(--color-surface-container)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}
      >
        <span
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'var(--color-surface-container-high)',
            color: 'var(--color-primary)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect
              x="4"
              y="2"
              width="12"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M8 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
            Installer UrbanFlow
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
            {isIOS && !canInstall
              ? "Appuyez sur Partager puis « Sur l'écran d'accueil »"
              : 'Accédez plus rapidement à vos trajets'}
          </p>
        </div>
        {canInstall && (
          <button
            type="button"
            onClick={promptInstall}
            className="text-sm font-medium px-4 py-2 rounded-lg min-h-[36px] shrink-0"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Installer
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
