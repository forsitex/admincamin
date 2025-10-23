'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { 
  FileText, 
  Upload, 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';

interface Report {
  id: string;
  fileName: string;
  uploadedAt: Date;
  analysis?: {
    summary: string;
    keyMetrics: {
      label: string;
      value: string;
      trend?: 'up' | 'down' | 'neutral';
    }[];
    insights: string[];
    recommendations: string[];
  };
  status: 'processing' | 'completed' | 'error';
}

export default function RapoartePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [organizationType, setOrganizationType] = useState<string>('camin');
  const [userRequest, setUserRequest] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        // Verifică tipul organizației
        const organizationRef = doc(db, 'organizations', currentUser.uid);
        const organizationSnap = await getDoc(organizationRef);
        
        if (organizationSnap.exists()) {
          const orgData = organizationSnap.data();
          setOrganizationType(orgData.type || 'camin');
        }

        // Încarcă rapoartele existente
        await loadReports(currentUser.uid);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadReports = async (userId: string) => {
    try {
      const reportsRef = collection(db, 'organizations', userId, 'reports');
      const snapshot = await getDocs(reportsRef);
      
      const loadedReports: Report[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
      } as Report));

      setReports(loadedReports.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()));
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else if (file && file.name.endsWith('.pdf')) {
      alert('⚠️ PDF-urile nu sunt suportate momentan. Vă rugăm să convertești PDF-ul în DOCX folosind un convertor online gratuit (ex: pdf2docx.com) și să încărcați fișierul DOCX.');
    } else {
      alert('Vă rugăm să selectați un fișier DOCX valid.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else if (file && file.name.endsWith('.pdf')) {
      alert('⚠️ PDF-urile nu sunt suportate momentan. Vă rugăm să convertești PDF-ul în DOCX folosind un convertor online gratuit (ex: pdf2docx.com) și să încărcați fișierul DOCX.');
    } else {
      alert('Vă rugăm să selectați un fișier DOCX valid.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !auth.currentUser) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', auth.currentUser.uid);
      formData.append('organizationType', organizationType);
      formData.append('userRequest', userRequest);

      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Eroare la procesarea raportului');
      }

      const result = await response.json();

      // Salvează raportul în Firebase
      const reportsRef = collection(db, 'organizations', auth.currentUser.uid, 'reports');
      await addDoc(reportsRef, {
        fileName: selectedFile.name,
        uploadedAt: Timestamp.now(),
        analysis: result.analysis,
        status: 'completed',
      });

      // Reîncarcă rapoartele
      await loadReports(auth.currentUser.uid);

      setSelectedFile(null);
      setUserRequest('');
      alert('Raport analizat cu succes!');
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Eroare la încărcarea raportului. Vă rugăm să încercați din nou.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!auth.currentUser) return;
    
    if (!confirm('Sigur doriți să ștergeți acest raport?')) return;

    try {
      await deleteDoc(doc(db, 'organizations', auth.currentUser.uid, 'reports', reportId));
      await loadReports(auth.currentUser.uid);
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Eroare la ștergerea raportului.');
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
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Înapoi
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Rapoarte Financiare
          </h1>
          <p className="text-gray-600">
            Încarcă bilanțuri și rapoarte financiare pentru analiză automată cu AI
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6 text-purple-600" />
            Încarcă Raport Nou
          </h2>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            
            {selectedFile ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                
                {/* Câmp pentru cerința utilizatorului */}
                <div className="max-w-2xl mx-auto">
                  <label className="block text-left mb-2 text-sm font-medium text-gray-700">
                    Ce doriți să analizeze AI-ul? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={userRequest}
                    onChange={(e) => setUserRequest(e.target.value)}
                    placeholder="Exemplu: Calculează profitul net, marja de profit și identifică cele mai mari cheltuieli. Oferă recomandări pentru reducerea costurilor."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-gray-900"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-left">
                    💡 Fiți cât mai specific: menționați indicatorii, calculele sau informațiile pe care doriți să le obțineți din raport.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !userRequest.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Se procesează...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Analizează cu AI
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setUserRequest('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Anulează
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-lg text-gray-700 mb-2">
                  Trage și plasează fișierul DOCX aici
                </p>
                <p className="text-sm text-gray-500 mb-4">sau</p>
                <label className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer">
                  Selectează Fișier
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-4">
                  Format acceptat: DOCX (bilanțuri, rapoarte financiare)
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  💡 Aveți PDF? Convertește-l gratuit în DOCX pe <a href="https://pdf2docx.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">pdf2docx.com</a>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Rapoarte Analizate ({reports.length})
          </h2>

          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Nu aveți rapoarte încărcate încă. Încărcați primul raport pentru analiză AI.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {report.fileName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {report.uploadedAt.toLocaleDateString('ro-RO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {report.analysis && (
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                        <h4 className="font-bold text-gray-900 mb-2">📝 Rezumat</h4>
                        <p className="text-gray-700">{report.analysis.summary}</p>
                      </div>

                      {/* Key Metrics */}
                      {report.analysis.keyMetrics.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">📊 Indicatori Cheie</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {report.analysis.keyMetrics.map((metric, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 rounded-xl p-4 border-l-4 border-purple-500"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">{metric.label}</span>
                                  {metric.trend && (
                                    <TrendingUp
                                      className={`w-4 h-4 ${
                                        metric.trend === 'up'
                                          ? 'text-green-600'
                                          : metric.trend === 'down'
                                          ? 'text-red-600 rotate-180'
                                          : 'text-gray-400'
                                      }`}
                                    />
                                  )}
                                </div>
                                <div className="text-xl font-bold text-gray-900">
                                  {metric.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Insights */}
                      {report.analysis.insights.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            Observații
                          </h4>
                          <ul className="space-y-2">
                            {report.analysis.insights.map((insight, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-gray-700"
                              >
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {report.analysis.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Recomandări
                          </h4>
                          <ul className="space-y-2">
                            {report.analysis.recommendations.map((rec, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-gray-700"
                              >
                                <span className="text-green-600 mt-1">✓</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
