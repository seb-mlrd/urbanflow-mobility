import {
  Body,
  Controller,
  ConflictException,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
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
}

const PG_UNIQUE_VIOLATION = '23505';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req: any) {
    return this.profileService.findByUserId(req.user.sub);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    const { transportModes, ...userFields } = dto;

    try {
      if (Object.keys(userFields).length > 0) {
        await this.profileService.updateUserInfo(req.user.sub, userFields);
      }

      if (transportModes !== undefined) {
        await this.profileService.updateTransportModes(req.user.sub, transportModes);
      }
    } catch (err: any) {
      if (err?.code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Cette adresse email est déjà utilisée.');
      }
      throw err;
    }

    return this.profileService.findByUserId(req.user.sub);
  }
}
