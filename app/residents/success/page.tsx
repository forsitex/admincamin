'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, FileText, Printer, Download, Home, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface PDFDocument {
  name: string;
  filename: string;
  blob: Blob;
}

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cnp = searchParams.get('cnp');
  
  const [resident, setResident] = useState<any | null>(null);
  const [company, setCompany] = useState<any | null>(null);
  const [location, setLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedDocs, setGeneratedDocs] = useState<PDFDocument[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      if (cnp) {
        await loadResident(currentUser.uid, cnp);
      }
    });

    return () => unsubscribe();
  }, [cnp, router]);

  const loadResident = async (userId: string, residentCnp: string) => {
    try {
      setLoading(true);
      let foundResident = null;
      let foundLocation = null;
      let foundCompany = null;
      
      console.log('🔍 Căutare rezident:', residentCnp);
      console.log('👤 User ID:', userId);
      
      // Încearcă structura nouă (organizations/locations/residents)
      const locationsRef = collection(db, 'organizations', userId, 'locations');
      const locationsSnap = await getDocs(locationsRef);
      
      console.log('📍 Locations găsite:', locationsSnap.size);
      
      for (const locationDoc of locationsSnap.docs) {
        console.log('📂 Verificare location:', locationDoc.id);
        const residentsRef = collection(db, 'organizations', userId, 'locations', locationDoc.id, 'residents');
        const residentsSnap = await getDocs(residentsRef);
        
        console.log('👥 Rezidenți în location:', residentsSnap.size);
        residentsSnap.docs.forEach(doc => console.log('  - CNP:', doc.id));
        
        const residentDoc = residentsSnap.docs.find(doc => doc.id === residentCnp);
        if (residentDoc) {
          console.log('✅ Rezident găsit în structura nouă!');
          foundResident = { id: residentDoc.id, ...residentDoc.data() };
          foundLocation = { id: locationDoc.id, ...locationDoc.data() };
          
          // Citește și company
          const orgDoc = await getDoc(doc(db, 'organizations', userId));
          if (orgDoc.exists()) {
            foundCompany = orgDoc.data();
          }
          break;
        }
      }
      
      // Dacă nu găsește, încearcă structura veche (companies/camine/residents)
      if (!foundResident) {
        console.log('⚠️ Nu s-a găsit în structura nouă, încerc structura veche...');
        const camineRef = collection(db, 'companies', userId, 'camine');
        const camineSnap = await getDocs(camineRef);
        
        console.log('🏠 Cămine găsite (vechi):', camineSnap.size);
        
        for (const caminDoc of camineSnap.docs) {
          console.log('📂 Verificare cămin:', caminDoc.id);
          const residentsRef = collection(db, 'companies', userId, 'camine', caminDoc.id, 'residents');
          const residentsSnap = await getDocs(residentsRef);
          
          console.log('👥 Rezidenți în cămin:', residentsSnap.size);
          residentsSnap.docs.forEach(doc => console.log('  - CNP:', doc.id));
          
          const residentDoc = residentsSnap.docs.find(doc => doc.id === residentCnp);
          if (residentDoc) {
            console.log('✅ Rezident găsit în structura veche!');
            foundResident = { id: residentDoc.id, ...residentDoc.data() };
            foundLocation = { id: caminDoc.id, ...caminDoc.data() };
            
            // Citește și company
            const companyDoc = await getDoc(doc(db, 'companies', userId));
            if (companyDoc.exists()) {
              foundCompany = companyDoc.data();
            }
            break;
          }
        }
      }
      
      if (foundResident) {
        console.log('🎉 Rezident încărcat cu succes!');
        setResident(foundResident);
        setLocation(foundLocation);
        setCompany(foundCompany);
      } else {
        console.log('❌ Rezident NU a fost găsit nicăieri!');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-none mx-auto px-6 py-12">
        <div className="max-w-none mx-auto">
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
              <strong>{location?.name}</strong>
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

          {/* Action Buttons - 2 Opțiuni */}
          <div className="mb-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Alege cum vrei să generezi documentele:
            </h3>

            {/* Opțiunea 1: Upload Custom + AI */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Opțiunea 1: Template Custom cu AI
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>📄 Upload contract propriu (PDF)</li>
                    <li>🧠 AI detectează câmpurile automat</li>
                    <li>✨ Completare automată cu date rezident</li>
                    <li>⚡ Precizie 99%+</li>
                  </ul>
                  <button
                    onClick={() => {
                      router.push(`/residents/${cnp}/generate-custom`);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
                  >
                    <FileText className="w-5 h-5" />
                    Upload & Generează cu AI
                  </button>
                </div>
              </div>
            </div>

            {/* Opțiunea 2: Template-uri Standard */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Opțiunea 2: Template-uri Standard (Ordin 1126-2025)
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>📑 16 documente pre-configurate</li>
                    <li>⚡ Generare instant</li>
                    <li>✅ Conform legislației în vigoare</li>
                    <li>🔒 Testate și validate</li>
                  </ul>
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
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Se generează...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Generează 16 Documente Standard
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Opțiune Skip */}
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard-new')}
                className="text-gray-600 hover:text-gray-900 font-medium underline"
              >
                ⏭️ Sari - Generez mai târziu
              </button>
            </div>
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
