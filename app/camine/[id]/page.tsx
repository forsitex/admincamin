'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, User, Phone, Mail, Edit2, Save, X, Users, FileText, Trash2, Loader2, BedDouble, LogOut, UserCheck } from 'lucide-react';
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
  const [externingId, setExterningId] = useState<string | null>(null);
  const [showExternModal, setShowExternModal] = useState<string | null>(null);
  const [externDate, setExternDate] = useState(new Date().toISOString().split('T')[0]);
  const [showExternati, setShowExternati] = useState(false);
  const externatiRef = useRef<HTMLDivElement>(null);
  
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

  const handleExternResident = async (residentCnp: string) => {
    setExterningId(residentCnp);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', residentCnp), {
        status: 'externat',
        dataExternare: externDate,
        roomId: '',
        roomNumber: '',
      });

      await loadResidents();
      setShowExternModal(null);
      console.log('✅ Rezident externat cu succes');
    } catch (error) {
      console.error('❌ Eroare externare:', error);
      alert('Eroare la externare. Încearcă din nou.');
    } finally {
      setExterningId(null);
    }
  };

  const handleReinternareResident = async (residentCnp: string) => {
    setExterningId(residentCnp);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', residentCnp), {
        status: '',
        dataExternare: '',
      });

      await loadResidents();
      console.log('✅ Rezident re-internat cu succes');
    } catch (error) {
      console.error('❌ Eroare re-internare:', error);
      alert('Eroare la re-internare. Încearcă din nou.');
    } finally {
      setExterningId(null);
    }
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
        <div className="max-w-none mx-auto px-4 sm:px-6 py-5">
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
      <div className="max-w-none mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-none mx-auto space-y-6">
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
              <div className="flex items-center gap-2">
                {residents.filter(r => r.status === 'externat').length > 0 && (
                  <button
                    onClick={() => {
                      const newVal = !showExternati;
                      setShowExternati(newVal);
                      if (newVal) {
                        setTimeout(() => {
                          externatiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
                      showExternati
                        ? 'bg-[#c9a96e] text-white'
                        : 'bg-[#c9a96e]/10 text-[#c9a96e] hover:bg-[#c9a96e]/20'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Externați ({residents.filter(r => r.status === 'externat').length})
                  </button>
                )}
                <Link
                  href={`/camine/${caminId}/rooms`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition text-sm"
                >
                  <BedDouble className="w-4 h-4" />
                  Distribuție Camere
                </Link>
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
                    href={`/residents/add-smart?camin=${caminId}`}
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
                          {resident.status === 'externat' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                              Externat · {resident.dataExternare}
                            </span>
                          )}
                        </Link>
                        <div className="flex items-center gap-2">
                          {resident.status !== 'externat' && (
                            <button
                              onClick={() => {
                                setShowExternModal(resident.cnp);
                                setExternDate(new Date().toISOString().split('T')[0]);
                              }}
                              className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition text-xs flex items-center gap-1"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              Externare
                            </button>
                          )}
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

          {/* Lista Externați */}
          {showExternati && (
            <div ref={externatiRef} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 scroll-mt-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1a2b4a] flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-[#c9a96e]" />
                  Rezidenți Externați ({residents.filter(r => r.status === 'externat').length})
                </h2>
                <button
                  onClick={() => setShowExternati(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Ascunde
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {residents.filter(r => r.status === 'externat').map((resident) => (
                  <div
                    key={resident.cnp}
                    className="bg-gray-50 rounded-lg p-5 border border-gray-200 opacity-75"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Link href={`/residents/${resident.cnp}`} className="hover:text-[#c9a96e] transition">
                        <h3 className="text-base font-bold text-gray-700">{resident.beneficiarNumeComplet}</h3>
                        <p className="text-xs text-gray-400">CNP: {resident.cnp}</p>
                      </Link>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                        Externat · {resident.dataExternare}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-500">
                      {resident.dataInternare && (
                        <p><span className="font-medium">Internat:</span> {resident.dataInternare}</p>
                      )}
                      {resident.gradDependenta && (
                        <p><span className="font-medium">Grad:</span> {resident.gradDependenta}</p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleReinternareResident(resident.cnp)}
                        disabled={externingId === resident.cnp}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition text-xs disabled:opacity-50"
                      >
                        {externingId === resident.cnp ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Se procesează...</>
                        ) : (
                          <><UserCheck className="w-3.5 h-3.5" /> Re-internare</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Externare */}
      {showExternModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-[#1a2b4a]">Externare Rezident</h3>
              <button
                onClick={() => setShowExternModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Sigur dorești să externezi rezidentul <strong>{residents.find(r => r.cnp === showExternModal)?.beneficiarNumeComplet}</strong>?
                Rezidentul va fi scos din cameră și marcat ca externat.
              </p>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">
                  Data externării
                </label>
                <input
                  type="date"
                  value={externDate}
                  onChange={(e) => setExternDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                />
              </div>
              <button
                onClick={() => handleExternResident(showExternModal)}
                disabled={externingId === showExternModal}
                className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {externingId === showExternModal ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Se procesează...</>
                ) : (
                  <><LogOut className="w-4 h-4" /> Confirmă Externarea</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
