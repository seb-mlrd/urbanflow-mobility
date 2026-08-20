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
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';
import { ProfileService } from '../profile/profile.service.js';
import { PlanificationService } from './planification.service.js';
import { CreatePlanificationDto } from './dto/create-planification.dto.js';

@Controller('planification')
@UseGuards(JwtAuthGuard)
export class PlanificationController {
  constructor(
    private readonly planificationService: PlanificationService,
    private readonly profileService: ProfileService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePlanificationDto,
  ) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.planificationService.create(profile.id, dto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.planificationService.findAllForProfile(profile.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    const deleted = await this.planificationService.removeForProfile(
      id,
      profile.id,
    );
    if (!deleted) throw new NotFoundException();
  }
}
