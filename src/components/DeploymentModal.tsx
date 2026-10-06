import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Github, 
  Server, 
  Cloud, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  Shield,
  FileCode
} from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'free_hosting' | 'kali_agent' | 'github_actions' | 'docker'>('free_hosting');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const kaliAgentScript = `#!/usr/bin/env bash
# ==============================================================================
# AegisGRC Kali Linux Outbound Agent Runner (Section 4 Compliance)
# Zero Inbound Ports Required - Pushes scan results outbound via HTTPS + Bearer
# ==============================================================================
set -euo pipefail

CONTROL_PLANE_URL="\${AEGIS_URL:-https://your-aegis-app.run.app}"
AGENT_TOKEN="\${AEGIS_TOKEN:-ag_sec_live_98124a8f9021}"
TARGET_IP="\${1:-198.51.100.45}"

echo "[+] Starting AegisGRC Outbound Agent on Kali Linux..."
echo "[+] Target: \$TARGET_IP"
echo "[+] Central Platform: \$CONTROL_PLANE_URL"

# Step 1: Execute Nmap Network Reconnaissance (XML output)
echo "[+] Running Nmap perimeter scan..."
NMAP_OUT="/tmp/nmap_\$(date +%s).xml"
nmap -sV -sC -p 22,80,443,3306 -oX "\$NMAP_OUT" "\$TARGET_IP"

# Step 2: Push Nmap XML Outbound to Central Control Plane
echo "[+] Pushing Nmap XML to central ingestion endpoint over TLS..."
curl -s -X POST "\$CONTROL_PLANE_URL/api/ingest" \\
  -H "Authorization: Bearer \$AGENT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d @- <<EOF
{
  "tool": "Nmap",
  "asset": "\$TARGET_IP",
  "rawContent": \$(jq -Rs . < "\$NMAP_OUT")
}
EOF

echo -e "\\n[✓] Ingestion completed. Canonical SHA-256 deduplication and AES-256 encryption applied."
rm -f "\$NMAP_OUT"
`;

  const githubActionsYaml = `name: Security Audit & GRC Ingestion Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
  schedule:
    - cron: '0 2 * * 1' # Weekly Monday Audit

jobs:
  semgrep-audit:
    name: Semgrep SAST & Canonical GRC Ingest
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Run Semgrep SAST Scan
        run: |
          docker run --rm -v "\$(pwd):/src" returntocorp/semgrep:1.88.0 \\
            semgrep scan --config=auto --sarif --output=/src/semgrep-results.sarif

      - name: Push SARIF to AegisGRC Control Plane
        env:
          AEGIS_CONTROL_PLANE: \${{ secrets.AEGIS_CONTROL_PLANE_URL }}
          AEGIS_BEARER_TOKEN: \${{ secrets.AEGIS_AGENT_TOKEN }}
        run: |
          curl -X POST "\$AEGIS_CONTROL_PLANE/api/ingest" \\
            -H "Authorization: Bearer \$AEGIS_BEARER_TOKEN" \\
            -H "Content-Type: application/json" \\
            -d @- <<EOF
          {
            "tool": "Semgrep",
            "asset": "github.com/\${{ github.repository }}",
            "rawContent": \$(jq -Rs . < semgrep-results.sarif)
          }
          EOF
`;

  const dockerComposeYaml = `version: '3.8'

services:
  aegis-control-plane:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - DATABASE_URL=postgresql://aegis_usr:aegis_pwd@db:5432/aegis_grc?sslmode=disable
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=aegis_usr
      - POSTGRES_PASSWORD=aegis_pwd
      - POSTGRES_DB=aegis_grc
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

volumes:
  pgdata:
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Multi-Platform Deployment &amp; GitHub Setup</h3>
              <p className="text-xs text-slate-400">Connect to free hosting services and configure automated CI/CD runners</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('free_hosting')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'free_hosting'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Free Cloud Hosting (0 Cost)
          </button>
          <button
            onClick={() => setActiveTab('kali_agent')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'kali_agent'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kali Outbound Agent Script
          </button>
          <button
            onClick={() => setActiveTab('github_actions')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'github_actions'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            GitHub Actions CI/CD
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'docker'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Docker Compose
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'free_hosting' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              You can deploy this complete project with zero hosting fees on standard developer free-tier platforms:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>1. Render.com / Railway</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">FREE TIER</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Deploy Web Service directly from your GitHub repo. Set build command to <code className="text-cyan-300">npm run build</code> and start command to <code className="text-cyan-300">npm run start</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>2. Vercel / Cloudflare Pages</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">FREE TIER</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Instant global edge frontend deployment. Connect GitHub repo, Vercel auto-detects Vite. Serverless API routes mount seamlessly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>3. Supabase / Neon (PostgreSQL 15+)</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">FREE TIER</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Managed PostgreSQL 15+ database with SSL/TLS enforced. Provides persistent storage for canonical finding records and audit logs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>4. Google Cloud Run</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">FREE QUOTA</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Serverless container execution scale-to-zero. 2 million free requests per month, ideal for executive demos and production.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 text-[11px]">
              <b>GitHub Showcase Step:</b> Push this code into a new GitHub repository (<code className="text-white">git init &amp;&amp; git push -u origin main</code>) and add the repository link in your project portfolio!
            </div>
          </div>
        )}

        {activeTab === 'kali_agent' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono">agent_runner.sh (Outbound TLS Push Node)</span>
              <button
                onClick={() => copyCode(kaliAgentScript, 'kali')}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-white"
              >
                {copiedId === 'kali' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy Script</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-[300px]">
              {kaliAgentScript}
            </pre>
          </div>
        )}

        {activeTab === 'github_actions' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono">.github/workflows/security-audit.yml</span>
              <button
                onClick={() => copyCode(githubActionsYaml, 'gha')}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-white"
              >
                {copiedId === 'gha' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy YAML</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-[300px]">
              {githubActionsYaml}
            </pre>
          </div>
        )}

        {activeTab === 'docker' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono">docker-compose.yml</span>
              <button
                onClick={() => copyCode(dockerComposeYaml, 'compose')}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-white"
              >
                {copiedId === 'compose' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy Compose</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-[300px]">
              {dockerComposeYaml}
            </pre>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
