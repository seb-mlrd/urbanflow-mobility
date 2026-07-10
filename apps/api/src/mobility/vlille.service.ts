import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom, timeout } from 'rxjs';
import type { BikeStation, MobilitySnapshot } from '@urbanflow/shared';

const FETCH_TIMEOUT_MS = 5_000;

interface VlilleStationInformation {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
}

interface VlilleStationInformationResponse {
  data: { stations: VlilleStationInformation[] };
}

interface VlilleStationStatus {
  station_id: string;
  num_bikes_available: number;
  num_docks_available: number;
  is_renting: boolean;
  is_returning: boolean;
  last_reported: number;
}

interface VlilleStationStatusResponse {
  last_updated: number;
  data: { stations: VlilleStationStatus[] };
}

@Injectable()
export class VlilleService {
  static readonly CACHE_KEY = 'mobility:vlille:stations';
  private static readonly TTL_MS = 300_000;

  private readonly logger = new Logger(VlilleService.name);
  private readonly infoUrl: string;
  private readonly statusUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.infoUrl = this.config.getOrThrow<string>(
      'GBFS_VLILLE_STATION_INFORMATION_URL',
    );
    this.statusUrl = this.config.getOrThrow<string>(
      'GBFS_VLILLE_STATION_STATUS_URL',
    );
  }

  async refresh(): Promise<void> {
    try {
      const [infoRes, statusRes] = await Promise.all([
        firstValueFrom(
          this.httpService
            .get<VlilleStationInformationResponse>(this.infoUrl)
            .pipe(timeout(FETCH_TIMEOUT_MS)),
        ),
        firstValueFrom(
          this.httpService
            .get<VlilleStationStatusResponse>(this.statusUrl)
            .pipe(timeout(FETCH_TIMEOUT_MS)),
        ),
      ]);

      const snapshot: MobilitySnapshot<BikeStation> = {
        vehicles: this.merge(infoRes.data, statusRes.data),
        lastUpdated: statusRes.data.last_updated,
        fetchedAt: Date.now(),
      };

      await this.cacheManager.set(
        VlilleService.CACHE_KEY,
        snapshot,
        VlilleService.TTL_MS,
      );
    } catch (err) {
      this.logger.warn(`Échec du rafraîchissement V'Lille: ${String(err)}`);
    }
  }

  private merge(
    info: VlilleStationInformationResponse,
    status: VlilleStationStatusResponse,
  ): BikeStation[] {
    const statusById = new Map(
      status.data.stations.map((s) => [s.station_id, s]),
    );

    const stations: BikeStation[] = [];
    for (const s of info.data.stations) {
      const st = statusById.get(s.station_id);
      if (!st) continue;
      stations.push({
        id: s.station_id,
        name: s.name,
        lat: s.lat,
        lon: s.lon,
        capacity: s.capacity,
        bikesAvailable: st.num_bikes_available,
        docksAvailable: st.num_docks_available,
        isRenting: st.is_renting,
        isReturning: st.is_returning,
        lastReported: st.last_reported,
      });
    }
    return stations;
  }
}
