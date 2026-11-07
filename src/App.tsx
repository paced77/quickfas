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
import { ExecutiveBriefingData } from './types/kingdom.ts';
import { audioEngine } from './services/audioEngine.ts';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { ConsentBanner } from './components/privacy/ConsentBanner.tsx';
import { trackAnalyticsEvent } from './platform/analytics/analyticsEvents.ts';

const INITIAL_BRIEFING: ExecutiveBriefingData = {
  headline: 'All Kingdom Systems Nominal · Clinical Endpoint Acceleration Approved',
  statusSummary: 'Multi-center clinical trial velocity exceeds protocol baseline by 32%. Revenue trajectory tracks at $14.2M MRR with 38.5 months runway. Two strategic risks actively monitored with automated failover.',
  spokenScript: 'Good morning. Kingdom systems online. Clinical operations stable. Revenue forecast increased. Two strategic risks require review. Overall system health remains above target.',
  coreAnswers: {
    whatIsHappeningNow: 'Multi-center clinical operations are executing with sub-90ms ingestion across Mayo and Charite nodes. Cohort enrollment is at 684 out of 720 patients.',
    whyIsItHappening: 'Automated FHIR pipelines have removed manual site verification lag, increasing monthly patient intake velocity to 28.5 patients per month.',
    whatHappensNext: 'Phase III protocol milestone will be achieved 14 calendar days ahead of schedule, enabling expedited submission package generation.',
    whatShouldIDo: 'Authorize the Sovereign AI Council directive to pre-allocate $850k into Zurich edge genomics processing to maintain real-time analysis parity.',
  },
  keySignals: [
    {
      metric: 'REVENUE / MRR',
      delta: '$14.2M',
      sentiment: 'positive',
      context: '+24.8% YoY Growth',
    },
    {
      metric: 'CLINICAL VELOCITY',
      delta: '28.5 / mo',
      sentiment: 'positive',
      context: '684 / 720 Enrolled',
    },
    {
      metric: 'SYSTEM LATENCY',
      delta: '83ms',
      sentiment: 'nominal',
      context: '142.8 FHIR tx/s',
    },
    {
      metric: 'STRATEGIC RISKS',
      delta: '2 Active',
      sentiment: 'warning',
      context: 'Zurich Biostorage & EMA',
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
    triggerToast(`Sovereign Action Enacted: "${actionTitle}"`);
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
            aria-label="Sample data disclosure"
            className="mb-5 rounded-lg border border-amber-400/30 bg-amber-950/30 px-4 py-3 text-xs leading-5 text-amber-100"
          >
            <strong>Illustrative workspace:</strong> some dashboard metrics, maps, charts, and AI fallback responses use
            sample scenarios. They are not connected to live clinical, financial, or operational systems and must not be
            used to make real-world decisions. No patient records are loaded.
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
            <span>PROJECT KINGDOM // IMPERIAL CYBER COMMAND</span>
            <span>SEE EVERYTHING · DIRECT EVERYTHING · IMPROVE EVERYTHING</span>
          </div>
        </footer>
      </div>
      <ConsentBanner />
    </div>
  );
}
