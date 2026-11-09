import React, { useState } from 'react';
import { Activity, TrendingUp, PieChart as PieIcon, ArrowUpRight } from 'lucide-react';
import { audioEngine } from '../../services/audioEngine.ts';

export const ChartsSection: React.FC = () => {
  const [activeHealthIndex, setActiveHealthIndex] = useState<number | null>(4);
  const [activeForecastIndex, setActiveForecastIndex] = useState<number | null>(4);

  // Real-time edge health telemetry scores across rural nodes
  const healthData = [
    { day: 'Mon', score: 92, events: '14,200 events buffered in SQLite WAL' },
    { day: 'Tue', score: 95, events: 'Sub-90ms ingestion confirmed' },
    { day: 'Wed', score: 96, events: 'Soul Auditor invariant pass 100%' },
    { day: 'Thu', score: 98, events: 'Pocket 16 Edge OS appliances online' },
    { day: 'Fri', score: 99.4, events: 'Zero data loss during satellite sync' },
  ];

  // Predictive velocity trajectory: ARR & Cohort Growth
  const forecastData = [
    { month: 'Jan', value: 72, label: '$9.8M ARR' },
    { month: 'Feb', value: 78, label: '$11.2M ARR' },
    { month: 'Mar', value: 84, label: '$12.6M ARR' },
    { month: 'Apr', value: 91, label: '$13.8M ARR' },
    { month: 'May', value: 95, label: '$14.2M ARR (+48.2% YoY)' },
  ];

  // Capital & resource allocation across Stratum & Seventeen Pockets
  const resourcesData = [
    { name: 'Pocket 16 Edge OS Hardware', pct: 35, color: '#22d3ee', spend: '$850k edge node budget' },
    { name: 'Plain-Language Literacy Curriculum', pct: 25, color: '#818cf8', spend: '684 active patients' },
    { name: 'Zero-Trust Mesh & Compute', pct: 20, color: '#6ee7ff', spend: 'AES-256 HSM Cryptography' },
    { name: 'Soul Auditor Audit Engine', pct: 20, color: '#10b981', spend: '100% Invariant Ratification' },
  ];

  // Area Chart Dimensions
  const chartW = 380;
  const chartH = 140;
  const paddingX = 30;
  const paddingY = 20;

  // Build SVG Points for Health Area Chart
  const minScore = 70;
  const maxScore = 100;
  const healthPoints = healthData.map((d, i) => {
    const x = paddingX + (i / (healthData.length - 1)) * (chartW - paddingX * 2);
    const y = chartH - paddingY - ((d.score - minScore) / (maxScore - minScore)) * (chartH - paddingY * 2);
    return { x, y, ...d };
  });

  const healthPathD = healthPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const healthAreaD = `${healthPathD} L ${healthPoints[healthPoints.length - 1].x} ${chartH - paddingY} L ${healthPoints[0].x} ${chartH - paddingY} Z`;

  // Build SVG Points for Forecast Line Chart
  const minForecast = 60;
  const maxForecast = 100;
  const forecastPoints = forecastData.map((d, i) => {
    const x = paddingX + (i / (forecastData.length - 1)) * (chartW - paddingX * 2);
    const y = chartH - paddingY - ((d.value - minForecast) / (maxForecast - minForecast)) * (chartH - paddingY * 2);
    return { x, y, ...d };
  });

  const forecastPathD = forecastPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* 1. Kingdom Health Area Chart */}
      <div className="glass-panel rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Decentralized Edge Health
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-extrabold tabular-nums">
              Peak: 99.4% Nominal
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-2">
            Area Chart // 5-day aggregate telemetry across all 16 rural edge appliances.
          </p>

          {/* SVG Area Chart */}
          <div className="relative w-full aspect-[2.6/1] bg-[#050811]/70 rounded-lg p-2 border border-white/5 overflow-hidden flex items-center justify-center">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={chartH - paddingY} x2={chartW - paddingX} y2={chartH - paddingY} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1={paddingX} y1={paddingY} x2={chartW - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Area */}
              <path d={healthAreaD} fill="url(#healthGrad)" />

              {/* Line */}
              <path d={healthPathD} fill="none" stroke="#10b981" strokeWidth="2.5" />

              {/* Data Blips */}
              {healthPoints.map((p, i) => (
                <g key={i} className="cursor-pointer" onClick={() => {
                  audioEngine.playPositiveSignal();
                  setActiveHealthIndex(i);
                }}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activeHealthIndex === i ? 5 : 3.5}
                    fill={activeHealthIndex === i ? '#6ee7ff' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={p.x}
                    y={chartH - 4}
                    textAnchor="middle"
                    fill="rgba(148, 163, 184, 0.9)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {p.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Dynamic Point Inspection */}
        {activeHealthIndex !== null && (
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              {healthData[activeHealthIndex].day}: <span className="text-emerald-400 font-bold">{healthData[activeHealthIndex].score}%</span>
            </span>
            <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
              {healthData[activeHealthIndex].events}
            </span>
          </div>
        )}
      </div>

      {/* 2. Illustrative Trend Example Line Chart */}
      <div className="glass-panel rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Predictive ARR &amp; Velocity
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-extrabold tabular-nums">
              $14.2M (+48.2%)
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-2">
            Line Chart // Monthly annualized run-rate &amp; cohort velocity (Jan–May trajectory).
          </p>

          {/* SVG Line Chart */}
          <div className="relative w-full aspect-[2.6/1] bg-[#050811]/70 rounded-lg p-2 border border-white/5 overflow-hidden flex items-center justify-center">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="forecastLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={chartH - paddingY} x2={chartW - paddingX} y2={chartH - paddingY} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1={paddingX} y1={paddingY} x2={chartW - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Line */}
              <path d={forecastPathD} fill="none" stroke="url(#forecastLineGrad)" strokeWidth="2.5" />

              {/* Points */}
              {forecastPoints.map((p, i) => (
                <g key={i} className="cursor-pointer" onClick={() => {
                  audioEngine.playPositiveSignal();
                  setActiveForecastIndex(i);
                }}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activeForecastIndex === i ? 5 : 3.5}
                    fill={activeForecastIndex === i ? '#ffffff' : '#22d3ee'}
                    stroke="#818cf8"
                    strokeWidth="1.5"
                  />
                  <text
                    x={p.x}
                    y={chartH - 4}
                    textAnchor="middle"
                    fill="rgba(148, 163, 184, 0.9)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Dynamic Point Inspection */}
        {activeForecastIndex !== null && (
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              {forecastData[activeForecastIndex].month}: <span className="text-cyan-300 font-bold">{forecastData[activeForecastIndex].value}%</span>
            </span>
            <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
              {forecastData[activeForecastIndex].label}
            </span>
          </div>
        )}
      </div>

      {/* 3. Resource Allocation Segmented Matrix */}
      <div className="glass-panel rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Resource Allocation
              </span>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold tabular-nums">
              $4.0M/mo Total
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Portfolio Distribution // Capital & compute weighting across four domains.
          </p>

          {/* Segmented Stacked Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-900 mb-4 border border-white/10">
            {resourcesData.map((res, idx) => (
              <div
                key={idx}
                style={{ width: `${res.pct}%`, backgroundColor: res.color }}
                title={`${res.name}: ${res.pct}%`}
                className="h-full transition-all hover:opacity-90 cursor-pointer"
              />
            ))}
          </div>

          {/* Breakdown Legend List */}
          <div className="space-y-2 text-xs">
            {resourcesData.map((res, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: res.color }} />
                  <span className="text-slate-300 font-medium">{res.name}</span>
                </div>
                <div className="font-mono text-slate-200">
                  <span className="font-bold tabular-nums">{res.pct}%</span>
                  <span className="text-slate-500 text-[10px] ml-1.5">({res.spend})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] font-mono text-slate-500 text-right">
          Illustrative resource mix; not a budget report
        </div>
      </div>
    </div>
  );
};
