import { describe, expect, it } from 'vitest';
import polyline from '@mapbox/polyline';
import {
  getActualDominantMode,
  formatDuration,
  formatCo2,
  filterAndSortItineraries,
  getItineraryEndpoints,
  getItineraryRouteCoordinates,
  buildJourneyHistoryPayload,
} from './journey-utils';
import type { Itinerary, JourneyResponse } from './journey-types';

const leg = (mode: string) => ({ mode });

const itin = (mode: string, duration = 600, co2Grams = 0) => ({
  duration,
  startTime: 0,
  endTime: duration * 1000,
  dominantMode: mode,
  co2Grams,
  legs: [
    {
      mode,
      startTime: 0,
      endTime: duration * 1000,
      distance: 100,
      from: { name: 'Origin' },
      to: { name: 'Destination' },
      route: null,
      legGeometry: null,
    },
  ],
});

describe('getActualDominantMode()', () => {
  describe('modes TC (TRANSIT)', () => {
    it('retourne TRANSIT si un leg est SUBWAY', () => {
      expect(getActualDominantMode([leg('WALK'), leg('SUBWAY'), leg('WALK')])).toBe('TRANSIT');
    });

    it('retourne TRANSIT si un leg est BUS', () => {
      expect(getActualDominantMode([leg('WALK'), leg('BUS')])).toBe('TRANSIT');
    });

    it('retourne TRANSIT si un leg est TRAM', () => {
      expect(getActualDominantMode([leg('TRAM')])).toBe('TRANSIT');
    });

    it('retourne TRANSIT si un leg est RAIL', () => {
      expect(getActualDominantMode([leg('RAIL'), leg('WALK')])).toBe('TRANSIT');
    });

    it('retourne TRANSIT même si des legs WALK sont présents', () => {
      expect(getActualDominantMode([leg('WALK'), leg('SUBWAY'), leg('WALK')])).toBe('TRANSIT');
    });
  });

  describe('modes individuels', () => {
    it('retourne CAR si que des legs CAR', () => {
      expect(getActualDominantMode([leg('CAR')])).toBe('CAR');
    });

    it('retourne BICYCLE si que des legs BICYCLE', () => {
      expect(getActualDominantMode([leg('BICYCLE')])).toBe('BICYCLE');
    });

    it('retourne WALK si que des legs WALK', () => {
      expect(getActualDominantMode([leg('WALK'), leg('WALK')])).toBe('WALK');
    });

    it('retourne WALK si la liste est vide', () => {
      expect(getActualDominantMode([])).toBe('WALK');
    });
  });

  describe('priorités', () => {
    it('TRANSIT prime sur CAR', () => {
      expect(getActualDominantMode([leg('CAR'), leg('BUS')])).toBe('TRANSIT');
    });

    it('CAR prime sur BICYCLE', () => {
      expect(getActualDominantMode([leg('BICYCLE'), leg('CAR')])).toBe('CAR');
    });

    it('BICYCLE prime sur WALK', () => {
      expect(getActualDominantMode([leg('WALK'), leg('BICYCLE')])).toBe('BICYCLE');
    });
  });
});

describe('formatDuration()', () => {
  it('formate 60 secondes en "1 min"', () => {
    expect(formatDuration(60)).toBe('1 min');
  });

  it('formate 600 secondes en "10 min"', () => {
    expect(formatDuration(600)).toBe('10 min');
  });

  it('formate 3600 secondes en "1h00"', () => {
    expect(formatDuration(3600)).toBe('1h00');
  });

  it('formate 3660 secondes en "1h01"', () => {
    expect(formatDuration(3660)).toBe('1h01');
  });

  it('formate 5400 secondes en "1h30"', () => {
    expect(formatDuration(5400)).toBe('1h30');
  });

  it('arrondit 90 secondes à "2 min"', () => {
    expect(formatDuration(90)).toBe('2 min');
  });
});

describe('formatCo2()', () => {
  it('formate 0 gramme en "0 g CO2"', () => {
    expect(formatCo2(0)).toBe('0 g CO2');
  });

  it('formate 42 grammes en "42 g CO2"', () => {
    expect(formatCo2(42)).toBe('42 g CO2');
  });

  it('formate 1000 grammes en "1.0 kg CO2"', () => {
    expect(formatCo2(1000)).toBe('1.0 kg CO2');
  });

  it('formate 2530 grammes en "2.5 kg CO2"', () => {
    expect(formatCo2(2530)).toBe('2.5 kg CO2');
  });
});

