import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// Inițializare Firebase Admin (doar server-side)
let app;
if (getApps().length === 0) {
  try {
    // Încercăm să citim service account din fișier
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      app = initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized with service account file');
    } else {
      // Fallback: încercăm din environment variable
      const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (serviceAccountEnv) {
        const serviceAccount = JSON.parse(serviceAccountEnv);
        app = initializeApp({
          credential: cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized with environment variable');
      } else {
        // Ultimul fallback: Application Default Credentials
        app = initializeApp();
        console.log('⚠️ Firebase Admin initialized with default credentials');
      }
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export default app;
