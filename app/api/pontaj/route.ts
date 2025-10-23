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
        { error: 'Firebase Admin nu este configurat. Adaugă credențialele în Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    const { pin, deviceId, type, locationId } = await request.json();

    // Validare input
    if (!pin || !deviceId || !type) {
      return NextResponse.json(
        { error: 'Date incomplete. PIN, deviceId și type sunt obligatorii.' },
        { status: 400 }
      );
    }

    if (type !== 'check-in' && type !== 'check-out') {
      return NextResponse.json(
        { error: 'Tip invalid. Folosește check-in sau check-out.' },
        { status: 400 }
      );
    }

    // 1. Caută angajatul după PIN în toate organizațiile
    let employeeFound: any = null;
    let organizationId: string | null = null;
    let employeeDocRef: any = null;

    const organizationsSnapshot = await adminDb.collection('organizations').get();

    for (const orgDoc of organizationsSnapshot.docs) {
      const employeesSnapshot = await adminDb
        .collection('organizations')
        .doc(orgDoc.id)
        .collection('employees')
        .where('pin', '==', pin)
        .get();

      if (!employeesSnapshot.empty) {
        const empDoc = employeesSnapshot.docs[0];
        employeeFound = { id: empDoc.id, ...empDoc.data() };
        organizationId = orgDoc.id;
        employeeDocRef = empDoc.ref;
        break;
      }
    }

    if (!employeeFound || !organizationId) {
      return NextResponse.json(
        { error: 'PIN incorect! Verifică și încearcă din nou.' },
        { status: 401 }
      );
    }

    // 2. Verifică device-ul (anti-fraudă)
    if (employeeFound.deviceId && employeeFound.deviceId !== deviceId) {
      // 🚨 TENTATIVĂ DE FRAUDĂ!
      await adminDb
        .collection('organizations')
        .doc(organizationId)
        .collection('security_alerts')
        .add({
          type: 'device_mismatch',
          employeeId: employeeFound.id,
          employeeName: employeeFound.name,
          attemptedDeviceId: deviceId,
          registeredDeviceId: employeeFound.deviceId,
          attemptedPin: pin,
          timestamp: new Date(),
          resolved: false,
        });

      return NextResponse.json(
        {
          error: `⚠️ Acest PIN aparține lui ${employeeFound.name}, dar dispozitivul nu se potrivește! Tentativa a fost raportată administratorului.`,
        },
        { status: 403 }
      );
    }

    // 3. Dacă e prima pontare, salvează device-ul
    if (!employeeFound.deviceId && employeeDocRef) {
      await employeeDocRef.update({ deviceId: deviceId });
    }

    // 4. Încarcă informații despre locație (dacă există)
    let locationName = null;
    if (locationId) {
      const locationDoc = await adminDb
        .collection('organizations')
        .doc(organizationId)
        .collection('locations')
        .doc(locationId)
        .get();

      if (locationDoc.exists) {
        locationName = locationDoc.data()?.name || null;
      }
    }

    // 5. Salvează pontajul
    const today = new Date().toISOString().split('T')[0];
    await adminDb
      .collection('organizations')
      .doc(organizationId)
      .collection('attendance')
      .add({
        employeeId: employeeFound.id,
        employeeName: employeeFound.name,
        employeeRole: employeeFound.role,
        type: type,
        deviceId: deviceId,
        locationId: locationId || null,
        locationName: locationName,
        timestamp: new Date(),
        date: today,
      });

    // 6. Returnează success
    return NextResponse.json({
      success: true,
      message: `✅ ${type === 'check-in' ? 'Intrat' : 'Ieșit'} în tură cu succes!`,
      employee: {
        name: employeeFound.name,
        role: employeeFound.role,
      },
      location: locationName,
      time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
    });

  } catch (error: any) {
    console.error('❌ Eroare API pontaj:', error);
    return NextResponse.json(
      { error: 'Eroare la salvarea pontajului. Te rugăm să încerci din nou.' },
      { status: 500 }
    );
  }
}
