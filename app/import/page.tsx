'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Upload, CheckCircle, AlertCircle, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const IMPORT_LOCATIONS = [
  { id: 'cetinei', name: 'CETINEI', file: 'Tabel benef. & aparț. CETINEI.xlsx' },
  { id: 'orhideelor', name: 'ORHIDEELOR', file: 'Tabel benef. & aparț. ORHIDEELOR.xlsx' },
  { id: 'fortunei', name: 'FORTUNEI', file: 'Tabel benef. & aparț. FORTUNEI.xlsx' },
  { id: 'clinceni', name: 'CLINCENI', file: 'Tabel benef. & aparț. BRAGADIRU.xlsx' },
];

interface ImportResult {
  total: number;
  success: number;
  errors: number;
  details: string[];
}

export default function ImportPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ImportResult>>({});

  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteResults, setDeleteResults] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const parseDate = (value: any): string => {
    if (!value) return '';
    if (value instanceof Date) {
      const d = value as Date;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }
    // Excel serial date number
    if (typeof value === 'number') {
      // Excel epoch: 1900-01-01 = 1 (with leap year bug)
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
    return String(value);
  };

  const splitCi = (ci: string): { serie: string; numar: string } => {
    if (!ci) return { serie: '', numar: '' };
    const match = ci.match(/^([A-Z]+)\s*nr\.?\s*(\d+)/i);
    if (match) {
      return { serie: match[1], numar: match[2] };
    }
    return { serie: '', numar: ci };
  };

  const safeStr = (val: any): string => {
    if (val == null) return '';
    return String(val).trim();
  };

  const mapRowToResident = (row: any[], caminId: string, headers: string[]): any => {
    // Detectează formatul: dacă coloana 2 conține "CNP" => FORTUNEI (fără grad dependență)
    // altfel => BRAGADIRU/CETINEI/ORHIDEELOR (cu grad dependență pe coloana 2)
    const header2 = String(headers[2] || '').toLowerCase();
    const hasGradDependenta = !header2.includes('cnp');

    // Indici coloane în funcție de format
    const COL = hasGradDependenta ? {
      // Beneficiar
      nume: 1,
      gradDep: 2,
      cnp: 3,
      varsta: 4,
      ziNastere: 5,
      ci: 6,
      nrContract: 7,
      dataInternare: 8,
      adresa: 9,
      // Aparținător
      apNume: 10,
      apCnp: 11,
      apCi: 12,
      apAdresa: 13,
      apTelefon: 14,
      // Extra
      asigurat: 15,
      certHandicap: 16,
      tutore: 17,
      spas: 18,
    } : {
      // FORTUNEI (fără grad dependență)
      nume: 1,
      gradDep: -1,
      cnp: 2,
      varsta: 3,
      ziNastere: 4,
      ci: 5,
      nrContract: 6,
      dataInternare: 7,
      adresa: 8,
      // Aparținător
      apNume: 9,
      apCnp: 10,
      apCi: 11,
      apAdresa: 12,
      apTelefon: 13,
      // Extra
      asigurat: 14,
      certHandicap: 15,
      tutore: 16,
      spas: -1,
    };

    const get = (idx: number): any => idx >= 0 && idx < row.length ? row[idx] : '';

    const ciBeneficiar = safeStr(get(COL.ci));
    const ciSplit = splitCi(ciBeneficiar);
    const apartinatorCi = safeStr(get(COL.apCi));
    const apartinatorCiSplit = splitCi(apartinatorCi);

    return {
      caminId,
      // Beneficiar
      beneficiarNumeComplet: safeStr(get(COL.nume)),
      beneficiarCnp: safeStr(get(COL.cnp)).replace(/\D/g, ''),
      beneficiarDataNasterii: parseDate(get(COL.ziNastere)),
      beneficiarVarsta: get(COL.varsta) ? Number(get(COL.varsta)) : null,
      beneficiarAdresa: safeStr(get(COL.adresa)),
      beneficiarCiSerie: ciSplit.serie,
      beneficiarCiNumar: ciSplit.numar,
      gradDependenta: safeStr(get(COL.gradDep)),
      numarContract: get(COL.nrContract) ? Number(get(COL.nrContract)) : null,
      dataInternare: parseDate(get(COL.dataInternare)),
      // Aparținător
      apartinatorNumeComplet: safeStr(get(COL.apNume)),
      apartinatorCnp: safeStr(get(COL.apCnp)).replace(/\D/g, ''),
      apartinatorCiSerie: apartinatorCiSplit.serie,
      apartinatorCiNumar: apartinatorCiSplit.numar,
      apartinatorAdresa: safeStr(get(COL.apAdresa)),
      apartinatorTelefon: safeStr(get(COL.apTelefon)),
      // Extra
      asigurat: safeStr(get(COL.asigurat)),
      certificatHandicap: safeStr(get(COL.certHandicap)),
      tutore: safeStr(get(COL.tutore)),
      spas: safeStr(get(COL.spas)),
      // Metadata
      dataInregistrare: Date.now(),
      contractGenerat: false,
    };
  };

  const handleDeleteAll = async (locationId: string) => {
    if (!user) return;
    if (!confirm(`Sigur vrei să ștergi TOȚI rezidenții din ${locationId.toUpperCase()}?`)) return;
    
    setDeleting(locationId);
    try {
      const residentsRef = collection(db, 'organizations', user.uid, 'locations', locationId, 'residents');
      const snap = await getDocs(residentsRef);
      
      let count = 0;
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, 'organizations', user.uid, 'locations', locationId, 'residents', docSnap.id));
        count++;
      }
      
      setDeleteResults(prev => ({ ...prev, [locationId]: count }));
      console.log(`✅ Șterși ${count} rezidenți din ${locationId}`);
    } catch (err: any) {
      console.error('❌ Eroare ștergere:', err);
      alert('Eroare la ștergere: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleImport = async (location: typeof IMPORT_LOCATIONS[0]) => {
    setImporting(location.id);
    const errors: string[] = [];
    let success = 0;

    try {
      if (!user) return;

      // Fetch Excel file
      const response = await fetch(`/rezidentii/${encodeURIComponent(location.file)}`);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Prima rând = headers
      const headers = rows[0].map((h: any) => String(h || ''));
      
      // Găsește rândurile cu date (sărite header și rânduri goale)
      const dataRows = rows.filter((row, idx) => {
        if (idx === 0) return false; // header
        if (!row || row.length === 0) return false;
        // Verifică dacă rândul are CNP (coloana cu CNP)
        const cnpVal = row.find((cell: any) => {
          if (!cell) return false;
          const str = String(cell).replace(/\D/g, '');
          return str.length === 13;
        });
        return cnpVal != null;
      });

      console.log(`📊 ${location.name}: ${dataRows.length} rânduri găsite`);

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        try {
          const resident = mapRowToResident(row, location.id, headers);
          
          if (!resident.beneficiarCnp || resident.beneficiarCnp.length !== 13) {
            errors.push(`Rând ${i + 1}: CNP invalid sau lipsă`);
            continue;
          }

          if (!resident.beneficiarNumeComplet) {
            errors.push(`Rând ${i + 1}: Nume lipsă`);
            continue;
          }

          const residentRef = doc(db, 'organizations', user.uid, 'locations', location.id, 'residents', resident.beneficiarCnp);
          await setDoc(residentRef, resident, { merge: true });
          success++;
        } catch (err: any) {
          errors.push(`Rând ${i + 1}: ${err.message}`);
        }
      }

      setResults(prev => ({
        ...prev,
        [location.id]: {
          total: dataRows.length,
          success,
          errors: errors.length,
          details: errors,
        }
      }));

      console.log(`✅ ${location.name}: ${success}/${dataRows.length} importați, ${errors.length} erori`);
    } catch (err: any) {
      console.error(`❌ Eroare import ${location.name}:`, err);
      setResults(prev => ({
        ...prev,
        [location.id]: {
          total: 0,
          success: 0,
          errors: 1,
          details: [`Eroare generală: ${err.message}`],
        }
      }));
    } finally {
      setImporting(null);
    }
  };

  const handleImportAll = async () => {
    for (const loc of IMPORT_LOCATIONS) {
      await handleImport(loc);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4a] mx-auto"></div>
      </div>
    );
  }

  const allDone = IMPORT_LOCATIONS.every(loc => results[loc.id]);
  const totalImported = Object.values(results).reduce((sum, r) => sum + r.success, 0);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard-new')}
                className="flex items-center gap-2 text-gray-500 hover:text-[#1a2b4a] transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Înapoi</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#1a2b4a]">Import Rezidenți</h1>
                <p className="text-xs text-gray-500">Importă datele din Excel în Firestore pentru fiecare locație</p>
              </div>
            </div>
            <button
              onClick={handleImportAll}
              disabled={importing !== null}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Importă Toate
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {totalImported > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-800 font-semibold">
              Total rezidenți importați: {totalImported}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {IMPORT_LOCATIONS.map((location) => {
            const result = results[location.id];
            const isImporting = importing === location.id;

            return (
              <div
                key={location.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#1a2b4a]/5 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-[#1a2b4a]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1a2b4a]">{location.name}</h3>
                      <p className="text-sm text-gray-500">{location.file}</p>
                    </div>
                  </div>
                  {result && (
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      result.errors === 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {result.success}/{result.total}
                    </div>
                  )}
                </div>

                {result && (
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700">{result.success} rezidenți importați cu succes</span>
                    </div>
                    {result.errors > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-700">{result.errors} erori</span>
                      </div>
                    )}
                    {result.details.length > 0 && (
                      <div className="mt-2 bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {result.details.slice(0, 10).map((detail, i) => (
                          <p key={i} className="text-xs text-gray-600">{detail}</p>
                        ))}
                        {result.details.length > 10 && (
                          <p className="text-xs text-gray-400 mt-1">... și încă {result.details.length - 10} erori</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {deleteResults[location.id] !== undefined && (
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700">{deleteResults[location.id]} rezidenți șterși</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleImport(location)}
                    disabled={isImporting || importing !== null || deleting !== null}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Se importă...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Importă
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAll(location.id)}
                    disabled={isImporting || importing !== null || deleting !== null}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Șterge toți rezidenții"
                  >
                    {deleting === location.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {allDone && (
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard-new')}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
            >
              Mergi la Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
