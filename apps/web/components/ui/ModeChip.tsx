'use client';

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
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
        selected
          ? 'border-gray-900 bg-gray-100 text-gray-900 font-medium'
          : 'border-gray-300 bg-white text-gray-500'
      }`}
    >
      <span className={`w-4 h-4 rounded-sm border ${selected ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-gray-200'}`} />
      {label}
    </button>
  );
}
