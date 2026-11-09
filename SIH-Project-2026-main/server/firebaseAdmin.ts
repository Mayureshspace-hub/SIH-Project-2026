import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

const projectId = process.env.FIREBASE_PROJECT_ID || 'kisan-marg-19c0a';

function getCredential() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline) return cert(JSON.parse(inline));
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) return cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8')));
  return applicationDefault();
}

export const adminCredential = getCredential();

export const firebaseAdminApp = getApps()[0] || initializeApp({
  credential: adminCredential,
  projectId,
});

export const adminAuth = getAuth(firebaseAdminApp);
export const firestore = getFirestore(firebaseAdminApp);
