import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { GENERATE_30_DAY_TRENDS, DailyTrendPoint } from '../data/trendData';
import { 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Layers, 
  BarChart3, 
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[200px]">
        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-slate-500">Day Metrics</span>
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
            <span style={{ color: entry.color }} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const HistoricalTrendChart: React.FC = () => {
  const [data] = useState<DailyTrendPoint[]>(GENERATE_30_DAY_TRENDS());
  const [chartView, setChartView] = useState<'velocity' | 'burndown'>('velocity');

  // Aggregated 30-day stats
  const totalNew = data.reduce((acc, curr) => acc + curr.newVulnerabilities, 0);
  const totalResolved = data.reduce((acc, curr) => acc + curr.resolvedVulnerabilities, 0);
  const netDelta = totalNew - totalResolved;
  const avgMttr = (data.reduce((acc, curr) => acc + curr.mttrDays, 0) / data.length).toFixed(1);
  const velocityRatio = (totalResolved / Math.max(1, totalNew)).toFixed(2);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-sm">
      {/* Top Header & Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>HISTORICAL SCAN INGESTION VELOCITY</span>
            <span aria-hidden="true">·</span>
            <span>REMEDIATION BURN-DOWN (30 DAYS)</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">
            Vulnerability Trend &amp; Remediation Velocity
          </h3>
          <p className="text-xs text-slate-400">
            Tracking automated scanner discovery rates vs engineering sprint resolution over the past 30 days.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setChartView('velocity')}
            className={`px-3 py-1.5 rounded transition-colors font-medium ${
              chartView === 'velocity'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New vs. Resolved Velocity
          </button>
          <button
            onClick={() => setChartView('burndown')}
            className={`px-3 py-1.5 rounded transition-colors font-medium ${
              chartView === 'burndown'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cumulative Backlog Curve
          </button>
        </div>
      </div>

      {/* 4 Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400">30-Day New Discovered</div>
          <div className="text-xl font-mono font-bold text-rose-400 tabular-nums">
            +{totalNew}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">SAST, DAST &amp; Network Scans</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400">30-Day Mitigated</div>
          <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
            {totalResolved}
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            <span>Remediation verified</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400">Resolution Velocity Ratio</div>
          <div className="text-xl font-mono font-bold text-cyan-300 tabular-nums">
            {velocityRatio}x
          </div>
          <div className="text-[10px] text-cyan-400/80 font-mono">
            {parseFloat(velocityRatio) >= 1.0 ? 'Resolving faster than intake' : 'Backlog increasing'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400">Mean Time To Remediate (MTTR)</div>
          <div className="text-xl font-mono font-bold text-white tabular-nums flex items-baseline gap-1">
            <span>{avgMttr}</span>
            <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Within 7-day High SLA</div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'velocity' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Area
                type="monotone"
                dataKey="newVulnerabilities"
                name="New Vulnerabilities"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNew)"
              />
              <Area
                type="monotone"
                dataKey="resolvedVulnerabilities"
                name="Resolved / Mitigated"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorResolved)"
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeOpen"
                name="Cumulative Open Backlog"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#22d3ee' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Explanatory Caption for New Joiners */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
          <span>
            <b>Understanding This Trend:</b> Ingestion spikes correlate with automated CI/CD Semgrep scans and Kali Linux perimeter audits; resolution waves reflect weekly sprint remediation cycles.
          </span>
        </div>
        <span className="font-mono text-cyan-300 shrink-0">Net Backlog: {netDelta > 0 ? `+${netDelta}` : netDelta} Findings</span>
      </div>
    </div>
  );
};
