'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';

export default function GenerateDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const cnp = params.cnp as string;

  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Așteaptă ca Firebase Auth să se inițializeze
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

      // Căutăm rezidentul în toate căminele
      // Mai întâi în structura nouă (organizations)
      const organizationsRef = doc(db, 'organizations', user.uid);
      const organizationsSnap = await getDoc(organizationsRef);

      if (organizationsSnap.exists()) {
        // Caută în toate locations
        const locationsRef = collection(db, 'organizations', user.uid, 'locations');
        const locationsSnap = await getDocs(locationsRef);

        for (const locationDoc of locationsSnap.docs) {
          const residentRef = doc(db, 'organizations', user.uid, 'locations', locationDoc.id, 'residents', cnp);
          const residentSnap = await getDoc(residentRef);
          
          if (residentSnap.exists()) {
            setResident({ cnp, ...residentSnap.data() });
            setLoading(false);
            return;
          }
        }
      }

      // Dacă nu găsește în organizations, caută în companies (structura veche)
      const companiesRef = doc(db, 'companies', user.uid);
      const companiesSnap = await getDoc(companiesRef);

      if (companiesSnap.exists()) {
        const camineRef = collection(db, 'companies', user.uid, 'camine');
        const camineSnap = await getDocs(camineRef);

        for (const caminDoc of camineSnap.docs) {
          const residentRef = doc(db, 'companies', user.uid, 'camine', caminDoc.id, 'residents', cnp);
          const residentSnap = await getDoc(residentRef);
          
          if (residentSnap.exists()) {
            setResident({ cnp, ...residentSnap.data() });
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

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fileInput = e.currentTarget.file as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      alert('Te rog selectează un fișier DOCX');
      return;
    }

    if (!file.name.endsWith('.docx')) {
      alert('Te rog selectează un fișier DOCX');
      return;
    }

    try {
      setProcessing(true);
      console.log('🚀 Procesare DOCX cu XML...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('residentData', JSON.stringify(resident));

      const response = await fetch('/api/process-docx-final', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Eroare la procesare');
      }

      // Download DOCX
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.docx', '')}_completat.docx`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('✅ DOCX completat cu succes!');
      alert('DOCX completat cu succes! Descărcarea a început.');

    } catch (error: any) {
      console.error('Eroare:', error);
      alert(`Eroare: ${error.message}`);
    } finally {
      setProcessing(false);
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
            Generare Documente pentru {resident.beneficiarNumeComplet}
          </h1>
          <p className="text-gray-600">
            Uploadează un document DOCX și îl vom completa automat cu datele rezidentului
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Upload className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Completare Document Automat</h2>
            <p className="text-gray-600">
              Uploadează un DOCX cu linii goale și AI-ul va completa automat câmpurile
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selectează documentul DOCX
              </label>
              <input
                type="file"
                name="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-purple-500 p-2.5"
              />
              <p className="mt-1 text-sm text-gray-500">
                Uploadează DOCX cu linii goale și AI-ul va detecta automat ce date să completeze
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Date rezident care vor fi folosite:
              </h3>
              
              {/* BENEFICIAR */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">📋 Beneficiar</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-800">
                  <div><span className="font-medium text-gray-900">Nume complet:</span> {resident.beneficiarNumeComplet}</div>
                  <div><span className="font-medium text-gray-900">CNP:</span> {resident.beneficiarCnp}</div>
                  <div><span className="font-medium text-gray-900">Data nașterii:</span> {resident.beneficiarDataNasterii}</div>
                  <div><span className="font-medium text-gray-900">Telefon:</span> {resident.beneficiarTelefon}</div>
                  <div className="col-span-2"><span className="font-medium text-gray-900">Adresă:</span> {resident.beneficiarAdresa}</div>
                  <div><span className="font-medium text-gray-900">Cod poștal:</span> {resident.beneficiarCodPostal}</div>
                  <div><span className="font-medium text-gray-900">CI Serie:</span> {resident.beneficiarCiSerie}</div>
                  <div><span className="font-medium text-gray-900">CI Număr:</span> {resident.beneficiarCiNumar}</div>
                  <div><span className="font-medium text-gray-900">CI Eliberat data:</span> {resident.beneficiarCiEliberatData}</div>
                  <div><span className="font-medium text-gray-900">CI Eliberat de:</span> {resident.beneficiarCiEliberatDe}</div>
                  <div><span className="font-medium text-gray-900">CI Valabil până:</span> {resident.beneficiarCiValabilPana}</div>
                </div>
              </div>

              {/* APARȚINĂTOR */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">👤 Aparținător</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-800">
                  <div><span className="font-medium text-gray-900">Nume complet:</span> {resident.apartinatorNumeComplet}</div>
                  <div><span className="font-medium text-gray-900">CNP:</span> {resident.apartinatorCnp}</div>
                  <div><span className="font-medium text-gray-900">Relație:</span> {resident.apartinatorRelatie}</div>
                  <div><span className="font-medium text-gray-900">Telefon:</span> {resident.apartinatorTelefon}</div>
                  <div><span className="font-medium text-gray-900">Email:</span> {resident.apartinatorEmail}</div>
                  <div className="col-span-2"><span className="font-medium text-gray-900">Adresă:</span> {resident.apartinatorAdresa}</div>
                  <div><span className="font-medium text-gray-900">CI Serie:</span> {resident.apartinatorCiSerie}</div>
                  <div><span className="font-medium text-gray-900">CI Număr:</span> {resident.apartinatorCiNumar}</div>
                  <div><span className="font-medium text-gray-900">CI Eliberat data:</span> {resident.apartinatorCiEliberatData}</div>
                  <div><span className="font-medium text-gray-900">CI Eliberat de:</span> {resident.apartinatorCiEliberatDe}</div>
                  <div><span className="font-medium text-gray-900">CI Valabil până:</span> {resident.apartinatorCiValabilPana}</div>
                </div>
              </div>

              {/* CONTRACT */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">📄 Contract</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-800">
                  <div><span className="font-medium text-gray-900">Cost serviciu:</span> {resident.costServiciu} RON</div>
                  <div><span className="font-medium text-gray-900">Contribuție beneficiar:</span> {resident.contributieBeneficiar} RON</div>
                  <div><span className="font-medium text-gray-900">Data început:</span> {resident.dataInceputContract}</div>
                  <div><span className="font-medium text-gray-900">Data sfârșit:</span> {resident.dataSfarsitContract || 'Nedeterminată'}</div>
                  <div><span className="font-medium text-gray-900">Număr dosar:</span> {resident.numarDosar}</div>
                  <div><span className="font-medium text-gray-900">Număr contract:</span> {resident.numarContract}</div>
                </div>
              </div>

              {/* MEDICAL */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">🏥 Date Medicale</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-800">
                  <div><span className="font-medium text-gray-900">Proveniență:</span> {resident.provenienta}</div>
                  <div><span className="font-medium text-gray-900">Diagnostic:</span> {resident.diagnostic}</div>
                  <div><span className="font-medium text-gray-900">Alergii:</span> {resident.alergii}</div>
                  <div><span className="font-medium text-gray-900">Alimentație:</span> {resident.alimentatie}</div>
                  <div><span className="font-medium text-gray-900">Incontinență:</span> {resident.incontinenta}</div>
                  <div><span className="font-medium text-gray-900">Mobilitate:</span> {resident.mobilitate}</div>
                  <div><span className="font-medium text-gray-900">Greutate:</span> {resident.greutate} kg</div>
                  <div><span className="font-medium text-gray-900">Comportament:</span> {resident.comportament}</div>
                </div>
              </div>

              {/* MEDIC FAMILIE */}
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">👨‍⚕️ Medic Familie</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-800">
                  <div><span className="font-medium text-gray-900">Nume:</span> {resident.medicFamilieNume}</div>
                  <div><span className="font-medium text-gray-900">Telefon:</span> {resident.medicFamilieTelefon}</div>
                  <div><span className="font-medium text-gray-900">Email:</span> {resident.medicFamilieEmail}</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesare cu AI...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Completează Document
                </>
              )}
            </button>
          </form>

          {processing && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⏳ AI-ul analizează documentul și completează câmpurile... Acest proces poate dura 10-30 secunde.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
