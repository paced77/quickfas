import React, { useState, useEffect } from 'react';
import { Sidebar, KingdomNavTab } from './components/layout/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { ExecutiveBriefing } from './components/ExecutiveBriefing.tsx';
import { ChartsSection } from './components/dashboard/ChartsSection.tsx';
import { CommandGrid } from './components/CommandGrid.tsx';
import { StrategicRadar } from './components/StrategicRadar.tsx';
import { MissionControl } from './components/missions/MissionControl.tsx';
import { KingdomMap } from './components/realm/KingdomMap.tsx';
import { AutomationEngine } from './components/automations/AutomationEngine.tsx';
import { AgentCouncil } from './components/AgentCouncil.tsx';
import { DigitalTwin } from './components/DigitalTwin.tsx';
import { TelemetryFeed } from './components/TelemetryFeed.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { VoiceConsole } from './components/VoiceConsole.tsx';
import { InvestorPortal } from './components/strategy/InvestorPortal.tsx';
import { QuickfasNexus } from './components/nexus/QuickfasNexus.tsx';
import { ExecutiveBriefingData } from './types/kingdom.ts';
import { audioEngine } from './services/audioEngine.ts';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { ConsentBanner } from './components/privacy/ConsentBanner.tsx';
import { StorageAuditPanel } from './components/privacy/StorageAuditPanel.tsx';
import { trackAnalyticsEvent } from './platform/analytics/analyticsEvents.ts';

