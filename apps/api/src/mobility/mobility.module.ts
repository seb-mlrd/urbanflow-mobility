import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { VlilleService } from './vlille.service.js';
import { LimeService } from './lime.service.js';
import { MobilityRefreshScheduler } from './mobility-refresh.scheduler.js';
import { MobilityController } from './mobility.controller.js';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [MobilityController],
  providers: [VlilleService, LimeService, MobilityRefreshScheduler],
})
export class MobilityModule {}
