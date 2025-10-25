'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { Upload, FileText, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface MedicalReport {
  id: string;
  residentName: string;
  residentCnp: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'docx';
  uploadDate: string;
  analysis: string;
  status: 'analyzing' | 'completed' | 'error';
}

export default function MedicalReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [residents, setResidents] = useState<any[]>([]);
  const [selectedResident, setSelectedResident] = useState('');
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      // Încarcă rezidenții
      try {
        const locationsRef = collection(db, 'organizations', currentUser.uid, 'locations');
        const locationsSnap = await getDocs(locationsRef);
        
        const allResidents: any[] = [];
        for (const locationDoc of locationsSnap.docs) {
          const residentsRef = collection(db, 'organizations', currentUser.uid, 'locations', locationDoc.id, 'residents');
          const residentsSnap = await getDocs(residentsRef);
          
          residentsSnap.docs.forEach(doc => {
            allResidents.push({
              id: doc.id,
              ...doc.data()
            });
          });
        }
        
        setResidents(allResidents);
      } catch (error) {
        console.error('Error loading residents:', error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Preview pentru imagini
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    console.log('🔵 handleUpload called');
    console.log('📁 selectedFile:', selectedFile?.name);
    console.log('👤 selectedResident:', selectedResident);
    
    if (!selectedFile || !selectedResident) {
      alert('Selectează un rezident și un fișier!');
      return;
    }

    console.log('✅ Validation passed, setting uploading to true');
    // Setăm loading IMEDIAT
    setUploading(true);
    console.log('🔄 uploading state set to true');

    try {
      // Convertim fișierul la base64 folosind Promise
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const base64Data = base64.split(',')[1]; // Eliminăm prefixul "data:image/jpeg;base64,"

      // Trimitem la API pentru analiză
      const response = await fetch('/api/analyze-medical-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          residentCnp: selectedResident,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Afișăm rezultatul analizei
        setAnalysisResult(data.analysis);
        alert('✅ Raport analizat cu succes! Vezi rezultatul mai jos.');
      } else {
        alert('❌ Eroare: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Eroare la upload!');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Rapoarte Medicale AI</h1>
          <p className="text-gray-600">
            Uploadează analize, radiografii, rețete - AI-ul le analizează automat!
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📤 Upload Raport Nou</h2>

          {/* Selectare Rezident */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Selectează Rezidentul
            </label>
            <select
              value={selectedResident}
              onChange={(e) => setSelectedResident(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">-- Alege rezident --</option>
              {residents.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.beneficiarNumeComplet} (CNP: {resident.beneficiarCnp})
                </option>
              ))}
            </select>
          </div>

          {/* Upload File */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Selectează Fișier
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
              <input
                type="file"
                accept="image/*,.pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">
                  Click pentru a selecta fișier
                </p>
                <p className="text-sm text-gray-400">
                  Imagini (JPG, PNG), PDF sau DOCX
                </p>
              </label>
            </div>
          </div>

          {/* Preview */}
          {selectedFile && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Fișier selectat:
              </p>
              <div className="flex items-center gap-3">
                {selectedFile.type.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                ) : (
                  <FileText className="w-5 h-5 text-purple-600" />
                )}
                <span className="text-gray-900">{selectedFile.name}</span>
                <span className="text-sm text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </span>
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-md rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Mesaj informativ dacă lipsește ceva */}
          {(!selectedFile || !selectedResident) && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-semibold mb-2">ℹ️ Pentru a analiza raportul:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                {!selectedResident && (
                  <li>• Selectează un rezident din dropdown</li>
                )}
                {!selectedFile && (
                  <li>• Selectează un fișier (imagine sau document)</li>
                )}
              </ul>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedResident || uploading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Se analizează...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analizează Raport
              </>
            )}
          </button>

          {/* Loading State - Vizibil în timpul analizei */}
          {uploading && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300 animate-pulse">
              <div className="flex items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-900">🤖 Analizăm imaginea...</p>
                  <p className="text-sm text-purple-700 mt-1">
                    Extrage informații medicale, identifică valori anormale și oferă explicații detaliate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Disclaimer:</strong> Această analiză este realizată de AI și are scop INFORMATIV. 
              NU înlocuiește consultul medical. Consultați ÎNTOTDEAUNA un medic pentru diagnostic și tratament oficial!
            </p>
          </div>
        </div>

        {/* Rezultat Analiză */}
        {analysisResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">🤖 Analiză AI</h2>
            </div>
            
            <div className="prose max-w-none">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {analysisResult}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Analizează Alt Raport
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(analysisResult);
                  alert('✅ Copiat în clipboard!');
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                📋 Copiază Rezultatul
              </button>
            </div>
          </div>
        )}

        {/* Lista Rapoarte */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Istoric Rapoarte</h2>
          
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nu există rapoarte încă. Uploadează primul raport!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{report.residentName}</h3>
                      <p className="text-sm text-gray-600">{report.fileName}</p>
                      <p className="text-xs text-gray-400">{report.uploadDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {report.status === 'analyzing' && (
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                      )}
                      {report.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
