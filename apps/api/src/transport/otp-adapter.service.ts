import {
  Injectable,
  ServiceUnavailableException,
  Inject,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom, timeout } from 'rxjs';
import { CarbonService } from './carbon.service.js';

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

const ALTERNATIVE_QUERY = `
  query PlanAlternative($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $date: String!, $time: String!, $bannedRoutes: String!) {
    plan(
      from: { lat: $fromLat, lon: $fromLon }
      to: { lat: $toLat, lon: $toLon }
      date: $date
      time: $time
      numItineraries: 1
      transportModes: [{mode: TRANSIT}, {mode: WALK}]
      banned: { routes: $bannedRoutes }
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

const MODE_QUERIES = [
  {
    dominantMode: 'TRANSIT',
    query: makePlanQuery('[{mode: TRANSIT}, {mode: WALK}]', 3),
  },
  { dominantMode: 'CAR', query: makePlanQuery('[{mode: CAR}]', 1) },
  { dominantMode: 'BICYCLE', query: makePlanQuery('[{mode: BICYCLE}]', 1) },
  { dominantMode: 'WALK', query: makePlanQuery('[{mode: WALK}]', 1) },
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
  routeById: `
    query RouteById($routeId: String!) {
      route(id: $routeId) {
        shortName
        longName
      }
    }
  `,
  allRoutes: `
    query AllRoutes {
      routes {
        gtfsId
        shortName
        longName
        mode
        color
        textColor
      }
    }
  `,
};

interface OtpRouteResponse {
  data?: { route?: { shortName: string | null; longName: string | null } };
}

interface OtpRoute {
  gtfsId: string;
  shortName: string | null;
  longName: string | null;
  mode: string | null;
  color: string | null;
  textColor: string | null;
}

interface OtpAllRoutesResponse {
  data?: { routes?: OtpRoute[] };
}

@Injectable()
export class OtpAdapterService {
  private readonly logger = new Logger(OtpAdapterService.name);
  private readonly otpUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly carbonService: CarbonService,
  ) {
    this.otpUrl = this.config.getOrThrow<string>('OTP_GRAPHQL_URL');
  }

  async planAllModes(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    datetime?: string,
  ) {
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

    const itineraries: (OtpItinerary & {
      dominantMode: string;
      co2Grams: number;
    })[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        this.logger.warn(
          `OTP query [${MODE_QUERIES[i].dominantMode}] failed: ${result.reason}`,
        );
        continue;
      }
      const list =
        (result.value as OtpPlanResponse)?.data?.plan?.itineraries ?? [];
      for (const itin of list) {
        itineraries.push({
          ...itin,
          dominantMode: MODE_QUERIES[i].dominantMode,
          co2Grams: this.carbonService.computeItineraryCo2Grams(itin.legs),
        });
      }
    }

    // écart de durée/horaire plutôt qu'une égalité stricte.
    const DURATION_TOLERANCE_S = 60;
    const TIME_TOLERANCE_MS = 60_000;
    const legModes = (itin: OtpItinerary) => itin.legs.map((l) => l.mode).join('|');
    const isSameItinerary = (
      a: OtpItinerary,
      b: OtpItinerary,
    ) =>
      legModes(a) === legModes(b) &&
      Math.abs(a.duration - b.duration) <= DURATION_TOLERANCE_S &&
      Math.abs(a.startTime - b.startTime) <= TIME_TOLERANCE_MS &&
      Math.abs(a.endTime - b.endTime) <= TIME_TOLERANCE_MS;

    const dedupedItineraries: typeof itineraries = [];
    for (const itin of itineraries) {
      if (!dedupedItineraries.some((kept) => isSameItinerary(kept, itin))) {
        dedupedItineraries.push(itin);
      }
    }

    dedupedItineraries.sort((a, b) => a.duration - b.duration);

    const response = { itineraries: dedupedItineraries };
    await this.cacheManager.set(cacheKey, response, 30_000);
    return response;
  }

  async getStopsNearby(lat: number, lng: number, radius: number = 500) {
    const cacheKey = `otp:stops:${lat},${lng}:${radius}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = await this.query(QUERIES.stopsNearby, {
      lat,
      lon: lng,
      radius,
    });

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

  async planAlternative(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    bannedRouteGtfsId: string,
  ): Promise<OtpItinerary | null> {
    const dt = new Date();
    const vars = {
      fromLat,
      fromLon: fromLng,
      toLat,
      toLon: toLng,
      date: dt.toISOString().slice(0, 10),
      time: dt.toTimeString().slice(0, 8),
      bannedRoutes: bannedRouteGtfsId,
    };

    const data = (await this.query(ALTERNATIVE_QUERY, vars)) as OtpPlanResponse;
    return data?.data?.plan?.itineraries?.[0] ?? null;
  }

  async getAllRoutes() {
    const cacheKey = 'otp:routes:all';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const data = (await this.query(
      QUERIES.allRoutes,
      {},
    )) as OtpAllRoutesResponse;
    const routes = (data?.data?.routes ?? [])
      .filter((r): r is OtpRoute & { shortName: string } => !!r.shortName)
      .map((r) => ({
        gtfsId: r.gtfsId,
        shortName: r.shortName,
        longName: r.longName,
        mode: r.mode,
        color: r.color,
      }))
      .sort((a, b) =>
        a.shortName.localeCompare(b.shortName, undefined, { numeric: true }),
      );

    await this.cacheManager.set(cacheKey, routes, 3_600_000);
    return routes;
  }

  async getRouteShortName(routeGtfsId: string): Promise<string | null> {
    const cacheKey = `otp:route:${routeGtfsId}`;
    const cached = await this.cacheManager.get<string | null>(cacheKey);
    if (cached !== undefined && cached !== null) return cached;

    const data = (await this.query(QUERIES.routeById, {
      routeId: routeGtfsId,
    })) as OtpRouteResponse;
    const shortName = data?.data?.route?.shortName ?? null;

    await this.cacheManager.set(cacheKey, shortName, 3_600_000);
    return shortName;
  }

  private async query(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(this.otpUrl, { query, variables })
          .pipe(timeout(OTP_TIMEOUT_MS)),
      );
      return response.data as unknown;
    } catch {
      throw new ServiceUnavailableException('OpenTripPlanner est inaccessible');
    }
  }
}
