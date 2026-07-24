import { Controller, Get, Param, Query } from '@nestjs/common';
import { OtpAdapterService } from './otp-adapter.service.js';
import { JourneyQueryDto } from './dto/journey-query.dto.js';
import { NearbyStopsQueryDto } from './dto/nearby-stops-query.dto.js';

@Controller('transport')
export class TransportController {
  constructor(private readonly otpAdapter: OtpAdapterService) {}

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

  @Get('stops/nearby')
  getStopsNearby(@Query() dto: NearbyStopsQueryDto) {
    return this.otpAdapter.getStopsNearby(dto.lat, dto.lng, dto.radius);
  }

  @Get('departures/:stopId')
  getDepartures(@Param('stopId') stopId: string) {
    return this.otpAdapter.getDepartures(stopId);
  }

  @Get('routes')
  getAllRoutes() {
    return this.otpAdapter.getAllRoutes();
  }
}
