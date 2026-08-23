import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ServiceUnavailableException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LimeService } from './lime.service.js';

const FEED_URL =
  'https://data.lime.bike/api/partners/v2/gbfs/lille/free_bike_status';

const mockHttpService = { get: jest.fn() };
const mockConfigService = { getOrThrow: jest.fn().mockReturnValue(FEED_URL) };
const mockCacheManager = { get: jest.fn(), set: jest.fn() };

function feedResponse(bikes: object[], lastUpdated = 1_700_000_000) {
  return { data: { last_updated: lastUpdated, data: { bikes } } };
}

describe('LimeService', () => {
  let service: LimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LimeService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<LimeService>(LimeService);
    jest.clearAllMocks();
  });

  it('normalise les trottinettes et exclut les e-bikes', async () => {
    mockHttpService.get.mockReturnValue(
      of(
        feedResponse([
          {
            bike_id: 'scooter-1',
            lat: 50.64,
            lon: 3.07,
            is_reserved: false,
            is_disabled: false,
            current_range_meters: 15000,
            last_reported: 1_700_000_050,
            vehicle_type: 'scooter',
          },
          {
            bike_id: 'ebike-1',
            lat: 50.65,
            lon: 3.08,
            is_reserved: false,
            is_disabled: false,
            current_range_meters: 20000,
            last_reported: 1_700_000_060,
            vehicle_type: 'e-bike',
          },
        ]),
      ),
    );

    await service.refresh();

    expect(mockCacheManager.set).toHaveBeenCalledWith(
      LimeService.CACHE_KEY,
      {
        vehicles: [
          {
            id: 'scooter-1',
            lat: 50.64,
            lon: 3.07,
            rangeMeters: 15000,
            isDisabled: false,
            isReserved: false,
            lastReported: 1_700_000_050,
          },
        ],
        lastUpdated: 1_700_000_000,
        fetchedAt: expect.any(Number),
      },
      300_000,
    );
  });

  it('ne met pas à jour le cache si la requête HTTP échoue', async () => {
    mockHttpService.get.mockReturnValue(
      throwError(() => new Error('network down')),
    );

    await service.refresh();

    expect(mockCacheManager.set).not.toHaveBeenCalled();
  });

  describe('getSnapshotOrThrow()', () => {
    it('retourne le snapshot en cache', async () => {
      const snapshot = { vehicles: [], lastUpdated: 1, fetchedAt: 2 };
      mockCacheManager.get.mockResolvedValue(snapshot);

      await expect(service.getSnapshotOrThrow()).resolves.toBe(snapshot);
      expect(mockCacheManager.get).toHaveBeenCalledWith(LimeService.CACHE_KEY);
    });

    it('lève ServiceUnavailableException si le cache est vide', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);

      await expect(service.getSnapshotOrThrow()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
