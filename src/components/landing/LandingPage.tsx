import React from 'react';
import {
  Swords,
  Sparkles,
  LineChart,
  Compass,
  Cog,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
  ExternalLink,
  Play,
  Zap,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine.ts';
import { StratumLearningHub } from './StratumLearningHub.tsx';

interface LandingPageProps {
  onEnterKingdom: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterKingdom }) => {
  return (
    <div className="space-y-16 py-8">
      {/* 1. HERO SECTION */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>2027+ SOVEREIGN INTELLIGENCE OPERATING SYSTEM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          Rule with Clarity. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Command with Confidence.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Project Kingdom is the command center for modern leaders. Unify missions, intelligence, analytics, automation, and AI guidance in one sovereign platform.
        </p>

        <div className="text-sm font-mono text-cyan-300/80 mb-8">
          One dashboard. One vision. Complete control.
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              audioEngine.playPositiveSignal();
              onEnterKingdom();
            }}
            className="glow-btn-primary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          >
            <span>Enter the Kingdom</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              audioEngine.playPositiveSignal();
              onEnterKingdom();
            }}
            className="glow-btn-secondary px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current text-cyan-400" />
            <span>Enter Sovereign Command Bridge</span>
          </button>
        </div>
      </section>

      {/* Integrated Stratum Clinical Edge education experience; Project Kingdom modules remain below. */}
      <StratumLearningHub />

      {/* 2. VALUE PROPOSITION */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-panel-elevated rounded-2xl p-8 sm:p-10 border border-cyan-500/20 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold block mb-2">
              Value Proposition
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
              Lead From a Single Source of Truth
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Stop juggling disconnected tools and scattered information. Project Kingdom transforms complexity into clarity by bringing your entire digital realm into one intelligent workspace.
            </p>

            <div className="flex flex-wrap justify-center gap-2 text-xs font-mono text-cyan-300">
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Connected Intelligence</span>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Mission Control</span>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">AI Sovereign Advisor</span>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Strategic Analytics</span>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Workflow Automation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIX CORE FEATURES */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            One Sovereign Platform. Six Essential Pillars.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Engineered for executive clarity, predictive analytics, and autonomous execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Command Dashboard */}
          <div className="glass-panel rounded-xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mb-4">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Command Dashboard</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unified operational visibility into subsystem telemetry, health metrics, and strategic priorities.
            </p>
          </div>

          {/* 2. Mission Control */}
          <div className="glass-panel rounded-xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mb-4">
              <Swords className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Mission Control</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Turn goals into trackable campaigns with measurable outcomes, readiness progress, and automated milestones.
            </p>
          </div>

          {/* 3. AI Sovereign Advisor */}
          <div className="glass-panel rounded-xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">AI Sovereign Advisor</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generate executive-level scenario analysis and multi-agent consensus deliberation with Gemini 3.8 Flash.
            </p>
          </div>

          {/* 4. Strategic Analytics */}
          <div className="glass-panel rounded-xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-4">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Strategic Analytics</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transform data into decisive action with predictive velocity models and real-time capital allocation views.
            </p>
          </div>

          {/* 5. Kingdom Map */}
          <div className="glass-panel rounded-xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Kingdom Map</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Visualize systems, teams, projects, and cross-sector dependencies across an interactive spatial realm topology.
            </p>
          </div>

          {/* 6. Automation Engine */}
          <div className="glass-panel rounded-xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mb-4">
              <Cog className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automation Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reduce manual effort through event-driven triggers, invariant safeguards, and 76% automated governance coverage.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURE ROADMAP TIMELINE */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider block mb-1">
            Execution Timeline
          </span>
          <h2 className="text-2xl font-bold text-white">Feature Roadmap</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-[#050811] p-3.5 rounded-xl border border-cyan-500/30">
            <div className="text-cyan-400 font-bold mb-1">Q1 — Foundation</div>
            <div className="text-slate-300 font-semibold mb-2">Establish the Kingdom</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Authentication, user profiles, sovereign dashboard, missions, resource tracking, telemetry bus.
            </p>
          </div>

          <div className="bg-[#050811] p-3.5 rounded-xl border border-cyan-500/30">
            <div className="text-cyan-400 font-bold mb-1">Q2 — Intelligence</div>
            <div className="text-slate-300 font-semibold mb-2">Empower the Sovereign</div>
            <p className="text-[11px] text-slate-400 font-sans">
              AI Sovereign Advisor, natural language commands, smart alerts, daily briefings, strategic recommendations.
            </p>
          </div>

          <div className="bg-[#050811] p-3.5 rounded-xl border border-cyan-500/30">
            <div className="text-cyan-400 font-bold mb-1">Q3 — Visualization</div>
            <div className="text-slate-300 font-semibold mb-2">Map the Realm</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Interactive kingdom map, dependency mapping, team visualization, territory views.
            </p>
          </div>

          <div className="bg-[#050811] p-3.5 rounded-xl border border-cyan-500/30">
            <div className="text-cyan-400 font-bold mb-1">Q4 — Automation</div>
            <div className="text-slate-300 font-semibold mb-2">Automate Governance</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Workflow builder, trigger-based actions, automated reports, mission templates, 76% coverage.
            </p>
          </div>

          <div className="bg-[#0c1328] p-3.5 rounded-xl border border-indigo-500/40">
            <div className="text-indigo-400 font-bold mb-1">Year 2 — Sovereignty</div>
            <div className="text-slate-200 font-semibold mb-2">Predict and Prosper</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Predictive analytics, scenario planning, executive decision engine, true AI OS for leadership.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="text-center max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Your Kingdom. One Command Center.
        </h2>
        <p className="text-sm font-mono text-cyan-300 mb-6">
          Monitor. Decide. Execute.
        </p>

        <button
          onClick={() => {
            audioEngine.playPositiveSignal();
            onEnterKingdom();
          }}
          className="glow-btn-primary px-8 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_35px_rgba(34,211,238,0.5)]"
        >
          Launch Project Kingdom
        </button>
      </section>
    </div>
  );
};
