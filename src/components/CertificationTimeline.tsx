import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck2, 
  Award, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export interface AuditMilestone {
  id: string;
  stageName: string;
  quarter: string;
  framework: 'ISO 27001' | 'ISO 42001' | 'DPDP Act' | 'Unified Multi-Track';
  readinessScore: number;
  benchmarkScore: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
  targetDate: string;
  auditorEntity: string;
  keyDeliverable: string;
  auditScope: string;
  evidenceArtifacts: string[];
}

const AUDIT_MILESTONES_DATA: AuditMilestone[] = [
  {
    id: 'm1',
    stageName: '1. Baseline Gap & Threat Modeling',
    quarter: 'Q1 2026',
    framework: 'Unified Multi-Track',
    readinessScore: 100,
    benchmarkScore: 85,
    status: 'COMPLETED',
    targetDate: 'Feb 15, 2026',
    auditorEntity: 'Internal GRC / AppSec Committee',
    keyDeliverable: 'Comprehensive Threat Model & Regulatory Gap Assessment Matrix',
    auditScope: 'All internal repositories, DMZ perimeter IPs, and DAST endpoints.',
    evidenceArtifacts: [
      'Threat Model v1.2 (STRIDE & MITRE ATT&CK)',
      'Baseline Scanner Telemetry (Nmap, Semgrep, Wapiti)',
      'Initial Statement of Applicability (SoA) Draft',
    ],
  },
  {
    id: 'm2',
    stageName: '2. Cryptographic & Ingestion Controls',
    quarter: 'Q2 2026 (Apr)',
    framework: 'Unified Multi-Track',
    readinessScore: 100,
    benchmarkScore: 90,
    status: 'COMPLETED',
    targetDate: 'Apr 30, 2026',
    auditorEntity: 'Cybersecurity Architecture Board',
    keyDeliverable: 'AES-256 Field Encryption & Outbound-Only Worker Pipeline',
    auditScope: 'PostgreSQL database encryption at rest, TLS 1.3 edge termination, and Bearer token rotation.',
    evidenceArtifacts: [
      'AES-256-GCM Field Cryptography Architecture Spec',
      'Outbound Kali Agent Runner Script v2.1',
      'TLS 1.3 Certificate & Cipher Suite Hardening Proof',
    ],
  },
  {
    id: 'm3',
    stageName: '3. AI Prompt Fencing & Privacy Governance',
    quarter: 'Q2 2026 (Jun)',
    framework: 'Unified Multi-Track',
    readinessScore: 96,
    benchmarkScore: 90,
    status: 'COMPLETED',
    targetDate: 'Jun 28, 2026',
    auditorEntity: 'AI Ethics & Privacy Review Board',
    keyDeliverable: 'Air-Gapped AI Isolation & DPDP Data Principal Consent Framework',
    auditScope: 'Conversational assistant boundary, prompt token inspection, DPDP Act personal data inventory.',
    evidenceArtifacts: [
      'ISO 42001 Control A.6.4 Isolation Proof (Zero-DB Read/Write)',
      'Token-Inspection Sanitizer Regex Unit Test Suite',
      'DPDP Act Section 8(5) Technical Safeguards Compliance Dossier',
    ],
  },
  {
    id: 'm4',
    stageName: '4. Stage 1 Documentation & Readiness Audit',
    quarter: 'Q3 2026 (Aug)',
    framework: 'Unified Multi-Track',
    readinessScore: 94,
    benchmarkScore: 92,
    status: 'IN_PROGRESS',
    targetDate: 'Aug 25, 2026',
    auditorEntity: 'Accredited Certification Registrar (BSI / TÜV SÜD)',
    keyDeliverable: 'Stage 1 Audit Readiness Report & SoA Final Sign-off',
    auditScope: 'ISMS & AIMS documentation review, policy alignment, and risk treatment plan.',
    evidenceArtifacts: [
      'Final Statement of Applicability (SoA) v2.4 (All 93 Annex A Controls)',
      'Vulnerability Management Policy & 7-Day SLA Procedure',
      'DPDP Act Mandatory Breach Notification Playbook (Section 8(6))',
    ],
  },
  {
    id: 'm5',
    stageName: '5. Stage 2 Formal Certification Audit',
    quarter: 'Q4 2026 (Oct)',
    framework: 'Unified Multi-Track',
    readinessScore: 88,
    benchmarkScore: 95,
    status: 'IN_PROGRESS',
    targetDate: 'Oct 28, 2026',
    auditorEntity: 'External Lead Auditor (BSI Americas)',
    keyDeliverable: 'ISO/IEC 27001:2022 & ISO/IEC 42001:2023 Official Certificates',
    auditScope: 'On-site technical sampling, penetration test verification, and live control plane audit.',
    evidenceArtifacts: [
      'Third-Party Penetration Test & Re-test Report (Clean Bill)',
      'AegisGRC 30-Day Historical Trend & MTTR Audit Log',
      'Data Protection Board (DPB) Compliance Attestation',
    ],
  },
  {
    id: 'm6',
    stageName: '6. Post-Cert Continuous Surveillance',
    quarter: '2027 (Ongoing)',
    framework: 'Unified Multi-Track',
    readinessScore: 75,
    benchmarkScore: 95,
    status: 'SCHEDULED',
    targetDate: 'Q2 2027',
    auditorEntity: 'Annual Surveillance Registrar',
    keyDeliverable: 'Year-1 Surveillance Audit Sign-off & Continuous AI Monitoring',
    auditScope: 'Automated continuous vulnerability ingestion and ISO 42001 AI model drift surveillance.',
    evidenceArtifacts: [
      'Continuous Ingestion Audit Logs (Nmap/Wapiti/Semgrep)',
      'Annual Management Review Minutes',
      'AI Prompt Security Retrospective Report',
    ],
  },
];

const CustomTimelineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item: AuditMilestone = payload[0]?.payload;
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[240px]">
        <div className="font-semibold text-white border-b border-slate-800 pb-1">
          {item.stageName}
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Target Date:</span>
          <span className="text-cyan-400 font-bold">{item.targetDate}</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Current Readiness:</span>
          <span className="text-emerald-400 font-bold tabular-nums">{item.readinessScore}%</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Benchmark Target:</span>
          <span className="text-amber-400 font-bold tabular-nums">{item.benchmarkScore}%</span>
        </div>
        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          Auditor: {item.auditorEntity}
        </div>
      </div>
    );
  }
  return null;
};

export const CertificationTimeline: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<AuditMilestone>(AUDIT_MILESTONES_DATA[3]); // Default to Stage 1

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>CERTIFICATION LIFECYCLE ROADMAP</span>
            <span aria-hidden="true">·</span>
            <span>AUDIT READINESS BENCHMARK</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">
            Audit Milestones &amp; Certification Timeline
          </h3>
          <p className="text-xs text-slate-400">
            Tracking execution milestones from baseline threat modeling to final ISO 27001, ISO 42001, and DPDP Act registrar certification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-emerald-400" />
            <span>Overall Readiness: 94%</span>
          </span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400 font-medium">Current Milestone</div>
          <div className="text-sm font-bold text-white truncate">Stage 1 Readiness Audit</div>
          <div className="text-[10px] text-cyan-400 font-mono">BSI Registrar In Progress</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400 font-medium">Stage 2 Final Audit</div>
          <div className="text-base font-mono font-bold text-amber-300">Oct 28, 2026</div>
          <div className="text-[10px] text-amber-400/80 font-mono">23 Days to On-Site Audit</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400 font-medium">SoA Control Applicability</div>
          <div className="text-base font-mono font-bold text-emerald-400">93 / 93 Controls</div>
          <div className="text-[10px] text-slate-500 font-mono">ISO 27001:2022 Annex A</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-slate-400 font-medium">DPDP Act Filing Target</div>
          <div className="text-base font-mono font-bold text-cyan-300">Sec 8(5) Certified</div>
          <div className="text-[10px] text-slate-500 font-mono">Data Protection Board</div>
        </div>
      </div>

      {/* Main Recharts Composed Chart (Bar + Benchmark Line) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            <span>Milestone Readiness Score vs. Certification Benchmark (%)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-cyan-400" /> Milestone Score</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded bg-amber-400" /> Registrar Benchmark</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={AUDIT_MILESTONES_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="quarter"
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
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTimelineTooltip />} />
              <Bar
                dataKey="readinessScore"
                name="Milestone Readiness (%)"
                radius={[6, 6, 0, 0]}
                onClick={(entry: any) => setSelectedMilestone(entry)}
                className="cursor-pointer"
              >
                {AUDIT_MILESTONES_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.id === selectedMilestone.id
                        ? '#38bdf8'
                        : entry.status === 'COMPLETED'
                        ? '#10b981'
                        : entry.status === 'IN_PROGRESS'
                        ? '#06b6d4'
                        : '#475569'
                    }
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="benchmarkScore"
                name="Registrar Target Benchmark"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Milestone Explorer & Evidence Inspector */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
              <span>{selectedMilestone.quarter}</span>
              <span aria-hidden="true">·</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                selectedMilestone.status === 'COMPLETED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : selectedMilestone.status === 'IN_PROGRESS'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {selectedMilestone.status.replace('_', ' ')}
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-1">{selectedMilestone.stageName}</h4>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-slate-400">Readiness Score: </span>
            <span className="text-emerald-400 font-bold text-sm tabular-nums">
              {selectedMilestone.readinessScore}%
            </span>
          </div>
        </div>

        {/* Milestone Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Key Audit Deliverable:
              </span>
              <p className="mt-1 p-2.5 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 font-medium">
                {selectedMilestone.keyDeliverable}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Audit Entity &amp; Target Date:
              </span>
              <div className="mt-1 p-2.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-mono text-[11px] flex items-center justify-between">
                <span>{selectedMilestone.auditorEntity}</span>
                <span className="text-cyan-400 font-bold">{selectedMilestone.targetDate}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Verified Evidence Artifacts Submitted for Audit:</span>
            </span>

            <div className="space-y-1.5">
              {selectedMilestone.evidenceArtifacts.map((artifact, aIdx) => (
                <div
                  key={aIdx}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono">{artifact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
