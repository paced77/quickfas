import React, { useState } from 'react';
import { Cog, Zap, Play, CheckCircle2, Pause, Plus, RefreshCw, ShieldCheck, ArrowRight } from 'lucide-react';
import { AutomationRule } from '../../types/kingdom.ts';
import { audioEngine } from '../../services/audioEngine.ts';

export const initialAutomations: AutomationRule[] = [
  {
    id: 'rule-edge-01',
    name: 'Satellite Link Disconnect SQLite WAL Buffer Staging',
    triggerEvent: 'Satellite uplink packet loss exceeds 15% over 60 seconds',
    actionExecuted: 'Shift telemetry stream to local SQLite WAL buffer and enable offline store-and-forward',
    status: 'active',
    frequency: 'Continuous daemon',
    executionsTotal: 1420,
    successRatePct: 99.8,
  },
  {
    id: 'rule-audit-02',
    name: 'Soul Auditor RFC4180 Invariant Ledger Certification',
    triggerEvent: 'Edge telemetry buffer accumulates 5,000 unverified events',
    actionExecuted: 'Execute zero PII cryptographic validation and export signed audit ledger',
    status: 'active',
    frequency: 'Hourly verification',
    executionsTotal: 348,
    successRatePct: 100,
  },
  {
    id: 'rule-literacy-03',
    name: 'Plain-Language Reading Level Invariant Enforcer',
    triggerEvent: 'New health education module authored in Stratum Clinical Edge',
    actionExecuted: 'Analyze Flesch-Kincaid index and auto-flag terminology above Grade 8 reading level',
    status: 'active',
    frequency: 'On module commit',
    executionsTotal: 840,
    successRatePct: 99.4,
  },
  {
    id: 'rule-suds-04',
    name: 'Acute SUDS Distress Score Elevation Trigger',
    triggerEvent: 'Patient SUDS measurement exceeds 75 on interactive slider',
    actionExecuted: 'Activate Polyvagal 4-7-8 Breathwork Pacer and 5-4-3-2-1 Sensory Grounding protocol',
    status: 'active',
    frequency: 'Real-time event',
    executionsTotal: 612,
    successRatePct: 99.1,
  },
  {
    id: 'rule-treasury-05',
    name: 'Series A Edge Node Capital Allocation Lock',
    triggerEvent: 'Monthly hardware staging expense exceeds $150,000',
    actionExecuted: 'Trigger Finance Oracle and Sovereign Strategist capital clearance review',
    status: 'active',
    frequency: 'Monthly trigger',
    executionsTotal: 12,
    successRatePct: 100,
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

  const handlePreviewTrigger = (r: AutomationRule) => {
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
              Automated trigger network enforcing edge buffering, Soul Auditor invariant checks, and plain-language health literacy standards.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Autonomous Engine</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">99.6% Automated</span>
          </div>
        </div>

        {/* Automation Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#050811] p-3 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Trigger Rules</span>
            <span className="text-sm font-bold font-mono text-white tabular-nums">{rules.length} Active Rules</span>
          </div>

          <div className="bg-[#050811] p-3 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Automated Executions</span>
            <span className="text-sm font-bold font-mono text-cyan-300 tabular-nums">
              {rules.reduce((acc, r) => acc + r.executionsTotal, 0).toLocaleString()} Runs
            </span>
          </div>

          <div className="bg-[#050811] p-3 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Execution Success Rate</span>
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">99.7%</span>
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
                  onClick={() => handlePreviewTrigger(rule)}
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
