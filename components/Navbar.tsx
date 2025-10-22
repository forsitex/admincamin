'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/dashboard" 
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/login" 
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg"
                  >
                    Înregistrare
                  </Link>
                </div>
              )
            )}
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
              {!loading && (
                user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="mx-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="mx-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-center flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="mx-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="mx-4 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Înregistrare
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
