'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, User, Phone, Mail, Edit2, Save, X, Users, FileText, Trash2, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, getDocs } from 'firebase/firestore';
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
  const [deletingAll, setDeletingAll] = useState(false);
  
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

      // Încarcă din organizations/locations
      const caminRef = doc(db, 'organizations', user.uid, 'locations', caminId);
      const caminSnap = await getDoc(caminRef);

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

      const residentsRef = collection(db, 'organizations', user.uid, 'locations', caminId, 'residents');
      const residentsSnap = await getDocs(query(residentsRef));
      const residentsList = residentsSnap.docs.map(doc => ({
        cnp: doc.id,
        ...doc.data()
      }));

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

      const caminRef = doc(db, 'organizations', user.uid, 'locations', caminId);

      await updateDoc(caminRef, {
        reprezentant: {
          name: editData.reprezentantName,
          phone: editData.reprezentantPhone,
          email: editData.reprezentantEmail,
        }
      });

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

  const handleDeleteAllResidents = async () => {
    if (!confirm(`Sigur vrei să ștergi TOȚI cei ${residents.length} rezidenți din ${camin.name}?`)) return;

    setDeletingAll(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      for (const resident of residents) {
        const cnp = resident.beneficiarCnp || resident.cnp;
        await deleteDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', cnp));
      }

      setResidents([]);
      console.log(`✅ Șterși ${residents.length} rezidenți din ${camin.name}`);
    } catch (error) {
      console.error('❌ Eroare ștergere rezidenți:', error);
      alert('Eroare la ștergere. Încearcă din nou.');
    } finally {
      setDeletingAll(false);
    }
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
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-[#1a2b4a]">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <button
            onClick={() => router.push('/dashboard-new')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Înapoi la Dashboard</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Detalii Cămin */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#1a2b4a]/5 rounded-xl flex items-center justify-center">
                  <Building className="w-7 h-7 text-[#1a2b4a]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1a2b4a]">{camin.name}</h1>
                  <p className="text-gray-500 mt-1 text-sm">{camin.address}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#f5f5f0] rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Telefon</p>
                <p className="text-lg font-semibold text-[#1a2b4a]">{camin.phone || '—'}</p>
              </div>
              <div className="bg-[#f5f5f0] rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-lg font-semibold text-[#1a2b4a]">{camin.email || '—'}</p>
              </div>
              <div className="bg-[#f5f5f0] rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Capacitate</p>
                <p className="text-lg font-semibold text-[#1a2b4a]">{camin.capacity} paturi</p>
              </div>
            </div>
          </div>

          {/* Reprezentant Cămin */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1a2b4a]/5 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1a2b4a]" />
                </div>
                <h2 className="text-lg font-bold text-[#1a2b4a]">Reprezentant Cămin</h2>
              </div>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Editează
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveReprezentant}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Salvează
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                    placeholder="reprezentant@camin.ro"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lista Rezidenți */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#1a2b4a]">
                  Rezidenți ({residents.length})
                </h2>
                <div className="flex items-center gap-2">
                  {residents.length > 0 && (
                    <button
                      onClick={handleDeleteAllResidents}
                      disabled={deletingAll}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition disabled:opacity-50 text-sm"
                    >
                      {deletingAll ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Șterge Toți
                    </button>
                  )}
                  <Link
                    href="/residents/add"
                    className="px-4 py-2 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition text-sm"
                  >
                    + Adaugă Rezident
                  </Link>
                </div>
              </div>

              {loadingResidents ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 border-[#1a2b4a] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 mt-4 text-sm">Încărcare rezidenți...</p>
                </div>
              ) : residents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-[#1a2b4a]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-[#1a2b4a]/40" />
                  </div>
                  <p className="text-gray-500 text-sm">Nu există rezidenți adăugați încă</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {residents.map((resident) => (
                    <div
                      key={resident.cnp}
                      className="bg-[#f5f5f0] rounded-lg p-5 hover:shadow-md transition border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Link href={`/residents/${resident.cnp}`} className="hover:text-[#c9a96e] transition">
                          <h3 className="text-base font-bold text-[#1a2b4a]">{resident.beneficiarNumeComplet}</h3>
                          <p className="text-xs text-gray-500">CNP: {resident.cnp}</p>
                        </Link>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/residents/${resident.cnp}`}
                            className="px-3 py-1.5 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition text-xs"
                          >
                            Vezi detalii
                          </Link>
                          <Link
                            href={`/residents/${resident.cnp}/generate-documents`}
                            className="px-3 py-1.5 bg-[#c9a96e]/10 text-[#c9a96e] rounded-lg font-medium hover:bg-[#c9a96e]/20 transition text-xs flex items-center gap-1"
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
                        {resident.gradDependenta && (
                          <p><span className="font-medium">Grad dependență:</span> {resident.gradDependenta}</p>
                        )}
                        {resident.dataInternare && (
                          <p><span className="font-medium">Data internare:</span> {resident.dataInternare}</p>
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
  );
}
