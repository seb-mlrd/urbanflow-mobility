import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { LineSubscriptionsService } from './line-subscriptions.service.js';
import { CreateLineSubscriptionDto } from './dto/create-line-subscription.dto.js';

@Controller('line-subscriptions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class LineSubscriptionsController {
  constructor(
    private readonly lineSubscriptionsService: LineSubscriptionsService,
  ) {}

  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.lineSubscriptionsService.findAllForProfile(profile.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentProfile() profile: Profile,
    @Body() dto: CreateLineSubscriptionDto,
  ) {
    return this.lineSubscriptionsService.create(profile.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentProfile() profile: Profile, @Param('id') id: string) {
    await this.lineSubscriptionsService.remove(profile.id, id);
  }
}
