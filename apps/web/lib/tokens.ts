import type { CSSProperties } from 'react';

/**
 * Tokens de design — source de vérité du design system Kinetic Logic.
 * Toutes les valeurs proviennent de docs/DESIGN.md.
 * Les couleurs renvoient vers les CSS custom properties définies dans globals.css.
 */

// ─── Couleurs ────────────────────────────────────────────────────────────────

export const colors = {
  // Surfaces
  surface:                   'var(--color-surface)',
  surfaceDim:                'var(--color-surface-dim)',
  surfaceBright:             'var(--color-surface-bright)',
  surfaceContainerLowest:    'var(--color-surface-container-lowest)',
  surfaceContainerLow:       'var(--color-surface-container-low)',
  surfaceContainer:          'var(--color-surface-container)',
  surfaceContainerHigh:      'var(--color-surface-container-high)',
  surfaceContainerHighest:   'var(--color-surface-container-highest)',
  // Texte sur surfaces
  onSurface:                 'var(--color-on-surface)',
  onSurfaceVariant:          'var(--color-on-surface-variant)',
  // Contours
  outline:                   'var(--color-outline)',
  outlineVariant:            'var(--color-outline-variant)',
  // Primaire — teal
  primary:                   'var(--color-primary)',
  onPrimary:                 'var(--color-on-primary)',
  primaryContainer:          'var(--color-primary-container)',
  // Secondaire — violet
  secondary:                 'var(--color-secondary)',
  onSecondary:               'var(--color-on-secondary)',
  secondaryContainer:        'var(--color-secondary-container)',
  onSecondaryContainer:      'var(--color-on-secondary-container)',
  // Erreur
  error:                     'var(--color-error)',
  onError:                   'var(--color-on-error)',
  errorContainer:            'var(--color-error-container)',
} as const;

// ─── Typographie ─────────────────────────────────────────────────────────────

export const typography = {
  /** 40px / 700 / -0.02em — titres majeurs */
  headlineXl: {
    fontSize: '40px',
    fontWeight: '700',
    lineHeight: '48px',
    letterSpacing: '-0.02em',
  } satisfies CSSProperties,

  /** 32px / 600 / -0.01em — titres de section desktop */
  headlineLg: {
    fontSize: '32px',
    fontWeight: '600',
    lineHeight: '40px',
    letterSpacing: '-0.01em',
  } satisfies CSSProperties,

  /** 28px / 600 — titres de section mobile */
  headlineLgMobile: {
    fontSize: '28px',
    fontWeight: '600',
    lineHeight: '36px',
  } satisfies CSSProperties,

  /** 16px / 400 — corps de texte principal */
  bodyMd: {
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
  } satisfies CSSProperties,

  /** 14px / 400 — corps de texte secondaire */
  bodySm: {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
  } satisfies CSSProperties,

  /** 12px / 600 / uppercase / +0.05em — labels et métadonnées */
  labelMd: {
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '16px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  } satisfies CSSProperties,
} as const;

// ─── Bordures ─────────────────────────────────────────────────────────────────

export const borders = {
  default:  `1px solid ${colors.outlineVariant}`,
  primary:  `1px solid ${colors.primary}`,
  error:    `1px solid ${colors.error}`,
  none:     'none',
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:      '0.125rem',
  DEFAULT: '0.25rem',
  md:      '0.375rem',
  lg:      '0.5rem',
  xl:      '0.75rem',
  full:    '9999px',
} as const;

// ─── Espacement ───────────────────────────────────────────────────────────────

export const spacing = {
  unit:            '4px',
  gutter:          '16px',
  marginMobile:    '16px',
  marginDesktop:   '32px',
  containerMax:    '1200px',
} as const;
