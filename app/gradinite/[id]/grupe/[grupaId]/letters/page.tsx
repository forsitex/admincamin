'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Mail,
  Plus,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';

interface Letter {
  id: string;
  type: 'monday' | 'friday';
  week: string;
  tema: string;
  publishedAt: any;
  publishedBy: string;
}

export default function GrupaLettersPage() {
  const params = useParams();
  const router = useRouter();
  const gradinitaId = params.id as string;
  const grupaId = params.grupaId as string;

  const [loading, setLoading] = useState(true);
  const [grupa, setGrupa] = useState<any>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [currentWeek, setCurrentWeek] = useState('');

  useEffect(() => {
    loadData();
  }, [gradinitaId, grupaId]);

  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Încarcă date grădiniță și grupă
      const gradinitaRef = doc(db, 'organizations', user.uid, 'locations', gradinitaId);
      const gradinitaSnap = await getDoc(gradinitaRef);

      if (gradinitaSnap.exists()) {
        const data = gradinitaSnap.data();
        const grupaData = data.grupe?.find((g: any) => g.id === grupaId);
        setGrupa(grupaData);

        // Încarcă scrisori
        const lettersRef = collection(
          db,
          'organizations',
          user.uid,
          'locations',
          gradinitaId,
          'weeklyLetters'
        );
        const lettersSnap = await getDocs(lettersRef);
        
        const lettersData = lettersSnap.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter((letter: any) => letter.grupa === grupaData?.nume)
          .sort((a: any, b: any) => {
            return b.publishedAt?.seconds - a.publishedAt?.seconds;
          }) as Letter[];

        setLetters(lettersData);

        // Calculează săptămâna curentă
        const now = new Date();
        const weekNumber = getWeekNumber(now);
        setCurrentWeek(`${now.getFullYear()}-W${weekNumber}`);
      }
    } catch (error) {
      console.error('Eroare încărcare date:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getWeekDateRange = (weekStr: string): string => {
    const [year, week] = weekStr.split('-W');
    const simple = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    
    const endDate = new Date(ISOweekStart);
    endDate.setDate(endDate.getDate() + 4);

    return `${ISOweekStart.getDate()} - ${endDate.getDate()} ${endDate.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}`;
  };

  const hasLetterForWeek = (week: string, type: 'monday' | 'friday'): boolean => {
    return letters.some(letter => letter.week === week && letter.type === type);
  };

  const handleDelete = async (letterId: string) => {
    if (!confirm('Sigur vrei să ștergi această scrisoare?')) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      await deleteDoc(
        doc(
          db,
          'organizations',
          user.uid,
          'locations',
          gradinitaId,
          'weeklyLetters',
          letterId
        )
      );

      setLetters(letters.filter(l => l.id !== letterId));
    } catch (error) {
      console.error('Eroare ștergere:', error);
      alert('Eroare la ștergere. Te rog încearcă din nou.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Se încarcă scrisorile...</p>
        </div>
      </div>
    );
  }

  const mondayLetter = letters.find(l => l.week === currentWeek && l.type === 'monday');
  const fridayLetter = letters.find(l => l.week === currentWeek && l.type === 'friday');
  const pastLetters = letters.filter(l => l.week !== currentWeek);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.push(`/gradinite/${gradinitaId}/grupe/${grupaId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Înapoi la Grupă
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Scrisori */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center gap-4">
              <Mail className="w-12 h-12" />
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">📬 Scrisori Săptămânale</h1>
                <p className="text-white/90 text-xl">{grupa?.nume}</p>
              </div>
            </div>
          </div>

          {/* Săptămâna Curentă */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Săptămâna Curentă ({getWeekDateRange(currentWeek)})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scrisoare Luni */}
              <div className="border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">LUNI - "Ce ne așteaptă"</h3>
                </div>

                {mondayLetter ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      Tema: <strong>{mondayLetter.tema}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Publicat: {new Date(mondayLetter.publishedAt?.seconds * 1000).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/gradinite/${gradinitaId}/grupe/${grupaId}/letters/${mondayLetter.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Eye className="w-4 h-4" />
                        Vezi
                      </button>
                      <button
                        onClick={() => router.push(`/gradinite/${gradinitaId}/grupe/${grupaId}/letters/${mondayLetter.id}/edit`)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mondayLetter.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => router.push(`/gradinite/${gradinitaId}/grupe/${grupaId}/letters/create-monday`)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                    Creează Scrisoare Luni
                  </button>
                )}
              </div>

              {/* Scrisoare Vineri */}
              <div className="border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">VINERI - "Ce am realizat"</h3>
                </div>

                {fridayLetter ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      Tema: <strong>{fridayLetter.tema}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Publicat: {new Date(fridayLetter.publishedAt?.seconds * 1000).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/gradinite/${gradinitaId}/grupe/${grupaId}/letters/${fridayLetter.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Eye className="w-4 h-4" />
                        Vezi
                      </button>
                      <button
                        onClick={() => router.push(`/gradinite/${gradinitaId}/grupe/${grupaId}/letters/${fridayLetter.id}/edit`)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(fridayLetter.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => router.push(`/gradinite/${gradinitaId}/grupe/${grupaId}/letters/create-friday`)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    disabled={!mondayLetter}
                  >
                    <Plus className="w-5 h-5" />
                    Creează Scrisoare Vineri
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Arhivă */}
          {pastLetters.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Arhivă Scrisori Anterioare</h2>
              
              <div className="space-y-4">
                {pastLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${
                        letter.type === 'monday' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {letter.type === 'monday' ? '🔵 LUNI' : '🟢 VINERI'} - {letter.tema}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Săptămâna {getWeekDateRange(letter.week)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Publicat: {new Date(letter.publishedAt?.seconds * 1000).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/gradinite/${gradinitaId}/grupe/${grupaId}/letters/${letter.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(letter.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
