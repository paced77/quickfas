import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  HardDrive,
  Cpu,
  Layers,
  Lock,
  WifiOff,
  Server,
  HeartPulse,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  TrendingUp,
  FileText,
  DollarSign,
  PieChart,
  Copy,
  Printer,
  Download,
  Terminal,
} from 'lucide-react';

interface SeventeenPocketsViewProps {
  onNotify?: (msg: string) => void;
}

export const SeventeenPocketsView: React.FC<SeventeenPocketsViewProps> = ({ onNotify }) => {
  // Interactive Lab State
  const [selectedTier, setSelectedTier] = useState<number>(5);
  const [sudsScore, setSudsScore] = useState<number>(35);
  const [activeExercise, setActiveExercise] = useState<'breathwork' | 'grounding' | 'cbt' | 'atlas'>('breathwork');

  // Breathwork Pacer State
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState<number>(4);

  // Grounding Checklist
  const [groundingCheck, setGroundingCheck] = useState<Record<string, boolean>>({
    see: false,
    feel: false,
    hear: false,
    smell: false,
    taste: false,
  });

  // Polyvagal Breathwork timer loop
  useEffect(() => {
    if (!isBreathing) return;
    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;
        // Cycle: Inhale (4s) -> Hold (7s) -> Exhale (8s) -> Rest (2s)
        if (breathPhase === 'Inhale') {
          setBreathPhase('Hold');
          return 7;
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Exhale');
          return 8;
        } else if (breathPhase === 'Exhale') {
          setBreathPhase('Rest');
          return 2;
        } else {
          setBreathPhase('Inhale');
          return 4;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);

  // SUDS Classification
  const getSudsCategory = (score: number) => {
    if (score <= 20) return { label: 'Mild / Rested (Optimal Coping)', color: 'text-emerald-400', bg: 'bg-emerald-950/40' };
    if (score <= 49) return { label: 'Moderate Distress (Noticeable Tension)', color: 'text-cyan-300', bg: 'bg-cyan-950/40' };
    if (score <= 74) return { label: 'Severe Distress (Impaired Concentration)', color: 'text-amber-400', bg: 'bg-amber-950/40' };
    return { label: 'Extreme Distress (Crisis / Disregulated)', color: 'text-rose-400', bg: 'bg-rose-950/40' };
  };

  const sudsCategory = getSudsCategory(sudsScore);

  return (
    <div className="space-y-10 text-slate-200">
      {/* 1. Header & Manifesto */}
      <div className="border-b border-cyan-500/20 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-700/60 px-2 py-0.5 rounded">
              DECISION ARCHITECTURE // EDGE OS
            </span>
            <span className="text-xs text-slate-400 font-mono">v1.0 Complete Specification</span>
          </div>
          <div className="font-mono text-xs text-slate-400">
            Attribution: <strong className="text-white font-semibold">ODell Anderson, Chief Architect</strong>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
          SEVENTEEN POCKETS
        </h1>
        <p className="text-lg sm:text-xl text-cyan-200 font-medium mt-1">
          Decentralized Clinical Intelligence Platform
        </p>
        <p className="text-sm font-mono text-emerald-400 mt-1">
          Principle: "Cloud Optional. Care Continuous."
        </p>

        {/* Manifesto Callout */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border-l-4 border-cyan-400 text-xs sm:text-sm font-mono text-slate-300 space-y-1">
          <p className="italic text-cyan-200">
            "We build systems that connect humanity. Not through promises, but through precision. Not through capital, but through intelligence. Every number proves competence. Every system operates with zero error tolerance. This is how the future is built."
          </p>
          <p className="text-right text-[11px] text-slate-400 font-sans">
            — ODell Anderson, Chief Architect
          </p>
        </div>
      </div>

      {/* 2. Executive Summary & Value Proposition */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          1. Executive Summary & Clinical Wedge
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>Seventeen Pockets</strong> is an offline-first, decentralized clinical intelligence platform engineered for healthcare settings where internet connectivity is intermittent, privacy regulations are strict, and operational resilience is non-negotiable. 
          By combining local AI inference, edge computing, behavioral health research, and optional cloud mesh synchronization, Seventeen Pockets enables healthcare organizations to deploy clinical decision support directly at the point of care.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
            <span className="text-cyan-400 font-bold block mb-1">OFFLINE FIRST</span>
            Operates autonomously for 30+ days without cloud connectivity.
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
            <span className="text-emerald-400 font-bold block mb-1">LOCAL PRIVACY FABRIC</span>
            All patient records and SUDS metrics remain in local SQLite stores.
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
            <span className="text-cyan-300 font-bold block mb-1">HYBRID RESILIENCE</span>
            Nightly batch sync when broadband is available; no single point of failure.
          </div>
        </div>
      </section>

      {/* 3. Five-Tier Architecture */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            2. Five-Tier Architecture (Cloud Optional. Care Continuous.)
          </h2>
          <span className="text-xs font-mono text-slate-400">Click a tier to inspect components</span>
        </div>

        {/* Tier Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
          {[
            { tier: 5, label: 'Tier 5', title: 'Clinical Experience', subtitle: 'Patient & Provider Apps' },
            { tier: 4, label: 'Tier 4', title: 'Clinical Intelligence', subtitle: 'CBT • SUDS • Soul Auditor' },
            { tier: 3, label: 'Tier 3', title: 'Local Data Fabric', subtitle: 'SQLite • Audit • Encryption' },
            { tier: 2, label: 'Tier 2', title: 'Edge Runtime', subtitle: 'Local AI • Self-Healing OS' },
            { tier: 1, label: 'Tier 1', title: 'Hybrid Cloud Mesh', subtitle: 'Backup • Fleet Coordination' },
          ].map((t) => (
            <button
              key={t.tier}
              onClick={() => setSelectedTier(t.tier)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selectedTier === t.tier
                  ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-cyan-400">{t.label}</div>
              <div className="font-semibold text-slate-100 mt-0.5">{t.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{t.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Selected Tier Detail Panel */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-cyan-500/30 font-mono text-xs space-y-3">
          {selectedTier === 5 && (
            <div>
              <div className="text-sm font-bold text-cyan-300">TIER 5 // CLINICAL EXPERIENCE LAYER</div>
              <p className="text-slate-300 mt-1 font-sans text-xs">
                Primary user interaction surface for healthcare providers, clinical researchers, and patients. Designed for zero-latency bedside interaction even when networks drop.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Clinician Dashboard</strong>
                  Patient roster, real-time SUDS trend lines, encounter notes.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Mental Health Coping Lab</strong>
                  Polyvagal breathwork, 5-4-3-2-1 grounding, and CBT decatastrophizing.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Patient & Caregiver Portal</strong>
                  Self-paced learning, symptom journals, and offline exercise access.
                </div>
              </div>
            </div>
          )}

          {selectedTier === 4 && (
            <div>
              <div className="text-sm font-bold text-cyan-300">TIER 4 // CLINICAL INTELLIGENCE LAYER</div>
              <p className="text-slate-300 mt-1 font-sans text-xs">
                Clinical reasoning, pattern analysis, and automated invariant verification. Evaluates emotional regulation trajectories and flags clinical risks before escalation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Emotional Regulation Analytics</strong>
                  SUDS regression analysis and coping skill efficacy tracking.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Soul Auditor & Composer</strong>
                  Pre-production bug detection, clinical invariant verification, and correspondence.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Clinical Decision Support</strong>
                  Evidence-based intervention recommendations tailored to patient progress.
                </div>
              </div>
            </div>
          )}

          {selectedTier === 3 && (
            <div>
              <div className="text-sm font-bold text-cyan-300">TIER 3 // LOCAL DATA FABRIC</div>
              <p className="text-slate-300 mt-1 font-sans text-xs">
                Edge-local persistent storage layer ensuring total facility autonomy. No patient data is forced into centralized multi-tenant databases.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Local SQLite Datastores</strong>
                  Embedded relational storage with WAL mode and sub-millisecond query latency.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Append-Only Event Journals</strong>
                  Cryptographically hashed audit trails for regulatory compliance.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">At-Rest AES-256 Encryption</strong>
                  Hardware-backed encryption keys tied to local appliance security modules.
                </div>
              </div>
            </div>
          )}

          {selectedTier === 2 && (
            <div>
              <div className="text-sm font-bold text-cyan-300">TIER 2 // EDGE RUNTIME LAYER</div>
              <p className="text-slate-300 mt-1 font-sans text-xs">
                Execution environment providing local AI inference, process isolation, and automated self-healing systemd daemons.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Local AI Model Inference</strong>
                  On-device quantized models for private clinical summarization and guidance.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Self-Healing Services</strong>
                  Automated watchdog daemons restart failed microservices without technician visits.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">One-Command Installer</strong>
                  <code className="text-cyan-300">deploy-pocket3-auto.sh</code> provisions the entire node in under 3 minutes.
                </div>
              </div>
            </div>
          )}

          {selectedTier === 1 && (
            <div>
              <div className="text-sm font-bold text-cyan-300">TIER 1 // HYBRID CLOUD MESH (OPTIONAL)</div>
              <p className="text-slate-300 mt-1 font-sans text-xs">
                Optional cloud coordination mesh. If broadband connection drops, Tier 1 goes to sleep while Tiers 2–5 continue operating with zero disruption.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Encrypted Nightly Sync</strong>
                  Scheduled delta replication during off-peak hours when connectivity is present.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Fleet Coordination</strong>
                  Centralized telemetry and remote firmware upgrade staging across 1,000+ edge nodes.
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                  <strong className="text-white block">Disaster Recovery Snapshots</strong>
                  Zero-knowledge encrypted backups for emergency hardware replacement.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Interactive Mental Health Coping Lab & Pocket Atlas */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-cyan-400" />
            3. Interactive Mental Health Coping Lab & 17 Pockets Atlas
          </h2>
          <div className="flex gap-1">
            {[
              { id: 'breathwork', label: 'Breathwork' },
              { id: 'grounding', label: 'Grounding' },
              { id: 'cbt', label: 'CBT Lab' },
              { id: 'atlas', label: '17 Atlas' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveExercise(tab.id as any)}
                className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                  activeExercise === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Module A: Polyvagal Breathwork Pacer */}
        {activeExercise === 'breathwork' && (
          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Polyvagal 4-7-8 Autonomic Regulation Pacer
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Engages the vagus nerve to slow heart rate variability and downregulate acute sympathetic fight-or-flight arousal.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsBreathing(!isBreathing);
                  if (onNotify) onNotify(isBreathing ? 'Pacing stopped' : 'Engaged Polyvagal 4-7-8 Pacer');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  isBreathing
                    ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                    : 'glow-btn-primary'
                }`}
              >
                {isBreathing ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isBreathing ? 'Stop Pacer' : 'Start 4-7-8 Breathwork'}</span>
              </button>
            </div>

            {/* Pacer Display */}
            <div className="py-8 flex flex-col items-center justify-center bg-slate-950/60 border border-slate-800/80 rounded-xl relative overflow-hidden">
              <div
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                  isBreathing && breathPhase === 'Inhale'
                    ? 'scale-125 bg-cyan-500/20 border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]'
                    : isBreathing && breathPhase === 'Hold'
                    ? 'scale-125 bg-amber-500/20 border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                    : isBreathing && breathPhase === 'Exhale'
                    ? 'scale-90 bg-emerald-500/20 border-4 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                    : 'scale-100 bg-slate-900 border-2 border-slate-700'
                }`}
              >
                <span className="text-sm font-mono uppercase tracking-wider text-slate-300">
                  {isBreathing ? breathPhase : 'READY'}
                </span>
                <span className="text-3xl font-extrabold font-mono text-white mt-1 tabular-nums">
                  {isBreathing ? `${breathSeconds}s` : '4-7-8'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-4 text-center max-w-sm">
                {breathPhase === 'Inhale' && 'Inhale deeply through your nose into the diaphragm…'}
                {breathPhase === 'Hold' && 'Hold breath gently at the peak without straining…'}
                {breathPhase === 'Exhale' && 'Slow, audible exhale through pursed lips…'}
                {breathPhase === 'Rest' && 'Pause briefly before the next inhalation cycle.'}
              </p>
            </div>
          </div>
        )}

        {/* Exercise Module B: Sensory Grounding (5-4-3-2-1) */}
        {activeExercise === 'grounding' && (
          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                5-4-3-2-1 Somatic Sensory Grounding Protocol
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Interrupts acute dissociative spiraling by forcing cognitive focus into immediate physical sensory anchors.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {[
                { key: 'see', count: 5, label: '5 things you can SEE around you (shapes, colors, shadows)' },
                { key: 'feel', count: 4, label: '4 physical textures you can TOUCH (clothing, chair, feet on floor)' },
                { key: 'hear', count: 3, label: '3 distinct sounds you can HEAR (hum of computer, distant traffic)' },
                { key: 'smell', count: 2, label: '2 aromas you can SMELL (ambient air, fabric, coffee)' },
                { key: 'taste', count: 1, label: '1 sensation you can TASTE or clean breath in your mouth' },
              ].map((step) => (
                <label
                  key={step.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    groundingCheck[step.key]
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!groundingCheck[step.key]}
                    onChange={(e) => {
                      setGroundingCheck({ ...groundingCheck, [step.key]: e.target.checked });
                    }}
                    className="accent-cyan-400 rounded w-4 h-4"
                  />
                  <span className="font-bold text-cyan-400">{step.count}</span>
                  <span className="font-sans text-xs flex-1">{step.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Module C: CBT Decatastrophizing */}
        {activeExercise === 'cbt' && (
          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                CBT Decatastrophizing & Cognitive Restructuring
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Separates automatic threat-estimation from verifiable reality through structured clinical inquiry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950/60 border border-rose-500/30 rounded-lg">
                <span className="text-rose-400 font-bold block mb-1">1. WORST-CASE OUTCOME</span>
                <p className="font-sans text-slate-300 text-xs">
                  "What is the absolute worst thing that could happen? If it did, what concrete steps would you take to endure and recover?"
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-emerald-500/30 rounded-lg">
                <span className="text-emerald-400 font-bold block mb-1">2. BEST-CASE OUTCOME</span>
                <p className="font-sans text-slate-300 text-xs">
                  "What is the most optimistic, ideal scenario where everything resolves smoothly without permanent harm?"
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-cyan-500/40 rounded-lg">
                <span className="text-cyan-300 font-bold block mb-1">3. MOST LIKELY REALITY</span>
                <p className="font-sans text-slate-300 text-xs">
                  "Based on facts rather than adrenaline: what is the most realistic middle-ground outcome, and how will you navigate it?"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Module D: 17 Pockets Atlas */}
        {activeExercise === 'atlas' && (
          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                17 Pockets Service Atlas & Installer Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Decentralized microservice hierarchy provisioned by <code className="text-cyan-300">deploy-pocket3-auto.sh</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono text-xs max-h-72 overflow-y-auto pr-1">
              {[
                { pocket: 'Pocket 0', role: 'Oracle Gateway', desc: 'Central routing and local model dispatch' },
                { pocket: 'Pocket 1', role: 'Telemetry Ingest', desc: 'Sub-90ms local event validation and journaling' },
                { pocket: 'Pocket 2', role: 'SUDS Engine', desc: 'Subjective distress tracking and curve fitting' },
                { pocket: 'Pocket 3', role: 'Coping Lab', desc: 'Polyvagal breathwork and somatic exercise daemon' },
                { pocket: 'Pocket 4', role: 'CBT Restructure', desc: 'Automatic thought logging and decatastrophizing' },
                { pocket: 'Pocket 5', role: 'SQLite Store', desc: 'WAL-mode embedded clinical data fabric' },
                { pocket: 'Pocket 6', role: 'Soul Auditor', desc: 'Continuous invariant checking and verification' },
                { pocket: 'Pocket 7', role: 'Security HSM', desc: 'Hardware key storage and AES-256 ciphering' },
                { pocket: 'Pocket 8', role: 'Speech Synthesis', desc: 'Offline Web Speech read-aloud narrator' },
                { pocket: 'Pocket 9', role: 'FHIR Translator', desc: 'HL7 / FHIR data standardization bridge' },
                { pocket: 'Pocket 10', role: 'Nightly Sync', desc: 'Encrypted delta sync to hybrid cloud mesh' },
                { pocket: 'Pocket 11', role: 'Clinician UI', desc: 'Desktop and tablet encounter workspace' },
                { pocket: 'Pocket 12', role: 'Caregiver Portal', desc: 'Family and guardian educational access' },
                { pocket: 'Pocket 13', role: 'Audit Exporter', desc: 'RFC4180 CSV compliance reporting daemon' },
                { pocket: 'Pocket 14', role: 'Fleet Agent', desc: 'Node health telemetry and automated watchdog' },
                { pocket: 'Pocket 15', role: 'Emergency Mode', desc: 'Offline crisis protocol escalation trigger' },
                { pocket: 'Pocket 16', role: 'Edge OS Appliance', desc: 'Minimal hardened Linux runtime appliance' },
              ].map((p) => (
                <div key={p.pocket} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded">
                  <div className="flex justify-between text-cyan-400 font-bold">
                    <span>{p.pocket}</span>
                    <span className="text-[10px] text-slate-400">{p.role}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans mt-0.5">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live SUDS Measurement Slider */}
        <div className="p-4 bg-slate-950/60 border border-cyan-500/20 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-slate-400">Live SUDS Measurement (Subjective Units of Distress Scale):</span>
              <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                <span>{sudsScore} / 100</span>
                <span className={`text-xs px-2 py-0.5 rounded ${sudsCategory.bg} ${sudsCategory.color}`}>
                  {sudsCategory.label}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-sans">
              Clinical standard for real-time distress calibration
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sudsScore}
            onChange={(e) => setSudsScore(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 (Completely calm)</span>
            <span>25 (Mild)</span>
            <span>50 (Moderate)</span>
            <span>75 (Severe)</span>
            <span>100 (Maximal distress)</span>
          </div>
        </div>
      </section>

      {/* 5. Clinical & Privacy Claims Assessment Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          4. Rigorous Clinical & Privacy Claims Assessment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Clinical Claims */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
            <h3 className="text-sm font-bold text-cyan-300 uppercase">Clinical Claims Evaluation</h3>
            <div className="space-y-2 font-sans">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold font-mono">✅ CBT Decatastrophizing:</span>
                <p className="text-slate-300 text-xs mt-0.5">Strong evidence base. Widely validated cognitive restructuring technique across literature.</p>
              </div>
              <div className="border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold font-mono">✅ SUDS Measurement:</span>
                <p className="text-slate-300 text-xs mt-0.5">Established standard clinical practice for patient self-reported emotional calibration.</p>
              </div>
              <div className="border-b border-slate-800 pb-2">
                <span className="text-amber-400 font-bold font-mono">⚠ Polyvagal Breathwork:</span>
                <p className="text-slate-300 text-xs mt-0.5">Emerging clinical evidence. Popular somatic intervention with physiological HRV correlation.</p>
              </div>
              <div>
                <span className="text-rose-400 font-bold font-mono">❌ Zero Error Tolerance:</span>
                <p className="text-slate-400 text-xs mt-0.5">Engineering aspiration only. Software always contains residual risk; requires continuous invariant testing.</p>
              </div>
            </div>
          </div>

          {/* Privacy Claims */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
            <h3 className="text-sm font-bold text-cyan-300 uppercase">Privacy Claims Evaluation</h3>
            <div className="space-y-2 font-sans">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold font-mono">✅ Local Data Storage:</span>
                <p className="text-slate-300 text-xs mt-0.5">Significant privacy moat. Patient data never leaves local facility hardware during care.</p>
              </div>
              <div className="border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold font-mono">✅ Reduced Attack Surface:</span>
                <p className="text-slate-300 text-xs mt-0.5">Offline-first operation eliminates continuous cloud telemetry vulnerabilities.</p>
              </div>
              <div className="border-b border-slate-800 pb-2">
                <span className="text-amber-400 font-bold font-mono">⚠ HIPAA / GDPR Compliance:</span>
                <p className="text-slate-300 text-xs mt-0.5">Architecture supports compliance, but requires facility operational procedures and audits.</p>
              </div>
              <div>
                <span className="text-rose-400 font-bold font-mono">❌ Absolute Privacy:</span>
                <p className="text-slate-400 text-xs mt-0.5">Physical device security and access controls are required; no system provides absolute immunity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Business Model, Moats & $5M Series A */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          5. Defensible Business Model & $5M Series A Fundraising
        </h2>

        {/* 5 Revenue Layers */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
          {[
            { title: 'Layer 1: License', fee: '$5k–$25k/yr', desc: 'Annual base platform license per clinic' },
            { title: 'Layer 2: Edge Fleet', fee: '$500–$1.5k/mo', desc: 'Managed edge updates & self-healing daemons' },
            { title: 'Layer 3: AI Modules', fee: 'Usage add-on', desc: 'Specialized CBT & behavioral intelligence' },
            { title: 'Layer 4: Compliance', fee: '$25k–$75k/yr', desc: 'Enterprise audit & Soul Auditor certification' },
            { title: 'Layer 5: Network', fee: 'Federated', desc: 'Privacy-preserving clinical benchmarking network' },
          ].map((l) => (
            <div key={l.title} className="p-3 bg-slate-900/60 border border-slate-800 rounded">
              <span className="text-cyan-300 font-bold block">{l.title}</span>
              <span className="text-white font-semibold block mt-1">{l.fee}</span>
              <p className="text-[11px] text-slate-400 font-sans mt-1">{l.desc}</p>
            </div>
          ))}
        </div>

        {/* Series A Raise Callout */}
        <div className="p-5 bg-cyan-950/20 border border-cyan-500/40 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-cyan-500/20 pb-3">
            <div>
              <span className="text-xs uppercase text-cyan-400">SERIES A CAPITALIZATION ASK</span>
              <div className="text-2xl font-bold text-white mt-0.5">$5,000,000 Series A Round</div>
            </div>
            <span className="text-xs text-slate-300 font-sans">
              "Healthcare Edge Infrastructure Platform, anchored by Behavioral Health"
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-1">
            <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded">
              <span className="text-cyan-400 font-bold block text-sm">30%</span>
              <span className="text-[11px] text-slate-300">Clinical Validation</span>
            </div>
            <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded">
              <span className="text-cyan-400 font-bold block text-sm">30%</span>
              <span className="text-[11px] text-slate-300">Product Engineering</span>
            </div>
            <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded">
              <span className="text-cyan-400 font-bold block text-sm">15%</span>
              <span className="text-[11px] text-slate-300">Security & Audits</span>
            </div>
            <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded">
              <span className="text-cyan-400 font-bold block text-sm">15%</span>
              <span className="text-[11px] text-slate-300">Sales & Pilots</span>
            </div>
            <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded">
              <span className="text-cyan-400 font-bold block text-sm">10%</span>
              <span className="text-[11px] text-slate-300">Operations</span>
            </div>
          </div>
        </div>

        {/* 13-Slide Pitch Deck Summary */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2 font-mono text-xs">
          <span className="text-cyan-300 font-bold block">13-SLIDE PITCH DECK STRUCTURE</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-[11px]">
            {[
              '01. Cover',
              '02. Problem',
              '03. Solution',
              '04. Architecture',
              '05. Why Now',
              '06. Business Model',
              '07. Competitive Moat',
              '08. Go-To-Market',
              '09. Roadmap',
              '10. Risks & Mitigation',
              '11. Financial Model',
              '12. Funding Ask',
              '13. Vision & Closing',
            ].map((slide) => (
              <div key={slide} className="p-1.5 bg-slate-950 rounded text-slate-300 text-center">
                {slide}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
