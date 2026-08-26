import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { DisruptionAlertsService } from './disruption-alerts.service.js';

const REFRESH_INTERVAL_MS = 60_000;

@Injectable()
export class DisruptionAlertsScheduler implements OnModuleInit {
  constructor(
    private readonly disruptionAlertsService: DisruptionAlertsService,
  ) {}

  async onModuleInit() {
    await this.disruptionAlertsService.refresh();
  }

  @Interval(REFRESH_INTERVAL_MS)
  async refresh() {
    await this.disruptionAlertsService.refresh();
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanup() {
    await this.disruptionAlertsService.cleanupOldData();
  }
}
