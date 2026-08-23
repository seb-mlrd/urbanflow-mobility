import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from '../profile/profile.module.js';
import { PlannedItinerary } from './planification.entity.js';
import { PlanificationController } from './planification.controller.js';
import { PlanificationService } from './planification.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([PlannedItinerary]), ProfileModule],
  controllers: [PlanificationController],
  providers: [PlanificationService],
})
export class PlanificationModule {}
