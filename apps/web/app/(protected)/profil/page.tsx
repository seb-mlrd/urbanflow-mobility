'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';

const SETTINGS_ITEMS = [
  {
    key: 'transport',
    label: 'Préférences de transport',
    subtitle: 'Vélo, Métro privilégiés',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="6" cy="14" r="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 14h4M6 12V8l2-3h4l2 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'adresses',
    label: 'Adresses enregistrées',
    subtitle: 'Domicile, Bureau +2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 8.5L10 3l7 5.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'paiement',
    label: 'Moyens de paiement',
    subtitle: 'Visa se terminant par 4242',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 8.5h16" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 13h3M14 13h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'parametres',
    label: "Paramètres de l'application",
    subtitle: 'Notifications, Langue, Thème',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M4.1 15.9l1.4-1.4M14.5 5.5l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const fieldConfig = [
  { label: 'Prénom', key: 'firstName' as const, type: 'text', autoComplete: 'given-name' },
  { label: 'Nom', key: 'lastName' as const, type: 'text', autoComplete: 'family-name' },
  { label: 'Email', key: 'email' as const, type: 'email', autoComplete: 'email' },
];

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: 'var(--color-on-surface-variant)' }}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProfilPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const transportModes = useAuthStore((s) => s.transportModes);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!user) return null;

  function handleLogout() {
    clearAuth();
    router.push('/');
  }

  function startEditing() {
    setEditForm({ firstName: user!.firstName, lastName: user!.lastName, email: user!.email });
    setSaveError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setSaveError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.message ?? 'Une erreur est survenue.');
        return;
      }
      const profile = await res.json();
      setAuth(
        accessToken!,
        { id: profile.user.id, firstName: profile.user.firstName, lastName: profile.user.lastName, email: profile.user.email },
        transportModes,
      );
      setIsEditing(false);
    } catch {
      setSaveError('Impossible de contacter le serveur.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto">

      {/* ── Hero profil ── */}
      <section
        aria-labelledby="profil-name"
        className="rounded-xl p-6 mb-4 flex flex-col items-center gap-4 text-center"
        style={{ background: 'var(--color-surface-container)' }}
      >
        {/* Avatar */}
        <div
          aria-label={`Avatar de ${user.firstName} ${user.lastName}`}
          className="w-20 h-20 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--color-secondary-container)' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" style={{ color: 'var(--color-on-secondary-container)' }}>
            <circle cx="18" cy="13" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M6 31c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div>
          <h1 id="profil-name" className="text-xl font-bold mb-1" style={{ color: 'var(--color-on-surface)' }}>
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Commuter Quotidien • Premium
          </p>
        </div>

        {isEditing ? (
          <div className="w-full max-w-sm flex flex-col gap-3">
            {fieldConfig.map(({ label, key, type, autoComplete }) => (
              <div key={key} className="flex flex-col gap-1.5 text-left">
                <label
                  htmlFor={`field-${key}`}
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  {label}
                </label>
                <input
                  id={`field-${key}`}
                  type={type}
                  autoComplete={autoComplete}
                  value={editForm[key]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="px-3 py-2.5 rounded-lg text-sm min-h-[44px] outline-none transition-colors duration-150"
                  style={{
                    background: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-outline-variant)')}
                />
              </div>
            ))}

            {saveError && (
              <p role="alert" className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-error)' }}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {saveError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                aria-busy={saving}
                className="flex-1 flex items-center justify-center text-sm font-semibold px-4 py-2.5 rounded-lg min-h-[44px] transition-colors duration-150 disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors duration-150"
                style={{ color: 'var(--color-on-surface-variant)', border: '1px solid var(--color-outline-variant)' }}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 min-h-[44px]"
            style={{ border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}
          >
            Éditer le profil
          </button>
        )}
      </section>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

        {/* Impact écologique */}
        <section
          aria-labelledby="stat-co2"
          className="rounded-xl p-4 relative overflow-hidden"
          style={{ background: 'var(--color-surface-container)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: 'var(--color-primary)' }}>
              <path d="M8 2C5 2 3 4.5 3 7c0 2 1.5 3.5 3 4v2h4v-2c1.5-.5 3-2 3-4 0-2.5-2-5-5-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M6 9c1-1 3-1 4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <h2
              id="stat-co2"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.08em' }}
            >
              Impact écologique
            </h2>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-on-surface)' }}>
            124 <span className="text-xl font-semibold">kg</span>
          </p>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            de CO₂ économisés ce mois
          </p>
          {/* Filigrane décoratif */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="absolute right-3 bottom-2 opacity-10"
            style={{ color: 'var(--color-primary)' }}
          >
            <path d="M8 2C5 2 3 4.5 3 7c0 2 1.5 3.5 3 4v2h4v-2c1.5-.5 3-2 3-4 0-2.5-2-5-5-5Z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
          </svg>
        </section>

        {/* Points Flow */}
        <section
          aria-labelledby="stat-points"
          className="rounded-xl p-4"
          style={{ background: 'var(--color-surface-container)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: 'var(--color-secondary)' }}>
              <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.2l-3.7 2.1.7-4.1-3-2.9 4.2-.7L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            <h2
              id="stat-points"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-on-surface-variant)', letterSpacing: '0.08em' }}
            >
              Points Flow
            </h2>
          </div>
          <p className="text-3xl font-bold mb-2" style={{ color: 'var(--color-on-surface)' }}>
            2,450
          </p>
          <button
            type="button"
            className="text-sm font-medium"
            style={{ color: 'var(--color-primary)' }}
          >
            Voir les récompenses
          </button>
        </section>

        {/* Trajets */}
        <section
          aria-labelledby="stat-trajets"
          className="rounded-xl p-4"
          style={{ background: 'var(--color-surface-container)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: 'var(--color-on-surface-variant)' }}>
              <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2
              id="stat-trajets"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-on-surface-variant)', letterSpacing: '0.08em' }}
            >
              Trajets (mois)
            </h2>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-on-surface)' }}>
            48
          </p>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            +12% vs mois dernier
          </p>
        </section>
      </div>

      {/* ── Liste des paramètres ── */}
      <section
        aria-label="Paramètres et préférences"
        className="rounded-xl overflow-hidden mb-4"
        style={{ background: 'var(--color-surface-container)' }}
      >
        {SETTINGS_ITEMS.map(({ key, label, subtitle, icon }, i) => (
          <button
            key={key}
            type="button"
            className="w-full flex items-center gap-4 px-4 py-4 min-h-[64px] text-left transition-colors duration-150"
            style={{
              borderBottom: i < SETTINGS_ITEMS.length - 1 ? '1px solid var(--color-outline-variant)' : undefined,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-container-high)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            <span
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}
            >
              {icon}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
                {label}
              </span>
              <span className="block text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                {subtitle}
              </span>
            </span>
            <ChevronRight />
          </button>
        ))}
      </section>

      {/* ── Déconnexion ── */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold min-h-[48px] transition-colors duration-150"
        style={{ color: 'var(--color-error)', border: '1px solid var(--color-error-container)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-error-container)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Déconnexion
      </button>
    </div>
  );
}
