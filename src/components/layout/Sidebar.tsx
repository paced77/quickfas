import React from 'react';
import {
  LayoutDashboard,
  Swords,
  Sparkles,
  LineChart,
  MapPin,
  Cog,
  FileText,
  Users,
  ShieldCheck,
  X,
  Compass,
  ArrowUpRight,
  Radio,
  ExternalLink,
  Landmark,
  Network,
} from 'lucide-react';

export type KingdomNavTab =
  | 'dashboard'
  | 'gemini-healthcare'
  | 'missions'
  | 'advisor'
  | 'analytics'
  | 'map'
  | 'automations'
  | 'reports'
  | 'council'
  | 'strategy'
  | 'governance'
  | 'nexus';

interface SidebarProps {
  activeTab: KingdomNavTab;
  onSelectTab: (tab: KingdomNavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onToggleLandingView: () => void;
  isLandingView: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onToggleLandingView,
  isLandingView,
}) => {
  const navItems: Array<{
    id: KingdomNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'gemini-healthcare',
      label: 'Gemini Healthcare',
      icon: <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />,
      badge: 'Nov 10',
    },
    {
      id: 'missions',
      label: 'Mission Control',
      icon: <Swords className="w-4 h-4" />,
      badge: '24',
    },
    {
      id: 'advisor',
      label: 'AI Sovereign Advisor',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      badge: 'Live',
    },
    {
      id: 'analytics',
      label: 'Strategic Analytics',
      icon: <LineChart className="w-4 h-4" />,
    },
    {
      id: 'map',
      label: 'Kingdom Map',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'automations',
      label: 'Automations',
      icon: <Cog className="w-4 h-4" />,
      badge: '76%',
    },
    {
      id: 'reports',
      label: 'Intelligence Feed',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'council',
      label: 'AI Council',
      icon: <Users className="w-4 h-4" />,
      badge: '7',
    },
    {
      id: 'strategy',
      label: 'Investor Deck & Master',
      icon: <Landmark className="w-4 h-4 text-emerald-400" />,
      badge: 'Deck',
    },
    {
      id: 'nexus',
      label: 'Quickfas Nexus',
      icon: <Network className="w-4 h-4 text-cyan-300" />,
      badge: 'GitHub',
    },
    {
      id: 'governance',
      label: 'Settings & Governance',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#070b14] border-r border-[#6ee7ff]/15 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Brand Lockup */}
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(110,231,255,0.4)]">
                K
              </div>
              <div>
                <span className="text-xs font-black tracking-widest text-slate-100 uppercase font-mono block">
                  PROJECT KINGDOM
                </span>
                <span className="text-[10px] font-mono text-[#6ee7ff] tracking-wider">
                  UNIFIED PLATFORM
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
              Command Modules
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id && !isLandingView;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#0f172a] text-[#6ee7ff] border border-[#6ee7ff]/30 shadow-[0_0_15px_rgba(110,231,255,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#6ee7ff]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#6ee7ff]/20 text-[#6ee7ff]'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Vital Telemetry & Landing Page Mode */}
        <div className="p-4 border-t border-white/10 bg-[#090e1c] space-y-3">
          {/* Health & Coverage Summary */}
          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Kingdom Health</span>
                <span className="text-emerald-400 font-bold tabular-nums">98%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-1.5 rounded-full w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Automation</span>
                <span className="text-cyan-400 font-bold tabular-nums">76%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-cyan-400 h-1.5 rounded-full w-[76%]" />
              </div>
            </div>
          </div>

          {/* Landing / Marketing View Switcher */}
          <button
            onClick={() => {
              onToggleLandingView();
              onCloseMobile();
            }}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isLandingView
                ? 'glow-btn-primary'
                : 'glow-btn-secondary'
            }`}
          >
            {isLandingView ? (
              <>
                <span>Return to Bridge</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View Landing Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
