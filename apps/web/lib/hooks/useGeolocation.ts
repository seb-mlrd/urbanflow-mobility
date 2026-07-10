'use client';

import { useCallback, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  ConsentStatus,
  clearStoredConsent,
  getStoredConsent,
  setStoredConsent,
} from '../geolocationConsent';

export type GeoStatus = 'idle' | 'awaiting-consent' | 'locating' | 'success' | 'error';

export type GeoErrorReason =
  | 'consent-declined'
  | 'permission-denied'
  | 'timeout'
  | 'unsupported'
  | 'position-unavailable';

export interface GeoPosition {
  lat: number;
  lng: number;
}

export const GEO_ERROR_MESSAGES: Record<GeoErrorReason, string> = {
  'consent-declined': "Vous avez refusé l'accès à votre position — vous pouvez saisir l'adresse manuellement.",
  'permission-denied': 'Votre navigateur a bloqué l\'accès à la position. Vérifiez les autorisations du site.',
  timeout: 'La récupération de votre position a pris trop de temps. Réessayez.',
  unsupported: "La géolocalisation n'est pas disponible sur cet appareil.",
  'position-unavailable': "Votre position n'a pas pu être déterminée. Réessayez.",
};

export interface UseGeolocationResult {
  status: GeoStatus;
  position: GeoPosition | null;
  error: GeoErrorReason | null;
  isConsentModalOpen: boolean;
  hasConsent: boolean;
  requestLocation: () => void;
  confirmConsent: () => void;
  declineConsent: () => void;
  revokeConsent: () => void;
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

export function useGeolocation(): UseGeolocationResult {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<GeoErrorReason | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(() => getStoredConsent()?.status === 'granted');

  const syncConsentToBackend = useCallback(
    (granted: boolean) => {
      if (!accessToken) return;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ geolocationConsent: granted }),
      }).catch(() => {});
    },
    [accessToken],
  );

  const locate = useCallback(() => {
    setStatus('locating');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('success');
      },
      (err) => {
        setError(mapPositionError(err));
        setStatus('error');
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('unsupported');
      setStatus('error');
      return;
    }

    const stored = getStoredConsent();
    if (stored?.status === 'granted') {
      locate();
      return;
    }

    setStatus('awaiting-consent');
    setIsConsentModalOpen(true);
  }, [locate]);

  const applyConsent = useCallback(
    (status: ConsentStatus) => {
      setStoredConsent(status);
      setHasConsent(status === 'granted');
      syncConsentToBackend(status === 'granted');
      setIsConsentModalOpen(false);
    },
    [syncConsentToBackend],
  );

  const confirmConsent = useCallback(() => {
    applyConsent('granted');
    locate();
  }, [applyConsent, locate]);

  const declineConsent = useCallback(() => {
    applyConsent('denied');
    setError('consent-declined');
    setStatus('error');
  }, [applyConsent]);

  const revokeConsent = useCallback(() => {
    clearStoredConsent();
    setHasConsent(false);
    syncConsentToBackend(false);
    setStatus('idle');
    setPosition(null);
    setError(null);
  }, [syncConsentToBackend]);

  return {
    status,
    position,
    error,
    isConsentModalOpen,
    hasConsent,
    requestLocation,
    confirmConsent,
    declineConsent,
    revokeConsent,
  };
}
