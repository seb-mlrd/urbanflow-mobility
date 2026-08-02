import { describe, expect, it } from 'vitest';
import {
  ARRIVAL_THRESHOLD_METERS,
  hasArrived,
  haversineDistanceMeters,
  positionAlongRoute,
  routeTotalDistanceMeters,
} from './geo-distance';

describe('haversineDistanceMeters()', () => {
  it('retourne 0 pour deux points identiques', () => {
    expect(
      haversineDistanceMeters({ lat: 50.6365, lng: 3.0635 }, { lat: 50.6365, lng: 3.0635 }),
    ).toBe(0);
  });

  it('retourne ~111.2km pour 1 degré de latitude (rayon terrestre 6371km)', () => {
    const oneDegreeMeters = (Math.PI / 180) * 6371000;
    const distance = haversineDistanceMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
    expect(distance).toBeCloseTo(oneDegreeMeters, 3);
  });

  it('retourne la même distance pour 1 degré de longitude à l’équateur', () => {
    const oneDegreeMeters = (Math.PI / 180) * 6371000;
    const distance = haversineDistanceMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(distance).toBeCloseTo(oneDegreeMeters, 3);
  });

  it('est symétrique', () => {
    const a = { lat: 50.6365, lng: 3.0635 };
    const b = { lat: 50.64, lng: 3.07 };
    expect(haversineDistanceMeters(a, b)).toBeCloseTo(haversineDistanceMeters(b, a), 6);
  });
});

describe('hasArrived()', () => {
  const target = { lat: 50.6365, lng: 3.0635 };

  it('retourne true si la position courante est identique à la cible', () => {
    expect(hasArrived(target, target)).toBe(true);
  });

  it('retourne true si la distance est exactement au seuil', () => {
    // 0.00036 degré de latitude ≈ 40m (le seuil par défaut)
    const offsetLat = ARRIVAL_THRESHOLD_METERS / ((Math.PI / 180) * 6371000);
    const current = { lat: target.lat + offsetLat, lng: target.lng };
    expect(hasArrived(current, target, ARRIVAL_THRESHOLD_METERS)).toBe(true);
  });

  it('retourne false au-delà du seuil', () => {
    const current = { lat: target.lat + 0.01, lng: target.lng };
    expect(hasArrived(current, target, ARRIVAL_THRESHOLD_METERS)).toBe(false);
  });

  it('utilise ARRIVAL_THRESHOLD_METERS par défaut', () => {
    const justInside = { lat: target.lat + 0.0001, lng: target.lng };
    expect(hasArrived(justInside, target)).toBe(true);
  });
});

describe('routeTotalDistanceMeters()', () => {
  it('retourne 0 pour un tracé vide ou à un seul point', () => {
    expect(routeTotalDistanceMeters([])).toBe(0);
    expect(routeTotalDistanceMeters([{ lat: 0, lng: 0 }])).toBe(0);
  });

  it('somme les distances de chaque segment', () => {
    const route = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 1, lng: 1 },
    ];
    const expected =
      haversineDistanceMeters(route[0], route[1]) + haversineDistanceMeters(route[1], route[2]);
    expect(routeTotalDistanceMeters(route)).toBeCloseTo(expected, 6);
  });
});

describe('positionAlongRoute()', () => {
  const route = [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 1 },
    { lat: 0, lng: 2 },
  ];

  it('retourne null pour un tracé vide', () => {
    expect(positionAlongRoute([], 100)).toBeNull();
  });

  it('retourne le premier point si la distance est nulle ou négative', () => {
    expect(positionAlongRoute(route, 0)).toEqual(route[0]);
    expect(positionAlongRoute(route, -50)).toEqual(route[0]);
  });

  it('retourne le dernier point au-delà de la distance totale', () => {
    const total = routeTotalDistanceMeters(route);
    expect(positionAlongRoute(route, total + 10000)).toEqual(route[2]);
  });

  it('interpole linéairement à mi-segment', () => {
    const segmentLength = haversineDistanceMeters(route[0], route[1]);
    const mid = positionAlongRoute(route, segmentLength / 2);
    expect(mid?.lat).toBeCloseTo(0, 6);
    expect(mid?.lng).toBeCloseTo(0.5, 4);
  });

  it('atteint exactement le point suivant à la fin d’un segment', () => {
    const segmentLength = haversineDistanceMeters(route[0], route[1]);
    const point = positionAlongRoute(route, segmentLength);
    expect(point?.lat).toBeCloseTo(route[1].lat, 6);
    expect(point?.lng).toBeCloseTo(route[1].lng, 6);
  });
});
