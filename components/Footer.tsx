import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Admin Camin Batrani</h3>
            <p className="text-sm text-gray-400">
              Platforma SaaS pentru gestionarea eficientă a căminelor de bătrâni. 
              Simplifică procesele administrative și îmbunătățește calitatea serviciilor.
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
            <h3 className="text-white font-bold text-lg mb-4">Servicii</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Gestionare Rezidenți</li>
              <li>Generare Documente</li>
              <li>Facturare Automată</li>
              <li>Rapoarte & Statistici</li>
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
          <p>&copy; {new Date().getFullYear()} Admin Camin Batrani. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
