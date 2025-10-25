'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, User, Phone, Mail, Edit2, Save, X, Users, FileText, Pencil, Camera } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function CaminDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const caminId = params.id as string;

  const [camin, setCamin] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    reprezentantName: '',
    reprezentantPhone: '',
    reprezentantEmail: '',
  });

  useEffect(() => {
    // Așteaptă ca Firebase Auth să se inițializeze
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadCamin();
        loadResidents();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [caminId]);

  const loadCamin = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Încearcă mai întâi structura nouă (organizations/locations)
      let caminRef = doc(db, 'organizations', user.uid, 'locations', caminId);
      let caminSnap = await getDoc(caminRef);

      // Dacă nu există, încearcă structura veche (companies/camine)
      if (!caminSnap.exists()) {
        caminRef = doc(db, 'companies', user.uid, 'camine', caminId);
        caminSnap = await getDoc(caminRef);
      }

      if (caminSnap.exists()) {
        const data: any = { id: caminSnap.id, ...caminSnap.data() };
        setCamin(data);
        setEditData({
          reprezentantName: data.reprezentant?.name || '',
          reprezentantPhone: data.reprezentant?.phone || '',
          reprezentantEmail: data.reprezentant?.email || '',
        });
      } else {
        alert('Căminul nu a fost găsit!');
        router.push('/dashboard-new');
      }
    } catch (error) {
      console.error('Error loading camin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResidents = async () => {
    try {
      setLoadingResidents(true);
      const user = auth.currentUser;
      if (!user) return;

      console.log('🔍 Încărcare rezidenți pentru cămin:', caminId);
      console.log('👤 User ID:', user.uid);

      let residentsList: any[] = [];

      // Încearcă mai întâi structura nouă (organizations/locations/residents)
      try {
        const path1 = `organizations/${user.uid}/locations/${caminId}/residents`;
        console.log('📍 Încercare încărcare din structura nouă:', path1);
        const residentsRef1 = collection(db, 'organizations', user.uid, 'locations', caminId, 'residents');
        const residentsSnap1 = await getDocs(query(residentsRef1));
        
        if (residentsSnap1.size > 0) {
          console.log('✅ Găsiți', residentsSnap1.size, 'rezidenți în structura nouă');
          residentsList = residentsSnap1.docs.map(doc => ({
            cnp: doc.id,
            ...doc.data()
          }));
        } else {
          console.log('⚠️ Nu s-au găsit rezidenți în structura nouă, încerc structura veche...');
        }
      } catch (error) {
        console.log('⚠️ Eroare la încărcare din structura nouă:', error);
      }

      // Dacă nu găsește în structura nouă, încearcă structura veche
      if (residentsList.length === 0) {
        const path2 = `companies/${user.uid}/camine/${caminId}/residents`;
        console.log('📍 Încărcare din structura veche:', path2);
        const residentsRef2 = collection(db, 'companies', user.uid, 'camine', caminId, 'residents');
        const residentsSnap2 = await getDocs(query(residentsRef2));
        
        console.log('📊 Număr documente găsite în structura veche:', residentsSnap2.size);
        residentsList = residentsSnap2.docs.map(doc => ({
          cnp: doc.id,
          ...doc.data()
        }));
      }

      console.log('✅ Total rezidenți încărcați:', residentsList.length);
      setResidents(residentsList);
    } catch (error) {
      console.error('❌ Error loading residents:', error);
    } finally {
      setLoadingResidents(false);
    }
  };

  const handleSaveReprezentant = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Încearcă mai întâi structura nouă (organizations/locations)
      let caminRef = doc(db, 'organizations', user.uid, 'locations', caminId);
      let caminSnap = await getDoc(caminRef);

      // Dacă nu există, folosește structura veche (companies/camine)
      if (!caminSnap.exists()) {
        caminRef = doc(db, 'companies', user.uid, 'camine', caminId);
      }

      await updateDoc(caminRef, {
        reprezentant: {
          name: editData.reprezentantName,
          phone: editData.reprezentantPhone,
          email: editData.reprezentantEmail,
        }
      });

      // Actualizează starea locală
      setCamin({
        ...camin,
        reprezentant: {
          name: editData.reprezentantName,
          phone: editData.reprezentantPhone,
          email: editData.reprezentantEmail,
        }
      });

      setEditMode(false);
      console.log('✅ Reprezentant actualizat cu succes!');
    } catch (error) {
      console.error('❌ Eroare actualizare reprezentant:', error);
      alert('Eroare la salvarea datelor. Te rugăm să încerci din nou.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      reprezentantName: camin.reprezentant?.name || '',
      reprezentantPhone: camin.reprezentant?.phone || '',
      reprezentantEmail: camin.reprezentant?.email || '',
    });
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!camin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Header cu gradient */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => router.push('/dashboard-new')}
            className="flex items-center gap-2 text-white hover:text-purple-100 transition transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Înapoi la Dashboard</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Detalii Cămin - Card cu gradient și glow */}
          <div className="relative bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-8 border-2 border-purple-200 transform hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            {/* Glow Effect - Permanent */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-3xl blur-lg opacity-75 animate-glow"></div>
            <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{camin.name}</h1>
                  <p className="text-gray-700 mt-2 text-lg font-medium">{camin.address}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500 hover:shadow-xl transition">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Telefon</p>
                <p className="text-xl font-bold text-gray-900">{camin.phone}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500 hover:shadow-xl transition">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                <p className="text-xl font-bold text-gray-900">{camin.email}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500 hover:shadow-xl transition">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Capacitate</p>
                <p className="text-xl font-bold text-gray-900">{camin.capacity} paturi</p>
              </div>
            </div>
            </div>
          </div>

          {/* Reprezentant Cămin - Card simplu */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Reprezentant Cămin</h2>
              </div>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition transform hover:scale-105 shadow-lg"
                >
                  <Edit2 className="w-5 h-5" />
                  Editează
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveReprezentant}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition transform hover:scale-105 shadow-lg disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    Salvează
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition transform hover:scale-105 shadow-lg disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    Anulează
                  </button>
                </div>
              )}
            </div>

            {!editMode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nume Complet</p>
                    <p className="text-lg font-semibold text-gray-900">{camin.reprezentant?.name || 'Nu este setat'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <p className="text-lg font-semibold text-gray-900">{camin.reprezentant?.phone || 'Nu este setat'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{camin.reprezentant?.email || 'Nu este setat'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume Complet
                  </label>
                  <input
                    type="text"
                    value={editData.reprezentantName}
                    onChange={(e) => setEditData({ ...editData, reprezentantName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Ion Popescu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={editData.reprezentantPhone}
                    onChange={(e) => setEditData({ ...editData, reprezentantPhone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="0786 300 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.reprezentantEmail}
                    onChange={(e) => setEditData({ ...editData, reprezentantEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="reprezentant@camin.ro"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lista Rezidenți - Card vibrant cu glow */}
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 border-2 border-purple-200 overflow-hidden">
            {/* Glow Effect - Permanent */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-3xl blur-lg opacity-75 animate-glow"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Rezidenți ({residents.length})
                </h2>
                <Link
                  href="/residents/add"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 shadow-xl"
                >
                  + Adaugă Rezident
                </Link>
              </div>

              {loadingResidents ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 mt-4">Încărcare rezidenți...</p>
                </div>
              ) : residents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium">Nu există rezidenți adăugați încă</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {residents.map((resident) => (
                    <div
                      key={resident.cnp}
                      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition border-2 border-purple-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{resident.beneficiarNumeComplet}</h3>
                          <p className="text-sm text-gray-600">CNP: {resident.cnp}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/residents/${resident.cnp}/edit`}
                            className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition flex items-center gap-1.5"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editează
                          </Link>
                          <Link
                            href={`/residents/${resident.cnp}/gallery?caminId=${caminId}`}
                            className="px-3 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition flex items-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Galerie
                          </Link>
                          <Link
                            href={`/residents/${resident.cnp}/generate-documents`}
                            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Documente
                          </Link>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><span className="font-medium">Adresă:</span> {resident.beneficiarAdresa}</p>
                        {resident.beneficiarTelefon && (
                          <p><span className="font-medium">Telefon:</span> {resident.beneficiarTelefon}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
