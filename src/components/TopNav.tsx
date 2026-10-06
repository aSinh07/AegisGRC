import React from 'react';
import { UserSession } from '../types/security';
import { CyberLogo } from './CyberLogo';
import { Shield, FileDown, Rocket, Layers, Lock, LogOut, CheckCircle2, Database, Mail } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDeployModal: () => void;
  onExportPdf: () => void;
  onOpenEmailModal?: () => void;
  userSession: UserSession | null;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenDeployModal,
  onExportPdf,
  onOpenEmailModal,
  userSession,
  onLogout,
}) => {
  const navItems = [
    { id: 'remediation', label: 'Remediation & Defense' },
    { id: 'scanner', label: 'Upload & Scan' },
    { id: 'architecture', label: 'Flowchart & Infra' },
    { id: 'vulnerabilities', label: 'Vulnerabilities & CVSS' },
    { id: 'schema_explorer', label: 'Schema Explorer' },
    { id: 'tools', label: 'Integrations' },
    { id: 'heatmap', label: 'Risk Matrix' },
    { id: 'compliance', label: 'Compliance GRC' },
    { id: 'database', label: 'Database & Sync' },
    { id: 'reports', label: 'Multi-Format Reports' },
    { id: 'assistant', label: 'AI Assistant' },
  ];

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Interactive 3D Cyber Logo */}
        <CyberLogo
          size="sm"
          showText={true}
          onClick={() => setActiveTab('remediation')}
        />

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-2.5 py-1.5 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions & User Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {userSession && (
            <div className="hidden xl:flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-200 font-semibold truncate max-w-[120px]">{userSession.name}</span>
              <span className="text-cyan-400 text-[10px]">MFA</span>
            </div>
          )}

          {onOpenEmailModal && (
            <button
              onClick={onOpenEmailModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 rounded-lg hover:bg-emerald-900 hover:text-white transition-colors whitespace-nowrap cursor-pointer shadow-sm shadow-emerald-950/40"
              title="Email Security Audit Report to Myself"
            >
              <Mail className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Email Report</span>
              <span className="sm:hidden">Email</span>
            </button>
          )}

          <button
            onClick={onExportPdf}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
            title="Download or Print Executive PDF Report (Score: 99/100)"
          >
            <FileDown className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Executive</span> PDF
          </button>

          <button
            onClick={onOpenDeployModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-lg hover:from-cyan-300 hover:to-teal-300 transition-all shadow-sm shadow-cyan-500/20 whitespace-nowrap"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Deploy</span>
          </button>

          {userSession && (
            <button
              onClick={onLogout}
              title="Lock Session / Return to Cyber Auth Gate"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-900 px-3 py-2 scrollbar-none gap-1 bg-slate-950">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
              activeTab === item.id
                ? 'bg-cyan-950/80 text-cyan-300 font-medium border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

