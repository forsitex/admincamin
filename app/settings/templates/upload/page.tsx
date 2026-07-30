'use client';

/**
 * Pagină: Upload Template Nou
 * 
 * Permite utilizatorilor să uploadeze un contract PDF și să îl analizeze cu AI
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { validatePdfFile, convertPdfToBase64, generateUniqueFileName } from '@/lib/pdf-utils';
import { OrganizationType, ContractAnalysisResponse } from '@/types/template';

export default function UploadTemplatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [organizationType, setOrganizationType] = useState<OrganizationType>('camin');
  
  // Form state
  const [templateName, setTemplateName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<ContractAnalysisResponse | null>(null);

  // Verificare autentificare și tip organizație
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      // Citește tipul organizației
      const orgDoc = await getDoc(doc(db, 'organizations', currentUser.uid));
      if (orgDoc.exists()) {
        const orgType = orgDoc.data().type;
        setOrganizationType(orgType || 'camin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validare
    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Fișier invalid');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // Setează numele template-ului automat dacă e gol
    if (!templateName) {
      const nameWithoutExt = file.name.replace('.pdf', '');
      setTemplateName(nameWithoutExt);
    }
  };

  // Handle upload și analiză
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || !user || !templateName.trim()) {
      setError('Completează toate câmpurile');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 1. Conversie PDF → Base64
      console.log('📄 Conversie PDF la Base64...');
      const pdfBase64 = await convertPdfToBase64(selectedFile);

      // 2. Analiză cu AI
      setAnalyzing(true);
      console.log('🤖 Trimitere la OpenAI pentru analiză...');
      
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          organizationType,
          templateName: templateName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la analiza contractului');
      }

      const result = await response.json();
      console.log('✅ Analiză completă:', result);
      
      setAnalysisResult(result.data);
      setAnalyzing(false);

      // 3. Upload PDF în Firebase Storage
      console.log('☁️ Upload PDF în Firebase Storage...');
      const uniqueFileName = generateUniqueFileName(selectedFile.name);
      const storageRef = ref(storage, `templates/${user.uid}/${uniqueFileName}`);
      await uploadBytes(storageRef, selectedFile);
      const pdfUrl = await getDownloadURL(storageRef);
      console.log('✅ PDF uploadat:', pdfUrl);

      // 4. Salvare template în Firestore
      setSaving(true);
      console.log('💾 Salvare template în Firestore...');
      
      const templateId = `template_${Date.now()}`;
      const templateData = {
        id: templateId,
        name: templateName.trim(),
        type: organizationType,
        pdfUrl,
        fieldMapping: result.data.fields,
        isActive: true,
        createdAt: Date.now(),
        userId: user.uid,
        metadata: {
          documentsGenerated: 0,
          version: 1,
        },
      };

      await setDoc(
        doc(db, 'organizations', user.uid, 'templates', templateId),
        templateData
      );

      console.log('✅ Template salvat cu succes!');
      setSuccess(true);
      setSaving(false);

      // Redirect după 2 secunde
      setTimeout(() => {
        router.push('/settings/templates');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Eroare:', err);
      setError(err.message || 'Eroare la procesarea template-ului');
      setAnalyzing(false);
      setSaving(false);
    } finally {
      setUploading(false);
    }
  };

  const isProcessing = uploading || analyzing || saving;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-none mx-auto">
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
            Upload Template Nou
          </h1>
          <p className="text-gray-600">
            Uploadează un contract PDF și lasă AI-ul să detecteze automat câmpurile
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Template creat cu succes!</h3>
              <p className="text-green-800">Redirecționare către lista de template-uri...</p>
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

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Nume Template */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nume Template *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Contract Cămin Fortunei"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          {/* Tip Organizație (read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip Organizație
            </label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
              {organizationType === 'camin' && '🏥 Cămin Bătrâni'}
              {organizationType === 'gradinita' && '🎨 Grădiniță'}
              {organizationType === 'spital' && '❤️ Spital/Clinică'}
              {organizationType === 'hotel' && '🏨 Hotel/Pensiune'}
            </div>
          </div>

          {/* Upload PDF */}
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
                    {saving && 'Salvare template...'}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {analyzing && 'Acest proces poate dura 5-15 secunde'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Result Preview */}
          {analysisResult && !saving && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Analiză Completă
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>✅ {analysisResult.fields.length} câmpuri detectate</p>
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
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || !templateName.trim() || isProcessing || success}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-medium shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesare...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Succes!
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analizează cu AI
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            ℹ️ Ce se întâmplă după upload?
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">1.</span>
              <span>PDF-ul este trimis către OpenAI GPT-4o Vision</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">2.</span>
              <span>AI-ul detectează automat câmpurile (nume, CNP, adresă, etc.)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">3.</span>
              <span>Template-ul este salvat în contul tău</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">4.</span>
              <span>Poți folosi template-ul pentru completare automată</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
