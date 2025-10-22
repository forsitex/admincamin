# 🏗️ Arhitectură Tehnică - Multi-Industry Platform

## 📁 Structură Foldere (Nouă)

```
web-iempathy/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │       └── select-type/
│   │
│   ├── dashboard-new/          # Dashboard universal
│   │
│   ├── (camin)/                # Cămin specific
│   │   ├── residents/
│   │   │   ├── add/
│   │   │   └── [id]/
│   │   ├── menu-ai/
│   │   ├── medications/
│   │   └── documents/
│   │
│   ├── (gradinita)/            # Grădiniță specific
│   │   ├── children/
│   │   │   ├── add/
│   │   │   └── [id]/
│   │   ├── activities/
│   │   ├── parents/
│   │   └── attendance/
│   │
│   ├── (spital)/               # Spital specific
│   │   ├── patients/
│   │   │   ├── add/
│   │   │   └── [id]/
│   │   ├── appointments/
│   │   ├── treatments/
│   │   └── prescriptions/
│   │
│   ├── (hotel)/                # Hotel specific
│   │   ├── reservations/
│   │   │   ├── add/
│   │   │   └── [id]/
│   │   ├── rooms/
│   │   ├── checkin/
│   │   └── services/
│   │
│   ├── (shared)/               # Shared între toate
│   │   ├── locations/          # Generic (nu "camine")
│   │   │   ├── add/
│   │   │   └── [id]/
│   │   ├── ai-assistant/
│   │   ├── ai-analysis/
│   │   ├── gallery/
│   │   ├── reports/
│   │   └── settings/
│   │
│   └── pricing/
│
├── components/
│   ├── (shared)/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx         # Dinamic
│   │
│   ├── (camin)/
│   │   ├── ResidentCard.tsx
│   │   └── MedicationList.tsx
│   │
│   ├── (gradinita)/
│   │   ├── ChildCard.tsx
│   │   └── ActivityCard.tsx
│   │
│   ├── (spital)/
│   │   ├── PatientCard.tsx
│   │   └── AppointmentCard.tsx
│   │
│   ├── (hotel)/
│   │   ├── ReservationCard.tsx
│   │   └── RoomCard.tsx
│   │
│   └── (ai)/
│       ├── ChatbotWidget.tsx
│       ├── MenuGenerator.tsx
│       └── DocumentAnalyzer.tsx
│
├── lib/
│   ├── firebase.ts
│   ├── firestore.ts           # CRUD operations
│   ├── openai.ts              # AI integration
│   ├── pdf-generator.ts       # PDF templates
│   ├── sidebar-config.ts      # Sidebar dinamic
│   ├── validators.ts          # CNP, email, etc.
│   └── utils.ts
│
├── types/
│   ├── organization.ts
│   ├── location.ts
│   ├── resident.ts            # Cămin
│   ├── child.ts               # Grădiniță
│   ├── patient.ts             # Spital
│   ├── reservation.ts         # Hotel
│   └── ai.ts
│
└── NEW/                       # Documentație
    ├── STRATEGY.md
    ├── TASKS.md
    └── TECHNICAL_ARCHITECTURE.md
```

---

## 🔧 Fișiere Cheie de Creat/Modificat

### **1. `/lib/sidebar-config.ts`** (NOU)

