import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inițializare Firebase Admin SDK (opțional la build)
let adminDb: any = null;

try {
  if (!getApps().length && process.env.FIREBASE_PROJECT_ID) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      }),
    });
  }
  adminDb = getFirestore();
} catch (error) {
  console.warn('Firebase Admin not initialized (build time)');
}

export async function POST(request: NextRequest) {
  try {
    // Verifică dacă Firebase Admin e inițializat
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin nu este configurat.' },
        { status: 500 }
      );
    }

    const { organizationId, employeeId, resetAll } = await request.json();

    if (resetAll) {
      // Reset device pentru TOȚI angajații
      const employeesSnapshot = await adminDb
        .collection('organizations')
        .doc(organizationId)
        .collection('employees')
        .get();

      const batch = adminDb.batch();
      let count = 0;

      employeesSnapshot.docs.forEach((doc: any) => {
        if (doc.data().deviceId) {
          batch.update(doc.ref, { deviceId: null });
          count++;
        }
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: `✅ Device resetat pentru ${count} angajați!`,
        count: count,
      });
    } else {
      // Reset device pentru UN singur angajat
      if (!employeeId) {
        return NextResponse.json(
          { error: 'employeeId lipsește' },
          { status: 400 }
        );
      }

      await adminDb
        .collection('organizations')
        .doc(organizationId)
        .collection('employees')
        .doc(employeeId)
        .update({ deviceId: null });

      return NextResponse.json({
        success: true,
        message: '✅ Device resetat cu succes!',
      });
    }
  } catch (error: any) {
    console.error('❌ Eroare reset device:', error);
    return NextResponse.json(
      { error: 'Eroare la resetarea device-ului' },
      { status: 500 }
    );
  }
}
