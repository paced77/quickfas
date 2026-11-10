import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { CouncilRequestSchema, BriefingRequestSchema, SimulationRequestSchema, VoiceRequestSchema } from './requestSchemas.ts';
import { AnalyticsEventPayloadSchema, type AnalyticsEventName } from '../platform/analytics/analyticsEvents.ts';
import {
  validateKingdomTelemetry,
  AnyKingdomEvent,
} from '../schemas/events.ts';

dotenv.config();

export const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), payment=()');
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});
app.use(express.json({ limit: '256kb' }));

// Initialize Server-Side Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Telemetry Event Store
const MAX_STORED_EVENTS = 120;
const eventHistory: AnyKingdomEvent[] = [];
const demoTelemetryEnabled = process.env.KINGDOM_DEMO_TELEMETRY === 'true';
const analyticsEventCounts: Partial<Record<AnalyticsEventName, number>> = {};
let telemetryWindowStartedAt = Date.now();
let telemetryEventsInWindow = 0;
let validationStats = {
  totalReceived: 0,
  validCount: 0,
  rejectedCount: 0,
  lastRejectedReason: null as string | null,
};

// Demo telemetry is strictly opt-in. Production defaults to an empty feed until approved sources are connected.
if (demoTelemetryEnabled) {
  const sampleEvents: unknown[] = [
    { eventId: 'demo-system-001', eventType: 'system.health', domain: 'infrastructure', severity: 'nominal', source: 'sample-system-monitor', correlationId: 'demo-correlation-01', timestamp: new Date().toISOString(), metadata: { scenario: 'illustrative_workspace', dataClassification: 'synthetic_demo', environment: 'demo' }, payload: { status: 'optimal', uptimeSeconds: 3600, latencyMs: 50, errorsPerMin: 0, cpuUtilization: 25, memoryUtilization: 40, availabilityPct: 99 } },
    { eventId: 'demo-ops-002', eventType: 'ops.capacity_update', domain: 'operations', severity: 'nominal', source: 'sample-workstream-monitor', correlationId: 'demo-correlation-02', timestamp: new Date().toISOString(), metadata: { scenario: 'illustrative_workspace', dataClassification: 'synthetic_demo', environment: 'demo' }, payload: { subsystem: 'Sample workstream', capacityPct: 75, utilizationPct: 55, throughputPerHr: 20, activeTasks: 4, statusSummary: 'Illustrative workload only; not connected to a live operational system' } },
  ];
  for (const raw of sampleEvents) {
    validationStats.totalReceived++;
    const val = validateKingdomTelemetry(raw);
    if (val.success && val.event) { eventHistory.unshift(val.event); validationStats.validCount++; }
    else { validationStats.rejectedCount++; validationStats.lastRejectedReason = val.error || 'Unknown synthetic fixture validation failure'; }
  }
  // Synthetic pulse generation is confined to explicitly enabled demo environments.
  setInterval(() => {
    const sources = [
      { eventType: 'system.health', domain: 'infrastructure', severity: 'nominal', source: 'sample-system-monitor', payload: { status: 'optimal', uptimeSeconds: 3600, latencyMs: 50, errorsPerMin: 0, cpuUtilization: 25, memoryUtilization: 40, availabilityPct: 99 } },
      { eventType: 'ops.capacity_update', domain: 'operations', severity: 'nominal', source: 'sample-workstream-monitor', payload: { subsystem: 'Sample workstream', capacityPct: 75, utilizationPct: 55, throughputPerHr: 20, activeTasks: 4, statusSummary: 'Illustrative workload only; not connected to a live operational system' } },
    ] as const;
    const pick = sources[Math.floor(Math.random() * sources.length)];
    const rawEvent = { ...pick, eventId: 'demo-' + Date.now().toString(36), correlationId: 'demo-correlation-' + Date.now(), timestamp: new Date().toISOString(), metadata: { synthesized: true, dataClassification: 'synthetic_demo', environment: 'demo' } };
    validationStats.totalReceived++;
    const val = validateKingdomTelemetry(rawEvent);
    if (val.success && val.event) { eventHistory.unshift(val.event); if (eventHistory.length > MAX_STORED_EVENTS) eventHistory.pop(); validationStats.validCount++; }
    else { validationStats.rejectedCount++; validationStats.lastRejectedReason = val.error || 'Unknown synthetic pulse validation failure'; }
  }, 4500);
}
// Helper router support: supports routes both with and without "/api" prefix (for Vercel rewrites)
const router = express.Router();


