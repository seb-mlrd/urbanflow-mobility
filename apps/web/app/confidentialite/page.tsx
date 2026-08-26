import type { Metadata } from 'next';
import { LegalLayout, LegalSection } from '../../components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — UrbanFlow',
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdated="13 août 2026">
      <LegalSection title="1. Responsable de traitement">
        <p>
          Le responsable du traitement des données personnelles collectées via le Service
          UrbanFlow, conformément au Règlement Général sur la Protection des Données (RGPD), est
          Sébastien Maillard, joignable à l&apos;adresse{' '}
          <a
            href="mailto:sebmlrd06@gmail.com"
            className="underline"
            style={{ color: 'var(--color-primary)' }}
          >
            sebmlrd06@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>Nous collectons les données suivantes, selon votre usage du Service :</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Données de compte : prénom, nom, adresse email, mot de passe (chiffré) ;</li>
          <li>Préférences : modes de transport favoris, lignes suivies, adresses enregistrées ;</li>
          <li>Données de géolocalisation, uniquement avec votre consentement explicite ;</li>
          <li>
            Historique de trajets et statistiques d&apos;impact carbone associées à votre compte ;
          </li>
          <li>
            Données techniques : jeton de session, préférences d&apos;affichage et
            d&apos;accessibilité.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalités du traitement">
        <p>Vos données sont utilisées pour :</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>fournir et personnaliser le Service (itinéraires, alertes, statistiques) ;</li>
          <li>gérer votre compte et vous authentifier de manière sécurisée ;</li>
          <li>améliorer la qualité et la fiabilité du Service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Base légale">
        <p>
          Le traitement repose sur l&apos;exécution du contrat (fourniture du Service à votre
          demande) et, pour la géolocalisation, sur votre consentement explicite, révocable à tout
          moment depuis la page Profil.
        </p>
      </LegalSection>

      <LegalSection title="5. Durée de conservation">
        <p>
          Vos données sont conservées tant que votre compte est actif. En cas de suppression de
          compte, l&apos;ensemble de vos données personnelles (profil, adresses, lignes favorites,
          historique de trajets, sessions) est définitivement et immédiatement supprimé.
        </p>
      </LegalSection>

      <LegalSection title="6. Destinataires des données">
        <p>
          Vos données ne sont ni vendues ni partagées à des fins commerciales. Elles peuvent être
          transmises à nos prestataires techniques (hébergement, infrastructure) strictement dans la
          mesure nécessaire au fonctionnement du Service, sous obligation contractuelle de
          confidentialité.
        </p>
        <p>
          Par ailleurs, certaines fonctionnalités appellent directement depuis votre navigateur des
          services tiers, sans transiter par nos serveurs :
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>
            <strong>Base Adresse Nationale</strong> (api-adresse.data.gouv.fr, service public
            français) : reçoit le texte que vous saisissez lors d&apos;une recherche d&apos;adresse,
            ou vos coordonnées GPS lors de la géolocalisation automatique de votre position, afin de
            vous proposer des suggestions ou un nom de lieu ;
          </li>
          <li>
            <strong>CARTO</strong> (fournisseur de fonds de carte) : reçoit une requête technique
            (incluant votre adresse IP) à chaque affichage de la carte, nécessaire au chargement des
            tuiles cartographiques.
          </li>
        </ul>
        <p>
          Ces services sont soumis à leurs propres politiques de confidentialité et ne reçoivent
          aucune autre donnée de votre compte (identité, historique, etc.).
        </p>
      </LegalSection>

      <LegalSection title="7. Vos droits">
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de portabilité et d&apos;opposition sur vos données personnelles.
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Accès et rectification : modifiez vos informations depuis la page Profil ;</li>
          <li>
            Portabilité : sur simple demande à l&apos;adresse indiquée à l&apos;article 9, nous vous
            transmettons une copie structurée de l&apos;ensemble de vos données ;
          </li>
          <li>
            Effacement : supprimez votre compte et l&apos;ensemble de vos données depuis la page
            Profil ;
          </li>
          <li>Opposition à la géolocalisation : révocable à tout moment depuis la page Profil.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Sécurité">
        <p>
          Vos mots de passe sont stockés de manière chiffrée. L&apos;accès à votre compte est
          protégé par authentification, et vos sessions sont automatiquement invalidées à la
          déconnexion ou à la suppression de votre compte.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Pour toute question relative à vos données personnelles ou pour exercer vos droits, vous
          pouvez nous contacter depuis la page Profil de l&apos;application, ou par email à{' '}
          <a
            href="mailto:sebmlrd06@gmail.com"
            className="underline"
            style={{ color: 'var(--color-primary)' }}
          >
            sebmlrd06@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
