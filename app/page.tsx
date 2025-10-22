import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FileText, Users, Building2, Check, ArrowRight, Heart, Stethoscope, DollarSign, Mail, Phone, MapPin, Brain, Bot, Sparkles, Baby, Hotel, Zap, Shield, TrendingUp } from 'lucide-react';

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
              backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/90 via-yellow-600/85 to-amber-600/90" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Platforma <span className="text-yellow-200">AI-Powered</span> pentru Managementul Afacerii Tale
            </h1>
            <p className="text-lg sm:text-xl text-orange-50 mb-8 max-w-2xl mx-auto drop-shadow">
              Tehnologie AI de ultimă generație pentru 4 industrii: Cămine, Grădinițe, Spitale și Hoteluri. Automatizare completă, analiză documente și asistent inteligent în peste 9 domenii active.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Începe Gratuit
              </Link>
              <Link 
                href="#industrii"
                className="w-full sm:w-auto px-8 py-4 bg-orange-600 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition shadow-lg"
              >
                Vezi Industriile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section - 2 Big Cards */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tehnologie de <span className="text-purple-600">Ultimă Generație</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Puterea inteligenței artificiale la îndemâna ta
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Card 1 - Document Analysis AI */}
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 animate-gradient-xy"></div>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
              </div>
              
              {/* Content */}
              <div className="relative p-8 sm:p-12 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <Brain className="w-5 h-5" />
                  <span className="font-semibold">AI-Powered</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  Analiză Documente AI
                </h3>
                
                <p className="text-lg text-purple-100 mb-6 leading-relaxed">
                  Procesare automată și extragere inteligentă de date din orice tip de document. 
                  OCR avansat, înțelegere contextuală și validare automată.
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Recunoaștere text OCR 99.9% acuratețe</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Extragere automată date personale (CNP, nume, adrese)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Validare inteligentă și detectare erori</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Procesare batch pentru volume mari</span>
                  </li>
                </ul>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">99.9%</div>
                    <div className="text-sm text-purple-200">Acuratețe</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">&lt;2s</div>
                    <div className="text-sm text-purple-200">Procesare</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm text-purple-200">Disponibil</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - AI Assistant */}
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-600 animate-gradient-xy"></div>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
              </div>
              
              {/* Content */}
              <div className="relative p-8 sm:p-12 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <Bot className="w-5 h-5" />
                  <span className="font-semibold">Multi-Domain AI</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  Asistent AI în 9+ Domenii
                </h3>
                
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Asistent inteligent specializat în multiple domenii de activitate. 
                  Răspunsuri instant, recomandări personalizate și automatizare completă.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <Stethoscope className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Medical</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Juridic</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <DollarSign className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Financiar</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <Users className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">HR</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <Heart className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Nutriție</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <Building2 className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Management</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <TrendingUp className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Analiză</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">+2 Altele</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">9+</div>
                    <div className="text-sm text-blue-200">Domenii</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">Instant</div>
                    <div className="text-sm text-blue-200">Răspuns</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">RO</div>
                    <div className="text-sm text-blue-200">Limba</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industrii" className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">O Platformă, 4 Industrii</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Soluție completă adaptată perfect pentru fiecare tip de business
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <IndustryCard 
              icon={<Heart className="w-12 h-12 text-purple-600" />}
              title="Cămin Bătrâni"
              description="Gestionare rezidenți, medicamente, meniu AI, rapoarte medicale"
              color="purple"
            />
            <IndustryCard 
              icon={<Baby className="w-12 h-12 text-blue-600" />}
              title="Grădiniță"
              description="Copii, activități, prezență, comunicare părinți"
              color="blue"
            />
            <IndustryCard 
              icon={<Stethoscope className="w-12 h-12 text-red-600" />}
              title="Spital/Clinică"
              description="Pacienți, tratamente, programări, diagnostic AI"
              color="red"
            />
            <IndustryCard 
              icon={<Hotel className="w-12 h-12 text-orange-600" />}
              title="Hotel/Pensiune"
              description="Rezervări, camere, check-in, recenzii"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="servicii" className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold mb-4">
              <Zap className="w-4 h-4" />
              Tehnologie AI de Ultimă Generație
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Puterea Inteligenței Artificiale</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Automatizare completă și asistență inteligentă în peste 9 domenii active
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={<Brain className="w-8 h-8 text-purple-600" />}
              title="Analiză Documente AI"
              description="Procesare automată și extragere inteligentă de date din orice tip de document. OCR avansat și înțelegere contextuală."
              badge="AI"
            />
            <FeatureCard 
              icon={<Bot className="w-8 h-8 text-blue-600" />}
              title="Asistent AI Multi-Domeniu"
              description="Asistent inteligent activ în peste 9 domenii: juridic, medical, financiar, HR, nutriție și multe altele."
              badge="AI"
            />
            <FeatureCard 
              icon={<FileText className="w-8 h-8 text-green-600" />}
              title="Generare Automată Documente"
              description="Creează instant contracte, rapoarte, facturi și orice document necesar cu date completate automat."
              badge="Nou"
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8 text-yellow-600" />}
              title="Meniu Generator AI"
              description="Generare automată de meniuri personalizate bazate pe preferințe, alergii și restricții medicale."
              badge="AI"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-red-600" />}
              title="Analiză Predictivă"
              description="Predicții inteligente pentru ocupare, venituri, costuri și tendințe bazate pe date istorice."
              badge="AI"
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-indigo-600" />}
              title="Securitate & Compliance"
              description="Protecție avansată a datelor, backup automat și conformitate GDPR completă."
              badge="Nou"
            />
          </div>
        </div>
      </section>

      {/* Despre Noi Section */}
      <section id="despre" className="py-16 sm:py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Despre iEmpathy Platform</h2>
            <p className="text-lg text-gray-600 mb-8">
              iEmpathy este platforma SaaS multi-industry cu tehnologie AI de ultimă generație. 
              Oferim soluții complete pentru 4 industrii diferite: cămine de bătrâni, grădinițe, spitale/clinici și hoteluri. 
              Automatizare completă, analiză inteligentă și asistență AI în peste 9 domenii active.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard number="4" label="Industrii" color="purple" />
              <StatCard number="9+" label="Domenii AI" color="blue" />
              <StatCard number="100%" label="Cloud" color="green" />
              <StatCard number="24/7" label="Suport" color="orange" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Gata să Transformi Afacerea Ta?
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              Alătură-te platformei AI-powered și automatizează procesele tale de business astăzi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Începe Gratuit
              </Link>
              <Link 
                href="/pricing"
                className="w-full sm:w-auto px-8 py-4 bg-purple-700 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-purple-800 transition shadow-lg"
              >
                Vezi Prețurile
              </Link>
            </div>
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

function FeatureCard({ icon, title, description, badge }: { icon: React.ReactNode; title: string; description: string; badge?: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-200 transition group">
      <div className="flex items-start justify-between mb-4">
        <div className="group-hover:scale-110 transition">{icon}</div>
        {badge && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function IndustryCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const colorClasses = {
    purple: 'hover:border-purple-500 hover:shadow-purple-200',
    blue: 'hover:border-blue-500 hover:shadow-blue-200',
    red: 'hover:border-red-500 hover:shadow-red-200',
    orange: 'hover:border-orange-500 hover:shadow-orange-200',
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:shadow-xl transition-all duration-300 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
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

