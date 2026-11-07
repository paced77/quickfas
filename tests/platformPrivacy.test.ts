import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSENT_SCHEMA_VERSION,
  createConsentRecord,
  parseConsentRecord,
  consentFromRecord,
  migrateConsentStorage,
} from '../src/platform/consent/consentModel.ts';
import { validateKingdomTelemetry } from '../src/schemas/events.ts';
import { buildStorageAudit, storageAuditToCsv } from '../src/platform/storage/storageRegistry.ts';
import { getSpeechRetryDelayMs } from '../src/platform/audio/retryPolicy.ts';
import {
  AnalyticsEventNameSchema,
  AnalyticsEventPayloadSchema,
} from '../src/platform/analytics/analyticsEvents.ts';

test('consent records are versioned and round-trip valid choices', () => {
  const record = createConsentRecord('granted', new Date('2026-11-07T12:00:00.000Z'));
  assert.equal(record.version, CONSENT_SCHEMA_VERSION);
  assert.deepEqual(parseConsentRecord(JSON.stringify(record)), record);
  assert.equal(consentFromRecord(record), 'granted');
});

test('unknown, malformed, and future consent records fail closed', () => {
  assert.equal(parseConsentRecord(null), null);
  assert.equal(parseConsentRecord('{not-json'), null);
  assert.equal(parseConsentRecord(JSON.stringify({ version: 999, analytics: 'granted', updatedAt: new Date().toISOString() })), null);
  assert.equal(parseConsentRecord(JSON.stringify({ version: 2, analytics: 'maybe', updatedAt: new Date().toISOString() })), null);
  assert.equal(consentFromRecord(null), 'unknown');
});

test('analytics accepts only the defined event names and rejects extra properties', () => {
  assert.equal(AnalyticsEventNameSchema.safeParse('article_opened').success, true);
  assert.equal(AnalyticsEventNameSchema.safeParse('patient_diagnosis_viewed').success, false);
  assert.equal(AnalyticsEventPayloadSchema.safeParse({ event: 'page_view' }).success, true);
  assert.equal(AnalyticsEventPayloadSchema.safeParse({ event: 'page_view', email: 'person@example.com' }).success, false);
});


test('telemetry rejects direct identifiers and obvious personal data', () => {
  const event = {
    eventId: 'evt-test',
    eventType: 'system.health',
    domain: 'infrastructure',
    severity: 'nominal',
    source: 'unit-test',
    correlationId: 'corr-test',
    timestamp: new Date('2026-11-07T12:00:00.000Z').toISOString(),
    metadata: { region: 'test-region', dataClassification: 'synthetic_demo' },
    payload: {
      status: 'optimal',
      uptimeSeconds: 60,
      latencyMs: 10,
      errorsPerMin: 0,
      cpuUtilization: 10,
      memoryUtilization: 20,
      availabilityPct: 99.9,
    },
  };
  assert.equal(validateKingdomTelemetry(event).success, true);
  assert.equal(validateKingdomTelemetry({ ...event, metadata: { region: 'test-region' } }).success, false);
  assert.equal(validateKingdomTelemetry({
    ...event,
    metadata: { dataClassification: 'synthetic_demo', patientName: 'Example Person' },
  }).success, false);
  assert.equal(validateKingdomTelemetry({
    ...event,
    metadata: { dataClassification: 'synthetic_demo', operatorContact: 'operator@example.com' },
  }).success, false);
});


test('storage audit reports registered keys without reading stored values', () => {
  const keys = ['stratum:consent:v2', 'stratum:unexpected'];
  const fakeStorage = {
    length: keys.length,
    key: (index: number) => keys[index] ?? null,
  };
  const report = buildStorageAudit(fakeStorage, new Date('2026-11-07T12:00:00.000Z'));
  assert.equal(report.valueInspection, 'none');
  assert.equal(report.entries.find((entry) => entry.key === 'stratum:consent:v2')?.present, true);
  assert.equal(report.entries.find((entry) => entry.key === 'stratum:unexpected')?.registered, false);
  assert.equal(JSON.stringify(report).includes('granted'), false);
});

test('storage audit CSV uses RFC4180 quote escaping', () => {
  const report = buildStorageAudit({ length: 0, key: () => null });
  const csv = storageAuditToCsv(report);
  assert.match(csv, /^"key","owner","category"/);
  assert.match(csv, /"Stores the visitor analytics consent choice and schema version\."/);
});


test('speech retry policy applies bounded exponential backoff with jitter', () => {
  assert.equal(getSpeechRetryDelayMs(0, 0), 250);
  assert.equal(getSpeechRetryDelayMs(1, 0.5), 550);
  assert.equal(getSpeechRetryDelayMs(99, 0.999), 2099);
  assert.equal(getSpeechRetryDelayMs(-4, 0), 250);
});


test('legacy consent migrates atomically and removes old keys only after verification', () => {
  const values = new Map<string, string>([
    ['analytics-consent', 'true'],
    ['consent:version', '1'],
  ]);
  const storage = {
    get length() { return values.size; },
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  const migrated = migrateConsentStorage(storage);
  assert.equal(migrated?.analytics, 'granted');
  assert.equal(migrated?.version, 2);
  assert.equal(values.has('analytics-consent'), false);
  assert.equal(values.has('consent:version'), false);
  assert.equal(values.has('stratum:consent:v2'), true);
});

test('future consent versions fail closed without overwriting or migrating legacy state', () => {
  const future = JSON.stringify({ version: 3, analytics: 'granted', updatedAt: new Date().toISOString() });
  const values = new Map<string, string>([
    ['stratum:consent:v2', future],
    ['analytics-consent', 'true'],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  assert.equal(migrateConsentStorage(storage), null);
  assert.equal(values.get('stratum:consent:v2'), future);
  assert.equal(values.get('analytics-consent'), 'true');

  const markerValues = new Map<string, string>([['analytics-consent', 'true'], ['consent:version', '3']]);
  const markerStorage = {
    getItem: (key: string) => markerValues.get(key) ?? null,
    setItem: (key: string, value: string) => { markerValues.set(key, value); },
    removeItem: (key: string) => { markerValues.delete(key); },
  };
  assert.equal(migrateConsentStorage(markerStorage), null);
  assert.equal(markerValues.get('analytics-consent'), 'true');
});

test('failed consent migration rolls back and preserves the legacy choice', () => {
  const values = new Map<string, string>([['analytics-consent', 'denied']]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (key === 'stratum:consent:v2') throw new Error('storage quota');
      values.set(key, value);
    },
    removeItem: (key: string) => { values.delete(key); },
  };
  assert.equal(migrateConsentStorage(storage), null);
  assert.equal(values.get('analytics-consent'), 'denied');
  assert.equal(values.has('stratum:consent:v2'), false);
});
