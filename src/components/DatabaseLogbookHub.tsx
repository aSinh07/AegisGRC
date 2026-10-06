import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  HardDrive, 
  Cloud, 
  CheckCircle2, 
  Clock, 
  User, 
  Globe2, 
  FileCode, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  Layers, 
  Terminal,
  Search,
  ExternalLink
} from 'lucide-react';
import { AuditLogbookEntry, DatabaseIntegrationStatus } from '../types/security';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';

interface DatabaseLogbookHubProps {
  logs: AuditLogbookEntry[];
  dbStatus: DatabaseIntegrationStatus;
  onToggleDbMode: (mode: 'SERVER_CLOUD' | 'LOCALHOST_OFFLINE') => void;
  onRefreshLogs: () => void;
}

export const DatabaseLogbookHub: React.FC<DatabaseLogbookHubProps> = ({
  logs,
  dbStatus,
  onToggleDbMode,
  onRefreshLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'logbook' | 'schemas' | 'sync'>('logbook');
  const [copiedSchema, setCopiedSchema] = useState<string | null>(null);
  const [schemaLanguage, setSchemaLanguage] = useState<'postgres' | 'mysql' | 'firestore' | 'mongodb'>('postgres');
  const [searchQuery, setSearchQuery] = useState('');

  const postgresDDL = `-- PostgreSQL 15 Enterprise Schema (AES-256 Storage)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(64) DEFAULT 'Lead Security Architect',
    mfa_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE infrastructure_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_url VARCHAR(512) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    auditor_name VARCHAR(255) NOT NULL,
    auditor_position VARCHAR(255),
    environment VARCHAR(64) DEFAULT 'Production',
    ip_address INET,
    ssl_grade VARCHAR(32),
    overall_score INT DEFAULT 91,
    geo_jurisdiction VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vulnerability_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES infrastructure_scans(id) ON DELETE CASCADE,
    cwe VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    cvss_score NUMERIC(3,1),
    asset VARCHAR(255),
    sink_or_endpoint TEXT,
    source_tool VARCHAR(64),
    dedup_hash CHAR(64) UNIQUE,
    encrypted_payload_aes256 TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    remediation_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_logbook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(128) NOT NULL,
    auditor_name VARCHAR(255) NOT NULL,
    auditor_position VARCHAR(255),
    company_name VARCHAR(255),
    location VARCHAR(128),
    ip_address VARCHAR(45),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const mysqlDDL = `-- MySQL 8.0 Enterprise Relational Schema
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logbook (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(128) NOT NULL,
    auditor_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    location VARCHAR(128),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const mongodbSchema = `// MongoDB Collections & Indexes
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "displayName", "companyName"],
      properties: {
        email: { bsonType: "string" },
        displayName: { bsonType: "string" },
        companyName: { bsonType: "string" },
        position: { bsonType: "string" }
      }
    }
  }
});
db.audit_logbook.createIndex({ "timestamp": -1 });
db.audit_logbook.createIndex({ "auditorName": 1 });
db.findings.createIndex({ "dedupHash": 1 }, { unique: true });`;

  const firestoreSchema = `// Firebase Firestore NoSQL Document Collections (firebase-blueprint.json)
Collection: /users/{userId}
  - userId, email, displayName, position, companyName, role, mfaEnabled, lastLoginAt

Collection: /scans/{scanId}
  - scanId, targetUrl, companyName, auditorName, auditorPosition, environment, ipAddress, sslGrade, overallScore, geoJurisdiction

Collection: /findings/{findingId}
  - findingId, title, severity, cvssScore, cwe, asset, sinkOrEndpoint, sourceTool, status, remediationRecommendation

Collection: /audit_logs/{logId}
  - logId, action, auditorName, auditorPosition, companyName, location, ipAddress, timestamp, details`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSchema(id);
    setTimeout(() => setCopiedSchema(null), 2000);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.auditorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>PERSISTENT DATA LAYER &amp; AUDIT LOGBOOK</span>
            <span aria-hidden="true">·</span>
            <span>FIREBASE FIRESTORE &amp; POSTGRESQL / MYSQL</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Database Architecture &amp; Auditor Logbook Engine
          </h2>
          <p className="text-xs text-slate-400">
            Manage public server data synchronization, inspect relational &amp; NoSQL schemas, and review confidential auditor activity attribution.
          </p>
        </div>

        {/* Cloud / Localhost Mode Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
          <button
            onClick={() => onToggleDbMode('SERVER_CLOUD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              dbStatus.mode === 'SERVER_CLOUD'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>Cloud Server (Firebase)</span>
          </button>
          <button
            onClick={() => onToggleDbMode('LOCALHOST_OFFLINE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              dbStatus.mode === 'LOCALHOST_OFFLINE'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span>Localhost (Offline Data)</span>
          </button>
        </div>
      </div>

      {/* Database Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Storage Mode</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {dbStatus.mode === 'SERVER_CLOUD' ? 'Cloud Firestore' : 'Localhost Cached'}
          </div>
          <p className="text-[11px] text-slate-400">
            {dbStatus.mode === 'SERVER_CLOUD' ? 'Real-time multi-region sync' : 'Local browser database queue'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400">Database Engine</div>
          <div className="text-lg font-bold text-cyan-300 font-mono">
            PostgreSQL &amp; Firestore
          </div>
          <p className="text-[11px] text-slate-400">AES-256 field-level encrypted rows</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400">Logbook Entries</div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            {logs.length} Records
          </div>
          <p className="text-[11px] text-slate-400">Immutable auditor provenance</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400">Compliance Residency</div>
          <div className="text-lg font-bold text-indigo-300 font-mono">
            DPDP Act Sec 8(5)
          </div>
          <p className="text-[11px] text-slate-400">Data sovereignty geo-tagged</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('logbook')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'logbook'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Security Audit Logbook ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('schemas')}
          className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'schemas'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Database Schemas (SQL / NoSQL)
        </button>
      </div>

      {/* Tab 1: Audit Logbook Table */}
      {activeTab === 'logbook' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by auditor, company, action, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              onClick={onRefreshLogs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Logbook</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900/80 text-slate-300 font-bold border-b border-slate-800 font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp &amp; Action</th>
                  <th className="py-3 px-4">Auditor Attribution</th>
                  <th className="py-3 px-4">Company &amp; Position</th>
                  <th className="py-3 px-4">Geo Location (Google Maps)</th>
                  <th className="py-3 px-4 text-right">Sync State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{log.action}</div>
                      <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{log.auditorName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">IP: {log.ipAddress}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{log.companyName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{log.auditorPosition}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                        <Globe2 className="h-3.5 w-3.5" />
                        <span>{log.location}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{log.details}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Database Schemas */}
      {activeTab === 'schemas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setSchemaLanguage('postgres')}
                className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  schemaLanguage === 'postgres' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                PostgreSQL 15+ (DDL)
              </button>
              <button
                onClick={() => setSchemaLanguage('mysql')}
                className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  schemaLanguage === 'mysql' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                MySQL 8.0 (DDL)
              </button>
              <button
                onClick={() => setSchemaLanguage('firestore')}
                className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  schemaLanguage === 'firestore' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Firebase Firestore NoSQL
              </button>
              <button
                onClick={() => setSchemaLanguage('mongodb')}
                className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  schemaLanguage === 'mongodb' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                MongoDB BSON
              </button>
            </div>

            <button
              onClick={() => {
                const text =
                  schemaLanguage === 'postgres'
                    ? postgresDDL
                    : schemaLanguage === 'mysql'
                    ? mysqlDDL
                    : schemaLanguage === 'firestore'
                    ? firestoreSchema
                    : mongodbSchema;
                copyToClipboard(text, schemaLanguage);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {copiedSchema === schemaLanguage ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-cyan-400" />}
              <span>Copy Schema</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto">
            <pre className="text-slate-300 leading-relaxed">
              {schemaLanguage === 'postgres' && postgresDDL}
              {schemaLanguage === 'mysql' && mysqlDDL}
              {schemaLanguage === 'firestore' && firestoreSchema}
              {schemaLanguage === 'mongodb' && mongodbSchema}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
