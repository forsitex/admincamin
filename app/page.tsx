import Link from 'next/link';
import Image from 'next/image';
import { FileText, ArrowRight, Home, Users, Building2, DollarSign, Heart, Stethoscope, Settings } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Image 
            src="/admin-camine.png" 
            alt="Admin Camine" 
            width={180} 
            height={60}
            className="w-full h-auto"
          />
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-white bg-purple-600 rounded-lg mb-2 font-medium"
          >
            <FileText className="w-5 h-5" />
            Contracte
          </Link>

          <button disabled className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg mb-2 cursor-not-allowed w-full">
            <Users className="w-5 h-5" />
            Beneficiari
          </button>

          <button disabled className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg mb-2 cursor-not-allowed w-full">
            <Users className="w-5 h-5" />
            Aparținători
          </button>

          <button disabled className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg mb-2 cursor-not-allowed w-full">
            <DollarSign className="w-5 h-5" />
            Facturi
          </button>

          <button disabled className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg mb-2 cursor-not-allowed w-full">
            <Heart className="w-5 h-5" />
            Cabinet Medical
          </button>

          <button disabled className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg mb-2 cursor-not-allowed w-full">
            <Stethoscope className="w-5 h-5" />
            Infirmier
          </button>

          <button disabled className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg mb-2 cursor-not-allowed w-full">
            <Building2 className="w-5 h-5" />
            Curățenie
          </button>

          <button disabled className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg mb-2 cursor-not-allowed w-full">
            <Settings className="w-5 h-5" />
            Mai Multe Module
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Sistem de Management pentru Cămine de Bătrâni</h1>
            <Link 
              href="/dashboard"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Dashboard
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Bine ai venit în sistemul de management
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Gestionează rezidenții, generează documente automat și simplifică procesele administrative
              </p>
              <Link 
                href="/residents/add"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-lg"
              >
                Adaugă Rezident Nou
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <FeatureCard 
                icon={<FileText className="w-8 h-8 text-purple-600" />}
                title="Generare Automată Documente"
                description="Creează instant toate cele 16 documente necesare pentru fiecare rezident: contract principal, anexe, declarații și acorduri."
              />
              <FeatureCard 
                icon={<Users className="w-8 h-8 text-blue-600" />}
                title="Gestionare Rezidenți"
                description="Administrează rezidenții din 4 cămine diferite cu validare CNP automată și extragere date personale."
              />
              <FeatureCard 
                icon={<Building2 className="w-8 h-8 text-green-600" />}
                title="Multi-Cămin"
                description="Gestionează simultan căminele Fortunei, Cetinei, Clinceni și Orhideelor dintr-o singură platformă."
              />
              <FeatureCard 
                icon={<Heart className="w-8 h-8 text-red-600" />}
                title="Semnături Digitale"
                description="Semnături digitale integrate pentru ambii administratori cu ștampile oficiale pentru fiecare firmă."
              />
              <FeatureCard 
                icon={<DollarSign className="w-8 h-8 text-yellow-600" />}
                title="Facturare & Plăți"
                description="Urmărește costurile, contribuțiile și generează facturi automat pentru fiecare rezident (În curând)."
              />
              <FeatureCard 
                icon={<Stethoscope className="w-8 h-8 text-teal-600" />}
                title="Monitorizare Medicală"
                description="Gestionează fișele medicale, tratamentele și consultațiile pentru fiecare beneficiar (În curând)."
              />
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <StatCard number="4" label="Cămine Active" color="purple" />
              <StatCard number="16" label="Documente Auto" color="blue" />
              <StatCard number="2" label="Firme Gestionate" color="green" />
              <StatCard number="100%" label="Cloud Backup" color="orange" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label, color }: { number: string; label: string; color: string }) {
  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  };

  return (
    <div className={`rounded-xl p-6 border-2 text-center ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}
