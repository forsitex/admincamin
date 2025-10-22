'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createCompany } from '@/lib/firestore';

export default function RegisterPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validări
    if (password !== confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    if (password.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere');
      return;
    }

    setLoading(true);

    try {
      // Creare cont cu Firebase Auth
      console.log('📝 Creare cont nou firmă:', companyName, email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizare profil cu numele firmei
      await updateProfile(userCredential.user, {
        displayName: companyName
      });
      
      console.log('✅ Cont creat cu succes!', userCredential.user.email);
      
      // Salvare companie în Firestore
      await createCompany(userCredential.user.uid, companyName, email);
      
      // Salvare user + companie în localStorage
      localStorage.setItem('user', JSON.stringify({
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        companyName: companyName
      }));

      // Redirect la dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Eroare creare cont:', err);
      
      // Mesaje de eroare user-friendly
      if (err.code === 'auth/email-already-in-use') {
        setError('Există deja un cont cu acest email. Te rugăm să te autentifici.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email invalid. Te rugăm să verifici adresa de email.');
      } else if (err.code === 'auth/weak-password') {
        setError('Parolă prea slabă. Te rugăm să folosești o parolă mai puternică.');
      } else {
        setError('Eroare la crearea contului. Te rugăm să încerci din nou.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image 
              src="/admin-camine.png" 
              alt="Admin Camin Batrani" 
              width={200} 
              height={70}
              className="mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Creează cont nou</h1>
          <p className="text-gray-600 mt-2">Înregistrează-te pentru a accesa platforma</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Nume Firmă
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="EMPATHY SUPPORT SRL"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition uppercase"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplu.ro"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Parolă
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmă parola
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se creează contul...' : 'Creează cont'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Ai deja cont?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Conectează-te
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Înapoi la pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
}
