import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VlilleService } from './vlille.service.js';
import { LimeService } from './lime.service.js';

@ApiTags('mobility')
@Controller('mobility')
export class MobilityController {
  constructor(
    private readonly vlilleService: VlilleService,
    private readonly limeService: LimeService,
  ) {}

  @ApiOperation({ summary: "Récupère l'état des stations de vélos V'Lille" })
  @Get('bikes')
  getBikes() {
    return this.vlilleService.getSnapshotOrThrow();
  }

  @ApiOperation({
    summary: 'Récupère la position des trottinettes Lime disponibles',
  })
  @Get('scooters')
  getScooters() {
    return this.limeService.getSnapshotOrThrow();
  }
}
