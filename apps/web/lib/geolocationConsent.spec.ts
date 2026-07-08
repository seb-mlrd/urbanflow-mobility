import { beforeEach, describe, expect, it } from 'vitest';
import {
  GEO_CONSENT_POLICY_VERSION,
  clearStoredConsent,
  getStoredConsent,
  setStoredConsent,
} from './geolocationConsent';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

beforeEach(() => {
  (globalThis as any).localStorage = createMemoryStorage();
});

describe('getStoredConsent()', () => {
  it('retourne null si aucun consentement stocké', () => {
    expect(getStoredConsent()).toBeNull();
  });

  it('retourne le consentement stocké après setStoredConsent("granted")', () => {
    setStoredConsent('granted');
    const stored = getStoredConsent();
    expect(stored?.status).toBe('granted');
    expect(stored?.policyVersion).toBe(GEO_CONSENT_POLICY_VERSION);
    expect(typeof stored?.timestamp).toBe('string');
  });

  it('retourne le consentement stocké après setStoredConsent("denied")', () => {
    setStoredConsent('denied');
    expect(getStoredConsent()?.status).toBe('denied');
  });

  it('retourne null si la version de politique stockée ne correspond pas', () => {
    localStorage.setItem(
      'geoConsent:v1',
      JSON.stringify({ status: 'granted', timestamp: new Date().toISOString(), policyVersion: 999 }),
    );
    expect(getStoredConsent()).toBeNull();
  });

  it('retourne null si la valeur stockée est corrompue', () => {
    localStorage.setItem('geoConsent:v1', 'not-json');
    expect(getStoredConsent()).toBeNull();
  });
});

describe('clearStoredConsent()', () => {
  it('supprime le consentement stocké', () => {
    setStoredConsent('granted');
    clearStoredConsent();
    expect(getStoredConsent()).toBeNull();
  });
});
