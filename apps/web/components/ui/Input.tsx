import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
}

export function Input({ label, error, rightElement, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-500">{label}</label>
      <div className={`flex items-center bg-gray-100 rounded-xl px-4 h-14 border ${error ? 'border-red-400' : 'border-transparent'}`}>
        <input
          className="flex-1 bg-transparent text-base text-gray-800 placeholder:text-gray-400 outline-none"
          {...props}
        />
        {rightElement}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
