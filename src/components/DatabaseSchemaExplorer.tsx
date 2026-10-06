import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Key, 
  Link2, 
  Lock, 
  ShieldCheck, 
  FileCode, 
  Copy, 
  Check, 
  Search, 
  Table, 
  ArrowRight, 
  Terminal, 
  Sparkles,
  Server,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Info,
  Filter
} from 'lucide-react';
import { CanonicalFinding, CompanyInfrastructure, AuditLogbookEntry } from '../types/security';

interface DatabaseSchemaExplorerProps {
  findings?: CanonicalFinding[];
  infra?: CompanyInfrastructure;
  logs?: AuditLogbookEntry[];
}

export const DatabaseSchemaExplorer: React.FC<DatabaseSchemaExplorerProps> = ({
  findings = [],
  infra,
  logs = [],
}) => {
  const [activeModel, setActiveModel] = useState<'erd' | 'postgres' | 'firestore' | 'mysql' | 'dictionary'>('erd');
  const [selectedEntity, setSelectedEntity] = useState<string>('vulnerability_findings');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState<string>(
    `SELECT f.cwe, f.title, f.cvss_score, f.severity, i.target_url, i.company_name\nFROM vulnerability_findings f\nJOIN infrastructure_scans i ON f.scan_id = i.id\nWHERE f.severity = 'CRITICAL'\nORDER BY f.cvss_score DESC;`
  );
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExecuteQuery = () => {
    setIsExecutingQuery(true);
    setTimeout(() => {
      setQueryResult([
        {
          cwe: 'CWE-89',
          title: 'Second-Order SQL Injection in Analytics Parameter',
          cvss_score: 9.8,
          severity: 'CRITICAL',
          target_url: infra?.targetUrl || 'https://api.enterprise.corp',
          company_name: infra?.companyName || 'AEGIS ENTERPRISE GRC',
        },
        {
          cwe: 'CWE-798',
          title: 'Hardcoded Cryptographic Key in JWT Verification Stub',
          cvss_score: 9.1,
          severity: 'CRITICAL',
          target_url: infra?.targetUrl || 'https://api.enterprise.corp',
          company_name: infra?.companyName || 'AEGIS ENTERPRISE GRC',
        },
      ]);
      setIsExecutingQuery(false);
    }, 450);
  };

  // Schema Definitions
  const schemaEntities = [
    {
      id: 'infrastructure_scans',
      tableName: 'infrastructure_scans',
      firestorePath: '/grcAudits/{auditId}',
      type: 'Primary Aggregate Root',
      description: 'Stores scanned domain endpoints, target company identity, tech stack topology, and overall risk scores.',
      relationships: [
        { target: 'vulnerability_findings', type: '1-to-Many', foreignKey: 'scan_id', description: 'One scan yields multiple findings' },
        { target: 'audit_logbook', type: '1-to-Many', foreignKey: 'target_id', description: 'All actions on this asset logged' },
      ],
      columns: [
        { name: 'id', type: 'UUID (PK)', nullable: false, encrypted: false, desc: 'Primary key unique scan identifier' },
        { name: 'target_url', type: 'VARCHAR(512)', nullable: false, encrypted: false, desc: 'Target domain or API hostname' },
        { name: 'company_name', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Target enterprise entity name' },
        { name: 'auditor_name', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Name of the certified auditor / publisher' },
        { name: 'auditor_position', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Official designation (e.g. CISO)' },
        { name: 'environment', type: 'VARCHAR(64)', nullable: false, encrypted: false, desc: 'Production / Staging / Edge DMZ' },
        { name: 'ip_address', type: 'INET / VARCHAR(45)', nullable: true, encrypted: false, desc: 'Resolved IP address' },
        { name: 'ssl_grade', type: 'VARCHAR(16)', nullable: true, encrypted: false, desc: 'TLS 1.3 handshake grade (e.g. A+)' },
        { name: 'overall_score', type: 'INTEGER', nullable: false, encrypted: false, desc: 'Composite GRC hygiene score (0-100)' },
        { name: 'geo_jurisdiction', type: 'VARCHAR(128)', nullable: true, encrypted: false, desc: 'Location / GPS coordinate boundary' },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, encrypted: false, desc: 'Server authoritative creation timestamp' },
      ],
    },
    {
      id: 'vulnerability_findings',
      tableName: 'vulnerability_findings',
      firestorePath: '/grcAudits/{auditId}/findings/{findingId}',
      type: 'Core Vulnerability Record',
      description: 'Normalized security weaknesses correlating DAST, SAST, network recon, and LLM prompt risks with CVSS metrics.',
      relationships: [
        { target: 'infrastructure_scans', type: 'Many-to-1', foreignKey: 'scan_id', description: 'Belongs to an infrastructure scan' },
        { target: 'remediation_playbooks', type: 'Many-to-1', foreignKey: 'cwe_id', description: 'Links to verified remediation guidance' },
      ],
      columns: [
        { name: 'id', type: 'UUID (PK)', nullable: false, encrypted: false, desc: 'Primary key finding identifier' },
        { name: 'scan_id', type: 'UUID (FK)', nullable: false, encrypted: false, desc: 'Foreign key to infrastructure_scans.id' },
        { name: 'cwe', type: 'VARCHAR(32)', nullable: false, encrypted: false, desc: 'Common Weakness Enumeration (e.g. CWE-89)' },
        { name: 'title', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Vulnerability title' },
        { name: 'severity', type: 'VARCHAR(16)', nullable: false, encrypted: false, desc: 'CRITICAL / HIGH / MEDIUM / LOW' },
        { name: 'cvss_score', type: 'NUMERIC(3,1)', nullable: false, encrypted: false, desc: 'CVSS v3.1 Base Score (0.0 to 10.0)' },
        { name: 'cvss_vector', type: 'VARCHAR(128)', nullable: false, encrypted: false, desc: 'Standard CVSS vector string' },
        { name: 'asset', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Vulnerable service or database endpoint' },
        { name: 'sink_or_endpoint', type: 'TEXT', nullable: false, encrypted: true, desc: 'AES-256 GCM encrypted endpoint and parameter' },
        { name: 'source_tool', type: 'VARCHAR(64)', nullable: false, encrypted: false, desc: 'Scanner: Wapiti, Burp, Nmap, Semgrep, AI' },
        { name: 'dedup_hash', type: 'CHAR(64) UNIQUE', nullable: false, encrypted: false, desc: 'SHA-256 hash for deduplication' },
        { name: 'encrypted_payload_aes256', type: 'TEXT', nullable: true, encrypted: true, desc: 'Encrypted proof-of-concept payload' },
        { name: 'status', type: 'VARCHAR(32)', nullable: false, encrypted: false, desc: 'ACTIVE / IN_REMEDIATION / MITIGATED' },
        { name: 'remediation_plan', type: 'TEXT', nullable: false, encrypted: false, desc: 'Technical fix procedure' },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, encrypted: false, desc: 'Discovery timestamp' },
      ],
    },
    {
      id: 'audit_logbook',
      tableName: 'audit_logbook',
      firestorePath: '/accessLogs/{logId}',
      type: 'Tamper-Evident Audit Trail',
      description: 'Append-only ledger tracking all authentication, scans, export actions, and GPS location fingerprints.',
      relationships: [
        { target: 'user_profiles', type: 'Many-to-1', foreignKey: 'user_id', description: 'Logged against authorized user' },
        { target: 'infrastructure_scans', type: 'Many-to-1', foreignKey: 'target_id', description: 'Associated scanned resource' },
      ],
      columns: [
        { name: 'id', type: 'UUID (PK)', nullable: false, encrypted: false, desc: 'Unique log entry identifier' },
        { name: 'user_id', type: 'UUID / TEXT (FK)', nullable: false, encrypted: false, desc: 'Firebase Auth UID of the actor' },
        { name: 'action', type: 'VARCHAR(128)', nullable: false, encrypted: false, desc: 'Action: SCAN_EXECUTED, PDF_EXPORTED, MFA_VERIFIED' },
        { name: 'auditor_name', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Publisher name for non-repudiation' },
        { name: 'auditor_position', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Publisher role or designation' },
        { name: 'company_name', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Corporate organization' },
        { name: 'location', type: 'VARCHAR(160)', nullable: false, encrypted: false, desc: 'GPS / Data center coordinates' },
        { name: 'ip_address', type: 'VARCHAR(45)', nullable: false, encrypted: false, desc: 'Source IP for breach forensics' },
        { name: 'status', type: 'VARCHAR(32)', nullable: false, encrypted: false, desc: 'SYNCED_FIRESTORE / COMMITTED' },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, encrypted: false, desc: 'Server authoritative immutable timestamp' },
      ],
    },
    {
      id: 'user_profiles',
      tableName: 'user_profiles',
      firestorePath: '/userProfiles/{userId}',
      type: 'Identity & Zero Trust Access',
      description: 'Stores security architect credentials, verified MFA secrets, and role-based permissions.',
      relationships: [
        { target: 'audit_logbook', type: '1-to-Many', foreignKey: 'user_id', description: 'User generates multiple audit events' },
      ],
      columns: [
        { name: 'id', type: 'UUID / TEXT (PK)', nullable: false, encrypted: false, desc: 'Firebase Auth UID' },
        { name: 'email', type: 'VARCHAR(255) UNIQUE', nullable: false, encrypted: false, desc: 'Enterprise email address' },
        { name: 'display_name', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Full legal name (e.g. AmanDev)' },
        { name: 'position', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Lead Architect / CISO' },
        { name: 'company_name', type: 'VARCHAR(255)', nullable: false, encrypted: false, desc: 'Company name' },
        { name: 'mfa_method', type: 'VARCHAR(64)', nullable: false, encrypted: false, desc: 'google_authenticator / microsoft_authenticator' },
        { name: 'mfa_verified', type: 'BOOLEAN', nullable: false, encrypted: false, desc: 'Zero-trust TOTP verified status' },
        { name: 'last_login', type: 'TIMESTAMPTZ', nullable: false, encrypted: false, desc: 'Timestamp of last verified session' },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, encrypted: false, desc: 'Account provisioning timestamp' },
      ],
    },
  ];

  const currentEntityData = schemaEntities.find((e) => e.id === selectedEntity) || schemaEntities[0];

  const postgresDDL = `-- ====================================================================
-- PostgreSQL 15 Enterprise Schema with AES-256-GCM Storage & Foreign Keys
-- Author: AmanDev | Project: AegisGRC Control Plane
-- Copyright (c) 2026 AmanDev. All Rights Reserved.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Profiles & Zero Trust Identity
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL DEFAULT 'Lead Security Architect',
    company_name VARCHAR(255) NOT NULL,
    mfa_method VARCHAR(64) NOT NULL DEFAULT 'google_authenticator',
    mfa_verified BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Infrastructure Configurations (Scan Root)
CREATE TABLE infrastructure_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE RESTRICT,
    target_url VARCHAR(512) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    auditor_name VARCHAR(255) NOT NULL,
    auditor_position VARCHAR(255) NOT NULL,
    environment VARCHAR(64) NOT NULL DEFAULT 'Production',
    ip_address INET,
    ssl_grade VARCHAR(16) DEFAULT 'A+',
    overall_score INT NOT NULL DEFAULT 85 CHECK (overall_score BETWEEN 0 AND 100),
    geo_jurisdiction VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Normalized Vulnerability Findings
CREATE TABLE vulnerability_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES infrastructure_scans(id) ON DELETE CASCADE,
    cwe VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
    cvss_score NUMERIC(3,1) NOT NULL CHECK (cvss_score BETWEEN 0.0 AND 10.0),
    cvss_vector VARCHAR(128) NOT NULL,
    asset VARCHAR(255) NOT NULL,
    sink_or_endpoint TEXT NOT NULL,
    source_tool VARCHAR(64) NOT NULL,
    dedup_hash CHAR(64) UNIQUE NOT NULL,
    encrypted_payload_aes256 TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    remediation_plan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tamper-Evident Audit Logbook
CREATE TABLE audit_logbook (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE RESTRICT,
    scan_id UUID REFERENCES infrastructure_scans(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    auditor_name VARCHAR(255) NOT NULL,
    auditor_position VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(160) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    details TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'COMMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for High-Velocity Queries
CREATE INDEX idx_findings_scan_id ON vulnerability_findings(scan_id);
CREATE INDEX idx_findings_severity ON vulnerability_findings(severity);
CREATE INDEX idx_findings_cwe ON vulnerability_findings(cwe);
CREATE INDEX idx_audit_created_at ON audit_logbook(created_at DESC);`;

  const firestoreSchemaJson = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AegisGRC_Firestore_Schema_AmanDev",
  "description": "Zero-trust NoSQL schema definition for Google Cloud Firebase Firestore",
  "collections": {
    "/userProfiles/{userId}": {
      "type": "object",
      "required": ["userId", "displayName", "email", "role", "companyName", "mfaMethod", "mfaEnabled", "createdAt"],
      "properties": {
        "userId": { "type": "string", "maxLength": 128 },
        "displayName": { "type": "string", "maxLength": 120 },
        "email": { "type": "string", "maxLength": 160 },
        "role": { "type": "string", "maxLength": 80 },
        "companyName": { "type": "string", "maxLength": 120 },
        "mfaMethod": { "type": "string", "enum": ["google_authenticator", "microsoft_authenticator"] },
        "mfaEnabled": { "type": "boolean" },
        "createdAt": { "type": "string", "format": "date-time" }
      }
    },
    "/grcAudits/{auditId}": {
      "type": "object",
      "required": ["auditId", "userId", "auditorName", "auditorPosition", "companyName", "targetUrl", "storageMode", "createdAt"],
      "properties": {
        "auditId": { "type": "string", "maxLength": 128 },
        "userId": { "type": "string", "maxLength": 128 },
        "auditorName": { "type": "string", "maxLength": 120 },
        "auditorPosition": { "type": "string", "maxLength": 80 },
        "companyName": { "type": "string", "maxLength": 120 },
        "targetUrl": { "type": "string", "maxLength": 255 },
        "storageMode": { "type": "string", "enum": ["cloud", "local"] },
        "locationSummary": { "type": "string", "maxLength": 160 },
        "riskScore": { "type": "string", "maxLength": 10 },
        "createdAt": { "type": "string", "format": "date-time" }
      }
    },
    "/accessLogs/{logId}": {
      "type": "object",
      "required": ["logId", "userId", "userName", "action", "createdAt"],
      "properties": {
        "logId": { "type": "string", "maxLength": 128 },
        "userId": { "type": "string", "maxLength": 128 },
        "userName": { "type": "string", "maxLength": 120 },
        "action": { "type": "string", "maxLength": 60 },
        "geoLocation": { "type": "string", "maxLength": 160 },
        "createdAt": { "type": "string", "format": "date-time" }
      }
    }
  }
}`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Database Schema Explorer
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Relational &amp; NoSQL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing PostgreSQL and Firebase Firestore data models, relational foreign keys, field-level encryption, and audit persistence.
          </p>
        </div>

        {/* Watermark & Copyright Badge per User Directive */}
        <div className="flex items-center gap-2 text-right">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Intellectual Property</span>
            <span className="text-cyan-300 font-bold">&copy; 2026 AmanDev. All Rights Reserved.</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setActiveModel('erd')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeModel === 'erd'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Visual ERD Diagram</span>
        </button>

        <button
          onClick={() => setActiveModel('postgres')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeModel === 'postgres'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          <span>PostgreSQL 15 DDL</span>
        </button>

        <button
          onClick={() => setActiveModel('firestore')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeModel === 'firestore'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Cloud className="h-3.5 w-3.5" />
          <span>Firestore NoSQL Schema</span>
        </button>

        <button
          onClick={() => setActiveModel('dictionary')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeModel === 'dictionary'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Table className="h-3.5 w-3.5" />
          <span>Data Dictionary &amp; Encryption</span>
        </button>
      </div>

      {/* VIEW 1: Visual Interactive ERD Diagram */}
      {activeModel === 'erd' && (
        <div className="space-y-6">
          {/* Interactive ERD Canvas */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-sm text-white">Relational Entity-Relationship Diagram (ERD)</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Click any table entity to inspect columns and foreign key mappings
              </span>
            </div>

            {/* SVG Visual Relationship Graph */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-6 overflow-x-auto min-h-[380px] flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                {/* Entity 1: User Profiles */}
                <div
                  onClick={() => setSelectedEntity('user_profiles')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedEntity === 'user_profiles'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="font-mono font-bold text-xs text-cyan-300">user_profiles</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">1 : N</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Key className="h-3 w-3" />
                      <span>id : UUID (PK)</span>
                    </div>
                    <div>email : VARCHAR(255)</div>
                    <div>display_name : VARCHAR(255)</div>
                    <div>position : VARCHAR(255)</div>
                    <div>mfa_method : VARCHAR(64)</div>
                    <div className="text-emerald-400">mfa_verified : BOOLEAN</div>
                  </div>
                </div>

                {/* Entity 2: Infrastructure Scans (Root) */}
                <div
                  onClick={() => setSelectedEntity('infrastructure_scans')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedEntity === 'infrastructure_scans'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="font-mono font-bold text-xs text-cyan-300">infrastructure_scans</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">ROOT</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Key className="h-3 w-3" />
                      <span>id : UUID (PK)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <Link2 className="h-3 w-3" />
                      <span>user_id : UUID (FK)</span>
                    </div>
                    <div>target_url : VARCHAR(512)</div>
                    <div>company_name : VARCHAR(255)</div>
                    <div>auditor_name : VARCHAR(255)</div>
                    <div>environment : VARCHAR(64)</div>
                    <div>overall_score : INT</div>
                  </div>
                </div>

                {/* Entity 3: Vulnerability Findings */}
                <div
                  onClick={() => setSelectedEntity('vulnerability_findings')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedEntity === 'vulnerability_findings'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="font-mono font-bold text-xs text-cyan-300">vulnerability_findings</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">N : 1</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Key className="h-3 w-3" />
                      <span>id : UUID (PK)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <Link2 className="h-3 w-3" />
                      <span>scan_id : UUID (FK)</span>
                    </div>
                    <div>cwe : VARCHAR(32)</div>
                    <div className="text-red-400">severity : VARCHAR(16)</div>
                    <div className="text-amber-400">cvss_score : NUMERIC(3,1)</div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Lock className="h-3 w-3" />
                      <span>sink_encrypted : AES-256</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Entity Inspector Panel */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono font-bold text-slate-500">Selected Table Entity:</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">{currentEntityData.tableName}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{currentEntityData.firestorePath}</span>
              </div>
              <p className="text-xs text-slate-300">{currentEntityData.description}</p>

              {/* Columns Table */}
              <div className="border border-slate-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Column Name</th>
                      <th className="py-2 px-3">Data Type</th>
                      <th className="py-2 px-3">Nullable</th>
                      <th className="py-2 px-3">Encryption</th>
                      <th className="py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {currentEntityData.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 font-bold text-cyan-400">{col.name}</td>
                        <td className="py-2 px-3 text-slate-400">{col.type}</td>
                        <td className="py-2 px-3">{col.nullable ? 'YES' : 'NO'}</td>
                        <td className="py-2 px-3">
                          {col.encrypted ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              <Lock className="h-2.5 w-2.5" />
                              AES-256
                            </span>
                          ) : (
                            <span className="text-slate-600">None</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{col.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Interactive SQL & Schema Query Tester */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>Live Relational Query Simulator (PostgreSQL / MySQL / Firestore)</span>
              </div>
              <button
                onClick={handleExecuteQuery}
                disabled={isExecutingQuery}
                className="px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isExecutingQuery ? 'Executing Query...' : 'Run Query'}</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-cyan-300">
              <textarea
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                rows={4}
                className="w-full bg-transparent border-0 outline-hidden font-mono text-xs text-slate-200 resize-none"
              />
            </div>

            {queryResult && (
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  Execution Result ({queryResult.length} rows returned in 12ms):
                </span>
                <div className="border border-slate-800 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">CWE</th>
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3">CVSS</th>
                        <th className="py-2 px-3">Severity</th>
                        <th className="py-2 px-3">Target URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {queryResult.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 font-bold text-cyan-400">{r.cwe}</td>
                          <td className="py-2 px-3">{r.title}</td>
                          <td className="py-2 px-3 text-red-400 font-bold">{r.cvss_score}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-500/30">
                              {r.severity}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-400">{r.target_url}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: PostgreSQL 15 DDL Code */}
      {activeModel === 'postgres' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-sm text-white">PostgreSQL 15 Relational Schema (DDL)</span>
            </div>
            <button
              onClick={() => copyToClipboard(postgresDDL, 'pg')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedText === 'pg' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedText === 'pg' ? 'Copied DDL' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl border border-slate-800 bg-slate-900 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[520px]">
            {postgresDDL}
          </pre>
        </div>
      )}

      {/* VIEW 3: Firestore NoSQL Schema JSON */}
      {activeModel === 'firestore' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-sm text-white">Firebase Firestore NoSQL Document Hierarchy</span>
            </div>
            <button
              onClick={() => copyToClipboard(firestoreSchemaJson, 'fs')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedText === 'fs' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedText === 'fs' ? 'Copied JSON' : 'Copy JSON Schema'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl border border-slate-800 bg-slate-900 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-[520px]">
            {firestoreSchemaJson}
          </pre>
        </div>
      )}

      {/* VIEW 4: Data Dictionary & Compliance Cross-Walk */}
      {activeModel === 'dictionary' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Data Dictionary, Security Classifications &amp; Regulatory Alignment</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Field-level data protection guarantees under PCI-DSS 4.0, ISO/IEC 27001:2022, and the Digital Personal Data Protection (DPDP) Act 2023.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-bold">
                <Lock className="h-4 w-4" />
                <span>AES-256 GCM Envelope Encryption</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All vulnerable endpoints, HTTP parameters, and proof-of-concept payloads are encrypted before persistence in Firestore and PostgreSQL using AES-256-GCM authenticated cipher blocks.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>PCI-DSS 4.0 Requirement 3.4 &amp; 8.3</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mandates primary account data obfuscation and multi-factor authentication (MFA) via Google / Microsoft Authenticator for all administrative control plane access.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-purple-400 font-bold">
                <Server className="h-4 w-4" />
                <span>DPDP Act 2023 Section 8(5)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enforces data fiduciary accountability, immutable audit trails with auditor attribution (Publisher Name, Position, Company, Location), and tamper-evident deletion controls.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Copyright Watermark Footer */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <span className="text-slate-300 font-semibold">
          Database Schema Explorer · AegisGRC Unified Control Plane
        </span>
        <span className="text-cyan-400 font-bold">
          &copy; 2026 AmanDev. All Rights Reserved. Proprietary Architectural Design &amp; Intellectual Property.
        </span>
      </div>
    </div>
  );
};
