'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RegisterFormErrors, RegisterFormValues, validateRegisterForm } from '../../../lib/auth.validation';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Header } from '../../../components/ui/Header';
import { Input } from '../../../components/ui/Input';
import { ModeChip } from '../../../components/ui/ModeChip';

const MODES = ['Vélo', 'Trottinette', 'TC', 'Marche', 'Voiture'];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterFormValues>({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  function toggleMode(mode: string) {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
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
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setApiError(data.message ?? 'Une erreur est survenue.');
        return;
      }

      router.push('/');
    } catch {
      setApiError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  }

  function clearError(field: keyof RegisterFormErrors) {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header title="Créer un compte" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-8 flex-1" noValidate>
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Rejoignez UrbanFlow</h1>
          <p className="text-sm text-gray-500 mt-1">Créez votre profil de mobilité personnalisé.</p>
        </div>

        <Input
          label="Prénom"
          placeholder="Jean"
          autoComplete="given-name"
          value={form.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          error={fieldErrors.firstName}
        />
        <Input
          label="Nom"
          placeholder="Dupont"
          autoComplete="family-name"
          value={form.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          error={fieldErrors.lastName}
        />
        <Input
          label="Email"
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

        <div className="flex flex-col gap-3">
          <span className="text-base font-bold text-gray-900">Modes préférés</span>
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
                  CGU
                </Link>{' '}
                et la politique RGPD
              </span>
            }
            checked={cguAccepted}
            onChange={(e) => {
              setCguAccepted(e.target.checked);
              clearError('cgu');
            }}
          />
          {fieldErrors.cgu && <p className="text-xs text-red-500 ml-8">{fieldErrors.cgu}</p>}
        </div>

        {apiError && <p className="text-sm text-red-500">{apiError}</p>}

        <Button type="submit" loading={loading} disabled={loading}>
          Créer mon compte
        </Button>

        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-semibold text-gray-900">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
