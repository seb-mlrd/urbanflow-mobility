import { InputHTMLAttributes, ReactNode, useId } from 'react';
import { colors, typography, borders, radius } from '../../lib/tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  rightElement,
  wrapperClassName,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName ?? ''}`}>
      <label
        htmlFor={inputId}
        style={{ ...typography.labelMd, color: colors.onSurfaceVariant }}
      >
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
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="flex-1 bg-transparent outline-none placeholder:opacity-40"
          style={{ ...typography.bodySm, color: colors.onSurface }}
          {...props}
        />
        {rightElement}
      </div>
      {error && (
        <p
          id={errorId}
          style={{
            ...typography.labelMd,
            color: colors.error,
            textTransform: 'none',
            letterSpacing: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
