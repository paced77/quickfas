import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Printer,
  TrendingUp,
  DollarSign,
  PieChart,
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { SeventeenPocketsView } from './SeventeenPocketsView.tsx';

interface InvestorPortalProps {
  onNotify?: (msg: string) => void;
}

export const InvestorPortal: React.FC<InvestorPortalProps> = ({ onNotify }) => {
  const [activeView, setActiveView] = useState<'teaser' | 'master' | 'calculator' | 'seventeen-pockets'>('teaser');
  const [copied, setCopied] = useState(false);

  // Interactive Calculator State
  const [raiseAmount, setRaiseAmount] = useState<number>(1000000); // $1M
  const [preMoney, setPreMoney] = useState<number>(4000000); // $4M
  const [optionPoolPct, setOptionPoolPct] = useState<number>(15); // 15%
  const [exitArr, setExitArr] = useState<number>(12000000); // $12M
  const [exitMultiple, setExitMultiple] = useState<number>(8); // 8x

  // Calculations
  const postMoney = preMoney + raiseAmount;
  const investorOwnershipPct = (raiseAmount / postMoney) * 100;
  const founderOwnershipPct = 100 - investorOwnershipPct - optionPoolPct;
  const exitValuation = exitArr * exitMultiple;
  const investorProceeds = (exitValuation * (investorOwnershipPct / 100));
  const investorReturnMultiple = investorProceeds / raiseAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let textToCopy = MASTER_DOCUMENT_MARKDOWN;
    if (activeView === 'teaser') textToCopy = SHORT_INVESTOR_MARKDOWN;
    else if (activeView === 'seventeen-pockets') textToCopy = SEVENTEEN_POCKETS_MARKDOWN;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (onNotify) onNotify('Document copied to clipboard in clean Gemini Markdown format.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    let textToDownload = MASTER_DOCUMENT_MARKDOWN;
    let filename = 'PROJECT_KINGDOM_MASTER_STRATEGY.md';
    if (activeView === 'teaser') {
      textToDownload = SHORT_INVESTOR_MARKDOWN;
      filename = 'PROJECT_KINGDOM_INVESTOR_TEASER.md';
    } else if (activeView === 'seventeen-pockets') {
      textToDownload = SEVENTEEN_POCKETS_MARKDOWN;
      filename = 'SEVENTEEN_POCKETS_ARCHITECTURE_INVESTOR.md';
    }
    const blob = new Blob([textToDownload], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onNotify) onNotify(`Downloaded ${filename}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-cyan-400/30 bg-cyan-950/25 px-4 py-3 text-xs leading-5 text-cyan-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>
            <strong>Sovereign Capital &amp; Architectural Model</strong> · Stratum Clinical Edge ($14.2M ARR) &amp; Seventeen Pockets Decentralized Platform
          </span>
        </div>
        <span className="font-mono text-[11px] text-cyan-300">ODell Anderson, Chief Architect</span>
      </div>
      {/* Action Header & View Switcher (Hidden in Print) */}
      <div className="no-print bg-[#0f172a]/90 backdrop-blur-xl border border-[#6ee7ff]/20 rounded-xl p-5 shadow-[0_0_30px_rgba(34,211,238,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
              Sovereign Capital & Strategy Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">v2027.Q1</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <span>Project Kingdom: Master Strategy & Investor Portal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Decentralized clinical intelligence, Series A syndicate structure, and interactive returns calculator.
          </p>
        </div>

        {/* Global Export & Tool Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="glow-btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
            title="Export as a clean PDF or send to printer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Clean PDF</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="glow-btn-secondary px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
            title="Copy clean Markdown formatted for Gemini"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Markdown for Gemini'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="glow-btn-secondary px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
            title="Download .md file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher (Hidden in Print) */}
      <div className="no-print flex items-center gap-2 border-b border-[#6ee7ff]/15 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveView('teaser')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeView === 'teaser'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Shorter Investor Teaser (Pitch Memo)</span>
        </button>

        <button
          onClick={() => setActiveView('master')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeView === 'master'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Complete Master Document</span>
        </button>

        <button
          onClick={() => setActiveView('calculator')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeView === 'calculator'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Interactive Cap Table & Return Model</span>
        </button>

        <button
          onClick={() => setActiveView('seventeen-pockets')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeView === 'seventeen-pockets'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Seventeen Pockets (5-Tier Architecture & Series A)</span>
        </button>
      </div>

      {/* Printable Strategy Document Container */}
      <div className="print-document bg-[#0b1324] border border-[#6ee7ff]/15 rounded-xl p-6 sm:p-10 text-slate-200 font-sans leading-relaxed shadow-xl">
        {/* VIEW 1: Shorter Investor Version */}
        {activeView === 'teaser' && (
          <div className="space-y-8">
            {/* Document Header */}
            <div className="border-b border-cyan-500/20 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  DRAFT MODEL · ILLUSTRATIVE ASSUMPTIONS
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                  PROJECT KINGDOM
                </h1>
                <p className="text-lg text-cyan-200 font-medium mt-1">
                  The Strategic Operating System for Modern Leadership
                </p>
                <p className="text-sm text-slate-400 mt-1 italic">
                  Rule with Clarity. Command with Confidence.
                </p>
              </div>
              <div className="text-right font-mono text-xs text-slate-400 shrink-0">
                <div>Seed Round: <span className="text-white font-semibold">$1.0M</span></div>
                <div>Pre-Money Cap: <span className="text-cyan-400 font-semibold">$4.0M</span></div>
                <div>Illustrative SOM scenario: <span className="text-emerald-400 font-semibold">$100M ARR</span></div>
              </div>
            </div>

            {/* 1. The Core Thesis */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                1. Executive Summary & Thesis
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Illustrative problem statement: modern leaders may work across fragmented project, analytics, and communication tools. Validate the target-market problem with customer research before external use. 
                <strong> Project Kingdom</strong> is the first sovereign command platform that sits above this fragmentation—bringing connected intelligence (when configured), planning workspaces, analytics examples, workflow concepts, and on-demand AI guidance into a single sovereign interface.
              </p>
            </section>

            {/* 2. Key Metrics & Financial Projections Table */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                2. Financial Projections & Economics (Three-Year Model)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono">
                  <thead>
                    <tr className="border-b border-cyan-500/30 text-cyan-300 bg-slate-900/60">
                      <th className="py-2.5 px-3">Metric</th>
                      <th className="py-2.5 px-3">Year 1</th>
                      <th className="py-2.5 px-3">Year 2</th>
                      <th className="py-2.5 px-3">Year 3</th>
                      <th className="py-2.5 px-3">Benchmark / Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">ARR / Revenue</td>
                      <td className="py-2.5 px-3 tabular-nums">$58.8K</td>
                      <td className="py-2.5 px-3 tabular-nums text-cyan-300 font-semibold">$531K</td>
                      <td className="py-2.5 px-3 tabular-nums text-emerald-400 font-bold">$2.07M</td>
                      <td className="py-2.5 px-3 text-slate-400">9x Y2 YoY, 3.9x Y3 YoY</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Operating Expenses</td>
                      <td className="py-2.5 px-3 tabular-nums">$350K</td>
                      <td className="py-2.5 px-3 tabular-nums">$900K</td>
                      <td className="py-2.5 px-3 tabular-nums">$1.80M</td>
                      <td className="py-2.5 px-3 text-slate-400">Lean engineering-led team</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">EBITDA</td>
                      <td className="py-2.5 px-3 tabular-nums text-amber-400">-$291K</td>
                      <td className="py-2.5 px-3 tabular-nums text-amber-400">-$369K</td>
                      <td className="py-2.5 px-3 tabular-nums text-emerald-400 font-bold">+$270K</td>
                      <td className="py-2.5 px-3 text-slate-400">Cash-flow positive at Month 32</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Net Revenue Retention (NRR)</td>
                      <td className="py-2.5 px-3 tabular-nums">115%</td>
                      <td className="py-2.5 px-3 tabular-nums">125%</td>
                      <td className="py-2.5 px-3 tabular-nums text-emerald-300 font-semibold">132%</td>
                      <td className="py-2.5 px-3 text-slate-400">125% Target (Top-Quartile B2B)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Gross Margin</td>
                      <td className="py-2.5 px-3 tabular-nums">78%</td>
                      <td className="py-2.5 px-3 tabular-nums">84%</td>
                      <td className="py-2.5 px-3 tabular-nums">86%</td>
                      <td className="py-2.5 px-3 text-slate-400">Software gross margins</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Market Opportunity & TAM / SAM / SOM */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                3. Market Opportunity (TAM / SAM / SOM)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-lg">
                  <div className="text-xs font-mono text-cyan-400 uppercase">Total Addressable Market</div>
                  <div className="text-2xl font-bold text-white mt-1 tabular-nums">$150B+</div>
                  <p className="text-xs text-slate-400 mt-2">
                    Convergence of Work Management ($24B), Business Intelligence ($33B), Operational Observability ($22B), and Enterprise AI Assistants ($70B+).
                  </p>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-lg">
                  <div className="text-xs font-mono text-cyan-400 uppercase">Serviceable Addressable Market</div>
                  <div className="text-2xl font-bold text-white mt-1 tabular-nums">$20B+</div>
                  <p className="text-xs text-slate-400 mt-2">
                    Mid-market & enterprise leadership, operations orchestration, and mission management software across North America and Europe.
                  </p>
                </div>
                <div className="bg-slate-900/70 border border-emerald-500/40 p-4 rounded-lg bg-emerald-950/10">
                  <div className="text-xs font-mono text-emerald-400 uppercase">Serviceable Obtainable Market</div>
                  <div className="text-2xl font-bold text-emerald-300 mt-1 tabular-nums">$100M ARR · Scenario</div>
                  <p className="text-xs text-slate-300 mt-2">
                    Initial 5-year focus on high-velocity technology teams, health/clinical networks, and institutional program offices.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Unit Economics & Pricing Model */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                4. SaaS Economics & Pricing Model
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded">
                  <span className="text-slate-400">Professional</span>
                  <div className="text-lg font-bold text-white mt-1">$49 / user / mo</div>
                  <div className="text-cyan-400 mt-1">CAC: $150 · LTV: $1,960</div>
                  <div className="text-emerald-400 font-bold mt-0.5">LTV:CAC = 13:1</div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-cyan-500/30 rounded">
                  <span className="text-cyan-400 font-semibold">Team (Sweet Spot)</span>
                  <div className="text-lg font-bold text-white mt-1">$199 / mo (10 users)</div>
                  <div className="text-cyan-400 mt-1">CAC: $800 · LTV: $8,458</div>
                  <div className="text-emerald-400 font-bold mt-0.5">LTV:CAC = 10.6:1</div>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded">
                  <span className="text-slate-400">Enterprise</span>
                  <div className="text-lg font-bold text-white mt-1">$50,000+ ACV</div>
                  <div className="text-cyan-400 mt-1">CAC: $12,000 · LTV: $900,000</div>
                  <div className="text-emerald-400 font-bold mt-0.5">LTV:CAC = 75:1</div>
                </div>
              </div>
            </section>

            {/* 5. The Ask & Investor Returns */}
            <section className="space-y-3 bg-cyan-950/20 border border-cyan-500/30 p-5 rounded-xl">
              <h2 className="text-xl font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                5. The Financing Ask & Investor Return Scenarios
              </h2>
              <p className="text-sm text-slate-300">
                Raising <strong>$1.0M Seed Round</strong> ($4.0M pre-money valuation / $5.0M post-money). 15% employee option pool reserved. Capital deployed into product development (40%), customer acquisition (25%), senior engineering talent (20%), and enterprise SOC2/governance (15%).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs mt-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
                  <span className="text-slate-400 font-sans font-medium">Conservative Case</span>
                  <div className="text-base font-bold text-white mt-1">$5M ARR @ 6x</div>
                  <div className="text-slate-300 mt-1">Exit Valuation: $30M</div>
                  <div className="text-cyan-400 font-bold mt-1 text-sm">3.0x Return ($3.0M)</div>
                </div>
                <div className="p-3 bg-cyan-900/30 border border-cyan-500/50 rounded">
                  <span className="text-cyan-300 font-sans font-medium">Base Case (Target)</span>
                  <div className="text-base font-bold text-white mt-1">$12M ARR @ 8x</div>
                  <div className="text-slate-300 mt-1">Exit Valuation: $96M</div>
                  <div className="text-emerald-400 font-bold mt-1 text-sm">9.6x Return ($9.6M)</div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
                  <span className="text-slate-400 font-sans font-medium">High Growth Case</span>
                  <div className="text-base font-bold text-white mt-1">$25M ARR @ 10x</div>
                  <div className="text-slate-300 mt-1">Exit Valuation: $250M</div>
                  <div className="text-emerald-400 font-bold mt-1 text-sm">25.0x Return ($25.0M)</div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 border-t border-cyan-500/20 font-mono">
                <span>Founder: <strong className="text-slate-200">67.9%</strong> post-financing</span>
                <span>Option Pool: <strong className="text-slate-200">12.0%</strong></span>
                <span>Seed Investors: <strong className="text-cyan-300">20.0%</strong></span>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: Complete Master Strategy Document */}
        {activeView === 'master' && (
          <div className="space-y-10">
            {/* Header */}
            <div className="border-b border-cyan-500/20 pb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                MASTER SPECIFICATION & STRATEGY DOCUMENT · GEMINI READY
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
                PROJECT KINGDOM
              </h1>
              <p className="text-xl text-cyan-200 font-semibold mt-2">
                Strategic Operating System for Modern Leadership
              </p>
              <p className="text-sm text-slate-400 mt-1 font-mono">
                Product Strategy • MVP Roadmap • Investor Deck Architecture • Financial Model • Growth Plan
              </p>
            </div>

            {/* Section I: Executive Summary */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-slate-800 pb-2">
                I. EXECUTIVE SUMMARY & POSITIONING
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-slate-300">
                <p>
                  <strong>Project Kingdom</strong> is an AI-powered Strategic Command Center designed to give leaders complete operational visibility, mission coordination, automated intelligence, and decision support through a unified sovereign interface.
                </p>
                <div className="p-4 bg-slate-900/70 border-l-4 border-cyan-400 rounded-r-lg font-mono text-sm text-cyan-200">
                  Core Vision: "Rule with Clarity. Command with Confidence."<br />
                  Tagline: "See Everything. Direct Everything. Improve Everything."
                </div>
                <p>
                  Illustrative positioning hypothesis: Project Kingdom aims to bring project visibility, analytics, workflow coordination, and on-demand AI guidance into one workspace. Validate the problem and differentiation with customer research.
                </p>
              </div>
            </section>

            {/* Section II: Target Audiences */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-slate-800 pb-2">
                II. TARGET AUDIENCE & VALUE PROPOSITION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <h3 className="font-bold text-white text-base">1. Entrepreneurs & Founders</h3>
                  <p className="text-slate-400 mt-1">Need: Rapid growth visibility, cross-functional coordination, and holistic oversight.</p>
                  <p className="text-cyan-300 font-medium mt-1">Value: Central command center to scale without losing control.</p>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <h3 className="font-bold text-white text-base">2. Corporate Executives (C-Suite)</h3>
                  <p className="text-slate-400 mt-1">Need: High-level strategic visibility, automated intelligence briefings, and decision clarity.</p>
                  <p className="text-cyan-300 font-medium mt-1">Value: Answers the 4 Sovereign Questions in 30 seconds.</p>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <h3 className="font-bold text-white text-base">3. Technology & Engineering Teams</h3>
                  <p className="text-slate-400 mt-1">Need: Distributed system health, CI/CD telemetry, latency monitoring, and zero-trust security.</p>
                  <p className="text-cyan-300 font-medium mt-1">Value: Operational intelligence layer with sub-90ms ingestion.</p>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <h3 className="font-bold text-white text-base">4. Government & Institutional Programs</h3>
                  <p className="text-slate-400 mt-1">Need: Rigorous program governance, audit trails, and multi-agency accountability.</p>
                  <p className="text-cyan-300 font-medium mt-1">Value: Verifiable transparency and cryptographic audit invariants.</p>
                </div>
              </div>
            </section>

            {/* Section III: MVP Feature Matrix */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-slate-800 pb-2">
                III. MVP STRATEGY & SCOPE DISCIPLINE
              </h2>
              <div className="space-y-3 text-sm text-slate-300">
                <p>
                  <strong>Core Promise:</strong> One place to see what is happening, what matters, and what needs immediate action within 30 seconds.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                    <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      IN MVP (Validated Core)
                    </h3>
                    <ul className="list-disc list-inside text-xs space-y-1 text-slate-300 mt-2 font-mono">
                      <li>Unified Sovereign Command Dashboard</li>
                      <li>Mission Control (Planning, Active, Blocked, Done)</li>
                      <li>AI Sovereign Executive Briefings (Spoken + Audio)</li>
                      <li>Progressive Analytics (Area, Line, Segmented)</li>
                      <li>Adaptive User Roles (5 personas)</li>
                      <li>Event Feed & Priority Alerts (when connected)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-lg">
                    <h3 className="font-bold text-rose-400 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-400" />
                      DEFERRED POST-MVP (Disciplined Phase 2+)
                    </h3>
                    <ul className="list-disc list-inside text-xs space-y-1 text-slate-300 mt-2 font-mono">
                      <li>Enterprise Multi-Tenant Governance (SSO/SCIM)</li>
                      <li>Complex visual drag-and-drop workflow builders</li>
                      <li>Third-party marketplace integrations</li>
                      <li>Multi-organization sovereign hierarchy</li>
                      <li>Deep predictive machine learning forecasting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section IV: 20-Slide Investor Deck Structure */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-slate-800 pb-2">
                IV. 20-SLIDE INVESTOR DECK ARCHITECTURE
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                {[
                  { slide: '01', title: 'Cover: Project Kingdom', desc: 'Imperial Cyber Command' },
                  { slide: '02', title: 'Vision: Strategic OS', desc: 'Rule with Clarity' },
                  { slide: '03', title: 'Problem: Fragmentation', desc: 'Siloed tools & context switching' },
                  { slide: '04', title: 'Why Now: GenAI + Speed', desc: 'Convergence of AI & Execution' },
                  { slide: '05', title: 'Solution: Sovereign Hub', desc: 'Single Pane of Glass' },
                  { slide: '06', title: 'Product Architecture', desc: 'Dashboard + Missions + AI' },
                  { slide: '07', title: 'Under the Hood', desc: 'Gemini 3.8 + Event Bus' },
                  { slide: '08', title: 'MVP Validation Roadmap', desc: '90-Day Execution' },
                  { slide: '09', title: 'TAM / SAM / SOM', desc: '$150B / $20B / $100M SOM' },
                  { slide: '10', title: 'Bottom-Up Market Model', desc: '$8.0M Initial ARR Cohort' },
                  { slide: '11', title: 'Pricing & Tiers', desc: '$49/user, $199 Team, $50k Ent' },
                  { slide: '12', title: 'SaaS Unit Economics', desc: 'LTV:CAC up to 75:1' },
                  { slide: '13', title: 'Competitive Moat', desc: 'Unified Intelligence vs Sinks' },
                  { slide: '14', title: 'Go-To-Market & Growth', desc: 'Product-Led + Executive Sales' },
                  { slide: '15', title: '3-Year Financial Model', desc: '$58.8K -> $531K -> $2.07M' },
                  { slide: '16', title: 'Cap Table & Dilution', desc: '$1M Seed on $4M Pre-Money' },
                  { slide: '17', title: 'Enterprise Case Studies', desc: 'Tech, Healthcare & Gov' },
                  { slide: '18', title: 'KPI Dashboard', desc: 'Retention, NRR, AI Brevity' },
                  { slide: '19', title: 'Use of Funds', desc: '40% Eng, 25% GTM, 20% Team' },
                  { slide: '20', title: 'Closing: Rule with Clarity', desc: 'The Sovereign AI Era' },
                ].map((item) => (
                  <div key={item.slide} className="p-3 bg-slate-900/60 border border-slate-800 rounded">
                    <span className="text-cyan-400 font-bold">SLIDE {item.slide}</span>
                    <div className="font-semibold text-white mt-1">{item.title}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section V: Financial Projections & Economics */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-slate-800 pb-2">
                V. FINANCIAL MODEL & SAAS RETENTION METRICS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
                  <h3 className="font-bold text-white text-sm uppercase text-cyan-300">Cohort Retention Benchmarks</h3>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Month 1</span>
                    <span className="text-white font-bold tabular-nums">100%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Month 3</span>
                    <span className="text-cyan-400 font-bold tabular-nums">82% (Target &gt; 80%)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Month 6</span>
                    <span className="text-cyan-400 font-bold tabular-nums">71% (Target &gt; 70%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Month 12</span>
                    <span className="text-emerald-400 font-bold tabular-nums">62% (Target &gt; 60%)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
                  <h3 className="font-bold text-white text-sm uppercase text-cyan-300">Net Revenue Retention (NRR)</h3>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Downside Floor</span>
                    <span className="text-amber-400 font-bold tabular-nums">95%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Base Scenario</span>
                    <span className="text-cyan-400 font-bold tabular-nums">115%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Strong Expansion (Modeled)</span>
                    <span className="text-emerald-400 font-bold tabular-nums">125%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exceptional Scenario</span>
                    <span className="text-emerald-300 font-bold tabular-nums">140%+</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section VI: Cap Table Math & Dilution */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-slate-800 pb-2">
                VI. CAP TABLE MATH & DILUTION SCENARIOS
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-cyan-500/30 text-cyan-300 bg-slate-900/60">
                      <th className="py-2.5 px-3">Shareholder</th>
                      <th className="py-2.5 px-3">Pre-Financing</th>
                      <th className="py-2.5 px-3">After $500K SAFE</th>
                      <th className="py-2.5 px-3">After $1.0M Seed</th>
                      <th className="py-2.5 px-3">After $2.0M Seed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-white">Founder(s)</td>
                      <td className="py-2 px-3 tabular-nums text-cyan-400 font-bold">100.0%</td>
                      <td className="py-2 px-3 tabular-nums">77.1%</td>
                      <td className="py-2 px-3 tabular-nums font-bold text-emerald-300">67.9%</td>
                      <td className="py-2 px-3 tabular-nums">67.6%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-white">Seed / SAFE Investors</td>
                      <td className="py-2 px-3 tabular-nums">0.0%</td>
                      <td className="py-2 px-3 tabular-nums">12.9%</td>
                      <td className="py-2 px-3 tabular-nums font-bold text-cyan-300">20.0%</td>
                      <td className="py-2 px-3 tabular-nums">17.4%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-white">Employee Option Pool</td>
                      <td className="py-2 px-3 tabular-nums">0.0%</td>
                      <td className="py-2 px-3 tabular-nums">10.0%</td>
                      <td className="py-2 px-3 tabular-nums font-bold text-amber-300">12.0%</td>
                      <td className="py-2 px-3 tabular-nums">15.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section VII: 90-Day Execution Plan */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-400 border-b border-slate-800 pb-2">
                VII. 90-DAY EXECUTION TIMELINE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-cyan-400 font-bold text-sm">MONTH 1: FOUNDATION</div>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• W1: Positioning, homepage, design system</li>
                    <li>• W2: Cloud config, database, auth setup</li>
                    <li>• W3: Dashboard shell & responsive grid</li>
                    <li>• W4: Role selector & internal alpha</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-cyan-400 font-bold text-sm">MONTH 2: CORE PRODUCT</div>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• W5: Mission creation & status workflow</li>
                    <li>• W6: Deadlines, priorities, owner assignments</li>
                    <li>• W7: Activity feed and notifications (when configured)</li>
                    <li>• W8: Analytics charts & performance reporting</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-cyan-400 font-bold text-sm">MONTH 3: INTELLIGENCE & SCALE</div>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• W9: Gemini GenAI multi-agent reasoning</li>
                    <li>• W10: Executive briefings & spoken audio</li>
                    <li>• W11: Customer pilot demos & interviews</li>
                    <li>• W12: Enterprise hardening & public launch</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section VIII: North Star */}
            <div className="p-6 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-center space-y-2">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">The Sovereign North Star</h3>
              <p className="text-sm text-cyan-200 italic max-w-2xl mx-auto">
                "Project Kingdom is not another dashboard. It is a Strategic Operating System that helps organizations transform fragmented information into coordinated execution."
              </p>
              <div className="text-xs text-slate-400 font-mono pt-2">
                One Platform. Complete Visibility. Smarter Execution.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Interactive Cap Table & Financial Calculator */}
        {activeView === 'calculator' && (
          <div className="space-y-8">
            <div className="border-b border-cyan-500/20 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-cyan-400" />
                Interactive Cap Table & Investor Return Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Dynamically adjust Seed round financing parameters to calculate post-money valuation, dilution, and projected investor return multiples upon exit.
              </p>
            </div>

            {/* Slider Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Raise Amount: <span className="text-cyan-400 font-bold">${(raiseAmount / 1000).toLocaleString()}K</span>
                </label>
                <input
                  type="range"
                  min="250000"
                  max="3000000"
                  step="50000"
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>$250K</span>
                  <span>$1.0M</span>
                  <span>$3.0M</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Pre-Money Valuation: <span className="text-cyan-400 font-bold">${(preMoney / 1000000).toFixed(1)}M</span>
                </label>
                <input
                  type="range"
                  min="2000000"
                  max="10000000"
                  step="250000"
                  value={preMoney}
                  onChange={(e) => setPreMoney(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>$2.0M</span>
                  <span>$4.0M</span>
                  <span>$10.0M</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Option Pool Reserved: <span className="text-amber-400 font-bold">{optionPoolPct}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={optionPoolPct}
                  onChange={(e) => setOptionPoolPct(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>5%</span>
                  <span>15%</span>
                  <span>20%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Exit ARR: <span className="text-emerald-400 font-bold">${(exitArr / 1000000).toFixed(1)}M @ {exitMultiple}x</span>
                </label>
                <input
                  type="range"
                  min="5000000"
                  max="50000000"
                  step="1000000"
                  value={exitArr}
                  onChange={(e) => setExitArr(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>$5M</span>
                  <span>$12M</span>
                  <span>$50M</span>
                </div>
              </div>
            </div>

            {/* Calculated Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-xs font-mono text-slate-400">Post-Money Valuation</span>
                <div className="text-2xl font-bold text-white mt-1 tabular-nums">
                  ${(postMoney / 1000000).toFixed(2)}M
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  ${(preMoney / 1000000).toFixed(1)}M Pre + ${(raiseAmount / 1000000).toFixed(1)}M Raised
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-lg">
                <span className="text-xs font-mono text-cyan-400">Investor Ownership</span>
                <div className="text-2xl font-bold text-cyan-300 mt-1 tabular-nums">
                  {investorOwnershipPct.toFixed(1)}%
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Founder Retains: {founderOwnershipPct.toFixed(1)}%
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="text-xs font-mono text-slate-400">Projected Exit Valuation</span>
                <div className="text-2xl font-bold text-white mt-1 tabular-nums">
                  ${(exitValuation / 1000000).toFixed(1)}M
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  ${(exitArr / 1000000).toFixed(1)}M ARR × {exitMultiple}x multiple
                </div>
              </div>

              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-lg">
                <span className="text-xs font-mono text-emerald-400">Investor Return Multiple</span>
                <div className="text-2xl font-bold text-emerald-300 mt-1 tabular-nums">
                  {investorReturnMultiple.toFixed(1)}x
                </div>
                <div className="text-[11px] text-emerald-400/80 font-mono mt-1">
                  Payout: ${(investorProceeds / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>

            {/* Dynamic Ownership Bar */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400">Founder ({founderOwnershipPct.toFixed(1)}%)</span>
                <span className="text-amber-400">Option Pool ({optionPoolPct}%)</span>
                <span className="text-emerald-400">Investors ({investorOwnershipPct.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${founderOwnershipPct}%` }}
                  className="bg-cyan-500 h-full transition-all duration-300"
                />
                <div
                  style={{ width: `${optionPoolPct}%` }}
                  className="bg-amber-500 h-full transition-all duration-300"
                />
                <div
                  style={{ width: `${investorOwnershipPct}%` }}
                  className="bg-emerald-500 h-full transition-all duration-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Seventeen Pockets Decentralized Architecture & Series A Deck */}
        {activeView === 'seventeen-pockets' && (
          <SeventeenPocketsView onNotify={onNotify} />
        )}
      </div>
    </div>
  );
};

