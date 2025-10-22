'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Hotel, Save } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AddHotelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    capacity: '',
    numarStele: '',
    facilitati: '',
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

      // Generare ID unic pentru hotel
      const hotelId = formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      
      // Salvare hotel în Firestore (structura nouă: organizations/locations)
      const locationRef = doc(db, 'organizations', user.uid, 'locations', hotelId);
      await setDoc(locationRef, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        capacity: parseInt(formData.capacity) || 0,
        numarStele: parseInt(formData.numarStele) || 0,
        facilitati: formData.facilitati.split(',').map(f => f.trim()).filter(f => f),
        type: 'hotel', // Tipul specific
        reprezentant: {
          name: formData.reprezentantName,
          phone: formData.reprezentantPhone,
          email: formData.reprezentantEmail,
        },
        createdAt: Date.now(),
      });

      console.log('✅ Hotel adăugat cu succes!');
      
      // Redirect la dashboard
      router.push('/dashboard-new');
    } catch (err: any) {
      console.error('❌ Eroare salvare hotel:', err);
      setError('Eroare la salvarea hotelului. Te rugăm să încerci din nou.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
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
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hotel className="w-10 h-10 text-orange-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Adaugă Hotel Nou
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Completează informațiile despre hotel
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informații Hotel */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Informații Hotel
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume Hotel *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="ex: Hotel Grand Plaza"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="ex: Bd. Unirii nr. 10, București"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                      placeholder="ex: contact@hotel.ro"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Număr Camere *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleChange('capacity', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                      placeholder="ex: 50"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Număr Stele *
                    </label>
                    <select
                      value={formData.numarStele}
                      onChange={(e) => handleChange('numarStele', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                      required
                    >
                      <option value="">Selectează...</option>
                      <option value="1">⭐ (1 stea)</option>
                      <option value="2">⭐⭐ (2 stele)</option>
                      <option value="3">⭐⭐⭐ (3 stele)</option>
                      <option value="4">⭐⭐⭐⭐ (4 stele)</option>
                      <option value="5">⭐⭐⭐⭐⭐ (5 stele)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facilități *
                  </label>
                  <input
                    type="text"
                    value={formData.facilitati}
                    onChange={(e) => handleChange('facilitati', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="ex: Restaurant, Piscină, Spa, WiFi, Parcare (separate prin virgulă)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate prin virgulă</p>
                </div>
              </div>

              {/* Informații Reprezentant */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Reprezentant Hotel
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume Complet *
                  </label>
                  <input
                    type="text"
                    value={formData.reprezentantName}
                    onChange={(e) => handleChange('reprezentantName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="ex: Alexandru Ionescu"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                      placeholder="ex: alexandru@hotel.ro"
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
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      Salvează Hotel
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
