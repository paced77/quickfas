import React from 'react';
import { Mic, Volume2, VolumeX, Radio, Menu, ShieldAlert, Sparkles, ArrowUpRight } from 'lucide-react';
import { KingdomNavTab } from './layout/Sidebar.tsx';

interface HeaderProps {
  activeTab: KingdomNavTab;
  onSelectTab: (tab: KingdomNavTab) => void;
  onOpenVoiceConsole: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isAmbientActive: boolean;
  onToggleAmbient: () => void;
  onToggleMobileMenu: () => void;
  onToggleLandingView: () => void;
  isLandingView: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenVoiceConsole,
  isMuted,
  onToggleMute,
  isAmbientActive,
  onToggleAmbient,
  onToggleMobileMenu,
  onToggleLandingView,
  isLandingView,
}) => {
  return (
    <header className="border-b border-[#6ee7ff]/15 bg-[#070b14]/95 backdrop-blur-md sticky top-0 z-40">
      {/* 3-Zone Top Command Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Title with Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
            title="Open Command Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-2.5 h-2.5 rounded-sm bg-[#6ee7ff] shadow-[0_0_12px_rgba(110,231,255,0.8)]" />
          <span className="text-sm font-extrabold tracking-wider text-slate-100 whitespace-nowrap font-mono">
            PROJECT KINGDOM
          </span>
          <span className="text-[11px] font-mono tracking-wider text-[#6ee7ff] px-2 py-0.5 rounded border border-[#6ee7ff]/30 bg-[#0f172a] whitespace-nowrap hidden sm:inline">
            IMPERIAL CYBER COMMAND
          </span>
        </div>

        {/* Zone 2: Fast Navigation Quick Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard' && !isLandingView
                ? 'text-[#6ee7ff] bg-[#0f172a] border border-[#6ee7ff]/40 shadow-[0_0_12px_rgba(110,231,255,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('missions')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'missions' && !isLandingView
                ? 'text-[#6ee7ff] bg-[#0f172a] border border-[#6ee7ff]/40 shadow-[0_0_12px_rgba(110,231,255,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mission Control
          </button>
          <button
            onClick={() => onSelectTab('advisor')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'advisor' && !isLandingView
                ? 'text-[#6ee7ff] bg-[#0f172a] border border-[#6ee7ff]/40 shadow-[0_0_12px_rgba(110,231,255,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Advisor
          </button>
          <button
            onClick={() => onSelectTab('map')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'map' && !isLandingView
                ? 'text-[#6ee7ff] bg-[#0f172a] border border-[#6ee7ff]/40 shadow-[0_0_12px_rgba(110,231,255,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kingdom Map
          </button>
        </nav>

        {/* Zone 3: Audio Suite & Voice Console Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleAmbient}
            title={isAmbientActive ? 'Ambient Telemetry Pulse: Active (55Hz)' : 'Enable Ambient Telemetry Pulse'}
            className={`p-1.5 rounded text-xs transition-colors border ${
              isAmbientActive
                ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300 shadow-[0_0_8px_rgba(110,231,255,0.3)]'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-950 glow-btn-primary whitespace-nowrap shrink-0"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Console</span>
          </button>
        </div>
      </div>

      {/* Key Dashboard Metrics Bar (Exact Metrics from Specification) */}
      <div className="border-t border-white/5 bg-[#050811]/95 px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-medium">
            HEALTH: <span className="text-emerald-400 font-bold tabular-nums">98%</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300 font-medium">
            MISSIONS: <span className="text-cyan-300 font-bold tabular-nums">24</span> ACTIVE
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300 font-medium">
            READINESS: <span className="text-[#6ee7ff] font-bold tabular-nums">87%</span>
          </span>
          <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            ALERTS: <span className="text-amber-400 font-bold tabular-nums">5</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-slate-400">
          <span>RISK: <span className="text-emerald-400 font-bold">LOW</span></span>
          <span>AUTOMATION: <span className="text-cyan-400 font-bold tabular-nums">76%</span></span>
          <span>STATE: <span className="text-emerald-400 font-bold">SOVEREIGN READY</span></span>
        </div>
      </div>
    </header>
  );
};
