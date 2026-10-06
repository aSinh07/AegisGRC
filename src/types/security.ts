export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type FindingStatus = 'ACTIVE' | 'IN_REMEDIATION' | 'MITIGATED' | 'ACCEPTED_RISK' | 'FALSE_POSITIVE';

export type ScannerSourceType = 'Nmap' | 'Semgrep' | 'Nikto' | 'Wapiti' | 'BurpSuite' | 'Metasploit' | 'Wireshark' | 'Trivy' | 'Manual' | 'AI Scanner';

export interface UserSession {
  isAuthenticated: boolean;
  name: string;
  email: string;
  role: 'Lead Security Architect' | 'CISO' | 'AppSec Engineer' | 'GRC Auditor';
  mfaVerified: boolean;
  ssoProvider?: 'Okta' | 'Azure AD' | 'Google Workspace' | 'Local TOTP' | 'Microsoft Authenticator' | 'Google Authenticator';
  sessionExpiry: string;
}

export interface ToolIntegrationStatus {
  id: string;
  name: string;
  category: 'Network Recon' | 'Web DAST' | 'Web Proxy' | 'Exploit Verification' | 'Packet Inspection' | 'SAST & SCA';
  status: 'CONNECTED' | 'LISTENING' | 'IDLE' | 'STANDBY';
  endpoint: string;
  lastSync: string;
  commandSnippet: string;
  owaspCoverage: string[];
  findingsCount: number;
}

export type FrameworkId = 'iso27001' | 'iso42001' | 'dpdp' | 'soc2' | 'nist_csf' | 'pci_dss' | 'hipaa' | 'gdpr';

export interface DynamicArchitectureNode {
  id: string;
  name: string;
  role: string;
  type: 'CDN_EDGE' | 'WAF' | 'INGRESS_PROXY' | 'API_GATEWAY' | 'AUTH_SERVICE' | 'APPLICATION_BACKEND' | 'DATABASE_ENCRYPTED' | 'LLM_ISOLATED_GATEWAY' | 'EXTERNAL_WEBHOOK';
  status: 'SECURE' | 'THREAT_DETECTED' | 'MITIGATED' | 'ISOLATED';
  threats: string[];
  activeCwEs: string[];
  dataFlowIn: string;
  dataFlowOut: string;
  mitigationApplied: string;
  mappedStandards: string[];
}

export interface AuditorProfile {
  name: string;
  position: string;
  company: string;
  department?: string;
  location?: string;
  geoJurisdiction?: string;
}

export interface CompanyInfrastructure {
  targetUrl: string;
  companyName: string;
  environment: 'Production' | 'Staging' | 'DMZ Edge' | 'Internal Cloud';
  ipAddress: string;
  sslGrade: string;
  overallScore: number;
  lastScannedAt: string;
  techStack: string[];
  nodes: DynamicArchitectureNode[];
  auditor?: AuditorProfile;
}

export interface DatabaseIntegrationStatus {
  mode: 'SERVER_CLOUD' | 'LOCALHOST_OFFLINE';
  dbType: 'PostgreSQL' | 'MySQL' | 'Firebase Firestore' | 'MongoDB';
  isConnected: boolean;
  recordsCount: number;
  lastSyncTimestamp: string;
  connectionStringPreview: string;
}

export interface AuditLogbookEntry {
  id: string;
  timestamp: string;
  action: string;
  auditorName: string;
  auditorPosition: string;
  companyName: string;
  location: string;
  ipAddress: string;
  details: string;
  status: 'COMMITTED' | 'SYNCED_FIRESTORE' | 'LOCAL_CACHED';
}

export interface UploadedAssetFile {
  id: string;
  name: string;
  type: 'PDF' | 'IMAGE_TOPOLOGY' | 'QR_CODE' | 'SCAN_JSON' | 'SARIF' | 'NMAP_XML';
  sizeBytes: number;
  uploadedAt: string;
  status: 'ANALYZED' | 'PROCESSING';
  findingsCount: number;
  extractedDetails: string;
  previewUrl?: string;
}

export interface MappedControl {
  standard: string;
  controlId: string;
  controlTitle: string;
}

export interface CanonicalFinding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  cvssScore: number;
  cvssVector?: string;
  cwe: string;
  cweName?: string;
  asset: string;
  sinkOrEndpoint: string;
  sourceTool: ScannerSourceType;
  dedupHash: string;
  encryptedPayloadPreview: string;
  status: FindingStatus;
  likelihood: 1 | 2 | 3 | 4 | 5; // 1: Rare, 2: Unlikely, 3: Possible, 4: Likely, 5: Almost Certain
  impact: 1 | 2 | 3 | 4 | 5;     // 1: Negligible, 2: Minor, 3: Moderate, 4: Major, 5: Catastrophic
  mappedControls: MappedControl[];
  evidence: string;
  remediationRecommendation: string;
  detectedAt: string;
  rawPayloadSnippet?: string;
}

export interface ComplianceControl {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  mappedCWEs: string[];
  status: 'COMPLIANT' | 'GAP_DETECTED' | 'UNDER_REVIEW' | 'NOT_APPLICABLE';
  affectedFindingIds: string[];
}

export interface ComplianceFramework {
  id: FrameworkId;
  name: string;
  shortCode: string;
  version: string;
  officialTitle: string;
  description: string;
  controls: ComplianceControl[];
}

export interface IngestionScanPreset {
  id: string;
  name: string;
  tool: ScannerSourceType;
  format: 'xml' | 'json' | 'sarif';
  description: string;
  assetTarget: string;
  rawContent: string;
}

export interface SanitizationResult {
  originalText: string;
  sanitizedText: string;
  redactions: Array<{
    type: 'IP_ADDRESS' | 'API_KEY' | 'PASSWORD' | 'INTERNAL_HOST' | 'BEARER_TOKEN';
    originalValue: string;
    redactedPlaceholder: string;
  }>;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sanitizationMeta?: SanitizationResult;
  modelUsed?: string;
}