describe('filterAndSortItineraries()', () => {
  it('retourne un tableau vide si result est null', () => {
    expect(filterAndSortItineraries(null, [], [])).toEqual([]);
  });

  it('tag chaque itinéraire avec son dominantMode réel', () => {
    const result: JourneyResponse = { itineraries: [itin('BUS'), itin('CAR')] };
    const out = filterAndSortItineraries(result, [], []);
    expect(out.map((i) => i.dominantMode)).toEqual(['TRANSIT', 'CAR']);
  });

  it('sans filtre sélectionné : met en avant les modes du profil utilisateur', () => {
    const result: JourneyResponse = { itineraries: [itin('CAR'), itin('BICYCLE')] };
    const out = filterAndSortItineraries(result, ['Vélo'], []);
    expect(out.map((i) => i.dominantMode)).toEqual(['BICYCLE', 'CAR']);
  });

  it('marque isProfileMatch=true pour les itinéraires qui matchent le profil, sans filtre actif', () => {
    const result: JourneyResponse = { itineraries: [itin('BICYCLE'), itin('CAR')] };
    const out = filterAndSortItineraries(result, ['Vélo'], []);
    expect(out.find((i) => i.dominantMode === 'BICYCLE')?.isProfileMatch).toBe(true);
    expect(out.find((i) => i.dominantMode === 'CAR')?.isProfileMatch).toBe(false);
  });

  it('avec un filtre sélectionné : ne garde que les itinéraires du mode sélectionné', () => {
    const result: JourneyResponse = { itineraries: [itin('CAR'), itin('BICYCLE'), itin('WALK')] };
    const out = filterAndSortItineraries(result, [], ['Vélo']);
    expect(out.map((i) => i.dominantMode)).toEqual(['BICYCLE']);
  });

  it('isProfileMatch=false pour tous les itinéraires quand un filtre est actif', () => {
    const result: JourneyResponse = { itineraries: [itin('BICYCLE')] };
    const out = filterAndSortItineraries(result, ['Vélo'], ['Vélo']);
    expect(out[0].isProfileMatch).toBe(false);
  });

  it('sans sortBy explicite : trie par durée croissante (comportement par défaut)', () => {
    const result: JourneyResponse = {
      itineraries: [itin('CAR', 1200), itin('BICYCLE', 300)],
    };
    const out = filterAndSortItineraries(result, [], []);
    expect(out.map((i) => i.duration)).toEqual([300, 1200]);
  });

  it('sortBy=co2 : trie par CO2 croissant à l’intérieur de chaque groupe (profil d’abord)', () => {
    const result: JourneyResponse = {
      itineraries: [itin('CAR', 600, 500), itin('BICYCLE', 900, 20), itin('BICYCLE', 300, 5)],
    };
    const out = filterAndSortItineraries(result, ['Vélo'], [], 'co2');
    // Groupe profil (BICYCLE) trié par co2 d'abord, puis le reste (CAR).
    expect(out.map((i) => [i.dominantMode, i.co2Grams])).toEqual([
      ['BICYCLE', 5],
      ['BICYCLE', 20],
      ['CAR', 500],
    ]);
  });

  it('sortBy=co2 avec un filtre actif : trie l’ensemble filtré par CO2 croissant', () => {
    const result: JourneyResponse = {
      itineraries: [itin('BICYCLE', 600, 50), itin('BICYCLE', 300, 10)],
    };
    const out = filterAndSortItineraries(result, [], ['Vélo'], 'co2');
    expect(out.map((i) => i.co2Grams)).toEqual([10, 50]);
  });

  it('conserve les legGeometry des legs sans les altérer', () => {
    const result: JourneyResponse = {
      itineraries: [
        {
          duration: 300,
          startTime: 0,
          endTime: 300000,
          dominantMode: 'CAR',
          co2Grams: 0,
          legs: [
            {
              mode: 'CAR',
              startTime: 0,
              endTime: 300000,
              distance: 50,
              from: { name: 'Origin' },
              to: { name: 'Destination' },
              route: null,
              legGeometry: { points: 'abc123' },
            },
          ],
        },
      ],
    };
    const out = filterAndSortItineraries(result, [], []);
    expect(out[0].legs[0].legGeometry).toEqual({ points: 'abc123' });
  });
});

function makeItinerary(overrides: Partial<Itinerary> & { legs: Itinerary['legs'] }): Itinerary {
  return {
    duration: 600,
    startTime: 1000,
    endTime: 601000,
    dominantMode: 'WALK',
    co2Grams: 120,
    ...overrides,
  };
}

