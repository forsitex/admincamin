'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/admin-camine.png" 
              alt="Admin Camin Batrani" 
              width={150} 
              height={50}
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Acasă
            </Link>
            <Link href="#despre" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Despre Noi
            </Link>
            <Link href="#servicii" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Servicii
            </Link>
            <Link href="#preturi" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Prețuri
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Contact
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Acasă
              </Link>
              <Link 
                href="#despre" 
                className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Despre Noi
              </Link>
              <Link 
                href="#servicii" 
                className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Servicii
              </Link>
              <Link 
                href="#preturi" 
                className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prețuri
              </Link>
              <Link 
                href="#contact" 
                className="text-gray-700 hover:text-purple-600 font-medium transition px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/login" 
                className="mx-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
