import { CanonicalFinding, MappedControl, ScannerSourceType, SeverityLevel } from '../types/security';
import { generateDedupHash, simulateAes256Encryption } from './cryptoSim';

/**
 * Automates mapping between CWEs and the 3 regulatory standards:
 * ISO/IEC 27001:2022, ISO/IEC 42001:2023, and DPDP Act 2023
 */
export function getMappedControlsForCWE(cwe: string): MappedControl[] {
  const normCwe = cwe.toUpperCase().trim();
  const mappings: MappedControl[] = [];

  // ISO 27001:2022
  if (['CWE-89', 'CWE-79', 'CWE-918', 'CWE-22', 'CWE-502', 'CWE-78'].includes(normCwe)) {
    mappings.push({ standard: 'ISO 27001:2022', controlId: 'A.8.8', controlTitle: 'Management of technical vulnerabilities' });
    mappings.push({ standard: 'ISO 27001:2022', controlId: 'A.8.28', controlTitle: 'Secure coding' });
  }
  if (['CWE-319', 'CWE-693', 'CWE-200', 'CWE-306', 'CWE-918'].includes(normCwe)) {
    mappings.push({ standard: 'ISO 27001:2022', controlId: 'A.8.20', controlTitle: 'Network security' });
  }
  if (['CWE-798', 'CWE-326', 'CWE-327', 'CWE-319'].includes(normCwe)) {
    mappings.push({ standard: 'ISO 27001:2022', controlId: 'A.8.24', controlTitle: 'Use of cryptography' });
  }
  if (['CWE-352', 'CWE-287', 'CWE-862', 'CWE-639', 'CWE-306'].includes(normCwe)) {
    mappings.push({ standard: 'ISO 27001:2022', controlId: 'A.5.15', controlTitle: 'Access control' });
    mappings.push({ standard: 'ISO 27001:2022', controlId: 'A.8.26', controlTitle: 'Application security requirements' });
  }

  // ISO 42001:2023 (AI Systems)
  if (['CWE-1336', 'CWE-20', 'CWE-74'].includes(normCwe)) {
    mappings.push({ standard: 'ISO 42001:2023', controlId: 'A.6.4', controlTitle: 'AI system resilience and prompt isolation' });
    mappings.push({ standard: 'ISO 42001:2023', controlId: 'A.8.4', controlTitle: 'Continuous monitoring of AI systems' });
  }
  if (['CWE-918', 'CWE-200', 'CWE-1336'].includes(normCwe)) {
    mappings.push({ standard: 'ISO 42001:2023', controlId: 'A.6.2', controlTitle: 'AI risk assessment and mitigation' });
  }
  if (['CWE-798', 'CWE-200', 'CWE-319'].includes(normCwe)) {
    mappings.push({ standard: 'ISO 42001:2023', controlId: 'A.7.2', controlTitle: 'AI data governance and confidentiality' });
  }

  // DPDP Act 2023
  if (['CWE-89', 'CWE-79', 'CWE-798', 'CWE-319', 'CWE-918', 'CWE-22'].includes(normCwe)) {
    mappings.push({ standard: 'DPDP Act 2023', controlId: 'Section 8(5)', controlTitle: 'Reasonable security safeguards' });
  }
  if (['CWE-89', 'CWE-798', 'CWE-200', 'CWE-306'].includes(normCwe)) {
    mappings.push({ standard: 'DPDP Act 2023', controlId: 'Section 8(6)', controlTitle: 'Personal data breach notification' });
  }
  if (['CWE-352', 'CWE-862', 'CWE-639'].includes(normCwe)) {
    mappings.push({ standard: 'DPDP Act 2023', controlId: 'Section 11', controlTitle: 'Data principal rights and grievance redressal' });
  }

  // Fallback if no specific rule hit
  if (mappings.length === 0) {
    mappings.push({ standard: 'ISO 27001:2022', controlId: 'A.8.8', controlTitle: 'Management of technical vulnerabilities' });
  }

  return mappings;
}

