import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { OtpAdapterService } from './otp-adapter.service.js';
import { JourneyQueryDto } from './dto/journey-query.dto.js';
import { NearbyStopsQueryDto } from './dto/nearby-stops-query.dto.js';

@ApiTags('transport')
@Controller('transport')
export class TransportController {
  constructor(private readonly otpAdapter: OtpAdapterService) {}

  @ApiOperation({ summary: 'Planifie un trajet multimodal entre deux points' })
  @Get('journey')
  planJourney(@Query() dto: JourneyQueryDto) {
    return this.otpAdapter.planAllModes(
      dto.fromLat,
      dto.fromLng,
      dto.toLat,
      dto.toLng,
      dto.datetime,
    );
  }

  @ApiOperation({ summary: 'Liste les arrêts de transport à proximité' })
  @Get('stops/nearby')
  getStopsNearby(@Query() dto: NearbyStopsQueryDto) {
    return this.otpAdapter.getStopsNearby(dto.lat, dto.lng, dto.radius);
  }

  @ApiOperation({ summary: "Liste les prochains départs pour un arrêt donné" })
  @ApiParam({ name: 'stopId', example: 'STIF:StopPoint:Q:41115:' })
  @Get('departures/:stopId')
  getDepartures(@Param('stopId') stopId: string) {
    return this.otpAdapter.getDepartures(stopId);
  }

  @ApiOperation({ summary: 'Liste toutes les lignes de transport disponibles' })
  @Get('routes')
  getAllRoutes() {
    return this.otpAdapter.getAllRoutes();
  }
}
