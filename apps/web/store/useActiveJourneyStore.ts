import { create } from 'zustand';
import type { Itinerary } from '../lib/journey-types';
import type { GeoPosition } from '../lib/geo-distance';

interface StartParams {
  itinerary: Itinerary;
  originLabel: string;
  destinationLabel: string;
  originCoords: GeoPosition;
  destinationCoords: GeoPosition;
}

interface ActiveJourneyState {
  isActive: boolean;
  itinerary: Itinerary | null;
  originLabel: string | null;
  destinationLabel: string | null;
  originCoords: GeoPosition | null;
  destinationCoords: GeoPosition | null;
  actualDepartureAt: number | null;
  hasBeenSaved: boolean;
  start: (params: StartParams) => void;
  markSaved: () => void;
  stop: () => void;
}

const initialState = {
  isActive: false,
  itinerary: null,
  originLabel: null,
  destinationLabel: null,
  originCoords: null,
  destinationCoords: null,
  actualDepartureAt: null,
  hasBeenSaved: false,
};

export const useActiveJourneyStore = create<ActiveJourneyState>()((set) => ({
  ...initialState,
  start: (params) =>
    set({
      isActive: true,
      itinerary: params.itinerary,
      originLabel: params.originLabel,
      destinationLabel: params.destinationLabel,
      originCoords: params.originCoords,
      destinationCoords: params.destinationCoords,
      actualDepartureAt: Date.now(),
      hasBeenSaved: false,
    }),
  markSaved: () => set({ hasBeenSaved: true }),
  stop: () => set(initialState),
}));
