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
  Baby,
  Palette,
  Calendar,
  Heart,
  Stethoscope,
  TestTube,
  Bed,
  Hotel,
  LogIn,
  Sparkles,
  Star,
  ClipboardList,
  type LucideIcon
} from 'lucide-react';

export type OrganizationType = 'camin' | 'gradinita' | 'spital' | 'hotel';

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: 'Nou' | 'Soon';
  color: string;
  bgColor: string;
  hoverColor: string;
}

export const getSidebarConfig = (type: OrganizationType): SidebarItem[] => {
  // Itemuri comune pentru toate tipurile
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

  switch (type) {
    case 'camin':
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

    case 'gradinita':
      return [
        ...commonItems,
        {
          icon: Baby,
          label: 'Copii',
          href: '/children',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          hoverColor: 'hover:bg-blue-100'
        },
        {
          icon: Palette,
          label: 'Activități',
          href: '/activities',
          badge: 'Soon',
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
          hoverColor: 'hover:bg-pink-100'
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
          icon: Image,
          label: 'Galerie Foto',
          href: '/gallery',
          badge: 'Soon',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          hoverColor: 'hover:bg-purple-100'
        },
        {
          icon: Users,
          label: 'Părinți',
          href: '/parents',
          badge: 'Soon',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          hoverColor: 'hover:bg-green-100'
        },
        {
          icon: Calendar,
          label: 'Prezență',
          href: '/attendance',
          badge: 'Soon',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          hoverColor: 'hover:bg-yellow-100'
        },
        ...aiItems
      ];

    case 'spital':
      return [
        ...commonItems,
        {
          icon: Users,
          label: 'Pacienți',
          href: '/patients',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          hoverColor: 'hover:bg-blue-100'
        },
        {
          icon: Stethoscope,
          label: 'Tratamente',
          href: '/treatments',
          badge: 'Soon',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          hoverColor: 'hover:bg-red-100'
        },
        {
          icon: TestTube,
          label: 'Analize',
          href: '/tests',
          badge: 'Soon',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          hoverColor: 'hover:bg-green-100'
        },
        {
          icon: Calendar,
          label: 'Programări',
          href: '/appointments',
          badge: 'Soon',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          hoverColor: 'hover:bg-purple-100'
        },
        {
          icon: Heart,
          label: 'Diagnostic AI',
          href: '/ai-diagnosis',
          badge: 'Nou',
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
          hoverColor: 'hover:bg-pink-100'
        },
        {
          icon: FileText,
          label: 'Rețete',
          href: '/prescriptions',
          badge: 'Soon',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          hoverColor: 'hover:bg-indigo-100'
        },
        ...aiItems
      ];

    case 'hotel':
      return [
        ...commonItems,
        {
          icon: Calendar,
          label: 'Rezervări',
          href: '/reservations',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          hoverColor: 'hover:bg-blue-100'
        },
        {
          icon: Bed,
          label: 'Camere',
          href: '/rooms',
          badge: 'Soon',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          hoverColor: 'hover:bg-green-100'
        },
        {
          icon: LogIn,
          label: 'Check-in/out',
          href: '/checkin',
          badge: 'Soon',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          hoverColor: 'hover:bg-orange-100'
        },
        {
          icon: Sparkles,
          label: 'Servicii',
          href: '/services',
          badge: 'Soon',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          hoverColor: 'hover:bg-yellow-100'
        },
        {
          icon: Star,
          label: 'Recenzii',
          href: '/reviews',
          badge: 'Soon',
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
          hoverColor: 'hover:bg-pink-100'
        },
        {
          icon: Brain,
          label: 'Recomandări AI',
          href: '/ai-recommendations',
          badge: 'Nou',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          hoverColor: 'hover:bg-purple-100'
        },
        ...aiItems
      ];

    default:
      return commonItems;
  }
};

// Helper pentru a obține label-ul tipului de organizație
export const getOrganizationTypeLabel = (type: OrganizationType): string => {
  switch (type) {
    case 'camin':
      return 'Cămin Bătrâni';
    case 'gradinita':
      return 'Grădiniță';
    case 'spital':
      return 'Spital / Clinică';
    case 'hotel':
      return 'Hotel / Pensiune';
    default:
      return 'Organizație';
  }
};
