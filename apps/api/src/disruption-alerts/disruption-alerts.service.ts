import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OtpAdapterService } from '../transport/otp-adapter.service.js';
import { AlertsGateway } from './alerts.gateway.js';
import { DisruptionAlert } from './entities/disruption-alert.entity.js';
import { LineSubscription } from './entities/line-subscription.entity.js';
import { UserNotification } from './entities/user-notification.entity.js';
import { GtfsRtAlertsService } from './gtfs-rt-alerts.service.js';

@Injectable()
export class DisruptionAlertsService {
  private readonly logger = new Logger(DisruptionAlertsService.name);

  constructor(
    private readonly gtfsRtAlertsService: GtfsRtAlertsService,
    private readonly otpAdapterService: OtpAdapterService,
    private readonly alertsGateway: AlertsGateway,
    @InjectRepository(DisruptionAlert)
    private readonly alertRepo: Repository<DisruptionAlert>,
    @InjectRepository(LineSubscription)
    private readonly subscriptionRepo: Repository<LineSubscription>,
    @InjectRepository(UserNotification)
    private readonly notificationRepo: Repository<UserNotification>,
  ) {}

  async refresh(): Promise<void> {
    let liveAlerts;
    try {
      liveAlerts = await this.gtfsRtAlertsService.fetchAlerts();
    } catch (err) {
      this.logger.warn(
        `Échec du rafraîchissement des alertes GTFS-RT: ${String(err)}`,
      );
      return;
    }

    const liveIds = new Set(liveAlerts.map((a) => a.gtfsAlertId));
    const previouslyActive = await this.alertRepo.find({
      where: { isActive: true },
    });
    const staleAlerts = previouslyActive.filter(
      (a) => !liveIds.has(a.gtfsAlertId),
    );
    if (staleAlerts.length > 0) {
      await this.alertRepo.update(
        { id: In(staleAlerts.map((a) => a.id)) },
        { isActive: false },
      );
    }

    for (const live of liveAlerts) {
      const existing = await this.alertRepo.findOne({
        where: { gtfsAlertId: live.gtfsAlertId },
      });

      if (
        existing &&
        existing.headerText === live.headerText &&
        existing.isActive
      ) {
        continue;
      }

      const routeShortName =
        (await this.otpAdapterService
          .getRouteShortName(live.routeGtfsId)
          .catch(() => null)) ?? live.routeGtfsId;

      const saved = await this.alertRepo.save(
        this.alertRepo.create({
          ...existing,
          gtfsAlertId: live.gtfsAlertId,
          routeGtfsId: live.routeGtfsId,
          routeShortName,
          headerText: live.headerText,
          descriptionText: live.descriptionText,
          severity: live.severity,
          effectiveStart: live.effectiveStart,
          effectiveEnd: live.effectiveEnd,
          isActive: true,
        }),
      );

      await this.notifySubscribers(saved);
    }
  }

  private async notifySubscribers(alert: DisruptionAlert): Promise<void> {
    const subscriptions = await this.subscriptionRepo.find({
      where: { routeGtfsId: alert.routeGtfsId },
    });

    for (const subscription of subscriptions) {
      const alternativeItinerary = await this.computeAlternative(
        alert,
        subscription,
      );

      const notification = await this.notificationRepo.save(
        this.notificationRepo.create({
          profileId: subscription.profileId,
          alertId: alert.id,
          read: false,
          alternativeItinerary,
        }),
      );

      this.alertsGateway.notifyUser(subscription.profileId, {
        notificationId: notification.id,
        alert: {
          id: alert.id,
          routeShortName: alert.routeShortName,
          headerText: alert.headerText,
          descriptionText: alert.descriptionText,
          severity: alert.severity,
        },
        alternativeItinerary,
      });
    }
  }

  private async computeAlternative(
    alert: DisruptionAlert,
    subscription: LineSubscription,
  ): Promise<unknown> {
    if (
      subscription.fromLat === null ||
      subscription.fromLng === null ||
      subscription.toLat === null ||
      subscription.toLng === null
    ) {
      return null;
    }

    try {
      return await this.otpAdapterService.planAlternative(
        subscription.fromLat,
        subscription.fromLng,
        subscription.toLat,
        subscription.toLng,
        alert.routeGtfsId,
      );
    } catch (err) {
      this.logger.warn(
        `Échec du calcul d'itinéraire alternatif pour l'alerte ${alert.id}: ${String(err)}`,
      );
      return null;
    }
  }
}
