import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LineSubscriptionsService } from './line-subscriptions.service.js';
import { LineSubscription } from './entities/line-subscription.entity.js';

const mockRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('LineSubscriptionsService', () => {
  let service: LineSubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineSubscriptionsService,
        { provide: getRepositoryToken(LineSubscription), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<LineSubscriptionsService>(LineSubscriptionsService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('attache le profileId à la ligne favorite créée', async () => {
      const dto = { routeGtfsId: 'ilevia:M1', routeShortName: 'M1' };
      mockRepo.create.mockImplementation((v) => v);
      mockRepo.save.mockImplementation((v) => Promise.resolve(v));

      const result = await service.create('profile-123', dto);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        profileId: 'profile-123',
      });
      expect(result.profileId).toBe('profile-123');
    });
  });

  describe('remove()', () => {
    it('lève une NotFoundException si aucune ligne ne correspond au profil', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('profile-123', 'sub-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('supprime la ligne favorite si elle appartient au profil', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(
        service.remove('profile-123', 'sub-1'),
      ).resolves.toBeUndefined();
      expect(mockRepo.delete).toHaveBeenCalledWith({
        id: 'sub-1',
        profileId: 'profile-123',
      });
    });
  });
});
