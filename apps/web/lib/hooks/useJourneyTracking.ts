'use client';

import { useEffect, useRef, useState } from 'react';
import { getStoredConsent } from '../geolocationConsent';
import { hasArrived, positionAlongRoute, type GeoPosition } from '../geo-distance';
import type { GeoErrorReason } from './useGeolocation';

export type JourneyTrackingStatus = 'idle' | 'watching' | 'error';

const SIMULATION_TICK_MS = 250;

export interface JourneySimulationConfig {
  /** Tracé complet (points décodés du/des legGeometry), dans l'ordre de parcours. */
  route: GeoPosition[];
  /** Vitesse simulée, en km/h. */
  speedKmh: number;
}

export interface UseJourneyTrackingOptions {
  enabled: boolean;
  arrivalPoint: GeoPosition | null;
  onArrival: () => void;
  /** Quand fourni, remplace le GPS réel par une position qui avance le long de `route`. */
  simulation?: JourneySimulationConfig | null;
}

export interface UseJourneyTrackingResult {
  position: GeoPosition | null;
  status: JourneyTrackingStatus;
  error: GeoErrorReason | null;
}

function mapPositionError(err: GeolocationPositionError): GeoErrorReason {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'permission-denied';
    case err.TIMEOUT:
      return 'timeout';
    default:
      return 'position-unavailable';
  }
}

function getBlockedReason(): GeoErrorReason | null {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return 'unsupported';
  if (getStoredConsent()?.status !== 'granted') return 'consent-declined';
  return null;
}

export function useJourneyTracking({
  enabled,
  arrivalPoint,
  onArrival,
  simulation = null,
}: UseJourneyTrackingOptions): UseJourneyTrackingResult {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<GeoErrorReason | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasFiredArrivalRef = useRef(false);
  const onArrivalRef = useRef(onArrival);
  const arrivalPointRef = useRef(arrivalPoint);
  const speedKmhRef = useRef(simulation?.speedKmh ?? 0);

  useEffect(() => {
    onArrivalRef.current = onArrival;
  }, [onArrival]);

  useEffect(() => {
    arrivalPointRef.current = arrivalPoint;
  }, [arrivalPoint]);

  useEffect(() => {
    speedKmhRef.current = simulation?.speedKmh ?? 0;
  }, [simulation?.speedKmh]);

  const blockedReason = simulation ? null : getBlockedReason();
  const route = simulation?.route ?? null;

  useEffect(() => {
    if (!enabled || !route || route.length === 0) return;

    hasFiredArrivalRef.current = false;
    let traveledMeters = 0;
    let lastTick = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsedSeconds = (now - lastTick) / 1000;
      lastTick = now;

      const speedMetersPerSecond = (speedKmhRef.current * 1000) / 3600;
      traveledMeters += speedMetersPerSecond * elapsedSeconds;

      const current = positionAlongRoute(route, traveledMeters);
      if (!current) return;
      setPosition(current);
      setError(null);

      const target = arrivalPointRef.current;
      if (target && !hasFiredArrivalRef.current && hasArrived(current, target)) {
        hasFiredArrivalRef.current = true;
        onArrivalRef.current();
      }
    };

    const startId = window.setTimeout(tick, 0);
    const intervalId = window.setInterval(tick, SIMULATION_TICK_MS);

    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [enabled, route]);

  useEffect(() => {
    if (!enabled || route || blockedReason || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    hasFiredArrivalRef.current = false;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const current: GeoPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(current);
        setError(null);

        const target = arrivalPointRef.current;
        if (target && !hasFiredArrivalRef.current && hasArrived(current, target)) {
          hasFiredArrivalRef.current = true;
          onArrivalRef.current();
        }
      },
      (err) => {
        setError(mapPositionError(err));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, route, blockedReason]);

  if (!enabled) {
    return { position, status: 'idle', error: null };
  }

  if (route) {
    return { position, status: 'watching', error: null };
  }

  if (blockedReason) {
    return { position, status: 'error', error: blockedReason };
  }

  return { position, status: error ? 'error' : 'watching', error };
}
