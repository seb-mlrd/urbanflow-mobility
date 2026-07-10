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

export function filterAndSortItineraries(
  result: JourneyResponse | null,
  profileModes: string[],
  selectedModes: string[],
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
    return allItineraries.filter((itin) => selectedOtpModes.has(itin.dominantMode));
  }

  return [
    ...allItineraries.filter((itin) => profileOtpModes.has(itin.dominantMode)),
    ...allItineraries.filter((itin) => !profileOtpModes.has(itin.dominantMode)),
  ];
}

export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}
