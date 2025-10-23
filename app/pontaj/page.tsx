'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { Clock, LogIn, LogOut, Loader2, AlertCircle, CheckCircle, Building } from 'lucide-react';

function PontajContent() {
  const searchParams = useSearchParams();
  const locationId = searchParams?.get('location') || null;
  
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [lastPontaj, setLastPontaj] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);

  // Încarcă informații despre locație
  useEffect(() => {
    const loadLocation = async () => {
      if (!locationId) return;

      try {
        // Caută locația în toate organizațiile
        const organizationsSnapshot = await getDocs(collection(db, 'organizations'));
        
        for (const orgDoc of organizationsSnapshot.docs) {
          const locationRef = doc(db, 'organizations', orgDoc.id, 'locations', locationId);
          const locationSnap = await getDoc(locationRef);

          if (locationSnap.exists()) {
            setLocation({
              id: locationSnap.id,
              ...locationSnap.data()
            });
            break;
          }
        }
      } catch (error) {
        console.error('Error loading location:', error);
      }
    };

    loadLocation();
  }, [locationId]);

  // Generează Device ID unic
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const handlePontaj = async (type: 'check-in' | 'check-out') => {
    if (pin.length !== 4) {
      setMessage({ type: 'error', text: 'PIN-ul trebuie să aibă 4 cifre!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const deviceId = getDeviceId();

      // Trimite request către API
      const response = await fetch('/api/pontaj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pin: pin,
          deviceId: deviceId,
          type: type,
          locationId: locationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Eroare la pontaj' });
        setPin('');
        setLoading(false);
        return;
      }

      // Success!
      setMessage({ 
        type: 'success', 
        text: data.message
      });
      
      setLastPontaj({
        name: data.employee.name,
        role: data.employee.role,
        type: type,
        time: data.time
      });

      setPin('');
    } catch (error: any) {
      console.error('Eroare pontaj:', error);
      setMessage({ type: 'error', text: 'Eroare la salvarea pontajului. Te rugăm să încerci din nou.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleClear = () => {
    setPin('');
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Clock className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Pontaj Angajați</h1>
          {location && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-white" />
              <span className="text-white font-semibold">{location.name}</span>
            </div>
          )}
          <p className="text-white/80">Introdu PIN-ul tău pentru pontaj</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* PIN Display */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
              PIN (4 cifre)
            </label>
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="w-14 h-14 border-2 border-purple-300 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-900 bg-purple-50"
                >
                  {pin[index] ? '●' : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinInput(digit.toString())}
                disabled={loading || pin.length >= 4}
                className="h-14 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={loading}
              className="h-14 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-bold text-red-700 transition disabled:opacity-50"
            >
              Șterge
            </button>
            <button
              onClick={() => handlePinInput('0')}
              disabled={loading || pin.length >= 4}
              className="h-14 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-900 transition disabled:opacity-50"
            >
              0
            </button>
            <div></div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handlePontaj('check-in')}
              disabled={loading || pin.length !== 4}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Intră
                </>
              )}
            </button>
            <button
              onClick={() => handlePontaj('check-out')}
              disabled={loading || pin.length !== 4}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Ieși
                </>
              )}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Last Pontaj */}
          {lastPontaj && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-1">Ultimul pontaj:</p>
              <p className="text-xs text-purple-700">
                {lastPontaj.name} ({lastPontaj.role}) - {lastPontaj.type === 'check-in' ? 'Intrat' : 'Ieșit'} la {lastPontaj.time}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            💡 Dacă ai uitat PIN-ul, contactează administratorul
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PontajPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Se încarcă...</p>
        </div>
      </div>
    }>
      <PontajContent />
    </Suspense>
  );
}
