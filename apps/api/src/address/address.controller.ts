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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { AddressService } from './address.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({ summary: "Liste les adresses enregistrées de l'utilisateur" })
  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.addressService.findAllByProfileId(profile.id);
  }

  @ApiOperation({ summary: 'Ajoute une nouvelle adresse enregistrée' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentProfile() profile: Profile, @Body() dto: CreateAddressDto) {
    return this.addressService.create(profile.id, dto);
  }

  @ApiOperation({ summary: 'Supprime une adresse enregistrée' })
  @ApiParam({ name: 'id', example: 'c1a9c2c0-6b1d-4b8e-9c1a-3c1f2b3a4d5e' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentProfile() profile: Profile,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.addressService.delete(id, profile.id);
  }
}
