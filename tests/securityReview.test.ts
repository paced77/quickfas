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
  assert.match(routes, /requireRole\('admin', 'operator'\), handleTelemetryInject/);
  const supabaseClient = source('../src/lib/supabase.ts');
  const viteConfig = source('../vite.config.ts');
  assert.match(supabaseClient, /VITE_SUPABASE_URL \|\| import\.meta\.env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(supabaseClient, /VITE_SUPABASE_PUBLISHABLE_KEY \|\| import\.meta\.env\.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(viteConfig, /envPrefix: \['VITE_', 'NEXT_PUBLIC_'\]/);
});

test('known AI routes remain authenticated pending an approved role matrix', () => {
  const routes = source('../src/server/routes.ts');
  const authMount = routes.indexOf('router.use(requireAuthenticatedUser)');
  for (const route of [
    "router.post('/gemini/council-deliberation'",
    "router.post('/gemini/executive-briefing'",
    "router.post('/gemini/simulation'",
    "router.post('/gemini/voice-query'",
  ]) {
    const routeIndex = routes.indexOf(route);
    assert.ok(routeIndex > authMount, `${route} must remain behind authentication`);
  }
});
