import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { VlilleService } from './vlille.service.js';
import { LimeService } from './lime.service.js';

@Controller('mobility')
export class MobilityController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @Get('bikes')
  async getBikes() {
    const data = await this.cacheManager.get(VlilleService.CACHE_KEY);
    if (!data)
      throw new ServiceUnavailableException(
        "Les données V'Lille sont indisponibles",
      );
    return data;
  }

  @Get('scooters')
  async getScooters() {
    const data = await this.cacheManager.get(LimeService.CACHE_KEY);
    if (!data)
      throw new ServiceUnavailableException(
        'Les données des trottinettes sont indisponibles',
      );
    return data;
  }
}
