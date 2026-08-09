export interface DisruptionAlertDto {
  id: string;
  routeGtfsId: string;
  routeShortName: string;
  headerText: string;
  descriptionText: string | null;
  severity: string;
}

export interface UserNotificationDto {
  id: string;
  profileId: string;
  alertId: string;
  alert: DisruptionAlertDto;
  read: boolean;
  alternativeItinerary: unknown;
  createdAt: string;
}

export interface DisruptionPushPayload {
  notificationId: string;
  alert: DisruptionAlertDto;
  alternativeItinerary: unknown;
}

export interface LineSubscriptionDto {
  id: string;
  routeGtfsId: string;
  routeShortName: string;
  fromLabel: string | null;
  fromLat: number | null;
  fromLng: number | null;
  toLabel: string | null;
  toLat: number | null;
  toLng: number | null;
  createdAt: string;
}
