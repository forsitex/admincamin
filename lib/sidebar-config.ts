import { 
  Home,
  LayoutDashboard,
  Users, 
  Utensils, 
  Pill, 
  FileText, 
  FolderOpen,
  Image, 
  Brain, 
  Bot,
  type LucideIcon
} from 'lucide-react';

export type OrganizationType = 'camin';

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: 'Nou' | 'Soon';
  color: string;
  bgColor: string;
  hoverColor: string;
}

export const getSidebarConfig = (_type: OrganizationType): SidebarItem[] => {
  const commonItems: SidebarItem[] = [
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
    }
  ];

  const aiItems: SidebarItem[] = [
    {
      icon: Brain,
      label: 'Analiză AI',
      href: '/ai-analysis',
      badge: 'Nou',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      icon: Bot,
      label: 'Asistent AI',
      href: '/ai-assistant',
      badge: 'Nou',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100'
    }
  ];

  return [
    ...commonItems,
    {
      icon: Users,
      label: 'Rezidenți',
      href: '/residents',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      icon: Utensils,
      label: 'Meniu AI',
      href: '/menu-ai',
      badge: 'Nou',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      icon: Pill,
      label: 'Medicamente',
      href: '/medications',
      badge: 'Soon',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    },
    {
      icon: FileText,
      label: 'Rapoarte',
      href: '/reports',
      badge: 'Soon',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      icon: FolderOpen,
      label: 'Documente',
      href: '/documents',
      badge: 'Soon',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      icon: Image,
      label: 'Galerie Foto',
      href: '/gallery',
      badge: 'Soon',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    ...aiItems
  ];
};

export const getOrganizationTypeLabel = (_type: OrganizationType): string => {
  return 'Cămin de Bătrâni';
};
