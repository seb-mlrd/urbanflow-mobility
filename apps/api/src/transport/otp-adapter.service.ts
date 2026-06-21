import { Injectable, ServiceUnavailableException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom, timeout } from 'rxjs';

const OTP_TIMEOUT_MS = 5_000;

const QUERIES = {
  planJourney: `
    query PlanJourney($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $date: String!, $time: String!) {
      plan(
        from: { lat: $fromLat, lon: $fromLon }
        to: { lat: $toLat, lon: $toLon }
        date: $date
        time: $time
        numItineraries: 3
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
          }
        }
      }
    }
  `,
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
  private readonly otpUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.otpUrl = process.env.OTP_GRAPHQL_URL ?? 'http://localhost:8888/otp/gtfs/v1';
  }

  async planJourney(fromLat: number, fromLng: number, toLat: number, toLng: number, datetime?: string) {
    const dt = datetime ? new Date(datetime) : new Date();
    const date = dt.toISOString().slice(0, 10);
    const time = dt.toTimeString().slice(0, 8);

    const cacheKey = `otp:journey:${fromLat},${fromLng}:${toLat},${toLng}:${date}:${time}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.query(QUERIES.planJourney, {
      fromLat, fromLon: fromLng, toLat, toLon: toLng, date, time,
    });

    await this.cacheManager.set(cacheKey, data, 30_000);
    return data;
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
