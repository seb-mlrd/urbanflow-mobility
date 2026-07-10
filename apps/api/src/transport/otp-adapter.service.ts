import { Injectable, ServiceUnavailableException, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom, timeout } from 'rxjs';

const OTP_TIMEOUT_MS = 5_000;

interface OtpLeg {
  mode: string;
  startTime: number;
  endTime: number;
  distance: number;
  from: { name: string; lat: number; lon: number };
  to: { name: string; lat: number; lon: number };
  route: { shortName: string; longName: string } | null;
  legGeometry: { points: string } | null;
}

interface OtpItinerary {
  duration: number;
  startTime: number;
  endTime: number;
  legs: OtpLeg[];
}

interface OtpPlanResponse {
  data?: { plan?: { itineraries: OtpItinerary[] } };
}

function makePlanQuery(transportModes: string, numItineraries: number): string {
  return `
    query PlanJourney($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $date: String!, $time: String!) {
      plan(
        from: { lat: $fromLat, lon: $fromLon }
        to: { lat: $toLat, lon: $toLon }
        date: $date
        time: $time
        numItineraries: ${numItineraries}
        transportModes: ${transportModes}
      ) {
        itineraries {
          duration
          startTime
          endTime
          legs {
            mode
            startTime
            endTime
            distance
            from { name lat lon }
            to { name lat lon }
            route { shortName longName }
            legGeometry { points }
          }
        }
      }
    }
  `;
}

const MODE_QUERIES = [
  { dominantMode: 'TRANSIT', query: makePlanQuery('[{mode: TRANSIT}, {mode: WALK}]', 3) },
  { dominantMode: 'CAR',     query: makePlanQuery('[{mode: CAR}]', 1) },
  { dominantMode: 'BICYCLE', query: makePlanQuery('[{mode: BICYCLE}]', 1) },
  { dominantMode: 'WALK',    query: makePlanQuery('[{mode: WALK}]', 1) },
];

const QUERIES = {
  stopsNearby: `
    query StopsNearby($lat: Float!, $lon: Float!, $radius: Int!) {
      stopsByRadius(lat: $lat, lon: $lon, radius: $radius) {
        edges {
          node {
            distance
            stop {
              gtfsId
              name
              lat
              lon
              vehicleMode
            }
          }
        }
      }
    }
  `,
  departures: `
    query Departures($stopId: String!) {
      stop(id: $stopId) {
        name
        stoptimesWithoutPatterns(numberOfDepartures: 10, omitCanceled: false) {
          scheduledDeparture
          realtimeDeparture
          realtime
          serviceDay
          trip {
            route { shortName longName }
            tripHeadsign
          }
        }
      }
    }
  `,
};

@Injectable()
export class OtpAdapterService {
  private readonly logger = new Logger(OtpAdapterService.name);
  private readonly otpUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.otpUrl = this.config.getOrThrow<string>('OTP_GRAPHQL_URL');
  }

  async planAllModes(fromLat: number, fromLng: number, toLat: number, toLng: number, datetime?: string) {
    const dt = datetime ? new Date(datetime) : new Date();
    const date = dt.toISOString().slice(0, 10);
    const time = dt.toTimeString().slice(0, 8);
    const vars = { fromLat, fromLon: fromLng, toLat, toLon: toLng, date, time };

    const r = (n: number) => n.toFixed(4);
    const cacheKey = `otp:journey-all:${r(fromLat)},${r(fromLng)}:${r(toLat)},${r(toLng)}:${date}:${time}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const results = await Promise.allSettled(
      MODE_QUERIES.map(({ query }) => this.query(query, vars)),
    );

    const itineraries: (OtpItinerary & { dominantMode: string })[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        this.logger.warn(`OTP query [${MODE_QUERIES[i].dominantMode}] failed: ${result.reason}`);
        continue;
      }
      const list = (result.value as OtpPlanResponse)?.data?.plan?.itineraries ?? [];
      for (const itin of list) {
        itineraries.push({ ...itin, dominantMode: MODE_QUERIES[i].dominantMode });
      }
    }

    itineraries.sort((a, b) => a.duration - b.duration);

    const response = { itineraries };
    await this.cacheManager.set(cacheKey, response, 30_000);
    return response;
  }

  async getStopsNearby(lat: number, lng: number, radius: number = 500) {
    const cacheKey = `otp:stops:${lat},${lng}:${radius}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.query(QUERIES.stopsNearby, { lat, lon: lng, radius });

    await this.cacheManager.set(cacheKey, data, 3_600_000);
    return data;
  }

  async getDepartures(stopId: string) {
    const cacheKey = `otp:departures:${stopId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.query(QUERIES.departures, { stopId });

    await this.cacheManager.set(cacheKey, data, 20_000);
    return data;
  }

  private async query(query: string, variables: Record<string, unknown>) {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(this.otpUrl, { query, variables })
          .pipe(timeout(OTP_TIMEOUT_MS)),
      );
      return response.data;
    } catch {
      throw new ServiceUnavailableException('OpenTripPlanner est inaccessible');
    }
  }
}
