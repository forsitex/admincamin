import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updateEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCd3rxFDvSYJ8jlVc7ZlyYs2liDt8nKT1o",
  authDomain: "iempathy-ffc85.firebaseapp.com",
  projectId: "iempathy-ffc85",
  storageBucket: "iempathy-ffc85.firebasestorage.app",
  messagingSenderId: "252693456701",
  appId: "1:252693456701:web:43d7fd9baf4e7abfa84754"
};

const app = initializeApp(firebaseConfig, 'update-email');
const auth = getAuth(app);
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const { currentEmail, password, newEmail } = await request.json();

    if (!currentEmail || !password || !newEmail) {
      return NextResponse.json({ error: 'Lipsesc datele' }, { status: 400 });
    }

    // 1. Autentificare
    const cred = await signInWithEmailAndPassword(auth, currentEmail, password);
    const oldUid = cred.user.uid;
    console.log('✅ Autentificat ca:', currentEmail, 'UID:', oldUid);

    // 2. Copiem datele din organizations/{oldUid}
    const orgDoc = await getDoc(doc(db, 'organizations', oldUid));
    if (orgDoc.exists()) {
      console.log('📄 Date organizație găsite, copiem...');
      await setDoc(doc(db, 'organizations', oldUid), {
        ...orgDoc.data(),
        email: newEmail
      }, { merge: true });
    }

    // 3. Schimbăm email-ul
    await updateEmail(cred.user, newEmail);
    console.log('✅ Email actualizat la:', newEmail);

    return NextResponse.json({
      success: true,
      message: `Email schimbat din ${currentEmail} în ${newEmail}`,
      uid: oldUid
    });
  } catch (error: any) {
    console.error('❌ Eroare:', error);
    return NextResponse.json({
      error: 'Eroare la schimbarea email-ului',
      details: error.message
    }, { status: 500 });
  }
}
