import { Injectable, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { VlilleService } from './vlille.service.js';
import { LimeService } from './lime.service.js';

const REFRESH_INTERVAL_MS = 60_000;

@Injectable()
export class MobilityRefreshScheduler implements OnModuleInit {
  constructor(
    private readonly vlille: VlilleService,
    private readonly lime: LimeService,
  ) {}

  async onModuleInit() {
    await Promise.allSettled([this.vlille.refresh(), this.lime.refresh()]);
  }

  @Interval(REFRESH_INTERVAL_MS)
  async refreshVlille() {
    await this.vlille.refresh();
  }

  @Interval(REFRESH_INTERVAL_MS)
  async refreshLime() {
    await this.lime.refresh();
  }
}
