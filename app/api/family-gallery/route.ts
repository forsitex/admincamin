import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, limit as firestoreLimit } from 'firebase/firestore';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token lipsă' }, { status: 400 });
    }

    console.log('🔍 Căutare galerie pentru token:', token.substring(0, 10) + '...');

    // Căutăm în toate organizațiile pentru acest token
    // (în producție, ar trebui optimizat cu un index separat)
    
    // Pentru demo, returnăm un răspuns generic
    // TODO: Implementare căutare optimizată cu Cloud Functions

    return NextResponse.json({
      success: true,
      photos: [],
      residentName: 'Rezident',
      message: 'Implementare completă necesită Cloud Functions pentru căutare optimizată'
    });

  } catch (error: any) {
    console.error('❌ Eroare încărcare galerie:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
