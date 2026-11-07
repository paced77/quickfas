import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ShieldAlert, Pause, Play, Filter, RefreshCw, Code, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { AnyKingdomEvent } from '../schemas/events.ts';
import { audioEngine } from '../services/audioEngine.ts';

interface TelemetryStats {
  totalReceived: number;
  validCount: number;
  rejectedCount: number;
  lastRejectedReason: string | null;
}

export const TelemetryFeed: React.FC = () => {
  const [events, setEvents] = useState<AnyKingdomEvent[]>([]);
  const [stats, setStats] = useState<TelemetryStats>({
    totalReceived: 0,
    validCount: 0,
    rejectedCount: 0,
    lastRejectedReason: null,
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [dataMode, setDataMode] = useState<string>('awaiting_ingestion');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [showSchemaDoc, setShowSchemaDoc] = useState<boolean>(false);
  const [injectionFeedback, setInjectionFeedback] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const url = selectedDomain === 'all'
        ? '/api/telemetry/events'
        : `/api/telemetry/events?domain=${selectedDomain}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setDataMode(data.dataMode || 'awaiting_ingestion');
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      // offline or dev reload
    }
  };

  useEffect(() => {
    fetchEvents();
    if (isPaused) return;

    const interval = setInterval(() => {
      fetchEvents();
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, selectedDomain]);

  // Inject a valid compliant event
  const handleInjectValidEvent = async () => {
    audioEngine.playPositiveSignal();
    const validPayload = {
      eventId: `evt-cli-${Date.now().toString(36)}`,
      eventType: 'clinical.enrollment',
      domain: 'clinical',
      severity: 'nominal',
      source: 'synthetic-contract-test',
      correlationId: `corr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: { dataClassification: 'synthetic_demo', testHarness: 'TEL-003-Valid' },
      payload: {
        studyId: 'SYNTHETIC-TEST',
        studyName: 'Synthetic contract test fixture',
        siteId: 'SYNTHETIC-TEST',
        currentEnrollment: 692,
        targetEnrollment: 720,
        velocityPpm: 29.4,
        healthPct: 99.1,
        fhirTransactionsPerSec: 154.2,
      },
    };

    try {
      const res = await fetch('/api/telemetry/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const data = await res.json();
      if (res.ok) {
        audioEngine.playCompletionSignal();
        setInjectionFeedback('TEL-002 PASS: synthetic test fixture validated and added to the in-memory event feed.');
      } else {
        setInjectionFeedback(`Error: ${data.message}`);
      }
      fetchEvents();
    } catch {
      setInjectionFeedback('Network failure injecting telemetry');
    }
  };

  // Inject a deliberate INVALID event (negative latency and missing fields) to prove Zod rejection
  const handleInjectInvalidEvent = async () => {
    audioEngine.playWarningSignal();
    const invalidPayload = {
      eventId: `evt-bad-${Date.now().toString(36)}`,
      eventType: 'system.health',
      domain: 'infrastructure',
      severity: 'nominal',
      source: 'faulty-probe',
      correlationId: `corr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: { testHarness: 'TEL-003-Invalid-Injection' },
      payload: {
        status: 'optimal',
        uptimeSeconds: 100,
        latencyMs: -45, // INVALID: negative latency violates z.number().nonnegative()
        // MISSING required fields: cpuUtilization, memoryUtilization, etc.
      },
    };

    try {
      const res = await fetch('/api/telemetry/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });
      const data = await res.json();
      if (res.status === 422) {
        setInjectionFeedback(`TEL-002 REJECTED AS DESIGNED: "${data.error}"`);
      } else {
        setInjectionFeedback('Unexpectedly accepted invalid event');
      }
      fetchEvents();
    } catch {
      setInjectionFeedback('Network error');
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 mb-6">
      {/* Header & Observability Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Telemetry Fabric // Event Intake &amp; Validation</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Authenticated event intake with strict Zod contract validation. Event history is process-local and resets when the server restarts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSchemaDoc(!showSchemaDoc)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/40 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showSchemaDoc ? 'Hide Schemas' : 'TEL-001 Contracts'}</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>

      <div
        role="status"
        className={`mb-4 rounded-lg border px-3 py-2 text-xs leading-5 ${
          dataMode === 'synthetic_demo'
            ? 'border-amber-400/30 bg-amber-950/30 text-amber-100'
            : 'border-cyan-400/20 bg-cyan-950/20 text-cyan-100'
        }`}
      >
        {dataMode === 'synthetic_demo'
          ? 'Synthetic demo mode is enabled. All generated events are illustrative fixtures, not live clinical or operational data.'
          : 'No synthetic stream is running. Events appear only after an authenticated operator submits a validated event. No EHR or external clinical system is connected.'}
        {' '}Storage: process memory only; this feed is not a durable audit log.
      </div>

      {/* Zod Validation Stats Banner (TEL-002) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#050811]/80 rounded-lg p-3 border border-white/5">
          <span className="text-[10px] font-mono text-slate-500 block uppercase">
            Total Ingested
          </span>
          <span className="text-base font-bold font-mono text-white tabular-nums">
            {stats.totalReceived} Events
          </span>
        </div>

        <div className="bg-[#050811]/80 rounded-lg p-3 border border-emerald-500/20">
          <span className="text-[10px] font-mono text-emerald-400 block uppercase">
            TEL-002 Zod Passed
          </span>
          <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
            {stats.validCount} Validated
          </span>
        </div>

        <div className="bg-[#050811]/80 rounded-lg p-3 border border-amber-500/20">
          <span className="text-[10px] font-mono text-amber-400 block uppercase">
            Contract Violations
          </span>
          <span className="text-base font-bold font-mono text-amber-300 tabular-nums">
            {stats.rejectedCount} Rejected
          </span>
        </div>

        <div className="bg-[#050811]/80 rounded-lg p-3 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-400 block uppercase">
            Contract Compliance
          </span>
          <span className="text-base font-bold font-mono text-cyan-300 tabular-nums">
            {stats.totalReceived > 0
              ? `${((stats.validCount / stats.totalReceived) * 100).toFixed(1)}%`
              : '—'}
          </span>
        </div>
      </div>

      {/* TEL-003 Contract Testing Harness */}
      <div className="bg-black/30 rounded-lg p-3.5 border border-white/5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
            TEL-003 Contract Testing Harness
          </span>
          <p className="text-xs text-slate-300 mt-0.5">
            Test Zod contract enforcement with clearly synthetic fixtures. This does not create or simulate a real patient record.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInjectValidEvent}
            className="px-3 py-1.5 rounded text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors"
          >
            Inject Synthetic Test Fixture
          </button>
          <button
            onClick={handleInjectInvalidEvent}
            className="px-3 py-1.5 rounded text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/60 transition-colors"
          >
            Inject Malformed Payload
          </button>
        </div>
      </div>

      {/* Injection Feedback Notification */}
      {injectionFeedback && (
        <div className="mb-4 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center justify-between">
          <span>{injectionFeedback}</span>
          <button
            onClick={() => setInjectionFeedback(null)}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Schema Contract Documentation Modal / Expandable (TEL-001 / TEL-005) */}
      {showSchemaDoc && (
        <div className="mb-4 p-4 rounded-xl bg-[#040711] border border-cyan-500/40 text-xs font-mono text-slate-300 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-cyan-400 font-bold">TEL-001 & TEL-005: KINGDOM SCHEMA SPECIFICATIONS</span>
            <span className="text-slate-500 text-[11px]">Strict Zod Validated</span>
          </div>
          <pre className="text-[11px] leading-relaxed text-cyan-300/90 overflow-x-auto p-2 bg-black/60 rounded">
{`// Base Event Schema
BaseKingdomEvent = z.object({
  eventId: z.string().min(1),
  timestamp: z.string().datetime(),
  source: z.string().min(1),
  correlationId: z.string().min(1),
  domain: z.enum(['clinical', 'operations', 'finance', 'infrastructure', 'ai']),
  severity: z.enum(['info', 'nominal', 'warning', 'critical']),
  metadata: z.record(z.string(), z.unknown()),
})

// Sub-schemas:
HealthEventSchema: status, uptime, latencyMs >= 0, errorsPerMin, cpu, memory, availability
ClinicalEventSchema: studyId, studyName, siteId, currentEnrollment, targetEnrollment, velocityPpm
RiskEventSchema: category, probability [0..1], impactRating [1..10], mitigationStrategy`}
          </pre>
        </div>
      )}

      {/* Domain Filter Bar */}
      <div className="flex items-center gap-1.5 pb-3 border-b border-white/5 mb-3 overflow-x-auto text-xs">
        <span className="text-slate-500 font-mono text-[11px] mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {['all', 'clinical', 'finance', 'operations', 'infrastructure', 'ai'].map((dom) => (
          <button
            key={dom}
            onClick={() => {
              setSelectedDomain(dom);
              audioEngine.playPositiveSignal();
            }}
            className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
              selectedDomain === dom
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* Live Events Table */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {events.length > 0 ? (
          events.map((evt) => {
            let badgeBg = 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40';
            if (evt.severity === 'warning') badgeBg = 'bg-amber-950/60 text-amber-300 border-amber-800/40';
            if (evt.severity === 'critical') badgeBg = 'bg-red-950/60 text-red-300 border-red-800/40';

            return (
              <div
                key={evt.eventId}
                className="bg-[#050811]/60 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-colors text-xs"
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/5 mb-2 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] tabular-nums">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-200 font-bold">{evt.eventType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold ${badgeBg}`}>
                      {evt.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">{evt.domain}</span>
                  </div>
                </div>

                {/* Event Summary rendering */}
                <div className="text-slate-300 font-mono text-[11px] leading-relaxed">
                  {evt.eventType === 'system.health' && (
                    <span>
                      Latency: <span className="text-cyan-300">{(evt as any).payload.latencyMs}ms</span> · CPU: {(evt as any).payload.cpuUtilization}% · Memory: {(evt as any).payload.memoryUtilization}% · Availability: {(evt as any).payload.availabilityPct}%
                    </span>
                  )}
                  {evt.eventType === 'clinical.enrollment' && (
                    <span>
                      Study: <span className="text-cyan-300">{(evt as any).payload.studyName}</span> · Enrolled: {(evt as any).payload.currentEnrollment} / {(evt as any).payload.targetEnrollment} · Velocity: {(evt as any).payload.velocityPpm} pts/mo · Ingestion: {(evt as any).payload.fhirTransactionsPerSec} tx/s
                    </span>
                  )}
                  {evt.eventType === 'clinical.fhir_tx' && (
                    <span>
                      FHIR Gateway: Ingesting <span className="text-cyan-300">{(evt as any).payload.fhirTransactionsPerSec} tx/s</span> for {(evt as any).payload.studyName}
                    </span>
                  )}
                  {evt.eventType === 'finance.forecast_update' && (
                    <span>
                      MRR: <span className="text-emerald-400">${((evt as any).payload.mrrUsd / 1000000).toFixed(1)}M</span> · Runway: {(evt as any).payload.runwayMonths} mos · Growth: +{(evt as any).payload.forecastGrowthPct}%
                    </span>
                  )}
                  {evt.eventType === 'risk.detected' && (
                    <span className="text-amber-200">
                      Headline: {(evt as any).payload.headline} · Risk Score: {(evt as any).payload.riskScore} · Mitigation: {(evt as any).payload.mitigationStrategy}
                    </span>
                  )}
                  {evt.eventType === 'agent.recommendation' && (
                    <span className="text-indigo-200">
                      Leader: <span className="text-cyan-300 font-bold">{(evt as any).payload.agentName}</span> · Recommendation: {(evt as any).payload.recommendation} (Confidence: {Math.round((evt as any).payload.confidenceScore * 100)}%)
                    </span>
                  )}
                  {evt.eventType === 'ops.capacity_update' && (
                    <span>
                      Subsystem: {(evt as any).payload.subsystem} · Utilization: {(evt as any).payload.utilizationPct}% · Throughput: {(evt as any).payload.throughputPerHr}/hr
                    </span>
                  )}
                </div>

                <div className="mt-2 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Source: {evt.source}</span>
                  <span>ID: {evt.eventId}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-500 text-xs font-mono">
            No events received for domain: {selectedDomain}. Submit a synthetic test fixture or wait for an authenticated event source.
          </div>
        )}
      </div>
    </div>
  );
};
