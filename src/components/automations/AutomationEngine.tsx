import React, { useState } from 'react';
import { Cog, Zap, Play, CheckCircle2, Pause, Plus, RefreshCw, ShieldCheck, ArrowRight } from 'lucide-react';
import { AutomationRule } from '../../types/kingdom.ts';
import { audioEngine } from '../../services/audioEngine.ts';

export const initialAutomations: AutomationRule[] = [
  {
    id: 'rule-01',
    name: 'Biostorage Thermal Drift Automated Failover',
    triggerEvent: 'Sensor drift > 0.3°C on units 1-8',
    actionExecuted: 'Automate backup compressor switchover + Dispatch courier probe',
    status: 'active',
    frequency: 'Continuous Invariant',
    executionsTotal: 142,
    successRatePct: 100,
  },
  {
    id: 'rule-02',
    name: 'Cohort Velocity Burst Auto-Provisioning',
    triggerEvent: 'Enrollment velocity > 25 pts/month',
    actionExecuted: 'Scale Zurich edge FHIR ingress worker pods by +4 instances',
    status: 'active',
    frequency: 'Real-Time',
    executionsTotal: 840,
    successRatePct: 99.8,
  },
  {
    id: 'rule-03',
    name: 'Cryptographic Invariant Quarantine',
    triggerEvent: 'mTLS handshake signature mismatch on EHR ingestion',
    actionExecuted: 'Quarantine ingress channel + notify Security Sentinel',
    status: 'active',
    frequency: 'Microsecond',
    executionsTotal: 34,
    successRatePct: 100,
  },
  {
    id: 'rule-04',
    name: 'Executive Morning Briefing Narration',
    triggerEvent: 'Daily 08:00 Local / Shift Handover',
    actionExecuted: 'Synthesize spoken narrative via Gemini 3.8 Flash + Web Audio',
    status: 'active',
    frequency: 'Daily Cadence',
    executionsTotal: 280,
    successRatePct: 100,
  },
  {
    id: 'rule-05',
    name: 'Treasury Runway Guard Reallocation',
    triggerEvent: 'Projected monthly burn variance > 3%',
    actionExecuted: 'Recalculate dynamic yield reserve and alert Finance Oracle',
    status: 'active',
    frequency: 'Hourly Ledger Sync',
    executionsTotal: 720,
    successRatePct: 99.5,
  },
];

export const AutomationEngine: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>(initialAutomations);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const handleToggleRule = (id: string) => {
    audioEngine.playPositiveSignal();
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r
      )
    );
  };

  const handleTestTrigger = (r: AutomationRule) => {
    audioEngine.playPositiveSignal();
    setTriggeringId(r.id);
    setTimeout(() => {
      setRules((prev) =>
        prev.map((item) =>
          item.id === r.id
            ? { ...item, executionsTotal: item.executionsTotal + 1 }
            : item
        )
      );
      setTriggeringId(null);
      audioEngine.playCompletionSignal();
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cog className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Workflow Automation Engine // Sovereign Triggers
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Self-Operating Governance & Event-Driven Autonomous Directives
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              76% Automation Coverage across all operational, clinical, and financial workflows.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">System Automation</span>
            <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">76% Coverage</span>
          </div>
        </div>

        {/* Automation Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#050811] p-3 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Trigger Rules</span>
            <span className="text-sm font-bold font-mono text-white tabular-nums">{rules.length} Rules Active</span>
          </div>

          <div className="bg-[#050811] p-3 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Executions</span>
            <span className="text-sm font-bold font-mono text-cyan-300 tabular-nums">
              {rules.reduce((acc, r) => acc + r.executionsTotal, 0).toLocaleString()} Runs
            </span>
          </div>

          <div className="bg-[#050811] p-3 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Success Invariance</span>
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">99.96% Invariant</span>
          </div>

          <div className="bg-[#050811] p-3 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Manual Labor Saved</span>
            <span className="text-sm font-bold font-mono text-indigo-300 tabular-nums">142 Hrs / Wk</span>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const isTriggering = triggeringId === rule.id;
          return (
            <div
              key={rule.id}
              className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/30 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    {rule.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-white/5">
                    {rule.frequency}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-mono text-cyan-300 text-[11px]">WHEN: {rule.triggerEvent}</span>
                  <span className="hidden sm:inline text-slate-600">→</span>
                  <span className="text-slate-400 text-[11px]">THEN: {rule.actionExecuted}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right text-xs font-mono hidden md:block">
                  <span className="text-slate-200 block font-bold tabular-nums">{rule.executionsTotal} Executions</span>
                  <span className="text-emerald-400 text-[10px]">{rule.successRatePct}% Success</span>
                </div>

                <button
                  onClick={() => handleTestTrigger(rule)}
                  disabled={isTriggering}
                  className="px-2.5 py-1.5 rounded text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 hover:bg-cyan-900/60 transition-colors flex items-center gap-1"
                >
                  <Play className={`w-3 h-3 fill-current ${isTriggering ? 'animate-spin' : ''}`} />
                  <span>{isTriggering ? 'Firing...' : 'Fire'}</span>
                </button>

                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`px-2.5 py-1.5 rounded text-xs font-mono transition-colors border ${
                    rule.status === 'active'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                      : 'border-white/10 text-slate-400 bg-white/5'
                  }`}
                >
                  {rule.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
