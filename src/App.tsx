import React, { useState } from 'react';
import { 
  CanonicalFinding, 
  ComplianceControl, 
  UserSession, 
  CompanyInfrastructure,
  DatabaseIntegrationStatus,
  AuditLogbookEntry
} from './types/security';
import { INITIAL_FINDINGS, INITIAL_COMPANY_INFRASTRUCTURE } from './data/canonicalData';
import { TopNav } from './components/TopNav';
import { CyberAuthPortal } from './components/CyberAuthPortal';
import { InfrastructureScanner } from './components/InfrastructureScanner';
import { DynamicArchitectureFlowchart } from './components/DynamicArchitectureFlowchart';
import { ToolsIntegrationHub } from './components/ToolsIntegrationHub';
import { VulnerabilityControlPlane } from './components/VulnerabilityControlPlane';
import { RiskHeatmapMatrix } from './components/RiskHeatmapMatrix';
import { ComplianceMatrix } from './components/ComplianceMatrix';
import { IsolatedAssistant } from './components/IsolatedAssistant';
import { DatabaseLogbookHub } from './components/DatabaseLogbookHub';
import { FloatingCyberBot } from './components/FloatingCyberBot';
import { DeploymentModal } from './components/DeploymentModal';
import { DatabaseSchemaExplorer } from './components/DatabaseSchemaExplorer';
import { RemediationDefenseHub } from './components/RemediationDefenseHub';
import { MultiFormatReportSuite } from './components/MultiFormatReportSuite';
import { Cyber3DGeometricScene } from './components/Cyber3DGeometricScene';
import { SendEmailReportModal } from './components/SendEmailReportModal';
import { Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const [activeTab, setActiveTab] = useState<string>('remediation');
  const [findings, setFindings] = useState<CanonicalFinding[]>(INITIAL_FINDINGS);
  const [currentInfra, setCurrentInfra] = useState<CompanyInfrastructure>(INITIAL_COMPANY_INFRASTRUCTURE);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [assistantPrompt, setAssistantPrompt] = useState<string>('');
  const [assistantCwe, setAssistantCwe] = useState<string>('');

  const [dbStatus, setDbStatus] = useState<DatabaseIntegrationStatus>({
    mode: 'SERVER_CLOUD',
    dbType: 'Firebase Firestore',
    isConnected: true,
    recordsCount: 48,
    lastSyncTimestamp: 'Just now (Real-Time)',
    connectionStringPreview: 'firestore.googleapis.com/v1/projects/stately-icon-d6tvw',
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogbookEntry[]>([
    {
      id: 'log-1',
      timestamp: 'Today at 12:48:10',
      action: 'FIREBASE_FIRESTORE_PROVISIONED',
      auditorName: 'AmanDev',
      auditorPosition: 'Chief Information Security Officer (CISO)',
      companyName: INITIAL_COMPANY_INFRASTRUCTURE.companyName,
      location: 'Bangalore Data Center / Mumbai Hub',
      ipAddress: INITIAL_COMPANY_INFRASTRUCTURE.ipAddress,
      details: 'Provisioned Firebase Firestore database instance ai-studio-unifiedsecurityg-be9e7373 with zero-trust security rules and schema validation.',
      status: 'SYNCED_FIRESTORE',
    },
    {
      id: 'log-2',
      timestamp: 'Today at 12:45:14',
      action: 'INFRASTRUCTURE_SCAN_COMMITTED',
      auditorName: 'AmanDev',
      auditorPosition: 'Chief Information Security Officer (CISO)',
      companyName: INITIAL_COMPANY_INFRASTRUCTURE.companyName,
      location: 'Bangalore Data Center / Mumbai Hub',
      ipAddress: INITIAL_COMPANY_INFRASTRUCTURE.ipAddress,
      details: `Generated 6-tier architecture for ${INITIAL_COMPANY_INFRASTRUCTURE.targetUrl}. Analyzed CWE-89 SQLi and CWE-79 XSS threat vectors.`,
      status: 'SYNCED_FIRESTORE',
    },
    {
      id: 'log-3',
      timestamp: 'Today at 12:40:02',
      action: 'MFA_TOTP_VERIFICATION',
      auditorName: 'AmanDev',
      auditorPosition: 'Chief Information Security Officer (CISO)',
      companyName: INITIAL_COMPANY_INFRASTRUCTURE.companyName,
      location: 'Bangalore Data Center / Mumbai Hub',
      ipAddress: '198.51.100.82',
      details: 'Google Authenticator 6-digit TOTP authenticated under RFC 6238 token window.',
      status: 'SYNCED_FIRESTORE',
    },
  ]);

  // If user explicitly signed out, show the CyberAuthPortal
  if (!userSession) {
    return (
      <CyberAuthPortal
        onLoginSuccess={(sess) => setUserSession(sess)}
        onBypassDemo={() => {
          setUserSession({
            isAuthenticated: true,
            name: 'AmanDev',
            email: 'aman.dev@enterprise.corp',
            role: 'Lead Security Architect',
            mfaVerified: true,
            ssoProvider: 'Google Authenticator',
            sessionExpiry: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
          });
        }}
      />
    );
  }

  const handleAskAiForFinding = (finding: CanonicalFinding) => {
    setAssistantPrompt(
      `Please provide an isolated, production-grade remediation plan for ${finding.cwe} (${finding.title}) located at sink: ${finding.sinkOrEndpoint}. Explain how to verify the fix and align with ISO 27001 / DPDP Act controls.`
    );
    setAssistantCwe(finding.cwe);
    setActiveTab('assistant');
  };

  const handleAskAiForControl = (control: ComplianceControl, standardName: string) => {
    setAssistantPrompt(
      `How can an enterprise engineering team audit and remediate gaps under ${standardName} Control ${control.code} (${control.title})? Address associated vulnerability classes: ${control.mappedCWEs.join(', ')}.`
    );
    setAssistantCwe(control.mappedCWEs[0] || 'GRC-AUDIT');
    setActiveTab('assistant');
  };

  const handleAskAiForPrompt = (prompt: string, cwe: string) => {
    setAssistantPrompt(prompt);
    setAssistantCwe(cwe);
    setActiveTab('assistant');
  };

  const handleSelectFindingFromAnywhere = (finding: CanonicalFinding) => {
    setActiveTab('vulnerabilities');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onExportPdf={() => setActiveTab('print_report')}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        userSession={userSession}
        onLogout={() => setUserSession(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Remediation & Defense Hub (Default Landing Tab) */}
        {activeTab === 'remediation' && (
          <div className="space-y-6">
            {/* Live 3D Geometric UI/UX Lattice per User Request */}
            <Cyber3DGeometricScene compact={false} />
            <RemediationDefenseHub
              onAskAiForPrompt={handleAskAiForPrompt}
              infra={currentInfra}
              onUpdateInfra={setCurrentInfra}
              findings={findings}
              onUpdateFindings={setFindings}
              onAddAuditLog={(entry) => setAuditLogs((prev) => [entry, ...prev])}
            />
          </div>
        )}

        {/* Database Schema Explorer Tab per User Request */}
        {activeTab === 'schema_explorer' && (
          <DatabaseSchemaExplorer
            findings={findings}
            infra={currentInfra}
            logs={auditLogs}
          />
        )}

        {/* Multi-Format Report Suite (PDF, DOC, PPT, CSV, TXT) per User Request */}
        {activeTab === 'reports' && (
          <MultiFormatReportSuite
            findings={findings}
            infra={currentInfra}
            onBack={() => setActiveTab('remediation')}
          />
        )}

        {activeTab === 'scanner' && (
          <InfrastructureScanner
            currentInfra={currentInfra}
            onUpdateInfra={(newInfra) => setCurrentInfra(newInfra)}
            onAddFindings={(newF) => setFindings((prev) => [...newF, ...prev])}
            onNavigateToArchitecture={() => setActiveTab('architecture')}
          />
        )}

        {activeTab === 'architecture' && (
          <DynamicArchitectureFlowchart
            infra={currentInfra}
            onSelectCwe={(cwe) => handleAskAiForPrompt(`Please provide a production-grade mitigation plan for ${cwe} in ${currentInfra.companyName}'s architecture. Explain remediation, test plan, and regulatory compliance under ISO 27001 / DPDP Act.`, cwe)}
            onOpenAiAssistant={handleAskAiForPrompt}
          />
        )}

        {activeTab === 'vulnerabilities' && (
          <VulnerabilityControlPlane
            findings={findings}
            setFindings={setFindings}
            onAskAiForFinding={handleAskAiForFinding}
            onOpenMitigationGuide={() => {
              setActiveTab('remediation');
            }}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsIntegrationHub
            findings={findings}
            setFindings={setFindings}
            onOpenFindingDetails={() => {
              setActiveTab('vulnerabilities');
            }}
          />
        )}

        {activeTab === 'heatmap' && (
          <RiskHeatmapMatrix
            findings={findings}
            onSelectFinding={handleSelectFindingFromAnywhere}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceMatrix
            findings={findings}
            onSelectFinding={handleSelectFindingFromAnywhere}
            onAskAiForControl={handleAskAiForControl}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseLogbookHub
            logs={auditLogs}
            dbStatus={dbStatus}
            onToggleDbMode={(newMode) => {
              setDbStatus((prev) => ({
                ...prev,
                mode: newMode,
                dbType: newMode === 'SERVER_CLOUD' ? 'Firebase Firestore' : 'PostgreSQL',
                connectionStringPreview: newMode === 'SERVER_CLOUD'
                  ? 'firestore.googleapis.com/v1/projects/stately-icon-d6tvw'
                  : 'postgresql://aegis_admin:***@localhost:5432/aegis_grc_audit',
                lastSyncTimestamp: 'Just now',
              }));
            }}
            onRefreshLogs={() => {
              setDbStatus((prev) => ({
                ...prev,
                lastSyncTimestamp: 'Synchronized Just Now',
                recordsCount: prev.recordsCount + 1,
              }));
            }}
          />
        )}

        {activeTab === 'assistant' && (
          <IsolatedAssistant
            initialPrompt={assistantPrompt}
            initialCwe={assistantCwe}
          />
        )}
      </main>

      {/* Floating Interactive Pop-up Chatbot with Voice Conversations */}
      <FloatingCyberBot />

      {/* Multi-Platform Deployment Modal */}
      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Zero-Trust Email Report Dispatch Modal */}
      <SendEmailReportModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        infra={currentInfra}
        findings={findings}
        defaultEmail="aman20dev05@gmail.com"
      />

      {/* Corporate Technical Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">AegisGRC Control Plane</span>
            <span>·</span>
            <span>&copy; 2026 AmanDev. All Rights Reserved. Proprietary Architectural Design &amp; Intellectual Property.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>ISO/IEC 27001:2022</span>
            <span>·</span>
            <span>ISO/IEC 42001:2023</span>
            <span>·</span>
            <span>DPDP Act 2023</span>
            <span>·</span>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Open Deployment Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
