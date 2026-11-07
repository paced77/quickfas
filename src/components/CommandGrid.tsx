import React, { useState } from 'react';
import { Activity, Cpu, Database, ShieldCheck, Zap, ArrowRight, Gauge, CheckCircle2, RefreshCw } from 'lucide-react';
import { SubsystemTelemetry } from '../types/kingdom.ts';
import { audioEngine } from '../services/audioEngine.ts';

interface CommandGridProps {
  onSelectSubsystem?: (subsystem: SubsystemTelemetry) => void;
}

export const initialSubsystems: SubsystemTelemetry[] = [
  {
    id: 'Fictional sample — not connected to live data',
    name: 'Fictional sample — not connected to live data',
    domain: 'clinical',
    purpose: 'Fictional sample — not connected to live data',
    currentState: 'Sample state — not connected',
    healthPct: 98.4,
    latencyMs: 83,
    dependencies: ['Fictional sample — not connected to live data', 'Fictional sample — not connected to live data', 'Fictional sample — not connected to live data'],
    output: 'Fictional sample — not connected to live data',
    forecast: 'Fictional sample — not connected to live data',
    confidence: 'High',
    velocityMetric: 'Illustrative sample value',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-finance',
    name: 'Finance Oracle Engine',
    domain: 'finance',
    purpose: 'Fictional sample — not connected to live data',
    currentState: 'Sample state — not connected',
    healthPct: 99.1,
    latencyMs: 42,
    dependencies: ['Treasury Wire Gateway', 'ERP Ledger Sync', 'Contract Milestone Index'],
    output: 'Fictional sample — not connected to live data',
    forecast: 'Fictional sample — not connected to live data',
    confidence: 'Very High',
    velocityMetric: 'Fictional sample — not connected to live data',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-operations',
    name: 'Operations Command Grid',
    domain: 'operations',
    purpose: 'Real-time workflow orchestration, lab capacity balancing, and reagent supply chain routing',
    currentState: 'Sample state — not connected',
    healthPct: 96.2,
    latencyMs: 64,
    dependencies: ['Fictional sample — not connected to live data', 'Courier Dispatch API', 'Global Cold-Chain Telemetry'],
    output: 'Fictional sample — not connected to live data',
    forecast: 'Illustrative scenario; not a live forecast',
    confidence: 'High',
    velocityMetric: 'Throughput: Nominal',
    impactSentiment: 'nominal',
  },
  {
    id: 'sub-security',
    name: 'Zero-Trust Security Sentinel',
    domain: 'security',
    purpose: 'Fictional sample — not connected to live data',
    currentState: 'Sample state — not connected',
    healthPct: 99.9,
    latencyMs: 14,
    dependencies: ['Hardware HSM Cluster', 'Audit Ledger Proofs', 'mTLS Gateway Fabric'],
    output: 'Illustrative sample output; no audit was performed',
    forecast: 'Fictional sample — not connected to live data',
    confidence: 'Guaranteed',
    velocityMetric: 'Sample classification only',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-telemetry',
    name: 'Kingdom Telemetry Fabric',
    domain: 'infrastructure',
    purpose: 'Fictional sample — not connected to live data',
    currentState: 'Sample state — not connected',
    healthPct: 99.7,
    latencyMs: 28,
    dependencies: ['Event Streaming Mesh', 'Fictional sample — not connected to live data', 'Tracing Collector'],
    output: 'Illustrative sample output; no live events collected',
    forecast: 'Illustrative infrastructure scenario',
    confidence: 'Very High',
    velocityMetric: 'Schema validation configured; sample value only',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-ai-council',
    name: 'AI Council Example',
    domain: 'infrastructure',
    purpose: 'Multi-agent deliberation orchestrator, strategic recommendation consensus, and executive guidance',
    currentState: 'Sample state — on-demand AI only',
    healthPct: 97.8,
    latencyMs: 112,
    dependencies: ['Configured AI provider', 'Autonomous Agent Bus', 'Executive Policy Store'],
    output: '34 Autonomous Agents Synchronized',
    forecast: 'Illustrative council scenario; no autonomous agents are synchronized',
    confidence: 'High',
    velocityMetric: 'Illustrative sample value',
    impactSentiment: 'positive',
  },
];

export const CommandGrid: React.FC<CommandGridProps> = ({ onSelectSubsystem }) => {
  const [subsystems, setSubsystems] = useState<SubsystemTelemetry[]>(initialSubsystems);
  const [probingId, setProbingId] = useState<string | null>(null);

  const handleProbe = (sub: SubsystemTelemetry) => {
    audioEngine.playPositiveSignal();
    setProbingId(sub.id);
    setTimeout(() => {
      setSubsystems((prev) =>
        prev.map((item) =>
          item.id === sub.id
            ? {
                ...item,
                latencyMs: Math.max(12, Math.floor(item.latencyMs * (0.9 + Math.random() * 0.2))),
                healthPct: Math.min(100, +(item.healthPct + (Math.random() * 0.4 - 0.2)).toFixed(1)),
              }
            : item
        )
      );
      setProbingId(null);
      audioEngine.playCompletionSignal();
    }, 750);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Subsystem Sample Metrics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Illustrative values only; no live health checks, latency probes, integrations, or forecasts are connected.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub) => {
          const isProbing = probingId === sub.id;
          return (
            <div
              key={sub.id}
              className="glass-panel rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-200"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/5">
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      {sub.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-tight mt-1 line-clamp-2">
                      {sub.purpose}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 shrink-0">
                    {sub.domain.toUpperCase()}
                  </span>
                </div>

                {/* Subsystem Telemetry Core Spec */}
                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  <div className="bg-[#050811]/60 rounded p-2 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-500 block">HEALTH</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      {sub.healthPct}%
                    </span>
                  </div>

                  <div className="bg-[#050811]/60 rounded p-2 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-500 block">LATENCY</span>
                    <span className="text-sm font-bold font-mono text-cyan-300 tabular-nums">
                      {sub.latencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] text-slate-500">Sample Output:</span>
                    <span className="font-mono text-slate-200 font-medium text-right text-[11px]">
                      {sub.output}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] text-slate-500">Illustrative Confidence:</span>
                    <span className="font-mono text-cyan-300 font-semibold text-[11px]">
                      {sub.confidence}
                    </span>
                  </div>

                  <div className="bg-white/[0.02] rounded p-2 mt-2 border border-white/5 text-[11px]">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">
                      Forecast Trajectory
                    </span>
                    <span className="text-slate-300 leading-tight block mt-0.5">
                      {sub.forecast}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">
                      Example Dependencies ({sub.dependencies.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sub.dependencies.map((dep, dIdx) => (
                        <span
                          key={dIdx}
                          className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subsystem Actions */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => handleProbe(sub)}
                  disabled={isProbing}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isProbing ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{isProbing ? 'Running Probe...' : 'Subsystem Probe'}</span>
                </button>
                <span className="text-[10px] font-mono text-emerald-400/80 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>NOMINAL</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
