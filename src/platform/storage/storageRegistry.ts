import { CONSENT_STORAGE_KEY } from '../consent/consentModel.ts';

export type StorageCategory = 'privacy_preference' | 'learning_progress' | 'operational_state';

export interface StorageRegistryEntry {
  key: string;
  owner: string;
  category: StorageCategory;
  purpose: string;
  retention: string;
  valueSensitivity: 'sensitive_preference' | 'non_sensitive';
}

export const STORAGE_REGISTRY: readonly StorageRegistryEntry[] = [
  {
    key: CONSENT_STORAGE_KEY,
    owner: 'platform/privacy',
    category: 'privacy_preference',
    purpose: 'Stores the visitor analytics consent choice and schema version.',
    retention: 'Until changed by the visitor or browser storage is cleared.',
    valueSensitivity: 'sensitive_preference',
  },
  {
    key: 'analytics-consent',
    owner: 'platform/privacy',
    category: 'privacy_preference',
    purpose: 'Legacy consent choice eligible for one-time migration to the current versioned record.',
    retention: 'Removed only after a verified migration; otherwise retained for recovery.',
    valueSensitivity: 'sensitive_preference',
  },
  {
    key: 'consent:v2',
    owner: 'platform/privacy',
    category: 'privacy_preference',
    purpose: 'Legacy versioned consent record eligible for one-time migration.',
    retention: 'Removed only after a verified migration; otherwise retained for recovery.',
    valueSensitivity: 'sensitive_preference',
  },
  {
    key: 'consent:version',
    owner: 'platform/privacy',
    category: 'privacy_preference',
    purpose: 'Legacy consent schema marker; never used as a consent decision.',
    retention: 'Removed only after a verified consent migration; otherwise retained for recovery.',
    valueSensitivity: 'sensitive_preference',
  },
];

export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
}

export interface StorageAuditEntry {
  key: string;
  owner: string;
  category: string;
  purpose: string;
  retention: string;
  present: boolean;
  registered: boolean;
}

export interface StorageAuditReport {
  generatedAt: string;
  valueInspection: 'none';
  entries: StorageAuditEntry[];
}

export function buildStorageAudit(storage: StorageLike, generatedAt = new Date()): StorageAuditReport {
  const presentKeys = new Set<string>();
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) presentKeys.add(key);
  }

  const entries: StorageAuditEntry[] = STORAGE_REGISTRY.map((entry) => ({
    key: entry.key,
    owner: entry.owner,
    category: entry.category,
    purpose: entry.purpose,
    retention: entry.retention,
    present: presentKeys.has(entry.key),
    registered: true,
  }));

  for (const key of presentKeys) {
    if ((key.startsWith('stratum:') || key.startsWith('kingdom:'))
      && !STORAGE_REGISTRY.some((entry) => entry.key === key)) {
      entries.push({
        key,
        owner: 'unregistered',
        category: 'unknown',
        purpose: 'Namespaced key is not listed in the storage registry.',
        retention: 'Unknown; investigate before relying on or deleting it.',
        present: true,
        registered: false,
      });
    }
  }

  return {
    generatedAt: generatedAt.toISOString(),
    valueInspection: 'none',
    entries,
  };
}

function csvCell(value: string | boolean): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function storageAuditToCsv(report: StorageAuditReport): string {
  const columns: Array<keyof StorageAuditEntry> = [
    'key', 'owner', 'category', 'purpose', 'retention', 'present', 'registered',
  ];
  const header = columns.map(csvCell).join(',');
  const rows = report.entries.map((entry) => columns.map((column) => csvCell(entry[column] as string | boolean)).join(','));
  return [header, ...rows].join('\r\n') + '\r\n';
}
