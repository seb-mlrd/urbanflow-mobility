import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlanificationService } from './planification.service.js';
import { PlannedItinerary } from './planification.entity.js';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
};

const dto = {
  fromLabel: 'Grand-Place',
  toLabel: 'Wazemmes',
  fromLat: 50.6365,
  fromLng: 3.0635,
  toLat: 50.6292,
  toLng: 3.0573,
  plannedAt: '2026-03-20T08:00:00.000Z',
  selectedModes: ['BUS', 'METRO'],
};

describe('PlanificationService', () => {
  let service: PlanificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanificationService,
        { provide: getRepositoryToken(PlannedItinerary), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PlanificationService>(PlanificationService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('convertit plannedAt en Date et attache le profileId', async () => {
      mockRepo.create.mockImplementation((v) => v);
      mockRepo.save.mockImplementation((v) => Promise.resolve(v));

      const result = await service.create('profile-123', dto);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        profileId: 'profile-123',
        plannedAt: new Date(dto.plannedAt),
      });
      expect(result.profileId).toBe('profile-123');
      expect(result.plannedAt).toEqual(new Date(dto.plannedAt));
    });
  });

  describe('findAllForProfile()', () => {
    it('retourne les itinéraires planifiés du profil, triés par date croissante', async () => {
      mockRepo.find.mockResolvedValue([{ id: 'plan-1', ...dto }]);

      const result = await service.findAllForProfile('profile-123');

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { profileId: 'profile-123' },
        order: { plannedAt: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('removeForProfile()', () => {
    it('retourne true quand une ligne appartenant au profil a été supprimée', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.removeForProfile('plan-1', 'profile-123');

      expect(mockRepo.delete).toHaveBeenCalledWith({
        id: 'plan-1',
        profileId: 'profile-123',
      });
      expect(result).toBe(true);
    });

    it("retourne false quand la ligne n'existe pas ou n'appartient pas au profil", async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });

      const result = await service.removeForProfile('plan-1', 'profile-123');

      expect(result).toBe(false);
    });
  });
});
