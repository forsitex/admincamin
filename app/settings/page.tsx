'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User, Mail, Building } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [adminName, setAdminName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      try {
        const orgRef = doc(db, 'organizations', currentUser.uid);
        const orgSnap = await getDoc(orgRef);

        if (orgSnap.exists()) {
          const data = orgSnap.data();
          setCompany(data);
          setAdminName(data.adminName || '');
          setCompanyName(data.name || '');
          setCompanyEmail(data.email || '');
          setCompanyPhone(data.phone || '');
          setCompanyAddress(data.address || '');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const orgRef = doc(db, 'organizations', user.uid);
      await updateDoc(orgRef, {
        adminName,
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Eroare la salvare. Încearcă din nou.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      <Sidebar company={company} userEmail={user?.email} organizationType="camin" />

      <div className="flex-1 bg-[#f5f5f0]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-none mx-auto px-4 sm:px-6 py-5 pl-14 md:pl-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard-new')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a2b4a]">Setări</h1>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Se salvează...</>
                ) : (
                  <><Save className="w-4 h-4" /> Salvează</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {saved && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
              ✅ Setările au fost salvate cu succes!
            </div>
          )}

          {/* Administrator */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1a2b4a]/5 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-[#1a2b4a]" />
              </div>
              <h2 className="text-lg font-bold text-[#1a2b4a]">Administrator</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Administrator
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                  placeholder="ex: andapanda"
                />
                <p className="text-xs text-gray-400 mt-1">Apare în sidebar și în dashboard</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Email-ul nu poate fi modificat</p>
              </div>
            </div>
          </div>

          {/* Informații Firmă */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1a2b4a]/5 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-[#1a2b4a]" />
              </div>
              <h2 className="text-lg font-bold text-[#1a2b4a]">Informații Firmă</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Firmă
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                  placeholder="07xx xxx xxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresă
                </label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                  placeholder="Str. Exemplu nr. 1, Oraș, Județ"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
