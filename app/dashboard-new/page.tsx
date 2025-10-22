'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building, Plus, Users, Home, Trash2, User, LogOut, Settings } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';

export default function DashboardNewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [camine, setCamine] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteCamin = async (caminId: string, caminName: string) => {
    if (!confirm(`Sigur vrei să ștergi căminul "${caminName}"?`)) {
      return;
    }

    try {
      if (!user) return;

      await deleteDoc(doc(db, 'companies', user.uid, 'camine', caminId));
      
      // Reîncarcă lista
      setCamine(camine.filter(c => c.id !== caminId));
      
      console.log('✅ Cămin șters cu succes!');
    } catch (error) {
      console.error('❌ Eroare ștergere cămin:', error);
      alert('Eroare la ștergerea căminului. Te rugăm să încerci din nou.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // Încarcă date companie
      try {
        const companyRef = doc(db, 'companies', currentUser.uid);
        const companySnap = await getDoc(companyRef);

        if (companySnap.exists()) {
          setCompany(companySnap.data());

          // Încarcă cămine
          const camineRef = collection(db, 'companies', currentUser.uid, 'camine');
          const camineSnap = await getDocs(camineRef);
          const camineData = camineSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCamine(camineData);
        }
      } catch (error) {
        console.error('Error loading company:', error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  // Dashboard gol - fără cămine
  if (camine.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bine ai venit, {company?.name}! 🎉
                </h1>
                <p className="text-gray-600 mt-1">Hai să începem configurarea platformei</p>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Pagina Principală</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Empty State Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-12 h-12 text-purple-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Adaugă Primul Tău Cămin
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                Pentru a începe să gestionezi rezidenții, mai întâi trebuie să adaugi un cămin.
              </p>

              <Link
                href="/camine/add"
                className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                Adaugă Cămin
              </Link>

              {/* Steps Preview */}
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
                  Pașii următori
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
                      1
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Adaugă Cămin</h4>
                    <p className="text-sm text-gray-600">Configurează primul cămin</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg opacity-50">
                    <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold mb-2">
                      2
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Adaugă Reprezentanți</h4>
                    <p className="text-sm text-gray-600">Invită echipa ta</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg opacity-50">
                    <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold mb-2">
                      3
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Adaugă Rezidenți</h4>
                    <p className="text-sm text-gray-600">Generează documente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard cu cămine
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar company={company} userEmail={user?.email} />
      
      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {company?.name}
              </h1>
              <p className="text-gray-600 mt-1">{camine.length} cămin(e) configurate</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Acasă</span>
              </Link>
              <Link
                href="/camine/add"
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Adaugă Cămin
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <User className="w-5 h-5 text-gray-700" />
                  <span className="hidden sm:inline text-gray-700 font-medium">{user?.email}</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm text-gray-500">Conectat ca</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Deconectare
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camine.map((camin) => (
            <div key={camin.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{camin.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{camin.address}</p>
              <div className="flex items-center gap-2">
                <Link
                  href={`/camine/${camin.id}`}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-center font-semibold hover:bg-purple-700 transition"
                >
                  Deschide
                </Link>
                <button
                  onClick={() => handleDeleteCamin(camin.id, camin.name)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  title="Șterge cămin"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
