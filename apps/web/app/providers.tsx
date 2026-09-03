'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useInstallPromptStore,
  type BeforeInstallPromptEvent,
} from '../store/useInstallPromptStore';

declare global {
  interface Window {
    __pwaInstall?: {
      deferredPrompt: BeforeInstallPromptEvent | null;
      installed: boolean;
    };
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const setDeferredPrompt = useInstallPromptStore((s) => s.setDeferredPrompt);
  const clearDeferredPrompt = useInstallPromptStore((s) => s.clearDeferredPrompt);
  const setInstalled = useInstallPromptStore((s) => s.setInstalled);

  useEffect(() => {
    const sync = () => {
      const state = window.__pwaInstall;
      if (!state) return;
      if (state.installed) {
        setInstalled(true);
        clearDeferredPrompt();
      } else if (state.deferredPrompt) {
        setDeferredPrompt(state.deferredPrompt);
      }
    };

    // Le script `pwa-install-capture` (chargé en beforeInteractive dans le
    // layout) écoute `beforeinstallprompt` avant même l'hydratation de React :
    // Chrome peut émettre cet évènement avant que ce useEffect ne s'exécute,
    // et un listener posé ici seul le raterait définitivement pour la session.
    sync();
    window.addEventListener('pwa-install-update', sync);
    return () => window.removeEventListener('pwa-install-update', sync);
  }, [setDeferredPrompt, clearDeferredPrompt, setInstalled]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
