import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from '../profile/profile.module.js';
import { TransportModule } from '../transport/transport.module.js';
import { AlertsGateway } from './alerts.gateway.js';
import { DisruptionAlert } from './entities/disruption-alert.entity.js';
import { LineSubscription } from './entities/line-subscription.entity.js';
import { UserNotification } from './entities/user-notification.entity.js';
import { MelPerturbationsService } from './mel-perturbations.service.js';
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
    TypeOrmModule.forFeature([
      DisruptionAlert,
      LineSubscription,
      UserNotification,
    ]),
  ],
  controllers: [LineSubscriptionsController, NotificationsController],
  providers: [
    MelPerturbationsService,
    DisruptionAlertsService,
    DisruptionAlertsScheduler,
    AlertsGateway,
    LineSubscriptionsService,
    NotificationsService,
  ],
})
export class DisruptionAlertsModule {}
