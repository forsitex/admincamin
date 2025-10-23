'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
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
  
  // Obține configurația sidebar-ului bazată pe tipul organizației
  const menuItems = getSidebarConfig(organizationType);
  const orgTypeLabel = getOrganizationTypeLabel(organizationType);
  
  // Inițializează toate itemurile cu submeniuri ca fiind deschise by default
  const [expandedItems, setExpandedItems] = useState<string[]>(() => 
    menuItems.filter(item => item.subItems && item.subItems.length > 0).map(item => item.label)
  );

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

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
          const isExpanded = expandedItems.includes(item.label);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          return (
            <div key={`menu-${item.label}-${index}`}>
              {/* Main Menu Item */}
              <div
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? `${item.bgColor} ${item.color} shadow-lg` 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                onClick={() => hasSubItems && !collapsed ? toggleExpand(item.label) : null}
              >
                {hasSubItems && !collapsed ? (
                  <>
                    <Icon className={`w-6 h-6 ${isActive ? item.color : ''}`} />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-semibold">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={item.href} className="flex items-center gap-4 w-full">
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
                )}
              </div>

              {/* Sub Menu Items */}
              {hasSubItems && isExpanded && !collapsed && (
                <div className="ml-10 mt-2 space-y-1">
                  {item.subItems!.map((subItem, subIndex) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={`submenu-${subItem.label}-${subIndex}`}
                        href={subItem.href}
                        className={`
                          flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all
                          ${isSubActive 
                            ? 'bg-gray-700 text-white font-semibold' 
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }
                        `}
                      >
                        <span>• {subItem.label}</span>
                        {subItem.badge && (
                          <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
