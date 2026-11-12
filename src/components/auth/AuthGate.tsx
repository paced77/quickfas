import { ReactNode, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { configureAuthenticatedFetch, isSupabaseConfigured, supabase } from '../../lib/supabase.ts';

type AuthGateProps = { children: ReactNode };

const hasGoogleIdentity = (user: Session['user'] | null) =>
  user?.identities?.some((identity) => identity.provider === 'google') ?? false;

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profileRole, setProfileRole] = useState<string | null>(null);

  useEffect(() => {
    const authParams = new URLSearchParams(window.location.hash.slice(1));
    const authError = authParams.get('error_description') || authParams.get('error');
    if (authError) {
      setError('Google sign-in could not be completed. Please try again.');
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    configureAuthenticatedFetch();
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (active) {
        setSession(currentSession);
        setReady(true);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setProfileRole(null);
      return;
    }
    let active = true;
    setProfileRole('checking');
    void (async () => {
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        if (active) setProfileRole(profileError ? 'unavailable' : data?.role ?? 'missing');
      } catch {
        if (active) setProfileRole('unavailable');
      }
    })();
    return () => { active = false; };
  }, [session?.user.id]);

  const signInWithGoogle = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    setError('');
    try {
      // Do not silently link a pre-existing password session to Google; require a fresh Google sign-in.
      if (session && !hasGoogleIdentity(session.user)) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      }
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://quickfas-tawny.vercel.app/' },
      });
      if (authError) throw authError;
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Google sign-in is unavailable. Please try again.');
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error: authError } = await supabase.auth.signOut();
    if (authError) setError(authError.message);
  };

  if (!ready) {
    return <div className="min-h-screen bg-[#070b14] grid place-items-center text-cyan-200 font-mono text-xs">VERIFYING SECURE SESSION…</div>;
  }

  // Direct access is permitted only in local development. Production fails closed
  // when the public Supabase configuration is absent or incomplete.
  if (!isSupabaseConfigured || !supabase) {
    if (import.meta.env.DEV) return <>{children}</>;
    return (
      <main role="alert" className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6">
        <section className="max-w-md rounded-2xl border border-amber-300/20 bg-[#0f172a]/95 p-8">
          <h1 className="text-xl font-semibold">Secure sign-in is unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Authentication is not configured for this deployment. Access is blocked until the service configuration is restored.</p>
        </section>
      </main>
    );
  }

  if (!session || !hasGoogleIdentity(session.user)) {
    return (
      <main className="min-h-screen bg-[#070b14] bg-grid-pattern text-slate-100 flex items-center justify-center p-5">
        <section className="w-full max-w-md rounded-2xl border border-cyan-300/20 bg-[#0f172a]/95 p-8 shadow-[0_0_60px_rgba(34,211,238,0.10)]">
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.28em] text-cyan-300">STRATUM + PROJECT KINGDOM // SECURE ACCESS</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back.</h1>
            <p className="mt-2 text-sm text-slate-400">Continue securely with your Google account.</p>
          </div>
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">{error}</p>}
          <button type="button" onClick={() => void signInWithGoogle()} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60 cursor-pointer">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.05 13.22l7.98 6.19C11.93 13.72 17.48 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.02 46.98 31.8 46.98 24.55Z"/><path fill="#FBBC05" d="M10.03 28.59A14.4 14.4 0 0 1 9.25 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.57 10.78l7.46-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.18 2.3-6.52 0-12.07-4.22-14.03-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>
            {busy ? 'REDIRECTING TO GOOGLE…' : 'CONTINUE WITH GOOGLE'}
          </button>
          <p className="mt-6 text-center text-[10px] leading-5 text-slate-500">Protected by Supabase Auth. Access is verified server-side for every API request. New accounts receive read-only viewer access until an administrator changes their role.</p>
        </section>
      </main>
    );
  }

  return (
    <>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-cyan-300/20 bg-[#0f172a]/95 px-3 py-2 shadow-xl backdrop-blur">
        <span className="flex max-w-64 flex-col truncate text-[11px] text-slate-300"><span className="truncate">{session.user.email}</span><span className="font-mono text-[9px] uppercase tracking-wider text-cyan-300">Access: {profileRole ?? 'checking'}</span></span>
        <button type="button" onClick={signOut} className="rounded-md border border-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-cyan-200 hover:bg-cyan-300/10">SIGN OUT</button>
      </div>
    </>
  );
}
