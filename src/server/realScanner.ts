import { spawn } from 'node:child_process';
import dns from 'node:dns/promises';
import net from 'node:net';
import crypto from 'node:crypto';

export type RealScanner = 'nmap' | 'wapiti';

const PRIVATE_V4 = [
  /^127\./, /^10\./, /^192\.168\./, /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./, /^0\./
];

export async function validateAuthorizedTarget(input: string) {
  const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP/HTTPS targets are supported');
  if (!url.hostname || url.username || url.password) throw new Error('Invalid target URL');
  const records = await dns.lookup(url.hostname, { all: true });
  if (!records.length) throw new Error('Target did not resolve');
  for (const r of records) {
    if (net.isIP(r.address) === 4 && PRIVATE_V4.some(x => x.test(r.address))) throw new Error('Private/loopback targets are blocked');
    if (net.isIP(r.address) === 6 && (r.address === '::1' || r.address.startsWith('fe80:') || r.address.startsWith('fc') || r.address.startsWith('fd'))) throw new Error('Private/loopback IPv6 targets are blocked');
  }
  return { url, addresses: records.map(r => r.address) };
}

function run(binary: string, args: string[], timeoutMs: number) {
  return new Promise<{stdout:string;stderr:string;exitCode:number|null;durationMs:number}>((resolve,reject) => {
    const started=Date.now();
    const child=spawn(binary,args,{shell:false,stdio:['ignore','pipe','pipe'],env:{PATH:process.env.PATH || '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'}});
    let stdout='', stderr='', killed=false;
    const timer=setTimeout(()=>{killed=true; child.kill('SIGKILL');},timeoutMs);
    child.stdout.on('data',d=>{ if(stdout.length<5_000_000) stdout+=d.toString(); });
    child.stderr.on('data',d=>{ if(stderr.length<1_000_000) stderr+=d.toString(); });
    child.on('error',e=>{clearTimeout(timer); reject(e);});
    child.on('close',code=>{clearTimeout(timer); if(killed) return reject(new Error('Scanner timed out')); resolve({stdout,stderr,exitCode:code,durationMs:Date.now()-started});});
  });
}

export async function runRealScanner(tool: RealScanner, target: string) {
  const checked=await validateAuthorizedTarget(target);
  const jobId='SCAN-'+crypto.randomBytes(8).toString('hex').toUpperCase();
  const startedAt=new Date().toISOString();
  let execution;
  if(tool==='nmap'){
    // Connect scan + service detection over a deliberately bounded web-service port set.
    execution=await run('nmap',['-sT','-sV','--version-light','-Pn','-p','80,443,8080,8443','-oX','-',checked.url.hostname],45_000);
  } else if(tool==='wapiti'){
    // Bounded DAST profile. Wapiti writes JSON to stdout when output is '-'.
    execution=await run('wapiti',['-u',checked.url.toString(),'-f','json','-o','-','--max-scan-time','60','--max-attack-time','20','--tasks','2','--no-bugreport'],90_000);
  } else throw new Error('Unsupported scanner');
  const evidenceHash=crypto.createHash('sha256').update(execution.stdout).digest('hex');
  return {
    success: execution.exitCode===0,
    executionMode:'REAL_TOOL_EXECUTION',
    jobId, tool, targetUrl:checked.url.toString(), resolvedAddresses:checked.addresses,
    startedAt, completedAt:new Date().toISOString(), durationMs:execution.durationMs,
    exitCode:execution.exitCode, stdout:execution.stdout, stderr:execution.stderr,
    evidence:{sha256:evidenceHash, bytes:Buffer.byteLength(execution.stdout,'utf8')},
  };
}
