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
      ).toHaveBeenCalledWith('profile-abc');
      expect(result).toEqual([{ id: 'history-1', ...dto }]);
    });
  });
});
