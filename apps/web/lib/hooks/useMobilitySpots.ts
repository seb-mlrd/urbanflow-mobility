'use client';

import { useEffect, useState } from 'react';
import type { BikeStation, MobilitySnapshot, Scooter } from '@urbanflow/shared';

const POLL_INTERVAL_MS = 60_000;

export interface UseMobilitySpotsOptions {
  enabled?: boolean;
}

export interface UseMobilitySpotsResult {
  bikeStations: BikeStation[];
  scooters: Scooter[];
}

async function fetchSnapshot<T>(path: string): Promise<T[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`);
  if (!res.ok) throw new Error();
  const data: MobilitySnapshot<T> = await res.json();
  return data.vehicles;
}

export function useMobilitySpots({
  enabled = true,
}: UseMobilitySpotsOptions = {}): UseMobilitySpotsResult {
  const [bikeStations, setBikeStations] = useState<BikeStation[]>([]);
  const [scooters, setScooters] = useState<Scooter[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function refresh() {
      const [bikes, scootersResult] = await Promise.all([
        fetchSnapshot<BikeStation>('/mobility/bikes').catch(() => null),
        fetchSnapshot<Scooter>('/mobility/scooters').catch(() => null),
      ]);
      if (cancelled) return;
      if (bikes) setBikeStations(bikes);
      if (scootersResult) setScooters(scootersResult.filter((s) => !s.isDisabled));
    }

    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled]);

  return { bikeStations: enabled ? bikeStations : [], scooters: enabled ? scooters : [] };
}
