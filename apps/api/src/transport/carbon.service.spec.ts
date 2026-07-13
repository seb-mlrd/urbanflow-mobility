import { CarbonService } from './carbon.service.js';

describe('CarbonService', () => {
  let service: CarbonService;

  beforeEach(() => {
    service = new CarbonService();
  });

  describe('computeItineraryCo2Grams()', () => {
    it('calcule les grammes de CO2 pour un leg en voiture', () => {
      const result = service.computeItineraryCo2Grams([
        { mode: 'CAR', distance: 10_000 },
      ]);

      expect(result).toBe(1930);
    });

    it('retourne 0 pour un leg à pied ou à vélo', () => {
      expect(
        service.computeItineraryCo2Grams([{ mode: 'WALK', distance: 5000 }]),
      ).toBe(0);
      expect(
        service.computeItineraryCo2Grams([{ mode: 'BICYCLE', distance: 5000 }]),
      ).toBe(0);
    });

    it('somme correctement plusieurs legs de modes différents', () => {
      const result = service.computeItineraryCo2Grams([
        { mode: 'WALK', distance: 500 },
        { mode: 'SUBWAY', distance: 3000 },
        { mode: 'WALK', distance: 300 },
      ]);

      expect(result).toBe(12);
    });

    it('applique le facteur de repli (CAR) pour un mode inconnu', () => {
      const result = service.computeItineraryCo2Grams([
        { mode: 'HOVERBOARD', distance: 10_000 },
      ]);

      expect(result).toBe(1930);
    });

    it('retourne 0 pour une liste de legs vide', () => {
      expect(service.computeItineraryCo2Grams([])).toBe(0);
    });

    it('arrondit le total à l’entier le plus proche', () => {
      const result = service.computeItineraryCo2Grams([
        { mode: 'RAIL', distance: 1234 },
      ]);

      expect(result).toBe(Math.round((1234 / 1000) * 29));
    });
  });
});
