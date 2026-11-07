import { FormEvent, ReactNode, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase.ts';

type AuthGateProps = { children: ReactNode };

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (!data.session) {
          setNotice('Check your email to confirm your account, then return here to sign in.');
        } else {
          setNotice('Account created. Your secure workspace is ready.');
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error: authError } = await supabase.auth.signOut();
    if (authError) setError(authError.message);
  };

  const [guestPreview, setGuestPreview] = useState(false);

  if (!ready) {
    return <div className="min-h-screen bg-[#070b14] grid place-items-center text-cyan-200 font-mono text-xs">VERIFYING SECURE SESSION…</div>;
  }

  if (guestPreview) {
    return (
      <>
        {children}
        <div className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-amber-400/30 bg-[#0f172a]/95 px-3 py-2 shadow-xl backdrop-blur font-mono text-[11px]">
          <span className="text-amber-300">GUEST PREVIEW MODE</span>
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
          <p className="font-mono text-xs tracking-[0.25em] text-cyan-300">PROJECT KINGDOM // COMMAND BRIDGE</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Project Kingdom is Online</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Welcome to the Sovereign Command Center. You can enter the live interactive dashboard now in Guest Preview Mode, or configure Supabase for persistent role-based access.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setGuestPreview(true)}
              className="glow-btn-primary flex-1 rounded-lg py-3 px-4 text-sm font-bold text-center cursor-pointer shadow-lg"
            >
              LAUNCH PROJECT KINGDOM →
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400 space-y-2">
            <p className="font-mono text-amber-300">OPTIONAL: PERSISTENT SUPABASE AUTH</p>
            <p>
              To enable user registration and database roles, add <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> in Vercel Project Settings &gt; Environment Variables.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#070b14] bg-grid-pattern text-slate-100 flex items-center justify-center p-5">
        <section className="w-full max-w-md rounded-2xl border border-cyan-300/20 bg-[#0f172a]/95 p-8 shadow-[0_0_60px_rgba(34,211,238,0.10)]">
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.28em] text-cyan-300">PROJECT KINGDOM // SECURE ACCESS</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back.</h1>
            <p className="mt-2 text-sm text-slate-400">Authenticate to enter the Sovereign Command Center.</p>
          </div>
          <div className="mb-6 grid grid-cols-2 rounded-lg border border-white/10 bg-black/20 p-1">
            <button type="button" onClick={() => { setMode('signin'); setError(''); setNotice(''); }} className={`rounded-md py-2 text-sm ${mode === 'signin' ? 'bg-cyan-300 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'}`}>Sign in</button>
            <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice(''); }} className={`rounded-md py-2 text-sm ${mode === 'signup' ? 'bg-cyan-300 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'}`}>Create account</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-xs font-medium text-slate-300">Email address
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#080e1b] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="you@company.com" />
            </label>
            <label className="block text-xs font-medium text-slate-300">Password
              <input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#080e1b] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="At least 8 characters" />
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">{error}</p>}
            {notice && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-200">{notice}</p>}
            <button type="submit" disabled={busy} className="glow-btn-primary w-full rounded-lg py-3 text-sm disabled:cursor-wait disabled:opacity-60">{busy ? 'SECURING SESSION…' : mode === 'signin' ? 'ENTER COMMAND CENTER' : 'CREATE SECURE ACCOUNT'}</button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setGuestPreview(true)}
              className="text-xs text-cyan-300/80 hover:text-cyan-200 underline font-mono tracking-wide"
            >
              Or enter as Guest Operator →
            </button>
          </div>

          <p className="mt-6 text-center text-[10px] leading-5 text-slate-500">Protected by Supabase Auth. Access is verified server-side for every API request.</p>
        </section>
      </main>
    );
  }

  return (
    <>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-cyan-300/20 bg-[#0f172a]/95 px-3 py-2 shadow-xl backdrop-blur">
        <span className="max-w-48 truncate text-[11px] text-slate-300">{session.user.email}</span>
        <button type="button" onClick={signOut} className="rounded-md border border-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-cyan-200 hover:bg-cyan-300/10">SIGN OUT</button>
      </div>
    </>
  );
}
