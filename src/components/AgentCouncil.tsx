import React, { useState } from 'react';
import { Users, Sparkles, Brain, CheckCircle2, AlertOctagon, TrendingUp, ShieldCheck, Scale, Compass, Play, RefreshCw, Layers } from 'lucide-react';
import { CouncilMember, CouncilDeliberationResult } from '../types/kingdom.ts';
import { audioEngine } from '../services/audioEngine.ts';

export const permanentLeaders: CouncilMember[] = [
  {
    id: 'agent-strat',
    name: 'Sovereign Strategist',
    title: 'Executive Guidance & Existential Planning',
    domain: 'Enterprise Strategy',
    avatarSeed: 'strategist',
    responsibilities: ['Overall guidance', 'Existential positioning', 'Horizon-3 strategic planning'],
    status: 'advising',
    confidenceScore: 0.96,
    recentDirective: 'Accelerate Phase-III endpoint closure by 14 days to front-run global competitive submissions.',
    focusMetric: 'Strategic Horizon: 2027–2030',
  },
  {
    id: 'agent-fin',
    name: 'Finance Oracle',
    title: 'Capital Allocation & Growth Forecaster',
    domain: 'Capital & Treasury',
    avatarSeed: 'finance',
    responsibilities: ['Revenue trajectory', 'Profitability optimization', 'Dynamic runway extension'],
    status: 'advising',
    confidenceScore: 0.98,
    recentDirective: 'Reallocate $850k from dormant hosting reserves to Zurich genomics compute cluster.',
    focusMetric: 'Runway: 38.5 Months ($14.2M MRR)',
  },
  {
    id: 'agent-clin',
    name: 'Clinical Director',
    title: 'Trial Velocity & Patient Cohort Lead',
    domain: 'Clinical Mesh',
    avatarSeed: 'clinical',
    responsibilities: ['Multi-center studies', 'Patient safety', 'Enrollment velocity & FHIR sync'],
    status: 'deliberating',
    confidenceScore: 0.94,
    recentDirective: 'Mayo and Charite site enrollment velocity is +32% above protocol baseline.',
    focusMetric: 'Current Enrollment: 684 / 720 Pts',
  },
  {
    id: 'agent-risk',
    name: 'Risk Sentinel',
    title: 'Threats & Vulnerability Watchdog',
    domain: 'Threat Posture',
    avatarSeed: 'risk',
    responsibilities: ['Unmitigated exposures', 'Cold-chain excursions', 'Operational shock resilience'],
    status: 'monitoring',
    confidenceScore: 0.95,
    recentDirective: 'Zurich Biostorage micro-excursion mitigated via secondary nitrogen compressor.',
    focusMetric: 'Active Risks: 2 Monitored',
  },
  {
    id: 'agent-ops',
    name: 'Operations Commander',
    title: 'Execution & Throughput Orchestrator',
    domain: 'Workflow & Supply',
    avatarSeed: 'operations',
    responsibilities: ['Workflow throughput', 'Lab capacity balancing', 'Reagent supply logistics'],
    status: 'advising',
    confidenceScore: 0.97,
    recentDirective: 'Core assay pipelines operating at 74% capacity with zero unassigned queues.',
    focusMetric: 'Throughput: 1,840 Assays/Hr',
  },
  {
    id: 'agent-comp',
    name: 'Compliance Guardian',
    title: 'Regulatory Posture & Audit Invariants',
    domain: 'Regulatory Affairs',
    avatarSeed: 'compliance',
    responsibilities: ['FDA 21 CFR Part 11', 'EMA Priority Dossiers', 'Autonomous audit packaging'],
    status: 'monitoring',
    confidenceScore: 0.99,
    recentDirective: 'Audit invariance proof generated for EU-US pseudonymized genomics transmission.',
    focusMetric: 'Audit Readiness: 100% Invariant',
  },
  {
    id: 'agent-sec',
    name: 'Security Sentinel',
    title: 'Cryptographic Provenance & Zero-Trust',
    domain: 'Zero-Trust Defense',
    avatarSeed: 'security',
    responsibilities: ['Zero-Trust mTLS mesh', 'HSM hardware security', 'API invariant anomaly detection'],
    status: 'monitoring',
    confidenceScore: 0.99,
    recentDirective: '0 unauthorized penetration attempts detected; all 14.8M FHIR records cryptographically sealed.',
    focusMetric: 'Breaches / Anomalies: 0',
  },
];

const PRESET_AGENDAS = [
  'Phase III Oncology Study Site Bottleneck vs Q3 Global Milestone Acceleration',
  'Automated Capital Reallocation ($1.2M) into Edge FHIR Inference Nodes',
  'Supply Chain Reagent Shortage: Dual-Sourcing vs Regulatory Addendum',
  'Cyber Threat Containment on Public Interconnect without Study Halting',
];

