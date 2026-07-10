const STORAGE_KEY = 'geoConsent:v1';

export const GEO_CONSENT_POLICY_VERSION = 1;

export type ConsentStatus = 'granted' | 'denied';

export interface StoredConsent {
  status: ConsentStatus;
  timestamp: string;
  policyVersion: number;
}

function isStoredConsent(value: unknown): value is StoredConsent {
  return (
    typeof value === 'object' &&
    value !== null &&
    ((value as StoredConsent).status === 'granted' ||
      (value as StoredConsent).status === 'denied') &&
    typeof (value as StoredConsent).timestamp === 'string' &&
    typeof (value as StoredConsent).policyVersion === 'number'
  );
}

export function getStoredConsent(): StoredConsent | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isStoredConsent(parsed) || parsed.policyVersion !== GEO_CONSENT_POLICY_VERSION)
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredConsent(status: ConsentStatus): void {
  if (typeof localStorage === 'undefined') return;
  const value: StoredConsent = {
    status,
    timestamp: new Date().toISOString(),
    policyVersion: GEO_CONSENT_POLICY_VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function clearStoredConsent(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
