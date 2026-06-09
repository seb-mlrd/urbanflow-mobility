import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
  wrapperClassName?: string;
}

export function Input({ label, error, rightElement, wrapperClassName, ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName ?? ''}`}>
      <label className="text-sm text-gray-500">{label}</label>
      <div className={`flex items-center bg-gray-50 rounded-lg px-4 h-11 border ${error ? 'border-red-400' : 'border-gray-200'}`}>
        <input
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          {...props}
        />
        {rightElement}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
