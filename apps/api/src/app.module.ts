import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AddressModule } from './address/address.module';
import { TransportModule } from './transport/transport.module';
import { MobilityModule } from './mobility/mobility.module';
import { JourneyHistoryModule } from './journey-history/journey-history.module';
import { PlanificationModule } from './planification/planification.module';
import { DisruptionAlertsModule } from './disruption-alerts/disruption-alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty' },
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [new Keyv({ store: new KeyvRedis(process.env.REDIS_URL) })],
      }),
    }),
    DatabaseModule,
    AuthModule,
    ProfileModule,
    AddressModule,
    TransportModule,
    MobilityModule,
    JourneyHistoryModule,
    PlanificationModule,
    DisruptionAlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
