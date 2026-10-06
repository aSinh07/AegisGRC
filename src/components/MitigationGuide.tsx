import React, { useState } from 'react';
import { MITIGATION_TECHNIQUES, MitigationTechnique } from '../data/trendData';
import { 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Code2, 
  Lock, 
  Network, 
  Bot, 
  BookOpen, 
  Copy, 
  Check, 
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Terminal,
  Zap,
  Sparkles,
  Layers
} from 'lucide-react';

interface MitigationGuideProps {
  onAskAiForPrompt: (prompt: string, cwe: string) => void;
}

export const MitigationGuide: React.FC<MitigationGuideProps> = ({ onAskAiForPrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTechnique, setActiveTechnique] = useState<MitigationTechnique>(MITIGATION_TECHNIQUES[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSimulatorIndex, setActiveSimulatorIndex] = useState<number>(0);

  const categories = [
    'ALL',
    'Injection Defense',
    'Network & Transport',
    'Authentication & Secrets',
    'AI & LLM Boundaries',
  ];

  const filteredTechniques = selectedCategory === 'ALL'
    ? MITIGATION_TECHNIQUES
    : MITIGATION_TECHNIQUES.filter((t) => t.category === selectedCategory);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const newJoinerScenarios = [
    {
      situation: 'A hardcoded JWT or Database secret was committed to Git',
      urgency: 'CRITICAL (Immediate Action)',
      whatHappened: 'Someone pasted a raw API key or signing string into a settings file and pushed to the repository.',
      theRisk: 'Git history is immutable once pushed; anyone with repo access can forge administrative sessions.',
      step1: 'Immediately revoke the secret in AWS Secrets Manager / Vault / Auth Provider.',
      step2: 'Rotate all currently active user sessions and regenerate tokens.',
      step3: 'Refactor code to load secrets via process.env.SECRET_NAME at runtime.',
      cwe: 'CWE-798',
    },
    {
      situation: 'The scanner flags "Possible SQL Injection in query parameter"',
      urgency: 'CRITICAL (24-Hour SLA)',
      whatHappened: 'A search or filter parameter is concatenated directly into a raw SQL string instead of using bind parameters.',
      theRisk: 'An attacker can append "OR 1=1" or "UNION SELECT" to read, alter, or drop entire database tables.',
      step1: 'Verify if input passes through an ORM (like SQLAlchemy or Prisma) or raw string interpolation.',
      step2: 'Replace string formatting with parameterized queries: select(User).where(User.id == input_val).',
      step3: 'Re-run Semgrep SAST to confirm zero findings.',
      cwe: 'CWE-89',
    },
    {
      situation: 'A webhook endpoint allows users to input arbitrary URLs (SSRF)',
      urgency: 'HIGH (48-Hour SLA)',
      whatHappened: 'Your server fetches an external link provided by users without checking the destination IP address.',
      theRisk: 'The attacker inputs "http://169.254.169.254/" to access the internal cloud metadata service and steal IAM instance credentials.',
      step1: 'Resolve the domain to an IP address before connecting.',
      step2: 'Block RFC 1918 (10.x, 172.16.x, 192.168.x) and link-local (169.254.x) IP ranges.',
      step3: 'Run automated Wapiti DAST fuzzing tests to ensure no internal addresses respond.',
      cwe: 'CWE-918',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>SECURITY ENGINEERING KNOWLEDGE BASE</span>
          <span aria-hidden="true">·</span>
          <span>NEW JOINER RISK &amp; MITIGATION GUIDE</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-1">
          Mitigation Architectures &amp; Situational Playbooks
        </h2>
        <p className="text-xs text-slate-400">
          Designed for developers, new joiners, and security champions to understand enterprise risk, severity levels, and code-level remediation.
        </p>
      </div>

      {/* Section 1: "How to Read Risk & Severity" (New Joiner Primer) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <BookOpen className="h-4 w-4" />
          <span>NEW JOINER PRIMER: HOW TO EVALUATE SITUATION &amp; RISK</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              1. What is CVSS Score?
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <b>Common Vulnerability Scoring System (0.0 to 10.0)</b> measures the purely technical severity:
              Is it remotely exploitable? Does it require authentication? Does it compromise Confidentiality, Integrity, or Availability?
            </p>
            <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-400 border border-slate-800">
              Score &ge; 9.0 = Critical · 7.0–8.9 = High · 4.0–6.9 = Medium
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              2. Technical Bug vs Enterprise Risk
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              A vulnerability only becomes an emergency if there is <b>Exposure + Value</b>.
              A CVSS 9.8 bug on an internal test dummy sandbox has low likelihood. The same bug on <code className="text-cyan-300">api.company.com</code> is a catastrophic emergency.
            </p>
            <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-amber-300 border border-slate-800">
              Risk = Technical Impact &times; Operational Likelihood
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              3. Remediation SLAs (Fix Deadlines)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Every company enforces Service Level Agreements (SLAs) for security tickets:
            </p>
            <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
              <li>· <span className="text-rose-400 font-bold">Critical:</span> Fix within 24 Hours</li>
              <li>· <span className="text-orange-400 font-bold">High:</span> Fix within 7 Days</li>
              <li>· <span className="text-amber-400 font-bold">Medium:</span> Fix within 30 Days</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive "New Joiner Scenario Simulator" */}
      <section className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Interactive Incident Walkthrough: "What should I do if..."</span>
            </h3>
            <p className="text-xs text-slate-400">Click a real-world scenario to see the step-by-step containment playbook</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold">Standard Operating Procedure</span>
        </div>

        {/* Scenario Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {newJoinerScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSimulatorIndex(idx)}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                activeSimulatorIndex === idx
                  ? 'border-cyan-500 bg-cyan-950/40 text-white'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold truncate">{sc.situation}</div>
              <div className="text-[10px] font-mono text-cyan-400 mt-1">{sc.cwe} · {sc.urgency}</div>
            </button>
          ))}
        </div>

        {/* Selected Scenario Details */}
        {(() => {
          const s = newJoinerScenarios[activeSimulatorIndex];
          return (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-rose-400 font-bold">{s.urgency}</span>
                <button
                  onClick={() => onAskAiForPrompt(`Provide immediate technical containment steps for: ${s.situation}`, s.cwe)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Ask AI Assistant for Custom Code Fix</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="font-semibold text-white">What actually happened:</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{s.whatHappened}</p>
                  <div className="font-semibold text-rose-300 pt-1">The Business Impact:</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{s.theRisk}</p>
                </div>

                <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px]">
                    Step-by-Step Engineering Playbook:
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-200">
                    <div className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-mono font-bold">1.</span>
                      <span>{s.step1}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-mono font-bold">2.</span>
                      <span>{s.step2}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-mono font-bold">3.</span>
                      <span>{s.step3}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Section 3: Deep-Dive Mitigation Encyclopedia */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Engineering Mitigation Blueprints</h3>
            <p className="text-xs text-slate-400">Production-grade before/after code remedies, containment steps, and verification audits</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Techniques List (Cols 1-5) */}
          <div className="lg:col-span-5 space-y-2">
            {filteredTechniques.map((tech) => {
              const isSelected = activeTechnique.id === tech.id;
              return (
                <div
                  key={tech.id}
                  onClick={() => setActiveTechnique(tech)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1 text-xs ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-950/40'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400 uppercase font-semibold">
                      {tech.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      SLA: {tech.slaRemediationHours}h
                    </span>
                  </div>
                  <div className="font-bold text-white">{tech.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{tech.cwe}</div>
                </div>
              );
            })}
          </div>

          {/* Detailed Remedy Pane (Cols 6-12) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-semibold">{activeTechnique.cwe}</span>
                <h4 className="text-base font-bold text-white mt-0.5">{activeTechnique.title}</h4>
              </div>
              <button
                onClick={() => onAskAiForPrompt(`Please provide full secure implementation code for ${activeTechnique.cwe} (${activeTechnique.title})`, activeTechnique.cwe)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI Advisor</span>
              </button>
            </div>

            {/* Plain English "Explain Like I'm New" Card */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-1">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Explain Like I'm New to the Team:</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {activeTechnique.plainEnglishExplanation}
              </p>
            </div>

            {/* Risk Scenario */}
            <div className="text-xs space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Worst-Case Threat Scenario:
              </span>
              <p className="p-2.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 leading-relaxed text-[11px]">
                {activeTechnique.riskScenario}
              </p>
            </div>

            {/* Before vs After Code Diff */}
            <div className="space-y-3">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Source Code Refactoring (Before vs. After):
              </span>

              {/* Before Code */}
              <div className="rounded-xl border border-rose-950/80 bg-slate-950 overflow-hidden text-xs font-mono">
                <div className="bg-rose-950/40 px-3 py-1.5 text-[10px] text-rose-300 border-b border-rose-900/50 flex items-center justify-between font-bold">
                  <span>❌ VULNERABLE PATTERN</span>
                  <span>DO NOT USE</span>
                </div>
                <pre className="p-3 text-rose-200 overflow-x-auto text-[11px] leading-relaxed">
                  {activeTechnique.codeSnippetBefore}
                </pre>
              </div>

              {/* After Code */}
              <div className="rounded-xl border border-emerald-950/80 bg-slate-950 overflow-hidden text-xs font-mono">
                <div className="bg-emerald-950/40 px-3 py-1.5 text-[10px] text-emerald-300 border-b border-emerald-900/50 flex items-center justify-between font-bold">
                  <span>✅ HARDENED SECURE PATTERN</span>
                  <button
                    onClick={() => copyToClipboard(activeTechnique.codeSnippetAfter, activeTechnique.id)}
                    className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-white"
                  >
                    {copiedCode === activeTechnique.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>Copy Code</span>
                  </button>
                </div>
                <pre className="p-3 text-emerald-200 overflow-x-auto text-[11px] leading-relaxed">
                  {activeTechnique.codeSnippetAfter}
                </pre>
              </div>
            </div>

            {/* Verification & Compliance Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-cyan-400 font-semibold">VERIFICATION SCAN:</div>
                <div className="text-[11px] text-slate-300">{activeTechnique.verificationAudit}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-cyan-400 font-semibold">REGULATORY CONTROL:</div>
                <div className="text-[11px] text-slate-300">{activeTechnique.standardsMapping.join(' · ')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
