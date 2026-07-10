'use client';

import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface GeolocationConsentModalProps {
  open: boolean;
  onAllow: () => void;
  onDecline: () => void;
}

export function GeolocationConsentModal({
  open,
  onAllow,
  onDecline,
}: GeolocationConsentModalProps) {
  return (
    <Modal open={open} onClose={onDecline} title="Utiliser votre position">
      <p className="text-sm" style={{ color: 'var(--color-on-surface)' }}>
        Nous souhaitons utiliser la position précise de votre appareil pour pré-remplir
        automatiquement le champ « Départ » de votre recherche d&apos;itinéraire et vous positionner
        sur la carte.
      </p>
      <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
        Cette donnée de géolocalisation n&apos;est utilisée que pour ces fonctionnalités et
        n&apos;est pas conservée sur nos serveurs. Si vous êtes connecté(e), seule votre décision
        (accord ou refus) et sa date sont enregistrées sur votre compte — jamais vos coordonnées.
      </p>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onDecline}>
          Refuser
        </Button>
        <Button type="button" variant="primary" onClick={onAllow}>
          Autoriser
        </Button>
      </div>
    </Modal>
  );
}
