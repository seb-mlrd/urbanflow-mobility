'use client';

import { colors, typography, borders, radius } from '../../lib/tokens';

interface ModeChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function ModeChip({ label, selected, onToggle }: ModeChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 transition-colors duration-150"
      style={{
        ...typography.bodySm,
        fontWeight: '500',
        borderRadius: radius.full,
        ...(selected
          ? { background: colors.secondaryContainer, color: colors.onSecondaryContainer, border: borders.none }
          : { background: 'transparent', color: colors.onSurfaceVariant, border: borders.default }),
      }}
    >
      <span
        className="w-4 h-4 shrink-0"
        style={{
          borderRadius: radius.sm,
          ...(selected
            ? { background: colors.secondary, opacity: 0.8 }
            : { background: colors.surfaceContainerHigh, border: borders.default }),
        }}
      />
      {label}
    </button>
  );
}
