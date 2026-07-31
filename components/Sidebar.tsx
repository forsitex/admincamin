'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { getSidebarConfig, getOrganizationTypeLabel, type OrganizationType } from '@/lib/sidebar-config';

interface SidebarProps {
  company?: any;
  userEmail?: string;
  organizationType?: OrganizationType;
}

export default function Sidebar({ company, userEmail, organizationType = 'camin' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Închide sidebar-ul pe mobil la navigare
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Obține configurația sidebar-ului bazată pe tipul organizației
  const menuItems = getSidebarConfig(organizationType);
  const orgTypeLabel = getOrganizationTypeLabel(organizationType);

  return (
    <>
      {/* Hamburger button — doar pe mobil */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1a2b4a] text-white shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay — doar pe mobil când sidebar e deschis */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`${
          collapsed ? 'w-20' : 'w-72'
        } bg-[#1a2b4a] min-h-screen flex flex-col transition-all duration-300
        fixed md:sticky top-0 z-50 md:z-auto
        ${mobileOpen ? 'left-0' : '-left-full md:left-0'}
        h-screen md:h-auto`}
      >
      {/* Close button — doar pe mobil */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex-1">
              <h2 className="text-white font-bold text-base truncate">
                {company?.name || 'Loading...'}
              </h2>
              <p className="text-white/40 text-xs truncate mt-1">
                {company?.adminName || userEmail}
              </p>
              <p className="text-[#c9a96e] text-xs font-medium mt-1 uppercase tracking-wider">
                {orgTypeLabel}
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={`menu-${item.label}-${index}`}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#c9a96e]' : ''}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-[#c9a96e]/20 text-[#c9a96e] text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Deconectare</span>}
        </button>
      </div>
      </div>
    </>
  );
}