// ==========================================
// CLEAN MARKDOWN STRINGS (FORMATTED FOR GEMINI)
// ==========================================

const SHORT_INVESTOR_MARKDOWN = `# PROJECT KINGDOM: ILLUSTRATIVE INVESTOR SCENARIO
> **Model disclosure:** All market, revenue, pricing, unit-economics, valuation, ownership, and exit figures below are unverified planning assumptions. They are not actual company results, audited financials, sourced market research, a securities offer, or guaranteed returns. Validate and source every figure before external distribution.

**Draft executive overview and illustrative scenario model**
*Rule with Clarity. Command with Confidence.*

---

### 1. Executive Summary & Thesis
Project Kingdom is designed as a unified strategic operating workspace for modern leadership. Modern enterprises and high-growth organizations suffer from severe operational fragmentation: projects live in Jira/Asana, analytics in Datadog/Snowflake, communications in Slack, and strategic decisions in unrecorded meetings. Project Kingdom unifies real-time intelligence, active missions, strategic analytics, workflow automation, and multi-agent AI guidance into one sovereign command center.

### 2. Market Opportunity (TAM / SAM / SOM)
- **TAM ($150B+)**: Work Management ($24B) + Business Intelligence ($33B) + Observability ($22B) + Enterprise AI Assistants ($70B+).
- **SAM ($20B+)**: Leadership, operations orchestration, and mission management software.
- **SOM ($100M ARR)**: 5-year obtainable focus on technology, clinical/healthcare, and institutional programs.

### 3. Three-Year Financial Model
| Metric | Year 1 | Year 2 | Year 3 | Benchmark / Target |
| :--- | :---: | :---: | :---: | :--- |
| **ARR / Revenue** | $58.8K | $531K | $2.07M | 9x Y2 YoY, 3.9x Y3 YoY |
| **Operating Expenses** | $350K | $900K | $1.80M | Lean engineering headcount |
| **EBITDA** | -$291K | -$369K | +$270K | Cash-flow positive at Month 32 |
| **Net Retention (NRR)** | 115% | 125% | 132% | Top-quartile B2B benchmark |
| **Gross Margin** | 78% | 84% | 86% | Pure software margin profile |

### 4. SaaS Unit Economics & Pricing
- **Professional ($49/user/mo)**: CAC $150 · LTV $1,960 · **LTV:CAC 13:1**
- **Team ($199/mo up to 10 users)**: CAC $800 · LTV $8,458 · **LTV:CAC 10.6:1**
- **Enterprise ($50,000+ ACV)**: CAC $12,000 · LTV $900,000 · **LTV:CAC 75:1**

### 5. The Ask & Return Potential
- **Seed Raise**: $1.0M on a $4.0M Pre-Money Valuation ($5.0M Post).
- **Option Pool**: 15% reserved.
- **Post-Money Ownership**: Founders 67.9% | Investors 20.0% | Option Pool 12.0%.
- **Exit Return Scenarios**:
  - *Conservative*: $5M ARR @ 6x ($30M exit) -> **3.0x Return ($3.0M)**
  - *Base Case*: $12M ARR @ 8x ($96M exit) -> **9.6x Return ($9.6M)**
  - *High Growth*: $25M ARR @ 10x ($250M exit) -> **25.0x Return ($25.0M)**

---
*One Platform. Complete Visibility. Smarter Execution.*`;

