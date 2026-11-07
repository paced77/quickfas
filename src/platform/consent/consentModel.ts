export const CONSENT_SCHEMA_VERSION = 2 as const;
export const CONSENT_STORAGE_KEY = 'stratum:consent:v2';

export type AnalyticsConsent = 'unknown' | 'granted' | 'denied';

export interface ConsentRecord {
  version: typeof CONSENT_SCHEMA_VERSION;
  analytics: Exclude<AnalyticsConsent, 'unknown'>;
  updatedAt: string;
}

export function parseConsentRecord(value: string | null): ConsentRecord | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as Record<string, unknown>;
    if (record.version !== CONSENT_SCHEMA_VERSION) return null;
    if (record.analytics !== 'granted' && record.analytics !== 'denied') return null;
    if (typeof record.updatedAt !== 'string' || Number.isNaN(Date.parse(record.updatedAt))) return null;
    return {
      version: CONSENT_SCHEMA_VERSION,
      analytics: record.analytics,
      updatedAt: record.updatedAt,
    };
  } catch {
    return null;
  }
}

export function createConsentRecord(analytics: Exclude<AnalyticsConsent, 'unknown'>, now = new Date()): ConsentRecord {
  return {
    version: CONSENT_SCHEMA_VERSION,
    analytics,
    updatedAt: now.toISOString(),
  };
}

export function consentFromRecord(record: ConsentRecord | null): AnalyticsConsent {
  return record?.analytics ?? 'unknown';
}


export const LEGACY_CONSENT_KEYS = ['consent:v2', 'analytics-consent', 'consent:version'] as const;

export interface ConsentStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function parseLegacyConsentRecord(value: string | null): ConsentRecord | null {
  if (value === 'true' || value === 'granted') return createConsentRecord('granted');
  if (value === 'false' || value === 'denied') return createConsentRecord('denied');
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as Record<string, unknown>;
    if (typeof record.version === 'number'
      && record.version !== 1
      && record.version !== CONSENT_SCHEMA_VERSION) return null;
    const choice = record.analytics ?? record.analyticsConsent;
    if (choice === true || choice === 'granted') return createConsentRecord('granted');
    if (choice === false || choice === 'denied') return createConsentRecord('denied');
    return null;
  } catch {
    return null;
  }
}

/**
 * One-time v1/legacy migration. The destination is written and verified before
 * legacy keys are removed. If any operation fails, the prior values are restored.
 * A present but malformed/future destination fails closed and is never overwritten.
 */
export function migrateConsentStorage(storage: ConsentStorageLike): ConsentRecord | null {
  const currentValue = storage.getItem(CONSENT_STORAGE_KEY);
  if (currentValue !== null) return parseConsentRecord(currentValue);

  const versionMarker = storage.getItem('consent:version');
  if (versionMarker && Number.isFinite(Number(versionMarker)) && Number(versionMarker) > CONSENT_SCHEMA_VERSION) {
    return null;
  }

  let legacyRecord: ConsentRecord | null = null;
  const legacySnapshot = new Map<string, string>();
  for (const key of LEGACY_CONSENT_KEYS) {
    const value = storage.getItem(key);
    if (value !== null) legacySnapshot.set(key, value);
    if (!legacyRecord) legacyRecord = parseLegacyConsentRecord(value);
  }
  if (!legacyRecord) return null;

  try {
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(legacyRecord));
    const verified = parseConsentRecord(storage.getItem(CONSENT_STORAGE_KEY));
    if (!verified) throw new Error('Consent migration verification failed');
    for (const key of LEGACY_CONSENT_KEYS) {
      if (legacySnapshot.has(key)) storage.removeItem(key);
    }
    return verified;
  } catch {
    try {
      if (currentValue === null) storage.removeItem(CONSENT_STORAGE_KEY);
      for (const [key, value] of legacySnapshot) storage.setItem(key, value);
    } catch {
      // Preserve fail-closed behavior if browser storage is partially unavailable.
    }
    return null;
  }
}
