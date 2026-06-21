import { describe, expect, it } from 'vitest';
import { getActualDominantMode, formatDuration } from './journey-utils';

const leg = (mode: string) => ({ mode });

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