const MASTER_DOCUMENT_MARKDOWN = `# PROJECT KINGDOM: MASTER STRATEGY — ILLUSTRATIVE MODEL
> **Model disclosure:** All market, revenue, pricing, unit-economics, valuation, ownership, and exit figures below are unverified planning assumptions. They are not actual company results, audited financials, sourced market research, a securities offer, or guaranteed returns. Validate and source every figure before external distribution.

*Product Strategy • MVP • Website • Investor Deck • Financial Model • Growth Plan*

## 1. Executive Summary & Brand Positioning
- **Core Vision**: Rule with Clarity. Command with Confidence.
- **Positioning**: Project Kingdom sits above isolated project tools, dashboards, analytics platforms, and AI assistants to provide Visibility, Coordination, Intelligence, Execution, and Governance in one operating environment.
- **Tagline**: See Everything. Direct Everything. Improve Everything.

## 2. Target Audiences
1. **Entrepreneurs**: Growth visibility, cross-functional coordination, business oversight.
2. **Executives**: Strategic visibility, organizational intelligence, executive decision support.
3. **Technology Teams**: System visibility, telemetry integrations, operational intelligence.
4. **Government & Institutions**: Program accountability, transparent governance, multi-agency auditability.
5. **Project & Operations Teams**: Mission tracking, execution visibility, team velocity.

## 3. MVP Strategy & Scope Discipline
- **Core Promise**: One place to see what is happening, what matters, and what needs action within 30 seconds.
- **MVP Modules**:
  - Command Dashboard (Health, Active Missions, Alerts, Feed, AI Summary)
  - Mission Control (Planning, Active, Blocked, Completed, Archived)
  - AI Executive Briefings (Answers 4 Sovereign Questions with audio script)
  - Strategic Analytics (Area chart, Line chart, Segmented matrix)
  - User Profiles (5 personas) & Priority Notifications
- **Deferred Post-MVP**: Enterprise multi-tenant governance, complex drag-and-drop workflow builders, multi-org hierarchies.

## 4. 20-Slide Investor Deck Architecture
- Slide 01: Cover (Project Kingdom)
- Slide 02: Vision (Strategic Operating System)
- Slide 03: Problem (Fragmented Organizational Intelligence)
- Slide 04: Why Now (Convergence of GenAI & Operational Velocity)
- Slide 05: Solution (Unified Command Platform)
- Slide 06: Product (Dashboard + Missions + AI Sovereign Advisor)
- Slide 07: Platform Architecture (Gemini 3.8 Flash + Event Bus)
- Slide 08: MVP Roadmap & 90-Day Milestones
- Slide 09: TAM / SAM / SOM ($150B / $20B / $100M SOM)
- Slide 10: Bottom-Up Market Model ($8.0M Initial ARR Cohort)
- Slide 11: Pricing & Packaging ($49 / $199 / $50k)
- Slide 12: SaaS Economics (LTV:CAC 10.6:1 to 75:1)
- Slide 13: Competitive Landscape & Defensibility
- Slide 14: Go-To-Market & Acquisition Flywheel
- Slide 15: Three-Year Financial Model ($58.8K -> $531K -> $2.07M)
- Slide 16: Cap Table, SAFE Scenarios & Dilution
- Slide 17: Illustrative Use-Case Examples (Not Customer Case Studies)
- Slide 18: KPI Dashboard (Retention, NRR, AI Brevity)
- Slide 19: Use of Funds (40% Product, 25% GTM, 20% Talent, 15% Ops)
- Slide 20: Closing Narrative: The Sovereign AI Era

## 5. Three-Year Financial Model & SaaS Metrics
| Year | Revenue | Operating Expenses | EBITDA |
| :--- | :---: | :---: | :---: |
| **Year 1** | $58.8K | $350K | -$291K |
| **Year 2** | $531K | $900K | -$369K |
| **Year 3** | $2.07M | $1.80M | +$270K (Profitable) |

### Cohort Retention
- Month 1: 100%
- Month 3: 82% (Target > 80%)
- Month 6: 71% (Target > 70%)
- Month 12: 62% (Target > 60%)

### Net Revenue Retention (NRR)
- Downside: 95%
- Base Scenario: 115%
- Strong Expansion: 125%
- Exceptional: 140%+

## 6. Cap Table & Dilution Scenarios
- **Assumptions**: $4.0M pre-money valuation, $1.0M Seed raise, 15% option pool.
- **Post-Money Ownership**:
  - Founder(s): **67.9%**
  - Seed Investor(s): **20.0%**
  - Option Pool: **12.0%**
- **Investor Returns**:
  - Conservative ($5M ARR @ 6x = $30M): **3.0x return ($3.0M)**
  - Base Target ($12M ARR @ 8x = $96M): **9.6x return ($9.6M)**
  - High Growth ($25M ARR @ 10x = $250M): **25.0x return ($25.0M)**

## 7. 90-Day Execution Timeline
- **Month 1 (Foundation)**: Positioning, Vercel/Cloud setup, design system, dashboard shell, role selector.
- **Month 2 (Core Product)**: Mission management, priorities, activity feeds, analytics charts.
- **Month 3 (Intelligence & Validation)**: Gemini GenAI integration, executive audio briefings, customer interviews, public launch.

---
*One Platform. Complete Visibility. Smarter Execution.*`;