type AuthenticatedRequest = Request & {
  authUser?: { id: string; email?: string };
  authRole?: string;
  consumeRateLimit?: (bucket: string) => PromiseLike<{ data: unknown; error: { code?: string } | null }>;
};

const requireAuthenticatedUser: express.RequestHandler = async (req, res, next) => {
  const authUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!authUrl || !publishableKey) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.error('Authentication configuration is missing in production.');
      res.status(503).json({ error: 'Authentication is temporarily unavailable. Please try again later.' });
      return;
    }
    // Guest operator access is limited to local, non-production development.
    const authenticatedRequest = req as AuthenticatedRequest;
    authenticatedRequest.authUser = { id: 'guest-operator', email: 'operator@kingdom.internal' };
    authenticatedRequest.authRole = 'operator';
    return next();
  }

  const authorization = req.header('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) { res.status(401).json({ error: 'A valid sign-in session is required.' }); return; }

  try {
    const authClient = createClient(authUrl, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) { res.status(401).json({ error: 'Your session is invalid or expired.' }); return; }

    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) {
      console.error('Unable to load authorization profile:', profileError.message);
      res.status(503).json({ error: 'Authorization profile is unavailable. Apply the Supabase profiles schema before enabling sign-in.' }); return;
    }
    if (!profile) { res.status(403).json({ error: 'No access profile exists for this account.' }); return; }

    const authenticatedRequest = req as AuthenticatedRequest;
    authenticatedRequest.authUser = { id: user.id, email: user.email };
    authenticatedRequest.authRole = profile.role;
    authenticatedRequest.consumeRateLimit = (bucket) =>
      authClient.rpc('consume_quickfas_api_rate_limit', { p_bucket: bucket });
    next();
  } catch (error) {
    const safeErrorMessage = error instanceof Error ? error.message : 'unknown_error';
    console.error('Authentication verification failed. code=AUTH_VERIFY_FAILED message=%s', safeErrorMessage);
    res.status(503).json({ error: 'Unable to verify your session right now.' }); return;
  }
};

const requireRole = (...allowedRoles: string[]): express.RequestHandler => (req, res, next) => {
  const role = (req as AuthenticatedRequest).authRole;
  if (!role || !allowedRoles.includes(role)) {
    res.status(403).json({ error: 'Your account does not have permission to perform this action.' }); return;
  }
  next();
};

const requireDistributedRateLimit = (bucket: string): express.RequestHandler => async (req, res, next) => {
  const consumeRateLimit = (req as AuthenticatedRequest).consumeRateLimit;
  if (!consumeRateLimit) {
    return res.status(503).json({ error: 'Rate limiting is unavailable. This action is temporarily disabled.' });
  }
  try {
    const { data, error } = await consumeRateLimit(bucket);
    if (error) {
      console.error('Distributed rate-limit check failed for bucket=%s code=%s', bucket, error.code || 'unknown');
      return res.status(503).json({ error: 'Rate limiting is unavailable. This action is temporarily disabled.' });
    }
    if (data !== true) {
      return res.status(429).json({ error: 'Request limit reached. Please wait before trying again.' });
    }
    return next();
  } catch {
    return res.status(503).json({ error: 'Rate limiting is unavailable. This action is temporarily disabled.' });
  }
};

// 1. Health Status endpoint
const handleHealth = (req: Request, res: Response) => {
  res.json({ status: 'ok' });
};
router.get('/health', handleHealth);
router.get('/api/health', handleHealth);

// Guard only application API routes (never block frontend HTML, Vite assets, or root requests)
const apiAuthGuard: express.RequestHandler = (req, res, next) => {
  if (
    !req.path.startsWith('/api') &&
    !req.path.startsWith('/telemetry') &&
    !req.path.startsWith('/gemini') &&
    !req.path.startsWith('/audit') &&
    !req.path.startsWith('/consent') &&
    !req.path.startsWith('/referrals') &&
    !req.path.startsWith('/analytics')
  ) {
    return next();
  }
  return requireAuthenticatedUser(req, res, next);
};
router.use(apiAuthGuard);

