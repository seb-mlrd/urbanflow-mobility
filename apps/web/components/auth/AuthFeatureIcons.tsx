const size = 16;
const common = {
  width: size,
  height: size,
  viewBox: '0 0 20 20',
  fill: 'none' as const,
  'aria-hidden': true,
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function RouteIcon() {
  return (
    <svg {...common}>
      <circle cx="5" cy="15" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M6 14c1.5-1 4-2 5-4s3-3 4-4" />
    </svg>
  );
}

export function LeafIcon() {
  return (
    <svg {...common}>
      <path d="M4 16C4 9 9 4 16 4c0 7-5 12-12 12Z" />
      <path d="M4.5 15.5 13 7" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg {...common}>
      <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6ZM8.5 16.5a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

export function DashboardIcon() {
  return (
    <svg {...common}>
      <path d="M4.5 16V10M10 16V4M15.5 16V12" />
    </svg>
  );
}

export function HistoryIcon() {
  return (
    <svg {...common}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.5V10l2.5 1.5" />
    </svg>
  );
}
