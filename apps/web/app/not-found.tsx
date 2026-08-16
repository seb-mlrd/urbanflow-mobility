import type { Metadata } from 'next';
import { StatusPage } from '../components/status/StatusPage';

export const metadata: Metadata = {
  title: 'Page introuvable — UrbanFlow',
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page introuvable"
      description="La page que vous cherchez n'existe pas ou a été déplacée. Vérifiez l'adresse ou repartez depuis l'accueil."
      icon={
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M16 5c-5 0-9 3.8-9 9 0 6.5 9 13 9 13s9-6.5 9-13c0-5.2-4-9-9-9Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 11.5l7 5M19.5 11.5l-7 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      }
      primaryAction={{ href: '/', label: "Retour à l'accueil" }}
    />
  );
}
