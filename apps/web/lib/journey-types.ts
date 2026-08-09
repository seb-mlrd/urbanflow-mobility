export interface Leg {
  mode: string;
  startTime: number;
  endTime: number;
  distance: number;
  from: { name: string };
  to: { name: string };
  route: { shortName: string; longName: string } | null;
  legGeometry: { points: string } | null;
}

export interface Itinerary {
  duration: number;
  startTime: number;
  endTime: number;
  dominantMode: string;
  co2Grams: number;
  legs: Leg[];
}

export interface JourneyResponse {
  itineraries: Itinerary[];
}

export interface JourneyHistoryRecord {
  id: string;
  dominantMode: string;
  distanceMeters: number;
  durationSeconds: number;
  co2Grams: number;
  fromLabel: string;
  toLabel: string;
  departureAt: string;
  arrivalAt: string;
}

export interface JourneyMonthlyStats {
  co2GramsThisMonth: number;
  tripsThisMonth: number;
  distanceMetersThisMonth: number;
  durationSecondsThisMonth: number;
}

export interface MonthlyCo2Point {
  month: string;
  co2Grams: number;
}
