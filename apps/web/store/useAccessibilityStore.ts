import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';
export type TextScale = 'small' | 'medium' | 'large';

interface AccessibilityState {
  theme: Theme;
  textScale: TextScale;
  highContrast: boolean;
  reducedMotion: boolean;
  setTheme: (theme: Theme) => void;
  setTextScale: (scale: TextScale) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      theme: 'dark',
      textScale: 'medium',
      highContrast: false,
      reducedMotion: false,
      setTheme: (theme) => set({ theme }),
      setTextScale: (textScale) => set({ textScale }),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
    }),
    {
      name: 'urbanflow-accessibility',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
