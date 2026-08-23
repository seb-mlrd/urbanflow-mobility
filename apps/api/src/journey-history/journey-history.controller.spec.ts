import { Test, TestingModule } from '@nestjs/testing';
import { JourneyHistoryController } from './journey-history.controller.js';
import { JourneyHistoryService } from './journey-history.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';

const mockJourneyHistoryService = {
  create: jest.fn(),
  getMonthlyStats: jest.fn(),
  findRecentForProfile: jest.fn(),
  getMonthlyCo2Breakdown: jest.fn(),
};

const profile = { id: 'profile-abc' } as Profile;

const dto = {
  dominantMode: 'CAR',
  distanceMeters: 5000,
  durationSeconds: 600,
  co2Grams: 965,
  fromLabel: 'A',
  toLabel: 'B',
  fromLat: 50.6,
  fromLng: 3.0,
  toLat: 50.7,
  toLng: 3.1,
  departureAt: 0,
  arrivalAt: 600_000,
};

describe('JourneyHistoryController', () => {
  let controller: JourneyHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JourneyHistoryController],
      providers: [
        { provide: JourneyHistoryService, useValue: mockJourneyHistoryService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(CurrentProfileInterceptor)
      .useValue({
        intercept: (_ctx: unknown, next: { handle: () => unknown }) =>
          next.handle(),
      })
      .compile();

    controller = module.get<JourneyHistoryController>(JourneyHistoryController);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it("crée l'entrée d'historique avec le profileId du profil courant", async () => {
      mockJourneyHistoryService.create.mockResolvedValue({
        id: 'history-1',
        ...dto,
      });

      await controller.create(profile, dto);

      expect(mockJourneyHistoryService.create).toHaveBeenCalledWith(
        'profile-abc',
        dto,
      );
    });
  });

  describe('getStats()', () => {
    it('retourne les stats mensuelles du profil courant', async () => {
      mockJourneyHistoryService.getMonthlyStats.mockResolvedValue({
        co2GramsThisMonth: 1930,
        tripsThisMonth: 3,
      });

      const result = await controller.getStats(profile);

      expect(mockJourneyHistoryService.getMonthlyStats).toHaveBeenCalledWith(
        'profile-abc',
      );
      expect(result).toEqual({ co2GramsThisMonth: 1930, tripsThisMonth: 3 });
    });
  });

  describe('findAll()', () => {
    it('retourne les trajets récents du profil courant', async () => {
      mockJourneyHistoryService.findRecentForProfile.mockResolvedValue([
        { id: 'history-1', ...dto },
      ]);

      const result = await controller.findAll(profile);

      expect(
        mockJourneyHistoryService.findRecentForProfile,
      ).toHaveBeenCalledWith('profile-abc', undefined);
      expect(result).toEqual([{ id: 'history-1', ...dto }]);
    });

    it('transmet le paramètre limit en nombre quand fourni', async () => {
      mockJourneyHistoryService.findRecentForProfile.mockResolvedValue([]);

      await controller.findAll(profile, '25');

      expect(
        mockJourneyHistoryService.findRecentForProfile,
      ).toHaveBeenCalledWith('profile-abc', 25);
    });
  });

  describe('getMonthlyBreakdown()', () => {
    it('retourne la répartition mensuelle de CO2 du profil courant', async () => {
      mockJourneyHistoryService.getMonthlyCo2Breakdown.mockResolvedValue([
        { month: '2026-02', co2Grams: 0 },
        { month: '2026-03', co2Grams: 1200 },
      ]);

      const result = await controller.getMonthlyBreakdown(profile, '6');

      expect(
        mockJourneyHistoryService.getMonthlyCo2Breakdown,
      ).toHaveBeenCalledWith('profile-abc', 6);
      expect(result).toEqual([
        { month: '2026-02', co2Grams: 0 },
        { month: '2026-03', co2Grams: 1200 },
      ]);
    });
  });
});
