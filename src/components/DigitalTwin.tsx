import React, { useState } from 'react';
import { GitBranch, Activity, DollarSign, ShieldAlert, Cpu, Play, CheckCircle2, AlertTriangle, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { DigitalTwinNode, SimulationResult } from '../types/kingdom.ts';
import { audioEngine } from '../services/audioEngine.ts';

export const initialTwinNodes: DigitalTwinNode[] = [
  {
    id: 'node-ceo',
    label: 'Sovereign Core (ODell Anderson / Architecture)',
    department: 'Executive Governance',
    healthPct: 98.6,
    monthlyCostUsd: '$340,000',
    riskLevel: 'Low',
    outputMetric: 'Sub-90ms Decision Ingestion · 100% Invariant Ratification',
    dependencies: ['Stratum Health Engine', 'Finance Oracle', 'Operations Commander', 'Technology Fabric'],
    forecastTrend: 'Series A Capital Scaling · 38.5 Months Runway',
    telemetryStream: [96, 97, 98, 97, 99, 98, 98.6],
  },
  {
    id: 'node-education',
    label: 'Stratum Clinical Edge & Education Engine',
    department: 'Health Education & Plain-Language',
    healthPct: 98.4,
    monthlyCostUsd: '$1,280,000',
    riskLevel: 'Low',
    outputMetric: 'Grade 6–8 Literacy Invariant · 650 Active Patients',
    dependencies: ['Operations Commander', 'Technology Fabric'],
    forecastTrend: '+28 New Patient Enrollments / Month',
    telemetryStream: [92, 94, 95, 96, 97, 98, 98.4],
  },
  {
    id: 'node-finance',
    label: 'Finance Oracle Engine',
    department: 'Treasury & Capital Optimization',
    healthPct: 99.1,
    monthlyCostUsd: '$180,000',
    riskLevel: 'Low',
    outputMetric: '$14.2M ARR · $2.85M Cash Reserves',
    dependencies: ['Technology Fabric'],
    forecastTrend: '+48.2% YoY ARR Growth Velocity',
    telemetryStream: [97, 98, 98, 99, 99, 99, 99.1],
  },
  {
    id: 'node-ops',
    label: 'Operations Commander (Pocket 16 Edge OS)',
    department: 'Workflow & Offline Node Logistics',
    healthPct: 96.2,
    monthlyCostUsd: '$890,000',
    riskLevel: 'Moderate',
    outputMetric: '16 Rural Edge Appliances Autonomous · 99.4% Uptime',
    dependencies: ['Technology Fabric', 'Stratum Health Engine'],
    forecastTrend: 'Zero Data Loss During Satellite Dropouts',
    telemetryStream: [94, 95, 96, 96, 95, 96, 96.2],
  },
  {
    id: 'node-tech',
    label: 'Technology & Zero-Trust Mesh',
    department: 'Zero-Trust Mesh & Compute',
    healthPct: 99.7,
    monthlyCostUsd: '$410,000',
    riskLevel: 'Low',
    outputMetric: 'AES-256 HSM Cryptographic Verification · RFC4180 Audit',
    dependencies: [],
    forecastTrend: '99.99% Availability across Tier 1–5 Stack',
    telemetryStream: [99, 99, 99, 99.5, 99.6, 99.7, 99.7],
  },
];

const PRESET_PERTURBATIONS = [
  {
    title: 'Offline Satellite Dropout (Starlink Failover)',
    type: 'offline_satellite_failover',
    magnitude: 35,
  },
  {
    title: 'Rural Clinic Surge (300% Ingestion Spike)',
    type: 'patient_intake_surge',
    magnitude: 45,
  },
  {
    title: 'Series A Capital Deployment ($5M Allocation)',
    type: 'capital_shift',
    magnitude: 25,
  },
  {
    title: 'Edge Invariant Audit Stress Test (Soul Auditor)',
    type: 'audit_invariant_stress',
    magnitude: 20,
  },
];

export const DigitalTwin: React.FC = () => {
  const [nodes, setNodes] = useState<DigitalTwinNode[]>(initialTwinNodes);
  const [selectedNode, setSelectedNode] = useState<DigitalTwinNode>(initialTwinNodes[0]);
  const [selectedPreset, setSelectedPreset] = useState(PRESET_PERTURBATIONS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    audioEngine.playPositiveSignal();

    try {
      const res = await fetch('/api/gemini/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: selectedPreset.title,
          perturbationType: selectedPreset.type,
          magnitudePct: selectedPreset.magnitude,
        }),
      });

      if (!res.ok) throw new Error('Simulation failed');
      const data: SimulationResult = await res.json();
      setSimulationResult(data);
      audioEngine.playCompletionSignal();
    } catch (err) {
      console.error('Simulation error:', err);
      audioEngine.playWarningSignal();
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Digital Twin Graph Overview */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>Enterprise Topology // Subsystem Dependencies</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live edge node topology, health ratings, and cross-tier operational dependencies. Illustrative topology and sample metrics only.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded">
            5 Active Nodes Online
          </span>
        </div>

        {/* Node Topology Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {nodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => {
                  audioEngine.playPositiveSignal();
                  setSelectedNode(node);
                }}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0f1b33] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[#080d1a]/80 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
                    <span>{node.department}</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {node.healthPct}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
                    {node.label}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Monthly:</span>
                    <span className="text-slate-200">{node.monthlyCostUsd}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Risk:</span>
                    <span className={node.riskLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>
                      {node.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node In-Depth Telemetry */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase">
              Node Telemetry Deep-Dive // {selectedNode.department}
            </span>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              {selectedNode.label}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 block">Health Rating</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {selectedNode.healthPct}% Nominal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#050811]/60 p-3.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">
              Active Operational Throughput
            </span>
            <p className="text-slate-200 font-medium">{selectedNode.outputMetric}</p>
          </div>

          <div className="bg-[#050811]/60 p-3.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">
              30-Day Predictive Trajectory
            </span>
            <p className="text-slate-200 font-medium">{selectedNode.forecastTrend}</p>
          </div>

          <div className="bg-[#050811]/60 p-3.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">
              Upstream / Downstream Dependencies
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedNode.dependencies.length > 0 ? (
                selectedNode.dependencies.map((dep, idx) => (
                  <span key={idx} className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                    {dep}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">Autonomous Core (Root Node)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Simulator Chamber */}
      <div className="glass-panel-elevated rounded-xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Digital Twin Scenario Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stress-test edge resilience, satellite latency spikes, and capital shift scenarios.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Dynamic Load...' : 'Simulate Scenario Impact'}</span>
          </button>
        </div>

        {/* Perturbation Presets */}
        <div className="mb-5 space-y-2">
          <label className="text-xs font-mono text-slate-300 uppercase block">
            Select Enterprise Perturbation to Test:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_PERTURBATIONS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPreset(preset);
                  audioEngine.playPositiveSignal();
                }}
                className={`p-2.5 text-left rounded-lg border text-xs transition-colors flex items-center justify-between ${
                  selectedPreset.title === preset.title
                    ? 'border-indigo-500/60 bg-indigo-950/40 text-indigo-200 font-semibold'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{preset.title}</span>
                <span className="text-[10px] font-mono text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 shrink-0 ml-2">
                  {preset.magnitude}% Shock
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Output */}
        {simulationResult ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Overview Banner */}
            <div className="bg-[#0c102b] border border-indigo-500/30 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-500/20 mb-2">
                <span className="text-[11px] font-mono text-indigo-300 font-semibold uppercase">
                  Simulation Outcome // {simulationResult.simulationDurationWeeks === null ? 'Not run' : `${simulationResult.simulationDurationWeeks} Weeks Horizon`}
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold tabular-nums">
                  System Stability Score: {simulationResult.overallSystemStabilityScore === null ? 'Not assessed' : `${simulationResult.overallSystemStabilityScore}%`}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {simulationResult.executiveSummary}
              </p>
            </div>

            {/* Cascading Node Impacts */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2.5">
                Cascade Ripple Across Enterprise Topology
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {simulationResult.nodesImpacted.map((item, nIdx) => (
                  <div key={nIdx} className="bg-[#050811]/70 border border-white/10 rounded-lg p-3.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5 mb-2">
                      <span className="text-xs font-bold text-white">{item.nodeName}</span>
                      <span className={`text-[10px] font-mono font-bold tabular-nums ${
                        item.healthDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {item.healthDelta >= 0 ? `+${item.healthDelta}%` : `${item.healthDelta}%`}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Cost Delta:</span>
                        <span className="font-mono text-slate-200">{item.costDeltaUsd}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Risk Shift:</span>
                        <span className="font-mono text-amber-300">{item.riskShift}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/5 text-[11px] text-slate-300">
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">Forecast Trajectory</span>
                      <span>{item.outputForecast}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Counter-Measures */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2.5">
                Recommended Counter-Measures to Neutralize Shock
              </h4>
              <div className="space-y-2">
                {simulationResult.counterMeasures.map((cm, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold block">
                        Target: {cm.targetNode}
                      </span>
                      <p className="text-slate-200 font-medium mt-0.5">{cm.action}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-[11px] font-mono">
                        <span className="text-slate-400 block">Cost: {cm.costToDeploy}</span>
                        <span className="text-emerald-400 font-bold">-{cm.riskReductionPct}% Risk</span>
                      </div>
                      <button
                        onClick={() => audioEngine.playCompletionSignal()}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                      >
                        Enact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
            Select a perturbation preset and click "Generate Scenario Example" to project organizational ripple effects.
          </div>
        )}
      </div>
    </div>
  );
};
