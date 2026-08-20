import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from '../profile/profile.module.js';
import { PlannedItinerary } from './planification.entity.js';
import { PlanificationController } from './planification.controller.js';
import { PlanificationService } from './planification.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlannedItinerary]),
    ProfileModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PlanificationController],
  providers: [PlanificationService],
})
export class PlanificationModule {}
