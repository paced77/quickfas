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
