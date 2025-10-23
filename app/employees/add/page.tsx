'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    shift: 'morning',
  });

  // Generează PIN aleator de 4 cifre
  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('Trebuie să fii autentificat!');
      return;
    }

    setLoading(true);

    try {
      const pin = generatePin();
      
      // Salvează angajatul în Firebase
      const employeesRef = collection(db, 'organizations', auth.currentUser.uid, 'employees');
      await addDoc(employeesRef, {
        ...formData,
        pin: pin,
        deviceId: null, // Va fi setat la prima pontare
        createdAt: Timestamp.now(),
        active: true,
      });

      alert(`✅ Angajat adăugat cu succes!\n\nPIN: ${pin}\n\nNotează acest PIN - angajatul îl va folosi pentru pontaj.`);
      router.push('/employees');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Eroare la adăugarea angajatului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/employees"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la Angajați
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-purple-600" />
            Adaugă Angajat Nou
          </h1>
          <p className="text-gray-600 mt-2">
            Completează datele angajatului. Un PIN unic va fi generat automat pentru pontaj.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nume Complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume Complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="ex: Maria Popescu"
              />
            </div>

            {/* Funcție */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funcție <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
              >
                <option value="">Selectează funcția</option>
                <option value="Asistent medical">Asistent medical</option>
                <option value="Infirmier">Infirmier</option>
                <option value="Bucătar">Bucătar</option>
                <option value="Îngrijitor">Îngrijitor</option>
                <option value="Recepționer">Recepționer</option>
                <option value="Manager">Manager</option>
                <option value="Altă funcție">Altă funcție</option>
              </select>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="ex: 0723456789"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opțional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="ex: maria@email.com"
              />
            </div>

            {/* Tură */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tură Implicită <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
              >
                <option value="morning">Dimineață (06:00 - 14:00)</option>
                <option value="afternoon">După-amiază (14:00 - 22:00)</option>
                <option value="night">Noapte (22:00 - 06:00)</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <strong>📌 Notă:</strong> După salvare, un PIN unic de 4 cifre va fi generat automat. 
                Angajatul va folosi acest PIN pentru pontaj la intrarea în tură.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Adaugă Angajat
                  </>
                )}
              </button>
              <Link
                href="/employees"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-center"
              >
                Anulează
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