export function parseScanFile(rawText: string, suggestedTool?: ScannerSourceType, defaultAsset = 'target.enterprise.corp'): CanonicalFinding[] {
  const trimmed = rawText.trim();

  // 1. SARIF format detection
  if (trimmed.startsWith('{') && (trimmed.includes('"sarif-schema"') || (trimmed.includes('"runs"') && trimmed.includes('"results"')))) {
    return parseSarif(trimmed, defaultAsset);
  }

  // 2. Nmap XML detection
  if (trimmed.startsWith('<?xml') || trimmed.includes('<nmaprun')) {
    return parseNmapXml(trimmed, defaultAsset);
  }

  // 3. Nikto JSON detection
  if (trimmed.startsWith('{') && (trimmed.includes('"vulnerabilities"') && trimmed.includes('"banner"'))) {
    return parseNiktoJson(trimmed, defaultAsset);
  }

  // 4. Wapiti JSON detection
  if (trimmed.startsWith('{') && trimmed.includes('"vulnerabilities"') && trimmed.includes('"info"')) {
    return parseWapitiJson(trimmed, defaultAsset);
  }

  // 5. Generic JSON or Fallback Parser
  return parseGenericJsonOrFallback(trimmed, suggestedTool || 'Manual', defaultAsset);
}

function parseSarif(content: string, defaultAsset: string): CanonicalFinding[] {
  try {
    const sarif = JSON.parse(content);
    const findings: CanonicalFinding[] = [];
    const runs = sarif.runs || [];

    for (const run of runs) {
      const toolName = (run.tool?.driver?.name || 'Semgrep') as ScannerSourceType;
      const rules = run.tool?.driver?.rules || [];
      const ruleMap = new Map<string, any>();
      for (const r of rules) ruleMap.set(r.id, r);

      const results = run.results || [];
      for (let i = 0; i < results.length; i++) {
        const item = results[i];
        const rule = ruleMap.get(item.ruleId) || {};
        const cweList: string[] = rule.properties?.cwe || [];
        const cwe = cweList[0] || (item.ruleId?.includes('sql') ? 'CWE-89' : 'CWE-798');
        const loc = item.locations?.[0]?.physicalLocation;
        const uri = loc?.artifactLocation?.uri || 'unknown/file';
        const line = loc?.region?.startLine || 1;
        const sinkOrEndpoint = `${uri}:${line}`;
        const score = parseFloat(rule.properties?.['security-severity'] || '7.5');
        const severity: SeverityLevel = score >= 9.0 ? 'CRITICAL' : score >= 7.0 ? 'HIGH' : score >= 4.0 ? 'MEDIUM' : 'LOW';

        const findingId = `SARIF-${Math.floor(1000 + Math.random() * 9000)}`;
        findings.push({
          id: findingId,
          title: rule.shortDescription?.text || item.message?.text?.slice(0, 70) || `Security Rule ${item.ruleId}`,
          description: item.message?.text || rule.shortDescription?.text || 'Automated static analysis security finding.',
          severity,
          cvssScore: score,
          cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
          cwe,
          cweName: rule.name || cwe,
          asset: defaultAsset,
          sinkOrEndpoint,
          sourceTool: toolName.includes('Semgrep') ? 'Semgrep' : 'Manual',
          dedupHash: generateDedupHash(defaultAsset, cwe, sinkOrEndpoint),
          encryptedPayloadPreview: simulateAes256Encryption(`Rule: ${item.ruleId} at ${sinkOrEndpoint}`),
          status: 'ACTIVE',
          likelihood: severity === 'CRITICAL' ? 4 : 3,
          impact: severity === 'CRITICAL' ? 5 : 4,
          mappedControls: getMappedControlsForCWE(cwe),
          evidence: `Rule match at line ${line} in ${uri}. Engine: ${toolName}.`,
          remediationRecommendation: 'Audit input sanitization and secure cryptographic configurations according to enterprise baseline standards.',
          detectedAt: new Date().toISOString(),
          rawPayloadSnippet: JSON.stringify(item, null, 2),
        });
      }
    }
    return findings;
  } catch {
    return [];
  }
}

