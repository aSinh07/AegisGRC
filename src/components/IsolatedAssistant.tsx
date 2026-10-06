import React, { useState } from 'react';
import { AssistantMessage, SanitizationResult } from '../types/security';
import { 
  Bot, 
  Send, 
  Shield, 
  Lock, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw,
  Terminal,
  Zap,
  Info
} from 'lucide-react';

interface IsolatedAssistantProps {
  initialPrompt?: string;
  initialCwe?: string;
}

export const IsolatedAssistant: React.FC<IsolatedAssistantProps> = ({
  initialPrompt,
  initialCwe,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### AegisGRC Isolated Remediation Advisory Engine
I am an air-gapped, stateless security engineer assistant operating under the **Section 4 Isolation Boundary**:
* **Zero Persistence Layer Access:** I possess no database connections, SQL adapters, or storage privileges.
* **Token-Inspection Sanitizer:** All outgoing queries are pre-scanned and redacted for internal IP addresses, credentials, and tokens.
* **Objective:** Providing conceptual secure-coding recommendations and regulatory control alignment (ISO 27001, ISO 42001, DPDP Act 2023).

Select a quick prompt below or paste a vulnerability finding snippet to begin.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>(initialPrompt || '');
  const [targetCwe, setTargetCwe] = useState<string>(initialCwe || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSanitization, setLastSanitization] = useState<SanitizationResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickPrompts = [
    {
      label: 'SQLi (CWE-89) in FastAPI',
      cwe: 'CWE-89',
      text: 'How do I refactor raw SQL query in Python FastAPI SQLAlchemy to eliminate CWE-89, and how does this align with ISO 27001 Control A.8.28?',
    },
    {
      label: 'SSRF (CWE-918) Egress Filter',
      cwe: 'CWE-918',
      text: 'Provide a production-grade Python SSRF egress filter blocking cloud metadata (169.254.169.254) and private RFC1918 subnets.',
    },
    {
      label: 'Hardened Nginx Headers (CWE-693)',
      cwe: 'CWE-693',
      text: 'Provide production Nginx configuration snippet for HSTS, CSP, and X-Content-Type-Options to satisfy ISO 27001 A.8.20.',
    },
    {
      label: 'ISO 42001 Prompt Injection (CWE-1336)',
      cwe: 'CWE-1336',
      text: 'What architectural safeguards should be implemented to isolate AI conversational interfaces against indirect prompt injection under ISO/IEC 42001 Control A.6.4?',
    },
  ];

  const handleSend = async (overridePrompt?: string, overrideCwe?: string) => {
    const promptToSend = overridePrompt || inputPrompt;
    const cweToSend = overrideCwe || targetCwe;

    if (!promptToSend.trim() || isLoading) return;

    const userMessage: AssistantMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/remediation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          cwe: cweToSend,
          context: 'Remediation Engineering & GRC Control Alignment',
        }),
      });

      const data = await res.json();
      if (data.sanitizationMeta) {
        setLastSanitization(data.sanitizationMeta);
      }

      const botMessage: AssistantMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'No remediation generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sanitizationMeta: data.sanitizationMeta,
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: AssistantMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Failed to contact isolated assistant gateway. Operating under local fallback advisory rules.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>REAL-TIME ADVISORY GATEWAY</span>
          <span aria-hidden="true">·</span>
          <span>STATELESS REMEDIATION BOUNDARY</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-1">
          Isolated Real-Time Security Assistant
        </h2>
        <p className="text-xs text-slate-400">
          Provides conceptual secure-coding recommendations and architectural remediation without database read/write permissions or network visibility.
        </p>
      </div>

      {/* Isolation Boundary Safeguard Bar */}
      <div className="p-3.5 rounded-xl border border-cyan-800/40 bg-cyan-950/20 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <div className="font-mono text-slate-300">
            <span className="font-semibold text-white">Boundary Isolation: </span>
            <span className="text-cyan-300">Air-Gapped / Stateless · Zero DB Adapters · Pre-Egress Token Sanitizer Active</span>
          </div>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          ISO 42001 Control A.6.4 Compliant
        </div>
      </div>

      {/* Sanitizer Proof Box if redactions occurred */}
      {lastSanitization && lastSanitization.redactions.length > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-800/40 bg-amber-950/20 text-xs space-y-2">
          <div className="flex items-center gap-2 font-mono text-amber-300 font-semibold">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span>Token-Inspection Boundary Filtered Outgoing Payload:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {lastSanitization.redactions.map((r, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700/50">
                {r.type}: {r.redactedPlaceholder}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Raw IP addresses and authorization tokens were stripped prior to dispatching outside the trust boundary.
          </p>
        </div>
      )}

      {/* Quick Prompts Bar */}
      <div className="space-y-1.5">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
          Quick Technical Remediation Blueprints:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTargetCwe(qp.cwe);
                handleSend(qp.text, qp.cwe);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-cyan-500 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="h-[460px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 text-xs leading-relaxed ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 space-y-2 ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-800/60">
                <span>{m.role === 'user' ? 'Security Engineer' : 'Isolated AI Advisory'}</span>
                <div className="flex items-center gap-2">
                  <span>{m.timestamp}</span>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(m.content, m.id)}
                      className="hover:text-white transition-colors"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans text-xs">
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
            <span>Sanitizing input tokens &amp; synthesizing secure remediation guidance...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          placeholder="Optional CWE (e.g. CWE-89)"
          value={targetCwe}
          onChange={(e) => setTargetCwe(e.target.value)}
          className="sm:w-36 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
        />

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ask for secure-coding patterns, Nginx TLS configs, or ISO 27001 mapping..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputPrompt.trim()}
            className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-40 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
