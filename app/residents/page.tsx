'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Users, Building, Calendar, Search, FileText, ArrowLeft } from 'lucide-react';

interface ResidentData {
  cnp: string;
  beneficiarNumeComplet: string;
  beneficiarCnp: string;
  caminId: string;
  caminName: string;
  dataInternare: string;
  gradDependenta: string;
  beneficiarVarsta: string;
  apartinatorNumeComplet: string;
  apartinatorTelefon: string;
}

export default function ResidentsPage() {
  const router = useRouter();
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCamin, setFilterCamin] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResidents = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const locationsSnap = await getDocs(collection(db, 'organizations', user.uid, 'locations'));
        const allResidents: ResidentData[] = [];

        for (const locDoc of locationsSnap.docs) {
          const locData = locDoc.data();
          const residentsSnap = await getDocs(
            query(collection(db, 'organizations', user.uid, 'locations', locDoc.id, 'residents'))
          );

          for (const resDoc of residentsSnap.docs) {
            const data = resDoc.data() as any;
            allResidents.push({
              cnp: resDoc.id,
              beneficiarNumeComplet: data.beneficiarNumeComplet || '—',
              beneficiarCnp: data.beneficiarCnp || data.cnp || resDoc.id,
              caminId: locDoc.id,
              caminName: locData.name || locDoc.id,
              dataInternare: data.dataInternare || '',
              gradDependenta: data.gradDependenta || '',
              beneficiarVarsta: data.beneficiarVarsta || '',
              apartinatorNumeComplet: data.apartinatorNumeComplet || '',
              apartinatorTelefon: data.apartinatorTelefon || '',
            });
          }
        }

        setResidents(allResidents);
      } catch (error) {
        console.error('Error fetching residents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, [router]);

  const camine = [...new Set(residents.map(r => r.caminName))].sort();

  const filtered = residents.filter(r => {
    if (filterCamin !== 'all' && r.caminName !== filterCamin) return false;
    if (filterDate && r.dataInternare !== filterDate) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.beneficiarNumeComplet.toLowerCase().includes(term) ||
        r.beneficiarCnp.includes(term) ||
        r.apartinatorNumeComplet.toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-[#1a2b4a]">
        <div className="max-w-none mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard-new')}
                className="flex items-center gap-2 text-white/70 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Rezidenți</h1>
                <p className="text-white/40 text-xs">{residents.length} rezidenți total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-none mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Caută după nume, CNP, aparținător..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
              />
            </div>

            {/* Filter Cămin */}
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterCamin}
                onChange={(e) => setFilterCamin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm appearance-none bg-white"
              >
                <option value="all">Toate locațiile</option>
                {camine.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Filter Data Internare */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="Filtru dată internare (ex: 2024)"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-500">
          {filtered.length} rezidenți afișați
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Niciun rezident găsit</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a2b4a]/5 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">Nume</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">CNP</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">Locație</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">Dată Internare</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">Grad</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">Aparținător</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-[#1a2b4a] uppercase tracking-wider">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((resident) => (
                    <tr key={`${resident.cnp}-${resident.caminId}`} className="hover:bg-[#f5f5f0] transition">
                      <td className="px-4 py-3">
                        <Link
                          href={`/residents/${resident.beneficiarCnp || resident.cnp}`}
                          className="font-medium text-[#1a2b4a] hover:text-[#c9a96e] transition"
                        >
                          {resident.beneficiarNumeComplet}
                        </Link>
                        {resident.beneficiarVarsta && (
                          <p className="text-xs text-gray-400">{resident.beneficiarVarsta} ani</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{resident.beneficiarCnp}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[#1a2b4a]/5 text-[#1a2b4a] text-xs font-medium rounded">
                          {resident.caminName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{resident.dataInternare || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{resident.gradDependenta || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {resident.apartinatorNumeComplet ? (
                          <div>
                            <p>{resident.apartinatorNumeComplet}</p>
                            {resident.apartinatorTelefon && (
                              <p className="text-xs text-gray-400">{resident.apartinatorTelefon}</p>
                            )}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/residents/${resident.beneficiarCnp || resident.cnp}`}
                            className="px-3 py-1.5 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition text-xs"
                          >
                            Detalii
                          </Link>
                          <Link
                            href={`/residents/${resident.beneficiarCnp || resident.cnp}/generate-documents`}
                            className="px-3 py-1.5 bg-[#c9a96e]/10 text-[#c9a96e] rounded-lg font-medium hover:bg-[#c9a96e]/20 transition text-xs flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Doc
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
