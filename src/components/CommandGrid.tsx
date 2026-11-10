import React, { useState } from 'react';
import { Activity, Cpu, Database, ShieldCheck, Zap, ArrowRight, Gauge, CheckCircle2, RefreshCw } from 'lucide-react';
import { SubsystemTelemetry } from '../types/kingdom.ts';
import { audioEngine } from '../services/audioEngine.ts';

interface CommandGridProps {
  onSelectSubsystem?: (subsystem: SubsystemTelemetry) => void;
}

export const initialSubsystems: SubsystemTelemetry[] = [
  {
    id: 'sub-clinical-edge',
    name: 'Stratum Clinical Edge Engine',
    domain: 'clinical',
    purpose: 'Real-time bedside decision support, SUDS distress curve calibration, and polyvagal regulation telemetry',
    currentState: 'Nominal Execution · Ingestion Active',
    healthPct: 99.4,
    latencyMs: 78,
    dependencies: ['Pocket 3 Coping Lab', 'HL7/FHIR Protocol Adapter', 'SQLite Edge Store'],
    output: '650 Active Patients Tracked · 28 enrollments/mo',
    forecast: 'Pivotal protocol milestone reached 14 days early',
    confidence: 'Very High',
    velocityMetric: '34.2% Mean Distress Reduction',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-finance',
    name: 'Finance Oracle Engine',
    domain: 'finance',
    purpose: 'Capital allocation pacing, unit economics monitoring, and multi-scenario runway modeling',
    currentState: 'Optimal Allocation · Budget Verified',
    healthPct: 99.1,
    latencyMs: 42,
    dependencies: ['Treasury Wire Gateway', 'ERP Ledger Sync', 'Contract Milestone Index'],
    output: '$14.2M ARR Trajectory · 38.5 Months Runway',
    forecast: 'Cash-flow breakeven achievable by Month 32',
    confidence: 'High',
    velocityMetric: 'LTV:CAC 10.6:1 (Team Tier)',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-operations',
    name: 'Edge Operations Command Grid',
    domain: 'operations',
    purpose: 'Autonomous fleet coordination, edge microservice watchdogs, and offline recovery orchestration',
    currentState: '16 Edge Nodes Connected & Autonomous',
    healthPct: 98.6,
    latencyMs: 54,
    dependencies: ['Fleet Agent Pocket 14', 'Systemd Self-Healing Daemons', 'Mesh Sync Engine'],
    output: 'Zero unhandled hardware crashes across 180 days',
    forecast: 'Full 100-node regional network readiness by Q2',
    confidence: 'High',
    velocityMetric: 'Uptime: 99.94%',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-security',
    name: 'Zero-Trust Security Sentinel',
    domain: 'security',
    purpose: 'Hardware-backed AES-256 encryption, Soul Auditor invariant verification, and HIPAA audit sealing',
    currentState: 'Active Protection · Zero Invariant Breaches',
    healthPct: 99.9,
    latencyMs: 14,
    dependencies: ['Hardware HSM Cluster', 'Audit Ledger Proofs', 'mTLS Gateway Fabric'],
    output: 'Continuous tamper-evident cryptographic event seals',
    forecast: '21 CFR Part 11 and SOC2 Type II audit readiness cleared',
    confidence: 'Very High',
    velocityMetric: '0 Breaches · 100% Audit Compliance',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-telemetry',
    name: 'Seventeen Pockets Telemetry Fabric',
    domain: 'infrastructure',
    purpose: 'Sub-90ms local telemetry validation, append-only event journaling, and delta synchronization',
    currentState: 'Sub-90ms Ingestion · Event Stream Live',
    healthPct: 99.7,
    latencyMs: 28,
    dependencies: ['Event Streaming Mesh', 'Zod Contract Validator', 'SQLite WAL Journal'],
    output: '14,200 events buffered locally without data loss',
    forecast: 'Sub-30ms local query latency maintained at scale',
    confidence: 'Very High',
    velocityMetric: 'Ingestion: 1,420 events/sec',
    impactSentiment: 'positive',
  },
  {
    id: 'sub-ai-council',
    name: 'AI Sovereign Council Orchestrator',
    domain: 'infrastructure',
    purpose: 'Multi-agent deliberation orchestrator, strategic consensus scoring, and executive decision support',
    currentState: '7 Agents Deliberating · Consensus 94%',
    healthPct: 98.8,
    latencyMs: 86,
    dependencies: ['Gemini 3.8 Flash SDK', 'Autonomous Agent Bus', 'Executive Policy Store'],
    output: 'Consensus directives dispatched with full evidentiary trail',
    forecast: 'Adaptive policy refinement active across all domains',
    confidence: 'High',
    velocityMetric: 'Deliberation Latency: 1.4s',
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
            Operational Subsystem Telemetry
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time edge health, telemetry latency, and cross-system operational indicators. Illustrative values only.
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
                    <span className="text-[11px] text-slate-500">Operational State:</span>
                    <span className="font-mono text-slate-200 font-medium text-right text-[11px]">
                      {sub.output}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] text-slate-500">Consensus Confidence:</span>
                    <span className="font-mono text-cyan-300 font-semibold text-[11px]">
                      {sub.confidence}
                    </span>
                  </div>

                  <div className="bg-white/[0.02] rounded p-2 mt-2 border border-white/5 text-[11px]">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">
                      Predictive Trajectory
                    </span>
                    <span className="text-slate-300 leading-tight block mt-0.5">
                      {sub.forecast}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">
                      System Dependencies ({sub.dependencies.length})
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
                  <span>{isProbing ? 'Probing Node...' : 'Verify Node Health'}</span>
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
