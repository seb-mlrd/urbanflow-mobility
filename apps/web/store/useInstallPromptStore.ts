import { create } from 'zustand';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isInstalled: boolean;
  setDeferredPrompt: (event: BeforeInstallPromptEvent) => void;
  clearDeferredPrompt: () => void;
  setInstalled: (installed: boolean) => void;
}

export const useInstallPromptStore = create<InstallPromptState>()((set) => ({
  deferredPrompt: null,
  isInstallable: false,
  isInstalled: false,
  setDeferredPrompt: (event) => set({ deferredPrompt: event, isInstallable: true }),
  clearDeferredPrompt: () => set({ deferredPrompt: null, isInstallable: false }),
  setInstalled: (installed) => set({ isInstalled: installed }),
}));
