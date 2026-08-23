import { useAuthStore } from '../store/useAuthStore';

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const { accessToken } = await res.json();
        return accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function withAuthHeader(init: RequestInit, token: string | null): RequestInit {
  if (!token) return init;
  return { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } };
}

/**
 * Fetch authentifié : ajoute le token du store en en-tête, et si la réponse
 * est 401 (token expiré, TTL 15min), rafraîchit une fois via /auth/refresh
 * puis rejoue la requête avant d'abandonner.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(url, withAuthHeader(init, token));
  if (res.status !== 401) return res;

  const newToken = await refreshAccessToken();
  if (!newToken) {
    useAuthStore.getState().clearAuth();
    return res;
  }
  useAuthStore.getState().setAccessToken(newToken);
  return fetch(url, withAuthHeader(init, newToken));
}
