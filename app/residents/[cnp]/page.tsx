'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, MapPin, FileText, Edit2, Save, X, Calendar, Hash, Heart, Pill, Activity } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ResidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cnp = params.cnp as string;

  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const locationsRef = collection(db, 'organizations', user.uid, 'locations');
        const locationsSnap = await getDocs(locationsRef);

        for (const locDoc of locationsSnap.docs) {
          const residentRef = doc(db, 'organizations', user.uid, 'locations', locDoc.id, 'residents', cnp);
          const residentSnap = await getDoc(residentRef);
          if (residentSnap.exists()) {
            const data = { cnp: residentSnap.id, caminId: locDoc.id, ...residentSnap.data() };
            setResident(data);
            setEditData(data);
            setLoading(false);
            return;
          }
        }

        console.log('Rezident nu a fost găsit');
        setLoading(false);
      } catch (error) {
        console.error('Error loading resident:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [cnp, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user || !resident) return;

      const residentRef = doc(db, 'organizations', user.uid, 'locations', resident.caminId, 'residents', cnp);
      const { cnp: _, caminId: __, ...updateData } = editData;
      await updateDoc(residentRef, updateData);

      setResident(editData);
      setEditMode(false);
      console.log('✅ Rezident actualizat');
    } catch (error) {
      console.error('❌ Eroare actualizare:', error);
      alert('Eroare la salvare. Încearcă din nou.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(resident);
    setEditMode(false);
  };

  const handleChange = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Rezidentul nu a fost găsit</p>
          <Link href="/dashboard-new" className="mt-4 inline-block text-purple-600 hover:underline">
            Înapoi la Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Funcție render câmp (nu componentă separată)
  const renderField = (label: string, field: string, icon: any) => {
    const Icon = icon;
    const displayValue = editMode ? (editData[field] ?? '') : (resident[field] ?? '');
    return (
      <div className="space-y-1" key={field}>
        <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
          {Icon && <Icon className="w-3 h-3" />}
          {label}
        </label>
        {editMode ? (
          <input
            type="text"
            value={typeof displayValue === 'object' ? JSON.stringify(displayValue) : String(displayValue ?? '')}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-sm"
          />
        ) : (
          <p className="text-sm font-semibold text-gray-900">
            {displayValue && displayValue !== '' ? String(displayValue) : '—'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-[#1a2b4a]">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/camine/${resident.caminId}`)}
              className="flex items-center gap-2 text-white/70 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Înapoi la locație</span>
            </button>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#1a2b4a] hover:bg-gray-100 rounded-lg font-bold transition"
              >
                <Edit2 className="w-4 h-4" />
                Editează
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvare...' : 'Salvează'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition"
                >
                  <X className="w-4 h-4" />
                  Anulează
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Nume rezident */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#c9a96e]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1a2b4a]/5 rounded-xl flex items-center justify-center">
                <User className="w-7 h-7 text-[#1a2b4a]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a2b4a]">
                  {editMode ? editData.beneficiarNumeComplet : resident.beneficiarNumeComplet}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">CNP: {resident.beneficiarCnp || resident.cnp}</p>
              </div>
            </div>
          </div>

          {/* Date Beneficiar */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-sm font-bold text-[#1a2b4a] uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#c9a96e]" />
              Date Beneficiar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('Nume complet', 'beneficiarNumeComplet', User)}
              {renderField('CNP', 'beneficiarCnp', Hash)}
              {renderField('Data nașterii', 'beneficiarDataNasterii', Calendar)}
              {renderField('Vârstă', 'beneficiarVarsta', Calendar)}
              {renderField('Grad dependență', 'gradDependenta', Activity)}
              {renderField('Adresă', 'beneficiarAdresa', MapPin)}
              {renderField('CI Serie', 'beneficiarCiSerie', Hash)}
              {renderField('CI Număr', 'beneficiarCiNumar', Hash)}
              {renderField('Data internare', 'dataInternare', Calendar)}
              {renderField('Nr. contract', 'numarContract', Hash)}
              {renderField('Asigurat', 'asigurat', Heart)}
              {renderField('Certificat handicap', 'certificatHandicap', FileText)}
            </div>
          </div>

          {/* Date Aparținător */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-sm font-bold text-[#1a2b4a] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#c9a96e]" />
              Date Aparținător
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('Nume aparținător', 'apartinatorNumeComplet', User)}
              {renderField('CNP aparținător', 'apartinatorCnp', Hash)}
              {renderField('Telefon', 'apartinatorTelefon', Phone)}
              {renderField('Adresă', 'apartinatorAdresa', MapPin)}
              {renderField('CI Serie', 'apartinatorCiSerie', Hash)}
              {renderField('CI Număr', 'apartinatorCiNumar', Hash)}
              {renderField('Tutore', 'tutore', User)}
              {renderField('SPAS', 'spas', FileText)}
            </div>
          </div>

          {/* Date Medicale */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-sm font-bold text-[#1a2b4a] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#c9a96e]" />
              Date Medicale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField('Diagnostic', 'diagnostic', Activity)}
              {renderField('Alergii', 'alergii', Pill)}
              {renderField('Alimentație', 'alimentatie', Heart)}
              {renderField('Mobilitate', 'mobilitate', Activity)}
              {renderField('Comportament', 'comportament', User)}
              {renderField('Stare generală', 'stareGenerala', Activity)}
              {renderField('Medic familie', 'medicFamilieNume', User)}
              {renderField('Telefon medic', 'medicFamilieTelefon', Phone)}
              {renderField('Tensiune arterială', 'tensiuneArteriala', Activity)}
              {renderField('Puls', 'puls', Activity)}
              {renderField('Glicemie', 'glicemie', Activity)}
              {renderField('Greutate', 'greutate', Activity)}
            </div>
          </div>

          {/* Acțiuni */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/residents/${resident.beneficiarCnp || resident.cnp}/generate-documents`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition"
            >
              <FileText className="w-5 h-5" />
              Generează Documente
            </Link>
            <Link
              href={`/camine/${resident.caminId}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Înapoi la locație
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
