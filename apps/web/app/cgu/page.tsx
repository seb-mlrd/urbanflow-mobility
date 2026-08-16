import type { Metadata } from 'next';
import { LegalLayout, LegalSection } from '../../components/legal/LegalLayout';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — UrbanFlow",
};

export default function CguPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdated="13 août 2026">
      <LegalSection title="1. Objet">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (« CGU ») régissent l&apos;accès et
          l&apos;utilisation du service UrbanFlow (« le Service »), une application de mobilité
          urbaine permettant de rechercher des itinéraires multimodaux, de suivre son empreinte
          carbone et de recevoir des alertes sur les lignes de transport favorites. En créant un
          compte, vous acceptez sans réserve les présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="2. Accès au service">
        <p>
          L&apos;accès à certaines fonctionnalités (recherche d&apos;itinéraire) est possible sans
          compte. La création d&apos;un compte est nécessaire pour enregistrer des adresses, des
          lignes favorites, consulter son historique de trajets et son impact CO₂. Vous devez avoir
          au moins 15 ans pour créer un compte.
        </p>
      </LegalSection>

      <LegalSection title="3. Compte utilisateur">
        <p>
          Vous êtes responsable de l&apos;exactitude des informations fournies lors de
          l&apos;inscription et de la confidentialité de vos identifiants de connexion. Toute
          activité effectuée depuis votre compte est présumée réalisée par vous. Vous pouvez à
          tout moment modifier vos informations ou supprimer définitivement votre compte depuis la
          page Profil.
        </p>
      </LegalSection>

      <LegalSection title="4. Utilisation du service">
        <p>Vous vous engagez à utiliser le Service conformément à sa destination et à ne pas :</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>tenter d&apos;accéder à des données ou comptes qui ne vous appartiennent pas ;</li>
          <li>perturber ou surcharger le fonctionnement technique du Service ;</li>
          <li>utiliser le Service à des fins frauduleuses ou contraires à la loi.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Données de géolocalisation">
        <p>
          Certaines fonctionnalités (calcul d&apos;itinéraire depuis votre position) nécessitent
          votre consentement explicite à la géolocalisation. Ce consentement est révocable à tout
          moment depuis la page Profil, sans affecter les autres fonctionnalités du Service.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilité et évolution du service">
        <p>
          UrbanFlow s&apos;efforce d&apos;assurer un accès continu au Service mais ne garantit pas
          une disponibilité ininterrompue, notamment en cas de maintenance ou d&apos;indisponibilité
          des données de transport tierces (horaires, perturbations). Les fonctionnalités peuvent
          évoluer ou être modifiées à des fins d&apos;amélioration du Service.
        </p>
      </LegalSection>

      <LegalSection title="7. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du Service (interface, marque, contenus) est protégé par le
          droit de la propriété intellectuelle. Toute reproduction ou exploitation non autorisée est
          interdite.
        </p>
      </LegalSection>

      <LegalSection title="8. Résiliation">
        <p>
          Vous pouvez cesser d&apos;utiliser le Service et supprimer votre compte à tout moment
          depuis la page Profil, section « Zone dangereuse ». UrbanFlow se réserve le droit de
          suspendre un compte en cas de manquement grave aux présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="9. Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. Pour toute question relative à ces
          conditions, vous pouvez nous contacter via la page Profil ou à l&apos;adresse indiquée
          dans notre{' '}
          <a href="/confidentialite" className="underline" style={{ color: 'var(--color-primary)' }}>
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
