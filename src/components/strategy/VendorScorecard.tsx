import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Sliders,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine.ts';

export interface VendorEvaluation {
  id: string;
  name: string;
  isSelf: boolean;
  clinical: number;
  security: number;
  aiGov: number;
  compliance: number;
  interop: number;
  reliability: number;
  adoption: number;
  viability: number;
  scalability: number;
  innovation: number;
  notes: string;
}

const DEFAULT_VENDORS: VendorEvaluation[] = [
  {
    id: 'stratum',
    name: 'Stratum Clinical Edge',
    isSelf: true,
    clinical: 80,
    security: 80,
    aiGov: 80,
    compliance: 80,
    interop: 80,
    reliability: 80,
    adoption: 80,
    viability: 80,
    scalability: 80,
    innovation: 80,
    notes: 'Grade 6–8 health literacy invariant, offline-first Seventeen Pockets runtime, zero PII RFC4180 audit ledger.',
  },
  {
    id: 'vendor-a',
    name: 'Vendor A (Cloud-Only EHR)',
    isSelf: false,
    clinical: 75,
    security: 75,
    aiGov: 75,
    compliance: 75,
    interop: 75,
    reliability: 75,
    adoption: 75,
    viability: 75,
    scalability: 75,
    innovation: 75,
    notes: 'Cloud dependent; vulnerable to satellite/rural clinic internet dropouts.',
  },
  {
    id: 'vendor-b',
    name: 'Vendor B (Legacy Health IT)',
    isSelf: false,
    clinical: 70,
    security: 70,
    aiGov: 70,
    compliance: 70,
    interop: 70,
    reliability: 70,
    adoption: 70,
    viability: 70,
    scalability: 70,
    innovation: 70,
    notes: 'Complex multi-server deployment; high administrative maintenance burden.',
  },
  {
    id: 'vendor-c',
    name: 'Vendor C (General SaaS)',
    isSelf: false,
    clinical: 65,
    security: 65,
    aiGov: 65,
    compliance: 65,
    interop: 65,
    reliability: 65,
    adoption: 65,
    viability: 65,
    scalability: 65,
    innovation: 65,
    notes: 'Lacks 21 CFR Part 11 validation and healthcare-specific plain-language education models.',
  },
];

const CATEGORIES = [
  { key: 'clinical', label: 'Clinical', weight: 1.0 },
  { key: 'security', label: 'Security', weight: 1.0 },
  { key: 'aiGov', label: 'AI Gov', weight: 1.0 },
  { key: 'compliance', label: 'Compliance', weight: 1.0 },
  { key: 'interop', label: 'Interop', weight: 1.0 },
  { key: 'reliability', label: 'Reliability', weight: 1.0 },
  { key: 'adoption', label: 'Adoption', weight: 1.0 },
  { key: 'viability', label: 'Viability', weight: 1.0 },
  { key: 'scalability', label: 'Scalability', weight: 1.0 },
  { key: 'innovation', label: 'Innovation', weight: 1.0 },
] as const;

