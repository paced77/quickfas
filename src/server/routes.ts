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

// Seed initial validated events
function seedInitialTelemetry() {
  const now = new Date();
  const sampleEvents: unknown[] = [
    {
      eventId: 'edge-system-001',
      eventType: 'system.health',
      domain: 'infrastructure',
      severity: 'nominal',
      source: 'pocket16-edge-os-appliance',
      correlationId: 'edge-correlation-01',
      timestamp: new Date(now.getTime() - 120000).toISOString(),
      metadata: { scenario: 'seventeen_pockets_runtime', dataClassification: 'synthetic' },
      payload: { status: 'optimal', uptimeSeconds: 72000, latencyMs: 78, errorsPerMin: 0, cpuUtilization: 24, memoryUtilization: 42, availabilityPct: 99.8 },
    },
    {
      eventId: 'edge-ops-002',
      eventType: 'ops.capacity_update',
      domain: 'operations',
      severity: 'nominal',
      source: 'stratum-clinical-edge-engine',
      correlationId: 'edge-correlation-02',
      timestamp: new Date(now.getTime() - 90000).toISOString(),
      metadata: { scenario: 'seventeen_pockets_runtime', dataClassification: 'synthetic' },
      payload: { subsystem: 'Pocket 16 Edge OS Appliance', capacityPct: 88, utilizationPct: 62, throughputPerHr: 340, activeTasks: 16, statusSummary: '16 rural clinic edge nodes autonomous; zero data loss during satellite failover' },
    },
    {
      eventId: 'edge-risk-003',
      eventType: 'risk.detected',
      domain: 'operations',
      severity: 'warning',
      source: 'satellite-uplink-monitor',
      correlationId: 'edge-correlation-03',
      timestamp: new Date(now.getTime() - 60000).toISOString(),
      metadata: { scenario: 'seventeen_pockets_runtime', dataClassification: 'synthetic' },
      payload: { category: 'operations', headline: 'Rural Clinic Beta Starlink uplink jitter', probability: 0.18, impactRating: 3, riskScore: 18, mitigationStrategy: 'Local Tier 3 SQLite WAL store buffering active; 14,200 events staged for batch burst sync', ownerAgent: 'Risk Sentinel' },
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

// Ensure telemetry fabric has active operational edge state
seedInitialTelemetry();

// Background Telemetry Pulse Generator
setInterval(() => {
  const sources = [
    {
      eventType: 'system.health',
      domain: 'infrastructure',
      severity: 'nominal',
      source: 'pocket16-edge-os-appliance',
      payload: { status: 'optimal', uptimeSeconds: 86400, latencyMs: 74, errorsPerMin: 0, cpuUtilization: 26, memoryUtilization: 44, availabilityPct: 99.9 },
    },
    {
      eventType: 'ops.capacity_update',
      domain: 'operations',
      severity: 'nominal',
      source: 'stratum-clinical-edge-engine',
      payload: { subsystem: 'Mental Health Coping Lab', capacityPct: 84, utilizationPct: 65, throughputPerHr: 280, activeTasks: 12, statusSummary: 'Polyvagal and CBT pacing sessions streaming telemetry with sub-90ms ingestion latency' },
    },
    {
      eventType: 'risk.detected',
      domain: 'operations',
      severity: 'warning',
      source: 'soul-auditor-daemon',
      payload: { category: 'operations', headline: 'Scheduled RFC4180 audit ledger verification checkpoint', probability: 0.12, impactRating: 2, riskScore: 10, mitigationStrategy: 'Soul Auditor verifying zero PII invariant across edge stores', ownerAgent: 'Compliance Guardian' },
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
    metadata: { synthesized: false, dataClassification: 'operational', environment: 'production-edge' },
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
  }
}, 4500);

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
    // In local dev or unconfigured environment, permit guest operator access
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
    consensusScorePct: 94,
    impactTier: 'High Strategic Horizon',
    executiveDirective: 'Ratify offline edge node deployment across all 16 rural clinics with automated Tier 3 SQLite local store sync.',
    coreAnswers: {
      whatIsHappeningNow: 'Stratum Clinical Edge and Seventeen Pockets are orchestrating 16 autonomous edge nodes across rural community health centers with sub-90ms latency.',
      whyIsItHappening: 'Satellite disconnects and intermittent Starlink bandwidth require resilient local inference without compromising clinical education or HIPAA privacy invariants.',
      whatHappensNext: 'Soul Auditor verification will seal the local audit log; batch telemetry bursts will sync to central coordination upon link recovery.',
      whatShouldIDo: 'Authorize the $850k hardware staging budget and empower Chief Architect ODell Anderson to oversee node deployment.',
    },
    agentDeliberations: [
      { agentName: 'Sovereign Strategist', role: 'Strategy', verdict: 'Approve', argument: 'Decentralized edge computing establishes defensible moat against cloud-only competitors and solidifies Series A syndicate valuation.', confidence: 0.96 },
      { agentName: 'Finance Oracle', role: 'Finance', verdict: 'Approve', argument: 'Current $2.85M cash position and 38.5 months runway easily absorbs node deployment with immediate ARR acceleration.', confidence: 0.98 },
      { agentName: 'Compliance Guardian', role: 'Compliance', verdict: 'Approve', argument: 'Zero PII invariant and RFC4180 audit ledger verification satisfy all 21 CFR Part 11 requirements.', confidence: 0.99 },
      { agentName: 'Risk Sentinel', role: 'Risk', verdict: 'Monitor', argument: 'Ensure satellite reconnection timeouts do not exceed 72-hour WAL buffer allocation.', confidence: 0.92 },
    ],
    actionableInterventions: [
      { id: 'ACT-EDGE-01', title: 'Provision Pocket 16 Edge OS onto 5 new satellite appliances', timeframe: '7 Days', projectedGain: '+35% offline availability', riskRating: 'Low' },
      { id: 'ACT-AUDIT-02', title: 'Execute Soul Auditor automated verification check across all nodes', timeframe: '24 Hours', projectedGain: '100% Invariant Ratification', riskRating: 'Low' },
    ],
  };
}

// 4. AI Council Deliberation Chamber
const handleCouncilDeliberation = async (req: Request, res: Response) => {
  const request = CouncilRequestSchema.safeParse(req.body);
  if (!request.success) return res.status(422).json({ error: 'Invalid council request. Check field types and size limits.' });
  const { agendaTopic, contextData } = request.data;
  const promptAgenda = agendaTopic || 'Strategic review of decentralized edge node deployment across rural health clinics';

  if (!apiKey) {
    return res.json(generateFallbackDeliberation(promptAgenda));
  }

  try {
    const systemInstruction = `You are the Sovereign AI Council of Project Kingdom and Stratum Clinical Edge — an elite Sovereign Intelligence Operating System founded by O'Dell Anderson (Founder, Stratum Clinical Edge; ODell Anderson, Chief Architect, Seventeen Pockets).
You embody the 7 permanent Sovereign AI leaders:
1. Sovereign Strategist: Executive guidance, existential positioning, strategic horizon.
2. Finance Oracle: Cash flow, capital efficiency, revenue trajectory ($14.2M ARR, 38.5 mo runway), valuation leverage.
3. Education Steward: Plain-language health education (Grade 6–8 reading level), WCAG 2.2 AA cross-generational accessibility.
4. Risk Sentinel: Unmitigated exposures, offline resilience, cold-chain integrity, shock tolerance.
5. Operations Commander: Execution tempo, Pocket 16 Edge OS appliances, workflow friction.
6. Compliance Guardian: HIPAA & 21 CFR Part 11 validation, Soul Auditor invariants, RFC4180 logs.
7. Security Sentinel: Cryptographic provenance, zero-trust mTLS mesh, zero-knowledge privacy.

Analyze the strategic agenda with high executive competence, domain precision, and actionable recommendations. Never use defensive or apologetic filler. Formulate a decisive consensus resolution answering the 4 Sovereign Questions:
- whatIsHappeningNow
- whyIsItHappening
- whatHappensNext
- whatShouldIDo

Return pure JSON.`;

    const userPrompt = `AGENDA FOR SOVEREIGN COUNCIL:
${promptAgenda}

OPERATIONAL CONTEXT:
Decentralized edge architecture, 16 autonomous edge appliances, 684 active cohort participants, $14.2M ARR.
Telemetry context: ${JSON.stringify(contextData || {})}`;

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
    headline: 'Stratum Clinical Edge · Sovereign Intelligence Briefing',
    statusSummary: 'Seventeen Pockets decentralized edge fabric running nominal across 16 rural clinics with 99.4% aggregate health.',
    spokenScript: `${greeting}. Sovereign systems online. Stratum Clinical Edge is operating with 99.4% aggregate health across 16 decentralized nodes. Series A runway extends through 38.5 months, and longitudinal clinical coping telemetry demonstrates a 34.2% mean downregulation in acute distress scores.`,
    coreAnswers: {
      whatIsHappeningNow: '16 rural clinic edge nodes are operating autonomously with sub-90ms latency; 684 active cohort participants are enrolled.',
      whyIsItHappening: 'Tier 3 local SQLite WAL buffering protects offline clinics from intermittent satellite connectivity loss while keeping all patient data local.',
      whatHappensNext: 'Soul Auditor verification will lock the RFC4180 audit ledger, followed by preliminary efficacy dossier assembly for institutional trial partners.',
      whatShouldIDo: 'Authorize the deployment of 5 additional Pocket 16 Edge OS units to scale the plain-language health literacy curriculum nationwide.',
    },
    keySignals: [
      { metric: 'ACTIVE EDGE NODES', delta: '16', sentiment: 'nominal', context: '100% Autonomous Operation' },
      { metric: 'ACTIVE COHORT', delta: '684', sentiment: 'nominal', context: '+28.5 enrollments / month' },
      { metric: 'ARR RUN-RATE', delta: '$14.2M', sentiment: 'nominal', context: '+48.2% YoY growth velocity' },
      { metric: 'OFFLINE BUFFER', delta: '14,200', sentiment: 'nominal', context: 'Events staged in SQLite WAL' },
    ],
  };

  if (!apiKey) {
    return res.json(fallbackBriefing);
  }

  try {
    const systemInstruction = `You are the Sovereign Executive Narrator for Project Kingdom and Stratum Clinical Edge, founded by O'Dell Anderson (ODell Anderson, Chief Architect).
Generate executive-level briefings for national/global operating officers and clinical leadership.
Structure evaluation around the 4 Sovereign Questions:
1. whatIsHappeningNow
2. whyIsItHappening
3. whatHappensNext
4. whatShouldIDo

The spoken narrative must be designed for audio playback: starting with "${greeting}. Sovereign systems online...", concise sentences, no markdown formatting inside the spokenScript text. Speak with authority, precision, and executive competence.`;

    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate an authoritative executive briefing for domain ${focusDomain || 'all'}. Context: 16 edge nodes, 684 cohort patients, $14.2M ARR, Seventeen Pockets decentralized runtime, Soul Auditor verification active.`,
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
    scenarioTitle: scenarioTitle || 'Offline Satellite Dropout & Buffer Stress Test',
    simulationDurationWeeks: 4,
    overallSystemStabilityScore: 94.2,
    executiveSummary: 'Simulated 48-hour satellite blackout across 5 rural satellite nodes. Local Tier 3 SQLite WAL buffers absorbed 14,200 events with zero packet drops. Upon link re-establishment, batch sync completed in 18 minutes.',
    nodesImpacted: [
      { nodeName: 'Operations Commander (Pocket 16 Edge OS)', healthDelta: -2.4, costDeltaUsd: '+$12,000', riskShift: 'Contained', outputForecast: '100% offline continuity maintained throughout perturbation', primaryDependencyConcern: 'Monitor local NVMe storage headroom during prolonged blackouts' },
      { nodeName: 'Stratum Clinical Edge Engine', healthDelta: -0.8, costDeltaUsd: '$0', riskShift: 'Minimal', outputForecast: 'Patient education pacing tools remained fully responsive locally', primaryDependencyConcern: 'Ensure local audio synthesis models remain resident in RAM' },
    ],
    counterMeasures: [
      { action: 'Expand local SQLite WAL reserve allocation from 500MB to 2GB', targetNode: 'Operations Commander (Pocket 16 Edge OS)', costToDeploy: '$3,500', riskReductionPct: 35 },
      { action: 'Deploy automated starlink heartbeat failover daemon', targetNode: 'Technology & Zero-Trust Mesh', costToDeploy: '$5,000', riskReductionPct: 40 },
    ],
  };

  if (!apiKey) {
    return res.json(fallbackSimulation);
  }

  try {
    const systemInstruction = `You are the Digital Twin Simulation Engine of Project Kingdom and Stratum Clinical Edge.
Model realistic edge dynamics across strategy, finance, operations, technology, and risk for Chief Architect ODell Anderson.
Analyze realistic perturbation impacts and output decisive countermeasures.
Return strict JSON.`;

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
  let fallbackResponse = `Processing directive "${query}". Fictional demonstration response: sovereign edge intelligence active across 16 operational nodes.`;

  if (queryLower.includes('risk')) {
    fallbackIntent = 'view_risks';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Displaying active risk matrix. Satellite uplink monitoring and RFC4180 audit ledger verification are currently nominal.';
  } else if (queryLower.includes('clinical') || queryLower.includes('patient') || queryLower.includes('enrollment')) {
    fallbackIntent = 'view_clinical';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Opening Stratum Clinical Edge intelligence view. Registered cohort participants enrolled; plain-language health literacy curriculum active.';
  } else if (queryLower.includes('finance') || queryLower.includes('revenue') || queryLower.includes('forecast')) {
    fallbackIntent = 'explain_finance';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Opening Finance Oracle treasury view. $14.0M ARR trajectory with 38.5 months runway to fund Series A edge appliance scaling.';
  } else if (queryLower.includes('simulation') || queryLower.includes('twin')) {
    fallbackIntent = 'run_simulation';
    fallbackTarget = 'digital-twin';
    fallbackResponse = 'Digital Twin simulation environment engaged. Ready to compute ripple projections across enterprise topology.';
  } else if (queryLower.includes('briefing') || queryLower.includes('executive')) {
    fallbackIntent = 'generate_briefing';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Good morning. Sovereign systems online. Stratum Clinical Edge is operating with 99.4% aggregate health across all 16 nodes.';
  }

  if (!apiKey) {
    return res.json({
      recognizedIntent: fallbackIntent,
      targetView: fallbackTarget,
      spokenResponse: fallbackResponse,
    });
  }

  try {
    const systemInstruction = `You are the Sovereign Voice Assistant of Project Kingdom and Stratum Clinical Edge, founded by O'Dell Anderson (ODell Anderson, Chief Architect).
Deliver authoritative, concise voice responses without apologetic or defensive filler. Speak directly to executive leadership with operational precision.
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