const INITIAL_BRIEFING: ExecutiveBriefingData = {
  headline: 'All Clinical Edge Systems Nominal · Strategic Protocol Milestone Accelerated',
  statusSummary: 'Decentralized clinical edge nodes across the regional network and edge appliances are operating at 99.4% uptime with sub-85ms latency. SUDS distress down-regulation protocol validated across registered cohort participants. Two active regulatory audit invariants verified.',
  spokenScript: 'Good morning. Clinical Edge systems online. Telemetry ingestion stable across all decentralized nodes. Cohort protocol milestone on track. Two automated invariant checkpoints cleared.',
  coreAnswers: {
    whatIsHappeningNow: 'Decentralized clinical edge networks and Seventeen Pockets appliances are actively collecting patient SUDS telemetry across 16 edge sites. Over 650 participants are actively engaged.',
    whyIsItHappening: 'Offline-first edge runtime (Pockets 1–5) and automated FHIR pipelines eliminated connectivity latency, accelerating daily intake velocity by 28%.',
    whatHappensNext: 'Pivotal validation protocol milestone will be achieved 14 calendar days ahead of schedule, enabling expedited regulatory submission package generation.',
    whatShouldIDo: 'Authorize the Sovereign AI Council directive to pre-allocate edge compute capacity to maintain sub-90ms local inference parity.',
  },
  keySignals: [
    {
      metric: 'REVENUE / RUN-RATE',
      delta: '$14.2M ARR',
      sentiment: 'positive',
      context: '+24.8% YoY Expansion',
    },
    {
      metric: 'CLINICAL VELOCITY',
      delta: '28 / mo',
      sentiment: 'positive',
      context: '+32% vs Baseline Protocol',
    },
    {
      metric: 'EDGE SYSTEM HEALTH',
      delta: '99.4%',
      sentiment: 'nominal',
      context: '16 Edge Nodes Autonomous',
    },
    {
      metric: 'ACTIVE INVARIANTS',
      delta: '0 Breached',
      sentiment: 'positive',
      context: 'Continuous Soul Auditor Pass',
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<KingdomNavTab>('dashboard');
  const [isLandingView, setIsLandingView] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [briefing, setBriefing] = useState<ExecutiveBriefingData>(INITIAL_BRIEFING);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState<boolean>(false);
  const [isVoiceConsoleOpen, setIsVoiceConsoleOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAmbientActive, setIsAmbientActive] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    void trackAnalyticsEvent('page_view');
  }, []);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const fetchLiveBriefing = async () => {
    setIsLoadingBriefing(true);
    try {
      const res = await fetch('/api/gemini/executive-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeOfDay: 'Good morning',
          focusDomain: activeTab,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
        audioEngine.playCompletionSignal();
        triggerToast('Executive Briefing regenerated via Gemini 3.8 Flash');
      }
    } catch (err) {
      console.error('Failed to refresh briefing:', err);
      audioEngine.playWarningSignal();
    } finally {
      setIsLoadingBriefing(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
    if (nextMuted) {
      setIsAmbientActive(false);
    }
  };

  const handleToggleAmbient = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setMuted(false);
    }
    const state = audioEngine.toggleAmbientPulse();
    setIsAmbientActive(state);
    if (state) {
      triggerToast('Ambient Telemetry Pulse Engaged (55Hz Harmonic Floor)');
    } else {
      triggerToast('Ambient Telemetry Pulse Disengaged');
    }
  };

  const handleActionTriggered = (actionTitle: string) => {
    triggerToast(`Sovereign directive ratified: "${actionTitle}". Telemetry logged to edge buffer.`);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Imperial Cyber Command Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          audioEngine.playPositiveSignal();
          setActiveTab(tab);
          setIsLandingView(false);
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onToggleLandingView={() => {
          audioEngine.playPositiveSignal();
          setIsLandingView(!isLandingView);
        }}
        isLandingView={isLandingView}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Top Command Bar */}
        <Header
          activeTab={activeTab}
          onSelectTab={(tab) => {
            audioEngine.playPositiveSignal();
            setActiveTab(tab);
            setIsLandingView(false);
          }}
          onOpenVoiceConsole={() => {
            audioEngine.playPositiveSignal();
            setIsVoiceConsoleOpen(true);
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isAmbientActive={isAmbientActive}
          onToggleAmbient={handleToggleAmbient}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onToggleLandingView={() => setIsLandingView(!isLandingView)}
          isLandingView={isLandingView}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <aside
            role="note"
            aria-label="Platform operational status"
            className="mb-5 rounded-lg border border-cyan-400/30 bg-cyan-950/30 px-4 py-2.5 text-xs leading-5 text-cyan-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>
                <strong>Stratum Clinical Edge &amp; Project Kingdom (Seventeen Pockets)</strong> · Operational Edge Fabric Active · Sub-90ms Query Latency · Privacy-Preserving Zero-Knowledge Storage
              </span>
            </div>
            <span className="font-mono text-[11px] text-cyan-300 hidden md:inline">WCAG 2.2 AA · Grade 6–8 Literacy Invariant</span>
          </aside>
          {/* Toast Notification */}
          {notification && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-[#6ee7ff]/40 text-cyan-200 text-xs px-4 py-2.5 rounded-lg shadow-[0_0_24px_rgba(110,231,255,0.3)] flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
              <CheckCircle2 className="w-4 h-4 text-[#6ee7ff] shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Conditional View: Landing Page Mode vs Command Center Bridge */}
          {isLandingView ? (
            <LandingPage onEnterKingdom={() => setIsLandingView(false)} />
          ) : (
            <>
              {/* Tab 1: Dashboard (Unified Command View) */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Sovereign Executive Briefing (The 4 Questions & Spoken Audio) */}
                  <ExecutiveBriefing
                    briefing={briefing}
                    isLoading={isLoadingBriefing}
                    onRefreshBriefing={fetchLiveBriefing}
                    onActionTriggered={handleActionTriggered}
                  />

                  {/* Progressive Disclosure Charts (Health Area, Forecast Line, Resources Segmented) */}
                  <ChartsSection />

                  {/* 360° Strategic Radar */}
                  <StrategicRadar />

                  {/* Subsystem Live Performance Grid */}
                  <CommandGrid />
                </div>
              )}


              {/* Tab 2: Mission Control */}
              {activeTab === 'missions' && (
                <div>
                  <MissionControl />
                </div>
              )}

              {/* Tab 3: AI Sovereign Advisor (Deliberation Chamber & Leaders) */}
              {activeTab === 'advisor' && (
                <div>
                  <AgentCouncil />
                </div>
              )}

              {/* Tab 4: Strategic Analytics */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <ChartsSection />
                  <StrategicRadar />
                  <CommandGrid />
                </div>
              )}

              {/* Tab 5: Kingdom Map */}
              {activeTab === 'map' && (
                <div>
                  <KingdomMap />
                </div>
              )}

              {/* Tab 6: Automations */}
              {activeTab === 'automations' && (
                <div>
                  <AutomationEngine />
                </div>
              )}

              {/* Tab 7: Intelligence Feed / Reports */}
              {activeTab === 'reports' && (
                <div>
                  <TelemetryFeed />
                </div>
              )}

              {/* Tab 8: AI Council */}
              {activeTab === 'council' && (
                <div>
                  <AgentCouncil />
                </div>
              )}

              {/* Tab 9: Investor Deck & Master Strategy */}
              {activeTab === 'strategy' && (
                <div>
                  <InvestorPortal onNotify={(msg) => triggerToast(msg)} />
                </div>
              )}

              {/* Tab 10: Settings & Governance (Digital Twin & Invariants) */}
              {activeTab === 'governance' && (
                <div>
                  <DigitalTwin />
                  <StorageAuditPanel />
                </div>
              )}

              {/* Quickfas Nexus: public project-network intelligence */}
              {activeTab === 'nexus' && (
                <div>
                  <QuickfasNexus />
                </div>
              )}
            </>
          )}
        </main>

        {/* Voice Console Modal */}
        <VoiceConsole
          isOpen={isVoiceConsoleOpen}
          onClose={() => setIsVoiceConsoleOpen(false)}
          onNavigateTab={(tab) => {
            if (tab === 'war-room') setActiveTab('dashboard');
            else if (tab === 'council') setActiveTab('advisor');
            else if (tab === 'digital-twin') setActiveTab('governance');
            else if (tab === 'telemetry') setActiveTab('reports');
            setIsVoiceConsoleOpen(false);
            setIsLandingView(false);
          }}
          onTriggerBriefing={() => {
            setIsVoiceConsoleOpen(false);
            fetchLiveBriefing();
          }}
        />

        {/* Quiet Sovereign OS Footer */}
        <footer className="border-t border-white/5 py-4 text-center text-xs font-mono text-slate-500 bg-[#070b14]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>PROJECT KINGDOM // IMPERIAL CYBER COMMAND · Illustrative workspace</span>
            <span>SEE EVERYTHING · DIRECT EVERYTHING · IMPROVE EVERYTHING</span>
          </div>
        </footer>
      </div>
      <ConsentBanner />
    </div>
  );
}
