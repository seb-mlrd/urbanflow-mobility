import polyline from '@mapbox/polyline';
import type { Itinerary, JourneyResponse, Leg } from './journey-types';
import type { GeoPosition } from './geo-distance';

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

export function getItineraryRouteCoordinates(itinerary: Itinerary | null | undefined): GeoPosition[] {
  if (!itinerary) return [];

  return itinerary.legs
    .filter((leg): leg is Leg & { legGeometry: { points: string } } => Boolean(leg.legGeometry?.points))
    .flatMap((leg) => polyline.decode(leg.legGeometry.points) as [number, number][])
    .map(([lat, lng]) => ({ lat, lng }));
}

export interface ItineraryEndpoints {
  departure: GeoPosition | null;
  arrival: GeoPosition | null;
}

export function getItineraryEndpoints(itinerary: Itinerary | null | undefined): ItineraryEndpoints {
  if (!itinerary) return { departure: null, arrival: null };

  const positions = itinerary.legs
    .filter((leg): leg is Leg & { legGeometry: { points: string } } => Boolean(leg.legGeometry?.points))
    .flatMap((leg) => polyline.decode(leg.legGeometry.points) as [number, number][]);

  if (positions.length === 0) return { departure: null, arrival: null };

  const [depLat, depLng] = positions[0];
  const [arrLat, arrLng] = positions[positions.length - 1];

  return {
    departure: { lat: depLat, lng: depLng },
    arrival: { lat: arrLat, lng: arrLng },
  };
}

export interface JourneyHistoryPayload {
  dominantMode: string;
  distanceMeters: number;
  durationSeconds: number;
  co2Grams: number;
  fromLabel: string;
  toLabel: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  departureAt: number;
  arrivalAt: number;
}

export function buildJourneyHistoryPayload(params: {
  itinerary: Itinerary;
  fromLabel: string;
  toLabel: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  departureAt: number;
  arrivalAt: number;
}): JourneyHistoryPayload {
  const { itinerary, ...rest } = params;
  return {
    dominantMode: getActualDominantMode(itinerary.legs),
    distanceMeters: itinerary.legs.reduce((sum, leg) => sum + leg.distance, 0),
    durationSeconds: Math.round(itinerary.duration),
    co2Grams: itinerary.co2Grams,
    ...rest,
  };
}
