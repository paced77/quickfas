import { z } from 'zod';

/**
 * PROJECT KINGDOM TELEMETRY FABRIC: TEL-001 EVENT CONTRACTS
 * Strict Zod validation schemas for all telemetry events entering the system.
 */

export const SeveritySchema = z.enum(['info', 'nominal', 'warning', 'critical']);
export type Severity = z.infer<typeof SeveritySchema>;

export const DomainSchema = z.enum(['operations', 'finance', 'infrastructure', 'ai']);
export type Domain = z.infer<typeof DomainSchema>;

// Base Kingdom Event
export const BaseKingdomEventSchema = z.object({
  eventId: z.string().min(1),
  timestamp: z.string().datetime(),
  source: z.string().min(1),
  correlationId: z.string().min(1),
  domain: DomainSchema,
  severity: SeveritySchema,
  metadata: z.record(
    z.string().max(64),
    z.union([z.string().max(120), z.number().finite(), z.boolean()])
  ).default({}),
});
export type BaseKingdomEvent = z.infer<typeof BaseKingdomEventSchema>;

// 1. System Health Event
export const HealthEventSchema = BaseKingdomEventSchema.extend({
  eventType: z.literal('system.health'),
  domain: z.literal('infrastructure'),
  payload: z.object({
    status: z.enum(['optimal', 'degraded', 'critical']),
    uptimeSeconds: z.number().nonnegative(),
    latencyMs: z.number().nonnegative(),
    errorsPerMin: z.number().nonnegative(),
    cpuUtilization: z.number().min(0).max(100),
    memoryUtilization: z.number().min(0).max(100),
    availabilityPct: z.number().min(0).max(100),
  }),
});
export type HealthEvent = z.infer<typeof HealthEventSchema>;

// 2. AI Agent Event
export const AgentEventSchema = BaseKingdomEventSchema.extend({
  eventType: z.enum(['agent.started', 'agent.completed', 'agent.recommendation', 'agent.alert']),
  domain: z.literal('ai'),
  payload: z.object({
    agentName: z.enum([
      'Sovereign Strategist',
      'Finance Oracle',
      'Clinical Director',
      'Risk Sentinel',
      'Operations Commander',
      'Compliance Guardian',
      'Security Sentinel'
    ]),
    confidenceScore: z.number().min(0).max(1),
    executionTimeMs: z.number().nonnegative(),
    recommendation: z.string().min(1),
    impact: z.enum(['low', 'medium', 'high', 'transformative']),
    rationale: z.string().optional(),
  }),
});
export type AgentEvent = z.infer<typeof AgentEventSchema>;

// Clinical and FHIR telemetry ingestion is intentionally not part of this product.
// Stratum Clinical Edge is an educational experience, not an EHR integration.

// 4. Risk Event
export const RiskEventSchema = BaseKingdomEventSchema.extend({
  eventType: z.enum(['risk.detected', 'risk.mitigated', 'risk.escalated']),
  domain: DomainSchema,
  payload: z.object({
    category: z.enum(['regulatory', 'financial', 'operational', 'cybersecurity']),
    headline: z.string().min(1),
    probability: z.number().min(0).max(1),
    impactRating: z.number().min(1).max(10),
    riskScore: z.number().min(0).max(100),
    mitigationStrategy: z.string().min(1),
    ownerAgent: z.string().min(1),
  }),
});
export type RiskEvent = z.infer<typeof RiskEventSchema>;

// 5. Operations Event
export const OperationsEventSchema = BaseKingdomEventSchema.extend({
  eventType: z.enum(['ops.capacity_update', 'ops.bottleneck_flag', 'ops.workflow_complete']),
  domain: z.literal('operations'),
  payload: z.object({
    subsystem: z.string().min(1),
    capacityPct: z.number().min(0).max(100),
    utilizationPct: z.number().min(0).max(100),
    throughputPerHr: z.number().nonnegative(),
    activeTasks: z.number().int().nonnegative(),
    statusSummary: z.string().min(1),
  }),
});
export type OperationsEvent = z.infer<typeof OperationsEventSchema>;

// 6. Finance Event
export const FinanceEventSchema = BaseKingdomEventSchema.extend({
  eventType: z.enum(['finance.forecast_update', 'finance.runway_alert', 'finance.capital_allocated']),
  domain: z.literal('finance'),
  payload: z.object({
    mrrUsd: z.number().nonnegative(),
    forecastGrowthPct: z.number(),
    burnRateUsdPerMonth: z.number().nonnegative(),
    runwayMonths: z.number().positive(),
    pipelineValueUsd: z.number().nonnegative(),
    variancePct: z.number(),
  }),
});
export type FinanceEvent = z.infer<typeof FinanceEventSchema>;

// Union of all validated Kingdom Events
export const KingdomEventUnionSchema = z.discriminatedUnion('eventType', [
  HealthEventSchema,
  AgentEventSchema,
  RiskEventSchema,
  OperationsEventSchema,
  FinanceEventSchema,
]);

export type AnyKingdomEvent = z.infer<typeof KingdomEventUnionSchema>;

const RESTRICTED_FIELD = /(patient|patientid|patientname|personname|fullname|firstname|lastname|email|phone|address|dateofbirth|dob|mrn|ssn|password|token|secret|credential|diagnosis|medication|symptom|medicalrecord|healthrecord)/i;
const EMAIL_VALUE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const US_PHONE_VALUE = /\b(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}\b/;
const SSN_VALUE = /\b\d{3}-\d{2}-\d{4}\b/;
const BEARER_VALUE = /\bBearer\s+[A-Za-z0-9._~-]{12,}/i;
const JWT_VALUE = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/;

function containsRestrictedTelemetryContent(value: unknown, depth = 0): boolean {
  if (depth > 8) return true;
  if (typeof value === 'string') {
    return EMAIL_VALUE.test(value) || US_PHONE_VALUE.test(value) || SSN_VALUE.test(value)
      || BEARER_VALUE.test(value) || JWT_VALUE.test(value);
  }
  if (Array.isArray(value)) return value.some((item) => containsRestrictedTelemetryContent(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(([key, nested]) => {
      const normalizedKey = key.replace(/[_\-\s]/g, '');
      return RESTRICTED_FIELD.test(normalizedKey) || containsRestrictedTelemetryContent(nested, depth + 1);
    });
  }
  return false;
}

/**
 * TEL-002: ZOD VALIDATION STRATEGY
 * Rejects invalid schemas and provides strict error logs.
 */
export function validateKingdomTelemetry(data: unknown): {
  success: boolean;
  event?: AnyKingdomEvent;
  error?: string;
} {
  const record = data && typeof data === 'object' && !Array.isArray(data)
    ? data as Record<string, unknown>
    : null;
  const metadata = record?.metadata;
  const classification = (metadata as Record<string, unknown>)?.dataClassification;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)
    || (classification !== 'synthetic_demo' && classification !== 'synthetic')) {
    return { success: false, error: 'Telemetry must be explicitly classified as synthetic or synthetic_demo.' };
  }
  if (containsRestrictedTelemetryContent(data)) {
    return { success: false, error: 'Potentially restricted personal health information (PII) is not accepted in telemetry.' };
  }
  const result = KingdomEventUnionSchema.safeParse(data);
  if (result.success) {
    return { success: true, event: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '),
  };
}
