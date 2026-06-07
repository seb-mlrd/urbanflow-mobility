import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({ children, loading, disabled, className, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className="w-full h-14 bg-gray-900 text-white text-base font-semibold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
      {...props}
    >
      {loading ? 'Chargement…' : children}
    </button>
  );
}
