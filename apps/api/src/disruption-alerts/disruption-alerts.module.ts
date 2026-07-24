import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from '../profile/profile.module.js';
import { TransportModule } from '../transport/transport.module.js';
import { AlertsGateway } from './alerts.gateway.js';
import { DisruptionAlert } from './entities/disruption-alert.entity.js';
import { LineSubscription } from './entities/line-subscription.entity.js';
import { UserNotification } from './entities/user-notification.entity.js';
import { GtfsRtAlertsService } from './gtfs-rt-alerts.service.js';
import { DisruptionAlertsService } from './disruption-alerts.service.js';
import { DisruptionAlertsScheduler } from './disruption-alerts.scheduler.js';
import { LineSubscriptionsService } from './line-subscriptions.service.js';
import { LineSubscriptionsController } from './line-subscriptions.controller.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TransportModule,
    ProfileModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      DisruptionAlert,
      LineSubscription,
      UserNotification,
    ]),
  ],
  controllers: [LineSubscriptionsController, NotificationsController],
  providers: [
    GtfsRtAlertsService,
    DisruptionAlertsService,
    DisruptionAlertsScheduler,
    AlertsGateway,
    LineSubscriptionsService,
    NotificationsService,
  ],
})
export class DisruptionAlertsModule {}
