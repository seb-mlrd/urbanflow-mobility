'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { OTP_MODE_ICONS, OTP_MODE_LABELS } from '../../../lib/transport-icons';
import { formatCo2, formatDistance, formatDuration } from '../../../lib/journey-utils';
import type {
  JourneyHistoryRecord,
  JourneyMonthlyStats,
  MonthlyCo2Point,
} from '../../../lib/journey-types';
import { Co2MonthlyChart } from './components/Co2MonthlyChart';
import { StatCard } from '../../../components/ui/StatCard';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TripRow({ trip }: { trip: JourneyHistoryRecord }) {
  return (
    <li
      className="flex items-center gap-4 px-4 py-4 min-h-[64px]"
      style={{ borderBottom: '1px solid var(--color-outline-variant)' }}
    >
      <span
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: 'var(--color-surface-container-high)',
          color: 'var(--color-on-surface-variant)',
        }}
      >
        {OTP_MODE_ICONS[trip.dominantMode] ?? null}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className="block text-sm font-medium truncate"
          style={{ color: 'var(--color-on-surface)' }}
        >
          {trip.fromLabel} → {trip.toLabel}
        </span>
        <span className="block text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
          {formatDate(trip.departureAt)} · {OTP_MODE_LABELS[trip.dominantMode] ?? trip.dominantMode}{' '}
          · {formatDistance(trip.distanceMeters)} · {formatDuration(trip.durationSeconds)}
        </span>
      </span>
      <span
        className="text-sm font-semibold shrink-0"
        style={{ color: 'var(--color-primary)' }}
      >
        {formatCo2(trip.co2Grams)}
      </span>
    </li>
  );
}

export default function ActivitePage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['journey-history', 'stats'],
    enabled: Boolean(accessToken),
    queryFn: async (): Promise<JourneyMonthlyStats> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/journey-history/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Impossible de charger les statistiques.');
      return res.json();
    },
  });

  const { data: trips, isLoading: tripsLoading } = useQuery({
    queryKey: ['journey-history', 'list'],
    enabled: Boolean(accessToken),
    queryFn: async (): Promise<JourneyHistoryRecord[]> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/journey-history`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Impossible de charger l'historique.");
      return res.json();
    },
  });

  const { data: monthlyBreakdown } = useQuery({
    queryKey: ['journey-history', 'monthly-breakdown'],
    enabled: Boolean(accessToken),
    queryFn: async (): Promise<MonthlyCo2Point[]> => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/journey-history/monthly-breakdown?months=6`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!res.ok) throw new Error('Impossible de charger la répartition mensuelle.');
      return res.json();
    },
  });

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
          Activité
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          Historique de vos trajets et impact environnemental.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <StatCard
          accent
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 2C5 2 3 4.5 3 7c0 2 1.5 3.5 3 4v2h4v-2c1.5-.5 3-2 3-4 0-2.5-2-5-5-5Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path d="M6 9c1-1 3-1 4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          }
          label="Empreinte CO₂"
          value={statsLoading ? '…' : (((stats?.co2GramsThisMonth ?? 0) / 1000).toFixed(1))}
          unit="kg"
          subtitle="émis ce mois-ci"
        />
        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 12l4-5.5 3.5 3.5 3.5-5 3 4.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          label="Trajets"
          value={statsLoading ? '…' : String(stats?.tripsThisMonth ?? 0)}
          subtitle="effectués ce mois-ci"
        />
        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 8h12M8 2v12"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          }
          label="Distance"
          value={
            statsLoading ? '…' : (((stats?.distanceMetersThisMonth ?? 0) / 1000).toFixed(1))
          }
          unit="km"
          subtitle="parcourus ce mois-ci"
        />
      </div>

      {monthlyBreakdown && monthlyBreakdown.length > 0 && (
        <div className="mb-4">
          <Co2MonthlyChart data={monthlyBreakdown} />
        </div>
      )}

      <section
        aria-label="Historique des trajets"
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--color-surface-container)' }}
      >
        <h2
          className="text-sm font-semibold px-4 pt-4 pb-2"
          style={{ color: 'var(--color-on-surface)' }}
        >
          Historique des trajets
        </h2>

        {tripsLoading && (
          <p
            className="text-sm text-center py-8"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            Chargement…
          </p>
        )}

        {!tripsLoading && (!trips || trips.length === 0) && (
          <p
            className="text-sm text-center py-8"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            Aucun trajet enregistré pour le moment.
          </p>
        )}

        {trips && trips.length > 0 && (
          <ul>
            {trips.map((trip) => (
              <TripRow key={trip.id} trip={trip} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
