import type { Itinerary, JourneyResponse } from './journey-types';

export const TRANSIT_MODES = new Set(['SUBWAY', 'TRAM', 'RAIL', 'BUS']);

export const PROFILE_TO_OTP: Record<string, string> = {
  Vélo: 'BICYCLE',
  Transports: 'TRANSIT',
  Marche: 'WALK',
  Voiture: 'CAR',
};

export function getActualDominantMode(legs: { mode: string }[]): string {
  if (legs.some((l) => TRANSIT_MODES.has(l.mode))) return 'TRANSIT';
  if (legs.some((l) => l.mode === 'CAR')) return 'CAR';
  if (legs.some((l) => l.mode === 'BICYCLE')) return 'BICYCLE';
  return 'WALK';
}

export type SortBy = 'duration' | 'co2' | 'price';

function sortItineraries<T extends { duration: number; co2Grams: number }>(
  itineraries: T[],
  sortBy: SortBy,
): T[] {
  if (sortBy === 'co2') return [...itineraries].sort((a, b) => a.co2Grams - b.co2Grams);
  return [...itineraries].sort((a, b) => a.duration - b.duration);
}

export function filterAndSortItineraries(
  result: JourneyResponse | null,
  profileModes: string[],
  selectedModes: string[],
  sortBy: SortBy = 'duration',
): (Itinerary & { dominantMode: string; isProfileMatch: boolean })[] {
  if (!result) return [];

  const profileOtpModes = new Set(profileModes.map((m) => PROFILE_TO_OTP[m]).filter(Boolean));

  const selectedOtpModes = new Set(selectedModes.map((m) => PROFILE_TO_OTP[m]).filter(Boolean));

  const allItineraries = result.itineraries.map((itin) => {
    const dominantMode = getActualDominantMode(itin.legs);
    return {
      ...itin,
      dominantMode,
      isProfileMatch: selectedOtpModes.size === 0 && profileOtpModes.has(dominantMode),
    };
  });

  if (selectedOtpModes.size > 0) {
    return sortItineraries(
      allItineraries.filter((itin) => selectedOtpModes.has(itin.dominantMode)),
      sortBy,
    );
  }

  return [
    ...sortItineraries(
      allItineraries.filter((itin) => profileOtpModes.has(itin.dominantMode)),
      sortBy,
    ),
    ...sortItineraries(
      allItineraries.filter((itin) => !profileOtpModes.has(itin.dominantMode)),
      sortBy,
    ),
  ];
}

export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

export function formatCo2(grams: number): string {
  if (grams < 1000) return `${Math.round(grams)} g CO2`;
  return `${(grams / 1000).toFixed(1)} kg CO2`;
}