describe('getItineraryEndpoints()', () => {
  it('retourne null/null si aucun leg n’a de geometry', () => {
    const itinerary = makeItinerary({
      legs: [
        {
          mode: 'WALK',
          startTime: 0,
          endTime: 100,
          distance: 10,
          from: { name: 'Origin' },
          to: { name: 'Destination' },
          route: null,
          legGeometry: null,
        },
      ],
    });
    expect(getItineraryEndpoints(itinerary)).toEqual({ departure: null, arrival: null });
  });

  it('retourne null/null pour un itinéraire null', () => {
    expect(getItineraryEndpoints(null)).toEqual({ departure: null, arrival: null });
  });

  it('décode la polyline et retourne le premier et dernier point', () => {
    const coords: [number, number][] = [
      [50.6365, 3.0635],
      [50.64, 3.07],
      [50.645, 3.08],
    ];
    const encoded = polyline.encode(coords);
    const itinerary = makeItinerary({
      legs: [
        {
          mode: 'WALK',
          startTime: 0,
          endTime: 100,
          distance: 10,
          from: { name: 'Origin' },
          to: { name: 'Destination' },
          route: null,
          legGeometry: { points: encoded },
        },
      ],
    });
    const { departure, arrival } = getItineraryEndpoints(itinerary);
    expect(departure?.lat).toBeCloseTo(coords[0][0], 4);
    expect(departure?.lng).toBeCloseTo(coords[0][1], 4);
    expect(arrival?.lat).toBeCloseTo(coords[2][0], 4);
    expect(arrival?.lng).toBeCloseTo(coords[2][1], 4);
  });

  it('combine plusieurs legs pour trouver départ/arrivée globaux', () => {
    const leg1 = polyline.encode([
      [50.6, 3.0],
      [50.61, 3.01],
    ]);
    const leg2 = polyline.encode([
      [50.61, 3.01],
      [50.65, 3.09],
    ]);
    const itinerary = makeItinerary({
      legs: [
        {
          mode: 'WALK',
          startTime: 0,
          endTime: 100,
          distance: 10,
          from: { name: 'Origin' },
          to: { name: 'A' },
          route: null,
          legGeometry: { points: leg1 },
        },
        {
          mode: 'BUS',
          startTime: 100,
          endTime: 200,
          distance: 500,
          from: { name: 'A' },
          to: { name: 'Destination' },
          route: null,
          legGeometry: { points: leg2 },
        },
      ],
    });
    const { departure, arrival } = getItineraryEndpoints(itinerary);
    expect(departure?.lat).toBeCloseTo(50.6, 4);
    expect(arrival?.lat).toBeCloseTo(50.65, 4);
  });
});

describe('getItineraryRouteCoordinates()', () => {
  it('retourne un tableau vide sans itinéraire ni legGeometry', () => {
    expect(getItineraryRouteCoordinates(null)).toEqual([]);

    const itinerary = makeItinerary({
      legs: [
        {
          mode: 'WALK',
          startTime: 0,
          endTime: 100,
          distance: 10,
          from: { name: 'Origin' },
          to: { name: 'Destination' },
          route: null,
          legGeometry: null,
        },
      ],
    });
    expect(getItineraryRouteCoordinates(itinerary)).toEqual([]);
  });

  it('décode et concatène les legGeometry de tous les legs dans l’ordre', () => {
    const leg1 = polyline.encode([
      [50.6, 3.0],
      [50.61, 3.01],
    ]);
    const leg2 = polyline.encode([
      [50.61, 3.01],
      [50.65, 3.09],
    ]);
    const itinerary = makeItinerary({
      legs: [
        {
          mode: 'WALK',
          startTime: 0,
          endTime: 100,
          distance: 10,
          from: { name: 'Origin' },
          to: { name: 'A' },
          route: null,
          legGeometry: { points: leg1 },
        },
        {
          mode: 'BUS',
          startTime: 100,
          endTime: 200,
          distance: 500,
          from: { name: 'A' },
          to: { name: 'Destination' },
          route: null,
          legGeometry: { points: leg2 },
        },
      ],
    });

    const coords = getItineraryRouteCoordinates(itinerary);
    expect(coords).toHaveLength(4);
    expect(coords[0].lat).toBeCloseTo(50.6, 4);
    expect(coords[3].lat).toBeCloseTo(50.65, 4);
  });
});

describe('buildJourneyHistoryPayload()', () => {
  it('mappe correctement les champs vers le DTO backend', () => {
    const itinerary = makeItinerary({
      duration: 723.4,
      co2Grams: 250,
      legs: [
        {
          mode: 'WALK',
          startTime: 0,
          endTime: 100,
          distance: 200,
          from: { name: 'Origin' },
          to: { name: 'A' },
          route: null,
          legGeometry: null,
        },
        {
          mode: 'BUS',
          startTime: 100,
          endTime: 700,
          distance: 3000,
          from: { name: 'A' },
          to: { name: 'Destination' },
          route: null,
          legGeometry: null,
        },
      ],
    });

    const payload = buildJourneyHistoryPayload({
      itinerary,
      fromLabel: 'Gare de Lille',
      toLabel: 'Grand Place',
      fromLat: 50.6365,
      fromLng: 3.0635,
      toLat: 50.64,
      toLng: 3.07,
      departureAt: 1700000000000,
      arrivalAt: 1700000900000,
    });

    expect(payload).toEqual({
      dominantMode: 'TRANSIT',
      distanceMeters: 3200,
      durationSeconds: 723,
      co2Grams: 250,
      fromLabel: 'Gare de Lille',
      toLabel: 'Grand Place',
      fromLat: 50.6365,
      fromLng: 3.0635,
      toLat: 50.64,
      toLng: 3.07,
      departureAt: 1700000000000,
      arrivalAt: 1700000900000,
    });
  });
});
