import { InputHTMLAttributes, ReactNode } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        className="mt-0.5 w-5 h-5 rounded accent-gray-900 cursor-pointer shrink-0"
        {...props}
      />
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  );
}
