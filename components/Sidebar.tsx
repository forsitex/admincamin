'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Shield,
  GraduationCap,
  Utensils,
  ShoppingCart,
  Building2,
  FileText,
  UserCircle,
  Users,
  DollarSign,
  Heart,
  Stethoscope,
  Home as HomeIcon,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  company?: any;
  userEmail?: string;
}

export default function Sidebar({ company, userEmail }: SidebarProps) {
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

  const menuItems = [
    {
      icon: Home,
      label: 'Acasă',
      href: '/',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard-new',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      icon: Shield,
      label: 'Asigurări Malpraxis',
      href: '#',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      badge: 'Nou'
    },
    {
      icon: GraduationCap,
      label: 'Formare Continuă',
      href: '#',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      badge: 'Nou'
    },
    {
      icon: Utensils,
      label: 'Meniu Nutriționist',
      href: '#',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      badge: 'Nou'
    },
    {
      icon: ShoppingCart,
      label: 'Magazin',
      href: '#',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100',
      badge: 'Nou'
    },
    {
      icon: Building2,
      label: 'Organizații',
      href: '#',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
      badge: 'Soon'
    },
    {
      icon: FileText,
      label: 'Contracte',
      href: '#',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      badge: 'Soon'
    },
    {
      icon: UserCircle,
      label: 'Beneficiari',
      href: '#',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100',
      badge: 'Soon'
    },
    {
      icon: Users,
      label: 'Aparținători',
      href: '#',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100',
      badge: 'Soon'
    },
    {
      icon: DollarSign,
      label: 'Facturi',
      href: '#',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100',
      badge: 'Soon'
    },
    {
      icon: Heart,
      label: 'Cabinet Medical',
      href: '#',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100',
      badge: 'Soon'
    },
    {
      icon: Stethoscope,
      label: 'Infirmier',
      href: '#',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      hoverColor: 'hover:bg-rose-100',
      badge: 'Soon'
    },
    {
      icon: HomeIcon,
      label: 'Curățenie',
      href: '#',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      hoverColor: 'hover:bg-violet-100',
      badge: 'Soon'
    },
    {
      icon: ClipboardList,
      label: 'Modele Proceduri',
      href: '#',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      badge: 'Nou'
    }
  ];

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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
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
