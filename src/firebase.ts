import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Initial test connection
testConnection();

// Helpers for GRC Audits and Profiles
export interface SavedGrcAudit {
  auditId: string;
  userId: string;
  auditorName: string;
  auditorPosition: string;
  companyName: string;
  targetUrl: string;
  environment?: string;
  storageMode: 'cloud' | 'local';
  locationSummary?: string;
  riskScore?: string;
  frameworkCount?: string;
  createdAt: string;
}

export interface SavedAccessLog {
  logId: string;
  userId: string;
  userName: string;
  auditorName?: string;
  action: string;
  targetResource?: string;
  geoLocation?: string;
  createdAt: string;
}

export async function saveAuditToFirestore(auditData: SavedGrcAudit): Promise<void> {
  const path = `grcAudits/${auditData.auditId}`;
  try {
    await setDoc(doc(db, 'grcAudits', auditData.auditId), auditData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveAccessLogToFirestore(logData: SavedAccessLog): Promise<void> {
  const path = `accessLogs/${logData.logId}`;
  try {
    await setDoc(doc(db, 'accessLogs', logData.logId), logData);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function fetchUserAudits(userId: string): Promise<SavedGrcAudit[]> {
  const path = 'grcAudits';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const audits: SavedGrcAudit[] = [];
    querySnapshot.forEach(docSnap => {
      audits.push(docSnap.data() as SavedGrcAudit);
    });
    return audits;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export interface ScanInputData {
  targetUrl: string;
  companyName: string;
  auditorName: string;
  auditorPosition: string;
  environment?: string;
  ipAddress?: string;
  sslGrade?: string;
  overallScore?: number;
  geoJurisdiction?: string;
  storageMode?: 'cloud' | 'local';
}

export interface AuditLogInputData {
  action: string;
  auditorName?: string;
  auditorPosition?: string;
  companyName?: string;
  location?: string;
  ipAddress?: string;
  details?: string;
  userName?: string;
}

export async function saveScanToFirestore(input: ScanInputData | SavedGrcAudit): Promise<void> {
  const auditId = 'auditId' in input ? input.auditId : `audit-${Date.now()}`;
  const userId = ('userId' in input && input.userId) ? input.userId : (auth.currentUser?.uid || 'user-aegis-primary');
  const record: SavedGrcAudit = {
    auditId,
    userId,
    auditorName: input.auditorName || 'Aman',
    auditorPosition: input.auditorPosition || 'CISO',
    companyName: input.companyName || 'Enterprise Corp',
    targetUrl: input.targetUrl || 'https://target.corp',
    environment: input.environment || 'Production',
    storageMode: ('storageMode' in input && input.storageMode) ? input.storageMode : 'cloud',
    locationSummary: ('geoJurisdiction' in input ? input.geoJurisdiction : ('locationSummary' in input ? input.locationSummary : 'Bangalore/Mumbai Data Center')),
    riskScore: ('overallScore' in input && input.overallScore !== undefined) ? `${input.overallScore}/100` : '85/100',
    frameworkCount: '8 Frameworks (ISO 27001, 42001, DPDP, SOC2)',
    createdAt: new Date().toISOString(),
  };

  const path = `grcAudits/${auditId}`;
  try {
    await setDoc(doc(db, 'grcAudits', auditId), record);
  } catch (err) {
    console.warn('Firestore write warning:', err);
  }
}

export async function saveAuditLogToFirestore(input: AuditLogInputData | SavedAccessLog): Promise<void> {
  const logId = 'logId' in input ? input.logId : `log-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const userId = ('userId' in input && input.userId) ? input.userId : (auth.currentUser?.uid || 'user-aegis-primary');
  const record: SavedAccessLog = {
    logId,
    userId,
    userName: input.userName || input.auditorName || 'Aman',
    auditorName: input.auditorName,
    action: input.action,
    targetResource: ('companyName' in input && input.companyName) ? input.companyName : 'Target Infrastructure',
    geoLocation: ('location' in input && input.location) ? input.location : 'Bangalore Hub',
    createdAt: new Date().toISOString(),
  };

  const path = `accessLogs/${logId}`;
  try {
    await setDoc(doc(db, 'accessLogs', logId), record);
  } catch (err) {
    console.warn('Firestore access log write warning:', err);
  }
}


