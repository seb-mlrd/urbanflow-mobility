export const OTP_MODE_LINE_COLORS: Record<string, string> = {
  WALK: '#9AA0A6',
  BICYCLE: '#22C55E',
  CAR: '#F97316',
  BUS: '#3B82F6',
  TRANSIT: '#3B82F6',
  SUBWAY: '#8B5CF6',
  TRAM: '#8B5CF6',
  RAIL: '#6366F1',
};

export const DEFAULT_LINE_COLOR = '#6B7280';

export function getModeLineColor(mode: string): string {
  return OTP_MODE_LINE_COLORS[mode] ?? DEFAULT_LINE_COLOR;
}

export function getModeLineStyle(mode: string): {
  color: string;
  dashArray?: string;
  weight: number;
} {
  const color = getModeLineColor(mode);
  return mode === 'WALK' ? { color, dashArray: '4 8', weight: 4 } : { color, weight: 5 };
}
