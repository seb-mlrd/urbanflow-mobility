import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JourneyHistory } from './journey-history.entity.js';
import { CreateJourneyHistoryDto } from './dto/create-journey-history.dto.js';

export interface MonthlyStats {
  co2GramsThisMonth: number;
  tripsThisMonth: number;
  distanceMetersThisMonth: number;
  durationSecondsThisMonth: number;
}

export interface MonthlyCo2Point {
  month: string;
  co2Grams: number;
}

@Injectable()
export class JourneyHistoryService {
  constructor(
    @InjectRepository(JourneyHistory)
    private readonly journeyHistoryRepo: Repository<JourneyHistory>,
  ) {}

  findRecentForProfile(
    profileId: string,
    limit: number = 50,
  ): Promise<JourneyHistory[]> {
    return this.journeyHistoryRepo.find({
      where: { profileId },
      order: { departureAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 100),
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
      .addSelect('COALESCE(SUM(journey.distanceMeters), 0)', 'distanceMeters')
      .addSelect('COALESCE(SUM(journey.durationSeconds), 0)', 'durationSeconds')
      .where('journey.profileId = :profileId', { profileId })
      .andWhere('journey.departureAt >= :startOfMonth', { startOfMonth })
      .getRawOne<{
        co2Grams: string;
        trips: string;
        distanceMeters: string;
        durationSeconds: string;
      }>();

    return {
      co2GramsThisMonth: Number(raw?.co2Grams ?? 0),
      tripsThisMonth: Number(raw?.trips ?? 0),
      distanceMetersThisMonth: Number(raw?.distanceMeters ?? 0),
      durationSecondsThisMonth: Number(raw?.durationSeconds ?? 0),
    };
  }

  async getMonthlyCo2Breakdown(
    profileId: string,
    months: number = 6,
  ): Promise<MonthlyCo2Point[]> {
    const monthCount = Math.min(Math.max(months, 1), 24);
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

    const rows = await this.journeyHistoryRepo
      .createQueryBuilder('journey')
      .select("to_char(date_trunc('month', journey.departureAt), 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(journey.co2Grams), 0)', 'co2Grams')
      .where('journey.profileId = :profileId', { profileId })
      .andWhere('journey.departureAt >= :startMonth', { startMonth })
      .groupBy("date_trunc('month', journey.departureAt)")
      .orderBy("date_trunc('month', journey.departureAt)", 'ASC')
      .getRawMany<{ month: string; co2Grams: string }>();

    const byMonth = new Map(rows.map((r) => [r.month, Number(r.co2Grams)]));

    return Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { month: key, co2Grams: byMonth.get(key) ?? 0 };
    });
  }
}
