# 📘 Ghid: Cum să Adaugi un Rol Nou

## 🎯 Sistem Unificat de Roluri

Sistemul folosește **un singur fișier centralizat** pentru gestionarea rolurilor: `/lib/user-roles.ts`

---

## ✅ Pași pentru Adăugare Rol Nou

### 1️⃣ Adaugă Rolul în `user-roles.ts`

```typescript
export type UserRole = 
  | 'admin'
  | 'educatoare'
  | 'manager-camin'    // ← ADAUGĂ AICI
  | 'doctor'           // ← SAU AICI
  // ... alte roluri
```

### 2️⃣ Configurează Dashboard-ul pentru Rol

```typescript
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  'admin': '/dashboard-new',
  'educatoare': '/dashboard-educatoare',
  'manager-camin': '/dashboard-manager-camin',  // ← ADAUGĂ AICI
  'doctor': '/dashboard-doctor',                // ← SAU AICI
  // ...
};
```

### 3️⃣ Configurează Colecția Firebase

```typescript
const ROLE_COLLECTIONS: Record<UserRole, string> = {
  'admin': 'organizations',
  'educatoare': 'educatoare',
  'manager-camin': 'managers',  // ← ADAUGĂ AICI
  'doctor': 'doctors',          // ← SAU AICI
  // ...
};
```

### 4️⃣ Creează Dashboard-ul Specific

Creează fișierul: `/app/dashboard-manager-camin/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { getUserRole } from '@/lib/user-roles';

export default function DashboardManagerCaminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    verificaAutentificare();
  }, []);

  const verificaAutentificare = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Obține datele utilizatorului
      const data = await getUserRole();
      
      // Verifică dacă are rolul corect
      if (!data || data.role !== 'manager-camin') {
        router.push('/login');
        return;
      }

      setUserData(data);
      setLoading(false);

    } catch (error) {
      console.error('Eroare verificare:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <h1>Dashboard Manager Cămin</h1>
      <p>Bine ai venit, {userData.email}!</p>
      {/* Restul conținutului */}
    </div>
  );
}
```

### 5️⃣ Creează Document în Firebase

Când adaugi un manager, creează documentul în Firestore:

```typescript
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Exemplu: Adăugare manager cămin
await setDoc(doc(db, 'managers', userUid), {
  email: 'manager@email.com',
  role: 'manager-camin',
  organizationId: 'owner-uid',      // UID-ul owner-ului firmei
  locationId: 'camin-id',           // ID-ul căminului
  permissions: [
    'view_residents',
    'add_residents',
    'edit_residents',
    'view_reports'
  ],
  createdAt: new Date()
});
```

---

## 📋 Exemplu Complet: Adăugare "Doctor"

### Pas 1: Modifică `user-roles.ts`

```typescript
export type UserRole = 
  | 'admin'
  | 'educatoare'
  | 'doctor'  // ← ADĂUGAT
  // ...

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  'admin': '/dashboard-new',
  'educatoare': '/dashboard-educatoare',
  'doctor': '/dashboard-doctor',  // ← ADĂUGAT
  // ...
};

const ROLE_COLLECTIONS: Record<UserRole, string> = {
  'admin': 'organizations',
  'educatoare': 'educatoare',
  'doctor': 'doctors',  // ← ADĂUGAT
  // ...
};
```

### Pas 2: Creează `/app/dashboard-doctor/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getUserRole } from '@/lib/user-roles';
import { Stethoscope, Users, Calendar, FileText } from 'lucide-react';

