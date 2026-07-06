export interface BikeStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  bikesAvailable: number;
  docksAvailable: number;
  isRenting: boolean;
  isReturning: boolean;
  lastReported: number;
}

export interface Scooter {
  id: string;
  lat: number;
  lon: number;
  rangeMeters: number;
  isDisabled: boolean;
  isReserved: boolean;
  lastReported: number;
}

export interface MobilitySnapshot<T> {
  vehicles: T[];
  lastUpdated: number;
  fetchedAt: number;
}
