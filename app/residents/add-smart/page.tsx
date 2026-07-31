'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { CAMINE, RELATII_APARTINATOR } from '@/lib/constants';
import { Resident } from '@/types/resident';

interface ExtractedData {
  nume_complet: string;
  cnp: string;
  data_nasterii: string;
  loc_nastere: string;
  adresa: string;
  ci_serie: string;
  ci_numar: string;
  ci_eliberat_de: string;
  ci_data_eliberarii: string;
  ci_valabil_pana: string;
  sex: string;
  cetatenie: string;
}

interface GeneratedDoc {
  name: string;
  filename: string;
  base64: string;
}

type Step = 'beneficiar' | 'apartinator' | 'contract' | 'generare';

function AddSmartResidentInner() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Preia caminId din URL (?camin=cetinei)
  useEffect(() => {
    const caminFromUrl = searchParams.get('camin');
    if (caminFromUrl) {
      setCaminId(caminFromUrl);
    }
  }, [searchParams]);

  const [step, setStep] = useState<Step>('beneficiar');
  const [loading2, setLoading2] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Date extrase
  const [beneficiarData, setBeneficiarData] = useState<ExtractedData | null>(null);
  const [apartinatorData, setApartinatorData] = useState<ExtractedData | null>(null);
  const [beneficiarImage, setBeneficiarImage] = useState<string>('');
  const [apartinatorImage, setApartinatorImage] = useState<string>('');

  // Date contract — caminId din URL sau din state
  const [caminId, setCaminId] = useState('');
  const [costServiciu, setCostServiciu] = useState('5000');
  const [dataInceput, setDataInceput] = useState(new Date().toISOString().split('T')[0]);
  const [durataNedeterminata, setDurataNedeterminata] = useState(true);
  const [apartinatorRelatie, setApartinatorRelatie] = useState('Fiică');
  const [apartinatorTelefon, setApartinatorTelefon] = useState('');

  // Generare
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [genErrors, setGenErrors] = useState<string[]>([]);

  // Compresie imagine cu canvas (max 800px, JPEG quality 0.7)
  const compressImage = (dataUrl: string, maxWidth: number = 800): Promise<{ base64: string; dataUrl: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context failed')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64 = compressedDataUrl.split(',')[1];
        resolve({ base64, dataUrl: compressedDataUrl, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('Eroare la încărcarea imaginii'));
      img.src = dataUrl;
    });
  };

  // Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'beneficiar' | 'apartinator') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading2(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;

        try {
          // Compresiem imaginea înainte de trimitere
          const { base64, dataUrl, mimeType } = await compressImage(result);

          if (type === 'beneficiar') {
            setBeneficiarImage(dataUrl);
          } else {
            setApartinatorImage(dataUrl);
          }

          const resp = await fetch('/api/extract-id-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, mimeType }),
          });

          if (!resp.ok) {
            const text = await resp.text();
            setError(`Eroare server (${resp.status}): ${text.substring(0, 200)}`);
            setLoading2(false);
            return;
          }

          const data = await resp.json();

          if (data.error) {
            setError(data.error);
            setLoading2(false);
            return;
          }

          if (type === 'beneficiar') {
            setBeneficiarData(data.data);
          } else {
            setApartinatorData(data.data);
          }
          setLoading2(false);
        } catch (err: any) {
          setError('Eroare la extragerea datelor: ' + err.message);
          setLoading2(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Eroare la citirea fișierului: ' + err.message);
      setLoading2(false);
    }
  };

  // Salvare rezident + generare documente
  const handleGenerate = async () => {
    if (!beneficiarData || !apartinatorData) {
      setError('Lipsesc datele de identificare');
      return;
    }
    if (!caminId) {
      setError('Selectați căminul');
      return;
    }

    setLoading2(true);
    setError('');
    setSuccess('');
    setGeneratedDocs([]);
    setGenErrors([]);

    if (!caminId) {
      setError('Trebuie să alegi un cămin. Te rog să accesezi această pagină din pagina căminului.');
      setLoading2(false);
      return;
    }

    try {
      // Generăm numere pentru documente
      const dataContract = new Date(dataInceput).toLocaleDateString('ro-RO');
      const numarContract = String(Date.now()).slice(-4);
      const numarBase = String(Date.now()).slice(-3);

      // Pregătim datele pentru template-uri
      const templateData = {
        BENEFICIAR_NUME: beneficiarData.nume_complet,
        BENEFICIAR_CNP: beneficiarData.cnp,
        BENEFICIAR_ADRESA: beneficiarData.adresa,
        BENEFICIAR_CI_SERIE: beneficiarData.ci_serie,
        BENEFICIAR_CI_NUMAR: beneficiarData.ci_numar,
        BENEFICIAR_CI_DATA: beneficiarData.ci_data_eliberarii,
        BENEFICIAR_CI_ELIBERAT_DE: beneficiarData.ci_eliberat_de,
        BENEFICIAR_CI_VALABIL_PANA: beneficiarData.ci_valabil_pana,
        BENEFICIAR_DATA_NASTERII: beneficiarData.data_nasterii,
        BENEFICIAR_LOC_NASTERII: beneficiarData.loc_nastere,

        APARTINATOR_NUME: apartinatorData.nume_complet,
        APARTINATOR_CNP: apartinatorData.cnp,
        APARTINATOR_ADRESA: apartinatorData.adresa,
        APARTINATOR_CI_SERIE: apartinatorData.ci_serie,
        APARTINATOR_CI_NUMAR: apartinatorData.ci_numar,
        APARTINATOR_CI_DATA: apartinatorData.ci_data_eliberarii,
        APARTINATOR_CI_ELIBERAT_DE: apartinatorData.ci_eliberat_de,
        APARTINATOR_CI_VALABIL_PANA: apartinatorData.ci_valabil_pana,
        APARTINATOR_RELATIE: apartinatorRelatie,
        APARTINATOR_TELEFON: apartinatorTelefon,

        NUMAR_CONTRACT: numarContract,
        DATA_CONTRACT: dataContract,
        COST_SERVICIU: costServiciu,
        NUMAR_CERERE: String(parseInt(numarBase) - 3),
        NUMAR_DECIZIE: String(parseInt(numarBase) - 1),
        NUMAR_GDPR: String(parseInt(numarBase) - 2),
        NUMAR_PLAN_INTERVENTIE: String(parseInt(numarBase) + 4),
        NUMAR_PLAN_SERVICII: String(parseInt(numarBase) + 5),
        NUMAR_BUNURI: String(parseInt(numarBase) + 6),
        NUMAR_ROF: String(parseInt(numarBase) + 7),
        NUMAR_PV: String(parseInt(numarBase) + 8),
        NUMAR_PRIMARIE: String(parseInt(numarBase) + 9),
        DATA_ANEXA9: dataContract,
      };

      // Salvăm rezidentul în Firestore
      if (user) {
        const resident: Resident = {
          companyCui: '',
          caminId,
          beneficiarNumeComplet: beneficiarData.nume_complet,
          beneficiarCnp: beneficiarData.cnp,
          beneficiarDataNasterii: beneficiarData.data_nasterii,
          beneficiarAdresa: beneficiarData.adresa,
          beneficiarCiSerie: beneficiarData.ci_serie,
          beneficiarCiNumar: beneficiarData.ci_numar,
          beneficiarCiEliberatData: beneficiarData.ci_data_eliberarii,
          beneficiarCiEliberatDe: beneficiarData.ci_eliberat_de,
          beneficiarCiValabilPana: beneficiarData.ci_valabil_pana,
          apartinatorNumeComplet: apartinatorData.nume_complet,
          apartinatorCnp: apartinatorData.cnp,
          apartinatorRelatie: apartinatorRelatie,
          apartinatorTelefon: apartinatorTelefon,
          apartinatorEmail: '',
          apartinatorAdresa: apartinatorData.adresa,
          apartinatorCiSerie: apartinatorData.ci_serie,
          apartinatorCiNumar: apartinatorData.ci_numar,
          apartinatorCiEliberatData: apartinatorData.ci_data_eliberarii,
          apartinatorCiEliberatDe: apartinatorData.ci_eliberat_de,
          apartinatorCiValabilPana: apartinatorData.ci_valabil_pana,
          costServiciu: parseInt(costServiciu),
          dataInceputContract: dataInceput,
          durataNedeterminata,
          dataInregistrare: Date.now(),
          contractGenerat: true,
          beneficiarImageBase64: beneficiarImage || undefined,
          apartinatorImageBase64: apartinatorImage || undefined,
        };

        const residentRef = doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', beneficiarData.cnp);
        await setDoc(residentRef, resident);
      }

      // Generăm documentele DOCX (cu caminId pentru template-uri specifice)
      const resp = await fetch('/api/generate-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentData: templateData, caminId }),
      });

      const data = await resp.json();

      if (data.error) {
        setError(data.error);
        setLoading2(false);
        return;
      }

      setGeneratedDocs(data.documents || []);
      setGenErrors(data.errors || []);
      setSuccess(`Rezident salvat! ${data.documents?.length || 0} documente generate.`);
      setStep('generare');
      setLoading2(false);
    } catch (err: any) {
      setError('Eroare: ' + err.message);
      setLoading2(false);
    }
  };

  // Download document
  const downloadDoc = (doc: GeneratedDoc) => {
    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${doc.base64}`;
    link.download = doc.filename;
    link.click();
  };

  // Download toate ca ZIP individual
  const downloadAll = () => {
    generatedDocs.forEach((doc, i) => {
      setTimeout(() => downloadDoc(doc), i * 300);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Se încarcă...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Adaugă Rezident — Buletin AI</h1>
            <p className="text-sm text-gray-500 mt-1">Extragere automată din buletin + generare contract complet</p>
          </div>
          <button
            onClick={() => router.push('/residents')}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Înapoi
          </button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {(['beneficiar', 'apartinator', 'contract', 'generare'] as Step[]).map((s, i) => {
            const labels = ['Buletin Beneficiar', 'Buletin Apartinător', 'Date Contract', 'Generare'];
            const isActive = step === s;
            const isDone = ['beneficiar', 'apartinator', 'contract', 'generare'].indexOf(step) > i;
            return (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isActive ? 'bg-blue-900 text-white' : isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-white text-blue-900' : isDone ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                    {isDone ? '✓' : i + 1}
                  </span>
                  {labels[i]}
                </div>
                {i < 3 && <div className={`w-8 h-0.5 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* STEP 1: BENEFICIAR */}
        {step === 'beneficiar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Step 1: Buletin Beneficiar</h2>
            {!beneficiarImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-gray-600 font-medium mb-4">Buletin beneficiar</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition text-sm"
                  >
                    📷 Fă poză
                  </button>
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
                  >
                    📁 Din galerie
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-3">PNG, JPG, JPEG — max 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'beneficiar')}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'beneficiar')}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <img src={beneficiarImage} alt="Buletin" className="w-full rounded-lg border" />
                  <button
                    onClick={() => { setBeneficiarImage(''); setBeneficiarData(null); }}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Schimbă poza
                  </button>
                </div>
                <div>
                  {loading2 && !beneficiarData ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-sm text-gray-500">AI extrage datele...</p>
                    </div>
                  ) : beneficiarData ? (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-700">Date extrase — verifică și editează:</h3>
                      <ExtractedFields data={beneficiarData} onChange={setBeneficiarData} />
                      <button
                        onClick={() => setStep('apartinator')}
                        className="w-full py-2.5 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800"
                      >
                        Acceptă și continuă →
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: APARTINATOR */}
        {step === 'apartinator' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Step 2: Buletin Apartinător</h2>
            {!apartinatorImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-gray-600 font-medium mb-4">Buletin apartinător</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition text-sm"
                  >
                    📷 Fă poză
                  </button>
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
                  >
                    📁 Din galerie
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-3">PNG, JPG, JPEG — max 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'apartinator')}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'apartinator')}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <img src={apartinatorImage} alt="Buletin" className="w-full rounded-lg border" />
                  <button
                    onClick={() => { setApartinatorImage(''); setApartinatorData(null); }}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Schimbă poza
                  </button>
                </div>
                <div>
                  {loading2 && !apartinatorData ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-sm text-gray-500">AI extrage datele...</p>
                    </div>
                  ) : apartinatorData ? (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-700">Date extrase — verifică și editează:</h3>
                      <ExtractedFields data={apartinatorData} onChange={setApartinatorData} />
                      <div>
                        <label className="text-sm text-gray-600">Relație</label>
                        <select
                          value={apartinatorRelatie}
                          onChange={(e) => setApartinatorRelatie(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                        >
                          {RELATII_APARTINATOR.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Telefon</label>
                        <input
                          type="text"
                          value={apartinatorTelefon}
                          onChange={(e) => setApartinatorTelefon(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                          placeholder="07XX XXX XXX"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStep('beneficiar')}
                          className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
                        >
                          ← Înapoi
                        </button>
                        <button
                          onClick={() => setStep('contract')}
                          className="flex-1 py-2.5 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800"
                        >
                          Acceptă și continuă →
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CONTRACT */}
        {step === 'contract' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Step 3: Date Contract</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Cămin</label>
                <select
                  value={caminId}
                  onChange={(e) => setCaminId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Selectați căminul</option>
                  {CAMINE.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Cost serviciu (lei/lună)</label>
                <input
                  type="number"
                  value={costServiciu}
                  onChange={(e) => setCostServiciu(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data început contract</label>
                <input
                  type="date"
                  value={dataInceput}
                  onChange={(e) => setDataInceput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Durata</label>
                <div className="flex items-center gap-3 mt-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={durataNedeterminata}
                      onChange={(e) => setDurataNedeterminata(e.target.checked)}
                    />
                    Nedeterminată
                  </label>
                </div>
              </div>
            </div>

            {/* Rezumat date */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Rezumat:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Beneficiar:</p>
                  <p className="font-medium">{beneficiarData?.nume_complet}</p>
                  <p className="text-gray-500">CNP: {beneficiarData?.cnp}</p>
                </div>
                <div>
                  <p className="text-gray-500">Apartinător:</p>
                  <p className="font-medium">{apartinatorData?.nume_complet}</p>
                  <p className="text-gray-500">CNP: {apartinatorData?.cnp}</p>
                  <p className="text-gray-500">Relație: {apartinatorRelatie}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setStep('apartinator')}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
              >
                ← Înapoi
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading2 || !caminId}
                className="flex-1 py-2.5 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50"
              >
                {loading2 ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generez documentele...
                  </span>
                ) : (
                  'Generează Contract →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: GENERARE */}
        {step === 'generare' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Documente Generate</h2>

            {genErrors.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Atenționări ({genErrors.length}):</p>
                <ul className="text-xs text-yellow-700 mt-1">
                  {genErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              {generatedDocs.map((doc, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                      DOCX
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.filename}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadDoc(doc)}
                    className="px-3 py-1.5 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800 self-start sm:self-auto"
                  >
                    Descarcă
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={downloadAll}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500"
              >
                ↓ Descarcă toate ({generatedDocs.length})
              </button>
              <button
                onClick={() => router.push('/residents')}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
              >
                Vezi rezidenți
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componenta pentru afișarea/editarea câmpurilor extrase
function ExtractedFields({ data, onChange }: { data: ExtractedData; onChange: (d: ExtractedData) => void }) {
  const fields: { key: keyof ExtractedData; label: string }[] = [
    { key: 'nume_complet', label: 'Nume complet' },
    { key: 'cnp', label: 'CNP' },
    { key: 'data_nasterii', label: 'Data nașterii' },
    { key: 'loc_nastere', label: 'Loc naștere' },
    { key: 'adresa', label: 'Adresă' },
    { key: 'ci_serie', label: 'CI Serie' },
    { key: 'ci_numar', label: 'CI Număr' },
    { key: 'ci_eliberat_de', label: 'CI Eliberat de' },
    { key: 'ci_data_eliberarii', label: 'CI Data eliberării' },
    { key: 'ci_valabil_pana', label: 'CI Valabil până' },
    { key: 'sex', label: 'Sex' },
    { key: 'cetatenie', label: 'Cetățenie' },
  ];

  return (
    <div className="space-y-2">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <label className="text-xs text-gray-500">{label}</label>
          <input
            type="text"
            value={data[key] || ''}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

export default function AddSmartResidentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Se încarcă...</div>}>
      <AddSmartResidentInner />
    </Suspense>
  );
}