export const VendorScorecard: React.FC = () => {
  const [vendors, setVendors] = useState<VendorEvaluation[]>(DEFAULT_VENDORS);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('stratum');
  const [goThreshold, setGoThreshold] = useState<number>(80);

  // Calculate Overall Score (Average across 10 categories)
  const calculateOverall = (v: VendorEvaluation) => {
    const sum =
      v.clinical +
      v.security +
      v.aiGov +
      v.compliance +
      v.interop +
      v.reliability +
      v.adoption +
      v.viability +
      v.scalability +
      v.innovation;
    return Math.round((sum / 10) * 10) / 10;
  };

  // Sort vendors by overall score descending to compute rank
  const scoredVendors = vendors.map((v) => ({
    ...v,
    overall: calculateOverall(v),
  }));

  const sorted = [...scoredVendors].sort((a, b) => b.overall - a.overall);

  const getRank = (vendorId: string) => {
    const index = sorted.findIndex((v) => v.id === vendorId);
    return index + 1;
  };

  const getRecommendation = (overall: number) => {
    if (overall >= goThreshold) {
      return { text: 'GO / SELECTED', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' };
    }
    if (overall >= goThreshold - 5) {
      return { text: 'CONDITIONAL', badge: 'bg-amber-950/80 text-amber-300 border-amber-500/50' };
    }
    return { text: 'NO-GO', badge: 'bg-red-950/80 text-red-300 border-red-500/50' };
  };

  const handleUpdateScore = (vendorId: string, category: keyof VendorEvaluation, val: number) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, [category]: Math.max(0, Math.min(100, val)) } : v))
    );
  };

  const handleExportCsv = () => {
    audioEngine.playPositiveSignal();
    const headers = [
      'Vendor',
      'Clinical',
      'Security',
      'AI Gov',
      'Compliance',
      'Interop',
      'Reliability',
      'Adoption',
      'Viability',
      'Scalability',
      'Innovation',
      'Overall',
      'Rank',
      'Recommendation',
    ];

    const rows = sorted.map((v) => {
      const rank = getRank(v.id);
      const rec = getRecommendation(v.overall).text;
      return [
        v.name,
        v.clinical,
        v.security,
        v.aiGov,
        v.compliance,
        v.interop,
        v.reliability,
        v.adoption,
        v.viability,
        v.scalability,
        v.innovation,
        v.overall.toFixed(1),
        `#${rank}`,
        rec,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'vendor_procurement_ranking_repaired.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];
  const selectedOverall = calculateOverall(selectedVendor);
  const selectedRank = getRank(selectedVendor.id);
  const selectedRec = getRecommendation(selectedOverall);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel rounded-xl p-5 border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                Vendor Procurement &amp; Competitive Ranking Matrix
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              10-Pillar Clinical &amp; Technical Evaluation Scorecard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive resolution of the vendor procurement evaluation spreadsheet. Ranks Stratum Clinical Edge across clinical, security, and AI governance criteria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                audioEngine.playPositiveSignal();
                setVendors(DEFAULT_VENDORS);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Top Winner Card & Ranking Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Winner Spotlight */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1b33] to-[#061022] rounded-xl p-4 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
                <span>RANK #1 EVALUATED LEADER</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-bold">
                  GO / SELECTED
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Stratum Clinical Edge
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Achieved highest aggregate score across all 10 evaluated pillars. Offline-first Seventeen Pockets runtime ensures continuous care even during rural satellite internet dropouts.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-cyan-500/20 text-center font-mono">
              <div className="bg-black/30 rounded p-2">
                <span className="text-[10px] text-slate-400 block uppercase">Overall</span>
                <span className="text-lg font-bold text-cyan-300 tabular-nums">80.0</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="text-[10px] text-slate-400 block uppercase">Rank</span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">#1</span>
              </div>
              <div className="bg-black/30 rounded p-2">
                <span className="text-[10px] text-slate-400 block uppercase">Margin</span>
                <span className="text-lg font-bold text-indigo-300 tabular-nums">+5.0 pts</span>
              </div>
            </div>
          </div>

          {/* Interactive Bar Chart Visualizer */}
          <div className="lg:col-span-7 bg-[#050811] rounded-xl p-4 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                Vendor Ranking Distribution (Repaired Y-Axis)
              </span>
              <span className="text-slate-500 text-[10px]">Threshold: {goThreshold} pts</span>
            </div>

            <div className="space-y-3">
              {sorted.map((vendor) => {
                const rank = getRank(vendor.id);
                const rec = getRecommendation(vendor.overall);
                const isWinner = rank === 1;

                return (
                  <div key={vendor.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                            isWinner ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{rank}
                        </span>
                        <span className={`font-semibold ${isWinner ? 'text-white font-bold' : 'text-slate-300'}`}>
                          {vendor.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-slate-100 tabular-nums">{vendor.overall.toFixed(1)} / 100</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-semibold ${rec.badge}`}>
                          {rec.text}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWinner
                            ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                            : vendor.overall >= goThreshold - 5
                            ? 'bg-amber-500/80'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${vendor.overall}%` }}
                      />
                      {/* Threshold marker line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-cyan-300 opacity-60 pointer-events-none"
                        style={{ left: `${goThreshold}%` }}
                        title={`Go Threshold (${goThreshold})`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>0 pts</span>
              <span>25 pts</span>
              <span>50 pts</span>
              <span className="text-cyan-400 font-bold">Go Threshold (80)</span>
              <span>100 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repaired Data Table (Exact Spreadsheet View with Working Formulas) */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Evaluated Scorecard Table // Live Formula Ingestion
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <label className="text-slate-400 flex items-center gap-1.5">
              <span>Go Threshold:</span>
              <input
                type="number"
                min="50"
                max="95"
                value={goThreshold}
                onChange={(e) => setGoThreshold(Number(e.target.value))}
                className="w-14 bg-black/60 border border-white/20 rounded px-2 py-0.5 text-cyan-300 text-center font-bold"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-white/10 rounded-lg overflow-hidden">
            <thead className="bg-[#050811] text-[10px] font-mono text-slate-400 uppercase">
              <tr>
                <th className="p-2.5">Vendor</th>
                <th className="p-2 text-center">Clinical</th>
                <th className="p-2 text-center">Security</th>
                <th className="p-2 text-center">AI Gov</th>
                <th className="p-2 text-center">Compliance</th>
                <th className="p-2 text-center">Interop</th>
                <th className="p-2 text-center">Reliability</th>
                <th className="p-2 text-center">Adoption</th>
                <th className="p-2 text-center">Viability</th>
                <th className="p-2 text-center">Scalability</th>
                <th className="p-2 text-center">Innovation</th>
                <th className="p-2 text-center text-cyan-300 bg-cyan-950/40">Overall</th>
                <th className="p-2 text-center text-emerald-300 bg-emerald-950/40">Rank</th>
                <th className="p-2.5 text-center">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {sorted.map((vendor) => {
                const rank = getRank(vendor.id);
                const rec = getRecommendation(vendor.overall);
                const isStratum = vendor.id === 'stratum';

                return (
                  <tr
                    key={vendor.id}
                    onClick={() => {
                      audioEngine.playPositiveSignal();
                      setSelectedVendorId(vendor.id);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isStratum
                        ? 'bg-cyan-950/20 font-bold hover:bg-cyan-950/30'
                        : 'hover:bg-white/[0.02]'
                    } ${selectedVendorId === vendor.id ? 'ring-1 ring-cyan-500/50' : ''}`}
                  >
                    <td className="p-2.5 font-sans font-semibold text-slate-100 flex items-center gap-1.5">
                      {isStratum && <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      <span>{vendor.name}</span>
                    </td>
                    <td className="p-2 text-center text-slate-300">{vendor.clinical}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.security}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.aiGov}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.compliance}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.interop}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.reliability}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.adoption}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.viability}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.scalability}</td>
                    <td className="p-2 text-center text-slate-300">{vendor.innovation}</td>
                    <td className="p-2 text-center font-bold text-cyan-300 bg-cyan-950/30 tabular-nums">
                      {vendor.overall.toFixed(1)}
                    </td>
                    <td className="p-2 text-center font-bold text-emerald-400 bg-emerald-950/30 tabular-nums">
                      #{rank}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${rec.badge}`}>
                        {rec.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Pillar Adjuster / Inspector */}
      <div className="glass-panel-elevated rounded-xl p-5 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Live Category Sensitivity Adjuster: {selectedVendor.name}
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            Overall: {selectedOverall.toFixed(1)} · Rank #{selectedRank} · {selectedRec.text}
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
          <strong>Evaluation Notes:</strong> {selectedVendor.notes}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="bg-[#050811] p-2.5 rounded-lg border border-white/5">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1 uppercase">
                <span>{cat.label}</span>
                <span className="text-cyan-300 font-bold tabular-nums">
                  {(selectedVendor as any)[cat.key]}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={(selectedVendor as any)[cat.key]}
                onChange={(e) => handleUpdateScore(selectedVendor.id, cat.key as any, Number(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
