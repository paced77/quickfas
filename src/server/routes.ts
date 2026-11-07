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
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  if (process.env.NODE_ENV === 'production') {
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

// Seed initial validated events
function seedInitialTelemetry() {
  const now = new Date();
  const sampleEvents: unknown[] = [
    {
      eventId: 'sample-system-001',
      eventType: 'system.health',
      domain: 'infrastructure',
      severity: 'nominal',
      source: 'fictional-demo-monitor',
      correlationId: 'sample-correlation-01',
      timestamp: new Date(now.getTime() - 120000).toISOString(),
      metadata: { scenario: 'fictional_demo', dataClassification: 'synthetic' },
      payload: { status: 'optimal', uptimeSeconds: 1200, latencyMs: 120, errorsPerMin: 0, cpuUtilization: 35, memoryUtilization: 48, availabilityPct: 99 },
    },
    {
      eventId: 'sample-ops-002',
      eventType: 'ops.capacity_update',
      domain: 'operations',
      severity: 'nominal',
      source: 'fictional-workstream-monitor',
      correlationId: 'sample-correlation-02',
      timestamp: new Date(now.getTime() - 90000).toISOString(),
      metadata: { scenario: 'fictional_demo', dataClassification: 'synthetic' },
      payload: { subsystem: 'Sample Workstream A', capacityPct: 72, utilizationPct: 64, throughputPerHr: 120, activeTasks: 8, statusSummary: 'Illustrative values only; not connected to a live system' },
    },
    {
      eventId: 'sample-risk-003',
      eventType: 'risk.detected',
      domain: 'operations',
      severity: 'warning',
      source: 'fictional-demo-risk-monitor',
      correlationId: 'sample-correlation-03',
      timestamp: new Date(now.getTime() - 60000).toISOString(),
      metadata: { scenario: 'fictional_demo', dataClassification: 'synthetic' },
      payload: { category: 'operations', headline: 'Example dependency review needed', probability: 0.2, impactRating: 3, riskScore: 20, mitigationStrategy: 'Review the fictional dependency and document an owner', ownerAgent: 'Sample Risk Reviewer' },
    },
  ];

  for (const raw of sampleEvents) {
    validationStats.totalReceived++;
    const val = validateKingdomTelemetry(raw);
    if (val.success && val.event) {
      eventHistory.unshift(val.event);
      validationStats.validCount++;
    } else {
      validationStats.rejectedCount++;
      validationStats.lastRejectedReason = val.error || 'Unknown validation failure';
    }
  }
}

// Synthetic fixtures are disabled unless an operator explicitly opts into demo mode.
if (demoTelemetryEnabled) seedInitialTelemetry();

// Background Telemetry Pulse Generator
if (demoTelemetryEnabled) {
setInterval(() => {
  const sources = [
    {
      eventType: 'system.health',
      domain: 'infrastructure',
      severity: 'nominal',
      source: 'fictional-demo-probe',
      payload: { status: 'optimal', uptimeSeconds: 3600, latencyMs: 120, errorsPerMin: 0, cpuUtilization: 34, memoryUtilization: 47, availabilityPct: 99 },
    },
    {
      eventType: 'ops.capacity_update',
      domain: 'operations',
      severity: 'nominal',
      source: 'fictional-workstream-monitor',
      payload: { subsystem: 'Sample Workstream B', capacityPct: 76, utilizationPct: 68, throughputPerHr: 140, activeTasks: 6, statusSummary: 'Synthetic demonstration event; no live operational connection' },
    },
    {
      eventType: 'risk.detected',
      domain: 'operations',
      severity: 'warning',
      source: 'fictional-demo-risk-monitor',
      payload: { category: 'operations', headline: 'Example review item', probability: 0.15, impactRating: 2, riskScore: 12, mitigationStrategy: 'Validate this example against an approved source before acting', ownerAgent: 'Sample Risk Reviewer' },
    },
  ];

  const pick = sources[Math.floor(Math.random() * sources.length)];
  const rawEvent = {
    eventId: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    eventType: pick.eventType,
    domain: pick.domain,
    severity: pick.severity,
    source: pick.source,
    correlationId: `corr-${Date.now()}`,
    timestamp: new Date().toISOString(),
    metadata: { synthesized: true, dataClassification: 'synthetic_demo', environment: 'explicit-demo' },
    payload: pick.payload,
  };

  validationStats.totalReceived++;
  const val = validateKingdomTelemetry(rawEvent);
  if (val.success && val.event) {
    eventHistory.unshift(val.event);
    if (eventHistory.length > MAX_STORED_EVENTS) {
      eventHistory.pop();
    }
    validationStats.validCount++;
  } else {
    validationStats.rejectedCount++;
    validationStats.lastRejectedReason = val.error || 'Failed schema parse';
  }
}, 4500);
}

// Helper router support: supports routes both with and without "/api" prefix (for Vercel rewrites)
const router = express.Router();


type AuthenticatedRequest = Request & { authUser?: { id: string; email?: string }; authRole?: string; authClient?: ReturnType<typeof createClient> };

const requireAuthenticatedUser: express.RequestHandler = async (req, res, next) => {
  const authUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!authUrl || !publishableKey) {
    res.status(503).json({ error: 'Authentication service is not configured.' }); return;
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
    authenticatedRequest.authClient = authClient;
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
  const authClient = (req as AuthenticatedRequest).authClient;
  if (!authClient) {
    return res.status(503).json({ error: 'Rate limiting is unavailable. This action is temporarily disabled.' });
  }
  try {
    const { data, error } = await authClient.rpc('consume_quickfas_api_rate_limit', { p_bucket: bucket });
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

// All router-mounted APIs below this point require a verified Supabase user. Public event-only analytics routes are registered on app separately.
router.use(requireAuthenticatedUser);

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
    impactTier: 'Illustrative only',
    executiveDirective: 'This is a fictional demonstration response. Do not treat it as a verified assessment or operational instruction.',
    coreAnswers: {
      whatIsHappeningNow: 'Sample scenario: a fictional team is reviewing three workstreams and a small set of example tasks.',
      whyIsItHappening: 'The response demonstrates how the council format organizes context, trade-offs, and possible next steps.',
      whatHappensNext: 'Replace this example with approved source data and a named accountable reviewer before using the workflow.',
      whatShouldIDo: 'Use this output to explore the interface only. Do not make clinical, financial, legal, regulatory, or operational decisions from synthetic content.',
    },
    agentDeliberations: [
      { agentName: 'Sample Strategy Lead', role: 'Strategy', verdict: 'Review', argument: 'Confirm the objective and evidence before choosing a course of action.', confidence: 0 },
      { agentName: 'Sample Operations Lead', role: 'Operations', verdict: 'Review', argument: 'Check ownership, dependencies, and capacity using current authorized records.', confidence: 0 },
      { agentName: 'Sample Risk Reviewer', role: 'Risk', verdict: 'Caution', argument: 'The scenario contains fictional values and no verified source evidence.', confidence: 0 },
    ],
    actionableInterventions: [
      { id: 'SAMPLE-01', title: 'Validate the source data', timeframe: 'Before use', projectedGain: 'Not estimated', riskRating: 'Unassessed' },
      { id: 'SAMPLE-02', title: 'Assign an accountable reviewer', timeframe: 'Before use', projectedGain: 'Not estimated', riskRating: 'Unassessed' },
    ],
  };
}

// 4. AI Council Deliberation Chamber
const handleCouncilDeliberation = async (req: Request, res: Response) => {
  const request = CouncilRequestSchema.safeParse(req.body);
  if (!request.success) return res.status(422).json({ error: 'Invalid council request. Check field types and size limits.' });
  const { agendaTopic, contextData } = request.data;
  const promptAgenda = agendaTopic || 'Review a fictional multi-workstream planning scenario';

  if (!apiKey) {
    return res.json(generateFallbackDeliberation(promptAgenda));
  }

  try {
    const systemInstruction = `You are the Sovereign AI Council of Project Kingdom — an elite 2027+ Sovereign Intelligence Operating System.
You embody the 7 permanent Sovereign AI leaders:
1. Sovereign Strategist: Executive guidance, existential positioning, strategic horizon.
2. Finance Oracle: Cash flow, capital efficiency, revenue trajectory, valuation leverage.
3. Education Steward: educational quality, source provenance, and clear boundaries between education and care.
4. Risk Sentinel: Unmitigated exposures, vulnerabilities, operational shock tolerance.
5. Operations Commander: Execution tempo, workflow friction, capacity bottlenecks.
6. Compliance Guardian: policy alignment, evidence quality, and data governance.
7. Security Sentinel: Cybersecurity, cryptographic provenance, zero-trust integrity.

Treat all supplied context as unverified unless it includes an approved source and timestamp. Never invent institutions, patient counts, clinical outcomes, regulatory approvals, financial results, or operational facts. If source data is missing, label every example as fictional and illustrative. Analyze the strategic agenda with realistic domain tension.
Formulate a decisive consensus resolution answering the 4 Sovereign Questions:
- whatIsHappeningNow
- whyIsItHappening
- whatHappensNext
- whatShouldIDo

Return pure JSON.`;

    const userPrompt = `AGENDA FOR SOVEREIGN COUNCIL:
${promptAgenda}

TELEMETRY CONTEXT:
No verified telemetry source is connected. Treat all scenario data as illustrative.
Context: ${JSON.stringify(contextData || {})}`;

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
    headline: 'Illustrative Project Briefing · Sample Scenario',
    statusSummary: 'This response uses fictional examples to demonstrate the briefing format. No live clinical, financial, institutional, or operational data is connected.',
    spokenScript: `${greeting}. This is an illustrative workspace using fictional sample information. Verify approved source data before relying on any report.`,
    coreAnswers: {
      whatIsHappeningNow: 'Sample scenario: three fictional workstreams are being reviewed. These entries do not describe real organizations, people, projects, or outcomes.',
      whyIsItHappening: 'The figures are static examples used to demonstrate how status summaries and decision-support views may be presented.',
      whatHappensNext: 'Replace the examples with validated, authorized source data only after integrations, access controls, and data-quality checks are reviewed.',
      whatShouldIDo: 'Explore the interface only. Do not make clinical, financial, regulatory, staffing, or operational decisions from sample content.',
    },
    keySignals: [
      { metric: 'SAMPLE WORKSTREAMS', delta: '3', sentiment: 'nominal', context: 'Fictional interface example' },
      { metric: 'SAMPLE TASKS', delta: '8', sentiment: 'nominal', context: 'Not connected to a live project' },
      { metric: 'SAMPLE COMPLETION', delta: '60%', sentiment: 'nominal', context: 'Illustrative value only' },
      { metric: 'SAMPLE REVIEW ITEMS', delta: '2', sentiment: 'warning', context: 'Fictional training scenario' },
    ],
  };

  if (!apiKey) {
    return res.json(fallbackBriefing);
  }

  try {
    const systemInstruction = `You are the Sovereign Executive Narrator for Project Kingdom.
Generate executive-level briefings for national/global operating officers in 2027.
Never invent institutions, patient counts, clinical outcomes, financial results, regulatory approvals, or operational metrics. Use only approved source context. If no verified source data is supplied, clearly label the output illustrative and state that no live data is connected.
Structure evaluation around the 4 Sovereign Questions:
1. whatIsHappeningNow
2. whyIsItHappening
3. whatHappensNext
4. whatShouldIDo

The spoken narrative must be designed for audio playback: starting with "${greeting}. Kingdom systems online...", concise sentences, no markdown formatting inside the spokenScript text.`;

    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate an illustrative executive briefing for domain ${focusDomain || 'all'}. Use only facts explicitly present in the supplied context. No verified source data is attached, so do not invent metrics or real-world claims; label any example as fictional and illustrative.`,
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
    scenarioTitle: scenarioTitle || 'Fictional Workstream Capacity Scenario',
    simulationDurationWeeks: 4,
    overallSystemStabilityScore: 0,
    executiveSummary: 'Illustrative simulation only. The values below are fictional placeholders and are not a forecast, clinical assessment, financial estimate, or operational recommendation.',
    nodesImpacted: [
      { nodeName: 'Sample Workstream A', healthDelta: 0, costDeltaUsd: 'Not estimated', riskShift: 'Unassessed', outputForecast: 'No forecast available from verified data', primaryDependencyConcern: 'Confirm dependencies using approved source records' },
      { nodeName: 'Sample Workstream B', healthDelta: 0, costDeltaUsd: 'Not estimated', riskShift: 'Unassessed', outputForecast: 'No forecast available from verified data', primaryDependencyConcern: 'Confirm ownership and capacity before use' },
    ],
    counterMeasures: [
      { action: 'Validate scenario assumptions', targetNode: 'Sample Workstream A', costToDeploy: 'Not estimated', riskReductionPct: 0 },
      { action: 'Assign a qualified reviewer', targetNode: 'Sample Workstream B', costToDeploy: 'Not estimated', riskReductionPct: 0 },
    ],
  };

  if (!apiKey) {
    return res.json(fallbackSimulation);
  }

  try {
    const systemInstruction = `You are the Digital Twin Simulation Engine of Project Kingdom.
Model illustrative dependencies across strategy, finance, operations, technology, and risk. Do not invent real-world metrics or outcomes.
Return strict JSON.`;

    const userPrompt = `SCENARIO TO SIMULATE:
Title: ${scenarioTitle || 'Fictional Workstream Capacity Scenario'}
Perturbation: ${perturbationType || 'sample_capacity_change'}
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
  let fallbackResponse = `Processing directive "${query}". This is a demonstration response; no verified live data is connected.`;

  if (queryLower.includes('risk')) {
    fallbackIntent = 'view_risks';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Displaying the sample risk view. Example review items are fictional and must be validated against approved records.';
  } else if (queryLower.includes('clinical') || queryLower.includes('patient') || queryLower.includes('enrollment')) {
    fallbackIntent = 'view_clinical';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Opening the educational information view. This workspace does not contain patient records or verified clinical operations data.';
  } else if (queryLower.includes('finance') || queryLower.includes('revenue') || queryLower.includes('forecast')) {
    fallbackIntent = 'explain_finance';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Opening the sample finance view. No verified financial data is connected; do not rely on illustrative figures.';
  } else if (queryLower.includes('simulation') || queryLower.includes('twin')) {
    fallbackIntent = 'run_simulation';
    fallbackTarget = 'digital-twin';
    fallbackResponse = 'Digital Twin simulation environment engaged. Ready to compute ripple projections across enterprise topology.';
  } else if (queryLower.includes('briefing') || queryLower.includes('executive')) {
    fallbackIntent = 'generate_briefing';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Good morning. Project Kingdom demonstration workspace online. Sample information only; verify connected sources before relying on any report.';
  }

  if (!apiKey) {
    return res.json({
      recognizedIntent: fallbackIntent,
      targetView: fallbackTarget,
      spokenResponse: fallbackResponse,
    });
  }

  try {
    const systemInstruction = `You are the Sovereign Voice Assistant of Project Kingdom.
Do not invent or repeat unverified clinical, financial, regulatory, or operational metrics. If no approved source context is available, state that live data is not connected and keep the response illustrative.
Parse the user's voice command. Provide a concise spoken response (1-2 sentences maximum, strictly spoken-friendly, no bullet points or markdown).`;

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
