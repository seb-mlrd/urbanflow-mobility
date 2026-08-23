'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { AddressField, JourneySearch, type JourneySearchValues } from './components/JourneySearch';
import { JourneyResults } from './components/JourneyResults';
import { GeolocationConsentModal } from '../../components/GeolocationConsentModal';
import { AuthRequiredModal } from '../../components/AuthRequiredModal';
import { useGeolocation } from '../../lib/hooks/useGeolocation';
import { filterAndSortItineraries, type SortBy } from '../../lib/journey-utils';
import { useAuthStore } from '../../store/useAuthStore';
import { useActiveJourneyStore } from '../../store/useActiveJourneyStore';
import { authFetch } from '../../lib/auth-fetch';
import type { JourneyResponse } from '../../lib/journey-types';
import { TRANSPORT_MODES } from '@urbanflow/shared';
import { TRANSPORT_MODE_ICONS } from '../../lib/transport-icons';

const JourneyMap = dynamic(() => import('./components/JourneyMap').then((m) => m.JourneyMap), {
  ssr: false,
  loading: () => (
    <div
      className="h-80 md:h-full w-full rounded-xl animate-pulse"
      style={{ background: 'var(--color-surface-container)' }}
    />
  ),
});

const ActiveJourneyOverlay = dynamic(
  () => import('./components/ActiveJourneyOverlay').then((m) => m.ActiveJourneyOverlay),
  { ssr: false },
);

