'use client';

import { Building2, Home } from 'lucide-react';

interface Step1Props {
  data: {
    companyCui: string;
    caminId: string;
  };
  onChange: (field: string, value: string) => void;
  company: any;
  camine: any[];
}

export default function Step1CompanyCamin({ data, onChange, company, camine }: Step1Props) {


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pas 1: Selectează Căminul
        </h2>
        <p className="text-gray-600">
          Alege căminul în care va fi cazat rezidentul.
        </p>
      </div>

      {/* Info Firmă */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Firma Ta</h3>
        </div>
        <p className="text-xl font-bold text-purple-600">{company?.name}</p>
        <p className="text-sm text-gray-600 mt-1">Email: {company?.email}</p>
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
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          required
        >
          <option value="">-- Selectează Căminul --</option>
          {camine.map((camin) => (
            <option key={camin.id} value={camin.id}>
              {camin.name} - {camin.address}
            </option>
          ))}
        </select>
        {camine.length === 0 && (
          <p className="mt-2 text-sm text-red-500">
            Nu ai niciun cămin configurat. Adaugă un cămin mai întâi!
          </p>
        )}
      </div>

      {/* Info Cămin Selectat */}
      {data.caminId && camine.find(c => c.id === data.caminId) && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Cămin selectat:</strong>{' '}
                {camine.find(c => c.id === data.caminId)?.name}
              </p>
              <p className="text-sm text-green-700 mt-1">
                <strong>Reprezentant:</strong>{' '}
                {camine.find(c => c.id === data.caminId)?.reprezentant?.name || 'Nu este setat'}
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
