import { Test, TestingModule } from '@nestjs/testing';
import { JourneyHistoryController } from './journey-history.controller.js';
import { JourneyHistoryService } from './journey-history.service.js';
import { ProfileService } from '../profile/profile.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';

const mockJourneyHistoryService = {
  create: jest.fn(),
  getMonthlyStats: jest.fn(),
  findRecentForProfile: jest.fn(),
  getMonthlyCo2Breakdown: jest.fn(),
};
const mockProfileService = { findByUserId: jest.fn() };

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
        { provide: ProfileService, useValue: mockProfileService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<JourneyHistoryController>(JourneyHistoryController);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it("résout le profil via le JWT et crée l'entrée d'historique avec le bon profileId", async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockJourneyHistoryService.create.mockResolvedValue({
        id: 'history-1',
        ...dto,
      });

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;
      await controller.create(req, dto);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith('user-123');
      expect(mockJourneyHistoryService.create).toHaveBeenCalledWith(
        'profile-abc',
        dto,
      );
    });
  });

  describe('getStats()', () => {
    it('résout le profil via le JWT et retourne les stats mensuelles', async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockJourneyHistoryService.getMonthlyStats.mockResolvedValue({
        co2GramsThisMonth: 1930,
        tripsThisMonth: 3,
      });

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;
      const result = await controller.getStats(req);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith('user-123');
      expect(mockJourneyHistoryService.getMonthlyStats).toHaveBeenCalledWith(
        'profile-abc',
      );
      expect(result).toEqual({ co2GramsThisMonth: 1930, tripsThisMonth: 3 });
    });
  });

  describe('findAll()', () => {
    it('résout le profil via le JWT et retourne les trajets récents', async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockJourneyHistoryService.findRecentForProfile.mockResolvedValue([
        { id: 'history-1', ...dto },
      ]);

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;
      const result = await controller.findAll(req);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith('user-123');
      expect(
        mockJourneyHistoryService.findRecentForProfile,
      ).toHaveBeenCalledWith('profile-abc', undefined);
      expect(result).toEqual([{ id: 'history-1', ...dto }]);
    });

    it('transmet le paramètre limit en nombre quand fourni', async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockJourneyHistoryService.findRecentForProfile.mockResolvedValue([]);

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;
      await controller.findAll(req, '25');

      expect(
        mockJourneyHistoryService.findRecentForProfile,
      ).toHaveBeenCalledWith('profile-abc', 25);
    });
  });

  describe('getMonthlyBreakdown()', () => {
    it('résout le profil via le JWT et retourne la répartition mensuelle de CO2', async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockJourneyHistoryService.getMonthlyCo2Breakdown.mockResolvedValue([
        { month: '2026-02', co2Grams: 0 },
        { month: '2026-03', co2Grams: 1200 },
      ]);

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;
      const result = await controller.getMonthlyBreakdown(req, '6');

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith('user-123');
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
