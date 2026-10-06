import React, { useState } from 'react';
import { 
  FolderTree, 
  FileCode, 
  BookOpen, 
  FileDown, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  Server, 
  ShieldCheck, 
  Printer, 
  FileText,
  Sparkles,
  ChevronRight,
  Folder
} from 'lucide-react';

export const ProjectTheoryExplorer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'files' | 'theory' | 'workflow'>('theory');
  const [selectedFile, setSelectedFile] = useState<string>('src/components/DatabaseSchemaExplorer.tsx');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const projectFiles = [
    {
      path: 'src/components/DatabaseSchemaExplorer.tsx',
      type: 'Component',
      size: '14.2 KB',
      desc: 'Interactive ERD and relational model visualizer for PostgreSQL & Firestore.',
    },
    {
      path: 'src/components/RemediationDefenseHub.tsx',
      type: 'Component',
      size: '18.6 KB',
      desc: 'Defensive cyber remedies, WAF ModSecurity rules, and AI prompt firewall.',
    },
    {
      path: 'src/components/MultiFormatReportSuite.tsx',
      type: 'Component',
      size: '16.8 KB',
      desc: 'Multi-format document generation suite (PDF, DOC, PPT, CSV, TXT).',
    },
    {
      path: 'src/components/DynamicArchitectureFlowchart.tsx',
      type: 'Component',
      size: '22.4 KB',
      desc: 'Dynamic 6-tier infrastructure data flow chart with SQLi/XSS callouts.',
    },
    {
      path: 'src/components/CyberAuthPortal.tsx',
      type: 'Component',
      size: '19.2 KB',
      desc: 'Zero-trust MFA login with Google/Microsoft Authenticator & QR generator.',
    },
    {
      path: 'src/components/Cyber3DGeometricScene.tsx',
      type: 'Component',
      size: '11.8 KB',
      desc: '3D live geometric icosahedron canvas with interactive mouse orbit.',
    },
    {
      path: 'src/firebase.ts',
      type: 'Service',
      size: '5.4 KB',
      desc: 'Firebase Firestore connection, ABAC security rules wrapper, error handler.',
    },
    {
      path: 'firestore.rules',
      type: 'Security',
      size: '4.8 KB',
      desc: 'Hardened Firestore security rules with 8 pillars and zero-trust ABAC.',
    },
    {
      path: 'firebase-blueprint.json',
      type: 'Schema',
      size: '4.2 KB',
      desc: 'Intermediate Representation (IR) schema for UserProfile, GrcAudit, AccessLog.',
    },
    {
      path: 'server.ts',
      type: 'Backend',
      size: '6.8 KB',
      desc: 'Express API gateway with Gemini AST integration and Vite middleware.',
    },
  ];

  // Download Complete Theory Whitepaper (.doc)
  const handleDownloadTheoryDoc = () => {
    const content = `<!DOCTYPE html>
<html>
<head><title>AegisGRC Architecture & Theoretical Whitepaper - AmanDev</title>
<style>
body { font-family: 'Segoe UI', Calibri, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.6; max-width: 800px; margin: auto; }
h1 { color: #0284c7; border-bottom: 2pt solid #0284c7; font-size: 20pt; }
h2 { color: #0f172a; border-bottom: 1pt solid #cbd5e1; font-size: 14pt; margin-top: 18pt; }
p, li { font-size: 10.5pt; }
table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
th, td { border: 1pt solid #cbd5e1; padding: 6pt; font-size: 10pt; }
th { background-color: #f8fafc; font-weight: bold; }
.meta { background-color: #f1f5f9; padding: 10pt; border-radius: 6pt; margin-bottom: 16pt; font-size: 10pt; }
</style>
</head>
<body>
<h1>AEGIS GRC: UNIFIED CONTROL PLANE &amp; ARCHITECTURAL WHITEPAPER</h1>
<div class="meta">
<p><b>Author &amp; Architect:</b> AmanDev (Lead Security Architect)</p>
<p><b>Copyright:</b> &copy; 2026 AmanDev. All Rights Reserved. Proprietary Architectural Design &amp; Intellectual Property.</p>
<p><b>Target Standards:</b> ISO/IEC 27001:2022, ISO/IEC 42001:2023, DPDP Act 2023, PCI-DSS 4.0</p>
</div>

<h2>1. Executive Summary &amp; Problem Statement</h2>
<p>Enterprise vulnerability management has historically operated in siloed domains. Network reconnaissance tools (Nmap, Wireshark), web application scanners (Wapiti, Burp Suite), and static code analysis (Semgrep) generate disparate reports. This whitepaper specifies the AegisGRC Control Plane—a unified, zero-trust system that normalizes vulnerabilities into a single canonical schema, automatically correlates weaknesses with compliance frameworks, and safeguards AI guidance behind an isolated prompt firewall.</p>

<h2>2. Canonical Data Pipeline &amp; Normalization Logic</h2>
<p>All incoming scan outputs (XML, JSON, SARIF) pass through an ingestion gateway that extracts CWE numbers, calculates SHA-256 deduplication hashes, and maps CVSS v3.1 base metrics. Encrypted payload storage uses AES-256-GCM to prevent data-at-rest leaks.</p>

<h2>3. Zero-Trust Authentication &amp; Multi-Factor Verification</h2>
<p>Access requires RFC 6238 Time-Based One-Time Passwords (TOTP) through Google Authenticator or Microsoft Authenticator number matching. All authentication sessions are logged immutably to Google Cloud Firebase Firestore with cryptographic timestamps and IP/GPS metadata.</p>

<h2>4. Defensive Security Architecture &amp; Prompt Firewall</h2>
<p>To guard against OWASP LLM01 Prompt Injection, the platform deploys an isolated execution proxy with dual-boundary validation. System prompts cannot be overridden by user inputs, and sensitive tenant credentials are mathematically isolated from generative model tokens.</p>

<h2>5. Regulatory Compliance Mapping</h2>
<table>
<tr><th>Regulation / Standard</th><th>Scope</th><th>AegisGRC Control Plane Implementation</th></tr>
<tr><td>ISO/IEC 27001:2022</td><td>Information Security Management</td><td>Annex A.8.8 Management of technical vulnerabilities; A.8.24 Use of cryptography.</td></tr>
<tr><td>ISO/IEC 42001:2023</td><td>Artificial Intelligence Management</td><td>Clause 6.1 AI Risk Assessment; B.6.2 Data governance for AI systems.</td></tr>
<tr><td>DPDP Act 2023 (India)</td><td>Digital Personal Data Protection</td><td>Section 8(5) Security safeguards; Section 8(6) Breach notification ready.</td></tr>
<tr><td>PCI-DSS 4.0</td><td>Payment Card Industry Data Security</td><td>Requirement 3.4 Obfuscation; Requirement 8.3 Multi-Factor Authentication.</td></tr>
</table>

<h2>6. Sign-off &amp; Legal IP Attribution</h2>
<p>This design, implementation, and methodology are certified and authored by AmanDev.</p>
<p><b>&copy; 2026 AmanDev. All Rights Reserved. Proprietary Architectural Design &amp; Intellectual Property.</b></p>
</body></html>`;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AegisGRC_Theoretical_Architecture_Whitepaper_AmanDev.doc';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Project Architecture &amp; Theory Explorer
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Corporate Presentation Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse complete project folder structure, codebase integration details, and download the full theoretical architecture whitepaper.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTheoryDoc}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Download Theory Whitepaper (.doc)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setActiveSection('theory')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeSection === 'theory'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Theory &amp; Presentation Whitepaper</span>
        </button>

        <button
          onClick={() => setActiveSection('workflow')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeSection === 'workflow'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Enterprise Architecture Workflow</span>
        </button>

        <button
          onClick={() => setActiveSection('files')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeSection === 'files'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <FolderTree className="h-3.5 w-3.5" />
          <span>Project Codebase &amp; Folder Browser</span>
        </button>
      </div>

      {/* SECTION 1: Theoretical Whitepaper */}
      {activeSection === 'theory' && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-950 space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Corporate Presentation Technical Whitepaper
            </span>
            <h2 className="text-xl font-bold text-white">
              AegisGRC: Unified Vulnerability Control Plane &amp; Zero-Trust GRC Architecture
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
              <span>Author: <b>AmanDev</b></span>
              <span>·</span>
              <span>Designation: <b>Lead Security Architect</b></span>
              <span>·</span>
              <span className="text-cyan-300">&copy; 2026 AmanDev. All Rights Reserved.</span>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide text-cyan-300">
              1. Architectural Philosophy: The Zero-Trust Control Plane
            </h3>
            <p>
              In high-security enterprise environments, vulnerability management cannot rely on disparate tools with uncoordinated reporting. The AegisGRC Control Plane operates on the fundamental principle that <b>all perimeter requests, scans, and AI inferences must be authenticated, verified, and audited</b>.
            </p>
            <p>
              By decoupling the ingestion engine from the underlying storage layer, vulnerabilities discovered via dynamic analysis (Wapiti, Burp Suite), static analysis (Semgrep), and network telemetry (Nmap, Wireshark) are converted into immutable canonical records with standard CVSS v3.1 base and exploitability vectors.
            </p>

            <h3 className="text-sm font-bold text-white uppercase tracking-wide text-cyan-300 pt-2">
              2. Mathematical Scoring &amp; CVSS Normalization Equations
            </h3>
            <p>
              Vulnerability severity is computed using the First CVSS v3.1 vector calculation standard:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-cyan-300 text-[11px]">
              BaseScore = roundup(min(10, (1 - ((1 - Impact) &times; (1 - Exploitability))) &times; 1.08))
            </div>
            <p>
              Where Exploitability is derived from Attack Vector (AV), Attack Complexity (AC), Privileges Required (PR), and User Interaction (UI). Impact measures Confidentiality, Integrity, and Availability degradation.
            </p>

            <h3 className="text-sm font-bold text-white uppercase tracking-wide text-cyan-300 pt-2">
              3. AI Risk Hardening &amp; The Prompt Firewall
            </h3>
            <p>
              Generative AI assistants embedded in security tooling present significant attack surfaces under OWASP Top 10 for LLM (LLM01 Prompt Injection). The AegisGRC architecture enforces <b>Zero-Trust Prompt Encapsulation</b>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Generative AI models are granted <b>read-only zero-access</b> to the primary PostgreSQL or Firestore database.</li>
              <li>User prompts undergo regex and token boundary filtering before LLM ingestion.</li>
              <li>System instructions are anchored with non-overridable semantic boundaries, preventing jailbreaks or role-hijacking attacks.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 2: Workflow Architecture */}
      {activeSection === 'workflow' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>End-to-End Enterprise Data Flow Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualizing the five-stage pipeline from target ingestion to verified remediation and compliance audit trails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Stage 1</div>
              <div className="font-bold text-xs text-white">Target Ingestion</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Auditor inputs URL, PDF, or network diagram. Publisher credentials (Name, Position, Company, GPS) are bound.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <div className="text-[10px] font-mono font-bold text-purple-400 uppercase">Stage 2</div>
              <div className="font-bold text-xs text-white">Scanning &amp; Recon</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Wapiti, Burp Suite, Nmap, and Semgrep execute parallel AST and dynamic probes across web endpoints.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">Stage 3</div>
              <div className="font-bold text-xs text-white">Canonical Normalization</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Raw findings are mapped to CWE IDs, CVSS 3.1 scores, and deduplicated using SHA-256 hashes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Stage 4</div>
              <div className="font-bold text-xs text-white">Zero-Trust Persistence</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Stored in Google Cloud Firestore &amp; PostgreSQL with AES-256 field encryption and immutable access logging.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Stage 5</div>
              <div className="font-bold text-xs text-white">Multi-Format Export</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Executive PDF, DOC, PPT slides, CSV spreadsheet, and compliance sign-off certified under Ed25519 signature.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Project Files Browser */}
      {activeSection === 'files' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-cyan-400" />
              <span>Project Repository &amp; File Tree Explorer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Inspection matrix of all integrated components, security rules, and database configuration files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectFiles.map((file) => (
              <div
                key={file.path}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors flex items-start justify-between gap-3 font-mono text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>{file.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{file.desc}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{file.type}</span>
                    <span>{file.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persistent Copyright Watermark */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <span className="text-slate-300 font-semibold">
          Project Architecture &amp; Theory Explorer · AegisGRC
        </span>
        <span className="text-cyan-400 font-bold">
          &copy; 2026 AmanDev. All Rights Reserved. Proprietary Architectural Design &amp; Intellectual Property.
        </span>
      </div>
    </div>
  );
};
