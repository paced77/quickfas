import { useEffect, useState } from 'react';
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeToConsent,
} from '../../platform/consent/consentStore.ts';
import type { AnalyticsConsent } from '../../platform/consent/consentModel.ts';

export function ConsentBanner() {
  const [consent, setConsent] = useState<AnalyticsConsent>(() => getAnalyticsConsent());

  useEffect(() => subscribeToConsent(setConsent), []);

  return (
    <section
      aria-label="Privacy and analytics preferences"
      className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-3xl rounded-xl border border-white/15 bg-[#0b1220]/95 p-4 shadow-2xl backdrop-blur"
    >
      {consent === 'unknown' ? (
        <>
          <h2 className="text-sm font-semibold text-white">Your privacy choices</h2>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Optional product analytics are off until you choose. Health details, form contents, account credentials,
            and personal information are never included in product analytics.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAnalyticsConsent('granted')}
              className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
            >
              Allow optional analytics
            </button>
            <button
              type="button"
              onClick={() => setAnalyticsConsent('denied')}
              className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              Decline
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-300" role="status">
            Optional analytics: <strong className="text-white">{consent}</strong>. You can change this choice at any time.
          </p>
          <button
            type="button"
            onClick={() => setAnalyticsConsent(consent === 'granted' ? 'denied' : 'granted')}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          >
            {consent === 'granted' ? 'Turn analytics off' : 'Allow optional analytics'}
          </button>
        </div>
      )}
    </section>
  );
}
