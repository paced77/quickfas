import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ExecutiveBriefing } from './components/ExecutiveBriefing.tsx';
import { CommandGrid } from './components/CommandGrid.tsx';
import { StrategicRadar } from './components/StrategicRadar.tsx';
import { AgentCouncil } from './components/AgentCouncil.tsx';
import { DigitalTwin } from './components/DigitalTwin.tsx';
import { TelemetryFeed } from './components/TelemetryFeed.tsx';
import { VoiceConsole } from './components/VoiceConsole.tsx';
import { ExecutiveBriefingData } from './types/kingdom.ts';
import { audioEngine } from './services/audioEngine.ts';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'war-room' | 'council' | 'digital-twin' | 'telemetry'>('war-room');
  const [briefing, setBriefing] = useState<ExecutiveBriefingData>(INITIAL_BRIEFING);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState<boolean>(false);
  const [isVoiceConsoleOpen, setIsVoiceConsoleOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAmbientActive, setIsAmbientActive] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Header & Telemetry Strip */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          audioEngine.playPositiveSignal();
          setActiveTab(tab);
        }}
        onOpenVoiceConsole={() => {
          audioEngine.playPositiveSignal();
          setIsVoiceConsoleOpen(true);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isAmbientActive={isAmbientActive}
        onToggleAmbient={handleToggleAmbient}
      />

      {/* Main Command Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0c162c] border border-cyan-500/40 text-cyan-200 text-xs px-4 py-2.5 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab 1: Executive War Room (Mission Control) */}
        {activeTab === 'war-room' && (
          <div className="space-y-6">
            {/* Live Executive Briefing with 4 Sovereign Questions & Spoken Audio */}
            <ExecutiveBriefing
              briefing={briefing}
              isLoading={isLoadingBriefing}
              onRefreshBriefing={fetchLiveBriefing}
              onActionTriggered={handleActionTriggered}
            />

            {/* 360° Strategic Radar */}
            <StrategicRadar />

            {/* Subsystem Live Performance Grid */}
            <CommandGrid />
          </div>
        )}

        {/* Tab 2: AI Council Chamber */}
        {activeTab === 'council' && (
          <div>
            <AgentCouncil />
          </div>
        )}

        {/* Tab 3: Enterprise Digital Twin */}
        {activeTab === 'digital-twin' && (
          <div>
            <DigitalTwin />
          </div>
        )}

        {/* Tab 4: Telemetry Fabric */}
        {activeTab === 'telemetry' && (
          <div>
            <TelemetryFeed />
          </div>
        )}
      </main>

      {/* Voice Console Modal */}
      <VoiceConsole
        isOpen={isVoiceConsoleOpen}
        onClose={() => setIsVoiceConsoleOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsVoiceConsoleOpen(false);
        }}
        onTriggerBriefing={() => {
          setIsVoiceConsoleOpen(false);
          fetchLiveBriefing();
        }}
      />

      {/* Sovereign OS Quiet Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PROJECT KINGDOM // 2027+ SOVEREIGN INTELLIGENCE OPERATING SYSTEM</span>
          <span>AUTONOMOUS DECISION FABRIC · TEL-001/005 VERIFIED</span>
        </div>
      </footer>
    </div>
  );
}
