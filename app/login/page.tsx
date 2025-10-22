'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Autentificare cu Firebase Auth
      console.log('🔐 Încercare autentificare:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Autentificare reușită!', userCredential.user.email);
      
      // Salvare user în localStorage pentru persistență
      localStorage.setItem('user', JSON.stringify({
        email: userCredential.user.email,
        uid: userCredential.user.uid
      }));

      // Redirect la dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Eroare autentificare:', err);
      
      // Mesaje de eroare user-friendly
      if (err.code === 'auth/user-not-found') {
        setError('Nu există cont cu acest email. Te rugăm să te înregistrezi.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Parolă incorectă. Te rugăm să încerci din nou.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email invalid. Te rugăm să verifici adresa de email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Prea multe încercări. Te rugăm să aștepți câteva minute.');
      } else {
        setError('Eroare la autentificare. Te rugăm să încerci din nou.');
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
          <h1 className="text-2xl font-bold text-gray-900">Bine ai revenit!</h1>
          <p className="text-gray-600 mt-2">Conectează-te la contul tău</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-600">Ține-mă minte</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Ai uitat parola?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se conectează...' : 'Conectare'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Nu ai cont?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                Înregistrează-te
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
