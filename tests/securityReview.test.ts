import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CouncilRequestSchema, BriefingRequestSchema, SimulationRequestSchema, VoiceRequestSchema } from '../src/server/requestSchemas.ts';
import { DomainSchema, validateKingdomTelemetry } from '../src/schemas/events.ts';

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
  const fabricatedClaims = /\bMayo\b|\bCharit[eé]\b|684\s*(?:\/|of)\s*720|28\.5\s*(?:patients|pts)|142\.8\s*FHIR|14\.8M\s*FHIR|\$14\.2M\s*MRR|Phase.?III|Zurich Biostorage|STUDY-ONC-904|STUDY-CARDIO-402|European Medicines Agency priority designation confirmed|\$850k transferred|140 consecutive samples|Full compliance readiness for Title 21|Automated penetration probing frequency reduced latency|34 Autonomous Agents Synchronized|All Sectors Synchronized|100% Invariant Telemetry Interconnect/i;
  assert.doesNotMatch(combined, fabricatedClaims);
  assert.match(source('../src/App.tsx'), /Illustrative workspace/);
  assert.match(source('../src/components/strategy/InvestorPortal.tsx'), /Illustrative planning model only/);
  assert.match(source('../src/components/missions/MissionControl.tsx'), /Sample mission board only/);
  assert.match(source('../src/components/CommandGrid.tsx'), /Illustrative values only/);
  assert.match(source('../src/components/DigitalTwin.tsx'), /Illustrative topology and sample metrics only/);
  assert.match(source('../src/server/routes.ts'), /fictional demonstration response/i);
});

test('clinical and FHIR telemetry ingestion is rejected', () => {
  assert.equal(DomainSchema.safeParse('clinical').success, false);
  const clinicalEvent = {
    eventId: 'sample-clinical-event',
    timestamp: new Date().toISOString(),
    source: 'synthetic-test',
    correlationId: 'sample-correlation',
    domain: 'clinical',
    severity: 'info',
    eventType: 'clinical.fhir_tx',
    metadata: { dataClassification: 'synthetic_demo' },
    payload: {
      studyId: 'sample-study',
      studyName: 'Synthetic study',
      siteId: 'sample-site',
      currentEnrollment: 0,
      targetEnrollment: 1,
      velocityPpm: 0,
      healthPct: 0,
      fhirTransactionsPerSec: 0,
    },
  };
  assert.equal(validateKingdomTelemetry(clinicalEvent).success, false);
});

