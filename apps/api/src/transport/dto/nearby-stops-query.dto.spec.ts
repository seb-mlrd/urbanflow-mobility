import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { NearbyStopsQueryDto } from './nearby-stops-query.dto.js';

async function validateDto(plain: object) {
  return validate(plainToInstance(NearbyStopsQueryDto, plain));
}

describe('NearbyStopsQueryDto', () => {
  const valid = { lat: '50.6292', lng: '3.0573' };

  it('valide un objet avec lat et lng uniquement', async () => {
    const errors = await validateDto(valid);
    expect(errors).toHaveLength(0);
  });

  it('valide avec radius dans la plage autorisée', async () => {
    const errors = await validateDto({ ...valid, radius: '500' });
    expect(errors).toHaveLength(0);
  });

  describe('champs requis', () => {
    it('lève une erreur si lat est absent', async () => {
      const errors = await validateDto({ lng: '3.0573' });
      expect(errors.some((e) => e.property === 'lat')).toBe(true);
    });

    it('lève une erreur si lng est absent', async () => {
      const errors = await validateDto({ lat: '50.6292' });
      expect(errors.some((e) => e.property === 'lng')).toBe(true);
    });
  });

  describe('radius', () => {
    it('est optionnel — pas d\'erreur si absent', async () => {
      const errors = await validateDto(valid);
      expect(errors).toHaveLength(0);
    });

    it('lève une erreur si radius est inférieur à 50', async () => {
      const errors = await validateDto({ ...valid, radius: '49' });
      expect(errors.some((e) => e.property === 'radius')).toBe(true);
    });

    it('lève une erreur si radius est supérieur à 2000', async () => {
      const errors = await validateDto({ ...valid, radius: '2001' });
      expect(errors.some((e) => e.property === 'radius')).toBe(true);
    });

    it('accepte radius = 50 (borne minimale incluse)', async () => {
      const errors = await validateDto({ ...valid, radius: '50' });
      expect(errors).toHaveLength(0);
    });

    it('accepte radius = 2000 (borne maximale incluse)', async () => {
      const errors = await validateDto({ ...valid, radius: '2000' });
      expect(errors).toHaveLength(0);
    });
  });
});