// Privacy-safe product analytics: authenticated callers may send allow-listed event names only; no event properties,
// account IDs, IP addresses, route strings, health details, or form contents are retained.
const handleAnalyticsEvent = (req: Request, res: Response) => {
  const parsed = AnalyticsEventPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Event is not part of the approved analytics contract.' });
  }

  const eventName = parsed.data.event;
  analyticsEventCounts[eventName] = (analyticsEventCounts[eventName] ?? 0) + 1;
  return res.status(202).json({ accepted: true });
};
// Authenticated event-only analytics use the same distributed per-user quota on both route aliases.
router.post('/analytics/event', requireDistributedRateLimit('analytics-event'), handleAnalyticsEvent);
router.post('/api/analytics/event', requireDistributedRateLimit('analytics-event'), handleAnalyticsEvent);

const handleAnalyticsSummary = (_req: Request, res: Response) => {
  return res.json({
    counts: analyticsEventCounts,
    retention: 'process_lifetime_aggregate',
    containsPersonalData: false,
  });
};
router.get('/analytics/summary', requireRole('admin', 'executive'), handleAnalyticsSummary);
router.get('/api/analytics/summary', requireRole('admin', 'executive'), handleAnalyticsSummary);

// 2. Telemetry Stream & Status
const handleTelemetryEvents = (req: Request, res: Response) => {
  const domainFilter = req.query.domain as string | undefined;
  const severityFilter = req.query.severity as string | undefined;
  let filtered = eventHistory;

  if (domainFilter && domainFilter !== 'all') {
    filtered = filtered.filter((e) => e.domain === domainFilter);
  }
  if (severityFilter && severityFilter !== 'all') {
    filtered = filtered.filter((e) => e.severity === severityFilter);
  }

  res.json({
    events: filtered.slice(0, 50),
    stats: validationStats,
    dataMode: demoTelemetryEnabled ? 'synthetic_demo' : 'awaiting_ingestion',
    persistence: 'process_memory_only',
    timestamp: new Date().toISOString(),
  });
};
router.get('/telemetry/events', handleTelemetryEvents);
router.get('/api/telemetry/events', handleTelemetryEvents);

// 3. Telemetry Injector
const handleTelemetryInject = (req: Request, res: Response) => {
  const now = Date.now();
  if (now - telemetryWindowStartedAt >= 60_000) {
    telemetryWindowStartedAt = now;
    telemetryEventsInWindow = 0;
  }
  if (telemetryEventsInWindow >= 120) {
    return res.status(429).json({ error: 'Telemetry ingestion rate limit reached.' });
  }
  telemetryEventsInWindow += 1;

  const incoming = req.body;
  validationStats.totalReceived++;

  const val = validateKingdomTelemetry(incoming);
  if (val.success && val.event) {
    eventHistory.unshift(val.event);
    if (eventHistory.length > MAX_STORED_EVENTS) eventHistory.pop();
    validationStats.validCount++;
    res.json({
      status: 'accepted',
      message: 'Event accepted into Kingdom Telemetry Fabric (TEL-001 Validated)',
      event: val.event,
      stats: validationStats,
    });
  } else {
    validationStats.rejectedCount++;
    validationStats.lastRejectedReason = val.error || 'Schema validation rejected payload';
    res.status(422).json({
      status: 'rejected',
      message: 'Zod Validation Failure: Event rejected by Sovereign Telemetry Contract',
      error: val.error,
      stats: validationStats,
    });
  }
};
router.post('/telemetry/inject', requireRole('admin', 'operator'), requireDistributedRateLimit('telemetry-ingest'), handleTelemetryInject);
router.post('/api/telemetry/inject', requireRole('admin', 'operator'), requireDistributedRateLimit('telemetry-ingest'), handleTelemetryInject);

// Fallback Council Deliberation generator
function generateFallbackDeliberation(agendaTopic: string) {
  return {
    agenda: agendaTopic,
    consensusScorePct: 0,
    impactTier: 'Not assessed — illustrative fallback',
    executiveDirective: 'Fictional demonstration response only. No verified project data or live model response is available; do not use this output to make operational, financial, regulatory, or clinical decisions.',
    coreAnswers: {
      whatIsHappeningNow: 'Current project status is unknown because no verified source data is connected to this fallback response.',
      whyIsItHappening: 'The AI provider is not configured. This response is a placeholder, not an analysis of live conditions.',
      whatHappensNext: 'Connect an approved source and obtain a live, evidence-backed analysis before drawing conclusions.',
      whatShouldIDo: 'Do not act on this placeholder. Review the agenda against verified records and responsible subject-matter experts.',
    },
    agentDeliberations: [
      { agentName: 'Sovereign Strategist', role: 'Strategy', verdict: 'Unassessed', argument: 'No verified evidence is available for a recommendation.', confidence: 0 },
      { agentName: 'Finance Oracle', role: 'Finance', verdict: 'Unassessed', argument: 'No verified financial data is available for analysis.', confidence: 0 },
      { agentName: 'Compliance Guardian', role: 'Compliance', verdict: 'Unassessed', argument: 'No compliance assessment or certification can be inferred from this fallback.', confidence: 0 },
      { agentName: 'Risk Sentinel', role: 'Risk', verdict: 'Unassessed', argument: 'Risk cannot be scored without validated source information.', confidence: 0 },
    ],
    actionableInterventions: [],
  };
}

