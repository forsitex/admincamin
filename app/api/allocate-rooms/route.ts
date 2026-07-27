import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { DISTRIBUTION_BY_LOCATION } from '@/lib/room-distribution';

const firebaseConfig = {
  apiKey: "AIzaSyCd3rxFDvSYJ8jlVc7ZlyYs2liDt8nKT1o",
  authDomain: "iempathy-ffc85.firebaseapp.com",
  projectId: "iempathy-ffc85",
  storageBucket: "iempathy-ffc85.firebasestorage.app",
  messagingSenderId: "252693456701",
  appId: "1:252693456701:web:43d7fd9baf4e7abfa84754"
};

const app = initializeApp(firebaseConfig, 'allocate-rooms');
const db = getFirestore(app);
const auth = getAuth(app);

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/ş/g, 's')
    .replace(/ţ/g, 't');
}

function fuzzyMatch(residentName: string, distributionName: string): boolean {
  const r = normalizeName(residentName);
  const d = normalizeName(distributionName);

  // Exact match
  if (r === d) return true;

  // One contains the other
  if (r.includes(d) || d.includes(r)) return true;

  // Match on last name (last word)
  const rParts = r.split(' ');
  const dParts = d.split(' ');
  const rLast = rParts[rParts.length - 1];
  const dLast = dParts[dParts.length - 1];
  if (rLast === dLast && rLast.length > 2) return true;

  // Match on first + last
  if (rParts.length >= 2 && dParts.length >= 2) {
    if (rParts[0] === dParts[0] && rLast === dLast) return true;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const { uid, locationId } = await request.json();

    if (!uid || !locationId) {
      return NextResponse.json({ error: 'Lipsesc uid sau locationId' }, { status: 400 });
    }

    // Autentificare pentru permisiuni Firestore
    const email = request.headers.get('x-auth-email') || '';
    const password = request.headers.get('x-auth-password') || '';

    if (email && password) {
      await signInWithEmailAndPassword(auth, email, password);
    }

    const distribution = DISTRIBUTION_BY_LOCATION[locationId];
    if (!distribution) {
      return NextResponse.json({ error: `Nu există distribuție pentru ${locationId}` }, { status: 400 });
    }

    // Incarcam rezidentii din Firestore
    const resRef = collection(db, 'organizations', uid, 'locations', locationId, 'residents');
    const resSnap = await getDocs(resRef);
    const residents = resSnap.docs.map(d => ({ cnp: d.id, ...d.data() } as any));

    console.log(`📋 ${residents.length} rezidenți în Firestore pentru ${locationId}`);
    console.log(`📋 ${Object.values(distribution).flat().length} nume în distribuție`);

    const results: any[] = [];
    let matched = 0;
    let unmatched: string[] = [];

    // Pentru fiecare camera din distribuție
    for (const [roomNumber, names] of Object.entries(distribution)) {
      const roomId = `room-${roomNumber}`;

      for (const distName of names) {
        if (distName === 'IZOLATOR') continue;

        // Cautam match in Firestore
        let bestMatch: any = null;
        let bestScore = 0;

        for (const resident of residents) {
          const resName = resident.beneficiarNumeComplet || '';
          if (fuzzyMatch(resName, distName)) {
            const score = normalizeName(resName) === normalizeName(distName) ? 100 : 50;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = resident;
            }
          }
        }

        if (bestMatch) {
          // Actualizam rezidentul cu roomId
          await updateDoc(doc(db, 'organizations', uid, 'locations', locationId, 'residents', bestMatch.cnp), {
            roomId: roomId,
            roomNumber: roomNumber,
          });

          results.push({
            distributionName: distName,
            residentName: bestMatch.beneficiarNumeComplet,
            cnp: bestMatch.cnp,
            roomNumber,
            score: bestScore,
          });
          matched++;
        } else {
          unmatched.push(distName);
        }
      }
    }

    console.log(`✅ ${matched} rezidenți alocați`);
    console.log(`❌ ${unmatched.length} fără match:`, unmatched);

    return NextResponse.json({
      success: true,
      locationId,
      totalResidents: residents.length,
      matched,
      unmatched,
      results,
    });
  } catch (error: any) {
    console.error('❌ Eroare:', error);
    return NextResponse.json({
      error: 'Eroare la alocare',
      details: error.message
    }, { status: 500 });
  }
}
