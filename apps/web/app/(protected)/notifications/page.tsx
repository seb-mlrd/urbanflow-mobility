'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserNotificationDto } from '@urbanflow/shared';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNotificationsStore } from '../../../store/useNotificationsStore';
import { authFetch } from '../../../lib/auth-fetch';
import { OTP_MODE_ICONS, OTP_MODE_LABELS } from '../../../lib/transport-icons';
import { formatDuration } from '../../../lib/journey-utils';
import type { Itinerary } from '../../../lib/journey-types';

const SEVERITY_STYLE: Record<string, { background: string; color: string; label: string }> = {
  SEVERE: {
    background: 'var(--color-error-container)',
    color: 'var(--color-error)',
    label: 'Perturbation majeure',
  },
  WARNING: {
    background: 'var(--color-secondary-container)',
    color: 'var(--color-on-secondary-container)',
    label: 'Perturbation',
  },
  INFO: {
    background: 'var(--color-surface-container-high)',
    color: 'var(--color-on-surface-variant)',
    label: 'Information',
  },
};

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function AlternativeItinerary({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div
      className="mt-3 rounded-lg p-3"
      style={{ background: 'var(--color-surface-container-high)' }}
    >
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-on-surface)' }}>
        Itinéraire alternatif proposé — {formatTime(itinerary.startTime)} →{' '}
        {formatTime(itinerary.endTime)} ({formatDuration(itinerary.duration)})
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {itinerary.legs.map((leg, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              background:
                leg.mode === 'WALK' ? 'var(--color-surface)' : 'var(--color-secondary-container)',
              color:
                leg.mode === 'WALK'
                  ? 'var(--color-on-surface-variant)'
                  : 'var(--color-on-secondary-container)',
            }}
          >
            {OTP_MODE_ICONS[leg.mode] ?? null}
            {leg.route?.shortName ?? OTP_MODE_LABELS[leg.mode] ?? leg.mode}
          </span>
        ))}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: UserNotificationDto;
  onMarkRead: (id: string) => void;
}) {
  const severity = SEVERITY_STYLE[notification.alert.severity] ?? SEVERITY_STYLE.INFO;
  const alternativeItinerary = notification.alternativeItinerary as Itinerary | null;

  return (
    <article
      className="rounded-xl p-4"
      style={{
        background: notification.read
          ? 'var(--color-surface-container)'
          : 'var(--color-surface-container-high)',
        border: notification.read ? '1px solid transparent' : '1px solid var(--color-primary)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: severity.background, color: severity.color }}
          >
            {severity.label}
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-on-surface)' }}>
            Ligne {notification.alert.routeShortName}
          </span>
        </div>
        {!notification.read && (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="text-xs font-medium shrink-0"
            style={{ color: 'var(--color-primary)' }}
          >
            Marquer comme lue
          </button>
        )}
      </div>

      <p className="text-sm font-semibold mt-2" style={{ color: 'var(--color-on-surface)' }}>
        {notification.alert.headerText}
      </p>
      {notification.alert.descriptionText && (
        <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          {notification.alert.descriptionText}
        </p>
      )}

      {alternativeItinerary && <AlternativeItinerary itinerary={alternativeItinerary} />}
    </article>
  );
}

export default function NotificationsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const markReadInStore = useNotificationsStore((s) => s.markRead);
  const markAllReadInStore = useNotificationsStore((s) => s.markAllRead);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    enabled: Boolean(accessToken),
    queryFn: async (): Promise<UserNotificationDto[]> => {
      const res = await authFetch('/notifications');
      if (!res.ok) throw new Error('Impossible de charger les notifications.');
      return res.json();
    },
  });

  async function handleMarkRead(id: string) {
    markReadInStore(id);
    queryClient.setQueryData<UserNotificationDto[]>(['notifications'], (prev) =>
      prev?.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await authFetch(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
  }

  async function handleMarkAllRead() {
    markAllReadInStore();
    queryClient.setQueryData<UserNotificationDto[]>(['notifications'], (prev) =>
      prev?.map((n) => ({ ...n, read: true })),
    );
    await authFetch('/notifications/read-all', { method: 'PATCH' }).catch(() => {});
  }

  const hasUnread = notifications?.some((n) => !n.read) ?? false;

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
          Notifications
        </h1>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-medium shrink-0"
            style={{ color: 'var(--color-primary)' }}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {isLoading && (
        <p
          className="text-sm text-center py-8"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Chargement…
        </p>
      )}

      {!isLoading && (!notifications || notifications.length === 0) && (
        <p
          className="text-sm text-center py-8"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Aucune notification pour le moment.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {notifications?.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkRead={handleMarkRead}
          />
        ))}
      </div>
    </div>
  );
}