// 4. AI Council Deliberation Chamber
const handleCouncilDeliberation = async (req: Request, res: Response) => {
  const request = CouncilRequestSchema.safeParse(req.body);
  if (!request.success) return res.status(422).json({ error: 'Invalid council request. Check field types and size limits.' });
  const { agendaTopic, contextData } = request.data;
  const promptAgenda = agendaTopic || 'Review the supplied project agenda';

  if (!apiKey) {
    return res.json(generateFallbackDeliberation(promptAgenda));
  }

  try {
    const systemInstruction = `You are a planning assistant for Project Kingdom and Stratum Clinical Edge.
Use only facts explicitly present in supplied, verified context. Never invent financial figures, enrollment counts, clinic deployments, operational telemetry, partners, regulatory status, security certifications, or clinical outcomes. Do not claim HIPAA compliance, 21 CFR Part 11 validation, or a live EHR/FHIR connection unless verified context explicitly establishes it.
When evidence is missing, say the information is unknown and identify the source needed. Clearly distinguish proposals, assumptions, illustrative examples, and verified facts. Do not provide diagnosis or patient-specific clinical advice.
Provide an evidence-aware draft answering whatIsHappeningNow, whyIsItHappening, whatHappensNext, and whatShouldIDo. Return pure JSON.`;
    const userPrompt = `AGENDA FOR SOVEREIGN COUNCIL:
${promptAgenda}

SUPPLIED CONTEXT (may be empty; do not infer missing facts):
${JSON.stringify(contextData || {})}`;
    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            agenda: { type: Type.STRING },
            consensusScorePct: { type: Type.NUMBER },
            impactTier: { type: Type.STRING },
            executiveDirective: { type: Type.STRING },
            coreAnswers: {
              type: Type.OBJECT,
              properties: {
                whatIsHappeningNow: { type: Type.STRING },
                whyIsItHappening: { type: Type.STRING },
                whatHappensNext: { type: Type.STRING },
                whatShouldIDo: { type: Type.STRING },
              },
              required: ['whatIsHappeningNow', 'whyIsItHappening', 'whatHappensNext', 'whatShouldIDo'],
            },
            agentDeliberations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agentName: { type: Type.STRING },
                  role: { type: Type.STRING },
                  verdict: { type: Type.STRING },
                  argument: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ['agentName', 'role', 'verdict', 'argument', 'confidence'],
              },
            },
            actionableInterventions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  projectedGain: { type: Type.STRING },
                  riskRating: { type: Type.STRING },
                },
                required: ['id', 'title', 'timeframe', 'projectedGain', 'riskRating'],
              },
            },
          },
          required: [
            'agenda',
            'consensusScorePct',
            'impactTier',
            'executiveDirective',
            'coreAnswers',
            'agentDeliberations',
            'actionableInterventions',
          ],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), 6500)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (genErr) {
    console.warn('Using structured fallback for council deliberation');
    res.json(generateFallbackDeliberation(promptAgenda));
  }
};
router.post('/gemini/council-deliberation', requireRole('admin', 'executive', 'analyst'), requireDistributedRateLimit('ai-council'), handleCouncilDeliberation);
router.post('/api/gemini/council-deliberation', requireRole('admin', 'executive', 'analyst'), requireDistributedRateLimit('ai-council'), handleCouncilDeliberation);

