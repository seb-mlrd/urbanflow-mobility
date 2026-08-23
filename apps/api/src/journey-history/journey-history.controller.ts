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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { JourneyHistoryService } from './journey-history.service.js';
import { CreateJourneyHistoryDto } from './dto/create-journey-history.dto.js';

@ApiTags('journey-history')
@ApiBearerAuth()
@Controller('journey-history')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class JourneyHistoryController {
  constructor(private readonly journeyHistoryService: JourneyHistoryService) {}

  @ApiOperation({ summary: "Enregistre un trajet effectué dans l'historique" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentProfile() profile: Profile,
    @Body() dto: CreateJourneyHistoryDto,
  ) {
    return this.journeyHistoryService.create(profile.id, dto);
  }

  @ApiOperation({ summary: 'Récupère les statistiques mensuelles de trajets' })
  @Get('stats')
  getStats(@CurrentProfile() profile: Profile) {
    return this.journeyHistoryService.getMonthlyStats(profile.id);
  }

  @ApiOperation({ summary: 'Récupère la répartition mensuelle des émissions de CO2' })
  @ApiQuery({ name: 'months', required: false, example: '6' })
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

  @ApiOperation({ summary: "Liste l'historique de trajets récents" })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @Get()
  findAll(@CurrentProfile() profile: Profile, @Query('limit') limit?: string) {
    return this.journeyHistoryService.findRecentForProfile(
      profile.id,
      limit ? Number(limit) : undefined,
    );
  }
}
