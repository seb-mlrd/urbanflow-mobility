'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { TopBar } from '../../components/ui/TopBar';
import { Sidebar } from '../../components/ui/Sidebar';
import { BottomNav } from '../../components/ui/BottomNav';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Si on a déjà un token en mémoire (navigation interne), pas besoin de refresh
    if (accessToken) {
      setReady(true);
      return;
    }

    // Tentative de rehydratation via le cookie httpOnly (ex: après un reload)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const { accessToken: token } = await res.json();

        // Récupère les infos user depuis /profile avec le nouveau token
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!profileRes.ok) {
          router.replace('/login');
          return;
        }
        const profile = await profileRes.json();
        setAuth(token, profile.user, profile.transportModes ?? []);
        setReady(true);
      })
      .catch(() => router.replace('/login'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <TopBar onMenuToggle={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto pb-20 md:pb-0"
          style={{ background: 'var(--color-surface)' }}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
