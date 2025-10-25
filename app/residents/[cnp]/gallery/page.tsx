'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Upload, Trash2, Image as ImageIcon, Loader2, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface Photo {
  id: string;
  url: string;
  description: string;
  category: string;
  fileName: string;
  uploadedAt: any;
}

export default function ResidentGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const cnp = params.cnp as string;
  
  // Citim caminId din URL query params
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const caminIdFromUrl = searchParams.get('caminId') || '';
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [residentName, setResidentName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [familyLink, setFamilyLink] = useState('');

  const categories = [
    { value: 'evenimente', label: '🎉 Evenimente' },
    { value: 'mese', label: '🍽️ Mese' },
    { value: 'activitati', label: '🏃 Activități' },
    { value: 'creativitate', label: '🎨 Creativitate' },
    { value: 'social', label: '👥 Social' },
    { value: 'altele', label: '📸 Altele' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      await loadPhotos(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [cnp, router]);

  const loadPhotos = async (userId: string) => {
    try {
      // Folosim caminId din URL
      if (!caminIdFromUrl) {
        console.error('❌ CaminId lipsă din URL!');
        return;
      }
      
      console.log('✅ Folosim caminId:', caminIdFromUrl);
      setLocationId(caminIdFromUrl);

      const galleryRef = collection(
        db,
        'companies',
        userId,
        'camine',
        caminIdFromUrl,
        'residents',
        cnp,
        'gallery'
      );

      const q = query(galleryRef, orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);

      const photosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];

      setPhotos(photosData);
      console.log('📸 Loaded', photosData.length, 'photos');
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !auth.currentUser) return;
    
    // Verificăm că avem caminId
    if (!caminIdFromUrl) {
      alert('❌ Eroare: CaminId lipsă! Te rog reîncarcă pagina.');
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log('📤 Compressing:', file.name);
        
        // Compresie imagine (max 2MB)
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        
        const compressedFile = await imageCompression(file, options);
        console.log('✅ Compressed from', (file.size / 1024 / 1024).toFixed(2), 'MB to', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

        // Upload
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('residentCnp', cnp);
        formData.append('description', description);
        formData.append('category', selectedCategory || 'altele');
        formData.append('userId', auth.currentUser.uid);
        formData.append('locationId', caminIdFromUrl);

        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }

        console.log('✅ Uploaded:', data.photoId);
      }

      // Reset form
      setDescription('');
      setSelectedCategory('');
      
      // Refresh photos
      await loadPhotos(auth.currentUser.uid);
      
      alert(`✅ ${files.length} ${files.length === 1 ? 'poză uploadată' : 'poze uploadate'} cu succes!`);
    } catch (error: any) {
      console.error('Error uploading:', error);
      alert('❌ Eroare la upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Sigur vrei să ștergi această poză?')) return;
    if (!auth.currentUser) return;

    try {
      const photoRef = doc(
        db,
        'companies',
        auth.currentUser.uid,
        'camine',
        locationId,
        'residents',
        cnp,
        'gallery',
        photoId
      );

      await deleteDoc(photoRef);
      
      // Refresh photos
      setPhotos(photos.filter(p => p.id !== photoId));
      
      console.log('✅ Deleted photo:', photoId);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Eroare la ștergere!');
    }
  };

  const generateFamilyLink = async () => {
    if (!auth.currentUser) return;
    
    if (!caminIdFromUrl) {
      alert('❌ Eroare: CaminId lipsă!');
      return;
    }

    try {
      const response = await fetch('/api/generate-family-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          locationId: caminIdFromUrl,
          residentCnp: cnp,
          apartinatorEmail: 'apartinator@email.com', // TODO: get from resident data
          residentName: residentName || 'Rezident',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFamilyLink(data.link);
        alert('✅ Link generat! Copiază-l și trimite-l aparținătorului.');
      }
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Eroare la generare link!');
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/50 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">📸 Galerie Foto</h1>
              <p className="text-gray-600">CNP: {cnp}</p>
            </div>
          </div>

          <button
            onClick={generateFamilyLink}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <LinkIcon className="w-5 h-5" />
            Generează Link Aparținător
          </button>
        </div>

        {/* Family Link */}
        {familyLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm font-semibold text-blue-900 mb-2">🔗 Link Acces Aparținător:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={familyLink}
                readOnly
                className="flex-1 px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(familyLink);
                  alert('✅ Link copiat!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                📋 Copiază
              </button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📤 Upload Poze Noi</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Selectează categorie</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descriere (opțional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Ziua de naștere, Plimbare în parc..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <label className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg cursor-pointer hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Se încarcă...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Selectează Poze
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Poți selecta multiple poze. Vor fi comprimate automat la max 2MB.
          </p>
        </div>

        {/* Photos Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📚 Galerie ({photos.length} {photos.length === 1 ? 'poză' : 'poze'})
          </h2>

          {photos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nu există poze încă. Uploadează prima poză!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.description}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                    <p className="text-white text-xs text-center">{photo.description || photo.category}</p>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
