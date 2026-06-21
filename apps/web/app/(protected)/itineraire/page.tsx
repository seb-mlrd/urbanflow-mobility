'use client';

import { useState } from 'react';
import { JourneySearch, type JourneySearchValues } from './components/JourneySearch';
import { JourneyResults } from './components/JourneyResults';

export default function ItinerairePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<Pick<JourneySearchValues, 'fromLabel' | 'toLabel'> | null>(null);

  async function handleSearch(values: JourneySearchValues) {
    setLastSearch({ fromLabel: values.fromLabel, toLabel: values.toLabel });
    setLoading(true);
    setError(null);
    setResult(null);

    const params = new URLSearchParams({
      fromLat: String(values.fromLat),
      fromLng: String(values.fromLng),
      toLat: String(values.toLat),
      toLng: String(values.toLng),
    });
    if (values.datetime) params.set('datetime', new Date(values.datetime).toISOString());

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transport/journey?${params}`,
      );
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError('Impossible de calculer l\'itinéraire. Vérifie ta connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-on-surface)' }}>
          Itinéraire
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Transports en temps réel
        </p>
      </header>

      <section
        aria-label="Recherche d'itinéraire"
        className="rounded-xl p-4"
        style={{ background: 'var(--color-surface-container)' }}
      >
        <JourneySearch onSearch={handleSearch} loading={loading} />
      </section>

      {error && (
        <p role="alert" className="text-sm flex items-center gap-2 px-4 py-3 rounded-xl" style={{ color: 'var(--color-error)', background: 'var(--color-error-container)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}

      <JourneyResults
        result={result as any}
        fromLabel={lastSearch?.fromLabel}
        toLabel={lastSearch?.toLabel}
      />
    </div>
  );
}
