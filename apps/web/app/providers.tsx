'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useInstallPromptStore,
  type BeforeInstallPromptEvent,
} from '../store/useInstallPromptStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const setDeferredPrompt = useInstallPromptStore((s) => s.setDeferredPrompt);
  const clearDeferredPrompt = useInstallPromptStore((s) => s.clearDeferredPrompt);
  const setInstalled = useInstallPromptStore((s) => s.setInstalled);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) setInstalled(true);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setInstalled(true);
      clearDeferredPrompt();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, clearDeferredPrompt, setInstalled]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
