import { useMemo, useState } from 'react';
import { Download, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  buildStorageAudit,
  storageAuditToCsv,
  type StorageAuditReport,
} from '../../platform/storage/storageRegistry.ts';

function readAudit(): StorageAuditReport | null {
  try {
    return buildStorageAudit(window.localStorage);
  } catch {
    return null;
  }
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StorageAuditPanel() {
  const [revision, setRevision] = useState(0);
  const report = useMemo(() => readAudit(), [revision]);

  const exportJson = () => {
    if (!report) return;
    downloadFile('stratum-storage-audit.json', JSON.stringify(report, null, 2), 'application/json');
  };

  const exportCsv = () => {
    if (!report) return;
    downloadFile('stratum-storage-audit.csv', storageAuditToCsv(report), 'text/csv;charset=utf-8');
  };

  return (
    <section aria-labelledby="storage-audit-title" className="glass-panel rounded-xl p-5 mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <h2 id="storage-audit-title" className="text-sm font-bold text-white">Privacy storage audit</h2>
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
            Review registered browser-storage keys and detect unregistered Stratum or Kingdom keys.
            This audit reads key names only; it never reads or exports stored values.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRevision((value) => value + 1)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh audit
        </button>
      </div>

      {!report ? (
        <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-950/20 p-3 text-xs text-amber-100" role="status">
          Browser storage is unavailable in this context. No values were accessed.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-300" role="status">
              {report.entries.length} registry entries · {report.entries.filter((entry) => entry.present).length} keys present · values inspected: no
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportJson} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/25 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-300/10">
                <Download className="h-3.5 w-3.5" /> Export JSON
              </button>
              <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/25 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-300/10">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Key</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Present</th>
                  <th className="py-2">Registry</th>
                </tr>
              </thead>
              <tbody>
                {report.entries.map((entry) => (
                  <tr key={entry.key} className="border-t border-white/10 text-slate-300">
                    <td className="py-2 pr-3 font-mono">{entry.key}</td>
                    <td className="py-2 pr-3">{entry.owner}</td>
                    <td className="py-2 pr-3">{entry.category}</td>
                    <td className="py-2 pr-3">{entry.present ? 'Yes' : 'No'}</td>
                    <td className="py-2">{entry.registered ? 'Registered' : 'Unregistered'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] text-slate-500">Audit generated: {new Date(report.generatedAt).toLocaleString()}</p>
        </>
      )}
    </section>
  );
}
