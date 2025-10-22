'use client';

import { useState, useEffect } from 'react';
import { COMPANIES, CAMINE, getCamineForCompany } from '@/lib/constants';
import { Building2, Home } from 'lucide-react';

interface Step1Props {
  data: {
    companyCui: string;
    caminId: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function Step1CompanyCamin({ data, onChange }: Step1Props) {
  const [availableCamine, setAvailableCamine] = useState(CAMINE);

  // Când se schimbă firma, actualizează căminele disponibile
  useEffect(() => {
    if (data.companyCui) {
      const camine = getCamineForCompany(data.companyCui);
      setAvailableCamine(camine);
      
      // Dacă căminul selectat nu aparține firmei noi, resetează-l
      const selectedCaminBelongsToCompany = camine.some(c => c.id === data.caminId);
      if (!selectedCaminBelongsToCompany) {
        onChange('caminId', '');
      }
    } else {
      setAvailableCamine(CAMINE);
    }
  }, [data.companyCui]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pas 1: Selectează Firma și Căminul
        </h2>
        <p className="text-gray-600">
          Alege firma care gestionează căminul și căminul în care va fi cazat rezidentul.
        </p>
      </div>

      {/* Selectare Firmă */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building2 className="inline w-4 h-4 mr-2" />
          Selectează Firma <span className="text-red-500">*</span>
        </label>
        <select
          value={data.companyCui}
          onChange={(e) => onChange('companyCui', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          required
        >
          <option value="">-- Selectează Firma --</option>
          {COMPANIES.map((company) => (
            <option key={company.cui} value={company.cui}>
              {company.name} (CUI: {company.cui})
            </option>
          ))}
        </select>
      </div>

      {/* Selectare Cămin */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Home className="inline w-4 h-4 mr-2" />
          Selectează Căminul <span className="text-red-500">*</span>
        </label>
        <select
          value={data.caminId}
          onChange={(e) => onChange('caminId', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
          disabled={!data.companyCui}
        >
          <option value="">-- Selectează Căminul --</option>
          {availableCamine.map((camin) => (
            <option key={camin.id} value={camin.id}>
              {camin.name}
            </option>
          ))}
        </select>
        {!data.companyCui && (
          <p className="mt-2 text-sm text-gray-500">
            Selectează mai întâi o firmă pentru a vedea căminele disponibile
          </p>
        )}
      </div>

      {/* Info Box */}
      {data.companyCui && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Administrator:</strong>{' '}
                {COMPANIES.find(c => c.cui === data.companyCui)?.representative}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Cămine disponibile:</strong>{' '}
                {availableCamine.length === 1 
                  ? `${availableCamine[0].name} (doar Fortunei pentru EMPATHY)`
                  : `${availableCamine.length} cămine (Cetinei, Clinceni, Orhideelor pentru MOBIVIRO)`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Required Fields Note */}
      <p className="text-sm text-gray-500 italic">
        * Câmpuri obligatorii
      </p>
    </div>
  );
}
