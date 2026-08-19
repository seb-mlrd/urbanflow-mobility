import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlannedItinerary } from './planification.entity.js';
import { CreatePlanificationDto } from './dto/create-planification.dto.js';

@Injectable()
export class PlanificationService {
  constructor(
    @InjectRepository(PlannedItinerary)
    private readonly repo: Repository<PlannedItinerary>,
  ) {}

  create(profileId: string, dto: CreatePlanificationDto): Promise<PlannedItinerary> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        profileId,
        plannedAt: new Date(dto.plannedAt),
      }),
    );
  }

  findAllForProfile(profileId: string): Promise<PlannedItinerary[]> {
    return this.repo.find({
      where: { profileId },
      order: { plannedAt: 'ASC' },
    });
  }

  async removeForProfile(id: string, profileId: string): Promise<boolean> {
    const result = await this.repo.delete({ id, profileId });
    return (result.affected ?? 0) > 0;
  }
}
