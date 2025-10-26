'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Users, Baby } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

interface Grupa {
  id: string;
  nume: string;
  varsta: string;
  capacitate: number;
  educatori: string[];
  sala?: string;
  emoji?: string;
}

export default function GrupeManagementPage() {
  const router = useRouter();
  const params = useParams();
  const gradinitaId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [gradinita, setGradinita] = useState<any>(null);
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  const [editingGrupa, setEditingGrupa] = useState<Grupa | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiiPerGrupa, setCopiiPerGrupa] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState<Grupa>({
    id: '',
    nume: '',
    varsta: '2-3 ani',
    capacitate: 20,
    educatori: [],
    sala: '',
    emoji: '🎨'
  });

  useEffect(() => {
    loadData();
  }, [gradinitaId]);

  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Încarcă date grădiniță
      const gradinitaRef = doc(db, 'organizations', user.uid, 'locations', gradinitaId);
      const gradinitaSnap = await getDoc(gradinitaRef);

      if (gradinitaSnap.exists()) {
        const data = gradinitaSnap.data();
        setGradinita(data);
        setGrupe(data.grupe || []);

        // Numără copiii per grupă
        const childrenRef = collection(db, 'organizations', user.uid, 'locations', gradinitaId, 'children');
        const childrenSnap = await getDocs(childrenRef);
        
        const counts: Record<string, number> = {};
        childrenSnap.docs.forEach(doc => {
          const grupa = doc.data().grupa;
          counts[grupa] = (counts[grupa] || 0) + 1;
        });
        setCopiiPerGrupa(counts);
      }
    } catch (error) {
      console.error('Eroare încărcare date:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrupa = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const newGrupa = {
        ...formData,
        id: `grupa-${Date.now()}`
      };

      const updatedGrupe = [...grupe, newGrupa];
      
      const gradinitaRef = doc(db, 'organizations', user.uid, 'locations', gradinitaId);
      await updateDoc(gradinitaRef, {
        grupe: updatedGrupe
      });

      setGrupe(updatedGrupe);
      setShowAddModal(false);
      resetForm();
      console.log('✅ Grupă adăugată!');
    } catch (error) {
      console.error('❌ Eroare adăugare grupă:', error);
    }
  };

  const handleEditGrupa = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !editingGrupa) return;

      const updatedGrupe = grupe.map(g => 
        g.id === editingGrupa.id ? formData : g
      );
      
      const gradinitaRef = doc(db, 'organizations', user.uid, 'locations', gradinitaId);
      await updateDoc(gradinitaRef, {
        grupe: updatedGrupe
      });

      setGrupe(updatedGrupe);
      setEditingGrupa(null);
      resetForm();
      console.log('✅ Grupă actualizată!');
    } catch (error) {
      console.error('❌ Eroare actualizare grupă:', error);
    }
  };

  const handleDeleteGrupa = async (grupaId: string, grupaNume: string) => {
    if (!confirm(`Sigur vrei să ștergi grupa "${grupaNume}"?\n\nAtenție: Copiii din această grupă vor rămâne fără grupă!`)) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const updatedGrupe = grupe.filter(g => g.id !== grupaId);
      
      const gradinitaRef = doc(db, 'organizations', user.uid, 'locations', gradinitaId);
      await updateDoc(gradinitaRef, {
        grupe: updatedGrupe
      });

      setGrupe(updatedGrupe);
      console.log('✅ Grupă ștearsă!');
    } catch (error) {
      console.error('❌ Eroare ștergere grupă:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      nume: '',
      varsta: '2-3 ani',
      capacitate: 20,
      educatori: [],
      sala: '',
      emoji: '🎨'
    });
  };

  const openEditModal = (grupa: Grupa) => {
    setFormData(grupa);
    setEditingGrupa(grupa);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.push(`/gradinite/${gradinitaId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Înapoi la Grădiniță
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  📚 Gestionare Grupe
                </h1>
                <p className="text-gray-600">
                  {gradinita?.name} - {grupe.length} grupe
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Adaugă Grupă
              </button>
            </div>
          </div>

          {/* Lista Grupe */}
          {grupe.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nu există grupe create</h3>
              <p className="text-gray-600 mb-6">
                Adaugă prima grupă pentru a organiza copiii
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Adaugă Prima Grupă
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grupe.map((grupa) => {
                const copiiInscriși = copiiPerGrupa[grupa.nume] || 0;
                const procent = Math.round((copiiInscriși / grupa.capacitate) * 100);
                
                return (
                  <div
                    key={grupa.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition border-2 border-blue-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{grupa.emoji || '🎨'}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{grupa.nume}</h3>
                          <p className="text-sm text-gray-600">Vârstă: {grupa.varsta}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Capacitate:</span>
                        <span className="font-semibold text-gray-900">
                          {copiiInscriși}/{grupa.capacitate} copii ({procent}%)
                        </span>
                      </div>
                      
                      {grupa.sala && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Sala:</span>
                          <span className="font-semibold text-gray-900">{grupa.sala}</span>
                        </div>
                      )}

                      {grupa.educatori.length > 0 && (
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Educatori:</p>
                          <div className="flex flex-wrap gap-2">
                            {grupa.educatori.map((edu, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
                              >
                                {edu}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            procent >= 90 ? 'bg-red-500' : procent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(procent, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(grupa)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editează
                      </button>
                      <button
                        onClick={() => handleDeleteGrupa(grupa.id, grupa.nume)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                        title="Șterge grupă"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Adăugare/Editare Grupă */}
      {(showAddModal || editingGrupa) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingGrupa ? '✏️ Editează Grupa' : '➕ Adaugă Grupă Nouă'}
            </h2>

            <div className="space-y-4">
              {/* Nume Grupă */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Grupă *
                </label>
                <input
                  type="text"
                  value={formData.nume}
                  onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  placeholder="ex: Grupă Mică A - Buburuze"
                />
              </div>

              {/* Vârstă și Emoji */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vârstă *
                  </label>
                  <select
                    value={formData.varsta}
                    onChange={(e) => setFormData({ ...formData, varsta: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  >
                    <option value="2-3 ani">2-3 ani</option>
                    <option value="3-4 ani">3-4 ani</option>
                    <option value="4-5 ani">4-5 ani</option>
                    <option value="5-6 ani">5-6 ani</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji (opțional)
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 text-center text-2xl"
                    placeholder="🎨"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Capacitate și Sala */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacitate *
                  </label>
                  <input
                    type="number"
                    value={formData.capacitate}
                    onChange={(e) => setFormData({ ...formData, capacitate: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sala (opțional)
                  </label>
                  <input
                    type="text"
                    value={formData.sala}
                    onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                    placeholder="ex: Sala 1"
                  />
                </div>
              </div>

              {/* Educatori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Educatori (opțional)
                </label>
                <input
                  type="text"
                  value={formData.educatori.join(', ')}
                  onChange={(e) => setFormData({ ...formData, educatori: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  placeholder="ex: Maria Popescu, Ana Ionescu (separă cu virgulă)"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingGrupa(null);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Anulează
              </button>
              <button
                onClick={editingGrupa ? handleEditGrupa : handleAddGrupa}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {editingGrupa ? 'Salvează Modificările' : 'Adaugă Grupa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
