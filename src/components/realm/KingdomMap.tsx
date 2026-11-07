import React, { useState } from 'react';
import { Compass, ShieldAlert, Cpu, Activity, DollarSign, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RealmSector } from '../../types/kingdom.ts';
import { audioEngine } from '../../services/audioEngine.ts';

export const realmSectors: RealmSector[] = [
  {
    id: 'sec-core',
    name: 'Central Citadel (Sovereign Core)',
    code: 'SEC-01-CORE',
    ruler: 'Sovereign Strategist',
    readinessPct: 98,
    threatLevel: 'Low',
    activeInitiatives: 6,
    coordinates: { x: 250, y: 190 },
    dependencies: ['Clinical Mesh', 'Treasury Keep', 'Operations Bastion', 'Cyber Sentry Bastion'],
  },
  {
    id: 'sec-clinical',
    name: 'Clinical Mesh (Northern Dominion)',
    code: 'SEC-02-CLIN',
    ruler: 'Clinical Director',
    readinessPct: 94,
    threatLevel: 'Guarded',
    activeInitiatives: 8,
    coordinates: { x: 250, y: 70 },
    dependencies: ['Central Citadel', 'Operations Bastion'],
  },
  {
    id: 'sec-treasury',
    name: 'Treasury Keep (Eastern Realm)',
    code: 'SEC-03-CAP',
    ruler: 'Finance Oracle',
    readinessPct: 99,
    threatLevel: 'Low',
    activeInitiatives: 4,
    coordinates: { x: 400, y: 190 },
    dependencies: ['Central Citadel'],
  },
  {
    id: 'sec-ops',
    name: 'Operations Bastion (Southern Quadrant)',
    code: 'SEC-04-OPS',
    ruler: 'Operations Commander',
    readinessPct: 96,
    threatLevel: 'Low',
    activeInitiatives: 7,
    coordinates: { x: 250, y: 310 },
    dependencies: ['Central Citadel', 'Clinical Mesh'],
  },
  {
    id: 'sec-cyber',
    name: 'Cyber Sentry Bastion (Western Bulwark)',
    code: 'SEC-05-SEC',
    ruler: 'Security Sentinel',
    readinessPct: 100,
    threatLevel: 'Low',
    activeInitiatives: 5,
    coordinates: { x: 100, y: 190 },
    dependencies: ['Central Citadel', 'Treasury Keep'],
  },
];

export const KingdomMap: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<RealmSector>(realmSectors[0]);

  const handleSelectSector = (sec: RealmSector) => {
    audioEngine.playPositiveSignal();
    setSelectedSector(sec);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Illustrative Kingdom Map // Example Topology
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Visualize Systems, Teams, Projects, and Cross-Sector Dependencies
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              5 sample sectors · illustrative initiatives · no live telemetry connection
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded">
            Sample Map Data
          </span>
        </div>

        {/* Map Canvas + Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Interactive Map Visualizer */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[480px] aspect-[5/4] bg-[#040813] rounded-2xl border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.12)] p-4 flex items-center justify-center overflow-hidden">
              {/* Strategic Grid */}
              <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

              <svg viewBox="0 0 500 380" className="w-full h-full relative z-10">
                <defs>
                  <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Dependency Connecting Lines */}
                {/* Central to Clinical */}
                <line x1="250" y1="190" x2="250" y2="70" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="4 4" />
                {/* Central to Treasury */}
                <line x1="250" y1="190" x2="400" y2="190" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="4 4" />
                {/* Central to Operations */}
                <line x1="250" y1="190" x2="250" y2="310" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="4 4" />
                {/* Central to Cyber */}
                <line x1="250" y1="190" x2="100" y2="190" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="4 4" />
                {/* Cross-sector links */}
                <line x1="100" y1="190" x2="250" y2="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="400" y1="190" x2="250" y2="310" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Sector Nodes */}
                {realmSectors.map((sector) => {
                  const isSelected = selectedSector.id === sector.id;
                  const isCore = sector.id === 'sec-core';

                  return (
                    <g
                      key={sector.id}
                      onClick={() => handleSelectSector(sector)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Pulse Ring */}
                      {isSelected && (
                        <circle
                          cx={sector.coordinates.x}
                          cy={sector.coordinates.y}
                          r={isCore ? 34 : 26}
                          fill="none"
                          stroke="#6ee7ff"
                          strokeWidth="2"
                          opacity="0.8"
                          className="animate-ping"
                        />
                      )}

                      {/* Sector Hexagon / Circle Base */}
                      <circle
                        cx={sector.coordinates.x}
                        cy={sector.coordinates.y}
                        r={isCore ? 28 : 20}
                        fill={isSelected ? '#0f2942' : '#0a1628'}
                        stroke={isSelected ? '#6ee7ff' : '#22d3ee'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="transition-all group-hover:scale-110"
                      />

                      {/* Inner Indicator */}
                      <circle
                        cx={sector.coordinates.x}
                        cy={sector.coordinates.y}
                        r={isCore ? 8 : 5}
                        fill={sector.threatLevel === 'Guarded' ? '#f59e0b' : '#10b981'}
                      />

                      {/* Label */}
                      <text
                        x={sector.coordinates.x}
                        y={sector.coordinates.y + (isCore ? 44 : 34)}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize={isCore ? '11' : '10'}
                        fontFamily="monospace"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                      >
                        {sector.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Sector Details Inspector */}
          <div className="lg:col-span-5">
            <div className="glass-panel-elevated rounded-xl p-5 border border-cyan-500/30">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                <span className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase">
                  {selectedSector.code} // Sector Dossier
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  selectedSector.threatLevel === 'Guarded'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                }`}>
                  Threat: {selectedSector.threatLevel}
                </span>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight">
                {selectedSector.name}
              </h4>

              <div className="my-3 space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Governing Sovereign Leader:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedSector.ruler}</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Sector Readiness Score:</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">{selectedSector.readinessPct}%</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Active Operational Initiatives:</span>
                  <span className="font-mono text-white font-bold tabular-nums">{selectedSector.activeInitiatives} Initiatives</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">
                  Cross-Realm Dependencies:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedSector.dependencies.map((dep, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => audioEngine.playCompletionSignal()}
                className="mt-4 w-full py-2 rounded text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Audit Sector Communications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
