'use client';

import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Standard',
      price: '99',
      features: [
        '1 Cămin',
        'Până la 50 rezidenți',
        '16 Documente PDF',
        'Suport Email',
        'Cloud Backup'
      ],
      buttonText: 'Începe Acum',
      buttonClass: 'bg-gray-900 text-white hover:bg-black'
    },
    {
      name: 'Premium',
      price: '200',
      popular: true,
      features: [
        'Până la 2 Cămine',
        'Până la 150 rezidenți',
        '16 Documente PDF',
        'Suport Prioritar',
        'Cloud Backup',
        'Rapoarte Avansate'
      ],
      buttonText: 'Începe Acum',
      buttonClass: 'bg-purple-600 text-white hover:bg-purple-700'
    },
    {
      name: 'Gold',
      price: '500',
      features: [
        'Cămine Nelimitate',
        'Rezidenți Nelimitați',
        '16 Documente PDF',
        'Suport 24/7',
        'Cloud Backup',
        'Rapoarte Personalizate',
        'API Access'
      ],
      buttonText: 'Începe Acum',
      buttonClass: 'bg-gray-900 text-white hover:bg-black'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/dashboard-new"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Înapoi la Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Alege Planul Potrivit
          </h1>
          <p className="text-xl text-gray-600">
            Upgrade-ează pentru mai multe funcționalități
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                relative bg-white rounded-3xl shadow-xl p-8 
                ${plan.popular ? 'border-4 border-purple-500 transform scale-105' : 'border-2 border-gray-200'}
                hover:shadow-2xl transition-all duration-300
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">lei/lună</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all
                  ${plan.buttonClass}
                  ${plan.popular ? 'shadow-lg' : ''}
                `}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            🔒 Plată securizată prin Stripe • 💳 Anulare oricând • 📧 Suport dedicat
          </p>
          <p className="text-sm text-gray-500">
            Integrare Stripe disponibilă în curând
          </p>
        </div>
      </div>
    </div>
  );
}
