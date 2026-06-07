'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export function Header({ title, onBack }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        className="text-gray-800 text-xl leading-none"
        aria-label="Retour"
      >
        ←
      </button>
      <span className="text-base font-medium text-gray-900">{title}</span>
    </header>
  );
}
