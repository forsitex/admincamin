'use client';

import { Heart, Stethoscope, User, Activity, Info } from 'lucide-react';
import { PROVENIENTA_OPTIONS, MOBILITATE_OPTIONS } from '@/lib/constants';

interface Step5Props {
  data: {
    provenienta: string;
    provenientaDetalii: string;
    diagnostic: string;
    alergii: string;
    alimentatie: string;
    incontinenta: string;
    mobilitate: string;
    greutate: string;
    comportament: string;
    medicFamilieNume: string;
    medicFamilieTelefon: string;
    medicFamilieEmail: string;
    tensiuneArteriala: string;
    puls: string;
    glicemie: string;
    temperatura: string;
    saturatieOxigen: string;
    escare: string;
    stareGenerala: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function Step5Medical({ data, onChange }: Step5Props) {
  const needsProvenientaDetails = ['Din spital', 'Din alt centru', 'Altă variantă'].includes(data.provenienta);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pas 5: Date Medicale (Opțional)
        </h2>
        <p className="text-gray-600">
          Aceste informații pot fi completate acum sau ulterior din profilul rezidentului.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Notă:</p>
            <p>
              Toate câmpurile din acest pas sunt opționale. Poți sări acest pas și completa 
              informațiile medicale mai târziu.
            </p>
          </div>
        </div>
      </div>

      {/* INFORMAȚII GENERALE */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-600" />
          Informații Generale
        </h3>

        {/* Proveniență */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proveniență
          </label>
          <select
            value={data.provenienta}
            onChange={(e) => onChange('provenienta', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          >
            <option value="">-- Selectează --</option>
            {PROVENIENTA_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Detalii Proveniență (dacă e necesar) */}
        {needsProvenientaDetails && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detalii Proveniență
            </label>
            <input
              type="text"
              value={data.provenientaDetalii}
              onChange={(e) => onChange('provenientaDetalii', e.target.value)}
              placeholder="Numele spitalului / centrului sau alte detalii"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
        )}

        {/* Diagnostic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diagnostic
          </label>
          <textarea
            value={data.diagnostic}
            onChange={(e) => onChange('diagnostic', e.target.value)}
            placeholder="Diagnostic medical principal"
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
          />
        </div>

        {/* Alergii */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alergii
          </label>
          <input
            type="text"
            value={data.alergii}
            onChange={(e) => onChange('alergii', e.target.value)}
            placeholder="Alergii cunoscute (medicamente, alimente, etc.)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          />
        </div>

        {/* Grid: Alimentație, Greutate */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restricții Alimentație
            </label>
            <input
              type="text"
              value={data.alimentatie}
              onChange={(e) => onChange('alimentatie', e.target.value)}
              placeholder="Diete speciale, restricții"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Greutate (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={data.greutate}
              onChange={(e) => onChange('greutate', e.target.value)}
              placeholder="75"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
        </div>

        {/* Mobilitate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Activity className="inline w-4 h-4 mr-1" />
            Mobilitate
          </label>
          <select
            value={data.mobilitate}
            onChange={(e) => onChange('mobilitate', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          >
            <option value="">-- Selectează --</option>
            {MOBILITATE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Incontinență */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incontinență
          </label>
          <input
            type="text"
            value={data.incontinenta}
            onChange={(e) => onChange('incontinenta', e.target.value)}
            placeholder="Da/Nu, tip"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          />
        </div>

        {/* Comportament */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comportament / Violență
          </label>
          <textarea
            value={data.comportament}
            onChange={(e) => onChange('comportament', e.target.value)}
            placeholder="Observații despre comportament"
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
          />
        </div>
      </div>

      {/* MEDIC DE FAMILIE */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Medic de Familie
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nume Medic
          </label>
          <input
            type="text"
            value={data.medicFamilieNume}
            onChange={(e) => onChange('medicFamilieNume', e.target.value)}
            placeholder="Dr. Popescu Ion"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={data.medicFamilieTelefon}
              onChange={(e) => onChange('medicFamilieTelefon', e.target.value)}
              placeholder="0721 123 456"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={data.medicFamilieEmail}
              onChange={(e) => onChange('medicFamilieEmail', e.target.value.toLowerCase())}
              placeholder="medic@email.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
        </div>
      </div>

      {/* EXAMEN CLINIC LA INTRARE */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-purple-600" />
          Examen Clinic la Intrare
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tensiune Arterială (TA)
            </label>
            <input
              type="text"
              value={data.tensiuneArteriala}
              onChange={(e) => onChange('tensiuneArteriala', e.target.value)}
              placeholder="120/80"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puls (AV)
            </label>
            <input
              type="text"
              value={data.puls}
              onChange={(e) => onChange('puls', e.target.value)}
              placeholder="75"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Glicemie
            </label>
            <input
              type="text"
              value={data.glicemie}
              onChange={(e) => onChange('glicemie', e.target.value)}
              placeholder="95"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperatură
            </label>
            <input
              type="text"
              value={data.temperatura}
              onChange={(e) => onChange('temperatura', e.target.value)}
              placeholder="36.5"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saturație Oxigen (SpO2)
            </label>
            <input
              type="text"
              value={data.saturatieOxigen}
              onChange={(e) => onChange('saturatieOxigen', e.target.value)}
              placeholder="98%"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escare
          </label>
          <input
            type="text"
            value={data.escare}
            onChange={(e) => onChange('escare', e.target.value)}
            placeholder="Da/Nu, localizare"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stare Generală la Cazare
          </label>
          <textarea
            value={data.stareGenerala}
            onChange={(e) => onChange('stareGenerala', e.target.value)}
            placeholder="Observații despre starea generală a beneficiarului la momentul cazării"
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
          />
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-gray-500 italic">
        Toate câmpurile din acest pas sunt opționale și pot fi completate ulterior.
      </p>
    </div>
  );
}
