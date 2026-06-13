'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthCard } from '../../../components/auth/AuthCard';
import { AuthFeatureList } from '../../../components/auth/AuthFeatureList';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { validateLoginForm, type LoginFormErrors, type LoginFormValues } from '../../../lib/auth.validation';
import { useAuthStore } from '../../../store/useAuthStore';

const loginLeftContent = (
  <AuthFeatureList
    badge="UrbanFlow Mobility"
    title="Bon retour parmi nous !"
    description="Reconnectez-vous pour retrouver vos itinéraires, votre bilan carbone et vos récompenses mobilité."
    features={[
      { title: 'Vos trajets enregistrés', desc: 'Historique et favoris synchronisés' },
      { title: 'Votre bilan CO₂', desc: 'Historique et objectifs sauvegardés' },
      { title: 'Vos alertes actives', desc: 'Perturbations sur vos lignes habituelles' },
      { title: 'Tableau de bord personnel', desc: 'Visualisez vos habitudes de mobilité' },
    ]}
  />
);

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState<LoginFormValues>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleChange(field: keyof LoginFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setApiError(null);

    const errors = validateLoginForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setApiError(data.message ?? 'Identifiants incorrects.');
        return;
      }

      const data = await res.json();
      if (!data.accessToken || !data.user) {
        setApiError('Une erreur est survenue. Veuillez réessayer.');
        return;
      }

      let transportModes: string[] = [];
      try {
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          transportModes = profile.transportModes ?? [];
        }
      } catch {}

      setAuth(data.accessToken, data.user, transportModes);
      setSuccessMessage('Connexion réussie ! Vous allez être redirigé…');
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setApiError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard activeTab="login" leftContent={loginLeftContent}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
        <div className="mb-1">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)' }}>Connexion à votre compte</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
            Entrez vos identifiants pour accéder à votre espace mobilité.
          </p>
        </div>

        <Input
          label="Adresse email"
          type="email"
          placeholder="jean.dupont@email.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={fieldErrors.email}
        />

        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          placeholder="········"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={fieldErrors.password}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-sm shrink-0"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {showPassword ? 'Masquer' : 'Voir'}
            </button>
          }
        />

        {successMessage && (
          <p role="status" className="text-sm rounded-lg px-4 py-3" style={{ color: 'var(--color-primary)', background: 'var(--color-surface-container-high)', border: '1px solid var(--color-primary)' }}>
            {successMessage}
          </p>
        )}
        {apiError && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{apiError}</p>}

        <Button type="submit" loading={loading} disabled={loading || !!successMessage}>
          Se connecter →
        </Button>

        <p className="text-center text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
