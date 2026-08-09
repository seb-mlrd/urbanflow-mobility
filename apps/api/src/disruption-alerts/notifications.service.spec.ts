import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { UserNotification } from './entities/user-notification.entity.js';
import { LineSubscription } from './entities/line-subscription.entity.js';
import { DisruptionAlert } from './entities/disruption-alert.entity.js';

const mockRepo = {
  find: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
};

const mockLineSubscriptionRepo = {
  count: jest.fn(),
};

const mockAlertRepo = {
  find: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(UserNotification), useValue: mockRepo },
        {
          provide: getRepositoryToken(LineSubscription),
          useValue: mockLineSubscriptionRepo,
        },
        {
          provide: getRepositoryToken(DisruptionAlert),
          useValue: mockAlertRepo,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('countUnread()', () => {
    it('compte les notifications non lues du profil', async () => {
      mockRepo.count.mockResolvedValue(3);

      const result = await service.countUnread('profile-123');

      expect(mockRepo.count).toHaveBeenCalledWith({
        where: { profileId: 'profile-123', read: false },
      });
      expect(result).toBe(3);
    });
  });

  describe('markRead()', () => {
    it('lève une NotFoundException si la notification n’appartient pas au profil', async () => {
      mockRepo.update.mockResolvedValue({ affected: 0 });

      await expect(service.markRead('profile-123', 'notif-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('marque la notification comme lue', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });

      await expect(
        service.markRead('profile-123', 'notif-1'),
      ).resolves.toBeUndefined();
      expect(mockRepo.update).toHaveBeenCalledWith(
        { id: 'notif-1', profileId: 'profile-123' },
        { read: true },
      );
    });
  });

  describe('markAllRead()', () => {
    it('marque toutes les notifications non lues du profil comme lues', async () => {
      await service.markAllRead('profile-123');

      expect(mockRepo.update).toHaveBeenCalledWith(
        { profileId: 'profile-123', read: false },
        { read: true },
      );
    });
  });
});
