import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JourneyHistory } from './journey-history.entity.js';
import { CreateJourneyHistoryDto } from './dto/create-journey-history.dto.js';

export interface MonthlyStats {
  co2GramsThisMonth: number;
  tripsThisMonth: number;
}

@Injectable()
export class JourneyHistoryService {
  constructor(
    @InjectRepository(JourneyHistory)
    private readonly journeyHistoryRepo: Repository<JourneyHistory>,
  ) {}

  findRecentForProfile(
    profileId: string,
    limit: number = 10,
  ): Promise<JourneyHistory[]> {
    return this.journeyHistoryRepo.find({
      where: { profileId },
      order: { departureAt: 'DESC' },
      take: limit,
    });
  }

  create(
    profileId: string,
    dto: CreateJourneyHistoryDto,
  ): Promise<JourneyHistory> {
    return this.journeyHistoryRepo.save(
      this.journeyHistoryRepo.create({
        ...dto,
        profileId,
        departureAt: new Date(dto.departureAt),
        arrivalAt: new Date(dto.arrivalAt),
      }),
    );
  }

  async getMonthlyStats(profileId: string): Promise<MonthlyStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const raw = await this.journeyHistoryRepo
      .createQueryBuilder('journey')
      .select('COALESCE(SUM(journey.co2Grams), 0)', 'co2Grams')
      .addSelect('COUNT(*)', 'trips')
      .where('journey.profileId = :profileId', { profileId })
      .andWhere('journey.departureAt >= :startOfMonth', { startOfMonth })
      .getRawOne<{ co2Grams: string; trips: string }>();

    return {
      co2GramsThisMonth: Number(raw?.co2Grams ?? 0),
      tripsThisMonth: Number(raw?.trips ?? 0),
    };
  }
}
