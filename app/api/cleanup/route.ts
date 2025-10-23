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

    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId lipsește' },
        { status: 400 }
      );
    }

    let totalDeleted = 0;

    // 1. Șterge toate pontajele
    const attendanceSnapshot = await adminDb
      .collection('organizations')
      .doc(organizationId)
      .collection('attendance')
      .get();

    const attendanceBatch = adminDb.batch();
    attendanceSnapshot.docs.forEach((doc: any) => {
      attendanceBatch.delete(doc.ref);
      totalDeleted++;
    });
    await attendanceBatch.commit();

    // 2. Șterge toate alertele
    const alertsSnapshot = await adminDb
      .collection('organizations')
      .doc(organizationId)
      .collection('security_alerts')
      .get();

    const alertsBatch = adminDb.batch();
    alertsSnapshot.docs.forEach((doc: any) => {
      alertsBatch.delete(doc.ref);
      totalDeleted++;
    });
    await alertsBatch.commit();

    // 3. Reset device-uri la toți angajații
    const employeesSnapshot = await adminDb
      .collection('organizations')
      .doc(organizationId)
      .collection('employees')
      .get();

    const employeesBatch = adminDb.batch();
    let employeesReset = 0;

    employeesSnapshot.docs.forEach((doc: any) => {
      if (doc.data().deviceId) {
        employeesBatch.update(doc.ref, { deviceId: null });
        employeesReset++;
      }
    });
    await employeesBatch.commit();

    return NextResponse.json({
      success: true,
      message: `🧹 Curățare completă finalizată!`,
      details: {
        pontajeSterse: attendanceSnapshot.size,
        alerteSterse: alertsSnapshot.size,
        deviceuriResetate: employeesReset,
        totalDocumenteSterse: totalDeleted,
      },
    });

  } catch (error: any) {
    console.error('❌ Eroare cleanup:', error);
    return NextResponse.json(
      { error: 'Eroare la curățare: ' + error.message },
      { status: 500 }
    );
  }
}
