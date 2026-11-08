import React, { useCallback, useEffect, useState } from 'react';
import { Activity, GitFork, GitCommit, CircleDot, Users, RefreshCw, ExternalLink, Network, AlertCircle } from 'lucide-react';

type GithubRepo = {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  updated_at: string;
  language: string | null;
  private: boolean;
};
type GithubCommit = { sha: string; html_url: string; commit: { message: string; author: { name: string; date: string } | null }; author: { login: string } | null };
type GithubContributor = { login: string; contributions: number; html_url: string; avatar_url: string };
type GithubFork = { full_name: string; html_url: string; stargazers_count: number; owner: { login: string } };
type GithubIssue = { number: number; title: string; html_url: string; created_at: string; user: { login: string } | null; pull_request?: { url: string } };

const API = 'https://api.github.com';
const DEFAULT_REPOSITORY = 'paced77/quickfas';

function repositoryName(value: string): string {
  const trimmed = value.trim().replace(/\.git$/i, '');
  const url = trimmed.match(/^https?:\/\/(?:www\.)?github\.com\/(.+)$/i);
  const candidate = (url ? url[1] : trimmed).replace(/^\/+|\/+$/g, '');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(candidate)) {
    throw new Error('Enter a public GitHub repository as owner/repository or a github.com URL.');
  }
  return candidate;
}

async function githubGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if (response.status === 404) throw new Error('Repository not found, or it is private. This first release reads public GitHub repositories only.');
  if (response.status === 403) throw new Error('GitHub rejected this public API request, often because its rate limit was reached. Wait a little and refresh.');
  if (!response.ok) throw new Error(`GitHub returned ${response.status}. Please try again.`);
  return response.json() as Promise<T>;
}

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string | number; detail: string }) {
  return <div className="rounded-xl border border-cyan-300/15 bg-slate-900/70 p-4">
    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-400"><span aria-hidden="true">{icon}</span>{label}</div>
    <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">{value}</div>
    <div className="mt-1 text-[11px] text-slate-500">{detail}</div>
  </div>;
}

