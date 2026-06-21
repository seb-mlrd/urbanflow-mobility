'use client';

import { OTP_MODE_ICONS, OTP_MODE_LABELS } from '../../../../lib/transport-icons';
import { getActualDominantMode, formatDuration } from '../../../../lib/journey-utils';

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

interface Leg {
  mode: string;
  startTime: number;
  endTime: number;
  distance: number;
  from: { name: string };
  to: { name: string };
  route: { shortName: string; longName: string } | null;
}

interface Itinerary {
  duration: number;
  startTime: number;
  endTime: number;
  dominantMode: string;
  legs: Leg[];
}

interface JourneyResponse {
  itineraries: Itinerary[];
}

interface Props {
  result: JourneyResponse | null;
  fromLabel?: string;
  toLabel?: string;
}

export function JourneyResults({ result, fromLabel, toLabel }: Props) {
  if (!result) return null;

  const itineraries = result.itineraries;

  if (itineraries.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: 'var(--color-on-surface-variant)' }}>
        Aucun itinéraire trouvé pour ce trajet.
      </p>
    );
  }

  return (
    <section aria-label="Itinéraires proposés" className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
        {itineraries.length} itinéraire{itineraries.length > 1 ? 's' : ''} trouvé{itineraries.length > 1 ? 's' : ''}
      </h2>

      {itineraries.map((itin, i) => {
        const dominantMode = getActualDominantMode(itin.legs);
        return (
        <article
          key={`${itin.startTime}-${itin.duration}-${i}`}
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ background: 'var(--color-surface-container)' }}
        >
          {/* En-tête : mode dominant + durée */}
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}
            >
              {OTP_MODE_ICONS[dominantMode] ?? null}
              {OTP_MODE_LABELS[dominantMode] ?? dominantMode}
            </span>
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              {formatDuration(itin.duration)}
            </span>
          </div>

          {/* Horaires */}
          <div>
            <span className="text-lg font-bold" style={{ color: 'var(--color-on-surface)' }}>
              {formatTime(itin.startTime)}
            </span>
            <span className="mx-2 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>→</span>
            <span className="text-lg font-bold" style={{ color: 'var(--color-on-surface)' }}>
              {formatTime(itin.endTime)}
            </span>
          </div>

          {/* Barre de modes */}
          <div className="flex items-center gap-1 flex-wrap">
            {itin.legs.map((leg, j) => (
              <div key={j} className="flex items-center gap-1">
                <span
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: leg.mode === 'WALK' ? 'var(--color-surface-container-high)' : 'var(--color-secondary-container)',
                    color: leg.mode === 'WALK' ? 'var(--color-on-surface-variant)' : 'var(--color-on-secondary-container)',
                  }}
                >
                  {OTP_MODE_ICONS[leg.mode] ?? null}
                  {leg.route?.shortName ?? OTP_MODE_LABELS[leg.mode] ?? leg.mode}
                </span>
                {j < itin.legs.length - 1 && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{ color: 'var(--color-on-surface-variant)' }}>
                    <path d="M3 5h4M5 3l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Détail des legs */}
          <ol className="flex flex-col gap-2">
            {itin.legs.map((leg, j) => (
              <li key={j} className="flex items-start gap-3 text-sm">
                <span
                  className="mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: leg.mode === 'WALK' ? 'var(--color-surface-container-high)' : 'var(--color-secondary-container)',
                    color: leg.mode === 'WALK' ? 'var(--color-on-surface-variant)' : 'var(--color-on-secondary-container)',
                  }}
                >
                  {OTP_MODE_ICONS[leg.mode] ?? null}
                </span>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--color-on-surface)' }}>
                    <span className="font-medium">
                      {leg.from.name === 'Origin' ? (fromLabel ?? leg.from.name)
                        : leg.from.name === 'Destination' ? (toLabel ?? leg.from.name)
                        : leg.from.name}
                    </span>
                    {leg.route && (
                      <span style={{ color: 'var(--color-on-surface-variant)' }}>
                        {' '}— {leg.route.shortName} dir. {leg.to.name}
                      </span>
                    )}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {formatTime(leg.startTime)} · {formatDuration((leg.endTime - leg.startTime) / 1000)}
                    {leg.mode === 'WALK' && ` · ${Math.round(leg.distance)} m`}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </article>
        );
      })}
    </section>
  );
}
