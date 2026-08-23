export const TRANSPORT_MODES = ['Vélo', 'Transports', 'Marche', 'Voiture'] as const;

export interface RouteDto {
  gtfsId: string;
  shortName: string;
  longName: string | null;
  mode: string | null;
  color: string | null;
}
