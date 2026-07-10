import { Bike, Bus, Car, Footprints, Train, TrainFront, Zap } from 'lucide-react';

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

export const OTP_MODE_ICONS: Record<string, React.ReactNode> = {
  WALK: <Footprints size={14} aria-hidden="true" />,
  BUS: <Bus size={14} aria-hidden="true" />,
  SUBWAY: <Train size={14} aria-hidden="true" />,
  TRAM: <TrainFront size={14} aria-hidden="true" />,
  RAIL: <Train size={14} aria-hidden="true" />,
  BICYCLE: <Bike size={14} aria-hidden="true" />,
  CAR: <Car size={14} aria-hidden="true" />,
  TRANSIT: <Bus size={14} aria-hidden="true" />,
};

export const TRANSPORT_MODE_ICONS: Record<string, React.ReactNode> = {
  Vélo: <Bike size={16} aria-hidden="true" />,
  Trottinette: <Zap size={16} aria-hidden="true" />,
  Transports: <Bus size={16} aria-hidden="true" />,
  Marche: <Footprints size={16} aria-hidden="true" />,
  Voiture: <Car size={16} aria-hidden="true" />,
};
