'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Save } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AddClinicaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    capacity: '',
    specialitati: '',
    programConsultatii: '',
    reprezentantName: '',
    reprezentantPhone: '',
    reprezentantEmail: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Generare ID unic pentru clinică
      const clinicaId = formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      
      // Salvare clinică în Firestore (structura nouă: organizations/locations)
      const locationRef = doc(db, 'organizations', user.uid, 'locations', clinicaId);
      await setDoc(locationRef, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        capacity: parseInt(formData.capacity) || 0,
        specialitati: formData.specialitati.split(',').map(s => s.trim()).filter(s => s),
        programConsultatii: formData.programConsultatii,
        type: 'spital', // Tipul specific
        reprezentant: {
          name: formData.reprezentantName,
          phone: formData.reprezentantPhone,
          email: formData.reprezentantEmail,
        },
        createdAt: Date.now(),
      });

      console.log('✅ Clinică adăugată cu succes!');
      
      // Redirect la dashboard
      router.push('/dashboard-new');
    } catch (err: any) {
      console.error('❌ Eroare salvare clinică:', err);
      setError('Eroare la salvarea clinicii. Te rugăm să încerci din nou.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.push('/dashboard-new')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Înapoi la Dashboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Adaugă Clinică Nouă
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Completează informațiile despre clinică
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informații Clinică */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Informații Clinică
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume Clinică *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    placeholder="ex: Clinica Medicală Sanomed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresă *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    placeholder="ex: Bd. Carol I nr. 15, București"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      placeholder="ex: 0721234567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      placeholder="ex: contact@clinica.ro"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Număr Paturi *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleChange('capacity', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      placeholder="ex: 50"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Consultații *
                    </label>
                    <input
                      type="text"
                      value={formData.programConsultatii}
                      onChange={(e) => handleChange('programConsultatii', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      placeholder="ex: 8:00-20:00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialități Medicale *
                  </label>
                  <input
                    type="text"
                    value={formData.specialitati}
                    onChange={(e) => handleChange('specialitati', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    placeholder="ex: Cardiologie, Neurologie, Pediatrie (separate prin virgulă)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate prin virgulă</p>
                </div>
              </div>

              {/* Informații Reprezentant */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Reprezentant Clinică
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume Complet *
                  </label>
                  <input
                    type="text"
                    value={formData.reprezentantName}
                    onChange={(e) => handleChange('reprezentantName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                    placeholder="ex: Dr. Ion Popescu"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={formData.reprezentantPhone}
                      onChange={(e) => handleChange('reprezentantPhone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      placeholder="ex: 0721234567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.reprezentantEmail}
                      onChange={(e) => handleChange('reprezentantEmail', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      placeholder="ex: dr.popescu@clinica.ro"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard-new')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Se salvează...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvează Clinică
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
