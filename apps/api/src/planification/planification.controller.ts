import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { PlanificationService } from './planification.service.js';
import { CreatePlanificationDto } from './dto/create-planification.dto.js';

@Controller('planification')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class PlanificationController {
  constructor(private readonly planificationService: PlanificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentProfile() profile: Profile,
    @Body() dto: CreatePlanificationDto,
  ) {
    return this.planificationService.create(profile.id, dto);
  }

  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.planificationService.findAllForProfile(profile.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentProfile() profile: Profile, @Param('id') id: string) {
    const deleted = await this.planificationService.removeForProfile(
      id,
      profile.id,
    );
    if (!deleted) throw new NotFoundException();
  }
}
