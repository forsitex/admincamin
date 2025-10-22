'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Baby, Save } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AddGradinitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    capacity: '',
    numarGrupe: '',
    program: '',
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

      // Generare ID unic pentru grădiniță
      const gradinitaId = formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      
      // Salvare grădiniță în Firestore (structura nouă: organizations/locations)
      const locationRef = doc(db, 'organizations', user.uid, 'locations', gradinitaId);
      await setDoc(locationRef, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        capacity: parseInt(formData.capacity) || 0,
        numarGrupe: parseInt(formData.numarGrupe) || 0,
        program: formData.program,
        type: 'gradinita', // Tipul specific
        reprezentant: {
          name: formData.reprezentantName,
          phone: formData.reprezentantPhone,
          email: formData.reprezentantEmail,
        },
        createdAt: Date.now(),
      });

      console.log('✅ Grădiniță adăugată cu succes!');
      
      // Redirect la dashboard
      router.push('/dashboard-new');
    } catch (err: any) {
      console.error('❌ Eroare salvare grădiniță:', err);
      setError('Eroare la salvarea grădiniței. Te rugăm să încerci din nou.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
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
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Baby className="w-10 h-10 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Adaugă Grădiniță Nouă
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Completează informațiile despre grădiniță
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informații Grădiniță */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Informații Grădiniță
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume Grădiniță *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="ex: Grădinița Floare de Colț"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="ex: Strada Florilor nr. 10, București"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="ex: contact@gradinita.ro"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacitate Copii *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleChange('capacity', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="ex: 100"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Număr Grupe *
                    </label>
                    <input
                      type="number"
                      value={formData.numarGrupe}
                      onChange={(e) => handleChange('numarGrupe', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="ex: 5"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program *
                    </label>
                    <input
                      type="text"
                      value={formData.program}
                      onChange={(e) => handleChange('program', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="ex: 8:00-17:00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informații Reprezentant */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Reprezentant Grădiniță
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume Complet *
                  </label>
                  <input
                    type="text"
                    value={formData.reprezentantName}
                    onChange={(e) => handleChange('reprezentantName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="ex: Maria Popescu"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="ex: maria@gradinita.ro"
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
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      Salvează Grădiniță
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
