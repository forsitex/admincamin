'use client';

import { DollarSign, Calendar, FileText, Info } from 'lucide-react';

interface Step4Props {
  data: {
    costServiciu: string;
    contributieBeneficiar: string;
    dataInceputContract: string;
    dataSfarsitContract: string;
    durataNedeterminata: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
}

export default function Step4Contract({ data, onChange }: Step4Props) {
  // Calculează diferența (dacă există contribuție)
  const cost = parseFloat(data.costServiciu) || 0;
  const contributie = parseFloat(data.contributieBeneficiar) || 0;
  const diferenta = cost - contributie;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pas 4: Date Contract și Financiare
        </h2>
        <p className="text-gray-600">
          Stabilește costurile și durata contractului de servicii sociale.
        </p>
      </div>

      {/* INFORMAȚII FINANCIARE */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          Informații Financiare
        </h3>

        {/* Cost Serviciu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Serviciu (RON/lună) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.costServiciu}
              onChange={(e) => onChange('costServiciu', e.target.value)}
              placeholder="3500.00"
              className="w-full px-4 py-3 pr-16 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              RON
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Costul total al serviciilor sociale pe lună</p>
        </div>

        {/* Contribuție Beneficiar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contribuție Beneficiar (RON/lună)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max={data.costServiciu}
              value={data.contributieBeneficiar}
              onChange={(e) => onChange('contributieBeneficiar', e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 pr-16 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              RON
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Suma plătită de beneficiar (opțional)</p>
        </div>

        {/* Rezumat Financiar */}
        {cost > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Cost total:</span>
                  <span className="text-blue-900 font-bold">{cost.toFixed(2)} RON/lună</span>
                </div>
                {contributie > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-blue-700 font-medium">Contribuție beneficiar:</span>
                      <span className="text-blue-900 font-bold">{contributie.toFixed(2)} RON/lună</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-blue-700 font-medium">Diferență (suportată de stat/familie):</span>
                      <span className="text-blue-900 font-bold">{diferenta.toFixed(2)} RON/lună</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DURATĂ CONTRACT */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Durată Contract
        </h3>

        {/* Checkbox Durată Nedeterminată */}
        <div className="flex items-start gap-3 p-4 bg-white border-2 border-gray-300 rounded-lg">
          <input
            type="checkbox"
            id="durataNedeterminata"
            checked={data.durataNedeterminata}
            onChange={(e) => {
              onChange('durataNedeterminata', e.target.checked);
              if (e.target.checked) {
                onChange('dataSfarsitContract', '');
              }
            }}
            className="w-5 h-5 mt-0.5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
          />
          <label htmlFor="durataNedeterminata" className="cursor-pointer">
            <span className="block font-medium text-gray-900">Durată nedeterminată</span>
            <span className="block text-sm text-gray-600 mt-1">
              Contractul nu are o dată de sfârșit stabilită (recomandat pentru servicii rezidențiale)
            </span>
          </label>
        </div>

        {/* Data Început */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Început Contract <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.dataInceputContract}
            onChange={(e) => onChange('dataInceputContract', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            required
          />
        </div>

        {/* Data Sfârșit (doar dacă nu e nedeterminată) */}
        {!data.durataNedeterminata && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Sfârșit Contract <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.dataSfarsitContract}
              onChange={(e) => onChange('dataSfarsitContract', e.target.value)}
              min={data.dataInceputContract}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              required={!data.durataNedeterminata}
            />
            <p className="mt-1 text-xs text-gray-500">
              Trebuie să fie după data de început
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">Informație importantă:</p>
              <p>
                Pentru contracte pe durată nedeterminată, data de sfârșit nu este necesară. 
                Contractul poate fi reziliat conform clauzelor stabilite în documentele generate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Fields Note */}
      <p className="text-sm text-gray-500 italic">
        * Câmpuri obligatorii
      </p>
    </div>
  );
}
