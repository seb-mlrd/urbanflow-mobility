'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { TRANSPORT_MODES } from '@urbanflow/shared';
import { TRANSPORT_MODE_ICONS } from '../../../lib/transport-icons';
import { GEO_ERROR_MESSAGES, type UseGeolocationResult } from '../../../lib/hooks/useGeolocation';

interface Suggestion {
  label: string;
  lat: number;
  lng: number;
}

export interface JourneySearchValues {
  fromLabel: string;
  fromLat: number;
  fromLng: number;
  toLabel: string;
  toLat: number;
  toLng: number;
  datetime: string;
  selectedModes: string[];
}

interface Props {
  onSearch: (values: JourneySearchValues) => void;
  loading: boolean;
  geo: UseGeolocationResult;
}

function AddressField({
  label,
  value,
  onChange,
  onSelect,
  rightElement,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: Suggestion) => void;
  rightElement?: React.ReactNode;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(v: string) {
    onChange(v);
    if (debounce.current) clearTimeout(debounce.current);
    if (v.length < 3) {
      setSuggestions([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(v)}&limit=5&lat=50.6292&lon=3.0573`,
        );
        const data: {
          features: {
            properties: { label: string };
            geometry: { coordinates: [number, number] };
          }[];
        } = await res.json();
        setSuggestions(
          data.features.map((f) => ({
            label: f.properties.label,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          })),
        );
      } catch {}
    }, 300);
  }

  return (
    <div className="relative">
      <Input
        label={label}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        autoComplete="off"
        rightElement={rightElement}
      />
      {suggestions.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-20"
          style={{
            background: 'var(--color-surface-container-highest)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-sm transition-colors duration-150"
                style={{ color: 'var(--color-on-surface)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--color-surface-container-high)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                onClick={() => {
                  onSelect(s);
                  setSuggestions([]);
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function JourneySearch({ onSearch, loading, geo }: Props) {
  const [fromLabel, setFromLabel] = useState('');
  const [fromLat, setFromLat] = useState<number | null>(null);
  const [fromLng, setFromLng] = useState<number | null>(null);
  const [toLabel, setToLabel] = useState('');
  const [toLat, setToLat] = useState<number | null>(null);
  const [toLng, setToLng] = useState<number | null>(null);
  const [datetime, setDatetime] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [appliedGeoPosition, setAppliedGeoPosition] = useState(geo.position);

  if (geo.status === 'success' && geo.position && geo.position !== appliedGeoPosition) {
    setAppliedGeoPosition(geo.position);
    setFromLat(geo.position.lat);
    setFromLng(geo.position.lng);
    setFromLabel('Position actuelle');
  }

  useEffect(() => {
    if (geo.status !== 'success' || !geo.position) return;
    const { lat, lng } = geo.position;

    let cancelled = false;
    fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const label = data?.features?.[0]?.properties?.label;
        if (label) setFromLabel(label);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [geo.status, geo.position]);

  const canSearch = fromLat !== null && toLat !== null;

  function handleSwap() {
    setFromLabel(toLabel);
    setFromLat(toLat);
    setFromLng(toLng);
    setToLabel(fromLabel);
    setToLat(fromLat);
    setToLng(fromLng);
  }

  function toggleMode(mode: string) {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fromLat === null) {
      geo.requestLocation();
      return;
    }
    if (!canSearch) return;
    onSearch({
      fromLabel,
      fromLat: fromLat!,
      fromLng: fromLng!,
      toLabel,
      toLat: toLat!,
      toLng: toLng!,
      datetime,
      selectedModes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <AddressField
            label="Départ"
            value={fromLabel}
            onChange={(v) => {
              setFromLabel(v);
              setFromLat(null);
              setFromLng(null);
            }}
            onSelect={(s) => {
              setFromLabel(s.label);
              setFromLat(s.lat);
              setFromLng(s.lng);
            }}
            rightElement={
              <button
                type="button"
                onClick={geo.requestLocation}
                aria-label="Utiliser ma position"
                title="Utiliser ma position"
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
                style={{ color: 'var(--color-primary)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M12 2v3M12 19v3M2 12h3M19 12h3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            }
          />
          <AddressField
            label="Arrivée"
            value={toLabel}
            onChange={(v) => {
              setToLabel(v);
              setToLat(null);
              setToLng(null);
            }}
            onSelect={(s) => {
              setToLabel(s.label);
              setToLat(s.lat);
              setToLng(s.lng);
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Intervertir départ et arrivée"
          title="Intervertir départ et arrivée"
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-150"
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
      </div>
      {geo.status === 'error' && geo.error && (
        <p className="text-xs" style={{ color: 'var(--color-error, #b3261e)' }}>
          {GEO_ERROR_MESSAGES[geo.error]}
        </p>
      )}
      {geo.hasConsent && (
        <button
          type="button"
          onClick={geo.revokeConsent}
          className="self-start text-xs underline"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Oublier ma position
        </button>
      )}
      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Date et heure (facultatif)
        </label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm min-h-[48px] outline-none"
          style={{
            background: 'var(--color-surface-container-high)',
            color: 'var(--color-on-surface)',
            border: '1px solid var(--color-outline-variant)',
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          Modes de transport
        </span>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrer par mode de transport"
        >
          {TRANSPORT_MODES.map((mode) => {
            const active = selectedModes.includes(mode);
            return (
              <button
                key={mode}
                type="button"
                onClick={() => toggleMode(mode)}
                aria-pressed={active}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150"
                style={{
                  background: active
                    ? 'var(--color-primary)'
                    : 'var(--color-surface-container-high)',
                  color: active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
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
        {selectedModes.length === 0 && (
          <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
            Aucun filtre — les modes de votre profil seront mis en avant
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || (fromLat !== null && toLat === null)}
        aria-busy={loading}
        className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl min-h-[48px] transition-colors duration-150 disabled:opacity-50"
        style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
      >
        {loading ? 'Recherche en cours…' : 'Rechercher un itinéraire'}
      </button>
    </form>
  );
}
