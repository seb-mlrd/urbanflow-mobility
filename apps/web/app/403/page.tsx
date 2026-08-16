import type { Metadata } from 'next';
import { StatusPage } from '../../components/status/StatusPage';

export const metadata: Metadata = {
  title: 'Accès refusé — UrbanFlow',
};

export default function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="Accès refusé"
      description="Vous n'avez pas les autorisations nécessaires pour accéder à cette page. Si vous pensez qu'il s'agit d'une erreur, contactez le support."
      icon={
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect
            x="9"
            y="15"
            width="14"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12 15v-3.5a4 4 0 0 1 8 0V15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="16" cy="20" r="1.2" fill="currentColor" />
        </svg>
      }
      primaryAction={{ href: '/', label: "Retour à l'accueil" }}
      secondaryAction={{ href: '/profil', label: 'Mon profil' }}
    />
  );
}
