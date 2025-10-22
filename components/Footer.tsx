import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/aiafacere-logo.png" 
                alt="iEmpathy Platform" 
                width={150} 
                height={50}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400">
              Platformă SaaS multi-industry cu tehnologie AI de ultimă generație. 
              Soluții complete pentru cămine, grădinițe, spitale și hoteluri.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Link-uri Rapide</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-purple-400 transition">
                  Acasă
                </Link>
              </li>
              <li>
                <Link href="#despre" className="text-sm hover:text-purple-400 transition">
                  Despre Noi
                </Link>
              </li>
              <li>
                <Link href="#servicii" className="text-sm hover:text-purple-400 transition">
                  Servicii
                </Link>
              </li>
              <li>
                <Link href="#preturi" className="text-sm hover:text-purple-400 transition">
                  Prețuri
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Servicii AI</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Analiză Documente AI</li>
              <li>Asistent Multi-Domeniu</li>
              <li>Generare Automată</li>
              <li>Analiză Predictivă</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-purple-400" />
                <a href="tel:0786300500" className="hover:text-purple-400 transition">
                  0786 300 500
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-purple-400" />
                <a href="mailto:contact@admincamin.ro" className="hover:text-purple-400 transition">
                  contact@admincamin.ro
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-purple-400 mt-1" />
                <span>București, România</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} iEmpathy Platform. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
