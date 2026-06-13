import { ButtonHTMLAttributes } from 'react';
import { colors, typography, radius } from '../../lib/tokens';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'outline';
}

export function Button({ children, loading, disabled, variant = 'primary', style, ...props }: ButtonProps) {
  const variantStyle =
    variant === 'outline'
      ? { border: `1px solid ${colors.primary}`, color: colors.primary, background: 'transparent' }
      : { background: colors.primary, color: colors.onPrimary };

  return (
    <button
      disabled={disabled || loading}
      className="w-full h-14 active:scale-[0.98] transition-transform disabled:opacity-50"
      style={{ ...typography.bodyMd, fontWeight: '600', borderRadius: radius.xl, ...variantStyle, ...style }}
      {...props}
    >
      {loading ? 'Chargement…' : children}
    </button>
  );
}
