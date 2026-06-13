export const TRANSPORT_MODES = ['Vélo', 'Trottinette', 'Transports', 'Marche', 'Voiture'] as const;

export type TransportMode = typeof TRANSPORT_MODES[number];
