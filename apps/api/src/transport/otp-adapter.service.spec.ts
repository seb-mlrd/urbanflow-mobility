import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ServiceUnavailableException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { OtpAdapterService } from './otp-adapter.service.js';

const OTP_URL = 'http://localhost:8888/otp/gtfs/v1';

const mockHttpService = { post: jest.fn() };
const mockConfigService = { getOrThrow: jest.fn().mockReturnValue(OTP_URL) };
const mockCacheManager = { get: jest.fn(), set: jest.fn() };

function makeOtpResponse(itineraries: object[]) {
  return { data: { data: { plan: { itineraries } } } };
}

const coords = { fromLat: 50.629, fromLng: 3.057, toLat: 50.636, toLng: 3.063 };

describe('OtpAdapterService', () => {
  let service: OtpAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpAdapterService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<OtpAdapterService>(OtpAdapterService);
    jest.clearAllMocks();
    mockCacheManager.get.mockResolvedValue(null);
    mockCacheManager.set.mockResolvedValue(undefined);
  });

  describe('planAllModes()', () => {
    it('retourne le cache sans appeler HttpService si présent', async () => {
      const cached = { itineraries: [] };
      mockCacheManager.get.mockResolvedValue(cached);

      const result = await service.planAllModes(coords.fromLat, coords.fromLng, coords.toLat, coords.toLng);

      expect(result).toBe(cached);
      expect(mockHttpService.post).not.toHaveBeenCalled();
    });

    it('lance 4 requêtes OTP en parallèle et trie les itinéraires par durée croissante', async () => {
      mockHttpService.post
        .mockReturnValueOnce(of(makeOtpResponse([{ duration: 1800, startTime: 0, endTime: 0, legs: [] }])))
        .mockReturnValueOnce(of(makeOtpResponse([{ duration: 900, startTime: 0, endTime: 0, legs: [] }])))
        .mockReturnValueOnce(of(makeOtpResponse([{ duration: 2400, startTime: 0, endTime: 0, legs: [] }])))
        .mockReturnValueOnce(of(makeOtpResponse([])));

      const result = await service.planAllModes(coords.fromLat, coords.fromLng, coords.toLat, coords.toLng) as any;

      expect(mockHttpService.post).toHaveBeenCalledTimes(4);
      expect(result.itineraries).toHaveLength(3);
      expect(result.itineraries[0].duration).toBe(900);
      expect(result.itineraries[1].duration).toBe(1800);
      expect(result.itineraries[2].duration).toBe(2400);
    });

    it('tag chaque itinéraire avec dominantMode correct', async () => {
      mockHttpService.post
        .mockReturnValueOnce(of(makeOtpResponse([{ duration: 600, startTime: 0, endTime: 0, legs: [] }])))
        .mockReturnValueOnce(of(makeOtpResponse([{ duration: 500, startTime: 0, endTime: 0, legs: [] }])))
        .mockReturnValueOnce(of(makeOtpResponse([])))
        .mockReturnValueOnce(of(makeOtpResponse([])));

      const result = await service.planAllModes(coords.fromLat, coords.fromLng, coords.toLat, coords.toLng) as any;

      const modes = result.itineraries.map((i: any) => i.dominantMode);
      expect(modes).toContain('TRANSIT');
      expect(modes).toContain('CAR');
    });

    it('retourne les modes restants si une query OTP échoue', async () => {
      mockHttpService.post
        .mockReturnValueOnce(throwError(() => new Error('timeout')))
        .mockReturnValueOnce(of(makeOtpResponse([{ duration: 900, startTime: 0, endTime: 0, legs: [] }])))
        .mockReturnValueOnce(of(makeOtpResponse([])))
        .mockReturnValueOnce(of(makeOtpResponse([])));

      const result = await service.planAllModes(coords.fromLat, coords.fromLng, coords.toLat, coords.toLng) as any;

      expect(result.itineraries).toHaveLength(1);
      expect(result.itineraries[0].dominantMode).toBe('CAR');
    });

    it('inclut legGeometry { points } dans la requête GraphQL envoyée à OTP', async () => {
      mockHttpService.post.mockReturnValue(of(makeOtpResponse([])));

      await service.planAllModes(coords.fromLat, coords.fromLng, coords.toLat, coords.toLng);

      const [, body] = mockHttpService.post.mock.calls[0];
      expect(body.query).toContain('legGeometry { points }');
    });

    it('propage legGeometry sans le modifier dans la réponse fusionnée', async () => {
      const legGeometry = { points: 'wz`tHeduQoBpB' };
      mockHttpService.post
        .mockReturnValueOnce(of(makeOtpResponse([])))
        .mockReturnValueOnce(of(makeOtpResponse([
          {
            duration: 600,
            startTime: 0,
            endTime: 600000,
            legs: [{ mode: 'CAR', startTime: 0, endTime: 600000, distance: 100, from: { name: 'Origin', lat: 0, lon: 0 }, to: { name: 'Destination', lat: 0, lon: 0 }, route: null, legGeometry }],
          },
        ])))
        .mockReturnValueOnce(of(makeOtpResponse([])))
        .mockReturnValueOnce(of(makeOtpResponse([])));

      const result = await service.planAllModes(coords.fromLat, coords.fromLng, coords.toLat, coords.toLng) as any;

      expect(result.itineraries[0].legs[0].legGeometry).toEqual(legGeometry);
    });

    it('utilise une clé de cache avec coordonnées arrondies à 4 décimales', async () => {
      mockHttpService.post.mockReturnValue(of(makeOtpResponse([])));

      await service.planAllModes(50.629200001, 3.057300001, 50.636000001, 3.063000001);

      const cacheKey = mockCacheManager.set.mock.calls[0][0] as string;
      expect(cacheKey).toContain('50.6292');
      expect(cacheKey).toContain('3.0573');
      expect(cacheKey).toContain('50.6360');
      expect(cacheKey).toContain('3.0630');
    });

    it('lève ServiceUnavailableException si toutes les queries échouent', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('OTP down')));

      await expect(
        service.planAllModes(coords.fromLat, coords.fromLng, coords.toLat, coords.toLng),
      ).resolves.toMatchObject({ itineraries: [] });
    });
  });

  describe('getStopsNearby()', () => {
    it('retourne le cache sans appeler HttpService si présent', async () => {
      const cached = { data: { stopsByRadius: [] } };
      mockCacheManager.get.mockResolvedValue(cached);

      const result = await service.getStopsNearby(50.6292, 3.0573);

      expect(result).toBe(cached);
      expect(mockHttpService.post).not.toHaveBeenCalled();
    });

    it('appelle OTP et met en cache si pas de cache', async () => {
      const otpData = { data: { stopsByRadius: { edges: [] } } };
      mockHttpService.post.mockReturnValue(of({ data: otpData }));

      await service.getStopsNearby(50.6292, 3.0573);

      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('otp:stops:'),
        expect.anything(),
        3_600_000,
      );
    });
  });

  describe('getDepartures()', () => {
    it('retourne le cache sans appeler HttpService si présent', async () => {
      const cached = { data: { stop: { name: 'Wazemmes' } } };
      mockCacheManager.get.mockResolvedValue(cached);

      const result = await service.getDepartures('ilevia:1234');

      expect(result).toBe(cached);
      expect(mockHttpService.post).not.toHaveBeenCalled();
    });

    it('lève ServiceUnavailableException si OTP est inaccessible', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('connexion refusée')));

      await expect(service.getDepartures('ilevia:1234')).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
