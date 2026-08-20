export const TRANSPORT_MODES = ['Vélo', 'Transports', 'Marche', 'Voiture'] as const;

export type TransportMode = (typeof TRANSPORT_MODES)[number];

export interface RouteDto {
  gtfsId: string;
  shortName: string;
  longName: string | null;
  mode: string | null;
  color: string | null;
}

export const OTP_MODE_LABELS: Record<string, string> = {
  WALK: 'Marche',
  BUS: 'Bus',
  SUBWAY: 'Métro',
  TRAM: 'Tram',
  RAIL: 'Train',
  BICYCLE: 'Vélo',
  CAR: 'Voiture',
  TRANSIT: 'Transports',
};
