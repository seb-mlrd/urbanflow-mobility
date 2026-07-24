import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const FETCH_TIMEOUT_MS = 5_000;

const SEVERITY_LABELS: Record<number, string> = {
  1: 'UNKNOWN',
  2: 'INFO',
  3: 'WARNING',
  4: 'SEVERE',
};

export interface GtfsRtAlert {
  gtfsAlertId: string;
  routeGtfsId: string;
  headerText: string;
  descriptionText: string | null;
  severity: string;
  effectiveStart: Date | null;
  effectiveEnd: Date | null;
}

@Injectable()
export class GtfsRtAlertsService {
  private readonly logger = new Logger(GtfsRtAlertsService.name);
  private readonly feedUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.feedUrl = this.config.getOrThrow<string>('GTFS_RT_ALERTS_URL');
  }

  async fetchAlerts(): Promise<GtfsRtAlert[]> {
    const response = await firstValueFrom(
      this.httpService
        .get<ArrayBuffer>(this.feedUrl, { responseType: 'arraybuffer' })
        .pipe(timeout(FETCH_TIMEOUT_MS)),
    );

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(response.data),
    );

    const alerts: GtfsRtAlert[] = [];
    for (const entity of feed.entity) {
      if (!entity.alert) continue;
      const alert = entity.alert;

      const routeGtfsId = alert.informedEntity?.find(
        (selector) => !!selector.routeId,
      )?.routeId;
      if (!routeGtfsId) {
        this.logger.debug(
          `Alerte GTFS-RT ${entity.id} ignorée : aucune ligne concernée.`,
        );
        continue;
      }

      const activePeriod = alert.activePeriod?.[0];

      alerts.push({
        gtfsAlertId: entity.id,
        routeGtfsId,
        headerText: alert.headerText?.translation?.[0]?.text ?? 'Perturbation',
        descriptionText: alert.descriptionText?.translation?.[0]?.text ?? null,
        severity: SEVERITY_LABELS[alert.severityLevel ?? 1] ?? 'UNKNOWN',
        effectiveStart: toDate(activePeriod?.start),
        effectiveEnd: toDate(activePeriod?.end),
      });
    }

    return alerts;
  }
}

function toDate(
  epochSeconds: number | { toNumber(): number } | null | undefined,
): Date | null {
  if (epochSeconds === null || epochSeconds === undefined) return null;
  const seconds =
    typeof epochSeconds === 'number' ? epochSeconds : epochSeconds.toNumber();
  return new Date(seconds * 1000);
}