export const QuickfasNexus: React.FC = () => {
  const [input, setInput] = useState(DEFAULT_REPOSITORY);
  const [repo, setRepo] = useState<GithubRepo | null>(null);
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [contributors, setContributors] = useState<GithubContributor[]>([]);
  const [forks, setForks] = useState<GithubFork[]>([]);
  const [openIssues, setOpenIssues] = useState<GithubIssue[]>([]);
  const [openPullRequests, setOpenPullRequests] = useState<GithubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async (value: string) => {
    let name: string;
    try { name = repositoryName(value); } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Invalid repository.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const encoded = name.split('/').map(encodeURIComponent).join('/');
      const [repository, recentCommits, recentContributors, recentForks, openItems] = await Promise.all([
        githubGet<GithubRepo>(`/repos/${encoded}`),
        githubGet<GithubCommit[]>(`/repos/${encoded}/commits?per_page=30`),
        githubGet<GithubContributor[]>(`/repos/${encoded}/contributors?per_page=100`),
        githubGet<GithubFork[]>(`/repos/${encoded}/forks?per_page=8&sort=newest`),
        githubGet<GithubIssue[]>(`/repos/${encoded}/issues?state=open&per_page=100`),
      ]);
      setRepo(repository);
      setCommits(recentCommits);
      setContributors(recentContributors);
      setForks(recentForks);
      setOpenIssues(openItems.filter((item) => !item.pull_request));
      setOpenPullRequests(openItems.filter((item) => Boolean(item.pull_request)));
      setInput(repository.full_name);
      setLastUpdated(new Date());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load this repository.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(DEFAULT_REPOSITORY); }, [refresh]);
  useEffect(() => {
    const interval = window.setInterval(() => { void refresh(repo?.full_name || DEFAULT_REPOSITORY); }, 6 * 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [refresh, repo?.full_name]);

  const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return <section className="space-y-6" aria-labelledby="nexus-title">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300"><Network className="h-4 w-4" /> Project intelligence network</div>
        <h1 id="nexus-title" className="text-2xl font-semibold tracking-tight text-white">Quickfas Nexus</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">Explore public project activity, contributor signals, and repository fork relationships inside Quickfas.</p>
      </div>
      <form className="flex w-full gap-2 md:max-w-md" onSubmit={(event) => { event.preventDefault(); void refresh(input); }}>
        <label className="sr-only" htmlFor="nexus-repository">GitHub repository</label>
        <input id="nexus-repository" value={input} onChange={(event) => setInput(event.target.value)} name="repository" autoComplete="off" placeholder="owner/repository (e.g., vercel/next.js)…" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-cyan-300" />
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"><RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
      </form>
    </div>

    <div className="rounded-xl border border-amber-300/20 bg-amber-950/20 px-4 py-3 text-xs leading-5 text-amber-100/90">
      <strong>Source and privacy:</strong> This first connector reads public GitHub API data only. It does not require GitLab, request a personal access token, or send credentials from the browser. Private repositories and authenticated write actions are not enabled.
    </div>

    {error && <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-950/30 p-3 text-sm text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
    {loading && !repo && <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-400">Connecting to the public GitHub API…</div>}

    {repo && <>
      <div className="flex flex-col gap-2 rounded-xl border border-cyan-300/20 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <a href={repo.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-cyan-200 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">{repo.full_name}<ExternalLink aria-hidden="true" className="h-3.5 w-3.5" /></a>
          <p className="mt-1 text-sm text-slate-400">{repo.description || 'No repository description provided.'}</p>
        </div>
        <div className="shrink-0 text-[11px] text-slate-500">{repo.language || 'Language not specified'} · default branch: {repo.default_branch}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard icon={<GitCommit className="h-3.5 w-3.5" />} label="Recent commits" value={commits.length} detail="Latest commit records loaded (max 30)" />
        <StatCard icon={<CircleDot className="h-3.5 w-3.5" />} label="Open issues" value={openIssues.length} detail="First 100 open items returned" />
        <StatCard icon={<Activity className="h-3.5 w-3.5" />} label="Open pull requests" value={openPullRequests.length} detail="First 100 open items returned" />
        <StatCard icon={<Users className="h-3.5 w-3.5" />} label="Contributors" value={contributors.length} detail="Contributor profiles returned (max 100)" />
        <StatCard icon={<GitFork className="h-3.5 w-3.5" />} label="Forks" value={repo.forks_count} detail="Total public fork count reported by GitHub" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100"><Activity className="h-4 w-4 text-cyan-300" /> Commit activity snapshot</h2><span className="text-[10px] text-slate-500">Latest 30 records</span></div>
        {(() => {
          const days = Array.from({ length: 14 }, (_, index) => {
            const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (13 - index));
            const count = commits.filter((commit) => {
              const timestamp = commit.commit.author?.date;
              if (!timestamp) return false;
              const commitDate = new Date(timestamp); commitDate.setHours(0, 0, 0, 0);
              return commitDate.getTime() === date.getTime();
            }).length;
            return { label: date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" }), count };
          });
          const max = Math.max(1, ...days.map((day) => day.count));
          return <div className="flex h-32 items-end gap-1" role="img" aria-label="Commit counts per day across the last fourteen days, based on the latest thirty commit records">
            {days.map((day) => <div key={day.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${day.label}: ${day.count} commits`}>
              <span className="text-[9px] text-slate-400">{day.count || ""}</span>
              <div className="w-full rounded-t bg-cyan-400/80" style={{ height: `${Math.max(day.count ? 8 : 2, (day.count / max) * 76)}px` }} />
              <span className="text-[8px] text-slate-500">{day.label}</span>
            </div>)}
          </div>;
        })()}
        <p className="mt-2 text-[11px] text-slate-500">Limited snapshot of the latest fetched commits, not a complete contribution history.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100"><Network aria-hidden="true" className="h-4 w-4 text-cyan-300" /> Fork relationship map</h2><span className="text-[10px] text-slate-500">Latest 8 forks</span></div>
          <svg viewBox="0 0 560 300" role="img" aria-label={`Network showing ${repo.full_name} and ${forks.length} recently created public forks`} className="h-auto w-full">
            {forks.map((fork, index) => {
              const angle = (index / Math.max(forks.length, 1)) * Math.PI * 2 - Math.PI / 2;
              const x = 280 + Math.cos(angle) * 190;
              const y = 150 + Math.sin(angle) * 105;
              return <g key={fork.full_name}><line x1="280" y1="150" x2={x} y2={y} stroke="#22d3ee" strokeOpacity=".35" strokeWidth="1.5" /><circle cx={x} cy={y} r="5" fill="#67e8f9" /><text x={x} y={y + (y < 150 ? -11 : 17)} textAnchor="middle" fill="#cbd5e1" fontSize="10">{fork.owner.login.slice(0, 18)}</text></g>;
            })}
            <circle cx="280" cy="150" r="34" fill="#164e63" stroke="#67e8f9" strokeWidth="2" />
            <text x="280" y="146" textAnchor="middle" fill="#ecfeff" fontSize="10" fontWeight="bold">SOURCE</text>
            <text x="280" y="160" textAnchor="middle" fill="#a5f3fc" fontSize="9">{repo.full_name.split('/')[1].slice(0, 13)}</text>
            {forks.length === 0 && <text x="280" y="225" textAnchor="middle" fill="#94a3b8" fontSize="12">No public forks returned for this repository.</text>}
          </svg>
          <p className="text-[11px] text-slate-500">Each edge represents a fork relationship reported by GitHub. This is a live snapshot, not a complete historical network.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100"><Users aria-hidden="true" className="h-4 w-4 text-cyan-300" /> Leading contributors</h2>
          <div className="space-y-3">
            {contributors.slice(0, 7).map((person) => <a key={person.login} href={person.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
              <span className="flex min-w-0 items-center gap-2"><img src={person.avatar_url} alt="" width={28} height={28} loading="lazy" className="h-7 w-7 rounded-full" /><span className="truncate text-sm text-slate-200">{person.login}</span></span>
              <span className="shrink-0 text-xs tabular-nums text-cyan-200">{person.contributions.toLocaleString()} contributions</span>
            </a>)}
            {contributors.length === 0 && <p className="text-sm text-slate-500">No contributor data returned.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100"><Activity aria-hidden="true" className="h-4 w-4 text-cyan-300" /> Recent project activity</h2><span className="text-[10px] text-slate-500">Most recent 30 commits</span></div>
        <div className="divide-y divide-slate-800">
          {commits.slice(0, 8).map((commit) => <div key={commit.sha} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <a href={commit.html_url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-sm text-slate-200 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">{commit.commit.message.split('\n')[0]}</a>
            <span className="shrink-0 text-[11px] text-slate-500">{commit.author?.login || commit.commit.author?.name || 'Unknown'} · {commit.commit.author?.date ? formatDate(commit.commit.author.date) : 'Date unavailable'}</span>
          </div>)}
          {commits.length === 0 && <p className="py-3 text-sm text-slate-500">No recent commits returned.</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>Repository last updated {formatDate(repo.updated_at)} · Public data from api.github.com</span>
        <span>{lastUpdated ? `Snapshot refreshed ${lastUpdated.toLocaleTimeString()} · auto-refresh every 6 hours while open` : 'Loading snapshot time…'}</span>
      </div>
    </>}
  </section>;
};
