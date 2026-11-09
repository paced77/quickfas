import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Shield,
  Layers,
  Cpu,
  Activity,
  FileCheck2,
  Compass,
  ArrowUpRight,
  Download,
  Copy,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine.ts';

export const UnifiedMasterExecutivePortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spi' | 'board' | 'matrix' | 'roadmap' | 'products'>('spi');

  // Interactive KPI State for Sovereign Performance Index (SPI)
  const [docEfficiency, setDocEfficiency] = useState<number>(88); // 88%
  const [userAdoption, setUserAdoption] = useState<number>(85); // 85%
  const [careCoordination, setCareCoordination] = useState<number>(82); // 82%
  const [patientSatisfaction, setPatientSatisfaction] = useState<number>(90); // 90%

  const [complianceScore, setComplianceScore] = useState<number>(94); // 94%
  const [auditReadiness, setAuditReadiness] = useState<number>(92); // 92%
  const [policyCoverage, setPolicyCoverage] = useState<number>(88); // 88%
  const [riskReduction, setRiskReduction] = useState<number>(84); // 84%

  const [missionCompletion, setMissionCompletion] = useState<number>(86); // 86%
  const [goalProgress, setGoalProgress] = useState<number>(84); // 84%
  const [resourceUtilization, setResourceUtilization] = useState<number>(88); // 88%
  const [executiveEngagement, setExecutiveEngagement] = useState<number>(90); // 90%

  // Executive Board Panel Parameters
  const [criticalFindings, setCriticalFindings] = useState<number>(0);
  const [evidenceCompletion, setEvidenceCompletion] = useState<number>(96); // 96%
  const [copied, setCopied] = useState<boolean>(false);

  // Exact Formulas as Defined in the Master Document:
  // Clinical Health Index = (DocEff * 30%) + (Adoption * 25%) + (CareCoord * 25%) + (PatSat * 20%)
  const clinicalHealthIndex =
    docEfficiency * 0.3 +
    userAdoption * 0.25 +
    careCoordination * 0.25 +
    patientSatisfaction * 0.2;

  // Governance Health Index = (Compliance * 35%) + (AuditReadiness * 25%) + (PolicyCoverage * 20%) + (RiskReduction * 20%)
  const governanceHealthIndex =
    complianceScore * 0.35 +
    auditReadiness * 0.25 +
    policyCoverage * 0.2 +
    riskReduction * 0.2;

  // Strategic Health Index = (MissionCompletion * 30%) + (GoalProgress * 30%) + (ResourceUtilization * 20%) + (ExecEngagement * 20%)
  const strategicHealthIndex =
    missionCompletion * 0.3 +
    goalProgress * 0.3 +
    resourceUtilization * 0.2 +
    executiveEngagement * 0.2;

  // Sovereign Performance Index (SPI) = (Clinical * 40%) + (Governance * 30%) + (Strategic * 30%)
  const sovereignPerformanceIndex =
    clinicalHealthIndex * 0.4 +
    governanceHealthIndex * 0.3 +
    strategicHealthIndex * 0.3;

  const getSpiStatus = (score: number) => {
    if (score >= 90) return { label: 'Transformational', color: 'text-emerald-400', badge: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' };
    if (score >= 80) return { label: 'High Performing', color: 'text-cyan-400', badge: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' };
    if (score >= 70) return { label: 'Operational', color: 'text-blue-400', badge: 'bg-blue-950/80 border-blue-500/50 text-blue-300' };
    if (score >= 60) return { label: 'Improvement Needed', color: 'text-amber-400', badge: 'bg-amber-950/80 border-amber-500/50 text-amber-300' };
    return { label: 'At Risk', color: 'text-red-400', badge: 'bg-red-950/80 border-red-500/50 text-red-300' };
  };

  // Go / No-Go Executive Panel Logic:
  // IF(AND(Score>=90, Critical=0, Evidence>=95%), "GO",
  // IF(AND(Score>=80, Critical<=2, Evidence>=90%), "CONDITIONAL GO", "NO-GO"))
  const getExecutiveVerdict = () => {
    if (sovereignPerformanceIndex >= 90 && criticalFindings === 0 && evidenceCompletion >= 95) {
      return { status: 'GO', badge: 'bg-emerald-500 text-slate-950', border: 'border-emerald-500/60', text: 'Unanimous Board Clearance Approved. Proceed with enterprise scaling and capital expansion.' };
    }
    if (sovereignPerformanceIndex >= 80 && criticalFindings <= 2 && evidenceCompletion >= 90) {
      return { status: 'CONDITIONAL GO', badge: 'bg-amber-500 text-slate-950', border: 'border-amber-500/60', text: 'Conditional Clearance Approved. Phase 1 pilot authorized with bi-weekly control checks.' };
    }
    return { status: 'NO-GO', badge: 'bg-red-500 text-white', border: 'border-red-500/60', text: 'No-Go Directive. Resolve critical audit findings and increase evidence completion above 90%.' };
  };

  const spiStatus = getSpiStatus(sovereignPerformanceIndex);
  const executiveVerdict = getExecutiveVerdict();

  const handleCopySummary = () => {
    audioEngine.playPositiveSignal();
    const summary = `PROJECT KINGDOM & STRATUM CLINICAL EDGE
UNIFIED EXECUTIVE MASTER REPORT
Sovereign Performance Index (SPI): ${sovereignPerformanceIndex.toFixed(1)} / 100 (${spiStatus.label})
- Clinical Health Index: ${clinicalHealthIndex.toFixed(1)}% (Weight 40%)
- Governance Health Index: ${governanceHealthIndex.toFixed(1)}% (Weight 30%)
- Strategic Health Index: ${strategicHealthIndex.toFixed(1)}% (Weight 30%)

Executive Board Verdict: ${executiveVerdict.status}
- Evidence Completion: ${evidenceCompletion}%
- Critical Audit Findings: ${criticalFindings}

Ecosystem Layers:
1. Stratum Clinical Edge (Clinical Intelligence & Care Operations)
2. QuickFAS Governance Cloud (Audit Readiness & Compliance Controls)
3. Project Kingdom Command (Executive Strategy & Digital Twins)
Sovereign Intelligence Network Scale: Active`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="glass-panel rounded-xl p-5 border border-cyan-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded font-bold">
                Unified Strategic Architecture
              </span>
              <span className="text-xs text-slate-400 font-mono">Stage 1 → 2 → 3 Sovereign Evolution</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Project Kingdom, QuickFAS &amp; Stratum Clinical Edge
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Three synchronized operating layers forming a singular Sovereign Intelligence Ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopySummary}
              className="glow-btn-secondary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Summary' : 'Copy Executive Brief'}</span>
            </button>
          </div>
        </div>

        {/* 3-Tier Layer Architecture Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-[#050811]/70 p-3.5 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
              <span>STAGE 1: CLINICAL LAYER</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Stratum Clinical Edge</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Clinical Command Center, FHIR Interoperability, Digital Records, Urgency Scoring, and Grade 6–8 Plain-Language Education.
            </p>
            <div className="mt-2 text-[10px] font-mono text-cyan-300/80">Weight in SPI: 40%</div>
          </div>

          <div className="bg-[#050811]/70 p-3.5 rounded-lg border border-emerald-500/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1">
              <span>STAGE 2: GOVERNANCE LAYER</span>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">QuickFAS Governance Cloud</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Continuous Audit Readiness, Access Approval Monitoring, Policy Tracking, Evidence Repository, and Risk Analytics.
            </p>
            <div className="mt-2 text-[10px] font-mono text-emerald-300/80">Weight in SPI: 30%</div>
          </div>

          <div className="bg-[#050811]/70 p-3.5 rounded-lg border border-indigo-500/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-indigo-400 mb-1">
              <span>STAGE 3: COMMAND LAYER</span>
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Project Kingdom Command</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Executive Decision Matrix, Mission Control, Strategic Radar, AI Council, Digital Twins, and Investor Portal.
            </p>
            <div className="mt-2 text-[10px] font-mono text-indigo-300/80">Weight in SPI: 30%</div>
          </div>
        </div>
      </div>

      {/* Sub-View Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('spi')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'spi'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Sovereign Performance Index (SPI)</span>
        </button>

        <button
          onClick={() => setActiveTab('board')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'board'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Executive Board Panel (Go / No-Go)</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'matrix'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cross-Platform Capability Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'roadmap'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>4-Phase Product Roadmap</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'products'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Commercial Product Strategy</span>
        </button>
      </div>

      {/* TAB 1: SOVEREIGN PERFORMANCE INDEX (SPI) */}
      {activeTab === 'spi' && (
        <div className="space-y-6">
          {/* Main SPI Banner */}
          <div className="glass-panel-elevated rounded-xl p-5 border border-cyan-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold block">
                  Unified Enterprise Sovereign Performance Index (SPI)
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-0.5 flex items-center gap-3">
                  <span className="text-3xl font-mono tabular-nums text-cyan-300">
                    {sovereignPerformanceIndex.toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-lg font-normal">/ 100.0</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border uppercase font-bold ${spiStatus.badge}`}>
                    {spiStatus.label}
                  </span>
                </h3>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                <div>Formula: <span className="text-cyan-300 font-semibold">(Clinical×40%) + (Gov×30%) + (Strategic×30%)</span></div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Tier: Transformational Threshold &gt; 90.0</div>
              </div>
            </div>

            {/* 3 Pillars Summary Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#050811] p-3.5 rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>CLINICAL HEALTH INDEX</span>
                  <span className="text-cyan-300 font-bold tabular-nums text-sm">{clinicalHealthIndex.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${clinicalHealthIndex}%` }} />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">Weight: 40% of SPI · Grade 6–8 Literacy Invariant</div>
              </div>

              <div className="bg-[#050811] p-3.5 rounded-lg border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>GOVERNANCE HEALTH INDEX</span>
                  <span className="text-emerald-300 font-bold tabular-nums text-sm">{governanceHealthIndex.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${governanceHealthIndex}%` }} />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">Weight: 30% of SPI · Audit Readiness &amp; Compliance</div>
              </div>

              <div className="bg-[#050811] p-3.5 rounded-lg border border-indigo-500/30">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>STRATEGIC HEALTH INDEX</span>
                  <span className="text-indigo-300 font-bold tabular-nums text-sm">{strategicHealthIndex.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${strategicHealthIndex}%` }} />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">Weight: 30% of SPI · Mission Completion &amp; Executive Adoption</div>
              </div>
            </div>
          </div>

          {/* Interactive KPI Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Clinical Edge KPIs */}
            <div className="glass-panel rounded-xl p-4 border border-cyan-500/20">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase pb-2 border-b border-white/5 mb-3 flex items-center justify-between">
                <span>Stage 1: Clinical Edge KPIs</span>
                <span>Sub-Index: {clinicalHealthIndex.toFixed(1)}%</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Documentation Efficiency (30%)</span>
                    <span className="text-cyan-300 font-bold">{docEfficiency}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={docEfficiency} onChange={(e) => setDocEfficiency(Number(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">User Adoption (25%)</span>
                    <span className="text-cyan-300 font-bold">{userAdoption}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={userAdoption} onChange={(e) => setUserAdoption(Number(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Care Coordination (25%)</span>
                    <span className="text-cyan-300 font-bold">{careCoordination}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={careCoordination} onChange={(e) => setCareCoordination(Number(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Patient Satisfaction (20%)</span>
                    <span className="text-cyan-300 font-bold">{patientSatisfaction}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={patientSatisfaction} onChange={(e) => setPatientSatisfaction(Number(e.target.value))} className="w-full accent-cyan-400" />
                </div>
              </div>
            </div>

            {/* 2. QuickFAS Governance KPIs */}
            <div className="glass-panel rounded-xl p-4 border border-emerald-500/20">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase pb-2 border-b border-white/5 mb-3 flex items-center justify-between">
                <span>Stage 2: QuickFAS Governance KPIs</span>
                <span>Sub-Index: {governanceHealthIndex.toFixed(1)}%</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Compliance Score (35%)</span>
                    <span className="text-emerald-300 font-bold">{complianceScore}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={complianceScore} onChange={(e) => setComplianceScore(Number(e.target.value))} className="w-full accent-emerald-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Audit Readiness (25%)</span>
                    <span className="text-emerald-300 font-bold">{auditReadiness}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={auditReadiness} onChange={(e) => setAuditReadiness(Number(e.target.value))} className="w-full accent-emerald-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Policy Coverage (20%)</span>
                    <span className="text-emerald-300 font-bold">{policyCoverage}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={policyCoverage} onChange={(e) => setPolicyCoverage(Number(e.target.value))} className="w-full accent-emerald-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Risk Reduction (20%)</span>
                    <span className="text-emerald-300 font-bold">{riskReduction}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={riskReduction} onChange={(e) => setRiskReduction(Number(e.target.value))} className="w-full accent-emerald-400" />
                </div>
              </div>
            </div>

            {/* 3. Project Kingdom Command KPIs */}
            <div className="glass-panel rounded-xl p-4 border border-indigo-500/20">
              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase pb-2 border-b border-white/5 mb-3 flex items-center justify-between">
                <span>Stage 3: Kingdom Command KPIs</span>
                <span>Sub-Index: {strategicHealthIndex.toFixed(1)}%</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Mission Completion (30%)</span>
                    <span className="text-indigo-300 font-bold">{missionCompletion}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={missionCompletion} onChange={(e) => setMissionCompletion(Number(e.target.value))} className="w-full accent-indigo-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Goal Progress (30%)</span>
                    <span className="text-indigo-300 font-bold">{goalProgress}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={goalProgress} onChange={(e) => setGoalProgress(Number(e.target.value))} className="w-full accent-indigo-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Resource Utilization (20%)</span>
                    <span className="text-indigo-300 font-bold">{resourceUtilization}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={resourceUtilization} onChange={(e) => setResourceUtilization(Number(e.target.value))} className="w-full accent-indigo-400" />
                </div>
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">Executive Engagement (20%)</span>
                    <span className="text-indigo-300 font-bold">{executiveEngagement}%</span>
                  </div>
                  <input type="range" min="50" max="100" value={executiveEngagement} onChange={(e) => setExecutiveEngagement(Number(e.target.value))} className="w-full accent-indigo-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTIVE BOARD PANEL (GO / NO-GO) */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          <div className="glass-panel-elevated rounded-xl p-5 border border-cyan-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold block">
                  Executive Board Clearance Decision Panel
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  Automated Go / No-Go Decision Logic
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-slate-400">Board Ruling:</span>
                <span className={`text-xs px-3 py-1 rounded-md uppercase font-black tracking-wider ${executiveVerdict.badge}`}>
                  {executiveVerdict.status}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border bg-black/40 ${executiveVerdict.border} mb-5`}>
              <div className="flex items-start gap-3">
                {executiveVerdict.status === 'GO' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : executiveVerdict.status === 'CONDITIONAL GO' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Decision Directive: {executiveVerdict.status}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {executiveVerdict.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Threshold Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono bg-[#050811] p-4 rounded-lg border border-white/5">
              <div>
                <span className="text-slate-400 block mb-1">Sovereign Performance Index</span>
                <span className="text-lg font-bold text-cyan-300 tabular-nums">
                  {sovereignPerformanceIndex.toFixed(1)} / 100
                </span>
                <div className="text-[10px] text-slate-500 mt-0.5">Threshold: &gt;= 90 for Full Go, &gt;= 80 for Conditional</div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Evidence Completion: <span className="text-emerald-400 font-bold">{evidenceCompletion}%</span>
                </label>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={evidenceCompletion}
                  onChange={(e) => setEvidenceCompletion(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 mt-0.5">Threshold: &gt;= 95% for Full Go, &gt;= 90% for Conditional</div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Critical Audit Findings: <span className="text-amber-400 font-bold">{criticalFindings}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={criticalFindings}
                  onChange={(e) => setCriticalFindings(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 mt-0.5">Threshold: 0 for Full Go, &lt;= 2 for Conditional</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CROSS-PLATFORM CAPABILITY MATRIX */}
      {activeTab === 'matrix' && (
        <div className="glass-panel rounded-xl p-5 border border-cyan-500/20">
          <div className="pb-3 border-b border-white/10 mb-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono">
              Ecosystem Capability Allocation Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verification that capabilities are uniquely assigned across the 3 layers without functional overlap.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-white/10 rounded-lg overflow-hidden font-mono">
              <thead className="bg-[#050811] text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="p-3">Capability</th>
                  <th className="p-3 text-center text-cyan-300">Stage 1: Stratum</th>
                  <th className="p-3 text-center text-emerald-300">Stage 2: QuickFAS</th>
                  <th className="p-3 text-center text-indigo-300">Stage 3: Kingdom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'Clinical Intelligence & Urgency Scoring', s: true, q: false, k: false },
                  { name: 'FHIR Interoperability & Pacing Labs', s: true, q: false, k: false },
                  { name: 'Clinical Registries & Cohort Tracking', s: true, q: false, k: false },
                  { name: 'Care Coordination & Plain-Language Delivery', s: true, q: false, k: false },
                  { name: 'Audit Management & Evidence Collection', s: false, q: true, k: false },
                  { name: 'Compliance Automation (21 CFR Part 11 / HIPAA)', s: false, q: true, k: false },
                  { name: 'Risk Monitoring & Heat Map Distribution', s: false, q: true, k: true },
                  { name: 'Governance Analytics & Control Logs', s: false, q: true, k: true },
                  { name: 'Strategic Planning & Radar Vectors', s: false, q: false, k: true },
                  { name: 'Executive Spoken Briefing (The 4 Questions)', s: false, q: false, k: true },
                  { name: 'Mission Control & Campaign Progress', s: false, q: false, k: true },
                  { name: 'Digital Twins & Ripple Simulations', s: false, q: false, k: true },
                  { name: 'Investor Reporting & Cap Table Modeling', s: false, q: false, k: true },
                  { name: 'Portfolio Management & Sovereign Network', s: false, q: false, k: true },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-sans font-medium text-slate-200">{row.name}</td>
                    <td className="p-3 text-center">
                      {row.s ? <CheckCircle2 className="w-4 h-4 text-cyan-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      {row.q ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      {row.k ? <CheckCircle2 className="w-4 h-4 text-indigo-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: 4-PHASE PRODUCT ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                Phase 1 // Months 0–6
              </span>
              <h4 className="text-sm font-bold text-white">Foundational Integration</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Hospital pilots, FHIR optimization, audit control library, and executive command dashboard rollout.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• 3 Healthcare Pilots Target</div>
              <div>• 95% User Satisfaction</div>
              <div>• 100% Audit Traceability</div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                Phase 2 // Months 6–12
              </span>
              <h4 className="text-sm font-bold text-white">Unified Telemetry Fabric</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Shared data mesh across all 17 pockets, centralized SSO, cross-platform metrics, and AI governance layer.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• Shared Telemetry Fabric</div>
              <div>• Single Sign-On Architecture</div>
              <div>• Unified Analytics Engine</div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-indigo-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block mb-1">
                Phase 3 // Months 12–24
              </span>
              <h4 className="text-sm font-bold text-white">Digital Twin Marketplace</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Packaged digital twin simulation products deployed to counties, healthcare networks, and academic systems.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• Rural Health Twin</div>
              <div>• Education &amp; Literacy Twin</div>
              <div>• County Operations Twin</div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-purple-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block mb-1">
                Phase 4 // Months 24–36
              </span>
              <h4 className="text-sm font-bold text-white">Sovereign Intelligence Network</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Many communities and organizations unified under one sovereign operating layer with multi-agent consensus.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• Regional Coordination Nodes</div>
              <div>• Autonomous Insight Generation</div>
              <div>• Cross-Organization Intelligence</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMMERCIAL PRODUCT STRATEGY */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel rounded-xl p-5 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1">PRODUCT 01</div>
              <h3 className="text-base font-bold text-white">Stratum Clinical Edge</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Clinical intelligence and operational efficiency for rural clinics, integrated care networks, and hospitals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs font-mono">
              <div className="text-slate-400">Target: <span className="text-white">Health Systems &amp; Providers</span></div>
              <div className="text-slate-400">Model: <span className="text-cyan-300 font-bold">SaaS + Per-Provider Contracts</span></div>
              <div className="text-slate-400">ARR Run-Rate: <span className="text-emerald-400 font-bold">$14.2M</span></div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold mb-1">PRODUCT 02</div>
              <h3 className="text-base font-bold text-white">QuickFAS Governance Cloud</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Continuous audit readiness, evidence collection, and automated access approval governance for regulated sectors.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs font-mono">
              <div className="text-slate-400">Target: <span className="text-white">Compliance &amp; Public Sector</span></div>
              <div className="text-slate-400">Model: <span className="text-emerald-300 font-bold">Compliance Subscriptions</span></div>
              <div className="text-slate-400">Traceability: <span className="text-cyan-300 font-bold">100% Invariant</span></div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 border border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold mb-1">PRODUCT 03</div>
              <h3 className="text-base font-bold text-white">Project Kingdom Command</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Executive command center for mission execution, digital twin simulations, and sovereign AI advisory.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs font-mono">
              <div className="text-slate-400">Target: <span className="text-white">Leaders, Executives &amp; Investors</span></div>
              <div className="text-slate-400">Model: <span className="text-indigo-300 font-bold">Enterprise SaaS + Twin Services</span></div>
              <div className="text-slate-400">Consensus: <span className="text-cyan-300 font-bold">94% Agreement Score</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
