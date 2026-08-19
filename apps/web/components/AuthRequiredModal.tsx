'use client';

import Link from 'next/link';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthRequiredModal({ open, onClose }: AuthRequiredModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Connexion requise">
      <p className="text-sm" style={{ color: 'var(--color-on-surface)' }}>
        Connectez-vous pour planifier votre itinéraire et le retrouver dans votre espace
        Planification.
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
        <Link href="/login" className="flex-1">
          <Button type="button" variant="primary">
            Se connecter
          </Button>
        </Link>
      </div>
    </Modal>
  );
}
