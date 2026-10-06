import React, { useState } from 'react';
import { CanonicalFinding, ComplianceFramework, ComplianceControl } from '../types/security';
import { COMPLIANCE_FRAMEWORKS } from '../data/complianceStandards';
import { 
  ShieldCheck, 
  AlertOctagon, 
  FileText, 
  CheckCircle, 
  Info, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  Download,
  Layers,
  FileCheck
} from 'lucide-react';

interface ComplianceMatrixProps {
  findings: CanonicalFinding[];
  onSelectFinding: (finding: CanonicalFinding) => void;
  onAskAiForControl: (control: ComplianceControl, standardName: string) => void;
}

export const ComplianceMatrix: React.FC<ComplianceMatrixProps> = ({
  findings,
  onSelectFinding,
  onAskAiForControl,
}) => {
  const [activeFrameworkId, setActiveFrameworkId] = useState<string>('iso27001');
  const [selectedControl, setSelectedControl] = useState<ComplianceControl | null>(null);

  const activeFramework =
    COMPLIANCE_FRAMEWORKS.find((f) => f.id === activeFrameworkId) || COMPLIANCE_FRAMEWORKS[0];

  // Dynamic Gap Analysis:
  // Check which findings trigger a gap in each control
  const enrichedControls = activeFramework.controls.map((ctl) => {
    const triggeringFindings = findings.filter(
      (f) =>
        f.status !== 'MITIGATED' &&
        f.status !== 'FALSE_POSITIVE' &&
        ctl.mappedCWEs.some((cwe) => f.cwe.toUpperCase().includes(cwe.toUpperCase()))
    );

    const hasGaps = triggeringFindings.length > 0;
    return {
      ...ctl,
      status: hasGaps ? ('GAP_DETECTED' as const) : ('COMPLIANT' as const),
      affectedFindingIds: triggeringFindings.map((f) => f.id),
      triggeringFindings,
    };
  });

  const gapCount = enrichedControls.filter((c) => c.status === 'GAP_DETECTED').length;
  const compliantCount = enrichedControls.filter((c) => c.status === 'COMPLIANT').length;
  const complianceScore = Math.round((compliantCount / enrichedControls.length) * 100);

  // Active control drill down
  const activeControlData = selectedControl
    ? enrichedControls.find((c) => c.id === selectedControl.id) || selectedControl
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>GOVERNANCE, RISK &amp; COMPLIANCE (GRC)</span>
          <span aria-hidden="true">·</span>
          <span>REGULATORY CONTROL ENGINE</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-1">
          Automated Compliance &amp; Gap Analysis Engine
        </h2>
        <p className="text-xs text-slate-400">
          Continuous gap analysis mapping normalized technical findings to ISO/IEC 27001:2022, ISO/IEC 42001:2023, and the DPDP Act 2023.
        </p>
      </div>

      {/* Framework Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {COMPLIANCE_FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            onClick={() => {
              setActiveFrameworkId(fw.id);
              setSelectedControl(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              activeFrameworkId === fw.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{fw.name}</span>
          </button>
        ))}
      </div>

      {/* Framework Summary & Posture Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              {activeFramework.version} · OFFICIAL STANDARD CATALOG
            </span>
            <h3 className="text-base font-bold text-white">{activeFramework.officialTitle}</h3>
            <p className="text-xs text-slate-400 max-w-2xl">{activeFramework.description}</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400">CONTROL COMPLIANCE</div>
              <div className={`text-2xl font-mono font-bold ${complianceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {complianceScore}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-left font-mono text-xs space-y-0.5">
              <div className="text-emerald-400 font-semibold">{compliantCount} Compliant</div>
              <div className="text-rose-400 font-semibold">{gapCount} Gaps Detected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Grid & Drill-Down View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls List (Left Col) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-semibold text-slate-200">
            Mandatory Controls &amp; Real-Time Audit Status:
          </div>

          <div className="space-y-2">
            {enrichedControls.map((ctl) => {
              const isGap = ctl.status === 'GAP_DETECTED';
              const isSelected = selectedControl?.id === ctl.id;

              return (
                <div
                  key={ctl.id}
                  onClick={() => setSelectedControl(ctl)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-950/40'
                      : isGap
                      ? 'border-rose-950/60 bg-rose-950/10 hover:border-rose-800/80'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          {ctl.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{ctl.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{ctl.description}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      {isGap ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
                          <AlertOctagon className="h-3 w-3" />
                          <span>{ctl.affectedFindingIds.length} GAPS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                          <CheckCircle className="h-3 w-3" />
                          <span>COMPLIANT</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <div>Category: <span className="text-slate-400">{ctl.category}</span></div>
                    <div>Mapped CWEs: <span className="text-cyan-400">{ctl.mappedCWEs.join(', ')}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drill-down / Audit Guidance Drawer (Right Col) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          {activeControlData ? (
            <>
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                    <span>{activeFramework.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeControlData.code}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">{activeControlData.title}</h4>
                </div>
                <button
                  onClick={() => onAskAiForControl(activeControlData, activeFramework.name)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-950 bg-cyan-400 rounded hover:bg-cyan-300 transition-colors shrink-0"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Audit Guide</span>
                </button>
              </div>

              {/* Control Full Text */}
              <div className="text-xs space-y-1.5">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Standard Clause Requirement:
                </span>
                <p className="p-3 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 leading-relaxed text-[11px]">
                  {activeControlData.description}
                </p>
              </div>

              {/* Breaching Findings */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Active Non-Compliant Sinks:
                  </span>
                  <span className="font-mono text-[10px] text-rose-400 font-bold">
                    {(activeControlData as any).triggeringFindings?.length || 0} Breaches
                  </span>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {((activeControlData as any).triggeringFindings || []).length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-center text-emerald-400 text-xs">
                      No active vulnerabilities violating this control standard.
                    </div>
                  ) : (
                    ((activeControlData as any).triggeringFindings || []).map((f: CanonicalFinding) => (
                      <div
                        key={f.id}
                        onClick={() => onSelectFinding(f)}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span className="truncate max-w-[200px]">{f.title}</span>
                          <span className="font-mono text-rose-400 text-[10px]">{f.severity}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                          <span>{f.cwe} · {f.sourceTool}</span>
                          <span className="text-cyan-400 hover:underline flex items-center gap-0.5">
                            Inspect <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400 space-y-3">
              <FileCheck className="h-8 w-8 mx-auto text-slate-600" />
              <p>Select any control on the left to inspect mapped requirements, auditor checklists, and breaching technical sinks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