// 5. Executive Spoken Briefing
const handleExecutiveBriefing = async (req: Request, res: Response) => {
  const request = BriefingRequestSchema.safeParse(req.body);
  if (!request.success) return res.status(422).json({ error: 'Invalid briefing request. Check field types and size limits.' });
  const { timeOfDay, focusDomain } = request.data;
  const greeting = timeOfDay || 'Good morning';

  const fallbackBriefing = {
    headline: 'Illustrative briefing — no verified source data',
    statusSummary: 'Live operational sources are not connected. Current status and performance cannot be verified.',
    spokenScript: `${greeting}. This is an illustrative fallback. No verified project metrics or live operational status are available.`,
    coreAnswers: {
      whatIsHappeningNow: 'Current operating conditions are unknown because no verified source data is connected.',
      whyIsItHappening: 'This briefing is a placeholder because the application has no verified live metrics for this request.',
      whatHappensNext: 'Connect approved data sources and confirm their provenance before generating an evidence-based briefing.',
      whatShouldIDo: 'Do not make operational, financial, regulatory, or clinical decisions from this placeholder.',
    },
    keySignals: [],
  };

  if (!apiKey) {
    return res.json(fallbackBriefing);
  }

  try {
    const systemInstruction = `You are an evidence-aware briefing assistant for Project Kingdom and Stratum Clinical Edge.
No verified operational, financial, regulatory, or clinical data is connected to this briefing request. Do not invent metrics, deployments, enrollment, financial performance, uptime, compliance status, or outcomes. State that information is unknown when evidence is unavailable. Do not provide diagnosis or patient-specific clinical advice.
Return a concise illustrative briefing that clearly distinguishes unknown status from verified facts. The spoken narrative should start with "${greeting}." and contain no markdown.`

    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Prepare an illustrative briefing for domain ${focusDomain || 'all'}. No verified live data source is attached to this request.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            statusSummary: { type: Type.STRING },
            spokenScript: { type: Type.STRING },
            coreAnswers: {
              type: Type.OBJECT,
              properties: {
                whatIsHappeningNow: { type: Type.STRING },
                whyIsItHappening: { type: Type.STRING },
                whatHappensNext: { type: Type.STRING },
                whatShouldIDo: { type: Type.STRING },
              },
              required: ['whatIsHappeningNow', 'whyIsItHappening', 'whatHappensNext', 'whatShouldIDo'],
            },
            keySignals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  delta: { type: Type.STRING },
                  sentiment: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ['metric', 'delta', 'sentiment', 'context'],
              },
            },
          },
          required: ['headline', 'statusSummary', 'spokenScript', 'coreAnswers', 'keySignals'],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), 6500)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch {
    res.json(fallbackBriefing);
  }
};
router.post('/gemini/executive-briefing', requireRole('admin', 'executive'), requireDistributedRateLimit('ai-briefing'), handleExecutiveBriefing);
router.post('/api/gemini/executive-briefing', requireRole('admin', 'executive'), requireDistributedRateLimit('ai-briefing'), handleExecutiveBriefing);

// 6. Enterprise Digital Twin Scenario Simulation
const handleSimulation = async (req: Request, res: Response) => {
  const request = SimulationRequestSchema.safeParse(req.body);
  if (!request.success) return res.status(422).json({ error: 'Invalid simulation request. Check field types and size limits.' });
  const { scenarioTitle, perturbationType, magnitudePct } = request.data;

  const fallbackSimulation = {
    scenarioTitle: scenarioTitle || 'Illustrative scenario — not executed',
    simulationDurationWeeks: null,
    overallSystemStabilityScore: null,
    executiveSummary: 'Not run. No simulation model or verified system telemetry is connected. This response contains no impact forecast, cost estimate, or deployment recommendation.',
    nodesImpacted: [],
    counterMeasures: [],
  };

  if (!apiKey) {
    return res.json(fallbackSimulation);
  }

  try {
    const systemInstruction = `You are an illustrative scenario-analysis assistant for Project Kingdom and Stratum Clinical Edge.
Treat the supplied scenario and magnitude as hypothetical assumptions, not observed events. Do not claim that a simulation was executed against live infrastructure or invent actual node health, costs, deployments, clinical outcomes, or compliance status. Clearly label estimates as hypothetical and state when source data is missing. Do not provide patient-specific clinical advice. Return strict JSON.`;

    const userPrompt = `SCENARIO TO SIMULATE:
Title: ${scenarioTitle || 'Offline Satellite Dropout & Buffer Stress Test'}
Perturbation: ${perturbationType || 'offline_satellite_failover'}
Magnitude: ${magnitudePct ?? 35}%`;

    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioTitle: { type: Type.STRING },
            simulationDurationWeeks: { type: Type.NUMBER },
            overallSystemStabilityScore: { type: Type.NUMBER },
            executiveSummary: { type: Type.STRING },
            nodesImpacted: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nodeName: { type: Type.STRING },
                  healthDelta: { type: Type.NUMBER },
                  costDeltaUsd: { type: Type.STRING },
                  riskShift: { type: Type.STRING },
                  outputForecast: { type: Type.STRING },
                  primaryDependencyConcern: { type: Type.STRING },
                },
                required: ['nodeName', 'healthDelta', 'costDeltaUsd', 'riskShift', 'outputForecast', 'primaryDependencyConcern'],
              },
            },
            counterMeasures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  targetNode: { type: Type.STRING },
                  costToDeploy: { type: Type.STRING },
                  riskReductionPct: { type: Type.NUMBER },
                },
                required: ['action', 'targetNode', 'costToDeploy', 'riskReductionPct'],
              },
            },
          },
          required: [
            'scenarioTitle',
            'simulationDurationWeeks',
            'overallSystemStabilityScore',
            'executiveSummary',
            'nodesImpacted',
            'counterMeasures',
          ],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), 6500)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch {
    res.json(fallbackSimulation);
  }
};
router.post('/gemini/simulation', requireRole('admin', 'executive', 'analyst', 'operator'), requireDistributedRateLimit('ai-simulation'), handleSimulation);
router.post('/api/gemini/simulation', requireRole('admin', 'executive', 'analyst', 'operator'), requireDistributedRateLimit('ai-simulation'), handleSimulation);

