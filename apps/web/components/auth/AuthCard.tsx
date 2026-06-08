'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';

interface AuthCardProps {
  activeTab: 'register' | 'login';
  leftContent: ReactNode;
  children: ReactNode;
}

export function AuthCard({ activeTab, leftContent, children }: AuthCardProps) {
  return (
    <div className="flex flex-1">
      <div className="bg-white flex flex-1">
        {/* Panneau gauche — masqué sur mobile */}
        <aside className="hidden md:flex w-72 shrink-0 flex-col bg-gray-50 border-r border-gray-200 p-8">
          {leftContent}
        </aside>

        {/* Panneau droit */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="w-full max-w-2xl px-6 md:px-10">
            {/* Onglets */}
            <div className="flex border-b border-gray-200">
              <Link
                href="/register"
                className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${
                  activeTab === 'register'
                    ? 'text-gray-900 font-semibold border-b-2 border-gray-900 -mb-px'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                S&apos;inscrire
              </Link>
              <Link
                href="/login"
                className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'text-gray-900 font-semibold border-b-2 border-gray-900 -mb-px'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Se connecter
              </Link>
            </div>

            {/* Contenu formulaire */}
            <div className="flex flex-col gap-4 py-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
