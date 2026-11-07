import React, { useState } from 'react';
import { Play, Square, RefreshCw, Volume2, ShieldAlert, ArrowUpRight, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { ExecutiveBriefingData } from '../types/kingdom.ts';
import { audioEngine } from '../services/audioEngine.ts';

interface ExecutiveBriefingProps {
  briefing: ExecutiveBriefingData;
  isLoading: boolean;
  onRefreshBriefing: () => void;
  onActionTriggered: (actionTitle: string) => void;
}

export const ExecutiveBriefing: React.FC<ExecutiveBriefingProps> = ({
  briefing,
  isLoading,
  onRefreshBriefing,
  onActionTriggered,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleToggleVoiceBriefing = () => {
    if (isPlayingAudio) {
      audioEngine.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      audioEngine.playPositiveSignal();
      setIsPlayingAudio(true);
      const ok = audioEngine.speak(briefing.spokenScript, () => {
        setIsPlayingAudio(false);
        audioEngine.playCompletionSignal();
      });
      if (!ok) {
        setIsPlayingAudio(false);
      }
    }
  };

  const handleAction = (title: string) => {
    audioEngine.playCompletionSignal();
    onActionTriggered(title);
  };

  return (
    <div className="glass-panel-elevated rounded-xl p-5 md:p-6 mb-6 relative overflow-hidden">
      {/* Background Subtle Gradient & Pulse */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header bar of the Briefing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-cyan-400 font-semibold uppercase">
                Executive Spoken Briefing
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Illustrative Sample Scenario</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight mt-0.5">
              {briefing.headline}
            </h2>
          </div>
        </div>

        {/* Audio Player & Regeneration Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleVoiceBriefing}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPlayingAudio
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Pause Narration</span>
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-amber-400 animate-pulse" />
                  <span className="w-1 h-4 bg-amber-400 animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-amber-400 animate-pulse delay-150" />
                </span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Narrate Spoken Briefing</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              audioEngine.playPositiveSignal();
              onRefreshBriefing();
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            title="Regenerate Executive Assessment via Gemini 3.8 Flash"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Synthesizing...' : 'Re-Evaluate'}</span>
          </button>
        </div>
      </div>

      {/* The 4 Sovereign Questions Matrix (Answers within 5 seconds) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Question 1: What is happening now? */}
        <div className="bg-[#0b1222]/80 border border-cyan-500/20 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1.5">
              <span>01 // WHAT IS HAPPENING NOW?</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {briefing.coreAnswers.whatIsHappeningNow}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-cyan-300/70">
            Sample state: fictional values, not live data
          </div>
        </div>

        {/* Question 2: Why is it happening? */}
        <div className="bg-[#0b1222]/80 border border-blue-500/20 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 mb-1.5">
              <span>02 // WHY IS IT HAPPENING?</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {briefing.coreAnswers.whyIsItHappening}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-blue-300/70">
            Sample context: no verified source data connected
          </div>
        </div>

        {/* Question 3: What happens next? */}
        <div className="bg-[#0b1222]/80 border border-indigo-500/20 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-indigo-400 mb-1.5">
              <span>03 // WHAT HAPPENS NEXT?</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {briefing.coreAnswers.whatHappensNext}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-indigo-300/70">
            Sample trajectory: not a verified forecast
          </div>
        </div>

        {/* Question 4: What should I do? */}
        <div className="bg-[#141529]/90 border border-amber-500/30 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 mb-1.5">
              <span>04 // WHAT SHOULD I DO?</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <p className="text-xs text-amber-100 font-semibold leading-relaxed">
              {briefing.coreAnswers.whatShouldIDo}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-500/20">
            <button
              onClick={() => handleAction('Execute Sovereign Recommendation')}
              className="w-full py-1 text-[11px] font-semibold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded transition-colors"
            >
              Review sample recommendation only
            </button>
          </div>
        </div>
      </div>

      {/* Key Quantitative Signals Strip */}
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {briefing.keySignals.map((signal, idx) => (
          <div key={idx} className="bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5">
            <div className="text-[11px] text-slate-400">{signal.metric}</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-bold font-mono tabular-nums text-white">
                {signal.delta}
              </span>
              <span className="text-[10px] font-mono text-slate-500 truncate">
                {signal.context}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
