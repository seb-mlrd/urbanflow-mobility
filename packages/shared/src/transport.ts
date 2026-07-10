export const TRANSPORT_MODES = ['Vélo', 'Trottinette', 'Transports', 'Marche', 'Voiture'] as const;

export type TransportMode = (typeof TRANSPORT_MODES)[number];

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
