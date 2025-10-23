'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Clock, Users, AlertCircle, Calendar, Download, 
  CheckCircle, XCircle, TrendingUp, Building, Filter, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  type: 'check-in' | 'check-out';
  locationId?: string;
  locationName?: string;
  deviceId?: string;
  timestamp: Date;
  date: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  shift: string;
}

interface SecurityAlert {
  id: string;
  employeeName: string;
  timestamp: Date;
  type: string;
  resolved: boolean;
}

export default function PontajePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'alerts'>('today');
  
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterEmployee, setFilterEmployee] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      await loadData(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadData = async (userId: string) => {
    try {
      // Încarcă angajați
      const employeesRef = collection(db, 'organizations', userId, 'employees');
      const employeesSnap = await getDocs(employeesRef);
      const employeesData = employeesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
      setEmployees(employeesData);

      // Încarcă pontaje
      const attendanceRef = collection(db, 'organizations', userId, 'attendance');
      const attendanceSnap = await getDocs(query(attendanceRef, orderBy('timestamp', 'desc')));
      const attendanceData = attendanceSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      } as Attendance));
      setAttendances(attendanceData);

      // Încarcă alerte
      const alertsRef = collection(db, 'organizations', userId, 'security_alerts');
      const alertsSnap = await getDocs(query(alertsRef, orderBy('timestamp', 'desc')));
      const alertsData = alertsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      } as SecurityAlert));
      setAlerts(alertsData);

      // Încarcă locații
      const locationsRef = collection(db, 'organizations', userId, 'locations');
      const locationsSnap = await getDocs(locationsRef);
      const locationsData = locationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLocations(locationsData);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Filtrare pontaje
  const getFilteredAttendances = () => {
    let filtered = [...attendances];

    // Filtrare perioadă
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterPeriod === 'today') {
      filtered = filtered.filter(a => {
        const attDate = new Date(a.timestamp);
        attDate.setHours(0, 0, 0, 0);
        return attDate.getTime() === today.getTime();
      });
    } else if (filterPeriod === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(a => a.timestamp >= weekAgo);
    } else if (filterPeriod === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(a => a.timestamp >= monthAgo);
    }

    // Filtrare locație
    if (filterLocation !== 'all') {
      filtered = filtered.filter(a => a.locationId === filterLocation);
    }

    // Filtrare angajat
    if (filterEmployee !== 'all') {
      filtered = filtered.filter(a => a.employeeId === filterEmployee);
    }

    return filtered;
  };

  // Angajați prezenți azi
  const getPresentEmployees = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendances = attendances.filter(a => a.date === today);
    
    const present = new Set<string>();
    todayAttendances.forEach(a => {
      if (a.type === 'check-in') {
        present.add(a.employeeId);
      } else if (a.type === 'check-out') {
        present.delete(a.employeeId);
      }
    });

    return employees.filter(e => present.has(e.id));
  };

  // Angajați absenți
  const getAbsentEmployees = () => {
    const presentIds = new Set(getPresentEmployees().map(e => e.id));
    return employees.filter(e => !presentIds.has(e.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă pontajele...</p>
        </div>
      </div>
    );
  }

  const presentEmployees = getPresentEmployees();
  const absentEmployees = getAbsentEmployees();
  const filteredAttendances = getFilteredAttendances();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard-new"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi la Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Clock className="w-10 h-10 text-purple-600" />
            Dashboard Pontaje
          </h1>
          <p className="text-gray-600">
            Monitorizează prezența angajaților și pontajele în timp real
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">La Muncă Acum</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{presentEmployees.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Absențe Azi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{absentEmployees.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Angajați</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Alerte Securitate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{unresolvedAlerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('today')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'today'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Prezență Azi
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'history'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 Istoric Pontaje
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'alerts'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🚨 Alerte ({unresolvedAlerts.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Tab: Prezență Azi */}
            {activeTab === 'today' && (
              <div className="space-y-6">
                {/* La Muncă */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    La Muncă Acum ({presentEmployees.length})
                  </h3>
                  {presentEmployees.length === 0 ? (
                    <p className="text-gray-500 text-sm">Niciun angajat prezent momentan</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {presentEmployees.map(emp => {
                        const checkIn = attendances.find(
                          a => a.employeeId === emp.id && 
                          a.type === 'check-in' && 
                          a.date === new Date().toISOString().split('T')[0]
                        );
                        return (
                          <div key={emp.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-bold text-gray-900">{emp.name}</p>
                                <p className="text-sm text-gray-600">{emp.role}</p>
                              </div>
                              <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                ACTIV
                              </span>
                            </div>
                            {checkIn && (
                              <div className="text-xs text-gray-600 space-y-1">
                                <p>⏰ Check-in: {checkIn.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</p>
                                {checkIn.locationName && (
                                  <p>📍 {checkIn.locationName}</p>
                                )}
                                {checkIn.deviceId && (
                                  <p className="text-xs text-gray-500 font-mono">📱 {checkIn.deviceId.substring(0, 20)}...</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Absențe */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Absențe Azi ({absentEmployees.length})
                  </h3>
                  {absentEmployees.length === 0 ? (
                    <p className="text-gray-500 text-sm">Toți angajații sunt prezenți! 🎉</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {absentEmployees.map(emp => (
                        <div key={emp.id} className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-gray-900">{emp.name}</p>
                              <p className="text-sm text-gray-600">{emp.role}</p>
                            </div>
                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                              ABSENT
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Tură: {emp.shift === 'morning' ? 'Dimineață' : emp.shift === 'afternoon' ? 'După-amiază' : 'Noapte'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Istoric */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-900">Filtre</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Perioadă</label>
                      <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value as any)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 text-gray-900"
                      >
                        <option value="today">Azi</option>
                        <option value="week">Ultima săptămână</option>
                        <option value="month">Ultima lună</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Locație</label>
                      <select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 text-gray-900"
                      >
                        <option value="all">Toate locațiile</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Angajat</label>
                      <select
                        value={filterEmployee}
                        onChange={(e) => setFilterEmployee(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 text-gray-900"
                      >
                        <option value="all">Toți angajații</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pontaje List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Pontaje ({filteredAttendances.length})
                    </h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                      <Download className="w-4 h-4" />
                      Export Excel
                    </button>
                  </div>

                  {filteredAttendances.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nu există pontaje pentru filtrele selectate</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredAttendances.map(att => (
                        <div key={att.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                att.type === 'check-in' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {att.type === 'check-in' ? (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{att.employeeName}</p>
                                <p className="text-sm text-gray-600">{att.employeeRole}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {att.type === 'check-in' ? '🟢 Intrat' : '🔴 Ieșit'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {att.timestamp.toLocaleDateString('ro-RO')} • {att.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {att.locationName && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                                  <Building className="w-3 h-3" />
                                  {att.locationName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Alerte */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Alerte Securitate ({unresolvedAlerts.length} nerezolvate)
                </h3>
                {unresolvedAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-900">Nicio alertă activă!</p>
                    <p className="text-gray-600">Toate pontajele sunt în regulă 🎉</p>
                  </div>
                ) : (
                  unresolvedAlerts.map(alert => (
                    <div key={alert.id} className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">
                            Tentativă de fraudă detectată
                          </p>
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>{alert.employeeName}</strong> a încercat să ponteze cu un dispozitiv neautorizat
                          </p>
                          <p className="text-xs text-gray-600">
                            {alert.timestamp.toLocaleDateString('ro-RO')} • {alert.timestamp.toLocaleTimeString('ro-RO')}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition">
                          Marchează rezolvat
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
