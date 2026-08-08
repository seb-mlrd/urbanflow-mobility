import type { CSSProperties } from 'react';

/**
 * Tokens de design — source de vérité du design system Kinetic Logic.
 * Toutes les valeurs proviennent de docs/DESIGN.md.
 * Les couleurs renvoient vers les CSS custom properties définies dans globals.css.
 */

// ─── Couleurs ────────────────────────────────────────────────────────────────

export const colors = {
  // Surfaces
  surface: 'var(--color-surface)',
  surfaceDim: 'var(--color-surface-dim)',
  surfaceBright: 'var(--color-surface-bright)',
  surfaceContainerLowest: 'var(--color-surface-container-lowest)',
  surfaceContainerLow: 'var(--color-surface-container-low)',
  surfaceContainer: 'var(--color-surface-container)',
  surfaceContainerHigh: 'var(--color-surface-container-high)',
  surfaceContainerHighest: 'var(--color-surface-container-highest)',
  // Texte sur surfaces
  onSurface: 'var(--color-on-surface)',
  onSurfaceVariant: 'var(--color-on-surface-variant)',
  // Contours
  outline: 'var(--color-outline)',
  outlineVariant: 'var(--color-outline-variant)',
  // Primaire — teal
  primary: 'var(--color-primary)',
  onPrimary: 'var(--color-on-primary)',
  primaryContainer: 'var(--color-primary-container)',
  // Secondaire — violet
  secondary: 'var(--color-secondary)',
  onSecondary: 'var(--color-on-secondary)',
  secondaryContainer: 'var(--color-secondary-container)',
  onSecondaryContainer: 'var(--color-on-secondary-container)',
  // Erreur
  error: 'var(--color-error)',
  onError: 'var(--color-on-error)',
  errorContainer: 'var(--color-error-container)',
} as const;

// ─── Typographie ─────────────────────────────────────────────────────────────

export const typography = {
  /** 2.5rem (40px) / 700 / -0.02em — titres majeurs */
  headlineXl: {
    fontSize: '2.5rem',
    fontWeight: '700',
    lineHeight: '3rem',
    letterSpacing: '-0.02em',
  } satisfies CSSProperties,

  /** 2rem (32px) / 600 / -0.01em — titres de section desktop */
  headlineLg: {
    fontSize: '2rem',
    fontWeight: '600',
    lineHeight: '2.5rem',
    letterSpacing: '-0.01em',
  } satisfies CSSProperties,

  /** 1.75rem (28px) / 600 — titres de section mobile */
  headlineLgMobile: {
    fontSize: '1.75rem',
    fontWeight: '600',
    lineHeight: '2.25rem',
  } satisfies CSSProperties,

  /** 1rem (16px) / 400 — corps de texte principal */
  bodyMd: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5rem',
  } satisfies CSSProperties,

  /** 0.875rem (14px) / 400 — corps de texte secondaire */
  bodySm: {
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.25rem',
  } satisfies CSSProperties,

  /** 0.75rem (12px) / 600 / uppercase / +0.05em — labels et métadonnées */
  labelMd: {
    fontSize: '0.75rem',
    fontWeight: '600',
    lineHeight: '1rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  } satisfies CSSProperties,
} as const;

// ─── Bordures ─────────────────────────────────────────────────────────────────

export const borders = {
  default: `1px solid ${colors.outlineVariant}`,
  primary: `1px solid ${colors.primary}`,
  error: `1px solid ${colors.error}`,
  none: 'none',
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;

// ─── Espacement ───────────────────────────────────────────────────────────────

export const spacing = {
  unit: '4px',
  gutter: '16px',
  marginMobile: '16px',
  marginDesktop: '32px',
  containerMax: '1200px',
} as const;
