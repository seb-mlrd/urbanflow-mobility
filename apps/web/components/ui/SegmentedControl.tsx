interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  groupLabel: string;
}

export function SegmentedControl({ options, value, onChange, groupLabel }: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="inline-flex rounded-lg p-0.5 gap-0.5"
      style={{ background: 'var(--color-surface-container-highest)' }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
            style={
              active
                ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                : { background: 'transparent', color: 'var(--color-on-surface-variant)' }
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
