import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisruptionAlert } from './entities/disruption-alert.entity.js';
import { LineSubscription } from './entities/line-subscription.entity.js';
import { UserNotification } from './entities/user-notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly notificationRepo: Repository<UserNotification>,
    @InjectRepository(LineSubscription)
    private readonly subscriptionRepo: Repository<LineSubscription>,
    @InjectRepository(DisruptionAlert)
    private readonly alertRepo: Repository<DisruptionAlert>,
  ) {}

  async findAllForProfile(profileId: string): Promise<UserNotification[]> {
    const hasFavoriteLines =
      (await this.subscriptionRepo.count({ where: { profileId } })) > 0;

    if (hasFavoriteLines) {
      return this.notificationRepo.find({
        where: { profileId },
        relations: { alert: true },
        order: { createdAt: 'DESC' },
      });
    }

    const activeAlerts = await this.alertRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    return activeAlerts.map((alert) =>
      this.notificationRepo.create({
        id: alert.id,
        profileId,
        alertId: alert.id,
        alert,
        read: true,
        alternativeItinerary: null,
        createdAt: alert.createdAt,
      }),
    );
  }

  countUnread(profileId: string): Promise<number> {
    return this.notificationRepo.count({ where: { profileId, read: false } });
  }

  async markRead(profileId: string, id: string): Promise<void> {
    const result = await this.notificationRepo.update(
      { id, profileId },
      { read: true },
    );
    if (result.affected === 0) {
      throw new NotFoundException('Notification introuvable.');
    }
  }

  async markAllRead(profileId: string): Promise<void> {
    await this.notificationRepo.update(
      { profileId, read: false },
      { read: true },
    );
  }
}
