import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FileText, Users, Building2, Check, ArrowRight, Heart, Stethoscope, DollarSign, Mail, Phone, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2000')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/85 to-blue-900/90" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Gestionează Căminele de Bătrâni <span className="text-purple-300">Eficient</span>
            </h1>
            <p className="text-lg sm:text-xl text-purple-100 mb-8 max-w-2xl mx-auto drop-shadow">
              Platforma SaaS completă pentru administratorii de cămine. Generare automată de documente, gestionare rezidenți și mult mai mult.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="#preturi"
                className="w-full sm:w-auto px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition shadow-lg"
              >
                Vezi Prețurile
              </Link>
              <Link 
                href="#despre"
                className="w-full sm:w-auto px-8 py-4 bg-purple-600 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-lg"
              >
                Despre Noi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="servicii" className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Servicii Complete pentru Cămine</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tot ce ai nevoie pentru a gestiona eficient căminul de bătrâni într-o singură platformă
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                description="Urmărește costurile, contribuțiile și generează facturi automat pentru fiecare rezident."
              />
              <FeatureCard 
                icon={<Stethoscope className="w-8 h-8 text-teal-600" />}
                title="Monitorizare Medicală"
                description="Gestionează fișele medicale, tratamentele și consultațiile pentru fiecare beneficiar."
              />
            </div>
        </div>
      </section>

      {/* Despre Noi Section */}
      <section id="despre" className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Despre Platforma Noastră</h2>
            <p className="text-lg text-gray-600 mb-8">
              Admin Camin Batrani este platforma SaaS dedicată administratorilor de cămine de bătrâni din România. 
              Oferim soluții complete pentru gestionarea eficientă a rezidenților, generarea automată de documente legale 
              și simplificarea proceselor administrative.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard number="4" label="Cămine Active" color="purple" />
              <StatCard number="16" label="Documente" color="blue" />
              <StatCard number="2" label="Firme" color="green" />
              <StatCard number="100%" label="Cloud" color="orange" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="preturi" className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Prețuri Simple și Transparente</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Alege planul potrivit pentru căminul tău. Fără costuri ascunse.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <PricingCard 
              name="Standard"
              price="99"
              features={[
                "1 Cămin",
                "Până la 50 rezidenți",
                "16 Documente PDF",
                "Suport Email",
                "Cloud Backup"
              ]}
            />
            <PricingCard 
              name="Premium"
              price="200"
              popular={true}
              features={[
                "Până la 2 Cămine",
                "Până la 150 rezidenți",
                "16 Documente PDF",
                "Suport Prioritar",
                "Cloud Backup",
                "Rapoarte Avansate"
              ]}
            />
            <PricingCard 
              name="Gold"
              price="500"
              features={[
                "Cămine Nelimitate",
                "Rezidenți Nelimitați",
                "16 Documente PDF",
                "Suport 24/7",
                "Cloud Backup",
                "Rapoarte Personalizate",
                "API Access"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Contactează-ne</h2>
              <p className="text-lg text-gray-600">
                Ai întrebări? Suntem aici să te ajutăm!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Telefon</h3>
                <a href="tel:0786300500" className="text-gray-600 hover:text-purple-600 transition">
                  0786 300 500
                </a>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <a href="mailto:contact@admincamin.ro" className="text-gray-600 hover:text-purple-600 transition">
                  contact@admincamin.ro
                </a>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Locație</h3>
                <p className="text-gray-600">București, România</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
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

function PricingCard({ name, price, features, popular = false }: { 
  name: string; 
  price: string; 
  features: string[]; 
  popular?: boolean 
}) {
  return (
    <div className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${popular ? 'border-purple-600 relative' : 'border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
            POPULAR
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600">lei/lună</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`block w-full text-center px-6 py-3 rounded-lg font-bold transition ${
          popular 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        Începe Acum
      </Link>
    </div>
  );
}