function parseNmapXml(xmlContent: string, defaultAsset: string): CanonicalFinding[] {
  const findings: CanonicalFinding[] = [];
  const portRegex = /<port protocol="([^"]+)" portid="([^"]+)">[\s\S]*?<state state="([^"]+)"\/>[\s\S]*?<service name="([^"]+)"(?: product="([^"]+)")?(?: version="([^"]+)")?[\s\S]*?<\/port>/g;
  
  let match;
  while ((match = portRegex.exec(xmlContent)) !== null) {
    const [, protocol, portId, state, serviceName, product, version] = match;
    if (state !== 'open') continue;

    // Detect high risk services
    let cwe = 'CWE-200';
    let severity: SeverityLevel = 'LOW';
    let cvss = 3.5;
    let title = `Open Port ${protocol.toUpperCase()}/${portId}: ${serviceName}`;

    if (portId === '3306' || portId === '5432' || portId === '27017' || portId === '6379') {
      cwe = 'CWE-306';
      severity = 'HIGH';
      cvss = 7.5;
      title = `Directly Exposed Database Port ${portId} (${serviceName})`;
    } else if (portId === '22' && (version?.includes('8.2') || version?.includes('7.'))) {
      cwe = 'CWE-8.8';
      severity = 'MEDIUM';
      cvss = 5.9;
      title = `OpenSSH ${version || 'Outdated'} Service Detected`;
    } else if (portId === '443' && xmlContent.includes('TLSv1.0')) {
      cwe = 'CWE-319';
      severity = 'MEDIUM';
      cvss = 5.3;
      title = 'Weak TLSv1.0 Cipher Suites Permitted on Port 443';
    }

    const endpoint = `${protocol}/${portId} (${serviceName}${product ? ' - ' + product : ''})`;
    findings.push({
      id: `NMAP-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      description: `Discovered open network service ${serviceName} on port ${portId}/${protocol} during automated reconnaissance scan.`,
      severity,
      cvssScore: cvss,
      cwe,
      cweName: `Network Perimeter Service (${cwe})`,
      asset: defaultAsset,
      sinkOrEndpoint: endpoint,
      sourceTool: 'Nmap',
      dedupHash: generateDedupHash(defaultAsset, cwe, endpoint),
      encryptedPayloadPreview: simulateAes256Encryption(`Nmap Port: ${portId}, Service: ${serviceName}`),
      status: 'ACTIVE',
      likelihood: 3,
      impact: severity === 'HIGH' ? 4 : 2,
      mappedControls: getMappedControlsForCWE(cwe),
      evidence: `Nmap detected state=open on port ${portId}/${protocol}. Product: ${product || 'Generic'} ${version || ''}`,
      remediationRecommendation: 'Restrict access to trusted IP addresses using cloud security groups and firewalls.',
      detectedAt: new Date().toISOString(),
      rawPayloadSnippet: match[0],
    });
  }

  return findings;
}

function parseNiktoJson(content: string, defaultAsset: string): CanonicalFinding[] {
  try {
    const data = JSON.parse(content);
    const findings: CanonicalFinding[] = [];
    const vulns = data.vulnerabilities || [];

    for (const v of vulns) {
      const cwe = v.cwe || 'CWE-693';
      const endpoint = v.url || '/';
      const cvss = v.cvss || 5.0;
      const severity: SeverityLevel = v.severity || (cvss >= 7.0 ? 'HIGH' : 'MEDIUM');

      findings.push({
        id: `NIKTO-${Math.floor(1000 + Math.random() * 9000)}`,
        title: v.msg?.slice(0, 60) || `Web Vulnerability ${cwe}`,
        description: v.msg || 'Dynamic web application scanner alert.',
        severity,
        cvssScore: cvss,
        cwe,
        cweName: cwe,
        asset: data.host || defaultAsset,
        sinkOrEndpoint: endpoint,
        sourceTool: 'Nikto',
        dedupHash: generateDedupHash(data.host || defaultAsset, cwe, endpoint),
        encryptedPayloadPreview: simulateAes256Encryption(v.msg || 'Nikto finding'),
        status: 'ACTIVE',
        likelihood: 4,
        impact: severity === 'HIGH' ? 4 : 2,
        mappedControls: getMappedControlsForCWE(cwe),
        evidence: `Discovered by Nikto Web DAST probe on URI ${endpoint}.`,
        remediationRecommendation: 'Apply missing security headers and harden web server configuration.',
        detectedAt: new Date().toISOString(),
        rawPayloadSnippet: JSON.stringify(v, null, 2),
      });
    }
    return findings;
  } catch {
    return [];
  }
}

function parseWapitiJson(content: string, defaultAsset: string): CanonicalFinding[] {
  try {
    const data = JSON.parse(content);
    const findings: CanonicalFinding[] = [];
    const vulns = data.vulnerabilities || {};

    for (const [category, items] of Object.entries(vulns)) {
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const cwe = item.cwe || (category.includes('SSRF') ? 'CWE-918' : category.includes('XSS') ? 'CWE-79' : 'CWE-20');
        const endpoint = item.path || '/';
        const cvss = item.cvss || 7.5;
        const severity: SeverityLevel = item.severity || 'HIGH';

        findings.push({
          id: `WAPITI-${Math.floor(1000 + Math.random() * 9000)}`,
          title: `${category} in ${endpoint}`,
          description: item.info || `Dynamic application fuzzing triggered ${category} condition.`,
          severity,
          cvssScore: cvss,
          cwe,
          cweName: category,
          asset: data.info?.target ? new URL(data.info.target).hostname : defaultAsset,
          sinkOrEndpoint: endpoint,
          sourceTool: 'Wapiti',
          dedupHash: generateDedupHash(defaultAsset, cwe, endpoint),
          encryptedPayloadPreview: simulateAes256Encryption(item.info || category),
          status: 'ACTIVE',
          likelihood: 4,
          impact: 4,
          mappedControls: getMappedControlsForCWE(cwe),
          evidence: `Wapiti HTTP DAST trigger: ${item.info || 'Payload reflected'}`,
          remediationRecommendation: 'Validate input against strict schemas, sanitize output, and isolate internal egress points.',
          detectedAt: new Date().toISOString(),
          rawPayloadSnippet: JSON.stringify(item, null, 2),
        });
      }
    }
    return findings;
  } catch {
    return [];
  }
}

function parseGenericJsonOrFallback(content: string, tool: ScannerSourceType, defaultAsset: string): CanonicalFinding[] {
  const cwe = 'CWE-200';
  const endpoint = '/api/generic-test';
  return [
    {
      id: `CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Custom Scan Ingestion Result from ${tool}`,
      description: content.slice(0, 180) + '...',
      severity: 'MEDIUM',
      cvssScore: 5.5,
      cwe,
      cweName: 'Information Exposure',
      asset: defaultAsset,
      sinkOrEndpoint: endpoint,
      sourceTool: tool,
      dedupHash: generateDedupHash(defaultAsset, cwe, endpoint),
      encryptedPayloadPreview: simulateAes256Encryption(content.slice(0, 40)),
      status: 'ACTIVE',
      likelihood: 3,
      impact: 3,
      mappedControls: getMappedControlsForCWE(cwe),
      evidence: `Parsed from manual raw upload (${content.length} bytes).`,
      remediationRecommendation: 'Review finding against organizational security baseline requirements.',
      detectedAt: new Date().toISOString(),
      rawPayloadSnippet: content.slice(0, 300),
    }
  ];
}