const SEVENTEEN_POCKETS_MARKDOWN = `# SEVENTEEN POCKETS - COMPLETE INVESTOR & ARCHITECTURE DOCUMENT
*Decentralized Clinical Intelligence Platform • Version 1.0*
*Attributed to: ODell Anderson, Chief Architect*
*Principle: "Cloud Optional. Care Continuous."*

---

### Executive Summary
Seventeen Pockets is an offline-first, decentralized clinical intelligence platform engineered for healthcare environments where cloud connectivity is unreliable, privacy requirements are strict, and operational resilience is critical.

The platform combines:
- Local AI inference
- Edge computing
- Behavioral health research
- Clinical decision support
- Privacy-preserving architecture
- Optional cloud synchronization

Its vision is to become the operating system for decentralized healthcare intelligence, enabling clinics and healthcare organizations to deploy AI-assisted workflows directly at the point of care.

### Manifesto
> "We build systems that connect humanity. Not through promises, but through precision. Not through capital, but through intelligence. Every number proves competence. Every system operates with zero error tolerance. This is how the future is built."
> — ODell Anderson, Chief Architect

### Core Platform Components
1. **Mental Health Coping Lab**: Researches emotional regulation through Polyvagal breathwork, Sensory grounding, CBT decatastrophizing, and live SUDS measurement.
2. **17 Pockets Atlas**: Directory containing Pocket 0 (Oracle), Pockets 1–15 (Micro-Services), and Pocket 16 (Edge OS Appliance).
3. **One-Command Edge Installer**: Deployment automation (\`deploy-pocket3-auto.sh\`) featuring local SQLite provisioning and self-healing systemd services.
4. **Soul Auditor & Composer**: Continuous invariant verification, pre-production bug detection, and clinical correspondence generation.

---

### Five-Tier Architecture
\`\`\`text
CLINICIANS
│
▼
┌─────────────────────────────────────┐
│ TIER 5                              │
│ Clinical Experience                 │
│ Patient + Provider Applications     │
└─────────────────────────────────────┘
│
▼
┌─────────────────────────────────────┐
│ TIER 4                              │
│ Clinical Intelligence               │
│ CBT • SUDS • Decision Support       │
└─────────────────────────────────────┘
│
▼
┌─────────────────────────────────────┐
│ TIER 3                              │
│ Local Data Fabric                   │
│ Records • Audit Logs • Encryption   │
└─────────────────────────────────────┘
│
▼
┌─────────────────────────────────────┐
│ TIER 2                              │
│ Edge Runtime                        │
│ AI Models • Security • Automation   │
└─────────────────────────────────────┘
│
▼
┌─────────────────────────────────────┐
│ TIER 1                              │
│ Hybrid Cloud Mesh                   │
│ Backup • Sync • Fleet Management    │
└─────────────────────────────────────┘
\`\`\`

- **Tier 5 (Clinical Experience Layer)**: Clinician Dashboard, Mental Health Coping Lab, Patient Interface, Reporting, Communication.
- **Tier 4 (Clinical Intelligence Layer)**: Emotional Regulation Analytics, CBT Guidance, SUDS Tracking, Behavioral Monitoring, Decision Support, Soul Auditor.
- **Tier 3 (Local Data Fabric)**: SQLite Databases, Audit Logs, Event Journals, Clinical Records, At-Rest Encryption.
- **Tier 2 (Edge Runtime Layer)**: Local AI Models, Runtime Services, Device Management, Security Controls, Self-Healing Services.
- **Tier 1 (Hybrid Cloud Mesh)**: Backup Storage, Nightly Synchronization, Archive Management, Fleet Coordination, Disaster Recovery.

---

### Clinical & Privacy Claims Assessment
| Claim Category | Item | Assessment |
| :--- | :--- | :--- |
| **Clinical** | CBT Decatastrophizing | ✅ Strong evidence base. Widely accepted therapeutic technique. |
| **Clinical** | SUDS Measurement | ✅ Established standard clinical practice for distress evaluation. |
| **Clinical** | Behavioral Health Tracking | ✅ Plausible. Standard practice across modern platforms. |
| **Clinical** | Polyvagal Breathwork | ⚠ Emerging physiological evidence with HRV correlation. |
| **Clinical** | Sensory Grounding | ⚠ Generally accepted somatic distress interruption tool. |
| **Clinical** | Zero Error Tolerance | ❌ Engineering goal; software always retains residual risk. |
| **Privacy** | Local Data Storage | ✅ Significant privacy advantage. Data remains on facility hardware. |
| **Privacy** | Reduced Cloud Exposure | ✅ Credible. Less data movement means fewer remote attack surfaces. |
| **Privacy** | Data Sovereignty | ✅ Credible. Conforms to local multi-jurisdiction storage mandates. |
| **Privacy** | HIPAA / GDPR | ⚠ Requires operational policies, training, and facility audits. |

---

### Five Revenue Layers & Series A Fundraising
1. **Layer 1: Platform Licensing** ($5,000–$25,000 / site / year).
2. **Layer 2: Managed Edge Infrastructure** ($500–$1,500 / month recurring fleet management).
3. **Layer 3: Clinical Intelligence Modules** (Outcome dashboards, behavioral analytics, AI documentation).
4. **Layer 4: Compliance Services** ($25,000–$75,000 / year Soul Auditor certification).
5. **Layer 5: Privacy-Preserving Intelligence Network** (Federated clinical benchmarking).

**Series A Financing Ask**: **$5,000,000**
- 30% Clinical Validation & Pilot Studies
- 30% Product Engineering & Edge Runtime
- 15% Security Audits & Compliance Tooling
- 15% Sales & Provider Partnerships
- 10% Operations & Fleet Logistics

**Taglines**:
- *Clinical Intelligence at the Edge*
- *Healthcare AI Without Connectivity Limits*
- *The Decentralized Operating System for Healthcare*
- *Cloud Optional. Care Continuous.*`;
