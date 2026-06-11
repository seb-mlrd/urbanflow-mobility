import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  transportModes: string[];
  setAuth: (token: string, user: AuthUser, transportModes?: string[]) => void;
  setTransportModes: (modes: string[]) => void;
  clearAuth: () => void;
  /** @deprecated use setAuth */
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      transportModes: [],
      setAuth: (token, user, transportModes = []) =>
        set({ accessToken: token, user, transportModes }),
      setTransportModes: (modes) => set({ transportModes: modes }),
      clearAuth: () => set({ accessToken: null, user: null, transportModes: [] }),
      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
