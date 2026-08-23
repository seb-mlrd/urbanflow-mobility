import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { AddressService } from './address.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.addressService.findAllByProfileId(profile.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentProfile() profile: Profile, @Body() dto: CreateAddressDto) {
    return this.addressService.create(profile.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentProfile() profile: Profile,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.addressService.delete(id, profile.id);
  }
}
