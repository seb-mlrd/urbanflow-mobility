import {
  Injectable,
  Inject,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom, timeout } from 'rxjs';
import type { Scooter, MobilitySnapshot } from '@urbanflow/shared';

const FETCH_TIMEOUT_MS = 5_000;

interface LimeVehicle {
  bike_id: string;
  lat: number;
  lon: number;
  is_reserved: boolean;
  is_disabled: boolean;
  current_range_meters: number;
  last_reported: number;
  vehicle_type: 'scooter' | 'e-bike';
}

interface LimeFreeBikeStatusResponse {
  last_updated: number;
  data: { bikes: LimeVehicle[] };
}

@Injectable()
export class LimeService {
  static readonly CACHE_KEY = 'mobility:lime:scooters';
  private static readonly TTL_MS = 300_000;

  private readonly logger = new Logger(LimeService.name);
  private readonly feedUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.feedUrl = this.config.getOrThrow<string>(
      'GBFS_LIME_FREE_BIKE_STATUS_URL',
    );
  }

  async refresh(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.httpService
          .get<LimeFreeBikeStatusResponse>(this.feedUrl)
          .pipe(timeout(FETCH_TIMEOUT_MS)),
      );

      const scooters: Scooter[] = res.data.data.bikes
        .filter((b) => b.vehicle_type === 'scooter')
        .map((b) => ({
          id: b.bike_id,
          lat: b.lat,
          lon: b.lon,
          rangeMeters: b.current_range_meters,
          isDisabled: b.is_disabled,
          isReserved: b.is_reserved,
          lastReported: b.last_reported,
        }));

      const snapshot: MobilitySnapshot<Scooter> = {
        vehicles: scooters,
        lastUpdated: res.data.last_updated,
        fetchedAt: Date.now(),
      };

      await this.cacheManager.set(
        LimeService.CACHE_KEY,
        snapshot,
        LimeService.TTL_MS,
      );
    } catch (err) {
      this.logger.warn(`Échec du rafraîchissement Lime: ${String(err)}`);
    }
  }

  async getSnapshotOrThrow(): Promise<MobilitySnapshot<Scooter>> {
    const snapshot = await this.cacheManager.get<MobilitySnapshot<Scooter>>(
      LimeService.CACHE_KEY,
    );
    if (!snapshot) {
      throw new ServiceUnavailableException(
        'Les données des trottinettes sont indisponibles',
      );
    }
    return snapshot;
  }
}
