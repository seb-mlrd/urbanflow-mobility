import { InputHTMLAttributes, ReactNode } from 'react';
import { colors, typography } from '../../lib/tokens';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        className="mt-0.5 w-5 h-5 rounded cursor-pointer shrink-0"
        style={{ accentColor: colors.primary }}
        {...props}
      />
      <span style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>{label}</span>
    </label>
  );
}
