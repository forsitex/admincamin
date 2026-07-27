'use client';

/**
 * Pagină: Generare Contract Custom cu AI
 * 
 * Permite upload PDF custom și completare automată cu date rezident
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ArrowLeft, Download } from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { validatePdfFile, convertPdfToBase64, generateUniqueFileName } from '@/lib/pdf-utils';

export default function GenerateCustomPage() {
  const router = useRouter();
  const params = useParams();
  const cnp = params.cnp as string;

  const [user, setUser] = useState<any>(null);
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Results
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  // Încărcare date rezident
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      await loadResident(currentUser.uid, cnp);
    });

    return () => unsubscribe();
  }, [router, cnp]);

  const loadResident = async (userId: string, residentCnp: string) => {
    try {
      setLoading(true);
      let foundResident = null;
      
      // Încearcă mai întâi structura nouă (organizations/locations/residents)
      const locationsRef = collection(db, 'organizations', userId, 'locations');
      const locationsSnap = await getDocs(locationsRef);
      
      for (const locationDoc of locationsSnap.docs) {
        const residentsRef = collection(db, 'organizations', userId, 'locations', locationDoc.id, 'residents');
        const residentsSnap = await getDocs(residentsRef);
        
        const residentDoc = residentsSnap.docs.find(doc => doc.id === residentCnp);
        if (residentDoc) {
          foundResident = { id: residentDoc.id, ...residentDoc.data() };
          break;
        }
      }
      
      // Dacă nu găsește, încearcă structura veche (companies/camine/residents)
      if (!foundResident) {
        const camineRef = collection(db, 'companies', userId, 'camine');
        const camineSnap = await getDocs(camineRef);
        
        for (const caminDoc of camineSnap.docs) {
          const residentsRef = collection(db, 'companies', userId, 'camine', caminDoc.id, 'residents');
          const residentsSnap = await getDocs(residentsRef);
          
          const residentDoc = residentsSnap.docs.find(doc => doc.id === residentCnp);
          if (residentDoc) {
            foundResident = { id: residentDoc.id, ...residentDoc.data() };
            break;
          }
        }
      }
      
      if (foundResident) {
        setResident(foundResident);
      } else {
        setError('Rezident negăsit');
      }
    } catch (err) {
      console.error('Error loading resident:', err);
      setError('Eroare la încărcarea datelor rezidentului');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Fișier invalid');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  };

  // Handle upload și generare
  const handleUploadAndGenerate = async () => {
    if (!selectedFile || !user || !resident) {
      setError('Date incomplete');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 1. Conversie PDF → Base64
      console.log('📄 Conversie PDF la Base64...');
      const pdfBase64 = await convertPdfToBase64(selectedFile);

      // 2. Completare PDF SMART (mappings fixe + AI)
      setAnalyzing(true);
      setGenerating(true);
      console.log('🚀 Completare PDF cu AI...');
      
      const fillResponse = await fetch('/api/fill-pdf-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          fileName: selectedFile.name,
          residentData: resident,
        }),
      });

      if (!fillResponse.ok) {
        const errorData = await fillResponse.json();
        throw new Error(errorData.error || 'Eroare la completarea PDF');
      }

      const fillResult = await fillResponse.json();
      console.log(`✅ PDF completat! ${fillResult.data.completedFields}/${fillResult.data.totalFields} câmpuri`);
      
      setAnalyzing(false);
      setGenerating(false);

      // 3. Convertim Base64 → Blob pentru download
      const pdfBytes = Uint8Array.from(atob(fillResult.data.pdfBase64), c => c.charCodeAt(0));
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setGeneratedPdfUrl(pdfUrl);
      setGenerating(false);
      setSuccess(true);

      console.log('✅ Contract generat cu succes!');

    } catch (err: any) {
      console.error('❌ Eroare:', err);
      setError(err.message || 'Eroare la procesarea contractului');
      setAnalyzing(false);
      setGenerating(false);
    } finally {
      setUploading(false);
    }
  };

  const isProcessing = uploading || analyzing || generating;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Înapoi
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Generare Contract Custom cu AI
          </h1>
          <p className="text-gray-600">
            Upload contract propriu (PDF) și lasă AI-ul să îl completeze automat cu datele rezidentului
          </p>
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Important:</strong> Acceptăm doar fișiere PDF. Dacă ai DOCX, convertește-l în PDF mai întâi.
            </p>
          </div>
        </div>

        {/* Info Rezident */}
        {resident && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Date Rezident:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nume:</span>
                <p className="font-medium">{resident.beneficiarNumeComplet}</p>
              </div>
              <div>
                <span className="text-gray-600">CNP:</span>
                <p className="font-medium">{resident.beneficiarCnp}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Contract generat cu succes!</h3>
              <p className="text-green-800">Poți descărca contractul completat mai jos.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Eroare</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Form */}
        {!success && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract PDF *
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isProcessing}
                />
                
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {selectedFile ? (
                    <>
                      <FileText className="w-16 h-16 text-purple-600 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                        className="mt-4 text-sm text-red-600 hover:text-red-700"
                        disabled={isProcessing}
                      >
                        Șterge fișier
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        Click pentru a selecta PDF
                      </p>
                      <p className="text-sm text-gray-600">
                        sau drag & drop aici (max 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Progress Indicator */}
            {isProcessing && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">
                      {uploading && 'Pregătire fișier...'}
                      {analyzing && 'AI analizează contractul...'}
                      {generating && 'Generare PDF completat...'}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {analyzing && 'Acest proces poate dura 5-15 secunde'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Result Preview */}
            {analysisResult && !generating && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Analiză Completă
                </h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p>✅ {analysisResult.fields?.length || 0} câmpuri detectate</p>
                  {analysisResult.totalPages && (
                    <p>📄 {analysisResult.totalPages} pagini</p>
                  )}
                  {analysisResult.confidence && (
                    <p>🎯 Încredere: {(analysisResult.confidence * 100).toFixed(0)}%</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleUploadAndGenerate}
              disabled={!selectedFile || isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-medium shadow-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesare...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Analizează și Generează cu AI
                </>
              )}
            </button>
          </div>
        )}

        {/* Download Generated PDF */}
        {success && generatedPdfUrl && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contract Generat</h3>
            <div className="flex gap-4">
              <a
                href={generatedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FileText className="w-5 h-5" />
                Deschide PDF
              </a>
              <a
                href={generatedPdfUrl}
                download
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-5 h-5" />
                Descarcă PDF
              </a>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            💡 Cum funcționează?
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">1.</span>
              <span>Uploadezi contractul tău custom (PDF)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">2.</span>
              <span>AI-ul analizează și detectează automat câmpurile</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">3.</span>
              <span>Sistemul completează PDF-ul cu datele rezidentului</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">4.</span>
              <span>Descarci contractul completat gata de semnare</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
