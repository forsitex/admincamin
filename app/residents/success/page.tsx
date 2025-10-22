'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, FileText, Printer, Download, Home, Loader2 } from 'lucide-react';
import { getResidentByCnp } from '@/lib/firestore';
import { Resident } from '@/types/resident';
import { CAMINE, COMPANIES } from '@/lib/constants';

interface PDFDocument {
  name: string;
  filename: string;
  blob: Blob;
}

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cnp = searchParams.get('cnp');
  
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedDocs, setGeneratedDocs] = useState<PDFDocument[]>([]);

  useEffect(() => {
    if (cnp) {
      loadResident(cnp);
    }
  }, [cnp]);

  const loadResident = async (cnp: string) => {
    try {
      // Încercăm să găsim rezidentul în toate căminele
      for (const camin of CAMINE) {
        const res = await getResidentByCnp(cnp, camin.id);
        if (res) {
          setResident(res);
          break;
        }
      }
    } catch (error) {
      console.error('Error loading resident:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Rezident negăsit</p>
          <Link href="/dashboard" className="text-purple-600 hover:underline">
            Înapoi la Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const company = COMPANIES.find(c => c.cui === resident.companyCui);
  const camin = CAMINE.find(c => c.id === resident.caminId);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Rezident Înregistrat cu Succes!
            </h1>
            <p className="text-xl text-gray-600">
              <strong>{resident.beneficiarNumeComplet}</strong> a fost adăugat în{' '}
              <strong>{camin?.name}</strong>
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalii Înregistrare</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Număr Dosar</p>
                <p className="text-lg font-bold text-purple-600">{resident.numarDosar}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Număr Contract</p>
                <p className="text-lg font-bold text-purple-600">{resident.numarContract}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">CNP</p>
                <p className="text-lg font-semibold text-gray-900">{resident.beneficiarCnp}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Data Nașterii</p>
                <p className="text-lg font-semibold text-gray-900">{resident.beneficiarDataNasterii}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Firmă</p>
                <p className="text-lg font-semibold text-gray-900">{company?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Administrator</p>
                <p className="text-lg font-semibold text-gray-900">{company?.representative}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-1">Aparținător</p>
              <p className="text-lg font-semibold text-gray-900">{resident.apartinatorNumeComplet}</p>
              <p className="text-sm text-gray-600 mt-2">
                {resident.apartinatorRelatie} • {resident.apartinatorTelefon}
              </p>
            </div>
          </div>

          {/* Documents Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
            <div className="flex items-start">
              <FileText className="w-6 h-6 text-blue-500 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Documente Generate
                </h3>
                <p className="text-blue-800 mb-3">
                  Următoarele documente vor fi generate automat:
                </p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Contract model-cadru Ordin 1126-2025</li>
                  <li>• Cerere de admitere</li>
                  <li>• Fișa de intrare</li>
                  <li>• Acord de internare în centru</li>
                  <li>• Toate anexele (1-8)</li>
                  <li>• + alte 7 documente necesare</li>
                </ul>
                <p className="text-sm text-blue-700 mt-3 font-medium">
                  Total: 16 documente PDF
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6">
            <button
              onClick={async () => {
                if (!resident) return;
                
                setLoading(true);
                try {
                  const { generateAllPDFsReact } = await import('@/lib/pdf-generator-react');
                  const documents = await generateAllPDFsReact(resident);
                  
                  // Salvează documentele în state pentru vizualizare
                  setGeneratedDocs(documents);
                  alert(`✅ ${documents.length} documente generate cu succes!`);
                } catch (error) {
                  console.error('Error generating PDFs:', error);
                  alert('Eroare la generarea documentelor: ' + (error as Error).message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Se generează documentele...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generează Contracte
                </>
              )}
            </button>
          </div>

          {/* Lista documente generate */}
          {generatedDocs.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Documente Generate</h3>
              <div className="space-y-2">
                {generatedDocs.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">{doc.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const url = URL.createObjectURL(doc.blob);
                          window.open(url, '_blank');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Deschide
                      </button>
                      <button
                        onClick={() => {
                          const url = URL.createObjectURL(doc.blob);
                          const iframe = document.createElement('iframe');
                          iframe.style.display = 'none';
                          iframe.src = url;
                          document.body.appendChild(iframe);
                          iframe.onload = () => {
                            iframe.contentWindow?.print();
                          };
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Printează
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  generatedDocs.forEach(doc => {
                    const url = URL.createObjectURL(doc.blob);
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = url;
                    document.body.appendChild(iframe);
                    iframe.onload = () => {
                      setTimeout(() => {
                        iframe.contentWindow?.print();
                      }, 500);
                    };
                  });
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                <Printer className="w-5 h-5" />
                Printează Toate Documentele
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              <Home className="w-5 h-5" />
              Înapoi la Dashboard
            </Link>
            
            <Link
              href="/residents/add"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
            >
              Adaugă Alt Rezident
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
