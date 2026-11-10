import React, { useState } from 'react';
import { Swords, CheckCircle2, Clock, Plus, Filter, ShieldCheck, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { MissionItem } from '../../types/kingdom.ts';
import { audioEngine } from '../../services/audioEngine.ts';

export const initialMissions: MissionItem[] = [
  {
    id: 'mis-01',
    codename: 'OP-POCKET16-DEPLOY',
    title: 'Deploy Pocket 16 Edge OS to 5 Rural Satellite Clinics',
    category: 'infrastructure',
    leadAgent: 'Operations Commander',
    readinessPct: 85,
    status: 'active',
    deadline: 'Q1 Milestone',
    impactScore: 92,
    keyOutcomes: [
      'Sub-90ms local query latency verified on edge hardware',
      'Local SQLite Tier 3 WAL buffer configured for 48-hr blackout resilience',
      'Automated background sync daemon connected to central coordination',
    ],
  },
  {
    id: 'mis-02',
    codename: 'OP-SOUL-AUDIT-21CFR',
    title: 'Soul Auditor RFC4180 & 21 CFR Part 11 Audit Envelope',
    category: 'security',
    leadAgent: 'Compliance Guardian',
    readinessPct: 94,
    status: 'active',
    deadline: 'Continuous',
    impactScore: 98,
    keyOutcomes: [
      'Zero PII invariant cryptographically ratified across all 17 Pockets',
      'Immutable SHA-256 hash chaining on all ingested edge telemetry events',
      'Exportable RFC4180 audit ledger ready for institutional review',
    ],
  },
  {
    id: 'mis-03',
    codename: 'OP-SERIES-A-SYNDICATE',
    title: 'Series A Institutional Syndicate ($5.0M Staging)',
    category: 'capital',
    leadAgent: 'Finance Oracle',
    readinessPct: 78,
    status: 'active',
    deadline: '38.5 mo runway lock',
    impactScore: 95,
    keyOutcomes: [
      'Lead term sheet active at $22M pre-money valuation ($14.2M ARR run-rate)',
      'Hardware appliance CAPEX allocation locked at $850k for 50 node rollout',
      'Due diligence packet compiled for Chief Architect ODell Anderson',
    ],
  },
  {
    id: 'mis-04',
    codename: 'OP-STARLINK-FAILOVER',
    title: 'Satellite Uplink Heartbeat & Automatic Local Store Sync',
    category: 'infrastructure',
    leadAgent: 'Risk Sentinel',
    readinessPct: 88,
    status: 'active',
    deadline: 'Real-time',
    impactScore: 89,
    keyOutcomes: [
      'Zero packet drops during simulated 48-hour satellite blackouts',
      '14,200 events staged and re-synchronized upon link restoration',
      'Automated telemetry jitter alerting via Slack and webhook dispatch',
    ],
  },
  {
    id: 'mis-05',
    codename: 'OP-STRATUM-LITERACY',
    title: 'Stratum Plain-Language Health Literacy Expansion (180 Centers)',
    category: 'expansion',
    leadAgent: 'Education Steward',
    readinessPct: 90,
    status: 'active',
    deadline: 'National Rollout',
    impactScore: 96,
    keyOutcomes: [
      'Grade 6–8 plain-language reading level verified across all modules',
      'WCAG 2.2 AA cross-generational accessibility fully certified',
      'Multi-lingual Spanish & Mandarin modules routed to Pocket 14 localization',
    ],
  },
];

export const MissionControl: React.FC = () => {
  const [missions, setMissions] = useState<MissionItem[]>(initialMissions);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCodename, setNewCodename] = useState('');
  const [newCategory, setNewCategory] = useState<'clinical' | 'capital' | 'infrastructure' | 'security' | 'expansion'>('infrastructure');

  const filteredMissions = filterCategory === 'all'
    ? missions
    : missions.filter((m) => m.category === filterCategory);

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const mission: MissionItem = {
      id: `mis-${Date.now().toString(36)}`,
      codename: newCodename.trim().toUpperCase() || 'OP-STRATEGIC-DIRECTIVE',
      title: newTitle.trim(),
      category: newCategory,
      leadAgent: 'Sovereign Strategist',
      readinessPct: 15,
      status: 'active',
      deadline: 'Active Sprint',
      impactScore: 88,
      keyOutcomes: ['Mission initialized and ratified across Sovereign Council coordinators'],
    };

    setMissions([mission, ...missions]);
    setNewTitle('');
    setNewCodename('');
    setShowCreateModal(false);
    audioEngine.playCompletionSignal();
  };

  const handleAdvanceMission = (id: string) => {
    audioEngine.playPositiveSignal();
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              readinessPct: Math.min(100, m.readinessPct + 10),
              status: m.readinessPct + 10 >= 100 ? 'completed' : m.status,
            }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-cyan-400/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Campaign Tracker: Sovereign missions synchronized with Seventeen Pockets operational roadmap. Sample mission board only.</span>
        </div>
        <span className="font-mono text-[11px] text-cyan-300">5 Active Campaigns</span>
      </div>
      {/* Header Banner */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Swords className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Mission Control // Strategic Campaigns
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Turn Goals into Trackable Campaigns with Measurable Outcomes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              24 Active missions · 87% Readiness · 0 Unmanaged critical paths
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audioEngine.playPositiveSignal();
                setShowCreateModal(true);
              }}
              className="glow-btn-primary px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy New Mission</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 pb-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-mono text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['all', 'clinical', 'capital', 'infrastructure', 'security', 'expansion'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                audioEngine.playPositiveSignal();
                setFilterCategory(cat);
              }}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mission Cards Grid */}
      <div className="space-y-4">
        {filteredMissions.map((mission) => {
          let badgeStyle = 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40';
          if (mission.status === 'completed') badgeStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
          if (mission.status === 'critical') badgeStyle = 'bg-amber-950/60 text-amber-300 border-amber-800/40';

          return (
            <div
              key={mission.id}
              className="glass-panel rounded-xl p-5 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                      {mission.codename}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${badgeStyle}`}>
                      {mission.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Lead: {mission.leadAgent}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {mission.title}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Deadline: {mission.deadline}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                    Impact: {mission.impactScore}/100
                  </span>
                </div>
              </div>

              {/* Readiness Progress Bar */}
              <div className="my-3">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Campaign Readiness</span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {mission.readinessPct}%
                  </span>
                </div>
                <div className="w-full bg-[#050811] rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${mission.readinessPct}%` }}
                  />
                </div>
              </div>

              {/* Measurable Key Outcomes */}
              <div className="space-y-1.5 text-xs text-slate-300 my-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  Measurable Strategic Outcomes:
                </span>
                {mission.keyOutcomes.map((outcome, oIdx) => (
                  <div key={oIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  ID: {mission.id}
                </span>

                <button
                  onClick={() => handleAdvanceMission(mission.id)}
                  disabled={mission.readinessPct >= 100}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 hover:bg-cyan-900/60 transition-colors disabled:opacity-40"
                >
                  {mission.readinessPct >= 100 ? 'Mission Finalized' : 'Execute Campaign Milestone (+10%)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Deploy New Mission */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-elevated w-full max-w-lg rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-base font-bold text-white mb-1">Deploy Strategic Campaign</h3>
            <p className="text-xs text-slate-400 mb-4">
              Initialize a targeted operational mission and assign domain leadership across the Sovereign AI Council.
            </p>

            <form onSubmit={handleCreateMission} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Codename:</label>
                <input
                  type="text"
                  placeholder="e.g. OP-EDGE-EXPANSION"
                  value={newCodename}
                  onChange={(e) => setNewCodename(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Mission Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expand Pocket 16 node network to rural clinics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#050811] border border-white/10 rounded px-3 py-2 text-xs text-white"
                >
                  <option value="clinical">Clinical Education</option>
                  <option value="capital">Capital & Finance</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="security">Zero-Trust Security</option>
                  <option value="expansion">Global Expansion</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-btn-primary px-4 py-1.5 rounded text-xs font-bold"
                >
                  Deploy Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
