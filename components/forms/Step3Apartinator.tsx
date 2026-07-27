'use client';

import { useState, useEffect } from 'react';
import { Users, CreditCard, Phone, Mail, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { validateCNP } from '@/lib/cnp-validator';
import { RELATII_APARTINATOR } from '@/lib/constants';

interface Step3Props {
  data: {
    apartinatorNumeComplet: string;
    apartinatorCnp: string;
    apartinatorRelatie: string;
    apartinatorTelefon: string;
    apartinatorEmail: string;
    apartinatorAdresa: string;
    apartinatorCiSerie: string;
    apartinatorCiNumar: string;
    apartinatorCiEliberatData: string;
    apartinatorCiEliberatDe: string;
    apartinatorCiValabilPana: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function Step3Apartinator({ data, onChange }: Step3Props) {
  const [cnpValid, setCnpValid] = useState<boolean | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  // Validare CNP
  useEffect(() => {
    if (data.apartinatorCnp.length === 13) {
      setCnpValid(validateCNP(data.apartinatorCnp));
    } else {
      setCnpValid(null);
    }
  }, [data.apartinatorCnp]);

  // Validare Email
  useEffect(() => {
    if (data.apartinatorEmail.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(data.apartinatorEmail));
    } else {
      setEmailValid(null);
    }
  }, [data.apartinatorEmail]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pas 3: Date Aparținător
        </h2>
        <p className="text-gray-600">
          Completează datele persoanei de contact în caz de urgență.
        </p>
      </div>

      {/* DATE PERSONALE APARȚINĂTOR */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Date Personale Aparținător
        </h3>

        {/* Nume Complet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nume Complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.apartinatorNumeComplet}
            onChange={(e) => onChange('apartinatorNumeComplet', e.target.value.toUpperCase())}
            placeholder="ex: POPESCU MARIA"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition uppercase"
            required
          />
        </div>

        {/* CNP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNP <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.apartinatorCnp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                onChange('apartinatorCnp', value);
              }}
              placeholder="2345678901234"
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
          {cnpValid === false && (
            <p className="mt-1 text-sm text-red-600">CNP invalid</p>
          )}
        </div>

        {/* Relație cu beneficiarul */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relație cu beneficiarul <span className="text-red-500">*</span>
          </label>
          <select
            value={data.apartinatorRelatie}
            onChange={(e) => onChange('apartinatorRelatie', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            required
          >
            <option value="">-- Selectează relația --</option>
            {RELATII_APARTINATOR.map((relatie) => (
              <option key={relatie} value={relatie}>
                {relatie}
              </option>
            ))}
          </select>
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-1" />
            Telefon <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.apartinatorTelefon}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
              onChange('apartinatorTelefon', value);
            }}
            placeholder="0785 598 779"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={data.apartinatorEmail}
              onChange={(e) => onChange('apartinatorEmail', e.target.value.toLowerCase())}
              placeholder="email@exemplu.ro"
              className={`w-full px-4 py-3 pr-12 border-2 rounded-lg transition ${
                emailValid === true
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                  : emailValid === false
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
              } focus:ring-2`}
              required
            />
            {emailValid === true && (
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {emailValid === false && (
              <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          {emailValid === false && (
            <p className="mt-1 text-sm text-red-600">Email invalid</p>
          )}
        </div>

        {/* Adresă */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Adresă Completă <span className="text-red-500">*</span>
          </label>
          <textarea
            value={data.apartinatorAdresa}
            onChange={(e) => onChange('apartinatorAdresa', e.target.value)}
            placeholder="Str., Nr., Bl., Sc., Et., Ap., Sector, Oraș, Județ"
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
            required
          />
        </div>
      </div>

      {/* ACT IDENTITATE APARȚINĂTOR */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-600" />
          Act Identitate Aparținător
        </h3>

        {/* Serie și Număr CI */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CI Serie
            </label>
            <input
              type="text"
              value={data.apartinatorCiSerie}
              onChange={(e) => onChange('apartinatorCiSerie', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="ZX"
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
              value={data.apartinatorCiNumar}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                onChange('apartinatorCiNumar', value);
              }}
              placeholder="906782"
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
            value={data.apartinatorCiEliberatData}
            onChange={(e) => onChange('apartinatorCiEliberatData', e.target.value)}
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
            value={data.apartinatorCiEliberatDe}
            onChange={(e) => onChange('apartinatorCiEliberatDe', e.target.value.toUpperCase())}
            placeholder="SCHPF"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition uppercase"
          />
        </div>

        {/* Valabil până la */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valabil până la
          </label>
          <input
            type="date"
            value={data.apartinatorCiValabilPana}
            onChange={(e) => onChange('apartinatorCiValabilPana', e.target.value)}
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
