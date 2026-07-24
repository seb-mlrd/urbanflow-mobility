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
