import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from '../profile/profile.module.js';
import { Address } from './address.entity.js';
import { AddressController } from './address.controller.js';
import { AddressService } from './address.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), ProfileModule],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
