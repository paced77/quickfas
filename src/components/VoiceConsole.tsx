import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Square, Sparkles, X, CornerDownLeft, Radio, ArrowRight } from 'lucide-react';
import { audioEngine } from '../services/audioEngine.ts';

interface VoiceConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'war-room' | 'council' | 'digital-twin' | 'telemetry') => void;
  onTriggerBriefing: () => void;
}

const VOICE_COMMAND_EXAMPLES = [
  'Show strategic risks',
  'Open Clinical Command',
  'Explain revenue forecast',
  'Run enrollment simulation',
  'Compare this week to last week',
  'Generate executive briefing',
];

export const VoiceConsole: React.FC<VoiceConsoleProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onTriggerBriefing,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizedIntent, setRecognizedIntent] = useState<string | null>(null);
  const [spokenResponse, setSpokenResponse] = useState<string | null>(
    'Project Kingdom voice engine active. State a command or inquiry.'
  );

  // Setup Web Speech API speech recognition if available
  useEffect(() => {
    if (!isOpen) {
      if (isListening) setIsListening(false);
      audioEngine.stopSpeaking();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const handleExecuteVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsProcessing(true);
    audioEngine.playPositiveSignal();

    try {
      const res = await fetch('/api/gemini/voice-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      if (!res.ok) throw new Error('Failed to process voice query');
      const data = await res.json();

      setRecognizedIntent(data.recognizedIntent);
      setSpokenResponse(data.spokenResponse);

      // Perform navigation or action based on recognized intent
      if (data.recognizedIntent === 'view_risks' || data.recognizedIntent === 'explain_finance') {
        onNavigateTab('war-room');
      } else if (data.recognizedIntent === 'view_clinical') {
        onNavigateTab('war-room');
      } else if (data.recognizedIntent === 'run_simulation') {
        onNavigateTab('digital-twin');
      } else if (data.recognizedIntent === 'generate_briefing') {
        onTriggerBriefing();
      }

      // Speak response aloud
      setIsSpeaking(true);
      audioEngine.speak(data.spokenResponse, () => {
        setIsSpeaking(false);
        audioEngine.playCompletionSignal();
      });
    } catch (err) {
      console.error('Voice query error:', err);
      audioEngine.playWarningSignal();
      setSpokenResponse('Unable to process voice directive. Please retry.');
    } finally {
      setIsProcessing(false);
      setQuery('');
    }
  };

  const handleStartListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: prompt user to use quick command buttons
      handleExecuteVoiceQuery(VOICE_COMMAND_EXAMPLES[0]);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        audioEngine.playPositiveSignal();
      };

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setIsListening(false);
        handleExecuteVoiceQuery(speechResult);
      };

      recognition.onerror = () => {
        setIsListening(false);
        audioEngine.playWarningSignal();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleStopSpeaking = () => {
    audioEngine.stopSpeaking();
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-xl rounded-2xl p-6 relative overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Sovereign Voice Command Console
            </h3>
            <p className="text-xs text-slate-400">
              2027+ Conversational Operating System · Narrated Insights & Audio Directives
            </p>
          </div>
        </div>

        {/* Dynamic Voice Waveform & Microphone Visualizer */}
        <div className="bg-[#050811] rounded-xl p-6 border border-white/10 text-center mb-5 relative flex flex-col items-center justify-center">
          <div className="relative mb-3">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
            )}
            <button
              onClick={handleStartListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse'
                  : 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }`}
            >
              <Mic className="w-7 h-7" />
            </button>
          </div>

          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            {isListening
              ? 'Listening for Sovereign Directive...'
              : isProcessing
              ? 'Evaluating Query via Gemini 3.8 Flash...'
              : 'Tap to Speak or Select Below'}
          </span>

          {/* Spoken Response Box */}
          {spokenResponse && (
            <div className="mt-4 p-3.5 bg-white/[0.03] border border-white/5 rounded-lg text-left w-full">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>SOVEREIGN AUDIO RESPONSE</span>
                {isSpeaking && (
                  <button
                    onClick={handleStopSpeaking}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Mute</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                "{spokenResponse}"
              </p>
            </div>
          )}
        </div>

        {/* Text Input Option */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteVoiceQuery(query);
          }}
          className="flex gap-2 mb-5"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type executive command or inquiry (e.g. 'Show strategic risks')..."
            className="w-full bg-[#050811] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={!query.trim() || isProcessing}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
          >
            <span>Send</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Voice Command Chips */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            Standard Voice Directives:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {VOICE_COMMAND_EXAMPLES.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteVoiceQuery(cmd)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-950/30 transition-all text-left flex items-center gap-1.5"
              >
                <span>"{cmd}"</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
