import Link from 'next/link';
import { Building, Heart, Stethoscope, Calendar, TestTube, Plus, TrendingUp, Activity } from 'lucide-react';

interface SpitalDashboardProps {
  locations: any[];
  onDelete: (id: string, name: string) => void;
}

export default function SpitalDashboard({ locations, onDelete }: SpitalDashboardProps) {
  const totalLocations = locations.length;
  const totalCapacity = locations.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
  
  return (
    <div className="space-y-6">
      {/* Statistici Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Clinici</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalLocations}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Capacitate Totală</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCapacity}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pacienți Activi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-xs text-gray-500 mt-1">Soon</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Programări Azi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              <p className="text-xs text-gray-500 mt-1">Soon</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Acțiuni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/patients/add"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <Heart className="w-6 h-6" />
            <span className="font-semibold">Adaugă Pacient</span>
          </Link>
          <Link
            href="/appointments"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <Calendar className="w-6 h-6" />
            <span className="font-semibold">Programări</span>
          </Link>
          <Link
            href="/treatments"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <Stethoscope className="w-6 h-6" />
            <span className="font-semibold">Tratamente</span>
          </Link>
          <Link
            href="/tests"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <TestTube className="w-6 h-6" />
            <span className="font-semibold">Analize</span>
          </Link>
        </div>
      </div>

      {/* Lista Clinici */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Clinicile Tale</h2>
          <Link
            href="/clinici/add"
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Adaugă Clinică
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <div 
              key={`location-${location.id}-${index}`} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-red-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Activ
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{location.name}</h3>
              <p className="text-gray-600 text-sm mb-1">{location.address}</p>
              <div className="space-y-1 mb-4">
                <p className="text-gray-500 text-xs">🛏️ Paturi: {location.capacity || 0}</p>
                {location.programConsultatii && (
                  <p className="text-gray-500 text-xs">🕐 Program: {location.programConsultatii}</p>
                )}
                {location.specialitati && location.specialitati.length > 0 && (
                  <p className="text-gray-500 text-xs">⚕️ Specialități: {location.specialitati.join(', ')}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Link
                  href={`/camine/${location.id}`}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-center font-semibold hover:bg-red-700 transition"
                >
                  Vezi detalii
                </Link>
                <button
                  onClick={() => onDelete(location.id, location.name)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                  title="Șterge clinică"
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
