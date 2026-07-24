import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from '../profile/profile.module.js';
import { JourneyHistory } from './journey-history.entity.js';
import { JourneyHistoryController } from './journey-history.controller.js';
import { JourneyHistoryService } from './journey-history.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([JourneyHistory]),
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
  controllers: [JourneyHistoryController],
  providers: [JourneyHistoryService],
})
export class JourneyHistoryModule {}
