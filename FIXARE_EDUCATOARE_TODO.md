# 🔧 Lista Fișiere de Fixat - Suport Educatoare

## ❌ Problema

Multe fișiere folosesc `user.uid` direct în loc să verifice dacă utilizatorul este educatoare.

## ✅ Soluție

Folosește helper-ul `getOrgAndLocation()` din `/lib/firebase-helpers.ts`

```typescript
import { getOrgAndLocation } from '@/lib/firebase-helpers';

// Înlocuiește:
const organizationId = user.uid;
const locationId = gradinitaId;

// Cu:
const orgData = await getOrgAndLocation(gradinitaId);
const { organizationId, locationId } = orgData;
```

---

## 📋 Fișiere de Fixat

### ✅ FIXATE

- [x] `/app/gradinite/[id]/grupe/[grupaId]/letters/[letterId]/edit/page.tsx`

### ❌ DE FIXAT (Prioritate ÎNALTĂ)

#### 1. **Activități**
- [ ] `/app/activities/page.tsx`
  - Linia 42: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 63: `collection(db, 'organizations', user.uid, 'locations', location.id, 'activities')`
  - Linia 99: `deleteDoc(doc(db, 'organizations', user.uid, 'locations', locationId, 'activities', activityId))`

- [ ] `/app/activities/add/page.tsx`
  - Verifică dacă e educatoare (liniile 58-62) - DEJA IMPLEMENTAT CORECT ✅

#### 2. **Copii - Adăugare/Editare**
- [ ] `/app/children/add/page.tsx`
  - Linia 87: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 174: `doc(db, 'organizations', user.uid, 'locations', formData.gradinitaId, 'children', formData.cnp)`

- [ ] `/app/children/[cnp]/edit/page.tsx`
  - Linia 88: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 101: `doc(db, 'organizations', user.uid, 'locations', location.id, 'children', cnp)`
  - Linia 181: `doc(db, 'organizations', user.uid, 'locations', locationId, 'children', cnp)`

#### 3. **Rapoarte Zilnice**
- [ ] `/app/children/[cnp]/daily-report/page.tsx`
  - Linia 75: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 82: `doc(db, 'organizations', user.uid, 'locations', locationDoc.id, 'children', cnp)`
  - Linia 96: `doc(db, 'organizations', user.uid, 'locations', locationId, 'children', cnp, 'dailyReports', selectedDate)`
  - Linia 150: `collection(db, 'organizations', user.uid, 'locations', locationId, 'children', cnp, 'dailyReports')`
  - Linia 169: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 174: `doc(db, 'organizations', user.uid, 'locations', locationDoc.id, 'children', cnp)`
  - Linia 188: `doc(db, 'organizations', user.uid, 'locations', locationId, 'children', cnp, 'dailyReports', selectedDate)`

- [ ] `/app/children/[cnp]/daily-reports-history/page.tsx`
  - Linia 44: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 51: `doc(db, 'organizations', user.uid, 'locations', locationDoc.id, 'children', cnp)`
  - Linia 71: `collection(db, 'organizations', user.uid, 'locations', foundLocationId, 'children', cnp, 'dailyReports')`

#### 4. **Prezență**
- [ ] `/app/children/[cnp]/attendance/page.tsx`
  - Linia 58: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 65: `doc(db, 'organizations', user.uid, 'locations', locationDoc.id, 'children', cnp)`
  - Multiple referințe la attendance

- [ ] `/app/children/[cnp]/attendance-history/page.tsx`
  - Linia 42: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 49: `doc(db, 'organizations', user.uid, 'locations', locationDoc.id, 'children', cnp)`
  - Linia 73: `doc(db, 'organizations', user.uid, 'locations', foundLocationId, 'children', cnp, 'attendance', day)`

#### 5. **Rapoarte Financiare**
- [ ] `/app/reports/financial/page.tsx`
  - Linia 47: `collection(db, 'organizations', user.uid, 'locations')`
  - Linia 65: `collection(db, 'organizations', user.uid, 'locations', location.id, 'children')`

---

## 🎯 Pattern de Refactorizare

### Înainte:
```typescript
const user = auth.currentUser;
if (!user) return;

const childRef = doc(
  db, 
  'organizations', 
  user.uid,  // ❌ GREȘIT
  'locations', 
  gradinitaId, 
  'children', 
  cnp
);
```

### După:
```typescript
import { getOrgAndLocation } from '@/lib/firebase-helpers';

const user = auth.currentUser;
if (!user) return;

const orgData = await getOrgAndLocation(gradinitaId);
if (!orgData) return;

const childRef = doc(
  db, 
  'organizations', 
  orgData.organizationId,  // ✅ CORECT
  'locations', 
  orgData.locationId,      // ✅ CORECT
  'children', 
  cnp
);
```

---

## 📊 Progres

- **Total fișiere**: ~15
- **Fixate**: 1
- **Rămase**: 14

---

## ⚠️ Note Importante

1. **NU ȘTERGE** cod vechi până nu testezi noul cod
2. **TESTEAZĂ** fiecare fișier după modificare
3. **VERIFICĂ** că funcționează pentru:
   - ✅ Admin (owner firmă)
   - ✅ Educatoare
4. Folosește `getOrgAndLocation(locationIdFromUrl)` în toate cazurile

---

## 🚀 Următorii Pași

1. Fixează fișierele în ordinea priorității
2. Testează fiecare funcționalitate
3. Marchează ca ✅ în această listă
4. Șterge acest fișier când totul e gata
