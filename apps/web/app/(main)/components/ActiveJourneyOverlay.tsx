'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';
import { JourneyMap } from './JourneyMap';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { GeolocationConsentModal } from '../../../components/GeolocationConsentModal';
import { useGeolocation, type UseGeolocationResult } from '../../../lib/hooks/useGeolocation';
import { useJourneyTracking } from '../../../lib/hooks/useJourneyTracking';
import { useActiveJourneyStore } from '../../../store/useActiveJourneyStore';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  getItineraryEndpoints,
  getItineraryRouteCoordinates,
  buildJourneyHistoryPayload,
} from '../../../lib/journey-utils';

const DEFAULT_DEMO_SPEED_KMH = 40;
const DEMO_SPEED_MIN_KMH = 5;
const DEMO_SPEED_MAX_KMH = 130;

const LIVE_CURSOR_ICON = L.divIcon({
  className: '',
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 2px rgba(37,99,235,0.4),0 0 4px rgba(0,0,0,0.4);"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const IDLE_GEO: UseGeolocationResult = {
  status: 'idle',
  position: null,
  error: null,
  isConsentModalOpen: false,
  hasConsent: true,
  requestLocation: () => {},
  confirmConsent: () => {},
  declineConsent: () => {},
  revokeConsent: () => {},
};

function FollowCamera({
  position,
  followMode,
  onUserInteraction,
}: {
  position: { lat: number; lng: number } | null;
  followMode: boolean;
  onUserInteraction: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.on('dragstart', onUserInteraction);
    return () => {
      map.off('dragstart', onUserInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (followMode && position) {
      map.panTo([position.lat, position.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followMode, position?.lat, position?.lng]);

  return null;
}

export function ActiveJourneyOverlay() {
  const itinerary = useActiveJourneyStore((s) => s.itinerary);
  const originLabel = useActiveJourneyStore((s) => s.originLabel);
  const destinationLabel = useActiveJourneyStore((s) => s.destinationLabel);
  const originCoords = useActiveJourneyStore((s) => s.originCoords);
  const destinationCoords = useActiveJourneyStore((s) => s.destinationCoords);
  const actualDepartureAt = useActiveJourneyStore((s) => s.actualDepartureAt);
  const hasBeenSaved = useActiveJourneyStore((s) => s.hasBeenSaved);
  const markSaved = useActiveJourneyStore((s) => s.markSaved);
  const stop = useActiveJourneyStore((s) => s.stop);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  const [followMode, setFollowMode] = useState(true);
  const [arrived, setArrived] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoSpeedKmh, setDemoSpeedKmh] = useState(DEFAULT_DEMO_SPEED_KMH);
  const geo = useGeolocation();

  const arrivalPoint = useMemo(() => {
    if (!itinerary) return null;
    return getItineraryEndpoints(itinerary).arrival ?? destinationCoords;
  }, [itinerary, destinationCoords]);

  const routeCoordinates = useMemo(() => getItineraryRouteCoordinates(itinerary), [itinerary]);

  const saveToHistory = useCallback(() => {
    if (hasBeenSaved || !itinerary || !originCoords || !destinationCoords) return;
    markSaved();

    const payload = buildJourneyHistoryPayload({
      itinerary,
      fromLabel: originLabel ?? 'Départ',
      toLabel: destinationLabel ?? 'Arrivée',
      fromLat: originCoords.lat,
      fromLng: originCoords.lng,
      toLat: destinationCoords.lat,
      toLng: destinationCoords.lng,
      departureAt: actualDepartureAt ?? Date.now(),
      arrivalAt: Date.now(),
    });

    if (!accessToken) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/journey-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [
    hasBeenSaved,
    itinerary,
    originCoords,
    destinationCoords,
    originLabel,
    destinationLabel,
    actualDepartureAt,
    accessToken,
    markSaved,
  ]);

  const handleArrival = useCallback(() => {
    setArrived(true);
    saveToHistory();
  }, [saveToHistory]);

  const isDemoActive = isAdmin && demoMode && routeCoordinates.length > 0;

  const { position, status } = useJourneyTracking({
    enabled: !arrived,
    arrivalPoint,
    onArrival: handleArrival,
    simulation: isDemoActive ? { route: routeCoordinates, speedKmh: demoSpeedKmh } : null,
  });

  if (!itinerary) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      <div
        className="flex items-center justify-between gap-3 px-4 h-14 shrink-0"
        style={{
          background: 'var(--color-surface-container)',
          borderBottom: '1px solid var(--color-outline-variant)',
        }}
      >
        <div className="min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--color-on-surface)' }}
          >
            {originLabel} → {destinationLabel}
          </p>
          {status === 'error' && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>
              Position indisponible — vérifiez vos autorisations de géolocalisation.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={stop}
          className="shrink-0 text-sm font-semibold px-3 py-2 rounded-xl transition-colors duration-150"
          style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}
        >
          Annuler le trajet
        </button>
      </div>

      <div className="relative flex-1">
        <JourneyMap geo={IDLE_GEO} selectedItinerary={itinerary} showMobilitySpots={false}>
          <FollowCamera
            position={position}
            followMode={followMode}
            onUserInteraction={() => setFollowMode(false)}
          />
          {position && (
            <Marker position={[position.lat, position.lng]} icon={LIVE_CURSOR_ICON}>
              <Popup>Vous êtes ici</Popup>
            </Marker>
          )}
        </JourneyMap>

        {!followMode && (
          <button
            type="button"
            onClick={() => setFollowMode(true)}
            className="absolute bottom-6 right-6 z-[1000] text-sm font-semibold px-4 py-3 rounded-full shadow-lg"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Recentrer
          </button>
        )}

        {isAdmin && (
          <div
            className="absolute top-4 left-4 z-[1000] w-56 rounded-xl shadow-lg p-3 flex flex-col gap-2"
            style={{
              background: 'var(--color-surface-container)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <button
              type="button"
              onClick={() => setDemoMode((v) => !v)}
              disabled={routeCoordinates.length === 0}
              className="text-sm font-semibold px-3 py-2 rounded-lg transition-colors duration-150 disabled:opacity-50"
              style={
                demoMode
                  ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                  : {
                      background: 'var(--color-surface-container-high)',
                      color: 'var(--color-on-surface)',
                    }
              }
            >
              {demoMode ? 'Mode démo actif' : 'Activer le mode démo'}
            </button>

            {demoMode && (
              <label
                className="flex flex-col gap-1 text-xs"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                Vitesse simulée : {demoSpeedKmh} km/h
                <input
                  type="range"
                  min={DEMO_SPEED_MIN_KMH}
                  max={DEMO_SPEED_MAX_KMH}
                  step={5}
                  value={demoSpeedKmh}
                  onChange={(e) => setDemoSpeedKmh(Number(e.target.value))}
                />
              </label>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="absolute bottom-6 left-6 right-6 z-[1000] flex justify-center">
            <div className="w-full max-w-xs">
              <Button type="button" variant="primary" onClick={geo.requestLocation}>
                Réessayer la géolocalisation
              </Button>
            </div>
          </div>
        )}
      </div>

      <GeolocationConsentModal
        open={geo.isConsentModalOpen}
        onAllow={geo.confirmConsent}
        onDecline={geo.declineConsent}
      />

      <Modal open={arrived} onClose={stop} title="Vous êtes arrivé(e) !">
        <p className="text-sm" style={{ color: 'var(--color-on-surface)' }}>
          Bravo, vous êtes arrivé(e) à destination. Ce trajet vient d&apos;être ajouté à votre
          historique.
        </p>
        <Button type="button" variant="primary" onClick={stop}>
          Fermer
        </Button>
      </Modal>
    </div>
  );
}
