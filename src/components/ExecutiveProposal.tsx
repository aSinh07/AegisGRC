import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Network, 
  Lock, 
  Calendar, 
  Server, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Terminal, 
  Layers, 
  ChevronRight,
  Database,
  Bot,
  ExternalLink,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Globe2
} from 'lucide-react';

interface ExecutiveProposalProps {
  onNavigateTab: (tab: string) => void;
  onOpenDeployModal: () => void;
  onExportPdf: () => void;
}

export const ExecutiveProposal: React.FC<ExecutiveProposalProps> = ({
  onNavigateTab,
  onOpenDeployModal,
  onExportPdf,
}) => {
  const [activeRoadmapPhase, setActiveRoadmapPhase] = useState<number>(1);
  const [activeSafeguard, setActiveSafeguard] = useState<number>(0);
  const [monthlyHourlyRate, setMonthlyHourlyRate] = useState<number>(95);

  const teamRoles = [
    { role: 'Project Lead / Lead Architect', headcount: 1, fte: 1.0, resp: 'Architecture design, API contracts, security review, sprint delivery.' },
    { role: 'Backend Engineers (Python/FastAPI)', headcount: 2, fte: 2.0, resp: 'Parser implementations (SARIF, XML, JSON), PostgreSQL schema, authentication (MFA/SSO), WebSocket gateway.' },
    { role: 'Frontend Engineers (React/TypeScript)', headcount: 1.5, fte: 1.5, resp: 'Single-page application, real-time streaming UI, risk heatmaps (5×5 matrix), interactive GRC mapping views.' },
    { role: 'Security / AppSec Engineers', headcount: 1, fte: 1.0, resp: 'Scanner automation (Kali Linux agent nodes, CI/CD integrations), CVSS scoring validation, tool normalization logic.' },
    { role: 'GRC & Compliance Specialist', headcount: 0.5, fte: 0.5, resp: 'Baseline mapping of CWEs to ISO 27001, ISO 42001, and statutory privacy regulations.' },
    { role: 'DevOps / Infrastructure Engineer', headcount: 1, fte: 1.0, resp: 'CI/CD pipeline automation, container hardening (Docker), persistent database setup with TLS, reverse proxy configuration.' },
  ];

  const totalHeadcount = teamRoles.reduce((acc, r) => acc + r.headcount, 0);
  const estimatedCost = Math.round(totalHeadcount * 160 * 3 * monthlyHourlyRate); // 12 weeks = 3 months

  const roadmapPhases = [
    {
      phase: 1,
      weeks: 'Weeks 1–2',
      title: 'Foundation & Core Security',
      summary: 'Deploy baseline FastAPI service, configure PostgreSQL with TLS and application-level encryption, implement TOTP multi-factor authentication, and define DB models.',
      deliverables: [
        'PostgreSQL 15+ database instance with enforced TLS 1.3 & field-level AES-256-GCM',
        'FastAPI core framework with OAuth2 / Bearer Token & TOTP MFA',
        'Canonical finding schema definition and database migration scripts',
        'Outbound agent API contracts and heartbeat monitoring'
      ]
    },
    {
      phase: 2,
      weeks: 'Weeks 3–4',
      title: 'Ingestion & Canonical Engine',
      summary: 'Implement parsers for Nmap XML, Nikto JSON, Wapiti JSON, and standard SARIF; write deduplication and finding correlation routines.',
      deliverables: [
        'SARIF 2.1.0 parser for Semgrep / Trivy / GitHub Actions static scans',
        'Nmap XML parser extracting open perimeter ports and legacy TLS configurations',
        'Nikto JSON and Wapiti DAST normalized ingestion handlers',
        'SHA-256 deduplication pipeline: Hash(Asset, CWE, Sink/Endpoint)'
      ]
    },
    {
      phase: 3,
      weeks: 'Weeks 5–6',
      title: 'Agent Automation & CI/CD',
      summary: 'Develop the Kali Linux outbound agent runner script; build reusable GitHub Actions and GitLab CI audit workflows.',
      deliverables: [
        'Hardened Kali Linux outbound runner bash script with token rotation',
        'Reusable GitHub Actions workflow for automatic SARIF uploads',
        'Docker Compose multi-service scanner harness for automated testing',
        'Dead-letter ingestion queue and parser memory buffer caps'
      ]
    },
    {
      phase: 4,
      weeks: 'Weeks 7–8',
      title: 'Compliance Framework Mapping',
      summary: 'Populate catalogs for ISO/IEC 27001:2022, ISO/IEC 42001:2023, and DPDP Act; build gap analysis aggregation queries.',
      deliverables: [
        'Comprehensive CWE-to-control mapping for ISO 27001:2022 (A.8.8, A.8.20, A.8.24)',
        'ISO 42001:2023 AI Management System controls (A.6.2 risk, A.6.4 prompt isolation)',
        'DPDP Act 2023 Section 8(5) & 8(6) mandatory privacy safeguard queries',
        'Automated real-time gap analysis calculation engine'
      ]
    },
    {
      phase: 5,
      weeks: 'Weeks 9–10',
      title: 'AI Assistant & Dashboard UI',
      summary: 'Implement the isolated WebSocket streaming gateway for the assistant; build React dashboards, risk heatmaps, and dynamic PDF export features.',
      deliverables: [
        'Air-gapped stateless AI remediation assistant with token-inspection sanitizer',
        'Dynamic 5x5 enterprise risk matrix heatmap with interactive drill-down',
        'Executive Proposal and Vulnerability Management workspace UI',
        'Browser 1-click PDF export and Python ReportLab script generator'
      ]
    },
    {
      phase: 6,
      weeks: 'Weeks 11–12',
      title: 'Verification, Hardening & Audit Prep',
      summary: 'Execute multi-tenant boundary checks, validate parser memory limits against oversized scan files, conduct penetration testing on ingestion routes, and finalize documentation.',
      deliverables: [
        'Penetration testing on inbound webhook ingestion routes',
        'Fuzz testing parsers against malformed XML and recursive JSON bombs',
        'Executive sign-off walkthrough & compliance audit bundle generation',
        'Production readiness deployment guide and open-source blueprint packaging'
      ]
    }
  ];

  const safeguards = [
    {
      title: 'Outbound-Only Ingestion Model',
      badge: 'Zero Inbound Exposure',
      description: 'Scanning workers on internal networks or Kali hosts never expose open inbound ports. Workers push scan outputs over encrypted HTTPS connections using rotating agent bearer tokens.',
      impact: 'Eliminates attack surface on internal scanning nodes; eliminates need for complex inbound NAT or VPN punching.'
    },
    {
      title: 'Encrypted Persistence at Rest (AES-256-GCM)',
      badge: 'Field-Level Cryptography',
      description: 'All vulnerability descriptions, HTTP payloads, and evidence artifacts are encrypted at rest using AES-256-GCM. Database administrators without the runtime encryption key cannot inspect raw vulnerability data.',
      impact: 'Satisfies ISO 27001 A.8.24 and DPDP Act Section 8(5) statutory requirements for technical safeguards.'
    },
    {
      title: 'Chatbot Isolation Boundary',
      badge: 'Stateless / Prompt-Injection Immune',
      description: 'The conversational assistant is completely decoupled from the persistence layer. The assistant does not possess tool-calling plugins, database adapters, or local network visibility, eliminating prompt-injection extraction vectors. Real-time responses are streamed through token-inspection sanitizers that redact sensitive credential and network patterns.',
      impact: 'Complies with ISO 42001:2023 Control A.6.4 (AI system resilience and prompt isolation).'
    },
    {
      title: 'Canonical Normalization & Deduplication',
      badge: 'SHA-256 Triplet Hash',
      description: 'Inbound findings across SARIF, Nmap XML, Nikto JSON, and Wapiti JSON are translated to a canonical schema. Duplicate findings are coalesced into a single master tracking record via Hash(Asset, CWE, Sink/Endpoint).',
      impact: 'Reduces noise by 60–80% compared to disparate scanning tools, providing a single source of truth for engineering.'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero / Executive Header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-10">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <span>ENTERPRISE ENGINEERING PROPOSAL</span>
            <span aria-hidden="true">·</span>
            <span>FOR MANAGEMENT REVIEW</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">12-WEEK LIFECYCLE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Unified Vulnerability Management &amp; GRC Control Plane
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            A centralized control plane bridging infrastructure audits, dynamic web assessments, and CI/CD static scans into a canonical normalization layer with automated compliance mapping (ISO 27001, ISO 42001, DPDP Act 2023) and an isolated, real-time AI remediation assistant.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('vulnerabilities')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-500/20"
            >
              <Zap className="h-4 w-4" />
              <span>Explore Live Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>Export PDF Proposal</span>
            </button>

            <button
              onClick={onOpenDeployModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Deployment &amp; GitHub Setup</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Mesh */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-12 hidden lg:block opacity-20 pointer-events-none font-mono text-[10px] text-cyan-400">
          <div>// CANONICAL_SCHEMA: ACTIVE</div>
          <div>// AES_256_GCM: ENFORCED</div>
          <div>// AI_ISOLATION: STATELESS</div>
          <div>// REGULATORY: ISO27001 / ISO42001 / DPDP</div>
        </div>
      </section>

      {/* Section 1: Executive Summary */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">1. Executive Summary</h2>
            <p className="text-xs text-slate-400">Strategic rationale and operational problem statement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-rose-950/40 bg-rose-950/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              CURRENT STATE: FRAGMENTED TOOLING
            </div>
            <h3 className="text-base font-semibold text-white">The Cost of Disconnected Security Reports</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modern enterprise security workflows suffer from isolated scanners. Network audits (Nmap XML), dynamic web scanners (Nikto JSON, Wapiti), and CI/CD pipelines (Semgrep SARIF) generate siloed reports in disparate formats.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-mono">✕</span> Manual triage across 4+ different vendor dashboards
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-mono">✕</span> Duplicate findings waste hundreds of engineering hours
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-mono">✕</span> No automated mapping to ISO 27001, ISO 42001, or DPDP Act
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-mono">✕</span> Ad-hoc LLM usage risks leaking internal network topology
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-emerald-950/50 bg-emerald-950/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              TARGET STATE: UNIFIED GRC CONTROL PLANE
            </div>
            <h3 className="text-base font-semibold text-white">Automated Ingestion, Canonical Mapping &amp; Isolated AI</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This proposal establishes an automated, outbound-only ingestion pipeline converting heterogeneous scans into a canonical normalized schema with deterministic SHA-256 deduplication and AES-256 field encryption.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> Single pane of glass for Infrastructure, DAST &amp; SAST
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> Deterministic deduplication: <code className="text-emerald-300 font-mono text-[11px]">Hash(Asset, CWE, Sink)</code>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> Continuous compliance scorecard for ISO 27001, 42001, and DPDP
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> Air-gapped AI guidance with token-inspection sanitizers
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Resource Allocation & Team Structure */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">2. Resource Allocation &amp; Team Structure</h2>
            <p className="text-xs text-slate-400">Cross-functional staffing plan for the 12-week implementation lifecycle</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-800/40">
            <Users className="h-3.5 w-3.5" />
            <span>Total Headcount: {totalHeadcount} FTEs</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-300 font-semibold">
              <tr>
                <th className="py-3 px-4">Team / Role</th>
                <th className="py-3 px-4 text-center">Headcount</th>
                <th className="py-3 px-4">Core Responsibilities</th>
                <th className="py-3 px-4 text-right">Sprint Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {teamRoles.map((role, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">0{idx + 1}.</span>
                    {role.role}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-cyan-300">
                    {role.headcount}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {role.resp}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                    Weeks 1–12
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interactive Budget / FTE Estimator */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            <div>
              <span className="text-slate-300 font-medium">Blended Engineering Rate Simulator: </span>
              <span className="font-mono text-cyan-300 font-semibold">${monthlyHourlyRate}/hr</span>
            </div>
            <input 
              type="range" 
              min="65" 
              max="160" 
              step="5"
              value={monthlyHourlyRate}
              onChange={(e) => setMonthlyHourlyRate(parseInt(e.target.value, 10))}
              className="accent-cyan-400 w-28 cursor-pointer"
            />
          </div>
          <div className="text-right">
            <span className="text-slate-400">Estimated 12-Week Project Cost: </span>
            <span className="font-mono text-sm font-bold text-white">${estimatedCost.toLocaleString()} USD</span>
          </div>
        </div>
      </section>

      {/* Section 3: High-Level Architecture & Flow */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">3. High-Level Architecture &amp; Flow</h2>
            <p className="text-xs text-slate-400">Outbound push topology, canonical normalizer, and isolated assistant boundary</p>
          </div>
        </div>

        {/* Interactive Diagram Component */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-950 space-y-6">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">System Topology &amp; Threat Boundary</span>
            <span className="font-mono text-cyan-400">Outbound-Only TLS + Bearer Auth</span>
          </div>

          {/* Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Ingestion Infrastructure */}
            <div className="p-4 rounded-lg border border-cyan-900/50 bg-cyan-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5" /> 1. Ingestion Workers</span>
                <span className="font-mono text-[10px] text-cyan-500">Outbound Only</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Scanning nodes operate on internal networks or CI/CD pipelines without listening ports:
              </p>
              <div className="space-y-1 text-[11px] font-mono text-slate-300">
                <div className="p-1 rounded bg-slate-900/80">· Kali Agent (Nmap XML / Wapiti)</div>
                <div className="p-1 rounded bg-slate-900/80">· GitHub Actions (Semgrep SAST)</div>
                <div className="p-1 rounded bg-slate-900/80">· Cloud DAST Worker (Nikto JSON)</div>
              </div>
            </div>

            {/* Box 2: Central Platform */}
            <div className="p-4 rounded-lg border border-indigo-900/50 bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
                <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> 2. Central Control Plane</span>
                <span className="font-mono text-[10px] text-indigo-500">FastAPI &amp; DB</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Normalizes payloads, prevents duplicate entries, and encrypts evidence at rest:
              </p>
              <div className="space-y-1 text-[11px] font-mono text-slate-300">
                <div className="p-1 rounded bg-slate-900/80">· Canonical Parser (SARIF/XML/JSON)</div>
                <div className="p-1 rounded bg-slate-900/80">· SHA-256 Deduplication Hash</div>
                <div className="p-1 rounded bg-slate-900/80">· AES-256 Encrypted PostgreSQL</div>
                <div className="p-1 rounded bg-slate-900/80">· GRC Mapping (ISO 27001/42001/DPDP)</div>
              </div>
            </div>

            {/* Box 3: Presentation & AI Advisory */}
            <div className="p-4 rounded-lg border border-teal-900/50 bg-teal-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-400">
                <span className="flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /> 3. Advisory &amp; UI Layer</span>
                <span className="font-mono text-[10px] text-teal-500">Stateless</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Visualizes posture with strict isolation safeguards for real-time guidance:
              </p>
              <div className="space-y-1 text-[11px] font-mono text-slate-300">
                <div className="p-1 rounded bg-slate-900/80">· Dynamic 5×5 Risk Matrix</div>
                <div className="p-1 rounded bg-slate-900/80">· Remediation Action Workflows</div>
                <div className="p-1 rounded bg-slate-900/80">· Token-Inspection Sanitizer Gateway</div>
                <div className="p-1 rounded bg-slate-900/80">· Zero-DB Stateless Gemini Assistant</div>
              </div>
            </div>
          </div>

          {/* ASCII / Schematic Data Flow Box */}
          <div className="p-4 rounded-lg bg-slate-900/90 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
            <div className="text-cyan-400 font-bold mb-1">// CANONICAL DATA PIPELINE FLOW:</div>
            <div>[Kali / CI/CD] ──(HTTPS Outbound + Bearer Token)──► [FastAPI Normalization Ingest]</div>
            <div>                                                              │</div>
            <div>                                                [Canonical Normalizer (SARIF/XML/JSON)]</div>
            <div>                                                              │</div>
            <div>                                                [Deduplicator: Hash(Asset, CWE, Sink)]</div>
            <div>                                                              │</div>
            <div>                     ┌────────────────────────────────────────┴────────────────────────────────────────┐</div>
            <div>                     ▼                                                                                 ▼</div>
            <div>    [PostgreSQL Storage (AES-256 Rows)]                                               [GRC Engine (ISO 27001/42001/DPDP)]</div>
            <div>                     │                                                                                 │</div>
            <div>                     └────────────────────────────────────────┬────────────────────────────────────────┘</div>
            <div>                                                              ▼</div>
            <div>                                               [React Workspace + 5x5 Heatmap]</div>
            <div>                                                              │</div>
            <div>                                       [Isolated Assistant (Token Sanitizer + Gemini)]</div>
          </div>
        </div>
      </section>

      {/* Section 4: Key Architectural Safeguards */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">4. Key Architectural Safeguards</h2>
            <p className="text-xs text-slate-400">Zero-trust controls protecting infrastructure, data, and AI interactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {safeguards.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveSafeguard(idx)}
              className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                activeSafeguard === idx
                  ? 'border-cyan-500/80 bg-cyan-950/20 shadow-md shadow-cyan-950/40'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-cyan-400">0{idx + 1}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-cyan-300">
                <span className="text-slate-400">Outcome: </span>
                {item.impact}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Twelve-Week Implementation Roadmap */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">5. Twelve-Week Implementation Roadmap</h2>
            <p className="text-xs text-slate-400">Structured milestone schedule from foundational encryption to production sign-off</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Selected Phase:</span>
            <span className="font-semibold text-cyan-300">Phase {activeRoadmapPhase}</span>
          </div>
        </div>

        {/* Phase selector tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {roadmapPhases.map((phase) => (
            <button
              key={phase.phase}
              onClick={() => setActiveRoadmapPhase(phase.phase)}
              className={`p-3 rounded-lg text-left border transition-all text-xs ${
                activeRoadmapPhase === phase.phase
                  ? 'border-cyan-500 bg-cyan-950/40 text-white'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="font-mono text-[10px] text-cyan-400 font-semibold">{phase.weeks}</div>
              <div className="font-semibold truncate mt-0.5">Phase {phase.phase}</div>
              <div className="text-[11px] text-slate-400 truncate">{phase.title}</div>
            </button>
          ))}
        </div>

        {/* Active Phase Details */}
        {(() => {
          const p = roadmapPhases.find((item) => item.phase === activeRoadmapPhase)!;
          return (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono text-cyan-400 font-semibold">PHASE {p.phase} · {p.weeks}</div>
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Sprint Delivery Milestone</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {p.summary}
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-200">Key Milestone Deliverables:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {p.deliverables.map((d, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Section 6: Infrastructure & Tooling Requirements */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">6. Infrastructure &amp; Tooling Requirements</h2>
            <p className="text-xs text-slate-400">System specifications, hosting topology, and verified tech stack</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Server className="h-4 w-4" />
              <span>Primary Application Host</span>
            </div>
            <div className="font-mono text-slate-200 font-bold">Linux Server (Ubuntu 24.04 LTS)</div>
            <p className="text-slate-400 text-[11px]">
              4 vCPU, 8 GB RAM, 50 GB NVMe Storage. Reverse proxy configured with TLS 1.3.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Database className="h-4 w-4" />
              <span>Database Instance</span>
            </div>
            <div className="font-mono text-slate-200 font-bold">Managed PostgreSQL 15+</div>
            <p className="text-slate-400 text-[11px]">
              SSL/TLS enforced. Application-layer AES-256 encryption on sensitive vulnerability rows.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Bot className="h-4 w-4" />
              <span>AI Runtime &amp; Boundary</span>
            </div>
            <div className="font-mono text-slate-200 font-bold">Gemini 3.8 Flash / Ollama</div>
            <p className="text-slate-400 text-[11px]">
              Air-gapped stateless gateway with real-time token sanitizer. Zero DB access permissions.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Cpu className="h-4 w-4" />
              <span>Tooling &amp; Packages</span>
            </div>
            <div className="font-mono text-slate-200 font-bold">Python 3.12+ · Node 22+</div>
            <p className="text-slate-400 text-[11px]">
              Docker Engine, Nmap 7.94+, Semgrep OSS 1.88+, Nikto, Wapiti 3.1+, ReportLab.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Action Footer Banner */}
      <section className="p-6 rounded-2xl border border-cyan-800/40 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-white">Ready to examine the live unified control plane?</h3>
          <p className="text-xs text-slate-400">
            Test the live ingestion engine with real SARIF, Nmap XML, and Wapiti DAST data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('vulnerabilities')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap"
          >
            Launch Vulnerability Manager
          </button>
          <button
            onClick={() => onNavigateTab('assistant')}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Test Isolated AI
          </button>
        </div>
      </section>
    </div>
  );
};
