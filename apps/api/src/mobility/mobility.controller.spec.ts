import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ServiceUnavailableException } from '@nestjs/common';
import { MobilityController } from './mobility.controller.js';
import { VlilleService } from './vlille.service.js';
import { LimeService } from './lime.service.js';

const mockCacheManager = { get: jest.fn() };

describe('MobilityController', () => {
  let controller: MobilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobilityController],
      providers: [{ provide: CACHE_MANAGER, useValue: mockCacheManager }],
    }).compile();

    controller = module.get<MobilityController>(MobilityController);
    jest.clearAllMocks();
  });

  describe('getBikes()', () => {
    it('retourne le snapshot en cache', async () => {
      const snapshot = { vehicles: [], lastUpdated: 1, fetchedAt: 2 };
      mockCacheManager.get.mockResolvedValue(snapshot);

      const result = await controller.getBikes();

      expect(result).toBe(snapshot);
      expect(mockCacheManager.get).toHaveBeenCalledWith(VlilleService.CACHE_KEY);
    });

    it("lève ServiceUnavailableException si le cache est vide", async () => {
      mockCacheManager.get.mockResolvedValue(undefined);

      await expect(controller.getBikes()).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('getScooters()', () => {
    it('retourne le snapshot en cache', async () => {
      const snapshot = { vehicles: [], lastUpdated: 1, fetchedAt: 2 };
      mockCacheManager.get.mockResolvedValue(snapshot);

      const result = await controller.getScooters();

      expect(result).toBe(snapshot);
      expect(mockCacheManager.get).toHaveBeenCalledWith(LimeService.CACHE_KEY);
    });

    it("lève ServiceUnavailableException si le cache est vide", async () => {
      mockCacheManager.get.mockResolvedValue(undefined);

      await expect(controller.getScooters()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
