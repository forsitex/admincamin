'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Users, UserPlus, Trash2, Phone, Mail, Clock, Key, ArrowLeft, RefreshCw, Smartphone } from 'lucide-react';
import Link from 'next/link';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  shift: 'morning' | 'afternoon' | 'night';
  pin: string;
  deviceId?: string;
  active: boolean;
  createdAt: Date;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      await loadEmployees(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadEmployees = async (userId: string) => {
    try {
      const employeesRef = collection(db, 'organizations', userId, 'employees');
      const snapshot = await getDocs(employeesRef);
      
      const loadedEmployees: Employee[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Employee));

      setEmployees(loadedEmployees.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleDelete = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Sigur vrei să ștergi angajatul "${employeeName}"?`)) {
      return;
    }

    try {
      if (!auth.currentUser) return;

      await deleteDoc(doc(db, 'organizations', auth.currentUser.uid, 'employees', employeeId));
      setEmployees(employees.filter(e => e.id !== employeeId));
      
      alert('✅ Angajat șters cu succes!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Eroare la ștergerea angajatului.');
    }
  };

  const handleResetDevice = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Resetezi device-ul pentru "${employeeName}"?\n\nAngajatul va putea ponta de pe un telefon nou la următoarea pontare.`)) {
      return;
    }

    try {
      if (!auth.currentUser) return;

      const response = await fetch('/api/reset-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: auth.currentUser.uid,
          employeeId: employeeId,
          resetAll: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        await loadEmployees(auth.currentUser.uid);
      } else {
        alert('Eroare: ' + data.error);
      }
    } catch (error) {
      console.error('Error resetting device:', error);
      alert('Eroare la resetarea device-ului.');
    }
  };

  const handleResetAllDevices = async () => {
    if (!confirm('⚠️ ATENȚIE!\n\nResetezi device-ul pentru TOȚI angajații?\n\nFiecare angajat va putea ponta de pe un telefon nou la următoarea pontare.')) {
      return;
    }

    try {
      if (!auth.currentUser) return;

      const response = await fetch('/api/reset-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: auth.currentUser.uid,
          resetAll: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        await loadEmployees(auth.currentUser.uid);
      } else {
        alert('Eroare: ' + data.error);
      }
    } catch (error) {
      console.error('Error resetting all devices:', error);
      alert('Eroare la resetarea device-urilor.');
    }
  };

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case 'morning': return 'Dimineață (06:00-14:00)';
      case 'afternoon': return 'După-amiază (14:00-22:00)';
      case 'night': return 'Noapte (22:00-06:00)';
      default: return shift;
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning': return 'bg-yellow-100 text-yellow-700';
      case 'afternoon': return 'bg-orange-100 text-orange-700';
      case 'night': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă angajații...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              Angajați ({employees.length})
            </h1>
            <p className="text-gray-600 mt-2">
              Gestionează angajații și PIN-urile pentru pontaj
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetAllDevices}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Reset Toate Device-urile
            </button>
            <Link
              href="/employees/add"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Adaugă Angajat
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {employees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Niciun angajat adăugat încă
            </h2>
            <p className="text-gray-600 mb-6">
              Adaugă primul angajat pentru a începe gestionarea pontajelor
            </p>
            <Link
              href="/employees/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Adaugă Primul Angajat
            </Link>
          </div>
        ) : (
          /* Employees Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {employee.name}
                    </h3>
                    <p className="text-purple-600 font-semibold text-sm">
                      {employee.role}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(employee.id, employee.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Șterge angajat"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* PIN */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-purple-900">
                    <Key className="w-4 h-4" />
                    <span className="text-xs font-semibold">PIN Pontaj:</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 mt-1 tracking-wider">
                    {employee.pin}
                  </p>
                </div>

                {/* Tură */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-600">Tură:</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getShiftColor(employee.shift)}`}>
                    {getShiftLabel(employee.shift)}
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{employee.phone}</span>
                  </div>
                  {employee.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                  )}
                </div>

                {/* Device Status */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {employee.deviceId ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Smartphone className="w-4 h-4" />
                        <span>Dispozitiv înregistrat</span>
                      </div>
                      <button
                        onClick={() => handleResetDevice(employee.id, employee.name)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Smartphone className="w-4 h-4" />
                      <span>Nicio pontare încă</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
