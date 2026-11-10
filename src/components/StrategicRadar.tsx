import React, { useState } from 'react';
import { Target, Compass, AlertCircle, TrendingUp, Sparkles, Eye, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { StrategicRadarItem } from '../types/kingdom.ts';
import { audioEngine } from '../services/audioEngine.ts';

export const initialRadarItems: StrategicRadarItem[] = [
  {
    id: 'rad-grow-1',
    title: 'Stratum Educational Node Expansion (50 States)',
    quadrant: 'growth',
    distance: 28,
    angleDeg: 35,
    severityOrImpact: 'transformative',
    summary: 'Cross-generational health literacy curriculum scaled to 180 community health centers, achieving Grade 6–8 plain-language reading levels.',
    recommendedAction: 'Scale multi-lingual Spanish and Mandarin translations through Pocket 14 localization engine.',
    ownerAgent: 'Education Steward',
  },
  {
    id: 'rad-grow-2',
    title: 'Series A Institutional Syndicate ($5.0M)',
    quadrant: 'growth',
    distance: 65,
    angleDeg: 68,
    severityOrImpact: 'high',
    summary: 'Lead investor term sheet active at $22M pre-money valuation; 38.5 months runway expansion to fund edge appliance hardware distribution.',
    recommendedAction: 'Engage Finance Oracle and Chief Architect ODell Anderson for final due diligence packet lock.',
    ownerAgent: 'Finance Oracle',
  },
  {
    id: 'rad-opp-1',
    title: 'Autonomous Ingestion Edge Caching',
    quadrant: 'opportunity',
    distance: 40,
    angleDeg: 125,
    severityOrImpact: 'high',
    summary: 'Deploying Pocket 16 Edge OS appliances across 5 rural satellite clinics drops data transit latency from 480ms to 42ms.',
    recommendedAction: 'Authorize $950,000 capital shift from dormant EU compute reserves to deploy edge nodes.',
    ownerAgent: 'Finance Oracle',
  },
  {
    id: 'rad-opp-2',
    title: 'Multi-Center Federated Cohort Ingestion',
    quadrant: 'opportunity',
    distance: 75,
    angleDeg: 155,
    severityOrImpact: 'transformative',
    summary: 'Cross-institutional protocol alignment across regional academic medical networks enables 1,200 additional cohort records without cloud egress.',
    recommendedAction: 'Convene AI Council to ratify privacy-preserving zero-knowledge federated learning parameters.',
    ownerAgent: 'Sovereign Strategist',
  },
  {
    id: 'rad-risk-1',
    title: 'Satellite Uplink Intermittent Disconnect',
    quadrant: 'risk',
    distance: 22,
    angleDeg: 215,
    severityOrImpact: 'critical',
    summary: 'Rural Clinic Beta experiencing secondary Starlink degradation. Local SQLite Tier 3 WAL buffer successfully holding 14,200 uncommitted telemetry entries.',
    recommendedAction: 'Automated local store buffering active; dispatch nightly batch sync job once link latency drops below 120ms.',
    ownerAgent: 'Risk Sentinel',
  },
  {
    id: 'rad-risk-2',
    title: 'HIPAA & 21 CFR Part 11 Audit Envelope',
    quadrant: 'risk',
    distance: 58,
    angleDeg: 245,
    severityOrImpact: 'high',
    summary: 'Scheduled institutional compliance inspection requires immutable cryptographic event logs across all Seventeen Pockets.',
    recommendedAction: 'Execute Soul Auditor verification pass and export RFC4180 audit ledger with zero PII exposure.',
    ownerAgent: 'Compliance Guardian',
  },
  {
    id: 'rad-fore-1',
    title: 'Pivotal Validation Milestone Completion (Day 76)',
    quadrant: 'forecast',
    distance: 34,
    angleDeg: 305,
    severityOrImpact: 'high',
    summary: 'Cohort enrollment velocity is tracking 14 days ahead of scheduled timeline. Target threshold of 750 participants will be achieved by Q1.',
    recommendedAction: 'Trigger automated data synthesis pipeline to stage preliminary efficacy dossier.',
    ownerAgent: 'Finance Oracle',
  },
  {
    id: 'rad-fore-2',
    title: 'SUDS Distress Downregulation Trajectory',
    quadrant: 'forecast',
    distance: 72,
    angleDeg: 335,
    severityOrImpact: 'medium',
    summary: 'Longitudinal analysis across 650 participants shows a 34.2% mean reduction in subjective distress after 14 days of Polyvagal 4-7-8 pacing.',
    recommendedAction: 'Publish peer-reviewed clinical telemetry brief to partner behavioral health clinics.',
    ownerAgent: 'Operations Commander',
  },
];

export const StrategicRadar: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<StrategicRadarItem | null>(initialRadarItems[0]);
  const [filterQuadrant, setFilterQuadrant] = useState<string>('all');

  const handleSelectBlip = (item: StrategicRadarItem) => {
    if (item.quadrant === 'risk') {
      audioEngine.playWarningSignal();
    } else {
      audioEngine.playPositiveSignal();
    }
    setSelectedItem(item);
  };

  const filteredItems = filterQuadrant === 'all'
    ? initialRadarItems
    : initialRadarItems.filter((i) => i.quadrant === filterQuadrant);

  // SVG coordinate transformation from Polar (angle, distance) to Cartesian (x, y)
  // Center is (200, 200), radius is 170.
  const polarToCartesian = (angleDeg: number, distancePct: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const r = (distancePct / 100) * 160;
    return {
      x: 200 + r * Math.cos(rad),
      y: 200 + r * Math.sin(rad),
    };
  };

  return (
    <div className="glass-panel rounded-xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Strategic Radar // 360° Operational Awareness</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous vector tracking across Opportunity, Risk, Growth, and Forecast horizons.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/10 text-xs">
          {['all', 'growth', 'opportunity', 'risk', 'forecast'].map((q) => (
            <button
              key={q}
              onClick={() => {
                audioEngine.playPositiveSignal();
                setFilterQuadrant(q);
              }}
              className={`px-2.5 py-1 rounded capitalize transition-colors ${
                filterQuadrant === q
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Screen Visualizer (SVG) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[420px] aspect-square rounded-full border border-cyan-500/20 bg-[#040711] shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-center justify-center overflow-hidden">
            {/* Background Radial Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40" />

            {/* Sweep Hand Animation */}
            <div className="absolute inset-0 origin-center animate-radar-sweep pointer-events-none">
              <div className="w-1/2 h-full bg-gradient-to-l from-cyan-400/15 to-transparent origin-right transform -rotate-90" />
            </div>

            {/* SVG Overlays & Blips */}
            <svg viewBox="0 0 400 400" className="w-full h-full relative z-10">
              {/* Concentric distance rings */}
              <circle cx="200" cy="200" r="40" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
              <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />

              {/* Crosshairs */}
              <line x1="200" y1="20" x2="200" y2="380" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
              <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

              {/* Quadrant Labels */}
              <text x="320" y="45" fill="rgba(56, 189, 248, 0.6)" fontSize="10" fontFamily="monospace" textAnchor="middle">GROWTH</text>
              <text x="80" y="45" fill="rgba(168, 85, 247, 0.6)" fontSize="10" fontFamily="monospace" textAnchor="middle">OPPORTUNITY</text>
              <text x="80" y="365" fill="rgba(239, 68, 68, 0.6)" fontSize="10" fontFamily="monospace" textAnchor="middle">RISK</text>
              <text x="320" y="365" fill="rgba(34, 197, 94, 0.6)" fontSize="10" fontFamily="monospace" textAnchor="middle">FORECAST</text>

              {/* Center Core */}
              <circle cx="200" cy="200" r="4" fill="#38bdf8" />
              <circle cx="200" cy="200" r="8" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />

              {/* Blips */}
              {filteredItems.map((item) => {
                const pos = polarToCartesian(item.angleDeg, item.distance);
                const isSelected = selectedItem?.id === item.id;
                let color = '#38bdf8'; // cyan
                if (item.quadrant === 'risk') color = '#ef4444'; // red
                if (item.quadrant === 'opportunity') color = '#c084fc'; // purple
                if (item.quadrant === 'forecast') color = '#4ade80'; // green

                return (
                  <g
                    key={item.id}
                    onClick={() => handleSelectBlip(item)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for selected or critical */}
                    {(isSelected || item.severityOrImpact === 'critical') && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="12"
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        opacity="0.8"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? '6' : '4.5'}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '2' : '1'}
                      className="transition-transform group-hover:scale-125"
                    />
                    <text
                      x={pos.x + 8}
                      y={pos.y + 3}
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="monospace"
                      opacity={isSelected ? 1 : 0.75}
                      className="pointer-events-none"
                    >
                      {item.title.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Blip Detail Panel */}
        <div className="lg:col-span-5">
          {selectedItem ? (
            <div className="bg-[#050811]/90 rounded-xl p-4 border border-cyan-500/30">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                <span className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase">
                  {selectedItem.quadrant} // Vector Detail
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                  selectedItem.quadrant === 'risk'
                    ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                    : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                }`}>
                  {selectedItem.severityOrImpact} Impact
                </span>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight">
                {selectedItem.title}
              </h4>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedItem.summary}
              </p>

              <div className="my-3 p-3 bg-white/[0.02] rounded border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Horizon Proximity:</span>
                  <span className="font-mono text-cyan-300 font-semibold tabular-nums">
                    {100 - selectedItem.distance}% Imminent
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Responsible Agent:</span>
                  <span className="font-mono text-slate-200">
                    {selectedItem.ownerAgent}
                  </span>
                </div>
              </div>

              <div className="bg-cyan-950/30 border border-cyan-500/20 rounded p-3 mb-3">
                <span className="text-[10px] font-mono text-cyan-400 block uppercase font-semibold mb-1">
                  Sovereign Recommended Directive
                </span>
                <p className="text-xs text-cyan-100 font-medium">
                  {selectedItem.recommendedAction}
                </p>
              </div>

              <button
                onClick={() => {
                  audioEngine.playCompletionSignal();
                }}
                className="w-full py-2 rounded text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Deploy Sovereign Intervention</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select any blip on the Strategic Radar to inspect threat and opportunity vectors.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
