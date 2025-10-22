'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { 
  Building2, 
  Baby, 
  Heart, 
  Hotel,
  Check,
  Sparkles
} from 'lucide-react';

type OrganizationType = 'camin' | 'gradinita' | 'spital' | 'hotel';

interface BusinessType {
  id: OrganizationType;
  title: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  description: string;
  features: string[];
}

const businessTypes: BusinessType[] = [
  {
    id: 'camin',
    title: 'Cămin Bătrâni',
    icon: Building2,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    description: 'Gestionează rezidenți, meniu zilnic, medicamente și rapoarte medicale cu AI',
    features: [
      'Rezidenți',
      'Meniu AI',
      'Medicamente',
      'Rapoarte',
      'Documente',
      'Galerie Foto',
      'Analiză AI',
      'Asistent AI'
    ]
  },
  {
    id: 'gradinita',
    title: 'Grădiniță',
    icon: Baby,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    description: 'Administrează copii, activități, meniu și galerie foto cu asistent AI',
    features: [
      'Copii',
      'Activități',
      'Meniu AI',
      'Galerie Foto',
      'Părinți',
      'Prezență',
      'Analiză AI',
      'Asistent AI'
    ]
  },
  {
    id: 'spital',
    title: 'Spital / Clinică',
    icon: Heart,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    description: 'Gestionează pacienți, tratamente, analize și diagnostic AI',
    features: [
      'Pacienți',
      'Analize',
      'Tratamente',
      'Programări',
      'Diagnostic AI',
      'Rețete',
      'Analiză AI',
      'Asistent AI'
    ]
  },
  {
    id: 'hotel',
    title: 'Hotel / Pensiune',
    icon: Hotel,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    description: 'Administrează rezervări, camere, servicii și recomandări AI',
    features: [
      'Rezervări',
      'Camere',
      'Check-in/out',
      'Servicii',
      'Recomandări AI',
      'Recenzii',
      'Analiză AI',
      'Asistent AI'
    ]
  }
];

export default function SelectTypePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<OrganizationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/register');
      return;
    }

    // Extrage numele firmei din displayName sau email
    const name = user.displayName || user.email?.split('@')[0] || 'Firma';
    setUserName(name);
  }, [router]);

  const handleSelectType = async (type: OrganizationType) => {
    setSelectedType(type);
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Nu ești autentificat');
      }

      // Salvează tipul organizației în Firestore
      const organizationRef = doc(db, 'organizations', user.uid);
      await setDoc(organizationRef, {
        name: user.displayName || user.email?.split('@')[0] || 'Firma',
        email: user.email,
        type: type,
        createdAt: Timestamp.now(),
        settings: {
          aiEnabled: false,
          subscription: 'standard',
          features: []
        }
      });

      console.log('✅ Organization type saved:', type);

      // Redirect la dashboard
      setTimeout(() => {
        router.push('/dashboard-new');
      }, 500);
    } catch (error) {
      console.error('❌ Error saving organization type:', error);
      alert('Eroare la salvarea tipului de organizație');
      setLoading(false);
      setSelectedType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Bine ai venit, {userName}! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Ce tip de serviciu administrezi?
          </p>
        </div>

        {/* Grid cu 4 opțiuni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businessTypes.map((business) => {
            const Icon = business.icon;
            const isSelected = selectedType === business.id;
            
            return (
              <button
                key={business.id}
                onClick={() => handleSelectType(business.id)}
                disabled={loading}
                className={`
                  relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl 
                  transition-all duration-300 text-left
                  ${isSelected ? 'ring-4 ring-purple-500 scale-105' : 'hover:scale-102'}
                  ${loading && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Badge AI Powered */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                    <Sparkles className="w-3 h-3" />
                    AI Powered
                  </span>
                </div>

                {/* Icon */}
                <div className={`${business.iconBg} ${business.iconColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {business.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {business.description}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {business.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Loading state */}
                {loading && isSelected && (
                  <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-gray-700">Se configurează...</p>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Poți schimba tipul de serviciu mai târziu din setări
          </p>
        </div>
      </div>
    </div>
  );
}
