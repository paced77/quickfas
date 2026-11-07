import { z } from 'zod';

/**
 * PROJECT KINGDOM TELEMETRY FABRIC: TEL-001 EVENT CONTRACTS
 * Strict Zod validation schemas for all telemetry events entering the system.
 */

export const SeveritySchema = z.enum(['info', 'nominal', 'warning', 'critical']);
export type Severity = z.infer<typeof SeveritySchema>;

export const DomainSchema = z.enum(['clinical', 'operations', 'finance', 'infrastructure', 'ai']);
export type Domain = z.infer<typeof DomainSchema>;

// Base Kingdom Event
export const BaseKingdomEventSchema = z.object({
  eventId: z.string().min(1),
  timestamp: z.string().datetime(),
  source: z.string().min(1),
  correlationId: z.string().min(1),
  domain: DomainSchema,
  severity: SeveritySchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
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

// 3. Clinical Telemetry Event
export const ClinicalEventSchema = BaseKingdomEventSchema.extend({
  eventType: z.enum(['clinical.enrollment', 'clinical.study_milestone', 'clinical.fhir_tx']),
  domain: z.literal('clinical'),
  payload: z.object({
    studyId: z.string().min(1),
    studyName: z.string().min(1),
    siteId: z.string().min(1),
    currentEnrollment: z.number().int().nonnegative(),
    targetEnrollment: z.number().int().positive(),
    velocityPpm: z.number(), // patients per month
    healthPct: z.number().min(0).max(100),
    fhirTransactionsPerSec: z.number().nonnegative(),
  }),
});
export type ClinicalEvent = z.infer<typeof ClinicalEventSchema>;

// 4. Risk Event
export const RiskEventSchema = BaseKingdomEventSchema.extend({
  eventType: z.enum(['risk.detected', 'risk.mitigated', 'risk.escalated']),
  domain: DomainSchema,
  payload: z.object({
    category: z.enum(['regulatory', 'clinical', 'financial', 'operational', 'cybersecurity']),
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
  ClinicalEventSchema,
  RiskEventSchema,
  OperationsEventSchema,
  FinanceEventSchema,
]);

export type AnyKingdomEvent = z.infer<typeof KingdomEventUnionSchema>;

/**
 * TEL-002: ZOD VALIDATION STRATEGY
 * Rejects invalid schemas and provides strict error logs.
 */
export function validateKingdomTelemetry(data: unknown): {
  success: boolean;
  event?: AnyKingdomEvent;
  error?: string;
} {
  const result = KingdomEventUnionSchema.safeParse(data);
  if (result.success) {
    return { success: true, event: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '),
  };
}
