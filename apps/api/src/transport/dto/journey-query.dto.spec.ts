import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { JourneyQueryDto } from './journey-query.dto.js';

async function validateDto(plain: object) {
  return validate(plainToInstance(JourneyQueryDto, plain));
}

describe('JourneyQueryDto', () => {
  const valid = {
    fromLat: '50.6292',
    fromLng: '3.0573',
    toLat: '50.6366',
    toLng: '3.0635',
  };

  it('valide un objet complet correct', async () => {
    const errors = await validateDto(valid);
    expect(errors).toHaveLength(0);
  });

  it('valide avec datetime ISO 8601 optionnel', async () => {
    const errors = await validateDto({
      ...valid,
      datetime: '2026-06-21T14:00:00.000Z',
    });
    expect(errors).toHaveLength(0);
  });

  it('valide sans datetime (champ optionnel)', async () => {
    const errors = await validateDto(valid);
    expect(errors).toHaveLength(0);
  });

  describe('coordonnées requises', () => {
    it.each(['fromLat', 'fromLng', 'toLat', 'toLng'])(
      'lève une erreur si %s est absent',
      async (field) => {
        const body = { ...valid };
        delete (body as any)[field];
        const errors = await validateDto(body);
        expect(errors.some((e) => e.property === field)).toBe(true);
      },
    );
  });

  describe('types des coordonnées', () => {
    it('accepte des strings numériques (transformées en number par @Type)', async () => {
      const errors = await validateDto({
        fromLat: '50.6292',
        fromLng: '3.0573',
        toLat: '50.636',
        toLng: '3.063',
      });
      expect(errors).toHaveLength(0);
    });

    it('lève une erreur si fromLat est une string non numérique', async () => {
      const errors = await validateDto({ ...valid, fromLat: 'abc' });
      expect(errors.some((e) => e.property === 'fromLat')).toBe(true);
    });
  });

  describe('datetime', () => {
    it('lève une erreur si datetime est un format non ISO 8601', async () => {
      const errors = await validateDto({
        ...valid,
        datetime: '21/06/2026 14:00',
      });
      expect(errors.some((e) => e.property === 'datetime')).toBe(true);
    });

    it('accepte une date ISO 8601 sans heure', async () => {
      const errors = await validateDto({ ...valid, datetime: '2026-06-21' });
      expect(errors).toHaveLength(0);
    });
  });
});
