'use client';

/**
 * Pagină: Setup Template PDF
 * User uploadează PDF și setează manual coordonatele câmpurilor
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, Save, ArrowLeft, Plus, X } from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Field {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  page: number;
}

export default function SetupTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const cnp = params.cnp as string;

  const [user, setUser] = useState<any>(null);
  const [resident, setResident] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [saving, setSaving] = useState(false);

  // Câmpuri predefinite
  const predefinedFields = [
    { name: 'beneficiarNumeComplet', label: 'Nume Complet' },
    { name: 'beneficiarCnp', label: 'CNP' },
    { name: 'beneficiarAdresa', label: 'Adresă' },
    { name: 'beneficiarDataNasterii', label: 'Data Nașterii' },
    { name: 'apartinatorNumeComplet', label: 'Aparținător' },
  ];

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
      // Încarcă rezidentul din Firebase
      const locationsRef = collection(db, 'organizations', userId, 'locations');
      const locationsSnap = await getDocs(locationsRef);
      
      for (const locationDoc of locationsSnap.docs) {
        const residentsRef = collection(db, 'organizations', userId, 'locations', locationDoc.id, 'residents');
        const residentsSnap = await getDocs(residentsRef);
        
        const residentDoc = residentsSnap.docs.find(doc => doc.id === residentCnp);
        if (residentDoc) {
          setResident({ id: residentDoc.id, ...residentDoc.data() });
          break;
        }
      }
    } catch (err) {
      console.error('Error loading resident:', err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Selectează un fișier PDF valid');
      return;
    }
    
    setSelectedFile(file);
    
    // Creăm URL pentru preview
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    
    // Inițializăm câmpurile cu coordonate default
    const initialFields = predefinedFields.map((field, index) => ({
      id: `field-${index}`,
      name: field.name,
      label: field.label,
      x: 100,
      y: 100 + (index * 30),
      page: 1
    }));
    setFields(initialFields);
  };

  const updateFieldCoordinate = (fieldId: string, axis: 'x' | 'y', value: number) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, [axis]: value } : field
    ));
  };

  const handleSave = async () => {
    if (!selectedFile || !user || fields.length === 0) {
      alert('Completează toate câmpurile');
      return;
    }

    try {
      setSaving(true);

      // 1. Upload PDF în Storage
      const fileName = `template-${Date.now()}.pdf`;
      const storageRef = ref(storage, `templates/${user.uid}/${fileName}`);
      await uploadBytes(storageRef, selectedFile);
      const pdfDownloadUrl = await getDownloadURL(storageRef);

      // 2. Salvăm template-ul în Firestore
      const templateRef = doc(db, 'organizations', user.uid, 'templates', fileName);
      await setDoc(templateRef, {
        name: selectedFile.name,
        pdfUrl: pdfDownloadUrl,
        fields: fields,
        createdAt: Date.now(),
        createdBy: user.uid
      });

      alert('✅ Template salvat cu succes!');
      router.push(`/residents/${cnp}/generate-from-template?template=${fileName}`);
      
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Eroare la salvarea template-ului');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
            Setup Template PDF
          </h1>
          <p className="text-gray-600">
            Uploadează PDF-ul și setează coordonatele câmpurilor (o singură dată)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stânga: Upload & Câmpuri */}
          <div className="space-y-6">
            {/* Upload */}
            {!selectedFile ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-500 transition">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Click pentru a selecta PDF
                    </p>
                    <p className="text-sm text-gray-600">
                      Template contract (max 10MB)
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <>
                {/* Info PDF */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">PDF Selectat:</h3>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPdfUrl(null);
                      setFields([]);
                    }}
                    className="mt-4 text-sm text-red-600 hover:text-red-700"
                  >
                    Schimbă PDF
                  </button>
                </div>

                {/* Câmpuri */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Setează Coordonatele Câmpurilor:
                  </h3>
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-3">{field.label}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">X (stânga)</label>
                            <input
                              type="number"
                              value={field.x}
                              onChange={(e) => updateFieldCoordinate(field.id, 'x', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Y (sus)</label>
                            <input
                              type="number"
                              value={field.y}
                              onChange={(e) => updateFieldCoordinate(field.id, 'y', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>Salvare...</>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Salvează Template
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Dreapta: Preview PDF */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Preview PDF:</h3>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-[600px] border border-gray-200 rounded-lg"
              />
            ) : (
              <div className="h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">PDF va apărea aici</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
