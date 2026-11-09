import { z } from 'zod';
import { getAnalyticsConsent } from '../consent/consentStore.ts';

export const AnalyticsEventNameSchema = z.enum([
  'page_view',
  'onboarding_started',
  'article_opened',
  'article_completed',
  'resource_saved',
  'share_clicked',
  'audio_started',
  'audio_retry_scheduled',
  'audio_retry_executed',
  'audio_completed',
  'audio_aborted',
  'audio_failed',
  'demo_requested',
]);

export type AnalyticsEventName = z.infer<typeof AnalyticsEventNameSchema>;
export const AnalyticsEventPayloadSchema = z.object({
  event: AnalyticsEventNameSchema,
}).strict();

let inFlight = 0;
const MAX_IN_FLIGHT = 3;

/**
 * Sends only an allow-listed event name. No route, topic title, query, account ID,
 * age band, health information, form data, or other event properties are sent.
 */
export async function trackAnalyticsEvent(event: AnalyticsEventName): Promise<void> {
  if (getAnalyticsConsent() !== 'granted' || inFlight >= MAX_IN_FLIGHT) return;
  const parsed = AnalyticsEventPayloadSchema.safeParse({ event });
  if (!parsed.success) return;

  inFlight += 1;
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      keepalive: true,
      body: JSON.stringify(parsed.data),
    });
  } catch {
    // Analytics is non-essential. Never block the learning or command experience.
  } finally {
    inFlight -= 1;
  }
}
