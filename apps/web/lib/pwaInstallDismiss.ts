const STORAGE_KEY = 'pwaInstallDismissed:v1';
const REPROMPT_DELAY_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours

export function getDismissedAt(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setDismissed(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, new Date().toISOString());
}

export function shouldShowBanner(dismissedAt: string | null): boolean {
  if (!dismissedAt) return true;
  const dismissedTime = new Date(dismissedAt).getTime();
  if (Number.isNaN(dismissedTime)) return true;
  return Date.now() - dismissedTime > REPROMPT_DELAY_MS;
}