test('opt-in telemetry fixtures use generic synthetic workstream data', () => {
  const routes = source('../src/server/routes.ts');
  const feed = source('../src/components/TelemetryFeed.tsx');
  assert.match(routes, /KINGDOM_DEMO_TELEMETRY === 'true'/);
  assert.match(routes, /if \(demoTelemetryEnabled\) \{[\s\S]*?dataClassification: 'synthetic_demo'/);
  assert.doesNotMatch(routes, /dataClassification: 'operational'|environment: 'production-edge'/);
  assert.doesNotMatch(routes, /clinical\.enrollment|clinical\.fhir_tx|STUDY-ONC-904|STUDY-CARDIO-402/);
  assert.match(feed, /eventType: 'ops\.capacity_update'/);
  assert.match(feed, /dataClassification: 'synthetic_demo'/);
});

test('API router mounts Supabase authentication before protected route registration', () => {
  const routes = source('../src/server/routes.ts');
  const authMount = routes.indexOf('router.use(apiAuthGuard)');
  const routerMount = routes.indexOf('app.use(router)');
  assert.ok(authMount >= 0 && routerMount > authMount, 'API auth guard must precede router mounting');
  assert.match(routes, /return requireAuthenticatedUser\(req, res, next\)/);
  assert.match(routes, /if \(process\.env\.NODE_ENV === 'production' \|\| process\.env\.VERCEL\) \{[\s\S]*?res\.status\(503\)/);
  assert.match(routes, /Guest operator access is limited to local, non-production development/);
  assert.match(routes, /res\.setHeader\('X-Frame-Options', 'DENY'\)/);

  const registrations = [...routes.matchAll(/^\s*router\.(?:get|post|put|patch|delete)\(([^\n]+)$/gm)];
  assert.ok(registrations.length > 0);
  for (const registration of registrations) {
    const route = registration[1];
    if (route.includes("'/health'") || route.includes("'/api/health'")) continue;
    assert.ok((registration.index ?? -1) > authMount, `route registered before auth middleware: ${route}`);
  }

  assert.match(routes, /authClient\.auth\.getUser\(token\)/);
  assert.doesNotMatch(routes, /684 active cohort participants|\$14\.2M ARR|Current \$2\.85M cash position|16 autonomous edge appliances|satisfy all 21 CFR Part 11 requirements|over 650 active cohort participants|99\.4% aggregate health|34\.2% mean downregulation|38\.5 months runway/);
  assert.match(routes, /No verified project metrics or live operational status are available/);
  assert.match(routes, /No simulation has been run/);
  assert.match(routes, /\.from\('profiles'\)[\s\S]*?\.select\('role'\)/);
  assert.match(routes, /requireRole\('admin', 'executive'\), handleAnalyticsSummary/);
  assert.match(routes, /requireRole\('admin', 'operator'\), requireDistributedRateLimit\('telemetry-ingest'\), handleTelemetryInject/);
  assert.match(routes, /router\.post\('\/analytics\/event', requireDistributedRateLimit\('analytics-event'\), handleAnalyticsEvent/);
  assert.doesNotMatch(routes, /app\.post\('\/api\/analytics\/event'/);
  const supabaseClient = source('../src/lib/supabase.ts');
  const viteConfig = source('../vite.config.ts');
  assert.match(supabaseClient, /VITE_SUPABASE_URL \|\| import\.meta\.env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(supabaseClient, /VITE_SUPABASE_PUBLISHABLE_KEY \|\| import\.meta\.env\.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(viteConfig, /envPrefix: \['VITE_', 'NEXT_PUBLIC_'\]/);
});

test('AI routes enforce role-specific capabilities and distributed rate limits', () => {
  const routes = source('../src/server/routes.ts');
  const authMount = routes.indexOf('router.use(apiAuthGuard)');
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

test('authentication UI uses Google OAuth only and keeps protected access controls', () => {
  const gate = source('../src/components/auth/AuthGate.tsx');
  assert.match(gate, /signInWithOAuth/);
  assert.match(gate, /provider: 'google'/);
  assert.match(gate, /redirectTo: 'https:\/\/quickfas-tawny\.vercel\.app\/'/);
  assert.match(gate, /CONTINUE WITH GOOGLE/);
  assert.doesNotMatch(gate, /signInWithPassword|\.auth\.signUp|type="password"|Create account|Password/);
  assert.doesNotMatch(gate, /guestPreview|GUEST PREVIEW/i);
  assert.match(gate, /read-only viewer access/i);
  assert.match(gate, /if \(import\.meta\.env\.DEV\) return <>\{children\}<\/>;/);
  assert.match(gate, /Authentication is not configured for this deployment/);
  assert.match(gate, /Access: \{profileRole/);
  assert.match(gate, /profileError \? 'unavailable' : data\?\.role \?\? 'missing'/);
});


test('API request schemas reject oversized, malformed, and unexpected input', () => {
  assert.equal(CouncilRequestSchema.safeParse({ agendaTopic: 'Review priorities', contextData: { sourceStatus: 'not_connected' } }).success, true);
  assert.equal(CouncilRequestSchema.safeParse({ agendaTopic: 'x', unexpected: true }).success, false);
  assert.equal(CouncilRequestSchema.safeParse({ contextData: { note: 'x'.repeat(16_500) } }).success, false);
  assert.equal(BriefingRequestSchema.safeParse({ timeOfDay: 'Good morning', focusDomain: 'operations' }).success, true);
  assert.equal(BriefingRequestSchema.safeParse({ focusDomain: 'x'.repeat(81) }).success, false);
  assert.equal(SimulationRequestSchema.safeParse({ magnitudePct: 0 }).success, true);
  assert.equal(SimulationRequestSchema.safeParse({ magnitudePct: 101 }).success, false);
  assert.equal(VoiceRequestSchema.safeParse({ query: 'Show strategic risks' }).success, true);
  assert.equal(VoiceRequestSchema.safeParse({ query: ' ' }).success, false);
  assert.equal(VoiceRequestSchema.safeParse({ query: 'x'.repeat(1001) }).success, false);
});

test('analytics events are authenticated and quota-limited in the applied migration', () => {
  const migration = source('../supabase/migrations/20261107195234_quickfas_authenticated_analytics_events.sql');
  const routes = source('../src/server/routes.ts');
  assert.match(migration, /'analytics-event'/);
  assert.match(migration, /when 'analytics-event' then v_limit := 120/);
  assert.match(routes, /router\.post\('\/api\/analytics\/event', requireDistributedRateLimit\('analytics-event'\), handleAnalyticsEvent/);
  assert.doesNotMatch(routes, /app\.post\('\/analytics\/event'/);
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
