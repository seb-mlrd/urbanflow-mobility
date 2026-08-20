import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlanificationController } from './planification.controller.js';
import { PlanificationService } from './planification.service.js';
import { ProfileService } from '../profile/profile.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';

const mockPlanificationService = {
  create: jest.fn(),
  findAllForProfile: jest.fn(),
  removeForProfile: jest.fn(),
};
const mockProfileService = { findByUserId: jest.fn() };

const dto = {
  fromLabel: 'Grand-Place',
  toLabel: 'Wazemmes',
  fromLat: 50.6365,
  fromLng: 3.0635,
  toLat: 50.6292,
  toLng: 3.0573,
  plannedAt: '2026-03-20T08:00:00.000Z',
  selectedModes: ['BUS'],
};

describe('PlanificationController', () => {
  let controller: PlanificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanificationController],
      providers: [
        { provide: PlanificationService, useValue: mockPlanificationService },
        { provide: ProfileService, useValue: mockProfileService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PlanificationController>(PlanificationController);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it("résout le profil via le JWT et crée l'itinéraire planifié avec le bon profileId", async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockPlanificationService.create.mockResolvedValue({
        id: 'plan-1',
        ...dto,
      });

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;
      await controller.create(req, dto);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith('user-123');
      expect(mockPlanificationService.create).toHaveBeenCalledWith(
        'profile-abc',
        dto,
      );
    });
  });

  describe('findAll()', () => {
    it('résout le profil via le JWT et retourne ses itinéraires planifiés', async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockPlanificationService.findAllForProfile.mockResolvedValue([
        { id: 'plan-1', ...dto },
      ]);

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;
      const result = await controller.findAll(req);

      expect(mockProfileService.findByUserId).toHaveBeenCalledWith('user-123');
      expect(mockPlanificationService.findAllForProfile).toHaveBeenCalledWith(
        'profile-abc',
      );
      expect(result).toEqual([{ id: 'plan-1', ...dto }]);
    });
  });

  describe('remove()', () => {
    it('supprime la ligne quand elle appartient au profil résolu', async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockPlanificationService.removeForProfile.mockResolvedValue(true);

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;
      await controller.remove(req, 'plan-1');

      expect(mockPlanificationService.removeForProfile).toHaveBeenCalledWith(
        'plan-1',
        'profile-abc',
      );
    });

    it("lève une NotFoundException quand la ligne n'existe pas ou appartient à un autre profil", async () => {
      mockProfileService.findByUserId.mockResolvedValue({ id: 'profile-abc' });
      mockPlanificationService.removeForProfile.mockResolvedValue(false);

      const req = {
        user: { sub: 'user-123', email: 'a@b.c' },
      } as AuthenticatedRequest;

      await expect(controller.remove(req, 'plan-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
