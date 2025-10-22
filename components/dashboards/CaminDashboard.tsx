import Link from 'next/link';
import { Building, Users, Utensils, Pill, FileText, Plus, TrendingUp, Activity } from 'lucide-react';

interface CaminDashboardProps {
  locations: any[];
  onDelete: (id: string, name: string) => void;
}

export default function CaminDashboard({ locations, onDelete }: CaminDashboardProps) {
  // Calculează statistici
  const totalLocations = locations.length;
  const totalCapacity = locations.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
  
  return (
    <div className="space-y-6">
      {/* Statistici Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Cămine</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalLocations}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Capacitate Totală</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCapacity}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Rezidenți Activi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-xs text-gray-500 mt-1">Soon</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Ocupare</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0%</p>
              <p className="text-xs text-gray-500 mt-1">Soon</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Acțiuni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/residents/add"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <Users className="w-6 h-6" />
            <span className="font-semibold">Adaugă Rezident</span>
          </Link>
          <Link
            href="/menu-ai"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <Utensils className="w-6 h-6" />
            <span className="font-semibold">Meniu AI</span>
          </Link>
          <Link
            href="/medications"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <Pill className="w-6 h-6" />
            <span className="font-semibold">Medicamente</span>
          </Link>
          <Link
            href="/reports"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <FileText className="w-6 h-6" />
            <span className="font-semibold">Rapoarte</span>
          </Link>
        </div>
      </div>

      {/* Lista Cămine */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Căminele Tale</h2>
          <Link
            href="/camine/add"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Adaugă Cămin
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <div 
              key={`location-${location.id}-${index}`} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Activ
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{location.name}</h3>
              <p className="text-gray-600 text-sm mb-1">{location.address}</p>
              <p className="text-gray-500 text-xs mb-4">Capacitate: {location.capacity || 0} locuri</p>
              
              <div className="flex items-center gap-2">
                <Link
                  href={`/camine/${location.id}`}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-center font-semibold hover:bg-purple-700 transition"
                >
                  Vezi detalii
                </Link>
                <button
                  onClick={() => onDelete(location.id, location.name)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  title="Șterge cămin"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
