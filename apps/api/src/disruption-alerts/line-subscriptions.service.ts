import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LineSubscription } from './entities/line-subscription.entity.js';
import { CreateLineSubscriptionDto } from './dto/create-line-subscription.dto.js';

@Injectable()
export class LineSubscriptionsService {
  constructor(
    @InjectRepository(LineSubscription)
    private readonly subscriptionRepo: Repository<LineSubscription>,
  ) {}

  findAllForProfile(profileId: string): Promise<LineSubscription[]> {
    return this.subscriptionRepo.find({
      where: { profileId },
      order: { createdAt: 'DESC' },
    });
  }

  create(
    profileId: string,
    dto: CreateLineSubscriptionDto,
  ): Promise<LineSubscription> {
    return this.subscriptionRepo.save(
      this.subscriptionRepo.create({
        ...dto,
        profileId,
      }),
    );
  }

  async remove(profileId: string, id: string): Promise<void> {
    const result = await this.subscriptionRepo.delete({ id, profileId });
    if (result.affected === 0) {
      throw new NotFoundException('Ligne favorite introuvable.');
    }
  }
}