export const AgentCouncil: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<CouncilMember>(permanentLeaders[0]);
  const [agendaInput, setAgendaInput] = useState<string>(PRESET_AGENDAS[0]);
  const [isDeliberating, setIsDeliberating] = useState<boolean>(false);
  const [deliberationResult, setDeliberationResult] = useState<CouncilDeliberationResult | null>(null);

  const handleConveneCouncil = async (overrideAgenda?: string) => {
    const agendaToRun = overrideAgenda || agendaInput;
    setIsDeliberating(true);
    audioEngine.playPositiveSignal();

    try {
      const res = await fetch('/api/gemini/council-deliberation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agendaTopic: agendaToRun,
          contextData: {
            activeAgents: 34,
            clinicalHealth: '98.4%',
            runwayMonths: 38.5,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to convene council');
      const data: CouncilDeliberationResult = await res.json();
      setDeliberationResult(data);
      audioEngine.playCompletionSignal();
    } catch (err) {
      console.error('Deliberation error:', err);
      audioEngine.playWarningSignal();
    } finally {
      setIsDeliberating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Council Roster Banner */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Permanent AI Council // 7 Sovereign Leaders</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous executive leaders continuously governing strategy, capital, clinical trials, security, and risk.
            </p>
          </div>
          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded">
            All 7 Leaders Synchronized (Gemini 3.8 Flash Bus)
          </div>
        </div>

        {/* 7 Permanent Leaders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {permanentLeaders.map((leader) => {
            const isSelected = selectedAgent.id === leader.id;
            return (
              <div
                key={leader.id}
                onClick={() => {
                  audioEngine.playPositiveSignal();
                  setSelectedAgent(leader);
                }}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0f1b33] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[#080d1a]/80 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                      {leader.domain}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold tabular-nums">
                      {Math.round(leader.confidenceScore * 100)}% Conf
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white tracking-tight">
                    {leader.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {leader.title}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">
                    Current Focus
                  </span>
                  <span className="text-[11px] font-mono text-slate-300 font-medium truncate block">
                    {leader.focusMetric}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Council Deliberation Chamber */}
      <div className="glass-panel-elevated rounded-xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Sovereign Deliberation Chamber
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Convening multi-agent reasoning, resolving conflicts between growth vs risk vs compliance.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleConveneCouncil()}
            disabled={isDeliberating}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDeliberating ? 'animate-spin' : ''}`} />
            <span>{isDeliberating ? 'Council Deliberating...' : 'Convene Sovereign Council'}</span>
          </button>
        </div>

        {/* Agenda Selector & Custom Input */}
        <div className="mb-5 space-y-2">
          <label className="text-xs font-mono text-slate-300 uppercase block">
            Select or Define Sovereign Agenda:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_AGENDAS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAgendaInput(preset);
                  audioEngine.playPositiveSignal();
                }}
                className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                  agendaInput === preset
                    ? 'border-cyan-500/50 bg-cyan-950/50 text-cyan-300 font-semibold'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={agendaInput}
              onChange={(e) => setAgendaInput(e.target.value)}
              placeholder="Enter custom strategic dilemma, trial crisis, or capital allocation question..."
              className="w-full bg-[#050811] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Deliberation Output */}
        {deliberationResult ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Directive Banner */}
            <div className="bg-[#0b1426] border border-cyan-500/30 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-cyan-500/20 mb-3">
                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase">
                  Consensus Resolution // {deliberationResult.impactTier} Impact
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                  Consensus Score: {deliberationResult.consensusScorePct}%
                </span>
              </div>
              <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                {deliberationResult.executiveDirective}
              </h4>
            </div>

            {/* The 4 Core Answers derived by Council */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-[10px] font-mono text-cyan-400 block mb-1">01 / WHAT IS HAPPENING</span>
                <p className="text-slate-200 leading-relaxed">{deliberationResult.coreAnswers.whatIsHappeningNow}</p>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-[10px] font-mono text-blue-400 block mb-1">02 / WHY IS IT HAPPENING</span>
                <p className="text-slate-200 leading-relaxed">{deliberationResult.coreAnswers.whyIsItHappening}</p>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-[10px] font-mono text-indigo-400 block mb-1">03 / WHAT HAPPENS NEXT</span>
                <p className="text-slate-200 leading-relaxed">{deliberationResult.coreAnswers.whatHappensNext}</p>
              </div>
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3">
                <span className="text-[10px] font-mono text-amber-400 block mb-1">04 / WHAT SHOULD I DO</span>
                <p className="text-amber-100 font-medium leading-relaxed">{deliberationResult.coreAnswers.whatShouldIDo}</p>
              </div>
            </div>

            {/* Individual Agent Arguments & Debates */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2.5">
                Multi-Agent Reasoning Record ({deliberationResult.agentDeliberations.length} Leaders)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliberationResult.agentDeliberations.map((agent, aIdx) => (
                  <div key={aIdx} className="bg-[#050811]/70 border border-white/10 rounded-lg p-3.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5 mb-2">
                      <div>
                        <span className="text-xs font-bold text-white">{agent.agentName}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">({agent.role})</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        agent.verdict === 'Caution' || agent.verdict === 'Intervene'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                      }`}>
                        {agent.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "{agent.argument}"
                    </p>
                    <div className="mt-2 text-right text-[10px] font-mono text-slate-500">
                      Confidence: {Math.round(agent.confidence * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Interventions Table */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2.5">
                Approved Autonomous Interventions
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-white/10 rounded-lg overflow-hidden">
                  <thead className="bg-white/5 font-mono text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Directive</th>
                      <th className="p-2.5">Timeframe</th>
                      <th className="p-2.5">Projected Gain</th>
                      <th className="p-2.5">Risk Rating</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {deliberationResult.actionableInterventions.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 text-slate-200">{item.title}</td>
                        <td className="p-2.5 font-mono text-slate-400">{item.timeframe}</td>
                        <td className="p-2.5 font-mono text-emerald-400">{item.projectedGain}</td>
                        <td className="p-2.5 font-mono text-slate-300">{item.riskRating}</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => audioEngine.playCompletionSignal()}
                            className="px-2.5 py-1 text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded hover:bg-cyan-900/60 transition-colors"
                          >
                            Execute
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <Brain className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">Council Ready for Deliberation</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Select an agenda above and click "Convene Sovereign Council" to launch multi-agent strategic reasoning powered by Gemini 3.8 Flash.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
