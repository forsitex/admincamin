'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Loader2, LogIn, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function LoginEducatoarePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // PASUL 1: Verifică dacă există grupa cu acest email + parolă în Firestore
      const organizationsRef = collection(db, 'organizations');
      const organizationsSnap = await getDocs(organizationsRef);

      let foundGrupa: any = null;
      let organizationId = '';
      let locationId = '';

      // Caută grupa în toate organizațiile
      for (const orgDoc of organizationsSnap.docs) {
        const orgId = orgDoc.id;
        const locationsRef = collection(db, 'organizations', orgId, 'locations');
        const locationsSnap = await getDocs(locationsRef);

        for (const locDoc of locationsSnap.docs) {
          const locData = locDoc.data();
          const grupe = locData.grupe || [];

          const grupa = grupe.find((g: any) => 
            g.emailEducatoare === formData.email && 
            g.parolaEducatoare === formData.password
          );

          if (grupa) {
            foundGrupa = {
              ...grupa,
              gradinitaNume: locData.name
            };
            organizationId = orgId;
            locationId = locDoc.id;
            break;
          }
        }

        if (foundGrupa) break;
      }

      if (!foundGrupa) {
        setError('❌ Email sau parolă incorectă!');
        setLoading(false);
        return;
      }

      console.log('✅ Grupă găsită în Firestore:', foundGrupa.nume);

      // PASUL 2: Încearcă să te autentifici cu Firebase Auth
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        console.log('✅ Login Firebase Auth reușit');
      } catch (authError: any) {
        // Dacă contul nu există, creează-l automat
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
          console.log('⚠️ Cont inexistent - creez cont nou...');
          
          try {
            userCredential = await createUserWithEmailAndPassword(
              auth,
              formData.email,
              formData.password
            );
            
            // Salvează informații educatoare în Firestore
            await setDoc(doc(db, 'educatoare', userCredential.user.uid), {
              email: formData.email,
              organizationId: organizationId,
              locationId: locationId,
              grupaId: foundGrupa.id,
              role: 'educatoare',
              createdAt: new Date()
            });
            
            console.log('✅ Cont Firebase Auth creat cu succes!');
            
            // Așteaptă 1 secundă pentru ca documentul să fie disponibil în Firestore
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (createError: any) {
            console.error('❌ Eroare creare cont:', createError);
            setError('❌ Eroare la crearea contului. Te rog contactează administratorul.');
            setLoading(false);
            return;
          }
        } else {
          throw authError;
        }
      }

      // PASUL 3: Salvează/Actualizează documentul educatoare în Firestore
      await setDoc(doc(db, 'educatoare', userCredential.user.uid), {
        email: formData.email,
        organizationId: organizationId,
        locationId: locationId,
        grupaId: foundGrupa.id,
        role: 'educatoare',
        lastLogin: new Date()
      }, { merge: true }); // merge: true pentru a nu șterge datele existente

      console.log('✅ Login complet - redirect la dashboard');

      // Redirect la dashboard educatoare
      router.push('/dashboard-educatoare');

    } catch (error: any) {
      console.error('❌ Eroare login:', error);
      setError('❌ Eroare la autentificare. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👩‍🏫 Login Educatoare
          </h1>
          <p className="text-gray-600">
            Bine ai venit! Introdu datele tale de acces.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="ex: maria@gradinita.ro"
                disabled={loading}
              />
            </div>

            {/* Parolă */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parolă <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="Parola primită de la administrator"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Se autentifică...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Intră în cont
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900">
              <strong>📌 Notă:</strong> Dacă nu ai primit datele de acces, te rog contactează administratorul grădiniței.
            </p>
          </div>

          {/* Link către login administrator */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Ești administrator? Loghează-te aici →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
