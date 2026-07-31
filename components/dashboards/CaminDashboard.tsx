'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building, Users, TrendingUp, Activity, Trash2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const EMPATHY_LOCATION_IDS = ['cetinei', 'orhideelor', 'fortunei', 'clinceni'];

interface CaminDashboardProps {
  locations: any[];
  onDelete?: (id: string, name: string) => void;
}

export default function CaminDashboard({ locations, onDelete }: CaminDashboardProps) {
  const totalLocations = locations.length;
  const totalCapacity = locations.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
  const [residentCounts, setResidentCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    const fetchResidentCounts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const counts: Record<string, number> = {};
        for (const loc of locations) {
          const residentsRef = collection(db, 'organizations', user.uid, 'locations', loc.id, 'residents');
          const snap = await getDocs(residentsRef);
          counts[loc.id] = snap.size;
        }
        setResidentCounts(counts);
      } catch (error) {
        console.error('Error fetching resident counts:', error);
      } finally {
        setLoadingCounts(false);
      }
    };

    if (locations.length > 0) {
      fetchResidentCounts();
    }
  }, [locations]);

  const totalResidents = Object.values(residentCounts).reduce((sum, n) => sum + n, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalResidents / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex justify-center mb-2">
        <Image
          src="/caminempathy-logo.png"
          alt="Cămin Empathy"
          width={180}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      {/* Statistici */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Locații</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1a2b4a] mt-2">{totalLocations}</p>
            </div>
            <div className="w-11 h-11 bg-[#1a2b4a]/5 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-[#1a2b4a]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Capacitate</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1a2b4a] mt-2">{totalCapacity}</p>
            </div>
            <div className="w-11 h-11 bg-[#1a2b4a]/5 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#1a2b4a]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rezidenți</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1a2b4a] mt-2">
                {loadingCounts ? '...' : totalResidents}
              </p>
            </div>
            <div className="w-11 h-11 bg-[#c9a96e]/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#c9a96e]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Ocupare</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1a2b4a] mt-2">
                {loadingCounts ? '...' : `${occupancyRate}%`}
              </p>
            </div>
            <div className="w-11 h-11 bg-[#c9a96e]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#c9a96e]" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista Locații */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#1a2b4a]">Locațiile Empathy</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {locations.map((location, index) => {
            const isEmpathyLocation = EMPATHY_LOCATION_IDS.includes(location.id);
            const locCount = residentCounts[location.id] || 0;
            return (
              <div
                key={`location-${location.id}-${index}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-[#c9a96e]/40 group relative"
              >
                {!isEmpathyLocation && onDelete && (
                  <button
                    onClick={() => onDelete(location.id, location.name)}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition z-10"
                    title="Șterge locația"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <Link
                  href={`/camine/${location.id}`}
                  className="block cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center group-hover:bg-[#1a2b4a]/10 transition overflow-hidden">
                      <Image
                        src="/caminempathy-logo.png"
                        alt="Empathy"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <span className="px-2.5 py-1 bg-[#c9a96e]/10 text-[#c9a96e] text-xs font-semibold rounded-full uppercase tracking-wider">
                      Activ
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1a2b4a] mb-1">{location.name}</h3>
                  <p className="text-gray-500 text-sm mb-1">{location.address}</p>
                  <div className="flex items-center gap-3 text-xs mb-5">
                    <span className="text-gray-400">Capacitate: {location.capacity || 0}</span>
                    <span className="text-[#c9a96e] font-medium">{locCount} rezidenți</span>
                  </div>

                  <div className="px-4 py-2 bg-[#1a2b4a] text-white rounded-lg text-center text-sm font-medium group-hover:bg-[#243759] transition">
                    Vezi detalii
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
