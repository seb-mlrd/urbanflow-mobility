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
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProfileService } from '../profile/profile.service.js';
import { AddressService } from './address.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  async findAll(@Request() req: any) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.addressService.findAllByProfileId(profile.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() dto: CreateAddressDto) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.addressService.create(profile.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    await this.addressService.delete(id, profile.id);
  }
}
