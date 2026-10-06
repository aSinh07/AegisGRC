import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  HelpCircle, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Calculator, 
  Clock, 
  Flame, 
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';

export interface CVSSVectorState {
  av: 'N' | 'A' | 'L' | 'P';
  ac: 'L' | 'H';
  pr: 'N' | 'L' | 'H';
  ui: 'N' | 'R';
  scope: 'U' | 'C';
  c: 'H' | 'L' | 'N';
  i: 'H' | 'L' | 'N';
  a: 'H' | 'L' | 'N';
}

const DEFAULT_VECTOR: CVSSVectorState = {
  av: 'N',
  ac: 'L',
  pr: 'N',
  ui: 'N',
  scope: 'U',
  c: 'H',
  i: 'H',
  a: 'H',
};

export const CVSSCalculatorExplainer: React.FC<{
  initialVector?: Partial<CVSSVectorState>;
  onApplyScore?: (score: number, vectorString: string, severity: string) => void;
}> = ({ initialVector, onApplyScore }) => {
  const [vector, setVector] = useState<CVSSVectorState>({
    ...DEFAULT_VECTOR,
    ...initialVector,
  });
  const [copiedVector, setCopiedVector] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'ranges' | 'beginner_guide'>('calculator');

  // CVSS v3.1 Metric Numerical Constants
  const AV_WEIGHTS = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
  const AC_WEIGHTS = { L: 0.77, H: 0.44 };
  const PR_WEIGHTS_U = { N: 0.85, L: 0.62, H: 0.27 };
  const PR_WEIGHTS_C = { N: 0.85, L: 0.68, H: 0.5 };
  const UI_WEIGHTS = { N: 0.85, R: 0.62 };
  const IMPACT_WEIGHTS = { H: 0.56, L: 0.22, N: 0.0 };

  // Calculate Base Score based on FIRST CVSS v3.1 Specification
  const { score, severity, vectorString, exploitabilityScore, impactSubScore } = useMemo(() => {
    const prWeight = vector.scope === 'U' ? PR_WEIGHTS_U[vector.pr] : PR_WEIGHTS_C[vector.pr];
    const exploitability = 8.22 * AV_WEIGHTS[vector.av] * AC_WEIGHTS[vector.ac] * prWeight * UI_WEIGHTS[vector.ui];

    const iss = 1 - (1 - IMPACT_WEIGHTS[vector.c]) * (1 - IMPACT_WEIGHTS[vector.i]) * (1 - IMPACT_WEIGHTS[vector.a]);
    let impact = 0;
    if (vector.scope === 'U') {
      impact = 6.42 * iss;
    } else {
      impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    }

    let calculatedScore = 0;
    if (impact <= 0) {
      calculatedScore = 0;
    } else if (vector.scope === 'U') {
      calculatedScore = Math.min(impact + exploitability, 10);
    } else {
      calculatedScore = Math.min(1.08 * (impact + exploitability), 10);
    }

    // FIRST Rounding function (round up to 1 decimal place)
    const roundedScore = Math.ceil(calculatedScore * 10) / 10;
    const finalScore = Number(roundedScore.toFixed(1));

    let sev = 'NONE';
    if (finalScore >= 9.0) sev = 'CRITICAL';
    else if (finalScore >= 7.0) sev = 'HIGH';
    else if (finalScore >= 4.0) sev = 'MEDIUM';
    else if (finalScore >= 0.1) sev = 'LOW';

    const vStr = `CVSS:3.1/AV:${vector.av}/AC:${vector.ac}/PR:${vector.pr}/UI:${vector.ui}/S:${vector.scope}/C:${vector.c}/I:${vector.i}/A:${vector.a}`;

    return {
      score: finalScore,
      severity: sev,
      vectorString: vStr,
      exploitabilityScore: Number(exploitability.toFixed(2)),
      impactSubScore: Number(impact.toFixed(2)),
    };
  }, [vector]);

  const copyVector = () => {
    navigator.clipboard.writeText(vectorString);
    setCopiedVector(true);
    setTimeout(() => setCopiedVector(false), 2000);
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-600 shadow-rose-950/50 shadow-md';
      case 'HIGH':
        return 'bg-orange-950 text-orange-300 border-orange-600 shadow-orange-950/50 shadow-md';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-300 border-amber-600';
      case 'LOW':
        return 'bg-blue-950 text-blue-300 border-blue-600';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const PRESETS = [
    {
      name: 'SQL Injection (CWE-89)',
      score: 9.8,
      vector: { av: 'N', ac: 'L', pr: 'N', ui: 'N', scope: 'U', c: 'H', i: 'H', a: 'H' } as CVSSVectorState,
    },
    {
      name: 'Blind SSRF (CWE-918)',
      score: 8.6,
      vector: { av: 'N', ac: 'L', pr: 'L', ui: 'N', scope: 'C', c: 'H', i: 'N', a: 'N' } as CVSSVectorState,
    },
    {
      name: 'Stored XSS (CWE-79)',
      score: 8.2,
      vector: { av: 'N', ac: 'L', pr: 'N', ui: 'R', scope: 'C', c: 'H', i: 'L', a: 'N' } as CVSSVectorState,
    },
    {
      name: 'Hardcoded Secret (CWE-798)',
      score: 9.1,
      vector: { av: 'N', ac: 'L', pr: 'N', ui: 'N', scope: 'U', c: 'H', i: 'H', a: 'N' } as CVSSVectorState,
    },
    {
      name: 'Weak TLS 1.0 (CWE-319)',
      score: 5.3,
      vector: { av: 'N', ac: 'H', pr: 'N', ui: 'N', scope: 'U', c: 'H', i: 'N', a: 'N' } as CVSSVectorState,
    },
    {
      name: 'Log4j RCE (CVE-2021-44228)',
      score: 10.0,
      vector: { av: 'N', ac: 'L', pr: 'N', ui: 'N', scope: 'C', c: 'H', i: 'H', a: 'H' } as CVSSVectorState,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              CVSS 3.1 / 4.0 Interactive Vulnerability Scoring &amp; SLA Breakdown
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              FIRST.org Standard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Common Vulnerability Scoring System: Exploitability vs Impact metrics, critical range definitions, and mandatory enterprise remediation SLAs.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'calculator'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vector Calculator
          </button>
          <button
            onClick={() => setActiveTab('ranges')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'ranges'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Severity Ranges &amp; SLAs
          </button>
          <button
            onClick={() => setActiveTab('beginner_guide')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'beginner_guide'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Beginner's Plain Guide
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Vector Calculator */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">
              Load Preset:
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setVector(p.vector)}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition-colors whitespace-nowrap text-[11px] font-mono"
              >
                {p.name} ({p.score})
              </button>
            ))}
          </div>

          {/* Live Score Display Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`h-20 w-20 rounded-2xl flex flex-col items-center justify-center border-2 ${getSeverityBadgeClass(severity)}`}>
                <span className="text-2xl font-black tabular-nums">{score.toFixed(1)}</span>
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold">/ 10.0</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-black border ${getSeverityBadgeClass(severity)}`}>
                    {severity} SEVERITY
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Exploitability: <b className="text-cyan-300">{exploitabilityScore}</b> | Impact: <b className="text-rose-300">{impactSubScore}</b>
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  {severity === 'CRITICAL' && 'Immediate executive action required: Active remote compromise with critical business impact.'}
                  {severity === 'HIGH' && 'Urgent vulnerability: High privilege access or severe data disclosure likely.'}
                  {severity === 'MEDIUM' && 'Moderate risk: Constrained exploitation or limited confidentiality/integrity loss.'}
                  {severity === 'LOW' && 'Low risk: Requires significant local access or negligible operational impact.'}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Mandatory Enterprise SLA:{' '}
                    <b className="underline">
                      {severity === 'CRITICAL' ? '24 - 48 Hours' : severity === 'HIGH' ? '7 - 14 Days' : severity === 'MEDIUM' ? '30 Days' : '90 Days'}
                    </b>
                  </span>
                </div>
              </div>
            </div>

            {/* Vector String Copy Bar */}
            <div className="w-full md:w-auto flex flex-col items-end gap-2">
              <div className="w-full md:w-80 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 break-all select-all">
                {vectorString}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyVector}
                  className="px-3 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copiedVector ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                  <span>{copiedVector ? 'Copied Vector' : 'Copy Vector String'}</span>
                </button>
                {onApplyScore && (
                  <button
                    onClick={() => onApplyScore(score, vectorString, severity)}
                    className="px-3 py-1 text-xs rounded-md bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-colors shadow-sm"
                  >
                    Apply to Finding
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metric Selector Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Exploitability Metrics */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  1. Exploitability Metrics (How easy is it to attack?)
                </span>
                <span className="text-[10px] font-mono text-cyan-400">{exploitabilityScore} / 3.89</span>
              </div>

              {/* Attack Vector (AV) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Attack Vector (AV)</span>
                  <span className="text-slate-400 text-[10px]">Where can the adversary strike from?</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                  {[
                    { id: 'N', label: 'Network (N)', desc: 'Remotely across Internet' },
                    { id: 'A', label: 'Adjacent (A)', desc: 'Local subnet / WiFi' },
                    { id: 'L', label: 'Local (L)', desc: 'Shell login required' },
                    { id: 'P', label: 'Physical (P)', desc: 'Hardware physical touch' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVector((prev) => ({ ...prev, av: opt.id as any }))}
                      className={`p-2 rounded border text-left transition-colors ${
                        vector.av === opt.id
                          ? 'border-cyan-400 bg-cyan-950 text-cyan-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                      title={opt.desc}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[8px] text-slate-500 line-clamp-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attack Complexity (AC) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Attack Complexity (AC)</span>
                  <span className="text-slate-400 text-[10px]">Specialized conditions needed?</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  {[
                    { id: 'L', label: 'Low (L)', desc: 'Repeatable, zero bypass preconditions needed' },
                    { id: 'H', label: 'High (H)', desc: 'Race conditions, timing attacks, ASLR bypass' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVector((prev) => ({ ...prev, ac: opt.id as any }))}
                      className={`p-2 rounded border text-left transition-colors ${
                        vector.ac === opt.id
                          ? 'border-cyan-400 bg-cyan-950 text-cyan-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[8px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privileges Required (PR) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Privileges Required (PR)</span>
                  <span className="text-slate-400 text-[10px]">What credentials does attacker need?</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  {[
                    { id: 'N', label: 'None (N)', desc: 'Anonymous / Unauthenticated' },
                    { id: 'L', label: 'Low (L)', desc: 'Standard user account' },
                    { id: 'H', label: 'High (H)', desc: 'Admin / Root privileges' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVector((prev) => ({ ...prev, pr: opt.id as any }))}
                      className={`p-2 rounded border text-left transition-colors ${
                        vector.pr === opt.id
                          ? 'border-cyan-400 bg-cyan-950 text-cyan-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[8px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Interaction (UI) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">User Interaction (UI)</span>
                  <span className="text-slate-400 text-[10px]">Does victim need to click/open?</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  {[
                    { id: 'N', label: 'None (N)', desc: 'Zero-click, exploits automatically' },
                    { id: 'R', label: 'Required (R)', desc: 'Victim must click link, open file, accept prompt' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVector((prev) => ({ ...prev, ui: opt.id as any }))}
                      className={`p-2 rounded border text-left transition-colors ${
                        vector.ui === opt.id
                          ? 'border-cyan-400 bg-cyan-950 text-cyan-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[8px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scope & Impact Metrics */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  2. Impact &amp; Scope Metrics (What gets destroyed or leaked?)
                </span>
                <span className="text-[10px] font-mono text-rose-400">{impactSubScore} / 6.0</span>
              </div>

              {/* Scope (S) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Scope (S)</span>
                  <span className="text-slate-400 text-[10px]">Can attacker escape security sandbox?</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  {[
                    { id: 'U', label: 'Unchanged (U)', desc: 'Damage limited strictly to vulnerable service' },
                    { id: 'C', label: 'Changed (C)', desc: 'Escapes to cloud metadata, OS host, or browser DOM' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVector((prev) => ({ ...prev, scope: opt.id as any }))}
                      className={`p-2 rounded border text-left transition-colors ${
                        vector.scope === opt.id
                          ? 'border-cyan-400 bg-cyan-950 text-cyan-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[8px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidentiality Impact (C) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Confidentiality Impact (C)</span>
                  <span className="text-slate-400 text-[10px]">Data exposure / leaks</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  {[
                    { id: 'N', label: 'None (N)', desc: 'No data leaked' },
                    { id: 'L', label: 'Low (L)', desc: 'Non-sensitive data or partial disclosure' },
                    { id: 'H', label: 'High (H)', desc: 'Total database dump, passwords, PII exfiltration' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVector((prev) => ({ ...prev, c: opt.id as any }))}
                      className={`p-2 rounded border text-left transition-colors ${
                        vector.c === opt.id
                          ? 'border-rose-400 bg-rose-950/60 text-rose-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[8px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Integrity Impact (I) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Integrity Impact (I)</span>
                  <span className="text-slate-400 text-[10px]">Data tampering / code injection</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  {[
                    { id: 'N', label: 'None (N)', desc: 'No modification possible' },
                    { id: 'L', label: 'Low (L)', desc: 'Minor modifications without control' },
                    { id: 'H', label: 'High (H)', desc: 'Total file overwrite, arbitrary SQL execution' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVector((prev) => ({ ...prev, i: opt.id as any }))}
                      className={`p-2 rounded border text-left transition-colors ${
                        vector.i === opt.id
                          ? 'border-rose-400 bg-rose-950/60 text-rose-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[8px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Impact (A) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Availability Impact (A)</span>
                  <span className="text-slate-400 text-[10px]">Service uptime / crash / DoS</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  {[
                    { id: 'N', label: 'None (N)', desc: 'Uptime completely unaffected' },
                    { id: 'L', label: 'Low (L)', desc: 'Performance degradation or temporary restart' },
                    { id: 'H', label: 'High (H)', desc: 'Complete server crash, persistent DoS' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setVector((prev) => ({ ...prev, a: opt.id as any }))}
                      className={`p-2 rounded border text-left transition-colors ${
                        vector.a === opt.id
                          ? 'border-rose-400 bg-rose-950/60 text-rose-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[8px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Severity Ranges & Mandatory SLAs */}
      {activeTab === 'ranges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Critical */}
            <div className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-600 font-mono font-bold text-xs">
                  CRITICAL (9.0 - 10.0)
                </span>
                <Flame className="h-4 w-4 text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Mandatory Remediation SLA:
                </span>
                <span className="text-base font-black text-rose-300">24 to 48 Hours</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Requires mandatory emergency CISO escalation, immediate hotfix deployment, or perimeter WAF rule activation within 24 hours. Daily audit reporting until remediated.
              </p>
              <div className="pt-2 border-t border-rose-900/50 text-[11px] font-mono text-rose-400">
                Examples: Remote Code Execution, Pre-Auth SQLi, Cloud Metadata SSRF.
              </div>
            </div>

            {/* High */}
            <div className="p-4 rounded-xl border border-orange-800/80 bg-orange-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-orange-950 text-orange-300 border border-orange-600 font-mono font-bold text-xs">
                  HIGH (7.0 - 8.9)
                </span>
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Mandatory Remediation SLA:
                </span>
                <span className="text-base font-black text-orange-300">7 to 14 Calendar Days</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Emergency sprint priority. Requires security architect code review and dedicated penetration re-testing before production promotion.
              </p>
              <div className="pt-2 border-t border-orange-900/50 text-[11px] font-mono text-orange-400">
                Examples: Stored XSS in admin console, Hardcoded JWT secret keys, SSRF with internal scanning.
              </div>
            </div>

            {/* Medium */}
            <div className="p-4 rounded-xl border border-amber-800/80 bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-600 font-mono font-bold text-xs">
                  MEDIUM (4.0 - 6.9)
                </span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Mandatory Remediation SLA:
                </span>
                <span className="text-base font-black text-amber-300">30 Calendar Days</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standard release cycle remediation. Must be scheduled and verified in the current monthly sprint release pipeline.
              </p>
              <div className="pt-2 border-t border-amber-900/50 text-[11px] font-mono text-amber-400">
                Examples: CSRF on password reset, Weak TLS 1.0/1.1 cipher suites, Insecure CORS policy.
              </div>
            </div>

            {/* Low */}
            <div className="p-4 rounded-xl border border-blue-800/80 bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-600 font-mono font-bold text-xs">
                  LOW (0.1 - 3.9)
                </span>
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Mandatory Remediation SLA:
                </span>
                <span className="text-base font-black text-blue-300">90 Calendar Days</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Quarterly technical debt resolution. Defensive hardening and security configuration tuning during regular maintenance windows.
              </p>
              <div className="pt-2 border-t border-blue-900/50 text-[11px] font-mono text-blue-400">
                Examples: Verbose server banner disclosure, missing HSTS preload list, cookie without SameSite.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Beginner's Plain Guide */}
      {activeTab === 'beginner_guide' && (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <span>What is CVSS and why does it matter to an enterprise?</span>
            </h4>
            <p>
              The <b>Common Vulnerability Scoring System (CVSS)</b> is an open, vendor-agnostic framework maintained by FIRST.org. It assigns a numerical score from <b>0.0 to 10.0</b> reflecting the severity and technical risk of software vulnerabilities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-cyan-300 font-mono">1. Exploitability (Ease of Attack)</div>
                <p className="text-slate-400 text-[11px]">
                  Measures whether an attacker can exploit the vulnerability from anywhere across the public Internet with zero credentials (AV:N, PR:N, UI:N) or if they need physical hardware access and root passwords.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-rose-300 font-mono">2. Impact (Severity of Damage)</div>
                <p className="text-slate-400 text-[11px]">
                  Evaluates the CIA Triad: Can the attacker steal confidential records (C), corrupt database transactions or run malicious commands (I), or shut down the company infrastructure completely (A)?
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <h4 className="text-sm font-bold text-white">How does AegisGRC enforce CVSS compliance?</h4>
            <p className="text-slate-400 text-[11px]">
              Every vulnerability discovered by scanners (Semgrep, Wapiti, Nikto, Nmap) is normalized into its canonical CVSS 3.1 vector. Regulatory standards like <b>ISO/IEC 27001 (A.8.8)</b>, <b>PCI-DSS 4.0 (Req 6.4)</b>, and <b>DPDP Act 2023</b> require organizations to demonstrate defined remediation SLAs tied directly to CVSS severity scores.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
