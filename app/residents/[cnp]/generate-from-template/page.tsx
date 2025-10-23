'use client';

/**
 * Pagină: Generare PDF din Template
 * Folosește template-ul salvat pentru a genera PDF completat
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Download, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function GenerateFromTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const cnp = params.cnp as string;
  const templateId = searchParams.get('template');

  const [user, setUser] = useState<any>(null);
  const [resident, setResident] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      await loadData(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router, cnp, templateId]);

  const loadData = async (userId: string) => {
    try {
      setLoading(true);

      // Încarcă rezidentul
      const locationsRef = collection(db, 'organizations', userId, 'locations');
      const locationsSnap = await getDocs(locationsRef);
      
      for (const locationDoc of locationsSnap.docs) {
        const residentsRef = collection(db, 'organizations', userId, 'locations', locationDoc.id, 'residents');
        const residentsSnap = await getDocs(residentsRef);
        
        const residentDoc = residentsSnap.docs.find(doc => doc.id === cnp);
        if (residentDoc) {
          setResident({ id: residentDoc.id, ...residentDoc.data() });
          break;
        }
      }

      // Încarcă template-ul
      if (templateId) {
        const templateDoc = await getDoc(doc(db, 'organizations', userId, 'templates', templateId));
        if (templateDoc.exists()) {
          setTemplate({ id: templateDoc.id, ...templateDoc.data() });
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!template || !resident) return;

    try {
      setGenerating(true);

      // Descarcă PDF-ul template
      const response = await fetch(template.pdfUrl);
      const pdfBlob = await response.blob();
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      }).then(result => result.split(',')[1]);

      // Apelează API-ul de completare
      const fillResponse = await fetch('/api/fill-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          fields: template.fields,
          residentData: resident,
        }),
      });

      if (!fillResponse.ok) {
        throw new Error('Eroare la completarea PDF');
      }

      const fillResult = await fillResponse.json();

      // Convertim Base64 → Blob pentru download
      const pdfBytes = Uint8Array.from(atob(fillResult.data.pdfBase64), c => c.charCodeAt(0));
      const pdfBlobResult = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlobResult);
      
      setPdfUrl(url);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Eroare la generarea PDF-ului');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Înapoi
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Generare Contract
        </h1>
        <p className="text-gray-600 mb-8">
          Folosind template: {template?.name}
        </p>

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

        {/* Generare */}
        {!pdfUrl ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generare...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Generează PDF Completat
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                PDF Generat cu Succes!
              </h2>
            </div>

            <div className="flex gap-4">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Deschide PDF
              </a>
              <a
                href={pdfUrl}
                download={`Contract-${resident.beneficiarNumeComplet}.pdf`}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-5 h-5" />
                Descarcă PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
