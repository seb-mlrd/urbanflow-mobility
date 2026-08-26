import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
import { OtpAdapterService } from '../transport/otp-adapter.service.js';

const FETCH_TIMEOUT_MS = 5_000;

interface MelPerturbationFeature {
  properties: {
    identifiant_perturbation: string;
    type_perturbation: string | null;
    cible: string | null;
    message: string | null;
    heure_fin_prevue: string | null;
  };
}

interface MelPerturbationsResponse {
  features: MelPerturbationFeature[];
}

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
export class MelPerturbationsService {
  private readonly logger = new Logger(MelPerturbationsService.name);
  private readonly feedUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly otpAdapterService: OtpAdapterService,
  ) {
    this.feedUrl = this.config.getOrThrow<string>('MEL_PERTURBATIONS_URL');
  }

  async fetchAlerts(): Promise<GtfsRtAlert[]> {
    const response = await firstValueFrom(
      this.httpService
        .get<MelPerturbationsResponse>(this.feedUrl)
        .pipe(timeout(FETCH_TIMEOUT_MS)),
    );

    const routes = (await this.otpAdapterService.getAllRoutes()) as Array<{
      gtfsId: string;
      shortName: string;
    }>;
    const routeByShortName = new Map(
      routes.map((r) => [r.shortName, r.gtfsId]),
    );

    const alerts: GtfsRtAlert[] = [];
    for (const feature of response.data.features) {
      const p = feature.properties;

      const lineCode = extractLineCode(p.cible);
      const routeGtfsId = lineCode ? routeByShortName.get(lineCode) : undefined;
      if (!routeGtfsId) {
        this.logger.debug(
          `Perturbation MEL ${p.identifiant_perturbation} ignorée : ligne "${lineCode}" non résolue.`,
        );
        continue;
      }

      const text = stripHtml(p.message ?? '');

      alerts.push({
        gtfsAlertId: p.identifiant_perturbation,
        routeGtfsId,
        headerText: summarize(text) || 'Perturbation',
        descriptionText: text || null,
        // L'API MEL n'expose qu'un seul type_perturbation ("Information") pour le moment.
        severity: 'INFO',
        effectiveStart: null,
        effectiveEnd: toDate(p.heure_fin_prevue),
      });
    }

    return alerts;
  }
}

function extractLineCode(cible: string | null): string | null {
  if (!cible) return null;
  return cible.split('::')[1]?.split(':')[0] ?? null;
}

function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const HEADER_MAX_LENGTH = 100;

function summarize(text: string): string {
  if (text.length <= HEADER_MAX_LENGTH) return text;
  const truncated = text.slice(0, HEADER_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : HEADER_MAX_LENGTH)}…`;
}

function toDate(isoString: string | null): Date | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? null : date;
}
