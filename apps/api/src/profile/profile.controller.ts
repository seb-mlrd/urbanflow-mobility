import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: "Récupère le profil de l'utilisateur connecté" })
  @Get()
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.profileService.findByUserId(req.user.sub);
  }

  @ApiOperation({ summary: "Met à jour le profil de l'utilisateur connecté" })
  @Patch()
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(req.user.sub, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.profileService.deleteAccount(req.user.sub);
    res.clearCookie('refresh_token', { path: '/auth' });
  }
}
