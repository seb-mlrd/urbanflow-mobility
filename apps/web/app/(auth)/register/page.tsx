'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthCard } from '../../../components/auth/AuthCard';
import { AuthFeatureList } from '../../../components/auth/AuthFeatureList';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Input } from '../../../components/ui/Input';
import { ModeChip } from '../../../components/ui/ModeChip';
import {
  RegisterFormErrors,
  RegisterFormValues,
  validateRegisterForm,
} from '../../../lib/auth.validation';

const MODES = ['Vélo', 'Trottinette', 'Transports', 'Marche', 'Voiture'];

const registerLeftContent = (
  <AuthFeatureList
    badge="UrbanFlow Mobility"
    title="Déplacez-vous plus intelligemment"
    description="Rejoignez des milliers de citoyens qui optimisent leurs trajets urbains tout en réduisant leur empreinte carbone."
    features={[
      { title: 'Itinéraires multimodaux', desc: 'Vélo, TC, trottinette, covoiturage combinés' },
      { title: 'Suivi empreinte carbone', desc: 'Mesurez et réduisez votre impact CO₂' },
      { title: 'Alertes en temps réel', desc: 'Perturbations et alternatives immédiates' },
      { title: 'Tableau de bord personnel', desc: 'Visualisez vos habitudes de mobilité' },
    ]}
  />
);

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function toggleMode(mode: string) {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  function handleChange(field: keyof RegisterFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setApiError(null);

    const errors = validateRegisterForm(form, cguAccepted);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setApiError(data.message ?? 'Une erreur est survenue.');
        return;
      }

      setSuccessMessage('Compte créé avec succès ! Vous allez être redirigé vers la connexion…');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setApiError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard activeTab="register" leftContent={registerLeftContent}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
        {/* Prénom + Nom côte à côte, même largeur totale que les autres champs */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            label="Prénom"
            placeholder="Jean"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={fieldErrors.firstName}
            wrapperClassName="flex-1 min-w-0"
          />
          <Input
            label="Nom"
            placeholder="Dupont"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={fieldErrors.lastName}
            wrapperClassName="flex-1 min-w-0"
          />
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
          autoComplete="new-password"
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

        <Input
          label="Confirmer votre mot de passe"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="········"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={fieldErrors.confirmPassword}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="text-sm text-gray-500 shrink-0"
            >
              {showConfirmPassword ? 'Masquer' : 'Voir'}
            </button>
          }
        />

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-gray-900">Modes de transport préférés</span>
          <div className="flex flex-wrap gap-2">
            {MODES.map((mode) => (
              <ModeChip
                key={mode}
                label={mode}
                selected={selectedModes.includes(mode)}
                onToggle={() => toggleMode(mode)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Checkbox
            label={
              <span>
                J&apos;accepte les{' '}
                <Link href="/cgu" className="underline text-gray-900">
                  Conditions Générales d&apos;Utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/confidentialite" className="underline text-gray-900">
                  politique de confidentialité
                </Link>{' '}
                (RGPD)
              </span>
            }
            checked={cguAccepted}
            onChange={(e) => {
              setCguAccepted(e.target.checked);
              if (fieldErrors.cgu) setFieldErrors((prev) => ({ ...prev, cgu: undefined }));
            }}
          />
          {fieldErrors.cgu && <p className="text-xs text-red-500 ml-8">{fieldErrors.cgu}</p>}
        </div>

        {successMessage && (
          <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            {successMessage}
          </p>
        )}
        {apiError && <p className="text-sm text-red-500">{apiError}</p>}

        <Button type="submit" loading={loading} disabled={loading || !!successMessage}>
          Créer mon compte et continuer →
        </Button>

        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-semibold text-gray-900">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
