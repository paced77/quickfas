import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');

test('dashboard and AI fallback fixtures do not assert fabricated clinical facts', () => {
  const paths = [
    '../src/App.tsx',
    '../src/server/routes.ts',
    '../src/components/ExecutiveBriefing.tsx',
    '../src/components/dashboard/ChartsSection.tsx',
    '../src/components/CommandGrid.tsx',
    '../src/components/StrategicRadar.tsx',
    '../src/components/DigitalTwin.tsx',
    '../src/components/AgentCouncil.tsx',
    '../src/components/missions/MissionControl.tsx',
    '../src/components/TelemetryFeed.tsx',
    '../src/components/automations/AutomationEngine.tsx',
  ];
  const combined = paths.map(source).join('\n');
  const fabricatedClaims = /\bMayo\b|\bCharit[eé]\b|684\s*(?:\/|of)\s*720|28\.5\s*(?:patients|pts)|142\.8\s*FHIR|14\.8M\s*FHIR|\$14\.2M\s*MRR|Phase.?III|Zurich Biostorage|STUDY-ONC-904|STUDY-CARDIO-402|European Medicines Agency priority designation confirmed/i;
  assert.doesNotMatch(combined, fabricatedClaims);
  assert.match(source('../src/App.tsx'), /Illustrative workspace/);
  assert.match(source('../src/server/routes.ts'), /fictional demonstration response/i);
});

test('opt-in telemetry fixtures use generic synthetic workstream data', () => {
  const routes = source('../src/server/routes.ts');
  const feed = source('../src/components/TelemetryFeed.tsx');
  assert.match(routes, /KINGDOM_DEMO_TELEMETRY === 'true'/);
  assert.match(routes, /dataClassification: 'synthetic'/);
  assert.doesNotMatch(routes, /clinical\.enrollment|clinical\.fhir_tx|STUDY-ONC-904|STUDY-CARDIO-402/);
  assert.match(feed, /eventType: 'ops\.capacity_update'/);
  assert.match(feed, /dataClassification: 'synthetic_demo'/);
});

test('API router mounts Supabase authentication before protected route registration', () => {
  const routes = source('../src/server/routes.ts');
  const authMount = routes.indexOf('router.use(requireAuthenticatedUser)');
  const routerMount = routes.indexOf('app.use(router)');
  assert.ok(authMount >= 0 && routerMount > authMount, 'auth middleware must precede router mounting');

  const registrations = [...routes.matchAll(/^\s*router\.(?:get|post|put|patch|delete)\(([^\n]+)$/gm)];
  assert.ok(registrations.length > 0);
  for (const registration of registrations) {
    const route = registration[1];
    if (route.includes("'/health'") || route.includes("'/api/health'")) continue;
    assert.ok((registration.index ?? -1) > authMount, `route registered before auth middleware: ${route}`);
  }

  assert.match(routes, /authClient\.auth\.getUser\(token\)/);
  assert.match(routes, /\.from\('profiles'\)[\s\S]*?\.select\('role'\)/);
  assert.match(routes, /requireRole\('admin', 'executive'\), handleAnalyticsSummary/);
  assert.match(routes, /requireRole\('admin', 'operator'\), requireDistributedRateLimit\('telemetry-ingest'\), handleTelemetryInject/);
  const supabaseClient = source('../src/lib/supabase.ts');
  const viteConfig = source('../vite.config.ts');
  assert.match(supabaseClient, /VITE_SUPABASE_URL \|\| import\.meta\.env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(supabaseClient, /VITE_SUPABASE_PUBLISHABLE_KEY \|\| import\.meta\.env\.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(viteConfig, /envPrefix: \['VITE_', 'NEXT_PUBLIC_'\]/);
});

test('AI routes enforce role-specific capabilities and distributed rate limits', () => {
  const routes = source('../src/server/routes.ts');
  const authMount = routes.indexOf('router.use(requireAuthenticatedUser)');
  const expected = [
    ["router.post('/gemini/council-deliberation'", "requireRole('admin', 'executive', 'analyst')", "ai-council"],
    ["router.post('/gemini/executive-briefing'", "requireRole('admin', 'executive')", "ai-briefing"],
    ["router.post('/gemini/simulation'", "requireRole('admin', 'executive', 'analyst', 'operator')", "ai-simulation"],
    ["router.post('/gemini/voice-query'", "requireRole('admin', 'executive', 'analyst', 'operator')", "ai-voice"],
  ] as const;
  for (const [route, roleGuard, bucket] of expected) {
    const routeIndex = routes.indexOf(route);
    assert.ok(routeIndex > authMount, `${route} must remain behind authentication`);
    const registration = routes.slice(routeIndex, routes.indexOf(';', routeIndex));
    assert.ok(registration.includes(roleGuard), `${route} must enforce its capability matrix`);
    assert.ok(registration.includes(`requireDistributedRateLimit('${bucket}')`), `${route} must use a distributed per-user limit`);
  }
  assert.match(routes, /CouncilRequestSchema\.safeParse\(req\.body\)/);
  assert.match(routes, /BriefingRequestSchema\.safeParse\(req\.body\)/);
  assert.match(routes, /SimulationRequestSchema\.safeParse\(req\.body\)/);
  assert.match(routes, /VoiceRequestSchema\.safeParse\(req\.body\)/);
  assert.match(routes, /authClient\.rpc\('consume_quickfas_api_rate_limit'/);
});

test('authentication UI distinguishes guest preview from least-privileged accounts', () => {
  const gate = source('../src/components/auth/AuthGate.tsx');
  assert.match(gate, /GUEST PREVIEW · PROTECTED ACTIONS DISABLED/);
  assert.match(gate, /Guest Preview/);
  assert.match(gate, /read-only viewer access/i);
  assert.match(gate, /Access: \{profileRole/);
  assert.match(gate, /profileError \? 'unavailable' : data\?\.role \?\? 'missing'/);
});

test('rate-limit migration keeps counters private and non-bypassable by callers', () => {
  const migration = source('../supabase/migrations/20261107194735_quickfas_rate_limits_invoker_hardening.sql');
  assert.match(migration, /security invoker/i);
  assert.match(migration, /private\.enforce_quickfas_api_rate_limit_counter/);
  assert.match(migration, /request_count := old\.request_count \+ 1/i);
  assert.match(migration, /with check \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /revoke delete, truncate, references, trigger/i);
  assert.doesNotMatch(migration, /security definer/i);
});
