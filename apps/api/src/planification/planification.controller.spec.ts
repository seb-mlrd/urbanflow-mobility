import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlanificationController } from './planification.controller.js';
import { PlanificationService } from './planification.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';

const mockPlanificationService = {
  create: jest.fn(),
  findAllForProfile: jest.fn(),
  removeForProfile: jest.fn(),
};

const profile = { id: 'profile-abc' } as Profile;

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

    controller = module.get<PlanificationController>(PlanificationController);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it("crée l'itinéraire planifié avec le profileId du profil courant", async () => {
      mockPlanificationService.create.mockResolvedValue({
        id: 'plan-1',
        ...dto,
      });

      await controller.create(profile, dto);

      expect(mockPlanificationService.create).toHaveBeenCalledWith(
        'profile-abc',
        dto,
      );
    });
  });

  describe('findAll()', () => {
    it('retourne les itinéraires planifiés du profil courant', async () => {
      mockPlanificationService.findAllForProfile.mockResolvedValue([
        { id: 'plan-1', ...dto },
      ]);

      const result = await controller.findAll(profile);

      expect(mockPlanificationService.findAllForProfile).toHaveBeenCalledWith(
        'profile-abc',
      );
      expect(result).toEqual([{ id: 'plan-1', ...dto }]);
    });
  });

  describe('remove()', () => {
    it('supprime la ligne quand elle appartient au profil courant', async () => {
      mockPlanificationService.removeForProfile.mockResolvedValue(true);

      await controller.remove(profile, 'plan-1');

      expect(mockPlanificationService.removeForProfile).toHaveBeenCalledWith(
        'plan-1',
        'profile-abc',
      );
    });

    it("lève une NotFoundException quand la ligne n'existe pas ou appartient à un autre profil", async () => {
      mockPlanificationService.removeForProfile.mockResolvedValue(false);

      await expect(controller.remove(profile, 'plan-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