const SORT_TABS: { key: SortBy; label: string }[] = [
  { key: 'duration', label: 'Durée' },
  { key: 'co2', label: 'CO2' },
];

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JourneyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lastSearch, setLastSearch] = useState<Pick<
    JourneySearchValues,
    | 'fromLabel'
    | 'toLabel'
    | 'selectedModes'
    | 'datetime'
    | 'fromLat'
    | 'fromLng'
    | 'toLat'
    | 'toLng'
  > | null>(null);
  const [selectedItineraryIndex, setSelectedItineraryIndex] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(
    () =>
      !(
        searchParams.get('fromLat') &&
        searchParams.get('fromLng') &&
        searchParams.get('toLat') &&
        searchParams.get('toLng')
      ),
  );
  const [sortBy, setSortBy] = useState<SortBy>('duration');
  const [activeModes, setActiveModes] = useState<string[]>([]);
  const [editingTopBar, setEditingTopBar] = useState(false);
  const [editFromLabel, setEditFromLabel] = useState('');
  const [editFromLat, setEditFromLat] = useState<number | null>(null);
  const [editFromLng, setEditFromLng] = useState<number | null>(null);
  const [editToLabel, setEditToLabel] = useState('');
  const [editToLat, setEditToLat] = useState<number | null>(null);
  const [editToLng, setEditToLng] = useState<number | null>(null);
  const [editDatetime, setEditDatetime] = useState('');
  const geo = useGeolocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const profileModes = useAuthStore((s) => s.transportModes);
  const isJourneyActive = useActiveJourneyStore((s) => s.isActive);
  const startActiveJourney = useActiveJourneyStore((s) => s.start);

  const filteredItineraries = useMemo(
    () => filterAndSortItineraries(result, profileModes, activeModes, sortBy),
    [result, profileModes, activeModes, sortBy],
  );

  function toggleActiveMode(mode: string) {
    setActiveModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  const [appliedItineraries, setAppliedItineraries] = useState(filteredItineraries);
  if (filteredItineraries !== appliedItineraries) {
    setAppliedItineraries(filteredItineraries);
    setSelectedItineraryIndex(filteredItineraries.length > 0 ? 0 : null);
  }

  const hasResultsTopBar = !showForm && lastSearch !== null;

  const deepLinkValues = useMemo<JourneySearchValues | null>(() => {
    const fromLat = searchParams.get('fromLat');
    const fromLng = searchParams.get('fromLng');
    const toLat = searchParams.get('toLat');
    const toLng = searchParams.get('toLng');
    if (!fromLat || !fromLng || !toLat || !toLng) return null;
    return {
      fromLabel: searchParams.get('fromLabel') ?? '',
      fromLat: Number(fromLat),
      fromLng: Number(fromLng),
      toLabel: searchParams.get('toLabel') ?? '',
      toLat: Number(toLat),
      toLng: Number(toLng),
      datetime: searchParams.get('datetime') ?? '',
      selectedModes: searchParams.get('modes')?.split(',').filter(Boolean) ?? [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!deepLinkValues) return;
    handleSearch(deepLinkValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePlan(values: JourneySearchValues) {
    if (!accessToken) {
      setShowAuthModal(true);
      return;
    }
    setPlanMessage(null);
    setError(null);
    try {
      const res = await authFetch('/planification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromLabel: values.fromLabel,
          toLabel: values.toLabel,
          fromLat: values.fromLat,
          fromLng: values.fromLng,
          toLat: values.toLat,
          toLng: values.toLng,
          plannedAt: new Date(values.datetime).toISOString(),
          selectedModes: values.selectedModes,
        }),
      });
      if (!res.ok) throw new Error();
      setPlanMessage('Itinéraire planifié avec succès.');
    } catch {
      setError('Impossible de planifier cet itinéraire.');
    }
  }

  async function handleSearch(values: JourneySearchValues) {
    setLastSearch({
      fromLabel: values.fromLabel,
      toLabel: values.toLabel,
      fromLat: values.fromLat,
      fromLng: values.fromLng,
      toLat: values.toLat,
      toLng: values.toLng,
      selectedModes: values.selectedModes,
      datetime: values.datetime,
    });
    setActiveModes(values.selectedModes);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transport/journey?${params}`);
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Impossible de calculer l'itinéraire. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }

  function openTopBarEdit() {
    if (!lastSearch) return;
    setEditFromLabel(lastSearch.fromLabel);
    setEditFromLat(lastSearch.fromLat);
    setEditFromLng(lastSearch.fromLng);
    setEditToLabel(lastSearch.toLabel);
    setEditToLat(lastSearch.toLat);
    setEditToLng(lastSearch.toLng);
    setEditDatetime(lastSearch.datetime);
    setEditingTopBar(true);
  }

  function swapTopBarEdit() {
    setEditFromLabel(editToLabel);
    setEditFromLat(editToLat);
    setEditFromLng(editToLng);
    setEditToLabel(editFromLabel);
    setEditToLat(editFromLat);
    setEditToLng(editFromLng);
  }

  function submitTopBarEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editFromLat === null || editFromLng === null || editToLat === null || editToLng === null)
      return;
    handleSearch({
      fromLabel: editFromLabel,
      fromLat: editFromLat,
      fromLng: editFromLng,
      toLabel: editToLabel,
      toLat: editToLat,
      toLng: editToLng,
      datetime: editDatetime,
      selectedModes: lastSearch?.selectedModes ?? [],
    });
    setEditingTopBar(false);
  }

  function handleStartJourney() {
    if (selectedItineraryIndex === null || !lastSearch) return;
    const itinerary = filteredItineraries[selectedItineraryIndex];
    if (!itinerary) return;

    if (!geo.hasConsent) {
      geo.requestLocation();
      return;
    }

    startActiveJourney({
      itinerary,
      originLabel: lastSearch.fromLabel,
      destinationLabel: lastSearch.toLabel,
      originCoords: { lat: lastSearch.fromLat, lng: lastSearch.fromLng },
      destinationCoords: { lat: lastSearch.toLat, lng: lastSearch.toLng },
    });
  }

  return (
    <div className="flex flex-col">
      {!showForm && lastSearch && editingTopBar && (
        <form
          onSubmit={submitTopBarEdit}
          className="flex flex-col md:flex-row md:items-end gap-2 md:gap-3 px-4 md:px-6 py-3 shrink-0"
          style={{
            background: 'var(--color-surface-container)',
            borderBottom: '1px solid var(--color-outline-variant)',
          }}
        >
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <AddressField
                label="Départ"
                value={editFromLabel}
                onChange={(v) => {
                  setEditFromLabel(v);
                  setEditFromLat(null);
                  setEditFromLng(null);
                }}
                onSelect={(s) => {
                  setEditFromLabel(s.label);
                  setEditFromLat(s.lat);
                  setEditFromLng(s.lng);
                }}
              />
            </div>
            <button
              type="button"
              onClick={swapTopBarEdit}
              aria-label="Intervertir départ et arrivée"
              title="Intervertir départ et arrivée"
              className="hidden sm:flex shrink-0 items-center justify-center w-9 h-9 self-end mb-1.5 rounded-full cursor-pointer transition-colors duration-150"
              style={{
                background: 'var(--color-surface-container-high)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M5 2v10M5 12 2.5 9.5M5 12l2.5-2.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                />
                <path
                  d="M11 14V4M11 4 8.5 6.5M11 4l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <AddressField
                label="Arrivée"
                value={editToLabel}
                onChange={(v) => {
                  setEditToLabel(v);
                  setEditToLat(null);
                  setEditToLng(null);
                }}
                onSelect={(s) => {
                  setEditToLabel(s.label);
                  setEditToLat(s.lat);
                  setEditToLng(s.lng);
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <input
              type="date"
              value={editDatetime.split('T')[0] ?? ''}
              onChange={(e) => {
                const time = editDatetime.split('T')[1] ?? '08:00';
                setEditDatetime(e.target.value ? `${e.target.value}T${time}` : '');
              }}
              className="rounded-xl px-3 h-12 text-sm outline-none"
              style={{
                background: 'var(--color-surface-container-high)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
              }}
            />
            <input
              type="time"
              value={editDatetime.split('T')[1] ?? ''}
              onChange={(e) => {
                const date = editDatetime.split('T')[0] || new Date().toISOString().slice(0, 10);
                setEditDatetime(e.target.value ? `${date}T${e.target.value}` : '');
              }}
              className="rounded-xl px-3 h-12 text-sm outline-none"
              style={{
                background: 'var(--color-surface-container-high)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
              }}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="submit"
              disabled={editFromLat === null || editToLat === null}
              className="flex-1 md:flex-none shrink-0 h-12 text-sm font-semibold px-3 md:px-4 rounded-xl transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              Rechercher
            </button>
            <button
              type="button"
              onClick={() => setEditingTopBar(false)}
              className="shrink-0 h-12 text-sm font-medium px-3 md:px-4 rounded-xl transition-colors duration-150"
              style={{
                color: 'var(--color-on-surface-variant)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {!showForm && lastSearch && !editingTopBar && (
        <div
          className="flex items-center gap-2 md:gap-3 px-4 md:px-6 h-14 md:h-16 shrink-0"
          style={{
            background: 'var(--color-surface-container)',
            borderBottom: '1px solid var(--color-outline-variant)',
          }}
        >
          <span
            className="flex-1 min-w-0 truncate text-sm font-medium px-3 py-2 rounded-xl"
            style={{
              background: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface)',
            }}
          >
            {lastSearch.fromLabel}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="flex-1 min-w-0 truncate text-sm font-medium px-3 py-2 rounded-xl"
            style={{
              background: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface)',
            }}
          >
            {lastSearch.toLabel}
          </span>
          <span
            className="hidden sm:block shrink-0 text-sm px-3 py-2 rounded-xl"
            style={{
              background: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            {lastSearch.datetime
              ? new Date(lastSearch.datetime).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Maintenant'}
          </span>
          <button
            type="button"
            onClick={openTopBarEdit}
            className="shrink-0 text-sm font-semibold px-3 md:px-4 py-2 rounded-xl transition-colors duration-150"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Modifier
          </button>
        </div>
      )}

      {!isJourneyActive && (
        <div
          className={`px-4 py-4 md:px-0 md:py-0 max-w-6xl md:max-w-none mx-auto w-full flex flex-col md:flex-row gap-6 md:gap-0 md:overflow-hidden ${hasResultsTopBar ? 'md:h-[calc(100vh-120px)]' : 'md:h-[calc(100vh-56px)]'}`}
        >
          <div className="flex flex-col gap-6 md:w-[420px] md:flex-shrink-0 md:h-full md:overflow-y-auto md:border-r md:border-[var(--color-outline-variant)] md:px-6 md:py-6 md:gap-4">
            <header className="md:hidden">
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-on-surface)' }}>
                Itinéraire
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                Transports en temps réel
              </p>
            </header>
            {showForm && (
              <h1
                className="hidden md:block text-xl font-bold"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Planifier un trajet
              </h1>
            )}

            <section
              aria-label="Recherche d'itinéraire"
              className={`${showForm ? '' : 'hidden'} rounded-xl p-4 md:rounded-none md:p-0 bg-[var(--color-surface-container)] md:bg-transparent`}
            >
              <JourneySearch
                onSearch={handleSearch}
                onPlan={handlePlan}
                initialValues={deepLinkValues ?? undefined}
                loading={loading}
                geo={geo}
              />
            </section>

            {planMessage && (
              <p
                role="status"
                className="text-sm flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{
                  color: 'var(--color-on-primary-container)',
                  background: 'var(--color-primary-container)',
                }}
              >
                {planMessage}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="text-sm flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{
                  color: 'var(--color-error)',
                  background: 'var(--color-error-container)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M8 5v3.5M8 10.5v.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </p>
            )}

            {!showForm && (
              <>
                {filteredItineraries.length > 0 && (
                  <div
                    className="flex items-center gap-2"
                    role="group"
                    aria-label="Trier les itinéraires"
                  >
                    {SORT_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        aria-pressed={tab.key === sortBy}
                        onClick={() => setSortBy(tab.key)}
                        className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-150"
                        style={{
                          background:
                            tab.key === sortBy
                              ? 'var(--color-primary)'
                              : 'var(--color-surface-container-high)',
                          color:
                            tab.key === sortBy
                              ? 'var(--color-on-primary)'
                              : 'var(--color-on-surface-variant)',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {!loading && (
                  <div
                    className="flex flex-wrap items-center gap-2"
                    role="group"
                    aria-label="Filtrer par mode de transport"
                  >
                    {TRANSPORT_MODES.map((mode) => {
                      const active = activeModes.includes(mode);
                      return (
                        <button
                          key={mode}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleActiveMode(mode)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-150"
                          style={{
                            background: active
                              ? 'var(--color-primary)'
                              : 'var(--color-surface-container-high)',
                            color: active
                              ? 'var(--color-on-primary)'
                              : 'var(--color-on-surface-variant)',
                            border: active
                              ? '1px solid transparent'
                              : '1px solid var(--color-outline-variant)',
                          }}
                        >
                          {TRANSPORT_MODE_ICONS[mode]}
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                )}

                <JourneyResults
                  itineraries={filteredItineraries}
                  selectedIndex={selectedItineraryIndex}
                  onSelect={setSelectedItineraryIndex}
                  fromLabel={lastSearch?.fromLabel}
                  toLabel={lastSearch?.toLabel}
                  loading={loading}
                  onStartJourney={handleStartJourney}
                />
              </>
            )}
          </div>

          <div className="order-first md:order-none h-80 md:flex-1 md:h-full">
            <JourneyMap
              geo={geo}
              selectedItinerary={
                selectedItineraryIndex !== null ? filteredItineraries[selectedItineraryIndex] : null
              }
            />
          </div>
        </div>
      )}

      <GeolocationConsentModal
        open={geo.isConsentModalOpen}
        onAllow={geo.confirmConsent}
        onDecline={geo.declineConsent}
      />

      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {isJourneyActive && <ActiveJourneyOverlay />}
    </div>
  );
}
