import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { JourneyHistoryService } from './journey-history.service.js';
import { CreateJourneyHistoryDto } from './dto/create-journey-history.dto.js';

@Controller('journey-history')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class JourneyHistoryController {
  constructor(private readonly journeyHistoryService: JourneyHistoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentProfile() profile: Profile,
    @Body() dto: CreateJourneyHistoryDto,
  ) {
    return this.journeyHistoryService.create(profile.id, dto);
  }

  @Get('stats')
  getStats(@CurrentProfile() profile: Profile) {
    return this.journeyHistoryService.getMonthlyStats(profile.id);
  }

  @Get('monthly-breakdown')
  getMonthlyBreakdown(
    @CurrentProfile() profile: Profile,
    @Query('months') months?: string,
  ) {
    return this.journeyHistoryService.getMonthlyCo2Breakdown(
      profile.id,
      months ? Number(months) : undefined,
    );
  }

  @Get()
  findAll(@CurrentProfile() profile: Profile, @Query('limit') limit?: string) {
    return this.journeyHistoryService.findRecentForProfile(
      profile.id,
      limit ? Number(limit) : undefined,
    );
  }
}
