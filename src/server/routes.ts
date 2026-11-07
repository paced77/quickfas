import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import {
  validateKingdomTelemetry,
  AnyKingdomEvent,
} from '../schemas/events.ts';

dotenv.config();

export const app = express();
app.use(express.json());

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
      eventId: 'evt-hlth-001',
      eventType: 'system.health',
      domain: 'infrastructure',
      severity: 'nominal',
      source: 'kingdom-cluster-uswest',
      correlationId: 'corr-init-01',
      timestamp: new Date(now.getTime() - 120000).toISOString(),
      metadata: { cluster: 'omega-1', version: '2027.4' },
      payload: {
        status: 'optimal',
        uptimeSeconds: 849200,
        latencyMs: 83,
        errorsPerMin: 0.02,
        cpuUtilization: 34.2,
        memoryUtilization: 48.7,
        availabilityPct: 99.992,
      },
    },
    {
      eventId: 'evt-clin-002',
      eventType: 'clinical.enrollment',
      domain: 'clinical',
      severity: 'nominal',
      source: 'clinical-mesh-orchestrator',
      correlationId: 'corr-init-02',
      timestamp: new Date(now.getTime() - 90000).toISOString(),
      metadata: { protocol: 'ONC-904', phase: 'Phase-III' },
      payload: {
        studyId: 'STUDY-ONC-904',
        studyName: 'Neo-Adjuvant Immunotherapy Multi-Center',
        siteId: 'SITE-MAYO-08',
        currentEnrollment: 684,
        targetEnrollment: 720,
        velocityPpm: 28.5,
        healthPct: 98.4,
        fhirTransactionsPerSec: 142.8,
      },
    },
    {
      eventId: 'evt-fin-003',
      eventType: 'finance.forecast_update',
      domain: 'finance',
      severity: 'nominal',
      source: 'finance-oracle-stream',
      correlationId: 'corr-init-03',
      timestamp: new Date(now.getTime() - 60000).toISOString(),
      metadata: { quarter: 'Q4', currency: 'USD' },
      payload: {
        mrrUsd: 14200000,
        forecastGrowthPct: 24.8,
        burnRateUsdPerMonth: 2100000,
        runwayMonths: 38.5,
        pipelineValueUsd: 84500000,
        variancePct: 2.1,
      },
    },
    {
      eventId: 'evt-risk-004',
      eventType: 'risk.detected',
      domain: 'clinical',
      severity: 'warning',
      source: 'risk-sentinel-daemon',
      correlationId: 'corr-init-04',
      timestamp: new Date(now.getTime() - 30000).toISOString(),
      metadata: { tier: 'tier-2-escalation' },
      payload: {
        category: 'clinical',
        headline: 'Site 14 Zurich: Minor biostorage temperature excursion risk',
        probability: 0.22,
        impactRating: 6.2,
        riskScore: 48.5,
        mitigationStrategy: 'Automated backup compressor switchover + courier audit dispatch',
        ownerAgent: 'Risk Sentinel',
      },
    },
    {
      eventId: 'evt-agent-005',
      eventType: 'agent.recommendation',
      domain: 'ai',
      severity: 'nominal',
      source: 'sovereign-strategist-engine',
      correlationId: 'corr-init-05',
      timestamp: new Date(now.getTime() - 10000).toISOString(),
      metadata: { confidenceTier: 'high' },
      payload: {
        agentName: 'Sovereign Strategist',
        confidenceScore: 0.96,
        executionTimeMs: 142,
        recommendation: 'Advance Phase III clinical endpoint review window by 14 days based on high-velocity Mayo & Charite cohort stabilization.',
        impact: 'transformative',
        rationale: 'Telemetry indicates sample integrity confidence above 99.4%, saving approximately 3.2M USD in operational runway.',
      },
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

seedInitialTelemetry();

// Background Telemetry Pulse Generator
setInterval(() => {
  const sources = [
    {
      eventType: 'system.health',
      domain: 'infrastructure',
      severity: 'nominal',
      source: 'infra-telemetry-probe',
      payload: {
        status: 'optimal',
        uptimeSeconds: Math.floor(849200 + Date.now() / 1000),
        latencyMs: Math.floor(75 + Math.random() * 18),
        errorsPerMin: +(Math.random() * 0.05).toFixed(3),
        cpuUtilization: +(30 + Math.random() * 12).toFixed(1),
        memoryUtilization: +(46 + Math.random() * 8).toFixed(1),
        availabilityPct: 99.992,
      },
    },
    {
      eventType: 'clinical.fhir_tx',
      domain: 'clinical',
      severity: 'nominal',
      source: 'fhir-gateway-v4',
      payload: {
        studyId: 'STUDY-CARDIO-402',
        studyName: 'Vascular Biomarker Continuous Ingestion',
        siteId: 'SITE-JOHNS-HOPKINS-02',
        currentEnrollment: 412,
        targetEnrollment: 450,
        velocityPpm: +(22 + Math.random() * 8).toFixed(1),
        healthPct: +(97 + Math.random() * 2.5).toFixed(1),
        fhirTransactionsPerSec: +(130 + Math.random() * 40).toFixed(1),
      },
    },
    {
      eventType: 'ops.capacity_update',
      domain: 'operations',
      severity: 'nominal',
      source: 'ops-controller-daemon',
      payload: {
        subsystem: 'Clinical Assay Processing Core',
        capacityPct: +(82 + Math.random() * 8).toFixed(1),
        utilizationPct: +(74 + Math.random() * 9).toFixed(1),
        throughputPerHr: Math.floor(1800 + Math.random() * 300),
        activeTasks: Math.floor(34 + Math.random() * 8),
        statusSummary: 'Nominal queue throughput with sub-90ms job dispatch',
      },
    },
    {
      eventType: 'agent.recommendation',
      domain: 'ai',
      severity: 'nominal',
      source: 'council-dispatcher',
      payload: {
        agentName: 'Finance Oracle',
        confidenceScore: +(0.94 + Math.random() * 0.05).toFixed(2),
        executionTimeMs: Math.floor(110 + Math.random() * 60),
        recommendation: 'Reallocate 850k USD from static EU hosting to high-density edge compute for direct Zurich genomics pipeline.',
        impact: 'high',
        rationale: 'Reduces transit latency from 140ms to 28ms while preserving 22% margin expansion.',
      },
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
    metadata: { synthesized: true, environment: 'production-sovereign' },
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

// Helper router support: supports routes both with and without "/api" prefix (for Vercel rewrites)
const router = express.Router();

// 1. Health Status endpoint
const handleHealth = (req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '2027.Sovereign.OS',
    timestamp: new Date().toISOString(),
    eventBusActive: true,
    geminiConfigured: !!apiKey,
  });
};
router.get('/health', handleHealth);
router.get('/api/health', handleHealth);

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
    timestamp: new Date().toISOString(),
  });
};
router.get('/telemetry/events', handleTelemetryEvents);
router.get('/api/telemetry/events', handleTelemetryEvents);

