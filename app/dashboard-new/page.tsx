'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building, Plus, Home, User, LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';
import CaminDashboard from '@/components/dashboards/CaminDashboard';

const EMPATHY_LOCATIONS = [
  { id: 'cetinei', name: 'CETINEI', address: 'Str. Cetinei, București', capacity: 100 },
  { id: 'orhideelor', name: 'ORHIDEELOR', address: 'Str. Orhideelor, București', capacity: 100 },
  { id: 'fortunei', name: 'FORTUNEI', address: 'Str. Fortunei, București', capacity: 100 },
  { id: 'clinceni', name: 'CLINCENI', address: 'Str. Clinceni, București', capacity: 100 },
];

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

      // Șterge din organizations/locations
      await deleteDoc(doc(db, 'organizations', user.uid, 'locations', caminId));
      
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

      // Verifică dacă există organizație
      try {
        const organizationRef = doc(db, 'organizations', currentUser.uid);
        const organizationSnap = await getDoc(organizationRef);

        if (organizationSnap.exists()) {
          const orgData = organizationSnap.data();
          setCompany(orgData);

          // Asigură că cele 4 locații Empathy există cu capacitate corectă
          for (const loc of EMPATHY_LOCATIONS) {
            const locRef = doc(db, 'organizations', currentUser.uid, 'locations', loc.id);
            const locSnap = await getDoc(locRef);
            if (!locSnap.exists()) {
              await setDoc(locRef, {
                name: loc.name,
                address: loc.address,
                capacity: loc.capacity,
                createdAt: Timestamp.now(),
              });
            } else {
              // Update capacity dacă e diferit
              const existingData = locSnap.data();
              if (existingData.capacity !== loc.capacity) {
                await updateDoc(locRef, { capacity: loc.capacity });
              }
            }
          }

          // Încarcă căminele
          const locationsRef = collection(db, 'organizations', currentUser.uid, 'locations');
          const locationsSnap = await getDocs(locationsRef);
          const locationsData = locationsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCamine(locationsData);
        } else {
          // Nu există organizație - redirect la înregistrare
          console.log('⚠️ Nicio organizație găsită - redirect la înregistrare');
          router.push('/register');
          return;
        }
      } catch (error) {
        console.error('Error loading organization:', error);
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

  const emptyState = {
    title: 'Adaugă Primul Tău Cămin',
    description: 'Pentru a începe să gestionezi rezidenții, mai întâi trebuie să adaugi un cămin.',
    buttonText: 'Adaugă Cămin',
    buttonLink: '/camine/add',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    step1: 'Adaugă Cămin',
    step1Desc: 'Configurează primul cămin',
    step3: 'Adaugă Rezidenți',
    step3Desc: 'Generează documente'
  };

  // Dashboard gol - fără locații
  if (camine.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-none mx-auto px-4 sm:px-6 py-4">
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
        <div className="max-w-none mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-none mx-auto">
            {/* Empty State Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
              <div className={`w-24 h-24 ${emptyState.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <Building className={`w-12 h-12 ${emptyState.textColor}`} />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {emptyState.title}
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                {emptyState.description}
              </p>

              <Link
                href={emptyState.buttonLink}
                className={`inline-flex items-center gap-3 px-8 py-4 ${emptyState.buttonColor} text-white rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                <Plus className="w-6 h-6" />
                {emptyState.buttonText}
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
                    <h4 className="font-semibold text-gray-900 mb-1">{emptyState.step1}</h4>
                    <p className="text-sm text-gray-600">{emptyState.step1Desc}</p>
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
                    <h4 className="font-semibold text-gray-900 mb-1">{emptyState.step3}</h4>
                    <p className="text-sm text-gray-600">{emptyState.step3Desc}</p>
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
    <div className="flex min-h-screen bg-[#f5f5f0]">
      {/* Sidebar */}
      <Sidebar company={company} userEmail={user?.email} organizationType="camin" />
      
      {/* Main Content */}
      <div className="flex-1 bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-none mx-auto px-4 sm:px-6 py-5 pl-14 md:pl-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a2b4a]">
                {company?.name}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">{camine.length} locații</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/import"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Import Rezidenți</span>
                <span className="sm:hidden">Import</span>
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <User className="w-5 h-5 text-gray-700" />
                  <span className="hidden sm:inline text-gray-700 font-medium text-sm">{user?.email}</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-xs text-gray-500">Conectat ca</p>
                      <p className="text-sm font-semibold text-[#1a2b4a] truncate">{user?.email}</p>
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

      {/* Content - Dashboard Cămin */}
      <div className="max-w-none mx-auto px-4 sm:px-6 py-8">
        <CaminDashboard locations={camine} onDelete={handleDeleteCamin} />
      </div>
      </div>
    </div>
  );
}
