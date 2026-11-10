export interface SubsystemTelemetry {
  id: string;
  name: string;
  domain: 'clinical' | 'finance' | 'operations' | 'security' | 'infrastructure';
  purpose: string;
  currentState: string;
  healthPct: number;
  latencyMs: number;
  dependencies: string[];
  output: string;
  forecast: string;
  confidence: 'High' | 'Very High' | 'Moderate' | 'Guaranteed';
  velocityMetric?: string;
  impactSentiment: 'positive' | 'nominal' | 'warning';
}

export interface CouncilMember {
  id: string;
  name: string;
  title: string;
  domain: string;
  avatarSeed: string;
  responsibilities: string[];
  status: 'deliberating' | 'monitoring' | 'advising' | 'standby';
  confidenceScore: number;
  recentDirective: string;
  focusMetric: string;
}

export interface StrategicRadarItem {
  id: string;
  title: string;
  quadrant: 'opportunity' | 'risk' | 'growth' | 'forecast';
  distance: number; // 0 to 100 (0 = imminent, 100 = horizon)
  angleDeg: number;
  severityOrImpact: 'critical' | 'high' | 'medium' | 'transformative';
  summary: string;
  recommendedAction: string;
  ownerAgent: string;
}

export interface DigitalTwinNode {
  id: string;
  label: string;
  department: string;
  healthPct: number;
  monthlyCostUsd: string;
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  outputMetric: string;
  dependencies: string[];
  forecastTrend: string;
  telemetryStream: number[];
}

export interface ExecutiveBriefingData {
  headline: string;
  statusSummary: string;
  spokenScript: string;
  coreAnswers: {
    whatIsHappeningNow: string;
    whyIsItHappening: string;
    whatHappensNext: string;
    whatShouldIDo: string;
  };
  keySignals: Array<{
    metric: string;
    delta: string;
    sentiment: string;
    context: string;
  }>;
}

export interface CouncilDeliberationResult {
  agenda: string;
  consensusScorePct: number;
  impactTier: string;
  executiveDirective: string;
  coreAnswers: {
    whatIsHappeningNow: string;
    whyIsItHappening: string;
    whatHappensNext: string;
    whatShouldIDo: string;
  };
  agentDeliberations: Array<{
    agentName: string;
    role: string;
    verdict: string;
    argument: string;
    confidence: number;
  }>;
  actionableInterventions: Array<{
    id: string;
    title: string;
    timeframe: string;
    projectedGain: string;
    riskRating: string;
  }>;
}

export interface SimulationResult {
  scenarioTitle: string;
  simulationDurationWeeks: number | null;
  overallSystemStabilityScore: number | null;
  executiveSummary: string;
  nodesImpacted: Array<{
    nodeName: string;
    healthDelta: number;
    costDeltaUsd: string;
    riskShift: string;
    outputForecast: string;
    primaryDependencyConcern: string;
  }>;
  counterMeasures: Array<{
    action: string;
    targetNode: string;
    costToDeploy: string;
    riskReductionPct: number;
  }>;
}

export interface MissionItem {
  id: string;
  codename: string;
  title: string;
  category: 'clinical' | 'capital' | 'infrastructure' | 'security' | 'expansion';
  leadAgent: string;
  readinessPct: number;
  status: 'active' | 'planning' | 'critical' | 'completed';
  deadline: string;
  impactScore: number; // 1-100
  keyOutcomes: string[];
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  actionExecuted: string;
  status: 'active' | 'paused';
  frequency: string;
  executionsTotal: number;
  successRatePct: number;
}

export interface RealmSector {
  id: string;
  name: string;
  code: string;
  ruler: string;
  readinessPct: number;
  threatLevel: 'Low' | 'Guarded' | 'Elevated' | 'Critical';
  activeInitiatives: number;
  coordinates: { x: number; y: number };
  dependencies: string[];
}