// 3. Telemetry Injector
const handleTelemetryInject = (req: Request, res: Response) => {
  const incoming = req.body;
  validationStats.totalReceived++;

  const val = validateKingdomTelemetry(incoming);
  if (val.success && val.event) {
    eventHistory.unshift(val.event);
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
router.post('/telemetry/inject', handleTelemetryInject);
router.post('/api/telemetry/inject', handleTelemetryInject);

// Fallback Council Deliberation generator
function generateFallbackDeliberation(agendaTopic: string) {
  return {
    agenda: agendaTopic,
    consensusScorePct: 94.6,
    impactTier: 'Transformative',
    executiveDirective: `Consensus directive: Accelerate Phase-III clinical endpoint closure by 14 days; reallocate $850k into Zurich edge inference nodes to eliminate FHIR verification latency.`,
    coreAnswers: {
      whatIsHappeningNow: `Cross-site patient enrollment has achieved 684/720 targets with ingestion velocity of 28.5 patients/month across Mayo and Charite nodes.`,
      whyIsItHappening: `Automated zero-trust FHIR ingestion eliminated manual site validation delays, causing site velocity to exceed original protocol assumptions by 32%.`,
      whatHappensNext: `Without edge compute rebalancing, intercontinental transit latency will exceed 110ms as secondary European cohorts commence genomics upload.`,
      whatShouldIDo: `Authorize the Sovereign AI Council directive to pre-deploy high-density edge compute in Zurich and advance regulatory dossier synchronization.`,
    },
    agentDeliberations: [
      {
        agentName: 'Sovereign Strategist',
        role: 'Executive Strategy',
        verdict: 'Accelerate',
        argument: 'Advancing the milestone provides an uncontested first-to-file window before global oncology congress reviews.',
        confidence: 0.96,
      },
      {
        agentName: 'Finance Oracle',
        role: 'Capital & Treasury',
        verdict: 'Endorse',
        argument: 'Reallocating $850k from idle hosting reserves reduces total burn by $3.2M over the clinical trial lifecycle.',
        confidence: 0.98,
      },
      {
        agentName: 'Clinical Director',
        role: 'Clinical Mesh',
        verdict: 'Endorse',
        argument: 'Sample integrity confidence is at 99.4% with zero protocol deviations logged across the last 140 patients.',
        confidence: 0.94,
      },
      {
        agentName: 'Risk Sentinel',
        role: 'Threat Posture',
        verdict: 'Caution',
        argument: 'Must ensure backup nitrogen compressor in Zurich maintains continuous telemetry during computational load spike.',
        confidence: 0.92,
      },
      {
        agentName: 'Operations Commander',
        role: 'Throughput',
        verdict: 'Accelerate',
        argument: 'Assay pipeline queue capacity sits at 74%, well within safe operational limits for the 35% velocity increase.',
        confidence: 0.97,
      },
      {
        agentName: 'Compliance Guardian',
        role: 'Regulatory Invariants',
        verdict: 'Endorse',
        argument: 'Automated cryptographic audit proof package generation satisfies FDA 21 CFR Part 11 and EMA requirements.',
        confidence: 0.99,
      },
      {
        agentName: 'Security Sentinel',
        role: 'Zero-Trust Defense',
        verdict: 'Endorse',
        argument: 'mTLS certificate pinning and HSM key rotation confirmed across all Mayo and Zurich ingestion points.',
        confidence: 0.99,
      },
    ],
    actionableInterventions: [
      {
        id: 'ACT-01',
        title: 'Deploy Zurich High-Density Genomics Edge Enclave',
        timeframe: 'Immediate (24h)',
        projectedGain: '+3.2M USD Runway',
        riskRating: 'Low (Compensated)',
      },
      {
        id: 'ACT-02',
        title: 'Synchronize EMA Dossier Protocol Addendum',
        timeframe: 'Day +3',
        projectedGain: '14 Days Fast-Track',
        riskRating: 'Minimal',
      },
      {
        id: 'ACT-03',
        title: 'Dispatch On-Site Zurich Biostorage Sensor Audit',
        timeframe: 'Day +5',
        projectedGain: 'Risk Zeroed',
        riskRating: 'Nominal',
      },
    ],
  };
}

// 4. AI Council Deliberation Chamber
const handleCouncilDeliberation = async (req: Request, res: Response) => {
  const { agendaTopic, contextData } = req.body;
  const promptAgenda = agendaTopic || 'Phase III Oncology Study Site Bottleneck vs Q3 Global Milestone Acceleration';

  if (!apiKey) {
    return res.json(generateFallbackDeliberation(promptAgenda));
  }

  try {
    const systemInstruction = `You are the Sovereign AI Council of Project Kingdom — an elite 2027+ Sovereign Intelligence Operating System.
You embody the 7 permanent Sovereign AI leaders:
1. Sovereign Strategist: Executive guidance, existential positioning, strategic horizon.
2. Finance Oracle: Cash flow, capital efficiency, revenue trajectory, valuation leverage.
3. Clinical Director: Patient safety, study integrity, enrollment velocity, FHIR ingestion.
4. Risk Sentinel: Unmitigated exposures, vulnerabilities, operational shock tolerance.
5. Operations Commander: Execution tempo, workflow friction, capacity bottlenecks.
6. Compliance Guardian: Regulatory audit posture, FDA/EMA rigor, data governance.
7. Security Sentinel: Cybersecurity, cryptographic provenance, zero-trust integrity.

Analyze the strategic agenda with realistic domain tension.
Formulate a decisive consensus resolution answering the 4 Sovereign Questions:
- whatIsHappeningNow
- whyIsItHappening
- whatHappensNext
- whatShouldIDo

Return pure JSON.`;

    const userPrompt = `AGENDA FOR SOVEREIGN COUNCIL:
${promptAgenda}

TELEMETRY CONTEXT:
System Health: 98.4%, 34 Active Agents, 2 Strategic Risks, Latency 83ms, Forecast Accuracy 95.8%.
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
router.post('/gemini/council-deliberation', handleCouncilDeliberation);
router.post('/api/gemini/council-deliberation', handleCouncilDeliberation);

// 5. Executive Spoken Briefing
const handleExecutiveBriefing = async (req: Request, res: Response) => {
  const { timeOfDay, focusDomain } = req.body;
  const greeting = timeOfDay || 'Good morning';

  const fallbackBriefing = {
    headline: 'All Kingdom Systems Nominal · Clinical Endpoint Acceleration Approved',
    statusSummary: 'Multi-center clinical trial velocity exceeds protocol baseline by 32%. Revenue trajectory tracks at $14.2M MRR with 38.5 months runway. Two strategic risks actively monitored with automated failover.',
    spokenScript: `${greeting}. Kingdom systems online. Clinical operations stable. Revenue forecast increased. Two strategic risks require review. Overall system health remains above target.`,
    coreAnswers: {
      whatIsHappeningNow: 'Multi-center clinical operations are executing with sub-90ms ingestion across Mayo and Charite nodes. Cohort enrollment is at 684 out of 720 patients.',
      whyIsItHappening: 'Automated FHIR pipelines have removed manual site verification lag, increasing monthly patient intake velocity to 28.5 patients per month.',
      whatHappensNext: 'Phase III protocol milestone will be achieved 14 calendar days ahead of schedule, enabling expedited submission package generation.',
      whatShouldIDo: 'Authorize the Sovereign AI Council directive to pre-allocate $850k into Zurich edge genomics processing to maintain real-time analysis parity.',
    },
    keySignals: [
      {
        metric: 'REVENUE / MRR',
        delta: '$14.2M',
        sentiment: 'positive',
        context: '+24.8% YoY Growth',
      },
      {
        metric: 'CLINICAL VELOCITY',
        delta: '28.5 / mo',
        sentiment: 'positive',
        context: '684 / 720 Enrolled',
      },
      {
        metric: 'SYSTEM LATENCY',
        delta: '83ms',
        sentiment: 'nominal',
        context: '142.8 FHIR tx/s',
      },
      {
        metric: 'STRATEGIC RISKS',
        delta: '2 Active',
        sentiment: 'warning',
        context: 'Zurich Biostorage & EMA',
      },
    ],
  };

  if (!apiKey) {
    return res.json(fallbackBriefing);
  }

  try {
    const systemInstruction = `You are the Sovereign Executive Narrator for Project Kingdom.
Generate executive-level briefings for national/global operating officers in 2027.
Structure evaluation around the 4 Sovereign Questions:
1. whatIsHappeningNow
2. whyIsItHappening
3. whatHappensNext
4. whatShouldIDo

The spoken narrative must be designed for audio playback: starting with "${greeting}. Kingdom systems online...", concise sentences, no markdown formatting inside the spokenScript text.`;

    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate Sovereign Executive Briefing. Domain: ${focusDomain || 'all'}. Status: Clinical stable 98.4%, Revenue $14.2M MRR (+24.8%), 2 strategic risks monitored.`,
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
router.post('/gemini/executive-briefing', handleExecutiveBriefing);
router.post('/api/gemini/executive-briefing', handleExecutiveBriefing);

// 6. Enterprise Digital Twin Scenario Simulation
const handleSimulation = async (req: Request, res: Response) => {
  const { scenarioTitle, perturbationType, magnitudePct } = req.body;

  const fallbackSimulation = {
    scenarioTitle: scenarioTitle || 'Accelerated Multi-Center Patient Enrollment Surge',
    simulationDurationWeeks: 8,
    overallSystemStabilityScore: 92.4,
    executiveSummary: `Simulation projects a 35% surge in clinical patient volume. Clinical Intelligence absorbs the influx without protocol deviations, while Operations capacity tightens to 88%. Net financial outcome remains accretive (+18% valuation leverage).`,
    nodesImpacted: [
      {
        nodeName: 'Clinical Intelligence',
        healthDelta: 1.8,
        costDeltaUsd: '+$140k/mo',
        riskShift: 'Nominal',
        outputForecast: 'Cohort completion accelerated by 18 days',
        primaryDependencyConcern: 'Requires +40 FHIR gateway worker threads',
      },
      {
        nodeName: 'Operations Commander',
        healthDelta: -4.2,
        costDeltaUsd: '+$85k/mo',
        riskShift: 'Elevated',
        outputForecast: 'Assay capacity utilization reaches 88%',
        primaryDependencyConcern: 'Reagent buffer drops to 14 days stock',
      },
      {
        nodeName: 'Finance Oracle',
        healthDelta: 0.6,
        costDeltaUsd: '-$120k/mo',
        riskShift: 'Decreased',
        outputForecast: 'Runway expands to 41.2 months via earlier trial wrap',
        primaryDependencyConcern: 'None (Self-sustaining)',
      },
      {
        nodeName: 'Technology Fabric',
        healthDelta: -0.8,
        costDeltaUsd: '+$35k/mo',
        riskShift: 'Nominal',
        outputForecast: 'Latency maintains 88ms with autoscaling',
        primaryDependencyConcern: 'Zurich edge node CPU peak at 62%',
      },
      {
        nodeName: 'Sovereign Core (CEO)',
        healthDelta: 2.4,
        costDeltaUsd: '$0',
        riskShift: 'Decreased',
        outputForecast: 'First-to-file regulatory advantage secured',
        primaryDependencyConcern: 'Executive alignment with EMA dossier review',
      },
    ],
    counterMeasures: [
      {
        action: 'Pre-order 60-day reagent buffer from primary Swiss supplier',
        targetNode: 'Operations Commander',
        costToDeploy: '$45,000',
        riskReductionPct: 78,
      },
      {
        action: 'Spin up 4 additional zero-trust FHIR worker pods in Zurich',
        targetNode: 'Technology Fabric',
        costToDeploy: '$8,500/mo',
        riskReductionPct: 92,
      },
      {
        action: 'Lock in milestone payment disbursement with clinical sponsor',
        targetNode: 'Finance Oracle',
        costToDeploy: '$0',
        riskReductionPct: 85,
      },
    ],
  };

  if (!apiKey) {
    return res.json(fallbackSimulation);
  }

  try {
    const systemInstruction = `You are the Digital Twin Simulation Engine of Project Kingdom.
Cascading ripple effects across: Sovereign Core (CEO), Clinical Intelligence, Finance Oracle, Operations Commander, Technology Fabric.
Return strict JSON.`;

    const userPrompt = `SCENARIO TO SIMULATE:
Title: ${scenarioTitle || 'Accelerated Multi-Center Patient Enrollment Surge'}
Perturbation: ${perturbationType || 'clinical_velocity_surge'}
Magnitude: ${magnitudePct || 35}%`;

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
router.post('/gemini/simulation', handleSimulation);
router.post('/api/gemini/simulation', handleSimulation);

// 7. Voice Command & Strategic Query Engine
const handleVoiceQuery = async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const queryLower = query.toLowerCase();
  let fallbackIntent = 'sovereign_answer';
  let fallbackTarget = 'war-room';
  let fallbackResponse = `Processing directive "${query}". System health is 98% and all 24 missions are progressing nominally.`;

  if (queryLower.includes('risk')) {
    fallbackIntent = 'view_risks';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Displaying strategic risks. Two items monitored: Zurich biostorage micro-drift and EU-US cross-border FHIR surveillance.';
  } else if (queryLower.includes('clinical') || queryLower.includes('patient') || queryLower.includes('enrollment')) {
    fallbackIntent = 'view_clinical';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Opening Clinical Command. Mayo and Charite cohorts are tracking at 28.5 patients per month, 32% above baseline.';
  } else if (queryLower.includes('finance') || queryLower.includes('revenue') || queryLower.includes('forecast')) {
    fallbackIntent = 'explain_finance';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Revenue trajectory stands at 14.2 million MRR with 38.5 months of runway. Gross margin expanded to 78.4%.';
  } else if (queryLower.includes('simulation') || queryLower.includes('twin')) {
    fallbackIntent = 'run_simulation';
    fallbackTarget = 'digital-twin';
    fallbackResponse = 'Digital Twin simulation environment engaged. Ready to compute ripple projections across enterprise topology.';
  } else if (queryLower.includes('briefing') || queryLower.includes('executive')) {
    fallbackIntent = 'generate_briefing';
    fallbackTarget = 'war-room';
    fallbackResponse = 'Good morning. Kingdom systems online. Clinical operations stable. Revenue forecast increased. Overall health remains optimal.';
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
router.post('/gemini/voice-query', handleVoiceQuery);
router.post('/api/gemini/voice-query', handleVoiceQuery);

// Mount router on app
app.use(router);
