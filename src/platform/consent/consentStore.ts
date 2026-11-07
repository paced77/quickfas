import {
  CONSENT_STORAGE_KEY,
  createConsentRecord,
  consentFromRecord,
  parseConsentRecord,
  migrateConsentStorage,
  type AnalyticsConsent,
  type ConsentRecord,
} from './consentModel.ts';

type Listener = (consent: AnalyticsConsent) => void;
const listeners = new Set<Listener>();
let channel: BroadcastChannel | null = null;
let listening = false;

function readRecord(): ConsentRecord | null {
  try {
    return migrateConsentStorage(window.localStorage);
  } catch {
    return null;
  }
}

function notify(consent: AnalyticsConsent) {
  listeners.forEach((listener) => listener(consent));
}

function receiveRecord(record: ConsentRecord | null) {
  notify(consentFromRecord(record));
}

function startCrossTabSync() {
  if (listening || typeof window === 'undefined') return;
  listening = true;

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel('stratum-consent-v2');
      channel.addEventListener('message', (event: MessageEvent<unknown>) => {
        const record = parseConsentRecord(JSON.stringify(event.data));
        if (record) receiveRecord(record);
      });
    } catch {
      channel = null;
    }
  }

  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) {
      receiveRecord(parseConsentRecord(event.newValue));
    }
  });
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return 'unknown';
  return consentFromRecord(readRecord());
}

export function subscribeToConsent(listener: Listener): () => void {
  startCrossTabSync();
  listeners.add(listener);
  listener(getAnalyticsConsent());
  return () => listeners.delete(listener);
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, 'unknown'>): void {
  if (typeof window === 'undefined') return;
  const record = createConsentRecord(consent);
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // If storage is unavailable, do not persist a consent choice or enable tracking.
    notify('unknown');
    return;
  }
  startCrossTabSync();
  notify(consent);
  try {
    channel?.postMessage(record);
  } catch {
    // The storage event remains the cross-tab fallback.
  }
}
