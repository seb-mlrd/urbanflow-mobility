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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { PlanificationService } from './planification.service.js';
import { CreatePlanificationDto } from './dto/create-planification.dto.js';

@ApiTags('planification')
@ApiBearerAuth()
@Controller('planification')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class PlanificationController {
  constructor(private readonly planificationService: PlanificationService) {}

  @ApiOperation({ summary: 'Planifie un trajet futur' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentProfile() profile: Profile,
    @Body() dto: CreatePlanificationDto,
  ) {
    return this.planificationService.create(profile.id, dto);
  }

  @ApiOperation({ summary: 'Liste les trajets planifiés' })
  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.planificationService.findAllForProfile(profile.id);
  }

  @ApiOperation({ summary: 'Supprime un trajet planifié' })
  @ApiParam({ name: 'id', example: 'c1a9c2c0-6b1d-4b8e-9c1a-3c1f2b3a4d5e' })
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
