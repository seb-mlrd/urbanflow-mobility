import { Controller, Get } from '@nestjs/common';
import { VlilleService } from './vlille.service.js';
import { LimeService } from './lime.service.js';

@Controller('mobility')
export class MobilityController {
  constructor(
    private readonly vlilleService: VlilleService,
    private readonly limeService: LimeService,
  ) {}

  @Get('bikes')
  getBikes() {
    return this.vlilleService.getSnapshotOrThrow();
  }

  @Get('scooters')
  getScooters() {
    return this.limeService.getSnapshotOrThrow();
  }
}
