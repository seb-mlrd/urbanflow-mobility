'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { JourneySearch, type JourneySearchValues } from './components/JourneySearch';
import { JourneyResults } from './components/JourneyResults';
import { GeolocationConsentModal } from '../../components/GeolocationConsentModal';
import { useGeolocation } from '../../lib/hooks/useGeolocation';
import { getStoredConsent } from '../../lib/geolocationConsent';
import { filterAndSortItineraries } from '../../lib/journey-utils';
import { useAuthStore } from '../../store/useAuthStore';
import type { JourneyResponse } from '../../lib/journey-types';

const JourneyMap = dynamic(
  () => import('./components/JourneyMap').then((m) => m.JourneyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 md:h-full w-full rounded-xl animate-pulse" style={{ background: 'var(--color-surface-container)' }} />
    ),
  },
);

const SORT_TABS: { key: 'duration' | 'co2' | 'price'; label: string }[] = [
  { key: 'duration', label: 'Durée' },
  { key: 'co2', label: 'CO2' },
  { key: 'price', label: 'Prix' },
];

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JourneyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<Pick<JourneySearchValues, 'fromLabel' | 'toLabel' | 'selectedModes' | 'datetime'> | null>(null);
  const [selectedItineraryIndex, setSelectedItineraryIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);
  const geo = useGeolocation();
  const profileModes = useAuthStore((s) => s.transportModes);

  useEffect(() => {
    if (getStoredConsent() === null) geo.requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItineraries = useMemo(
    () => filterAndSortItineraries(result, profileModes, lastSearch?.selectedModes ?? []),
    [result, profileModes, lastSearch],
  );

  useEffect(() => {
    setSelectedItineraryIndex(filteredItineraries.length > 0 ? 0 : null);
  }, [filteredItineraries]);

  const hasResultsTopBar = !showForm && lastSearch !== null;

  async function handleSearch(values: JourneySearchValues) {
    setLastSearch({ fromLabel: values.fromLabel, toLabel: values.toLabel, selectedModes: values.selectedModes, datetime: values.datetime });
    setShowForm(false);
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
    <div className="flex flex-col">
      {!showForm && lastSearch && (
        <div
          className="flex items-center gap-2 md:gap-3 px-4 md:px-6 h-14 md:h-16 shrink-0"
          style={{ background: 'var(--color-surface-container)', borderBottom: '1px solid var(--color-outline-variant)' }}
        >
          <span
            className="flex-1 min-w-0 truncate text-sm font-medium px-3 py-2 rounded-xl"
            style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
          >
            {lastSearch.fromLabel}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0" style={{ color: 'var(--color-on-surface-variant)' }}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            className="flex-1 min-w-0 truncate text-sm font-medium px-3 py-2 rounded-xl"
            style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
          >
            {lastSearch.toLabel}
          </span>
          <span
            className="hidden sm:block shrink-0 text-sm px-3 py-2 rounded-xl"
            style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}
          >
            {lastSearch.datetime ? new Date(lastSearch.datetime).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Maintenant'}
          </span>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="shrink-0 text-sm font-semibold px-3 md:px-4 py-2 rounded-xl transition-colors duration-150"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Modifier
          </button>
        </div>
      )}

      <div
        className={`px-4 py-4 md:px-0 md:py-0 max-w-6xl md:max-w-none mx-auto w-full flex flex-col md:flex-row gap-6 md:gap-0 md:overflow-hidden ${hasResultsTopBar ? 'md:h-[calc(100vh-120px)]' : 'md:h-[calc(100vh-56px)]'}`}
      >
        <div className="flex flex-col gap-6 md:w-[420px] md:flex-shrink-0 md:h-full md:overflow-y-auto md:px-6 md:py-6 md:gap-4" style={{ borderRight: '1px solid var(--color-outline-variant)' }}>
          <header className="md:hidden">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-on-surface)' }}>
              Itinéraire
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Transports en temps réel
            </p>
          </header>
          {showForm && (
            <h1 className="hidden md:block text-xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
              Planifier un trajet
            </h1>
          )}

          <section
            aria-label="Recherche d'itinéraire"
            className={`${showForm ? '' : 'hidden'} rounded-xl p-4 md:rounded-none md:p-0 bg-[var(--color-surface-container)] md:bg-transparent`}
          >
            <JourneySearch onSearch={handleSearch} loading={loading} geo={geo} />
          </section>

          {!showForm && (
            <>
              {error && (
                <p role="alert" className="text-sm flex items-center gap-2 px-4 py-3 rounded-xl" style={{ color: 'var(--color-error)', background: 'var(--color-error-container)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {error}
                </p>
              )}

              {filteredItineraries.length > 0 && (
                <div className="flex items-center gap-2" role="group" aria-label="Trier les itinéraires">
                  {SORT_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      disabled={tab.key !== 'duration'}
                      aria-pressed={tab.key === 'duration'}
                      title={tab.key !== 'duration' ? 'Bientôt disponible' : undefined}
                      className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: tab.key === 'duration' ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                        color: tab.key === 'duration' ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <JourneyResults
                itineraries={filteredItineraries}
                selectedIndex={selectedItineraryIndex}
                onSelect={setSelectedItineraryIndex}
                fromLabel={lastSearch?.fromLabel}
                toLabel={lastSearch?.toLabel}
                loading={loading}
              />
            </>
          )}
        </div>

        <div className="order-first md:order-none h-80 md:flex-1 md:h-full">
          <JourneyMap
            geo={geo}
            selectedItinerary={selectedItineraryIndex !== null ? filteredItineraries[selectedItineraryIndex] : null}
          />
        </div>
      </div>

      <GeolocationConsentModal
        open={geo.isConsentModalOpen}
        onAllow={geo.confirmConsent}
        onDecline={geo.declineConsent}
      />
    </div>
  );
}
