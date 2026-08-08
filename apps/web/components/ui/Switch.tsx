interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative w-11 h-6 rounded-full shrink-0 transition-colors duration-150"
      style={{
        background: checked ? 'var(--color-primary)' : 'var(--color-surface-container-highest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-transform duration-150"
        style={{
          left: '2px',
          width: '18px',
          height: '18px',
          background: checked ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}
