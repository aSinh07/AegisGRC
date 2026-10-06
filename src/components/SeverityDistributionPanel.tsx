import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CanonicalFinding, SeverityLevel } from '../types/security';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Clock, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface SeverityDistributionPanelProps {
  findings: CanonicalFinding[];
  onSelectSeverity: (severity: string) => void;
  selectedSeverity: string;
}

export const SeverityDistributionPanel: React.FC<SeverityDistributionPanelProps> = ({
  findings,
  onSelectSeverity,
  selectedSeverity,
}) => {
  const [activeMeaning, setActiveMeaning] = useState<SeverityLevel>('HIGH');

  // Compute live counts
  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter((f) => f.severity === 'LOW').length;
  const total = Math.max(1, findings.length);

  const pieData = [
    { name: 'Critical', value: criticalCount, color: '#f43f5e', key: 'CRITICAL' },
    { name: 'High', value: highCount, color: '#f97316', key: 'HIGH' },
    { name: 'Medium', value: mediumCount, color: '#f59e0b', key: 'MEDIUM' },
    { name: 'Low', value: lowCount, color: '#38bdf8', key: 'LOW' },
  ].filter((item) => item.value > 0);

  const severityDefinitions = {
    CRITICAL: {
      name: 'Critical Severity',
      cvssRange: '9.0 – 10.0',
      threatVector: 'Remote, unauthenticated exploitation. Attackers can execute arbitrary commands, dump the entire database, or bypass all security layers.',
      businessImpact: 'Total data breach, service takeover, catastrophic brand damage, and mandatory DPDP Act regulatory breach notification.',
      congestionRisk: 'Extreme backlog congestion blocker. Freezes release pipelines and requires emergency hotfix deployment within 24 hours.',
      sla: '24 Hours (Immediate Hotfix)',
      realWorldExamples: 'SQL Injection in public auth API (CWE-89), Hardcoded JWT private signing key (CWE-798), Remote Code Execution (RCE).',
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
    },
    HIGH: {
      name: 'High Severity',
      cvssRange: '7.0 – 8.9',
      threatVector: 'Remotely exploitable with minimal preconditions, or requires basic low-privilege authentication. Enables lateral network pivoting or sensitive user session hijacking.',
      businessImpact: 'Significant compromise of customer data, unauthorized privilege escalation, or access to cloud metadata services.',
      congestionRisk: 'High congestion factor. Accumulation of High findings slows down sprint delivery and creates technical debt that fails ISO 27001 audit controls.',
      sla: '7 Days (Next Sprint Release)',
      realWorldExamples: 'Server-Side Request Forgery to internal metadata (CWE-918), Stored Cross-Site Scripting (CWE-79), Unauthenticated database ports exposed.',
      badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-800',
    },
    MEDIUM: {
      name: 'Medium Severity',
      cvssRange: '4.0 – 6.9',
      threatVector: 'Requires complex attack scenarios, user interaction (e.g. clicking a phishing link), or specific local network configurations.',
      businessImpact: 'Partial information disclosure, session state alteration, or exposure to downgrade attacks.',
      congestionRisk: 'Moderate backlog accumulation. Often triaged in bulk during routine refactoring sprints.',
      sla: '30 Days (Scheduled Sprint)',
      realWorldExamples: 'Cross-Site Request Forgery (CWE-352), Deprecated TLS 1.0 cipher suites (CWE-319), Missing Content-Security-Policy (CWE-693).',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
    },
    LOW: {
      name: 'Low Severity',
      cvssRange: '0.1 – 3.9',
      threatVector: 'Very difficult to exploit alone. Requires physical access, extensive user assistance, or high administrative privileges.',
      businessImpact: 'Minimal direct business impact. Typically minor configuration deviations or informational disclosures.',
      congestionRisk: 'Low congestion risk. Tracked and remediated during major version updates or maintenance windows.',
      sla: '90 Days (Quarterly Maintenance)',
      realWorldExamples: 'Verbose server version banners (Apache/Nginx headers), Missing HTTP OPTIONS restriction, Weak cookie expiration without sensitive data.',
      badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800',
    },
    INFO: {
      name: 'Informational',
      cvssRange: '0.0',
      threatVector: 'Defensive hardening notices, cryptographic agility recommendations, and audit observations.',
      businessImpact: 'Zero immediate exploitable risk. Used for strategic security posture hardening.',
      congestionRisk: 'Zero release blocking risk. Addressed during scheduled sprint refactoring.',
      sla: '180 Days (Long-term Backlog)',
      realWorldExamples: 'Missing DNS CAA record, TLS cipher suite order preference recommendations.',
      badgeColor: 'text-slate-400 bg-slate-900 border-slate-700',
    },
  };

  const currentDef = severityDefinitions[activeMeaning] || severityDefinitions.HIGH;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>SEVERITY DISTRIBUTION &amp; CVSS 3.1 DECRYPTOR</span>
            <span aria-hidden="true">·</span>
            <span>BACKLOG CONGESTION ANALYSIS</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Vulnerability Severity Distribution &amp; Risk Guide
          </h3>
          <p className="text-xs text-slate-400">
            Breakdown of active threats, what each severity level means, required CVSS scores, and backlog congestion impact.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Recharts Pie Chart (Cols 1-4) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry: any) => onSelectSeverity(entry?.key || 'ALL')}
                  className="cursor-pointer focus:outline-hidden"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#0f172a" 
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} findings (${Math.round(((Number(val) || 0) / total) * 100)}%)`,
                    String(name || ''),
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-white tabular-nums">{findings.length}</span>
              <span className="text-[10px] text-slate-400 font-mono">TOTAL</span>
            </div>
          </div>

          {/* Quick Clickable Legend */}
          <div className="grid grid-cols-2 gap-2 w-full text-xs font-mono">
            {pieData.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onSelectSeverity(item.key);
                  setActiveMeaning(item.key as SeverityLevel);
                }}
                className={`p-1.5 rounded flex items-center justify-between border transition-all ${
                  selectedSeverity === item.key
                    ? 'border-cyan-400 bg-cyan-950/40 text-white font-bold'
                    : 'border-slate-800/80 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="tabular-nums font-bold">{item.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Step-by-Step Educational Decryptor (Cols 5-12) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-xs">
          {/* Severity Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">Explain Severity:</span>
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setActiveMeaning(level)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  activeMeaning === level
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Meaning Breakdown Card */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded font-mono font-bold border text-xs ${currentDef.badgeColor}`}>
                  {currentDef.name}
                </span>
                <span className="font-mono text-cyan-300 font-semibold">
                  Required CVSS v3.1: {currentDef.cvssRange}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>Mandatory SLA: <b>{currentDef.sla}</b></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider text-cyan-400">
                  Threat Vector &amp; Exploitability:
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentDef.threatVector}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider text-amber-400">
                  Business Impact &amp; Breach Risk:
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentDef.businessImpact}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider text-rose-400">
                Backlog Congestion &amp; Pipeline Risk:
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {currentDef.congestionRisk}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 flex items-start gap-2">
              <span className="text-cyan-400 font-bold shrink-0">Examples:</span>
              <span className="text-slate-200">{currentDef.realWorldExamples}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