```typescript
import { 
  Home, Users, Utensils, Pill, FileText, 
  Baby, Palette, Calendar, Heart, Stethoscope,
  Hotel, Bed, Star, Image, Brain, Bot
} from 'lucide-react';

export type OrganizationType = 'camin' | 'gradinita' | 'spital' | 'hotel';

export interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  badge?: 'Nou' | 'Soon';
  color: string;
  bgColor: string;
  hoverColor: string;
}

export const getSidebarConfig = (type: OrganizationType): SidebarItem[] => {
  const commonItems: SidebarItem[] = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard-new',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
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
        ...commonItems.slice(0, 1),
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
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          hoverColor: 'hover:bg-red-100'
        },
        {
          icon: FileText,
          label: 'Rapoarte',
          href: '/reports',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          hoverColor: 'hover:bg-blue-100'
        },
        {
          icon: Image,
          label: 'Galerie Foto',
          href: '/gallery',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          hoverColor: 'hover:bg-purple-100'
        },
        ...commonItems.slice(1)
      ];

    case 'gradinita':
      return [
        ...commonItems.slice(0, 1),
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
          icon: Users,
          label: 'Părinți',
          href: '/parents',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          hoverColor: 'hover:bg-green-100'
        },
        {
          icon: Calendar,
          label: 'Prezență',
          href: '/attendance',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          hoverColor: 'hover:bg-yellow-100'
        },
        {
          icon: Image,
          label: 'Galerie Foto',
          href: '/gallery',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          hoverColor: 'hover:bg-purple-100'
        },
        ...commonItems.slice(1)
      ];

    case 'spital':
      return [
        ...commonItems.slice(0, 1),
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
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          hoverColor: 'hover:bg-red-100'
        },
        {
          icon: Calendar,
          label: 'Programări',
          href: '/appointments',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          hoverColor: 'hover:bg-green-100'
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
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          hoverColor: 'hover:bg-purple-100'
        },
        ...commonItems.slice(1)
      ];

    case 'hotel':
      return [
        ...commonItems.slice(0, 1),
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
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          hoverColor: 'hover:bg-green-100'
        },
        {
          icon: Hotel,
          label: 'Check-in/out',
          href: '/checkin',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          hoverColor: 'hover:bg-orange-100'
        },
        {
          icon: Star,
          label: 'Servicii',
          href: '/services',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          hoverColor: 'hover:bg-yellow-100'
        },
        {
          icon: Star,
          label: 'Recenzii',
          href: '/reviews',
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
          hoverColor: 'hover:bg-pink-100'
        },
        ...commonItems.slice(1)
      ];

    default:
      return commonItems;
  }
};
```

---

### **2. `/types/organization.ts`** (NOU)

```typescript
import { Timestamp } from 'firebase/firestore';

export type OrganizationType = 'camin' | 'gradinita' | 'spital' | 'hotel';
export type SubscriptionTier = 'standard' | 'premium' | 'gold';

export interface Organization {
  id: string;
  name: string;
  email: string;
  type: OrganizationType;
  createdAt: Timestamp;
  settings: {
    aiEnabled: boolean;
    subscription: SubscriptionTier;
    features: string[];
  };
}

export interface Location {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  type: OrganizationType;
  reprezentant: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: Timestamp;
}
```

---

### **3. `/lib/firestore.ts`** (UPDATE)

```typescript
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { Organization, Location, OrganizationType } from '@/types/organization';

// ===== ORGANIZATIONS =====

export const createOrganization = async (
  userId: string, 
  name: string, 
  email: string,
  type: OrganizationType
): Promise<void> => {
  const organizationRef = doc(db, 'organizations', userId);
  
  const organization: Omit<Organization, 'id'> = {
    name,
    email,
    type,
    createdAt: Timestamp.now(),
    settings: {
      aiEnabled: false,
      subscription: 'standard',
      features: []
    }
  };

  await setDoc(organizationRef, organization);
  console.log('✅ Organization created:', userId);
};

export const getOrganization = async (userId: string): Promise<Organization | null> => {
  const organizationRef = doc(db, 'organizations', userId);
  const organizationSnap = await getDoc(organizationRef);

  if (organizationSnap.exists()) {
    return {
      id: organizationSnap.id,
      ...organizationSnap.data()
    } as Organization;
  }

  return null;
};

// ===== LOCATIONS =====

export const createLocation = async (
  userId: string,
  locationData: Omit<Location, 'id' | 'organizationId' | 'createdAt'>
): Promise<string> => {
  const locationsRef = collection(db, 'organizations', userId, 'locations');
  const newLocationRef = doc(locationsRef);

  const location: Omit<Location, 'id'> = {
    ...locationData,
    organizationId: userId,
    createdAt: Timestamp.now()
  };

  await setDoc(newLocationRef, location);
  console.log('✅ Location created:', newLocationRef.id);
  
  return newLocationRef.id;
};

export const getLocations = async (userId: string): Promise<Location[]> => {
  const locationsRef = collection(db, 'organizations', userId, 'locations');
  const locationsSnap = await getDocs(locationsRef);

  return locationsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Location));
};

export const getLocation = async (
  userId: string, 
  locationId: string
): Promise<Location | null> => {
  const locationRef = doc(db, 'organizations', userId, 'locations', locationId);
  const locationSnap = await getDoc(locationRef);

  if (locationSnap.exists()) {
    return {
      id: locationSnap.id,
      ...locationSnap.data()
    } as Location;
  }

  return null;
};
```

