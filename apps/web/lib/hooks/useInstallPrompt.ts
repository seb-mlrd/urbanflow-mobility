'use client';

import { useCallback, useState } from 'react';
import { useInstallPromptStore } from '../../store/useInstallPromptStore';
import { getDismissedAt, setDismissed, shouldShowBanner } from '../pwaInstallDismiss';

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export interface UseInstallPromptResult {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptResult {
  const deferredPrompt = useInstallPromptStore((s) => s.deferredPrompt);
  const isInstallable = useInstallPromptStore((s) => s.isInstallable);
  const isInstalled = useInstallPromptStore((s) => s.isInstalled);
  const clearDeferredPrompt = useInstallPromptStore((s) => s.clearDeferredPrompt);
  const [isDismissed, setIsDismissed] = useState(() => !shouldShowBanner(getDismissedAt()));

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    clearDeferredPrompt();
  }, [deferredPrompt, clearDeferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed();
    setIsDismissed(true);
  }, []);

  return {
    canInstall: isInstallable,
    isInstalled,
    isIOS: isIOSDevice(),
    isDismissed,
    promptInstall,
    dismiss,
  };
}
