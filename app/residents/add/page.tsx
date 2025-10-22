'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import Step1CompanyCamin from '@/components/forms/Step1CompanyCamin';
import Step2Beneficiar from '@/components/forms/Step2Beneficiar';
import Step3Apartinator from '@/components/forms/Step3Apartinator';
import Step4Contract from '@/components/forms/Step4Contract';
import Step5Medical from '@/components/forms/Step5Medical';
import { saveResident, generateNumarDosar, generateNumarContract } from '@/lib/firestore';
import { Resident } from '@/types/resident';

const STEPS = [
  { id: 1, name: 'Firmă & Cămin' },
  { id: 2, name: 'Beneficiar' },
  { id: 3, name: 'Aparținător' },
  { id: 4, name: 'Contract' },
  { id: 5, name: 'Medical' }
];

export default function AddResidentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1 - PRE-COMPLETAT PENTRU TEST
    companyCui: '50780956', // EMPATHY SUPPORT SRL
    caminId: 'fortunei',
    
    // Step 2 - PRE-COMPLETAT PENTRU TEST
    beneficiarNumeComplet: 'POPESCU ION GHEORGHE',
    beneficiarCnp: '1790808464545',
    beneficiarDataNasterii: '08.08.1979',
    beneficiarAdresa: 'Str. Fortunei, nr. 10, Bl. A1, Sc. B, Et. 3, Ap. 15, Sector 1, București, România',
    beneficiarCodPostal: '014321',
    beneficiarCiSerie: 'RC',
    beneficiarCiNumar: '123456',
    beneficiarCiEliberatData: '2020-01-15',
    beneficiarCiEliberatDe: 'SCGTP',
    beneficiarCiValabilPana: '2030-01-15',
    
    // Step 3 - PRE-COMPLETAT PENTRU TEST
    apartinatorNumeComplet: 'POPESCU MARIA',
    apartinatorCnp: '2850505123456',
    apartinatorRelatie: 'Fiică',
    apartinatorTelefon: '0721234567',
    apartinatorEmail: 'maria.popescu@email.ro',
    apartinatorAdresa: 'Str. Florilor, nr. 25, Bl. B2, Sc. A, Et. 2, Ap. 8, Sector 2, București, România',
    apartinatorCiSerie: 'ZX',
    apartinatorCiNumar: '654321',
    apartinatorCiEliberatData: '2019-05-20',
    apartinatorCiEliberatDe: 'SCHPF',
    apartinatorCiValabilPana: '2029-05-20',
    
    // Step 4 - PRE-COMPLETAT PENTRU TEST
    costServiciu: '3500.00',
    contributieBeneficiar: '2000.00',
    dataInceputContract: new Date().toISOString().split('T')[0],
    dataSfarsitContract: '',
    durataNedeterminata: true,
    
    // Step 5 - PRE-COMPLETAT PENTRU TEST (opțional)
    provenienta: 'De acasă',
    provenientaDetalii: '',
    diagnostic: 'Diabet zaharat tip 2, Hipertensiune arteriala',
    alergii: 'Penicilina',
    alimentatie: 'Dieta hipoglucidica',
    incontinenta: 'Nu',
    mobilitate: 'Independent',
    greutate: '75',
    comportament: 'Cooperant, calm',
    medicFamilieNume: 'Dr. Ionescu Ana',
    medicFamilieTelefon: '0723456789',
    medicFamilieEmail: 'dr.ionescu@cabinet.ro',
    tensiuneArteriala: '130/80',
    puls: '72',
    glicemie: '110',
    temperatura: '36.6',
    saturatieOxigen: '98%',
    escare: 'Nu',
    stareGenerala: 'Stare generala buna, cooperant, orientat temporo-spatial'
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.companyCui || !formData.caminId) {
          setError('Selectează firma și căminul');
          return false;
        }
        break;
      case 2:
        if (!formData.beneficiarNumeComplet || !formData.beneficiarCnp || 
            !formData.beneficiarDataNasterii || !formData.beneficiarAdresa ||
            !formData.beneficiarCiSerie || !formData.beneficiarCiNumar ||
            !formData.beneficiarCiEliberatData || !formData.beneficiarCiEliberatDe ||
            !formData.beneficiarCiValabilPana) {
          setError('Completează toate câmpurile obligatorii pentru beneficiar');
          return false;
        }
        break;
      case 3:
        if (!formData.apartinatorNumeComplet || !formData.apartinatorCnp ||
            !formData.apartinatorRelatie || !formData.apartinatorTelefon ||
            !formData.apartinatorEmail || !formData.apartinatorAdresa ||
            !formData.apartinatorCiSerie || !formData.apartinatorCiNumar ||
            !formData.apartinatorCiEliberatData || !formData.apartinatorCiEliberatDe ||
            !formData.apartinatorCiValabilPana) {
          setError('Completează toate câmpurile obligatorii pentru aparținător');
          return false;
        }
        break;
      case 4:
        if (!formData.costServiciu || parseFloat(formData.costServiciu) <= 0) {
          setError('Introdu un cost valid pentru serviciu');
          return false;
        }
        if (!formData.dataInceputContract) {
          setError('Selectează data de început a contractului');
          return false;
        }
        if (!formData.durataNedeterminata && !formData.dataSfarsitContract) {
          setError('Selectează data de sfârșit sau bifează "Durată nedeterminată"');
          return false;
        }
        break;
      case 5:
        // Step 5 este opțional
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return; // Validăm până la step 4 (step 5 e opțional)

    setLoading(true);
    setError('');

    try {
      // Generare numere unice
      const numarDosar = generateNumarDosar();
      const numarContract = await generateNumarContract(formData.caminId);

      // Construire obiect Resident (convertim datele la string pentru Firestore)
      const resident: any = {
        // Step 1
        companyCui: formData.companyCui,
        caminId: formData.caminId,
        
        // Step 2
        beneficiarNumeComplet: formData.beneficiarNumeComplet,
        beneficiarCnp: formData.beneficiarCnp,
        beneficiarDataNasterii: formData.beneficiarDataNasterii,
        beneficiarAdresa: formData.beneficiarAdresa,
        beneficiarCodPostal: formData.beneficiarCodPostal || '',
        beneficiarCiSerie: formData.beneficiarCiSerie,
        beneficiarCiNumar: formData.beneficiarCiNumar,
        beneficiarCiEliberatData: formData.beneficiarCiEliberatData,
        beneficiarCiEliberatDe: formData.beneficiarCiEliberatDe,
        beneficiarCiValabilPana: formData.beneficiarCiValabilPana,
        
        // Step 3
        apartinatorNumeComplet: formData.apartinatorNumeComplet,
        apartinatorCnp: formData.apartinatorCnp,
        apartinatorRelatie: formData.apartinatorRelatie,
        apartinatorTelefon: formData.apartinatorTelefon,
        apartinatorEmail: formData.apartinatorEmail,
        apartinatorAdresa: formData.apartinatorAdresa,
        apartinatorCiSerie: formData.apartinatorCiSerie,
        apartinatorCiNumar: formData.apartinatorCiNumar,
        apartinatorCiEliberatData: formData.apartinatorCiEliberatData,
        apartinatorCiEliberatDe: formData.apartinatorCiEliberatDe,
        apartinatorCiValabilPana: formData.apartinatorCiValabilPana,
        
        // Step 4
        costServiciu: parseFloat(formData.costServiciu),
        contributieBeneficiar: formData.contributieBeneficiar ? parseFloat(formData.contributieBeneficiar) : 0,
        dataInceputContract: formData.dataInceputContract || '',
        dataSfarsitContract: formData.durataNedeterminata ? '' : (formData.dataSfarsitContract || ''),
        durataNedeterminata: formData.durataNedeterminata,
        
        // Step 5 (opțional) - folosim string gol în loc de undefined
        provenienta: formData.provenienta || '',
        provenientaDetalii: formData.provenientaDetalii || '',
        diagnostic: formData.diagnostic || '',
        alergii: formData.alergii || '',
        alimentatie: formData.alimentatie || '',
        incontinenta: formData.incontinenta || '',
        mobilitate: formData.mobilitate || '',
        greutate: formData.greutate ? parseFloat(formData.greutate) : 0,
        comportament: formData.comportament || '',
        medicFamilieNume: formData.medicFamilieNume || '',
        medicFamilieTelefon: formData.medicFamilieTelefon || '',
        medicFamilieEmail: formData.medicFamilieEmail || '',
        tensiuneArteriala: formData.tensiuneArteriala || '',
        puls: formData.puls || '',
        glicemie: formData.glicemie || '',
        temperatura: formData.temperatura || '',
        saturatieOxigen: formData.saturatieOxigen || '',
        escare: formData.escare || '',
        stareGenerala: formData.stareGenerala || '',
        
        // Metadata
        dataInregistrare: Date.now(),
        contractGenerat: false,
        numarDosar,
        numarContract
      };

      // Salvare în Firestore
      await saveResident(resident);

      // Redirect la success page
      router.push(`/residents/success?cnp=${resident.beneficiarCnp}`);
    } catch (err) {
      console.error('Error saving resident:', err);
      setError('Eroare la salvarea datelor. Te rog încearcă din nou.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Înapoi la Dashboard
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Steps */}
          {currentStep === 1 && (
            <Step1CompanyCamin data={formData} onChange={handleChange} />
          )}
          {currentStep === 2 && (
            <Step2Beneficiar data={formData} onChange={handleChange} />
          )}
          {currentStep === 3 && (
            <Step3Apartinator data={formData} onChange={handleChange} />
          )}
          {currentStep === 4 && (
            <Step4Contract data={formData} onChange={handleChange} />
          )}
          {currentStep === 5 && (
            <Step5Medical data={formData} onChange={handleChange} />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              Înapoi
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Următorul
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Salvează și Generează Documente
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
