'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { OTP_MODE_ICONS, OTP_MODE_LABELS } from '../../../lib/transport-icons';
import type { PlannedItinerary } from '../../../lib/journey-types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PlannedItineraryRow({
  item,
  onOpen,
  onDelete,
  deleting,
}: {
  item: PlannedItinerary;
  onOpen: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <li
      className="flex items-center gap-4 px-4 py-4 min-h-[64px] cursor-pointer transition-colors duration-150"
      style={{ borderBottom: '1px solid var(--color-outline-variant)' }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
    >
      <span
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: 'var(--color-surface-container-high)',
          color: 'var(--color-on-surface-variant)',
        }}
      >
        {(item.selectedModes[0] && OTP_MODE_ICONS[item.selectedModes[0]]) ?? null}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className="block text-sm font-medium truncate"
          style={{ color: 'var(--color-on-surface)' }}
        >
          {item.fromLabel} → {item.toLabel}
        </span>
        <span className="block text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
          {formatDate(item.plannedAt)}
          {item.selectedModes.length > 0 &&
            ` · ${item.selectedModes.map((m) => OTP_MODE_LABELS[m] ?? m).join(', ')}`}
        </span>
      </span>
      <button
        type="button"
        disabled={deleting}
        aria-label="Supprimer cet itinéraire planifié"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 5h10M6.5 5V3.5h3V5M4.5 5l.5 8h6l.5-8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </li>
  );
}

export default function PlanificationPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: planned, isLoading } = useQuery({
    queryKey: ['planification', 'list'],
    enabled: Boolean(accessToken),
    queryFn: async (): Promise<PlannedItinerary[]> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planification`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Impossible de charger vos itinéraires planifiés.');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planification/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planification', 'list'] }),
  });

  function openItinerary(item: PlannedItinerary) {
    const params = new URLSearchParams({
      fromLat: String(item.fromLat),
      fromLng: String(item.fromLng),
      fromLabel: item.fromLabel,
      toLat: String(item.toLat),
      toLng: String(item.toLng),
      toLabel: item.toLabel,
      datetime: item.plannedAt.slice(0, 16),
      modes: item.selectedModes.join(','),
    });
    router.push(`/?${params}`);
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
          Planification
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          Vos itinéraires planifiés, prêts à être relancés.
        </p>
      </div>

      <section
        aria-label="Itinéraires planifiés"
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--color-surface-container)' }}
      >
        {isLoading && (
          <p
            className="text-sm text-center py-8"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            Chargement…
          </p>
        )}

        {!isLoading && (!planned || planned.length === 0) && (
          <p
            className="text-sm text-center py-8"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            Vous n&apos;avez pas encore planifié d&apos;itinéraire.
          </p>
        )}

        {planned && planned.length > 0 && (
          <ul>
            {planned.map((item) => (
              <PlannedItineraryRow
                key={item.id}
                item={item}
                onOpen={() => openItinerary(item)}
                onDelete={() => deleteMutation.mutate(item.id)}
                deleting={deleteMutation.isPending && deleteMutation.variables === item.id}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