// 7. Voice Command & Strategic Query Engine
const handleVoiceQuery = async (req: Request, res: Response) => {
  const request = VoiceRequestSchema.safeParse(req.body);
  if (!request.success) return res.status(422).json({ error: 'Invalid voice query. Enter up to 1,000 characters.' });
  const { query } = request.data;

  const queryLower = query.toLowerCase();
  let fallbackIntent = 'sovereign_answer';
  let fallbackTarget = 'war-room';
  let fallbackResponse = 'No verified project data is connected. I cannot confirm live operational status or metrics.';

  if (queryLower.includes('risk')) {
    fallbackIntent = 'view_risks';
    fallbackResponse = 'No live risk feed is connected. Current risk status is unknown.';
  } else if (queryLower.includes('clinical') || queryLower.includes('patient') || queryLower.includes('enrollment')) {
    fallbackIntent = 'view_clinical';
    fallbackResponse = 'No clinical trial or patient data source is connected. No patient records are available in this workspace.';
  } else if (queryLower.includes('finance') || queryLower.includes('revenue') || queryLower.includes('forecast')) {
    fallbackIntent = 'explain_finance';
    fallbackResponse = 'No verified financial data source is connected. Revenue and runway are unknown.';
  } else if (queryLower.includes('simulation') || queryLower.includes('twin')) {
    fallbackIntent = 'run_simulation';
    fallbackTarget = 'digital-twin';
    fallbackResponse = 'No simulation has been run. Connect verified system inputs before interpreting a scenario result.';
  } else if (queryLower.includes('briefing') || queryLower.includes('executive')) {
    fallbackIntent = 'generate_briefing';
    fallbackResponse = 'No verified project metrics are available for an executive briefing.';
  }

  if (!apiKey) {
    return res.json({
      recognizedIntent: fallbackIntent,
      targetView: fallbackTarget,
      spokenResponse: fallbackResponse,
    });
  }

  try {
    const systemInstruction = `You are an evidence-aware voice assistant for Project Kingdom and Stratum Clinical Edge.
Use only verified facts supplied in the current request. No live operational, financial, clinical, or risk data is attached. Do not invent metrics, enrollment, deployments, financial performance, compliance status, or patient details. State when information is unknown. Do not provide diagnosis or patient-specific clinical advice. Keep the response to one or two spoken-friendly sentences.`

    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `User voice input: "${query}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recognizedIntent: { type: Type.STRING },
            targetView: { type: Type.STRING },
            spokenResponse: { type: Type.STRING },
          },
          required: ['recognizedIntent', 'targetView', 'spokenResponse'],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), 5000)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch {
    res.json({
      recognizedIntent: fallbackIntent,
      targetView: fallbackTarget,
      spokenResponse: fallbackResponse,
    });
  }
};
router.post('/gemini/voice-query', requireRole('admin', 'executive', 'analyst', 'operator'), requireDistributedRateLimit('ai-voice'), handleVoiceQuery);
router.post('/api/gemini/voice-query', requireRole('admin', 'executive', 'analyst', 'operator'), requireDistributedRateLimit('ai-voice'), handleVoiceQuery);

// Mount router on app
app.use(router);
