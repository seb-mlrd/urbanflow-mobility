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
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

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
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setApiError(data.message ?? 'Identifiants incorrects.');
        return;
      }

      const data = await res.json();
      if (!data.accessToken) {
        setApiError('Une erreur est survenue. Veuillez réessayer.');
        return;
      }
      setAccessToken(data.accessToken);
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
          <h1 className="text-xl font-bold text-gray-900">Connexion à votre compte</h1>
          <p className="text-sm text-gray-500 mt-1">
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
              className="text-sm text-gray-500 shrink-0"
            >
              {showPassword ? 'Masquer' : 'Voir'}
            </button>
          }
        />

        {successMessage && (
          <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            {successMessage}
          </p>
        )}
        {apiError && <p className="text-sm text-red-500">{apiError}</p>}

        <Button type="submit" loading={loading} disabled={loading || !!successMessage}>
          Se connecter →
        </Button>

        <p className="text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-semibold text-gray-900">
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