export default function DashboardDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<any>(null);

  useEffect(() => {
    verificaAutentificare();
  }, []);

  const verificaAutentificare = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    const data = await getUserRole();
    
    if (!data || data.role !== 'doctor') {
      router.push('/login');
      return;
    }

    setDoctorData(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🩺 Dashboard Doctor
          </h1>
          <p className="text-sm text-gray-600">{doctorData.email}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <Stethoscope className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold">Consultații</h3>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold">Pacienți</h3>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold">Programări</h3>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <FileText className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-semibold">Rețete</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Pas 3: Adaugă Doctor în Firebase

```typescript
// În pagina de administrare (admin)
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function adaugaDoctor(email: string, password: string, clinicaId: string) {
  try {
    // 1. Creează cont Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );

    // 2. Salvează în colecția 'doctors'
    await setDoc(doc(db, 'doctors', userCredential.user.uid), {
      email: email,
      role: 'doctor',
      organizationId: auth.currentUser!.uid,  // UID-ul admin-ului
      locationId: clinicaId,
      departmentId: 'cardiologie',  // Opțional
      permissions: [
        'view_patients',
        'add_consultations',
        'prescribe_medication',
        'view_medical_history'
      ],
      createdAt: new Date()
    });

    console.log('✅ Doctor adăugat cu succes!');
  } catch (error) {
    console.error('❌ Eroare adăugare doctor:', error);
  }
}
```

---

## 🔐 Verificare Permisiuni

Folosește funcția `hasPermission()` pentru a verifica permisiuni:

```typescript
import { hasPermission } from '@/lib/user-roles';

// În componenta ta
const canDeletePatients = await hasPermission('delete_patients');

if (canDeletePatients) {
  // Afișează buton ștergere
}
```

---

## 🎨 Verificare Rol în Componente

```typescript
import { getUserRole, hasRole, hasAnyRole } from '@/lib/user-roles';

// Verifică un singur rol
if (await hasRole('doctor')) {
  // Logică specifică doctor
}

// Verifică multiple roluri
if (await hasAnyRole(['admin', 'manager-camin'])) {
  // Logică pentru admin sau manager
}

// Obține toate datele
const userData = await getUserRole();
console.log(userData.role);           // 'doctor'
console.log(userData.organizationId); // UID owner
console.log(userData.locationId);     // ID clinică
console.log(userData.permissions);    // Array permisiuni
```

---

## 📊 Structură Firebase Recomandată

```
organizations/{ownerId}/
  - name, email, type, createdAt
  
  locations/{locationId}/
    - name, address, capacity
    
    children/{cnp}/        (pentru grădinițe)
    residents/{cnp}/       (pentru cămine)
    patients/{cnp}/        (pentru clinici)

doctors/{doctorUid}/
  - email
  - role: 'doctor'
  - organizationId: ownerId
  - locationId: clinicaId
  - departmentId: 'cardiologie'
  - permissions: []

managers/{managerUid}/
  - email
  - role: 'manager-camin' sau 'manager-clinica'
  - organizationId: ownerId
  - locationId: caminId sau clinicaId
  - permissions: []

educatoare/{educatoareUid}/
  - email
  - role: 'educatoare'
  - organizationId: ownerId
  - locationId: gradinitaId
  - grupaId: 'grupa-1'
  - permissions: []
```

---

## ✅ Avantaje Sistem Unificat

1. **Un singur loc** pentru configurare roluri
2. **Adăugare rol nou** = 3 linii de cod în `user-roles.ts`
3. **Login automat** - detectează rolul și redirectează corect
4. **Protecție automată** - dashboard-urile verifică rolul
5. **Ușor de întreținut** - nu mai modifici 12+ fișiere
6. **Scalabil** - poți adăuga 100 de roluri fără probleme

---

## 🚀 Următorii Pași

După ce adaugi un rol nou:

1. ✅ Testează login-ul
2. ✅ Testează redirect-ul la dashboard corect
3. ✅ Testează protecția dashboard-ului (nu permite alte roluri)
4. ✅ Testează permisiunile
5. ✅ Adaugă documentație în acest fișier

---

## 📞 Suport

Dacă ai întrebări despre adăugarea unui rol nou, verifică:
- `/lib/user-roles.ts` - Sistem central de roluri
- `/app/dashboard-educatoare/page.tsx` - Exemplu dashboard rol
- `/app/login/page.tsx` - Exemplu login cu sistem unificat
