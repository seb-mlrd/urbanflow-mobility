import {
  Body,
  Controller,
  ConflictException,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';
import { ProfileService } from './profile.service.js';

class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  transportModes?: string[];

  @IsBoolean()
  @IsOptional()
  geolocationConsent?: boolean;
}

const PG_UNIQUE_VIOLATION = '23505';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.profileService.findByUserId(req.user.sub);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const { transportModes, geolocationConsent, ...userFields } = dto;

    try {
      if (Object.keys(userFields).length > 0) {
        await this.profileService.updateUserInfo(req.user.sub, userFields);
      }
      if (transportModes !== undefined) {
        await this.profileService.updateTransportModes(
          req.user.sub,
          transportModes,
        );
      }
      if (geolocationConsent !== undefined) {
        await this.profileService.setGeolocationConsent(
          req.user.sub,
          geolocationConsent,
        );
      }
    } catch (err) {
      const code =
        err && typeof err === 'object'
          ? (err as { code?: string }).code
          : undefined;
      if (code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Cette adresse email est déjà utilisée.');
      }
      throw err;
    }

    return this.profileService.findByUserId(req.user.sub);
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
