'use client';

import { useRef, useState } from 'react';
import { Input } from '../../../../components/ui/Input';

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
}

interface Props {
  onSearch: (values: JourneySearchValues) => void;
  loading: boolean;
}

function AddressField({
  label,
  value,
  onChange,
  onSelect,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: Suggestion) => void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(v: string) {
    onChange(v);
    if (debounce.current) clearTimeout(debounce.current);
    if (v.length < 3) { setSuggestions([]); return; }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(v)}&limit=4&citycode=59350`,
        );
        const data = await res.json();
        setSuggestions(
          data.features.map((f: any) => ({
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
      <Input label={label} value={value} onChange={(e) => handleChange(e.target.value)} autoComplete="off" />
      {suggestions.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-20"
          style={{ background: 'var(--color-surface-container-highest)', border: '1px solid var(--color-outline-variant)' }}
        >
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-sm transition-colors duration-150"
                style={{ color: 'var(--color-on-surface)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-container-high)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                onClick={() => { onSelect(s); setSuggestions([]); }}
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

export function JourneySearch({ onSearch, loading }: Props) {
  const [fromLabel, setFromLabel] = useState('');
  const [fromLat, setFromLat] = useState<number | null>(null);
  const [fromLng, setFromLng] = useState<number | null>(null);
  const [toLabel, setToLabel] = useState('');
  const [toLat, setToLat] = useState<number | null>(null);
  const [toLng, setToLng] = useState<number | null>(null);
  const [datetime, setDatetime] = useState('');

  const canSearch = fromLat !== null && toLat !== null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSearch) return;
    onSearch({ fromLabel, fromLat: fromLat!, fromLng: fromLng!, toLabel, toLat: toLat!, toLng: toLng!, datetime });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <AddressField
        label="Départ"
        value={fromLabel}
        onChange={(v) => { setFromLabel(v); setFromLat(null); setFromLng(null); }}
        onSelect={(s) => { setFromLabel(s.label); setFromLat(s.lat); setFromLng(s.lng); }}
      />
      <AddressField
        label="Arrivée"
        value={toLabel}
        onChange={(v) => { setToLabel(v); setToLat(null); setToLng(null); }}
        onSelect={(s) => { setToLabel(s.label); setToLat(s.lat); setToLng(s.lng); }}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
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
      <button
        type="submit"
        disabled={!canSearch || loading}
        aria-busy={loading}
        className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl min-h-[48px] transition-colors duration-150 disabled:opacity-50"
        style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
      >
        {loading ? 'Recherche en cours…' : 'Rechercher un itinéraire'}
      </button>
    </form>
  );
}
