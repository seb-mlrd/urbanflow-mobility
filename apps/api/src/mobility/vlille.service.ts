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
import type { BikeStation, MobilitySnapshot } from '@urbanflow/shared';
import { fetchGbfsResource } from './gbfs.util.js';

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
      const [info, status] = await Promise.all([
        fetchGbfsResource<VlilleStationInformationResponse>(
          this.httpService,
          this.infoUrl,
        ),
        fetchGbfsResource<VlilleStationStatusResponse>(
          this.httpService,
          this.statusUrl,
        ),
      ]);

      const snapshot: MobilitySnapshot<BikeStation> = {
        vehicles: this.merge(info, status),
        lastUpdated: status.last_updated,
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

  async getSnapshotOrThrow(): Promise<MobilitySnapshot<BikeStation>> {
    const snapshot = await this.cacheManager.get<MobilitySnapshot<BikeStation>>(
      VlilleService.CACHE_KEY,
    );
    if (!snapshot) {
      throw new ServiceUnavailableException(
        "Les données V'Lille sont indisponibles",
      );
    }
    return snapshot;
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
