import React, { useState } from 'react';
import { CanonicalFinding } from '../types/security';
import { ShieldAlert, AlertTriangle, CheckCircle2, Sliders, ArrowUpRight } from 'lucide-react';

interface RiskHeatmapMatrixProps {
  findings: CanonicalFinding[];
  onSelectFinding: (finding: CanonicalFinding) => void;
}

export const RiskHeatmapMatrix: React.FC<RiskHeatmapMatrixProps> = ({
  findings,
  onSelectFinding,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ impact: number; likelihood: number } | null>(null);

  const likelihoodLabels = [
    { level: 5, label: '5. Almost Certain' },
    { level: 4, label: '4. Likely' },
    { level: 3, label: '3. Possible' },
    { level: 2, label: '2. Unlikely' },
    { level: 1, label: '1. Rare' },
  ];

  const impactLabels = [
    { level: 1, label: '1. Negligible' },
    { level: 2, label: '2. Minor' },
    { level: 3, label: '3. Moderate' },
    { level: 4, label: '4. Major' },
    { level: 5, label: '5. Catastrophic' },
  ];

  // Helper to get findings for cell
  const getCellFindings = (impact: number, likelihood: number) => {
    return findings.filter((f) => f.impact === impact && f.likelihood === likelihood);
  };

  // Color gradient based on risk severity = Impact * Likelihood
  const getCellBg = (impact: number, likelihood: number, count: number, isSelected: boolean) => {
    const score = impact * likelihood;
    let base = '';
    if (score >= 16) {
      base = 'bg-rose-950/70 border-rose-600/70 text-rose-300'; // Critical Red
    } else if (score >= 10) {
      base = 'bg-orange-950/60 border-orange-600/60 text-orange-300'; // High Orange
    } else if (score >= 6) {
      base = 'bg-amber-950/50 border-amber-600/50 text-amber-300'; // Medium Amber
    } else {
      base = 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'; // Low Green
    }

    if (isSelected) {
      return `${base} ring-2 ring-cyan-400 font-bold scale-[1.03] z-10`;
    }
    return count > 0 ? `${base} hover:brightness-125` : 'bg-slate-900/40 border-slate-800 text-slate-600';
  };

  // Active findings for the selected cell
  const cellFindings = selectedCell
    ? getCellFindings(selectedCell.impact, selectedCell.likelihood)
    : [];

  // KPIs
  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const activeCount = findings.filter((f) => f.status === 'ACTIVE').length;
  const mitigatedCount = findings.filter((f) => f.status === 'MITIGATED').length;
  const remediationRate = findings.length > 0 ? Math.round((mitigatedCount / findings.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Header & Risk Metrics */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>ENTERPRISE RISK GOVERNANCE</span>
          <span aria-hidden="true">·</span>
          <span>CVSS 3.1 &amp; BIZ-IMPACT MATRIX</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-1">
          5×5 Dynamic Risk Heatmap
        </h2>
        <p className="text-xs text-slate-400">
          Quantifies technical severity against operational likelihood to prioritize executive remediation workflows.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 space-y-1">
          <div className="text-slate-400 font-medium">Critical Exposure</div>
          <div className="text-2xl font-mono font-bold text-rose-400">{criticalCount}</div>
          <div className="text-[11px] text-slate-400">CVSS $\ge$ 9.0 Sinks</div>
        </div>

        <div className="p-4 rounded-xl border border-orange-900/40 bg-orange-950/20 space-y-1">
          <div className="text-slate-400 font-medium">High Exposure</div>
          <div className="text-2xl font-mono font-bold text-orange-400">{highCount}</div>
          <div className="text-[11px] text-slate-400">CVSS 7.0–8.9 Risks</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400 font-medium">Active Unmitigated</div>
          <div className="text-2xl font-mono font-bold text-cyan-300">{activeCount}</div>
          <div className="text-[11px] text-slate-400">Requires Engineering Fix</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20 space-y-1">
          <div className="text-slate-400 font-medium">Remediation Velocity</div>
          <div className="text-2xl font-mono font-bold text-emerald-400">{remediationRate}%</div>
          <div className="text-[11px] text-slate-400">{mitigatedCount} Resolved Findings</div>
        </div>
      </div>

      {/* 5x5 Matrix Layout */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="font-semibold text-slate-200">
            Interactive Likelihood vs Impact Matrix
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500/80" /> Low (1-5)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-500/80" /> Medium (6-9)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-orange-500/80" /> High (10-15)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-500/80" /> Critical (16-25)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Matrix Grid (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="relative pl-8">
              {/* Y-Axis Label */}
              <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 whitespace-nowrap">
                ▲ Likelihood (Probability)
              </div>

              {/* Rows */}
              <div className="space-y-1.5">
                {likelihoodLabels.map((lh) => (
                  <div key={lh.level} className="flex items-center gap-1.5">
                    <span className="w-24 text-[11px] text-slate-400 truncate text-right font-mono pr-1">
                      {lh.label}
                    </span>

                    {/* 5 Columns for this Likelihood */}
                    <div className="grid grid-cols-5 gap-1.5 flex-1">
                      {impactLabels.map((imp) => {
                        const cellList = getCellFindings(imp.level, lh.level);
                        const count = cellList.length;
                        const isSelected =
                          selectedCell?.impact === imp.level &&
                          selectedCell?.likelihood === lh.level;

                        return (
                          <button
                            key={imp.level}
                            onClick={() => setSelectedCell({ impact: imp.level, likelihood: lh.level })}
                            className={`h-12 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${getCellBg(
                              imp.level,
                              lh.level,
                              count,
                              isSelected
                            )}`}
                          >
                            <span className="font-mono text-sm font-bold tabular-nums">
                              {count > 0 ? count : '·'}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 opacity-70">
                              R={imp.level * lh.level}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-24" />
                <div className="grid grid-cols-5 gap-1.5 flex-1 text-center font-mono text-[10px] text-slate-400">
                  {impactLabels.map((imp) => (
                    <div key={imp.level} className="truncate">
                      {imp.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-2">
                Business &amp; Technical Impact ▶
              </div>
            </div>
          </div>

          {/* Drill-Down Panel (Cols 8-12) */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-white">
                {selectedCell ? (
                  <span>
                    Cell Findings (Impact {selectedCell.impact} · Likelihood {selectedCell.likelihood})
                  </span>
                ) : (
                  <span>Select any cell to inspect findings</span>
                )}
              </div>
              {selectedCell && (
                <span className="font-mono text-[11px] text-cyan-400 font-bold">
                  {cellFindings.length} Items
                </span>
              )}
            </div>

            {selectedCell ? (
              cellFindings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No vulnerabilities in this risk tier.
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {cellFindings.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => onSelectFinding(f)}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white truncate max-w-[200px]">
                          {f.title}
                        </span>
                        <span className="font-mono text-[10px] text-cyan-300">
                          CVSS {f.cvssScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{f.cwe} · {f.sourceTool}</span>
                        <span className="text-amber-400">{f.status}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {f.asset} ➔ {f.sinkOrEndpoint}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <Sliders className="h-8 w-8 mx-auto text-slate-600" />
                <p>Click on any risk cell in the 5×5 matrix to drill into specific correlated findings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
