import Link from 'next/link';
import { Heart, Users, FileText, Printer, Cloud, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">iEmpathy</h1>
          </div>
          <Link 
            href="/dashboard"
            className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Sistem Modern de Management<br />pentru Cămine de Bătrâni
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Gestionează rezidenții, generează documente automat și simplifică procesele administrative
          </p>
          <Link 
            href="/residents/add"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-2xl"
          >
            Adaugă Rezident Nou
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <FeatureCard 
            icon={<Users className="w-8 h-8" />}
            title="Gestionare Rezidenți"
            description="Adaugă și gestionează rezidenți din 4 cămine"
          />
          <FeatureCard 
            icon={<FileText className="w-8 h-8" />}
            title="16 Documente Auto"
            description="Generare automată a tuturor contractelor și anexelor"
          />
          <FeatureCard 
            icon={<Printer className="w-8 h-8" />}
            title="Printare Automată"
            description="Trimite documentele direct la imprimantă"
          />
          <FeatureCard 
            icon={<Cloud className="w-8 h-8" />}
            title="Cloud Backup"
            description="Toate datele salvate automat în Firebase"
          />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <StatCard number="4" label="Cămine" />
          <StatCard number="16" label="Documente Generate" />
          <StatCard number="100%" label="Cloud Backup" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition">
      <div className="text-white mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
      <div className="text-5xl font-bold text-white mb-2">{number}</div>
      <div className="text-white/80 text-lg">{label}</div>
    </div>
  );
}
