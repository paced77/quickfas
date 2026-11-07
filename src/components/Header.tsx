import React from 'react';
import { Mic, Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'war-room' | 'council' | 'digital-twin' | 'telemetry';
  onSelectTab: (tab: 'war-room' | 'council' | 'digital-twin' | 'telemetry') => void;
  onOpenVoiceConsole: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isAmbientActive: boolean;
  onToggleAmbient: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenVoiceConsole,
  isMuted,
  onToggleMute,
  isAmbientActive,
  onToggleAmbient,
}) => {
  return (
    <header className="border-b border-white/10 bg-[#080d1a]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Universal Frontend Constitution 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (Single-line wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          <span className="text-sm font-extrabold tracking-widest text-slate-100 whitespace-nowrap">
            PROJECT KINGDOM
          </span>
          <span className="text-[11px] font-mono tracking-wider text-cyan-400/80 px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-950/30 whitespace-nowrap hidden sm:inline">
            2027+ SOVEREIGN OS
          </span>
        </div>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-4 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('war-room')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'war-room'
                ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            War Room
          </button>
          <button
            onClick={() => onSelectTab('council')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'council'
                ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Council
          </button>
          <button
            onClick={() => onSelectTab('digital-twin')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'digital-twin'
                ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital Twin
          </button>
          <button
            onClick={() => onSelectTab('telemetry')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'telemetry'
                ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry Fabric
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Audio Suite */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleAmbient}
            title={isAmbientActive ? 'Ambient Telemetry Pulse: Active (55Hz)' : 'Enable Ambient Telemetry Pulse'}
            className={`p-1.5 rounded text-xs transition-colors border ${
              isAmbientActive
                ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Acoustics Muted' : 'Acoustics Active'}
            className={`p-1.5 rounded text-xs transition-colors border ${
              isMuted
                ? 'border-amber-500/40 text-amber-400 bg-amber-950/30'
                : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onOpenVoiceConsole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] whitespace-nowrap shrink-0"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Console</span>
          </button>
        </div>
      </div>

      {/* Sovereign Live Telemetry Strip */}
      <div className="border-t border-white/5 bg-[#050811]/90 px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-medium">HEALTH: <span className="text-emerald-400 tabular-nums">98.4%</span></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300 font-medium">AGENTS: <span className="text-cyan-400 tabular-nums">34</span> ACTIVE</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300 font-medium">RISKS: <span className="text-amber-400 tabular-nums">2</span> MONITORED</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300 font-medium">OPPORTUNITIES: <span className="text-indigo-300 tabular-nums">11</span></span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-500">
          <span>LATENCY: <span className="text-slate-300 tabular-nums">83ms</span></span>
          <span>INGESTION: <span className="text-slate-300 tabular-nums">142.8 tx/s</span></span>
          <span>STATE: <span className="text-emerald-400">AUTONOMOUS DISPATCH</span></span>
        </div>
      </div>
    </header>
  );
};
