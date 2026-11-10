import React, { useState } from 'react';
import {
  Sparkles,
  Stethoscope,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers,
  Lock,
  Search,
  BookOpen,
  Building2,
  Network,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine.ts';

interface ConnectorItem {
  name: string;
  category: 'ehr' | 'admin' | 'evidence' | 'automation' | 'enterprise';
  description: string;
  status: 'active' | 'preview' | 'supported';
  protocol: string;
  iconSeed?: string;
}

const HEALTHCARE_CONNECTORS: ConnectorItem[] = [
  // Unified EHR Connectivity
  { name: 'Epic EHR (open.epic)', category: 'ehr', description: 'Direct, secure read integration for active conditions, medications, and labs without EHR write-back.', status: 'active', protocol: 'HL7 FHIR R4' },
  { name: 'Oracle Health (Ignite APIs)', category: 'ehr', description: 'Standardized FHIR connector for acute and ambulatory clinical record extraction.', status: 'active', protocol: 'Ignite FHIR API' },
  { name: 'InterSystems FHIR Server', category: 'ehr', description: 'High-performance clinical repository management and standardized healthcare data interoperability.', status: 'active', protocol: 'FHIR R4 Server' },
  { name: 'Verato Universal MPI', category: 'ehr', description: 'Next-generation patient identity resolution and deterministic MPI record matching across disparate visits.', status: 'active', protocol: 'Verato API' },
  { name: 'Keragon Health Fabric', category: 'ehr', description: 'HIPAA-compliant integration mesh linking over 400 specialized healthcare applications and devices.', status: 'supported', protocol: 'REST / Webhook' },

  // Payments, Admin & Terminology
  { name: 'CMS Coverage Database', category: 'admin', description: 'Direct lookup into federal Medicare & Medicaid national coverage determinations and policy rules.', status: 'active', protocol: 'CMS Data Lake' },
  { name: 'IMO Health Knowledge Graph', category: 'admin', description: 'Clinical terminology normalization mapping to ICD-10-CM, CPT, HCPCS, and SNOMED-CT.', status: 'active', protocol: 'IMO Terminology API' },
  { name: 'Optum Network & Eligibility', category: 'admin', description: 'Real-time coordination of benefits and eligibility verification across commercial and public payers.', status: 'preview', protocol: 'EDI 270/271' },
  { name: 'Infinitus Relay Automation', category: 'admin', description: 'Autonomous voice and digital prior authorization submission and benefit determination.', status: 'active', protocol: 'PriorAuth Fabric' },
  { name: 'GoodRx Formulary Intelligence', category: 'admin', description: 'Prescription pricing transparency and real-time copay assistance discovery for care teams.', status: 'supported', protocol: 'Formulary API' },

  // Medical & Scientific Repositories
  { name: 'Optum EvidenceVue', category: 'evidence', description: 'AI-grounded translation of real-world clinical data into verifiable, peer-reviewed evidence dossiers.', status: 'active', protocol: 'Evidence Lake' },
  { name: 'ASCO Guidelines Assistant', category: 'evidence', description: 'American Society of Clinical Oncology consensus guidelines grounded with direct citations.', status: 'active', protocol: 'ASCO Knowledge Core' },
  { name: 'BMJ Digital Health Decision Support', category: 'evidence', description: 'Point-of-care clinical evidence and diagnosis recommendations cited in medical literature.', status: 'active', protocol: 'BMJ Core API' },

  // Clinical Automation & Ambient Intelligence
  { name: 'Suki Ambient Intelligence', category: 'automation', description: 'Ambient clinical documentation synthesizing patient encounters into structured note drafts.', status: 'active', protocol: 'Voice AI Stream' },
  { name: 'UiPath Chart Extraction', category: 'automation', description: 'Robotic chart summary extraction and evidence compilation for utilization reviews and appeals.', status: 'active', protocol: 'RPA Agent Pipeline' },
  { name: 'Synthpop Journey Orchestrator', category: 'automation', description: 'Patient-facing journey automation and asynchronous intake and clinical triage flows.', status: 'supported', protocol: 'Journey API' },

  // Enterprise Security Stack
  { name: 'Cyera Data & Agent Security', category: 'enterprise', description: 'Continuous PHI context discovery, agent boundary validation, and HIPAA audit trail enforcement.', status: 'active', protocol: 'DSPM Zero-Trust' },
  { name: 'Check Point Perimeter Defense', category: 'enterprise', description: 'Enterprise perimeter security and egress traffic inspection across sovereign cloud clusters.', status: 'active', protocol: 'Cloud Guard' },
];

export const GeminiHealthcareHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ehr' | 'admin' | 'evidence' | 'automation' | 'enterprise'>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<'records-synthesis' | 'prior-auth' | 'pre-appointment' | 'asco-guidelines'>('records-synthesis');
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simOutput, setSimOutput] = useState<string | null>(null);

  const filteredConnectors = activeCategory === 'all'
    ? HEALTHCARE_CONNECTORS
    : HEALTHCARE_CONNECTORS.filter((c) => c.category === activeCategory);

  const handleRunWorkflowSim = (workflow: typeof selectedWorkflow) => {
    setSelectedWorkflow(workflow);
    setIsRunningSim(true);
    audioEngine.playPositiveSignal();
    setSimOutput(null);

    setTimeout(() => {
      setIsRunningSim(false);
      audioEngine.playCompletionSignal();
      if (workflow === 'records-synthesis') {
        setSimOutput(
          JSON.stringify(
            {
              workflow: 'Longitudinal Medical Records Synthesis',
              sourceConnectors: ['Epic (open.epic)', 'InterSystems FHIR Server', 'Verato MPI'],
              verifiableCitations: [
                'Condition: Type 2 Diabetes Mellitus [ICD-10 E11.9, IMO Health Graph]',
                'Latest HbA1c: 7.2% (14 days ago) [Epic Labs FHIR Observation]',
                'Active Prescription: Metformin 500mg BID [RxNorm 860975, Suki Note Draft]',
              ],
              synthesizedClinicalBrief:
                'Patient maintains glycemic stabilization under current dual-oral therapy. No hospitalizations in the last 180 days. Verified zero EHR write-back occurred to safeguard record integrity.',
              governancePledge: 'Customer data was not used for model training. Grounded in verified chart records.',
              modelRouting: 'Gemini Enterprise Plus (High-Reasoning Clinical Layer)',
              latencyMs: 142,
              hipaaComplianceAudit: 'PASSED · AES-256 GCM Encrypted · Audit Event ID: CLN-GEMINI-8904',
            },
            null,
            2
          )
        );
      } else if (workflow === 'prior-auth') {
        setSimOutput(
          JSON.stringify(
            {
              workflow: 'Prior Authorization & CMS Coverage Determination',
              sourceConnectors: ['CMS Coverage Database', 'Infinitus Relay', 'Optum Eligibility'],
              determinationStatus: 'APPROVED / COVERED',
              policyReference: 'CMS National Coverage Determination (NCD) 210.14',
              priorAuthToken: 'PA-2026-CMS-99412',
              estimatedPatientResponsibility: '$0.00 (In-Network Tier 1 Preventative)',
              modelRouting: 'Smart-Routed to High-Speed Administrative Core',
              latencyMs: 84,
              hipaaComplianceAudit: 'PASSED · Complete EDI 278 Evidence Package Staged',
            },
            null,
            2
          )
        );
      } else if (workflow === 'pre-appointment') {
        setSimOutput(
          JSON.stringify(
            {
              workflow: 'Pre-Appointment Preparation & Risk Flagging',
              sourceConnectors: ['Oracle Health Ignite', 'Suki Ambient', 'Verato'],
              clinicianPrepBrief:
                'Patient appointment scheduled for 10:30 AM EST. Identified 2 clinical review items: missing diabetic retinopathy screening (due 45 days ago) and elevated systolic trend on home blood pressure cuff.',
              recommendedDoctorActions: [
                'Review blood pressure diary with patient',
                'Order annual retinal screening via regional partner clinic',
              ],
              timeSavedEstimate: '18 minutes documentation overhead eliminated',
              modelRouting: 'Gemini Enterprise Standard (Fast Clinical Context)',
              latencyMs: 98,
            },
            null,
            2
          )
        );
      } else {
        setSimOutput(
          JSON.stringify(
            {
              workflow: 'ASCO Consensus Guideline Grounding',
              sourceConnectors: ['ASCO Guidelines Assistant', 'BMJ Digital Health', 'Optum EvidenceVue'],
              evidenceGrade: 'Category 1 Consensus Recommendation (ASCO Clinical Practice)',
              directCitations: [
                'ASCO Guideline Update on Systemic Adjuvant Therapy, Vol 44',
                'Optum Real-World Evidence Cohort Analysis (n=14,800 records)',
              ],
              decisionSupportGuidance:
                'Multi-gene expression assay recommended to guide adjuvant systemic treatment decisions. Aligns with NCCN and ASCO consensus standards.',
              modelRouting: 'Gemini Enterprise Plus (Complex Scientific Reasoning)',
              latencyMs: 160,
            },
            null,
            2
          )
        );
      }
    }, 1200);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto text-slate-100">
      {/* Official Launch Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-[#0c182e] via-[#091222] to-[#050914] p-6 sm:p-8 shadow-[0_0_50px_rgba(34,211,238,0.12)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                GOOGLE CLOUD LAUNCH · NOV 10, 2026
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                HIPAA-READY AGENTIC AI
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-indigo-950/60 border border-indigo-500/40 text-indigo-300">
                ZERO EHR WRITE-BACK
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Gemini for Healthcare Sovereign Integration
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Stratum Clinical Edge and Project Kingdom natively integrate Google Cloud’s purpose-built agentic AI for healthcare. Unify EHR connectivity, federal coverage datasets, peer-reviewed medical repositories, and administrative automation under a zero-trust governance layer.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Dedicated Tenant Encryption
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Lock className="w-4 h-4" /> Customer Data Never Trains Base Models
              </span>
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Cpu className="w-4 h-4" /> Open Model Smart Routing
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => handleRunWorkflowSim('records-synthesis')}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch Workflow Sandbox</span>
            </button>
            <a
              href="https://www.googlecloudpresscorner.com/2026-11-10-Google-Cloud-Launches-Gemini-for-Healthcare"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-mono text-cyan-300 border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/40 transition-colors flex items-center justify-center gap-2"
            >
              <span>View Press Corner Release</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5 border border-cyan-500/20 bg-[#090f1e]/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Stethoscope className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono uppercase text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">Pillar 1</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Specialized Skills</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-step autonomous instructions for medical records synthesis, pre-appointment preparation, coverage review, and payer benefit determination.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-indigo-500/20 bg-[#090f1e]/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <Network className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono uppercase text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">Pillar 2</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Healthcare Connectors</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct read integrations with Epic (open.epic), Oracle Health Ignite, InterSystems FHIR, Verato MPI, and federal CMS databases preserving existing RBAC.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-emerald-500/20 bg-[#090f1e]/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono uppercase text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">Pillar 3</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Medical Repositories</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Grounded in Optum EvidenceVue real-world evidence, ASCO oncology guidelines, and BMJ Digital Health clinical decision support.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-amber-500/20 bg-[#090f1e]/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono uppercase text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">Pillar 4</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Open Model Governance</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dynamic smart routing across Google, Anthropic, and OpenAI. Directs administrative jobs to low-cost models while preserving high-reasoning for clinical analysis.
          </p>
        </div>
      </div>

      {/* Interactive Agentic Healthcare Workflow Simulator */}
      <div className="glass-panel rounded-2xl border border-cyan-500/30 bg-[#080e1b] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-cyan-300">
                Interactive Agentic Healthcare Execution Sandbox
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Test Real-World Gemini for Healthcare Agentic Workflows
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-slate-300">
              Status: <span className="text-emerald-400 font-bold">READY</span>
            </span>
          </div>
        </div>

        {/* Workflow Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleRunWorkflowSim('records-synthesis')}
            disabled={isRunningSim}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedWorkflow === 'records-synthesis'
                ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-black/30 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-xs font-bold text-white">Records Synthesis</div>
            <div className="text-[11px] text-slate-400 mt-1">Epic + FHIR read extraction</div>
          </button>

          <button
            onClick={() => handleRunWorkflowSim('prior-auth')}
            disabled={isRunningSim}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedWorkflow === 'prior-auth'
                ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-black/30 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-xs font-bold text-white">Prior Auth &amp; CMS Review</div>
            <div className="text-[11px] text-slate-400 mt-1">Infinitus Relay + CMS NCD</div>
          </button>

          <button
            onClick={() => handleRunWorkflowSim('pre-appointment')}
            disabled={isRunningSim}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedWorkflow === 'pre-appointment'
                ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-black/30 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-xs font-bold text-white">Pre-Appointment Prep</div>
            <div className="text-[11px] text-slate-400 mt-1">Oracle Ignite + Suki Ambient</div>
          </button>

          <button
            onClick={() => handleRunWorkflowSim('asco-guidelines')}
            disabled={isRunningSim}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedWorkflow === 'asco-guidelines'
                ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-black/30 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-xs font-bold text-white">ASCO Guideline Review</div>
            <div className="text-[11px] text-slate-400 mt-1">Oncology consensus grounding</div>
          </button>
        </div>

        {/* Live Simulation Output Box */}
        <div className="bg-[#040711] border border-cyan-500/20 rounded-xl p-5 font-mono text-xs min-h-60 relative overflow-hidden">
          {isRunningSim ? (
            <div className="h-48 flex flex-col items-center justify-center gap-3 text-cyan-300">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Orchestrating agentic pipeline across healthcare connectors…</span>
              <span className="text-[11px] text-slate-500">Checking FHIR endpoints, CMS coverage guidelines, and RBAC token…</span>
            </div>
          ) : simOutput ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-slate-400 text-[11px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AGENTIC EXECUTION COMPLETE
                </span>
                <span>Grounded with verifiable citations</span>
              </div>
              <pre className="text-cyan-200 overflow-x-auto leading-relaxed text-[11px] whitespace-pre-wrap">
                {simOutput}
              </pre>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Activity className="w-8 h-8 opacity-40 text-cyan-400" />
              <span>Select a healthcare workflow above to trigger agentic execution simulation.</span>
            </div>
          )}
        </div>
      </div>

      {/* Healthcare Connectors Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Integrated Healthcare Connectors &amp; Standards</span>
            </h3>
            <p className="text-xs text-slate-400">
              Out-of-the-box connectors linking EHR systems, administrative networks, and evidence repositories.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
            {(['all', 'ehr', 'admin', 'evidence', 'automation', 'enterprise'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  audioEngine.playPositiveSignal();
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1 rounded capitalize font-mono text-[11px] transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ehr' ? 'EHR Interop' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredConnectors.map((c, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-xl p-4 border border-white/5 bg-[#080d1b] hover:border-cyan-500/30 transition-all space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                  <span className="text-xs font-bold text-white">{c.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                    c.status === 'active'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : c.status === 'preview'
                      ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                      : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                  {c.description}
                </p>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Protocol:</span>
                <span className="text-cyan-300">{c.protocol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
