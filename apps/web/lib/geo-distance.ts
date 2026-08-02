export interface GeoPosition {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_METERS = 6371000;

export function haversineDistanceMeters(a: GeoPosition, b: GeoPosition): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_METERS * c;
}

export const ARRIVAL_THRESHOLD_METERS = 40;

export function hasArrived(
  current: GeoPosition,
  target: GeoPosition,
  thresholdMeters: number = ARRIVAL_THRESHOLD_METERS,
): boolean {
  return haversineDistanceMeters(current, target) <= thresholdMeters;
}

export function routeTotalDistanceMeters(route: GeoPosition[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineDistanceMeters(route[i - 1], route[i]);
  }
  return total;
}

/**
 * Interpole la position atteinte après avoir parcouru `distanceMeters` le long
 * d'un tracé (segments consécutifs). Fige sur le dernier point au-delà de la
 * distance totale, et sur le premier point si `distanceMeters` <= 0.
 */
export function positionAlongRoute(route: GeoPosition[], distanceMeters: number): GeoPosition | null {
  if (route.length === 0) return null;
  if (route.length === 1 || distanceMeters <= 0) return route[0];

  let remaining = distanceMeters;
  for (let i = 1; i < route.length; i++) {
    const segmentStart = route[i - 1];
    const segmentEnd = route[i];
    const segmentLength = haversineDistanceMeters(segmentStart, segmentEnd);

    if (remaining <= segmentLength) {
      if (segmentLength === 0) return segmentStart;
      const ratio = remaining / segmentLength;
      return {
        lat: segmentStart.lat + (segmentEnd.lat - segmentStart.lat) * ratio,
        lng: segmentStart.lng + (segmentEnd.lng - segmentStart.lng) * ratio,
      };
    }

    remaining -= segmentLength;
  }

  return route[route.length - 1];
}
