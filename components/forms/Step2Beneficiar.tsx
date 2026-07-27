'use client';

import { useState, useEffect } from 'react';
import { User, CreditCard, Calendar, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { validateCNP, extractBirthDateFromCNP } from '@/lib/cnp-validator';

interface Step2Props {
  data: {
    beneficiarNumeComplet: string;
    beneficiarCnp: string;
    beneficiarDataNasterii: string;
    beneficiarAdresa: string;
    beneficiarCodPostal: string;
    beneficiarCiSerie: string;
    beneficiarCiNumar: string;
    beneficiarCiEliberatData: string;
    beneficiarCiEliberatDe: string;
    beneficiarCiValabilPana: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function Step2Beneficiar({ data, onChange }: Step2Props) {
  const [cnpValid, setCnpValid] = useState<boolean | null>(null);
  const [cnpError, setCnpError] = useState<string>('');

  // Validare CNP și extragere dată naștere
  useEffect(() => {
    if (data.beneficiarCnp.length === 13) {
      const isValid = validateCNP(data.beneficiarCnp);
      setCnpValid(isValid);
      
      if (isValid) {
        const birthDate = extractBirthDateFromCNP(data.beneficiarCnp);
        if (birthDate) {
          onChange('beneficiarDataNasterii', birthDate);
          setCnpError('');
        }
      } else {
        setCnpError('CNP invalid. Verifică cifrele introduse.');
        onChange('beneficiarDataNasterii', '');
      }
    } else if (data.beneficiarCnp.length > 0) {
      setCnpValid(null);
      setCnpError('CNP-ul trebuie să aibă 13 cifre');
    } else {
      setCnpValid(null);
      setCnpError('');
      onChange('beneficiarDataNasterii', '');
    }
  }, [data.beneficiarCnp]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pas 2: Date Beneficiar
        </h2>
        <p className="text-gray-600">
          Completează datele personale și actul de identitate al beneficiarului.
        </p>
      </div>

      {/* DATE PERSONALE */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Date Personale
        </h3>

        {/* Nume Complet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nume Complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.beneficiarNumeComplet}
            onChange={(e) => onChange('beneficiarNumeComplet', e.target.value.toUpperCase())}
            placeholder="ex: POPESCU ION GHEORGHE"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition uppercase"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Nume și prenume complet, cu majuscule</p>
        </div>

        {/* CNP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNP <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.beneficiarCnp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                onChange('beneficiarCnp', value);
              }}
              placeholder="1234567890123"
              maxLength={13}
              className={`w-full px-4 py-3 pr-12 border-2 rounded-lg transition ${
                cnpValid === true
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                  : cnpValid === false
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
              } focus:ring-2`}
              required
            />
            {cnpValid === true && (
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {cnpValid === false && (
              <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          {cnpError && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {cnpError}
            </p>
          )}
          {cnpValid && (
            <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              CNP valid! Data nașterii a fost extrasă automat.
            </p>
          )}
        </div>

        {/* Data Nașterii (auto-completată) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Data Nașterii <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.beneficiarDataNasterii}
            readOnly
            placeholder="Auto-completat din CNP"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">Se completează automat din CNP</p>
        </div>

        {/* Adresă */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Adresă Completă <span className="text-red-500">*</span>
          </label>
          <textarea
            value={data.beneficiarAdresa}
            onChange={(e) => onChange('beneficiarAdresa', e.target.value)}
            placeholder="Str., Nr., Bl., Sc., Et., Ap., Sector, Oraș, Județ"
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
            required
          />
        </div>

        {/* Cod Poștal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cod Poștal
          </label>
          <input
            type="text"
            value={data.beneficiarCodPostal}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              onChange('beneficiarCodPostal', value);
            }}
            placeholder="064981"
            maxLength={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          />
        </div>
      </div>

      {/* ACT IDENTITATE */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-600" />
          Act Identitate
        </h3>

        {/* Serie și Număr CI */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CI Serie
            </label>
            <input
              type="text"
              value={data.beneficiarCiSerie}
              onChange={(e) => onChange('beneficiarCiSerie', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="RC"
              maxLength={2}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CI Număr
            </label>
            <input
              type="text"
              value={data.beneficiarCiNumar}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                onChange('beneficiarCiNumar', value);
              }}
              placeholder="549011"
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
        </div>

        {/* Eliberat la data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eliberat la data
          </label>
          <input
            type="date"
            value={data.beneficiarCiEliberatData}
            onChange={(e) => onChange('beneficiarCiEliberatData', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          />
        </div>

        {/* Eliberat de */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eliberat de
          </label>
          <input
            type="text"
            value={data.beneficiarCiEliberatDe}
            onChange={(e) => onChange('beneficiarCiEliberatDe', e.target.value.toUpperCase())}
            placeholder="SCGTP"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition uppercase"
          />
          <p className="mt-1 text-xs text-gray-500">ex: SCGTP, SCHPF, SPCLEP</p>
        </div>

        {/* Valabil până la */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valabil până la
          </label>
          <input
            type="date"
            value={data.beneficiarCiValabilPana}
            onChange={(e) => onChange('beneficiarCiValabilPana', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          />
        </div>
      </div>

      {/* Required Fields Note */}
      <p className="text-sm text-gray-500 italic">
        * Câmpuri obligatorii
      </p>
    </div>
  );
}
