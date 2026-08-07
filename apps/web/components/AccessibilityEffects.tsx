'use client';

import { useEffect } from 'react';
import { useAccessibilityStore } from '../store/useAccessibilityStore';

const THEME_COLOR = { dark: '#0f172a', light: '#fafaf9' };

export function AccessibilityEffects() {
  const theme = useAccessibilityStore((s) => s.theme);
  const textScale = useAccessibilityStore((s) => s.textScale);
  const highContrast = useAccessibilityStore((s) => s.highContrast);
  const reducedMotion = useAccessibilityStore((s) => s.reducedMotion);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.textScale = textScale;
    if (highContrast) {
      root.dataset.contrast = 'high';
    } else {
      delete root.dataset.contrast;
    }
    if (reducedMotion) {
      root.dataset.reducedMotion = 'true';
    } else {
      delete root.dataset.reducedMotion;
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme, textScale, highContrast, reducedMotion]);

  return null;
}
