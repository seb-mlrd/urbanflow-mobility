import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { of, throwError } from 'rxjs';
import { VlilleService } from './vlille.service.js';

const INFO_URL = 'https://media.ilevia.fr/opendata/station_information.json';
const STATUS_URL = 'https://media.ilevia.fr/opendata/station_status.json';

const mockHttpService = { get: jest.fn() };
const mockConfigService = {
  getOrThrow: jest.fn((key: string) =>
    key === 'GBFS_VLILLE_STATION_INFORMATION_URL' ? INFO_URL : STATUS_URL,
  ),
};
const mockCacheManager = { get: jest.fn(), set: jest.fn() };

function infoResponse(stations: object[]) {
  return { data: { data: { stations } } };
}

function statusResponse(stations: object[], lastUpdated = 1_700_000_000) {
  return { data: { last_updated: lastUpdated, data: { stations } } };
}

describe('VlilleService', () => {
  let service: VlilleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VlilleService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<VlilleService>(VlilleService);
    jest.clearAllMocks();
  });

  it('fusionne station_information et station_status par station_id et met en cache', async () => {
    mockHttpService.get
      .mockReturnValueOnce(
        of(
          infoResponse([
            {
              station_id: '1',
              name: 'Gare Lille Flandres',
              lat: 50.6365,
              lon: 3.0708,
              capacity: 30,
            },
          ]),
        ),
      )
      .mockReturnValueOnce(
        of(
          statusResponse([
            {
              station_id: '1',
              num_bikes_available: 12,
              num_docks_available: 18,
              is_renting: true,
              is_returning: true,
              last_reported: 1_700_000_100,
            },
          ]),
        ),
      );

    await service.refresh();

    expect(mockCacheManager.set).toHaveBeenCalledWith(
      VlilleService.CACHE_KEY,
      {
        vehicles: [
          {
            id: '1',
            name: 'Gare Lille Flandres',
            lat: 50.6365,
            lon: 3.0708,
            capacity: 30,
            bikesAvailable: 12,
            docksAvailable: 18,
            isRenting: true,
            isReturning: true,
            lastReported: 1_700_000_100,
          },
        ],
        lastUpdated: 1_700_000_000,
        fetchedAt: expect.any(Number),
      },
      300_000,
    );
  });

  it("ignore une station présente dans un flux mais absente de l'autre", async () => {
    mockHttpService.get
      .mockReturnValueOnce(
        of(
          infoResponse([
            { station_id: '1', name: 'A', lat: 0, lon: 0, capacity: 10 },
            { station_id: '2', name: 'B', lat: 0, lon: 0, capacity: 10 },
          ]),
        ),
      )
      .mockReturnValueOnce(
        of(
          statusResponse([
            {
              station_id: '1',
              num_bikes_available: 1,
              num_docks_available: 1,
              is_renting: true,
              is_returning: true,
              last_reported: 1,
            },
          ]),
        ),
      );

    await service.refresh();

    const snapshot = mockCacheManager.set.mock.calls[0][1] as {
      vehicles: unknown[];
    };
    expect(snapshot.vehicles).toHaveLength(1);
  });

  it('ne met pas à jour le cache si la requête HTTP échoue', async () => {
    mockHttpService.get.mockReturnValue(
      throwError(() => new Error('network down')),
    );

    await service.refresh();

    expect(mockCacheManager.set).not.toHaveBeenCalled();
  });
});
