import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from '../profile/profile.module.js';
import { JourneyHistory } from './journey-history.entity.js';
import { JourneyHistoryController } from './journey-history.controller.js';
import { JourneyHistoryService } from './journey-history.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([JourneyHistory]), ProfileModule],
  controllers: [JourneyHistoryController],
  providers: [JourneyHistoryService],
})
export class JourneyHistoryModule {}
