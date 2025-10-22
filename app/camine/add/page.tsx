'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Save } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';

export default function AddCaminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    capacity: '',
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

      // Generare ID unic pentru cămin
      const caminId = formData.name.toLowerCase().replace(/\s+/g, '-');
      
      // Salvare cămin în Firestore
      const caminRef = doc(db, 'companies', user.uid, 'camine', caminId);
      await setDoc(caminRef, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        capacity: parseInt(formData.capacity) || 0,
        reprezentant: {
          name: formData.reprezentantName,
          phone: formData.reprezentantPhone,
          email: formData.reprezentantEmail,
        },
        createdAt: Date.now(),
      });

      console.log('✅ Cămin adăugat cu succes!');
      
      // Redirect la dashboard
      router.push('/dashboard-new');
    } catch (err: any) {
      console.error('❌ Eroare salvare cămin:', err);
      setError('Eroare la salvarea căminului. Te rugăm să încerci din nou.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="w-10 h-10 text-purple-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Adaugă Cămin Nou
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Completează informațiile despre cămin
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nume Cămin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Cămin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="ex: Cămin Fortunei"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>

              {/* Adresă */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresă Completă <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Strada, Număr, Oraș, Județ"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0786 300 500"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contact@camin.ro"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>

              {/* Capacitate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacitate (număr paturi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>

              {/* Separator */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Reprezentant Cămin
                </h3>
              </div>

              {/* Reprezentant - Nume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Complet Reprezentant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reprezentantName}
                  onChange={(e) => handleChange('reprezentantName', e.target.value)}
                  placeholder="Ion Popescu"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>

              {/* Reprezentant - Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Reprezentant <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.reprezentantPhone}
                  onChange={(e) => handleChange('reprezentantPhone', e.target.value)}
                  placeholder="0786 300 500"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>

              {/* Reprezentant - Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Reprezentant <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.reprezentantEmail}
                  onChange={(e) => handleChange('reprezentantEmail', e.target.value)}
                  placeholder="reprezentant@camin.ro"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Se salvează...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Salvează Cămin
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
