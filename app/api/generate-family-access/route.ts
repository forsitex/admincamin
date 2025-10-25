import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId, locationId, residentCnp, apartinatorEmail, residentName } = await request.json();

    if (!userId || !locationId || !residentCnp || !apartinatorEmail) {
      return NextResponse.json({ error: 'Date lipsă' }, { status: 400 });
    }

    console.log('🔐 Generare acces pentru:', apartinatorEmail);

    // Verificăm dacă există deja un token
    const accessRef = adminDb
      .collection('companies')
      .doc(userId)
      .collection('camine')
      .doc(locationId)
      .collection('residents')
      .doc(residentCnp)
      .collection('familyAccess')
      .doc('main');

    const existingAccess = await accessRef.get();
    
    let accessToken: string;
    
    if (existingAccess.exists && existingAccess.data()?.accessToken) {
      // Folosim token-ul existent
      accessToken = existingAccess.data()!.accessToken;
      console.log('✅ Token existent găsit, reutilizare');
    } else {
      // Generăm token nou doar dacă nu există
      accessToken = crypto.randomBytes(32).toString('hex');
      console.log('🆕 Token nou generat');
      
      await accessRef.set({
        email: apartinatorEmail,
        accessToken,
        residentName: residentName || '',
        createdAt: FieldValue.serverTimestamp(),
        lastAccess: null,
      });
    }

    // Generare link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${baseUrl}/family-portal/${accessToken}/gallery`;

    console.log('✅ Acces generat:', link);

    return NextResponse.json({
      success: true,
      link,
      accessToken,
    });
  } catch (error: any) {
    console.error('❌ Eroare generare acces:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
