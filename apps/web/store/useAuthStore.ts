import { create } from 'zustand';

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
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  transportModes: [],
  setAuth: (token, user, transportModes = []) =>
    set({ accessToken: token, user, transportModes }),
  setTransportModes: (modes) => set({ transportModes: modes }),
  clearAuth: () => set({ accessToken: null, user: null, transportModes: [] }),
}));
