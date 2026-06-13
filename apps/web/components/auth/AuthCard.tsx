'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { colors, borders, typography } from '../../lib/tokens';

interface AuthCardProps {
  activeTab: 'register' | 'login';
  leftContent: ReactNode;
  children: ReactNode;
}

export function AuthCard({ activeTab, leftContent, children }: AuthCardProps) {
  return (
    <div className="flex flex-1">
      <div className="flex flex-1" style={{ background: colors.surface }}>
        {/* Panneau gauche — masqué sur mobile */}
        <aside
          className="hidden md:flex w-80 shrink-0 flex-col p-8"
          style={{ background: colors.surfaceContainerLow, borderRight: borders.default }}
        >
          {leftContent}
        </aside>

        {/* Panneau droit */}
        <div className="flex-1 flex flex-col items-center min-w-0 py-8 px-6 md:px-10 overflow-y-auto">
          <div className="w-full max-w-lg">
            {/* Onglets */}
            <div className="flex mb-8" style={{ borderBottom: borders.default }}>
              {(['register', 'login'] as const).map((tab) => {
                const active = activeTab === tab;
                return (
                  <Link
                    key={tab}
                    href={`/${tab}`}
                    className="flex-1 text-center py-3 transition-colors duration-150"
                    style={{
                      ...typography.bodySm,
                      fontWeight: '500',
                      color: active ? colors.primary : colors.onSurfaceVariant,
                      borderBottom: active ? `2px solid ${colors.primary}` : undefined,
                      marginBottom: active ? '-1px' : undefined,
                    }}
                  >
                    {tab === 'register' ? "S'inscrire" : 'Se connecter'}
                  </Link>
                );
              })}
            </div>

            {/* Contenu formulaire */}
            <div className="flex flex-col gap-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
