import React, { useState } from 'react';
import { CompanyInfrastructure, DynamicArchitectureNode } from '../types/security';
import { 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Server, 
  Database, 
  Bot, 
  Globe2, 
  Cpu, 
  Network,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Code2,
  FileCheck2,
  Terminal,
  AlertTriangle
} from 'lucide-react';

interface DynamicArchitectureFlowchartProps {
  infra: CompanyInfrastructure;
  onSelectCwe: (cwe: string) => void;
  onOpenAiAssistant: (prompt: string, cwe: string) => void;
}

export const DynamicArchitectureFlowchart: React.FC<DynamicArchitectureFlowchartProps> = ({
  infra,
  onSelectCwe,
  onOpenAiAssistant,
}) => {
  const [selectedNode, setSelectedNode] = useState<DynamicArchitectureNode>(
    infra.nodes[2] || infra.nodes[0] // Default to Core API microservices
  );

  const getNodeIcon = (type: DynamicArchitectureNode['type']) => {
    switch (type) {
      case 'CDN_EDGE':
      case 'WAF':
        return <Globe2 className="h-5 w-5 text-cyan-400" />;
      case 'INGRESS_PROXY':
        return <Server className="h-5 w-5 text-blue-400" />;
      case 'APPLICATION_BACKEND':
      case 'API_GATEWAY':
        return <Cpu className="h-5 w-5 text-indigo-400" />;
      case 'DATABASE_ENCRYPTED':
        return <Database className="h-5 w-5 text-emerald-400" />;
      case 'LLM_ISOLATED_GATEWAY':
        return <Bot className="h-5 w-5 text-teal-400" />;
      case 'EXTERNAL_WEBHOOK':
        return <Network className="h-5 w-5 text-amber-400" />;
      default:
        return <Layers className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>LIVE DATA FLOW &amp; SYSTEM ARCHITECTURE</span>
            <span aria-hidden="true">·</span>
            <span>TAILORED INFRASTRUCTURE TOPOLOGY</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Dynamic Architecture Diagram &amp; Threat Flowchart
          </h2>
          <p className="text-xs text-slate-400">
            Real-time visual map of <span className="text-cyan-300 font-semibold">{infra.companyName}</span> ({infra.targetUrl}) showing each tier's data in/out, threat exposure, and GRC controls.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>IP: <b className="text-white">{infra.ipAddress}</b></span>
          <span>·</span>
          <span>SSL: <b className="text-emerald-400">{infra.sslGrade}</b></span>
        </div>
      </div>

      {/* Main Interactive Flowchart Canvas */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
          <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
            Data Flow Pipeline: Ingress ➔ API Compute ➔ Encrypted Storage &amp; AI
          </span>
          <span className="font-mono text-cyan-400">Click any tier to inspect threats &amp; mitigations</span>
        </div>

        {/* Visual Pipeline Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {infra.nodes.map((node, idx) => {
            const isSelected = selectedNode.id === node.id;
            const hasThreats = node.threats.length > 0 && node.status !== 'SECURE' && node.status !== 'ISOLATED';

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                    : hasThreats
                    ? 'border-rose-900/50 bg-rose-950/10 hover:border-rose-700/60'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                {/* Node Step Index & Status Badge */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">Tier 0{idx + 1}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    node.status === 'SECURE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                      : node.status === 'ISOLATED'
                      ? 'bg-teal-950 text-teal-300 border border-teal-800/80'
                      : 'bg-rose-950 text-rose-300 border border-rose-800/80'
                  }`}>
                    {node.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Node Title & Type */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                    {getNodeIcon(node.type)}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white leading-tight">{node.name}</h4>
                    <p className="text-[11px] text-slate-400">{node.role}</p>
                  </div>
                </div>

                {/* Active Threat Chips */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Active Vulnerability Exposure:</div>
                  <div className="flex flex-wrap gap-1">
                    {node.activeCwEs.map((cwe, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCwe(cwe);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 hover:text-white hover:border-cyan-500 transition-colors"
                      >
                        {cwe}
                      </button>
                    ))}
                    {node.threats.length === 0 && (
                      <span className="text-[10px] font-mono text-emerald-400">Zero Critical Sinks</span>
                    )}
                  </div>
                </div>

                {/* Flow In & Out Summary */}
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-0.5">
                  <div className="truncate">◀ In: <span className="text-slate-300">{node.dataFlowIn}</span></div>
                  <div className="truncate">▶ Out: <span className="text-slate-300">{node.dataFlowOut}</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ASCII Flowchart Connection Ribbon */}
        <div className="p-3 rounded-lg bg-slate-900/90 font-mono text-[10px] text-slate-300 border border-slate-800 overflow-x-auto leading-relaxed">
          <div className="text-cyan-400 font-bold mb-0.5">// ARCHITECTURAL DATA TRANSMISSION PIPELINE:</div>
          <div>[Clients] ➔ [Cloudflare Edge WAF] ➔ [TLS Ingress Proxy] ➔ [FastAPI Core API] ➔ [PostgreSQL DB (AES-256)]</div>
          <div>                                                                    │</div>
          <div>                                                ┌───────────────────┴───────────────────┐</div>
          <div>                                                ▼                                       ▼</div>
          <div>                              [Stateless Gemini LLM Boundary]          [Outbound Webhooks (SSRF Filter)]</div>
        </div>
      </div>

      {/* Selected Node Detailed Inspector */}
      {selectedNode && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>TIER INSPECTOR</span>
                <span aria-hidden="true">·</span>
                <span>{selectedNode.type}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{selectedNode.name}</h3>
              <p className="text-xs text-slate-300">{selectedNode.role}</p>
            </div>

            <button
              onClick={() => onOpenAiAssistant(
                `Provide deep technical architecture hardening advice for ${selectedNode.name} (${selectedNode.role}) addressing threat vectors: ${selectedNode.threats.join(', ')}.`,
                selectedNode.activeCwEs[0] || 'ARCH'
              )}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-sm shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI for Hardening Blueprint</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Threats & Data Flow */}
            <div className="space-y-4">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Potential Attack Sinks &amp; Exploitation Vectors:
                </span>
                <div className="mt-1 space-y-1.5">
                  {selectedNode.threats.map((threat, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-200"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{threat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Data Transmission Handshake:
                </span>
                <div className="mt-1 p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] space-y-1 border border-slate-800">
                  <div className="text-slate-300">Inbound Egress: <span className="text-cyan-300">{selectedNode.dataFlowIn}</span></div>
                  <div className="text-slate-300">Outbound Forward: <span className="text-amber-300">{selectedNode.dataFlowOut}</span></div>
                </div>
              </div>
            </div>

            {/* Right: Technical Mitigations & GRC Alignment */}
            <div className="space-y-4">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Active Security Mitigation Control:
                </span>
                <p className="mt-1 p-3 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 font-mono text-[11px] leading-relaxed">
                  {selectedNode.mitigationApplied}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Mapped Regulatory Standards &amp; Controls:
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedNode.mappedStandards.map((std, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300"
                    >
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
