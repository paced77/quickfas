import { ReactNode, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase.ts';

type AuthGateProps = { children: ReactNode };

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [guestPreview, setGuestPreview] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (active) {
        setSession(currentSession);
        setReady(true);
      }
    }).catch(() => {
      if (active) {
        setError('Unable to verify your session. Please try again.');
        setReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
      setError('');
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
    if (!supabase) return;
    setBusy(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://quickfas-tawny.vercel.app/' },
      });
      if (authError) throw authError;
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to start Google sign-in. Please try again.');
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

  if (guestPreview) {
    return (
      <>
        {children}
        <div className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-amber-400/30 bg-[#0f172a]/95 px-3 py-2 shadow-xl backdrop-blur">
          <span className="text-amber-300">GUEST PREVIEW · PROTECTED ACTIONS DISABLED</span>
          <button
            type="button"
            onClick={() => setGuestPreview(false)}
            className="rounded border border-white/10 px-2 py-1 text-[10px] text-cyan-200 hover:bg-cyan-300/10"
          >
            AUTH PANEL
          </button>
        </div>
      </>
    );
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="min-h-screen bg-[#070b14] bg-grid-pattern text-slate-100 flex items-center justify-center p-6">
        <section className="w-full max-w-xl rounded-2xl border border-cyan-300/30 bg-[#0f172a]/95 p-8 shadow-[0_0_60px_rgba(34,211,238,0.12)]">
          <p className="font-mono text-xs tracking-[0.25em] text-cyan-300">STRATUM CLINICAL EDGE + PROJECT KINGDOM</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Project Kingdom is Online</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Explore the unified platform in Guest Preview Mode. Configure Supabase to enable secure Google sign-in and protected access.
          </p>
          <button
            type="button"
            onClick={() => setGuestPreview(true)}
            className="glow-btn-primary mt-6 w-full rounded-lg py-3 px-4 text-sm font-bold"
          >
            LAUNCH PROJECT KINGDOM →
          </button>
          <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
            To enable authentication, configure <code className="text-cyan-300">VITE_SUPABASE_URL</code> and <code className="text-cyan-300">VITE_SUPABASE_PUBLISHABLE_KEY</code>.
          </p>
        </section>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#070b14] bg-grid-pattern text-slate-100 flex items-center justify-center p-5">
        <section className="w-full max-w-md rounded-2xl border border-cyan-300/20 bg-[#0f172a]/95 p-8 shadow-[0_0_60px_rgba(34,211,238,0.10)]">
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.28em] text-cyan-300">STRATUM + PROJECT KINGDOM // SECURE ACCESS</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back.</h1>
            <p className="mt-2 text-sm text-slate-400">Sign in securely with your Google account to access the unified platform.</p>
          </div>
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">{error}</p>}
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={busy}
            className="glow-btn-primary w-full rounded-lg py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? 'CONNECTING…' : 'CONTINUE WITH GOOGLE'}
          </button>
          <button
            type="button"
            onClick={() => setGuestPreview(true)}
            className="mt-4 w-full text-xs text-cyan-300/80 hover:text-cyan-200 underline font-mono tracking-wide"
          >
            Or enter as Guest Preview →
          </button>
          <p className="mt-6 text-center text-[10px] leading-5 text-slate-500">Protected by Supabase Auth. Access is verified server-side for every API request. New accounts receive read-only viewer access.</p>
        </section>
      </main>
    );
  }

  return (
    <>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-cyan-300/20 bg-[#0f172a]/95 px-3 py-2 shadow-xl backdrop-blur">
        <span className="flex max-w-64 flex-col truncate text-[11px] text-slate-300">
          <span className="truncate">{session.user.email}</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-300">Access: {profileRole === 'checking' ? 'checking' : profileRole === 'unavailable' ? 'unavailable' : profileRole ?? 'missing'}</span>
        </span>
        <button type="button" onClick={signOut} className="rounded-md border border-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-cyan-200 hover:bg-cyan-300/10">SIGN OUT</button>
      </div>
    </>
  );
}
