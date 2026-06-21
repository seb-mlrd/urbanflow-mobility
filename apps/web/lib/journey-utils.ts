export const TRANSIT_MODES = new Set(['SUBWAY', 'TRAM', 'RAIL', 'BUS']);

export function getActualDominantMode(legs: { mode: string }[]): string {
  if (legs.some((l) => TRANSIT_MODES.has(l.mode))) return 'TRANSIT';
  if (legs.some((l) => l.mode === 'CAR')) return 'CAR';
  if (legs.some((l) => l.mode === 'BICYCLE')) return 'BICYCLE';
  return 'WALK';
}

export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}
