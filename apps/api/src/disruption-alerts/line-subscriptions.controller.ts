import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';
import { ProfileService } from '../profile/profile.service.js';
import { LineSubscriptionsService } from './line-subscriptions.service.js';
import { CreateLineSubscriptionDto } from './dto/create-line-subscription.dto.js';

@Controller('line-subscriptions')
@UseGuards(JwtAuthGuard)
export class LineSubscriptionsController {
  constructor(
    private readonly lineSubscriptionsService: LineSubscriptionsService,
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.lineSubscriptionsService.findAllForProfile(profile.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateLineSubscriptionDto,
  ) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.lineSubscriptionsService.create(profile.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    await this.lineSubscriptionsService.remove(profile.id, id);
  }
}
