import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OtpAdapterService } from './otp-adapter.service.js';
import { TransportController } from './transport.controller.js';

@Module({
  imports: [HttpModule],
  controllers: [TransportController],
  providers: [OtpAdapterService],
})
export class TransportModule {}
