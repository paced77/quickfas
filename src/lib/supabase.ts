import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!)
  : null;

let fetchConfigured = false;

export function configureAuthenticatedFetch() {
  if (fetchConfigured || typeof window === 'undefined' || !supabase) return;
  fetchConfigured = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const requestUrl = new URL(request.url);
    if (requestUrl.origin === window.location.origin && requestUrl.pathname.startsWith('/api/')) {
      const { data: { session } } = await supabase!.auth.getSession();
      if (session?.access_token) {
        request.headers.set('Authorization', `Bearer ${session.access_token}`);
      }
    }
    return originalFetch(request);
  };
}
