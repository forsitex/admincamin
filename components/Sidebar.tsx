'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LogOut,
  ChevronLeft,
  ChevronRight
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
    <div 
      className={`${
        collapsed ? 'w-20' : 'w-72'
      } bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex flex-col transition-all duration-300 shadow-2xl`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex-1">
              <h2 className="text-white font-black text-lg truncate">
                {company?.name || 'Loading...'}
              </h2>
              <p className="text-gray-400 text-xs truncate mt-1">
                {userEmail}
              </p>
              <p className="text-purple-400 text-xs font-semibold mt-1">
                {orgTypeLabel}
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={`menu-${item.label}-${index}`}
              href={item.href}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? `${item.bgColor} ${item.color} shadow-lg scale-105` 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? item.color : ''}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-semibold">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
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
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-4 px-4 py-3 rounded-xl
            text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-6 h-6" />
          {!collapsed && <span className="font-semibold">Deconectare</span>}
        </button>
      </div>
    </div>
  );
}
