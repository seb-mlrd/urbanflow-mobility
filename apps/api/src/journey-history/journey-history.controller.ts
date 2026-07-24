import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';
import { ProfileService } from '../profile/profile.service.js';
import { JourneyHistoryService } from './journey-history.service.js';
import { CreateJourneyHistoryDto } from './dto/create-journey-history.dto.js';

@Controller('journey-history')
@UseGuards(JwtAuthGuard)
export class JourneyHistoryController {
  constructor(
    private readonly journeyHistoryService: JourneyHistoryService,
    private readonly profileService: ProfileService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateJourneyHistoryDto,
  ) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.journeyHistoryService.create(profile.id, dto);
  }

  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.journeyHistoryService.getMonthlyStats(profile.id);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.journeyHistoryService.findRecentForProfile(profile.id);
  }
}
