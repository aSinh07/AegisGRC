import React, { useState } from 'react';
import { CanonicalFinding, ToolIntegrationStatus } from '../types/security';
import { 
  Network, 
  Terminal, 
  Shield, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  Radio, 
  ExternalLink, 
  Layers, 
  Zap, 
  Copy, 
  Check, 
  Sparkles,
  Lock,
  ArrowRight,
  Database,
  FileCode,
  RadioTower,
  Wifi,
  Globe2,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ToolsIntegrationHubProps {
  findings: CanonicalFinding[];
  setFindings: React.Dispatch<React.SetStateAction<CanonicalFinding[]>>;
  onOpenFindingDetails: (finding: CanonicalFinding) => void;
}

export const ToolsIntegrationHub: React.FC<ToolsIntegrationHubProps> = ({
  findings,
  setFindings,
  onOpenFindingDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'connectors' | 'owasp' | 'commands'>('terminal');
  const [targetUrl, setTargetUrl] = useState<string>('https://api.enterprise.corp');
  const [selectedTool, setSelectedTool] = useState<string>('wapiti');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executingToolId, setExecutingToolId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [lastProbeStats, setLastProbeStats] = useState<{
    jobId?: string; durationMs?: number; exitCode?: number | null; evidenceHash?: string;
    resolvedAddresses?: string[]; timestamp?: string;
  } | null>(null);

  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);

  const [terminalOutput, setTerminalOutput] = useState<string>(
`[+] AegisGRC Real Security Engine
[*] Real execution endpoint: /api/pentest/run-real-tool
[*] Available real scanners: Nmap and Wapiti
[*] Raw stdout/stderr, exit code, timestamps and SHA-256 evidence are preserved.
[*] Other tool cards are integration placeholders until a genuine provider is configured.`
  );

  const tools: ToolIntegrationStatus[] = [
    {
      id: 'tool-wapiti',
      name: 'Wapiti Web DAST (Application Vulnerability Fuzzer)',
      category: 'Web DAST',
      status: 'CONNECTED',
      endpoint: 'http://localhost:3000 / http://127.0.0.1:8000',
      lastSync: 'Real-time API ready',
      commandSnippet: 'wapiti -u http://localhost:3000 --flush-session -f json -o wapiti_results.json && curl -X POST https://aegis.corp/api/ingest -d @wapiti_results.json',
      owaspCoverage: ['A03: Injection (SQL/XSS)', 'A10: SSRF', 'A01: Broken Access Control'],
      findingsCount: findings.filter((f) => f.sourceTool === 'Wapiti').length,
    },
    {
      id: 'tool-nmap',
      name: 'Nmap Network Scanner (Perimeter & TLS Audit)',
      category: 'Network Recon',
      status: 'LISTENING',
      endpoint: 'tcp://198.51.100.45:22,80,443,3306',
      lastSync: 'Real-time API ready',
      commandSnippet: 'nmap -sV -sC --script ssl-enum-ciphers,vuln -p- -oX nmap_out.xml 198.51.100.45',
      owaspCoverage: ['A02: Cryptographic Failures', 'A05: Security Misconfiguration'],
      findingsCount: findings.filter((f) => f.sourceTool === 'Nmap').length,
    },
    {
      id: 'tool-burp',
      name: 'Burp Suite Professional / Enterprise API',
      category: 'Web Proxy',
      status: 'STANDBY',
      endpoint: 'Not configured',
      lastSync: 'Provider not connected',
      commandSnippet: 'curl -X POST https://burp.internal:8080/api/v0.1/scan -H "X-Api-Key: $BURP_KEY" -d \'{"urls":["https://api.enterprise.corp"]}\'',
      owaspCoverage: ['A01: Broken Access Control', 'A03: Injection', 'A07: Identification Failures'],
      findingsCount: findings.filter((f) => f.sourceTool === 'BurpSuite').length,
    },
    {
      id: 'tool-metasploit',
      name: 'Metasploit Framework (Exploit Verification)',
      category: 'Exploit Verification',
      status: 'STANDBY',
      endpoint: 'Not configured',
      lastSync: 'Execution intentionally disabled',
      commandSnippet: 'msfconsole -q -x "use auxiliary/scanner/http/sql_injection; set RHOSTS api.enterprise.corp; run; exit"',
      owaspCoverage: ['PoC Verification', 'Remote Code Execution', 'Authentication Bypass'],
      findingsCount: findings.filter((f) => f.sourceTool === 'Metasploit').length,
    },
    {
      id: 'tool-wireshark',
      name: 'Wireshark / TShark (Packet Telemetry)',
      category: 'Packet Inspection',
      status: 'STANDBY',
      endpoint: 'Not configured',
      lastSync: 'Capture provider not connected',
      commandSnippet: 'tshark -i eth0 -f "tcp port 80 or tcp port 443" -Y "http.authorization or tls.handshake.version == 0x0301"',
      owaspCoverage: ['A02: Cleartext Transmission (CWE-319)', 'Unencrypted Credential Leaks'],
      findingsCount: findings.filter((f) => f.sourceTool === 'Wireshark').length,
    },
    {
      id: 'tool-semgrep',
      name: 'Semgrep OSS & GitHub Actions (SAST Engine)',
      category: 'SAST & SCA',
      status: 'STANDBY',
      endpoint: 'Requires repository/source input',
      lastSync: 'Source scanner not connected',
      commandSnippet: 'semgrep scan --config=p/owasp-top-ten --sarif -o semgrep.sarif',
      owaspCoverage: ['A03: Injection (CWE-89)', 'A02: Secrets (CWE-798)', 'A04: Insecure Design'],
      findingsCount: findings.filter((f) => f.sourceTool === 'Semgrep').length,
    },
    {
      id: 'tool-ai-scanner',
      name: 'Agentic AI Vulnerability Scanner (Semantic AST & Zero-Day Engine)',
      category: 'SAST & SCA',
      status: 'STANDBY',
      endpoint: 'Analysis only',
      lastSync: 'Not a direct execution scanner',
      commandSnippet: 'python -m aegis_ai_agent --target https://api.enterprise.corp --inspect-ast --detect-sqli --detect-xss',
      owaspCoverage: ['A03: SQL Injection (CWE-89)', 'A03: Stored XSS (CWE-79)', 'A04: Insecure Design'],
      findingsCount: findings.filter((f) => f.sourceTool === 'AI Scanner' || f.sourceTool === 'Semgrep').length,
    },
  ];

  // OWASP Top 10 breakdown with live finding links
  const owaspCategories = [
    { code: 'A01:2021', name: 'Broken Access Control', cwEs: ['CWE-352', 'CWE-862', 'CWE-639'], desc: 'Violations of Principle of Least Privilege, IDOR, and unauthorized access to resources.' },
    { code: 'A02:2021', name: 'Cryptographic Failures', cwEs: ['CWE-319', 'CWE-798', 'CWE-326'], desc: 'Cleartext transmission, hardcoded private keys, and weak encryption algorithms.' },
    { code: 'A03:2021', name: 'Injection', cwEs: ['CWE-89', 'CWE-79', 'CWE-78'], desc: 'Hostile data passed into interpreters via SQL, NoSQL, OS commands, or dynamic HTML.' },
    { code: 'A04:2021', name: 'Insecure Design', cwEs: ['CWE-1336', 'CWE-20'], desc: 'Missing architectural threat models, unisolated AI prompt interfaces, and flawed logic.' },
    { code: 'A05:2021', name: 'Security Misconfiguration', cwEs: ['CWE-693', 'CWE-200', 'CWE-306'], desc: 'Unpatched flaws, default credentials, exposed debug ports, and missing security headers.' },
    { code: 'A10:2021', name: 'Server-Side Request Forgery (SSRF)', cwEs: ['CWE-918'], desc: 'Fetching remote resources without validating destination IP addresses or cloud metadata endpoints.' },
  ];

  // Real scanner execution. Only backend-allowlisted tools are accepted.
  const executeRealPenTest = async (toolToRun: string, overrideTarget?: string) => {
    const target = overrideTarget || targetUrl;
    if (!['nmap', 'wapiti'].includes(toolToRun)) {
      setToastMessage(`${toolToRun.toUpperCase()} is not connected to a real execution provider yet.`);
      setTimeout(() => setToastMessage(null), 4500);
      return;
    }
    if (!authorizationConfirmed) {
      setToastMessage('Confirm that you own or are explicitly authorized to assess this target.');
      setTimeout(() => setToastMessage(null), 4500);
      return;
    }
    setIsExecuting(true);
    setExecutingToolId(toolToRun);
    setTerminalOutput(prev => `${prev}\n\n[${new Date().toISOString()}] Starting REAL ${toolToRun.toUpperCase()} job for ${target} ...`);
    try {
      const response = await fetch('/api/pentest/run-real-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolToRun, targetUrl: target, authorizationConfirmed: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setTerminalOutput(prev => `${prev}\n\n--- REAL STDOUT ---\n${data.stdout || '(empty)'}${data.stderr ? `\n--- STDERR ---\n${data.stderr}` : ''}\n\n[Evidence SHA-256] ${data.evidence?.sha256}\n[Exit code] ${data.exitCode}`);
      setLastProbeStats({
        jobId:data.jobId, durationMs:data.durationMs, exitCode:data.exitCode,
        evidenceHash:data.evidence?.sha256, resolvedAddresses:data.resolvedAddresses,
        timestamp:data.completedAt,
      });
      setToastMessage(`${toolToRun.toUpperCase()} real execution completed. Evidence hash captured.`);
    } catch (err:any) {
      setTerminalOutput(prev => `${prev}\n[!] REAL SCAN FAILED: ${err.message || 'Unknown error'}`);
      setToastMessage(`Real scanner error: ${err.message}`);
    } finally {
      setIsExecuting(false); setExecutingToolId(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Target Configuration Bar */}
      <div className="border-b border-slate-800 pb-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="flex items-center gap-1"><Terminal className="h-3.5 w-3.5 text-cyan-400" /> REAL-TIME PENETRATION TESTING ENGINE</span>
              <span aria-hidden="true">·</span>
              <span>FASTAPI &amp; RAW SOCKET CONNECTORS</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Security Tool Integrations &amp; Live Ingestion Hub
            </h2>
            <p className="text-xs text-slate-400">
              Real Nmap and Wapiti execution with raw evidence. Other tools remain disabled until a genuine provider or source integration is configured.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real Engine: Nmap + Wapiti</span>
            </span>
          </div>
        </div>

        {/* Live Target Endpoint Configuration Strip */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Penetration Test Target (URL, Hostname or IP):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://your-authorized-target.example"
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                <span>Select Penetration Tool:</span>
              </label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-hidden focus:border-cyan-500"
              >
                <option value="wapiti">Wapiti 3.1.8 (Web DAST / Injection Fuzzer)</option>
                <option value="nmap">Nmap 7.94 (Network Perimeter &amp; TLS Ciphers)</option>
                <option value="burp" disabled>Burp Suite — NOT CONNECTED</option>
                <option value="metasploit" disabled>Metasploit — NOT CONNECTED</option>
                <option value="wireshark" disabled>Wireshark / TShark — NOT CONNECTED</option>
                <option value="semgrep" disabled>Semgrep — REQUIRES SOURCE REPOSITORY</option>
                <option value="ai-scanner" disabled>AI Scanner — ANALYSIS ONLY</option>
              </select>
            </div>

            <div className="pt-5 sm:pt-0">
              <button
                type="button"
                onClick={() => executeRealPenTest(selectedTool)}
                disabled={isExecuting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isExecuting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-slate-950" />}
                <span>{isExecuting ? `Running ${selectedTool.toUpperCase()}...` : 'Execute Live Penetration Test'}</span>
              </button>
            </div>
          </div>
            <label className="flex items-start gap-2 text-[11px] text-slate-300">
              <input type="checkbox" checked={authorizationConfirmed} onChange={(e) => setAuthorizationConfirmed(e.target.checked)} className="mt-0.5" />
              <span>I confirm I own this target or have explicit authorization to perform this security assessment.</span>
            </label>
          </div>
        </div>

      {/* Ingestion Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-cyan-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs flex-wrap">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'terminal'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Live Penetration Terminal &amp; Probes</span>
        </button>
        <button
          onClick={() => setActiveTab('connectors')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'connectors'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Network className="h-3.5 w-3.5" />
          <span>Tool Sensor Nodes (7 Connected)</span>
        </button>
        <button
          onClick={() => setActiveTab('owasp')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'owasp'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>OWASP Top 10 Dynamic Mapping</span>
        </button>
        <button
          onClick={() => setActiveTab('commands')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'commands'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>Command-Line Runner Scripts</span>
        </button>
      </div>

      {/* Tab 0: Live Penetration Testing Terminal & Network Telemetry */}
      {activeTab === 'terminal' && (
        <div className="space-y-4">
          {{/* Real execution evidence */}
          {lastProbeStats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                ['Job ID', lastProbeStats.jobId || '—'],
                ['Duration', lastProbeStats.durationMs != null ? `${lastProbeStats.durationMs} ms` : '—'],
                ['Exit Code', String(lastProbeStats.exitCode ?? '—')],
                ['Resolved IP', lastProbeStats.resolvedAddresses?.join(', ') || '—'],
                ['Evidence SHA-256', lastProbeStats.evidenceHash ? lastProbeStats.evidenceHash.slice(0, 18) + '…' : '—'],
              ].map(([label,value]) => <div key={label} className="p-3 rounded-xl bg-slate-950 border border-slate-800"><div className="text-[10px] font-mono text-slate-400 uppercase">{label}</div><div className="text-xs font-mono font-bold text-cyan-300 truncate">{value}</div></div>)}
            </div>
          )}

          {/* Interactive Bash Terminal Output Window */}}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-mono text-xs">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] text-slate-400 font-bold ml-2">
                  aegis-pentest-terminal / bash (FastAPI Control Plane Socket)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(terminalOutput);
                    setToastMessage('Terminal logs copied to clipboard.');
                    setTimeout(() => setToastMessage(null), 2000);
                  }}
                  className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy Logs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalOutput('[+] Terminal cleared. Ready for next penetration test execution.')}
                  className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <pre className="p-4 bg-slate-950 text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[460px] font-mono text-[11px] select-all">
              {terminalOutput}
            </pre>

            {
          </div>
        </div>
      )}

      {/* Tab 3: Command-Line Runner Scripts */}
      {activeTab === 'commands' && (
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Execute these real CLI commands on your local machine, Kali Linux, or CI/CD pipelines to output raw scans and push to AegisGRC:
          </p>

          <div className="space-y-4">
            {tools.map((tool) => (
              <div key={tool.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold text-[11px]">{tool.name}</span>
                  <button
                    onClick={() => copyCommand(tool.commandSnippet, tool.id)}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                  >
                    {copiedId === tool.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>Copy Command</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-200 overflow-x-auto whitespace-pre-wrap">
                  {tool.commandSnippet}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
