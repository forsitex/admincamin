'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Filter, FileText, Trash2, Edit, Home } from 'lucide-react';
import { getResidentsByCamin } from '@/lib/firestore';
import { Resident } from '@/types/resident';
import { CAMINE, COMPANIES } from '@/lib/constants';

export default function DashboardPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamin, setSelectedCamin] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadResidents();
  }, [selectedCamin]);

  const loadResidents = async () => {
    setLoading(true);
    try {
      if (selectedCamin === 'all') {
        // Încarcă din toate căminele
        const allResidents: Resident[] = [];
        for (const camin of CAMINE) {
          const caminResidents = await getResidentsByCamin(camin.id);
          allResidents.push(...caminResidents);
        }
        setResidents(allResidents);
      } else {
        // Încarcă doar din căminul selectat
        const caminResidents = await getResidentsByCamin(selectedCamin);
        setResidents(caminResidents);
      }
    } catch (error) {
      console.error('Error loading residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(resident =>
    resident.beneficiarNumeComplet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.beneficiarCnp?.includes(searchQuery)
  );

  const getCompanyForResident = (resident: Resident) => {
    return COMPANIES.find(c => c.cui === resident.companyCui);
  };

  const getCaminForResident = (resident: Resident) => {
    return CAMINE.find(c => c.id === resident.caminId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Gestionează rezidenții din cămine</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                <Home className="w-5 h-5" />
                Pagina Principală
              </Link>
              <Link
                href="/residents/add"
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Adaugă Rezident
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rezidenți</p>
                <p className="text-3xl font-bold text-gray-900">{residents.length}</p>
              </div>
              <Users className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          {CAMINE.slice(0, 3).map(camin => {
            const count = residents.filter(r => r.caminId === camin.id).length;
            return (
              <div key={camin.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{camin.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{count}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută după nume sau CNP..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              />
            </div>

            {/* Filter by Cămin */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCamin}
                onChange={(e) => setSelectedCamin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition appearance-none"
              >
                <option value="all">Toate Căminele</option>
                {CAMINE.map(camin => (
                  <option key={camin.id} value={camin.id}>
                    {camin.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Residents Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Se încarcă rezidenții...</p>
            </div>
          ) : filteredResidents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">Niciun rezident găsit</p>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 'Încearcă alt termen de căutare' : 'Adaugă primul rezident pentru a începe'}
              </p>
              {!searchQuery && (
                <Link
                  href="/residents/add"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Adaugă Rezident
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nume Complet</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">CNP</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cămin</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Firmă</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aparținător</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredResidents.map((resident) => {
                    const company = getCompanyForResident(resident);
                    const camin = getCaminForResident(resident);
                    
                    return (
                      <tr key={resident.beneficiarCnp} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{resident.beneficiarNumeComplet}</p>
                            <p className="text-sm text-gray-600">
                              Dosar: {resident.numarDosar} • Contract: {resident.numarContract}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{resident.beneficiarCnp}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {camin?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{company?.name}</p>
                            <p className="text-xs text-gray-600">{company?.representative}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900">{resident.apartinatorNumeComplet}</p>
                            <p className="text-xs text-gray-600">{resident.apartinatorTelefon}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert('Funcționalitate în dezvoltare')}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Generează documente"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => alert('Funcționalitate în dezvoltare')}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editează"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Sigur vrei să ștergi acest rezident?')) {
                                  alert('Funcționalitate în dezvoltare');
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Șterge"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
