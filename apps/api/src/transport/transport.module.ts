import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OtpAdapterService } from './otp-adapter.service.js';
import { TransportController } from './transport.controller.js';
import { CarbonService } from './carbon.service.js';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TransportController],
  providers: [OtpAdapterService, CarbonService],
})
export class TransportModule {}
