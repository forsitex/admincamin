'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard-new');
    } catch (err: any) {
      setError('Email sau parolă incorectă');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2b4a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/caminempathy-logo.png"
            alt="Cămin Empathy"
            width={220}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h1 className="text-xl font-bold text-[#1a2b4a] text-center mb-1">
            Bun venit
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Conectează-te pentru a continua
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                placeholder="email@exemplu.ro"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">
                Parolă
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Se conectează...' : 'Conectare'}
            </button>
          </form>

        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Cămin Empathy
        </p>
      </div>
    </div>
  );
}

