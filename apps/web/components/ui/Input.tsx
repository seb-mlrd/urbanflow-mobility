import { InputHTMLAttributes, ReactNode } from 'react';
import { colors, typography, borders, radius } from '../../lib/tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
  wrapperClassName?: string;
}

export function Input({ label, error, rightElement, wrapperClassName, ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName ?? ''}`}>
      <label style={{ ...typography.labelMd, color: colors.onSurfaceVariant }}>
        {label}
      </label>
      <div
        className="flex items-center px-4 h-12 transition-colors duration-150"
        style={{
          background: colors.surfaceContainerHigh,
          border: error ? borders.error : borders.default,
          borderRadius: radius.lg,
        }}
      >
        <input
          className="flex-1 bg-transparent outline-none placeholder:opacity-40"
          style={{ ...typography.bodySm, color: colors.onSurface }}
          {...props}
        />
        {rightElement}
      </div>
      {error && (
        <p style={{ ...typography.labelMd, color: colors.error, textTransform: 'none', letterSpacing: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
