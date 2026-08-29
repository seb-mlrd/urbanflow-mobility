'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authFetch } from '../auth-fetch';

export interface SavedAddress {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
}

export function useSavedAddresses(): SavedAddress[] {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    authFetch('/addresses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setAddresses(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return accessToken ? addresses : [];
}