---

### **4. `/lib/openai.ts`** (NOU)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// ===== MENIU GENERATOR =====

export interface MenuRequest {
  ingredients: string[];
  restrictions: string[];
  numberOfPeople: number;
  type: 'camin' | 'gradinita';
}

export const generateMenu = async (request: MenuRequest): Promise<string> => {
  const prompt = `
Generează un meniu zilnic pentru ${request.type === 'camin' ? 'cămin de bătrâni' : 'grădiniță'}.

Ingrediente disponibile: ${request.ingredients.join(', ')}
Restricții medicale/alergii: ${request.restrictions.join(', ')}
Număr persoane: ${request.numberOfPeople}

Returnează un meniu structurat astfel:
- Mic dejun (ora 8:00)
- Gustare (ora 10:00) - doar pentru grădiniță
- Prânz (ora 13:00): supă, fel principal, desert
- Gustare (ora 16:00)
- Cină (ora 19:00)

Pentru fiecare masă specifică:
- Rețeta
- Ingredientele necesare
- Valori nutriționale aproximative
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
};

// ===== DOCUMENT ANALYSIS =====

export const analyzeDocument = async (documentText: string): Promise<any> => {
  const prompt = `
Analizează următorul document medical și extrage informațiile cheie:

${documentText}

Returnează un JSON cu:
- diagnostic
- tratamente
- medicamente
- restricții
- observații
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || '{}');
};

// ===== CHATBOT ASSISTANT =====

export const chatWithAssistant = async (
  question: string,
  context: any
): Promise<string> => {
  const prompt = `
Ești un asistent virtual pentru o platformă de management ${context.type}.
Context: ${JSON.stringify(context)}

Întrebare: ${question}

Răspunde profesional și util.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
};
```

---

## 🔄 Flow-uri Principale

### **Flow 1: Înregistrare Nouă**
```
1. User → Homepage
2. Click "Înregistrare"
3. Completează: Nume firmă, Email, Parolă
4. Firebase Auth → Creare cont
5. Redirect → /register/select-type
6. Selectează tip organizație (cămin/grădiniță/spital/hotel)
7. Salvează în Firestore: organizations/{userId} cu type
8. Redirect → /dashboard-new
9. Dashboard afișat bazat pe type
```

### **Flow 2: Login Existent**
```
1. User → Login
2. Firebase Auth → Verificare
3. Citește type din Firestore
4. Redirect → /dashboard-new
5. Sidebar dinamic bazat pe type
```

### **Flow 3: Adăugare Location**
```
1. Dashboard → Click "Adaugă Cămin/Grădiniță/etc"
2. Formular generic (name, address, phone, etc)
3. Salvează în: organizations/{userId}/locations/{locationId}
4. Redirect → /locations/{id}
```

### **Flow 4: Generare Meniu AI**
```
1. Sidebar → Click "Meniu AI"
2. Input: ingrediente, restricții
3. Call OpenAI API
4. Display meniu generat
5. Opțiune: Salvează în Firebase
6. Opțiune: Generează PDF
```

---

## 🔐 Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=

# Stripe (viitor)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# Sentry (viitor)
NEXT_PUBLIC_SENTRY_DSN=
```

---

**Versiune:** 1.0  
**Data:** 22 Octombrie 2025
