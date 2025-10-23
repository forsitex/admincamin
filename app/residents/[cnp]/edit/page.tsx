'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function EditResidentPage() {
  const params = useParams();
  const router = useRouter();
  const cnp = params.cnp as string;

  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [caminId, setCaminId] = useState('');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadResident();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [cnp]);

  const loadResident = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Caută rezidentul în organizations
      const organizationsRef = doc(db, 'organizations', user.uid);
      const organizationsSnap = await getDoc(organizationsRef);

      if (organizationsSnap.exists()) {
        const locationsRef = collection(db, 'organizations', user.uid, 'locations');
        const locationsSnap = await getDocs(locationsRef);

        for (const locationDoc of locationsSnap.docs) {
          const residentRef = doc(db, 'organizations', user.uid, 'locations', locationDoc.id, 'residents', cnp);
          const residentSnap = await getDoc(residentRef);
          
          if (residentSnap.exists()) {
            const data = residentSnap.data();
            setResident(data);
            setFormData(data);
            setCaminId(locationDoc.id);
            setLoading(false);
            return;
          }
        }
      }

      // Caută în companies (structura veche)
      const companiesRef = doc(db, 'companies', user.uid);
      const companiesSnap = await getDoc(companiesRef);

      if (companiesSnap.exists()) {
        const camineRef = collection(db, 'companies', user.uid, 'camine');
        const camineSnap = await getDocs(camineRef);

        for (const caminDoc of camineSnap.docs) {
          const residentRef = doc(db, 'companies', user.uid, 'camine', caminDoc.id, 'residents', cnp);
          const residentSnap = await getDoc(residentRef);
          
          if (residentSnap.exists()) {
            const data = residentSnap.data();
            setResident(data);
            setFormData(data);
            setCaminId(caminDoc.id);
            setLoading(false);
            return;
          }
        }
      }

      alert('Rezident negăsit');
      router.push('/dashboard-new');
    } catch (error) {
      console.error('Eroare:', error);
      alert('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      // Încearcă să salveze în organizations
      try {
        const residentRef = doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', cnp);
        await updateDoc(residentRef, formData);
        alert('Rezident actualizat cu succes!');
        router.back();
        return;
      } catch (error) {
        // Încearcă în companies
        const residentRef = doc(db, 'companies', user.uid, 'camine', caminId, 'residents', cnp);
        await updateDoc(residentRef, formData);
        alert('Rezident actualizat cu succes!');
        router.back();
      }
    } catch (error) {
      console.error('Eroare:', error);
      alert('Eroare la salvarea datelor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!resident) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Înapoi
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editare Rezident: {resident.beneficiarNumeComplet}
          </h1>
          <p className="text-gray-600">CNP: {cnp}</p>
        </div>

        {/* Formular */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Date Beneficiar */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Date Beneficiar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nume Complet *</label>
                <input
                  type="text"
                  value={formData.beneficiarNumeComplet || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarNumeComplet: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNP *</label>
                <input
                  type="text"
                  value={formData.beneficiarCnp || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Nașterii</label>
                <input
                  type="text"
                  value={formData.beneficiarDataNasterii || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarDataNasterii: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresă *</label>
                <input
                  type="text"
                  value={formData.beneficiarAdresa || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarAdresa: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cod Poștal</label>
                <input
                  type="text"
                  value={formData.beneficiarCodPostal || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarCodPostal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="text"
                  value={formData.beneficiarTelefon || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarTelefon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Serie</label>
                <input
                  type="text"
                  value={formData.beneficiarCiSerie || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarCiSerie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Număr</label>
                <input
                  type="text"
                  value={formData.beneficiarCiNumar || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarCiNumar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Eliberat Data</label>
                <input
                  type="text"
                  value={formData.beneficiarCiEliberatData || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarCiEliberatData: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Eliberat De</label>
                <input
                  type="text"
                  value={formData.beneficiarCiEliberatDe || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarCiEliberatDe: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Valabil Până</label>
                <input
                  type="text"
                  value={formData.beneficiarCiValabilPana || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiarCiValabilPana: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Date Aparținător */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Date Aparținător</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nume Complet</label>
                <input
                  type="text"
                  value={formData.apartinatorNumeComplet || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorNumeComplet: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNP</label>
                <input
                  type="text"
                  value={formData.apartinatorCnp || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorCnp: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relație</label>
                <input
                  type="text"
                  value={formData.apartinatorRelatie || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorRelatie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="text"
                  value={formData.apartinatorTelefon || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorTelefon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.apartinatorEmail || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresă</label>
                <input
                  type="text"
                  value={formData.apartinatorAdresa || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorAdresa: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Serie</label>
                <input
                  type="text"
                  value={formData.apartinatorCiSerie || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorCiSerie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Număr</label>
                <input
                  type="text"
                  value={formData.apartinatorCiNumar || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorCiNumar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Eliberat Data</label>
                <input
                  type="text"
                  value={formData.apartinatorCiEliberatData || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorCiEliberatData: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Eliberat De</label>
                <input
                  type="text"
                  value={formData.apartinatorCiEliberatDe || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorCiEliberatDe: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CI Valabil Până</label>
                <input
                  type="text"
                  value={formData.apartinatorCiValabilPana || ''}
                  onChange={(e) => setFormData({ ...formData, apartinatorCiValabilPana: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Date Contract */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">📄 Date Contract</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Serviciu (RON)</label>
                <input
                  type="number"
                  value={formData.costServiciu || ''}
                  onChange={(e) => setFormData({ ...formData, costServiciu: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contribuție Beneficiar (RON)</label>
                <input
                  type="number"
                  value={formData.contributieBeneficiar || ''}
                  onChange={(e) => setFormData({ ...formData, contributieBeneficiar: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Început Contract</label>
                <input
                  type="text"
                  value={formData.dataInceputContract || ''}
                  onChange={(e) => setFormData({ ...formData, dataInceputContract: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Sfârșit Contract</label>
                <input
                  type="text"
                  value={formData.dataSfarsitContract || ''}
                  onChange={(e) => setFormData({ ...formData, dataSfarsitContract: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Număr Dosar</label>
                <input
                  type="text"
                  value={formData.numarDosar || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Număr Contract</label>
                <input
                  type="number"
                  value={formData.numarContract || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Date Medicale */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏥 Date Medicale</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proveniență</label>
                <input
                  type="text"
                  value={formData.provenienta || ''}
                  onChange={(e) => setFormData({ ...formData, provenienta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnostic</label>
                <input
                  type="text"
                  value={formData.diagnostic || ''}
                  onChange={(e) => setFormData({ ...formData, diagnostic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alergii</label>
                <input
                  type="text"
                  value={formData.alergii || ''}
                  onChange={(e) => setFormData({ ...formData, alergii: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alimentație</label>
                <input
                  type="text"
                  value={formData.alimentatie || ''}
                  onChange={(e) => setFormData({ ...formData, alimentatie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incontinență</label>
                <input
                  type="text"
                  value={formData.incontinenta || ''}
                  onChange={(e) => setFormData({ ...formData, incontinenta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobilitate</label>
                <input
                  type="text"
                  value={formData.mobilitate || ''}
                  onChange={(e) => setFormData({ ...formData, mobilitate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Greutate (kg)</label>
                <input
                  type="number"
                  value={formData.greutate || ''}
                  onChange={(e) => setFormData({ ...formData, greutate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comportament</label>
                <input
                  type="text"
                  value={formData.comportament || ''}
                  onChange={(e) => setFormData({ ...formData, comportament: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Medic Familie */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">👨‍⚕️ Medic Familie</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nume</label>
                <input
                  type="text"
                  value={formData.medicFamilieNume || ''}
                  onChange={(e) => setFormData({ ...formData, medicFamilieNume: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="text"
                  value={formData.medicFamilieTelefon || ''}
                  onChange={(e) => setFormData({ ...formData, medicFamilieTelefon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.medicFamilieEmail || ''}
                  onChange={(e) => setFormData({ ...formData, medicFamilieEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Butoane */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvare...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvează Modificările
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Anulează
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Toate Datele Rezidentului</h3>
          <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-white p-4 rounded-lg">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
