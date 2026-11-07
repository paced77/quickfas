import { z } from 'zod';

export const CouncilRequestSchema = z.object({
  agendaTopic: z.string().trim().min(1).max(500).optional(),
  contextData: z.record(z.string(), z.unknown()).optional(),
}).strict().refine((value) => Buffer.byteLength(JSON.stringify(value.contextData ?? {}), 'utf8') <= 16_384);

export const BriefingRequestSchema = z.object({
  timeOfDay: z.string().trim().min(1).max(40).optional(),
  focusDomain: z.string().trim().min(1).max(80).optional(),
}).strict();

export const SimulationRequestSchema = z.object({
  scenarioTitle: z.string().trim().min(1).max(160).optional(),
  perturbationType: z.string().trim().min(1).max(80).optional(),
  magnitudePct: z.number().finite().min(0).max(100).optional(),
}).strict();

export const VoiceRequestSchema = z.object({
  query: z.string().trim().min(1).max(1000),
}).strict();
