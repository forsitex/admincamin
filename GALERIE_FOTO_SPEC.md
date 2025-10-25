# 📸 Galerie Foto Rezidenți - Specificații Implementare

## 🎯 Obiectiv
Sistem complet de galerie foto pentru fiecare rezident, cu acces securizat pentru aparținători.

---

## 👥 Roluri și Permisiuni

### **Administrator Cămin:**
- ✅ Upload imagini pentru orice rezident
- ✅ Ștergere imagini
- ✅ Organizare în albume/categorii
- ✅ Adăugare descrieri la poze
- ✅ Vizualizare toate galeriile

### **Aparținător:**
- ✅ Vizualizare DOAR galeria rezidentului său
- ✅ Download imagini
- ✅ Comentarii la poze (opțional)
- ❌ NU poate șterge sau uploada

---

## 🏗️ Structură Firebase

```
organizations/
  {userId}/
    locations/
      {locationId}/
        residents/
          {residentCnp}/
            - beneficiarNumeComplet
            - apartinatorEmail
            - apartinatorTelefon
            
            gallery/
              {photoId}/
                - url: string (Firebase Storage URL)
                - uploadedBy: string (admin userId)
                - uploadedAt: Timestamp
                - description: string
                - category: string (activitati | mese | kinetoterapie | evenimente | altele)
                - fileName: string
                - fileSize: number
                - thumbnailUrl: string (opțional)
            
            familyAccess/
              - email: string (apartinatorEmail)
              - password: string (hashed)
              - accessToken: string (pentru link direct)
              - createdAt: Timestamp
              - lastAccess: Timestamp
```

---

## 📁 Structură Firebase Storage

```
organizations/
  {userId}/
    residents/
      {residentCnp}/
        photos/
          original/
            {photoId}.jpg
          thumbnails/
            {photoId}_thumb.jpg
```

---

## 🎨 Features Implementare

### **1. Pagină Admin - Upload Foto**
**Locație:** `/residents/[cnp]/gallery`

**Funcționalități:**
- ✅ Upload multiple imagini (drag & drop)
- ✅ Preview înainte de upload
- ✅ Adăugare descriere și categorie
- ✅ Progress bar pentru upload
- ✅ Compresie automată imagini (max 2MB)
- ✅ Generare thumbnail automat
- ✅ Grid view cu toate pozele
- ✅ Filtrare după categorie și dată
- ✅ Ștergere cu confirmare

**UI:**
```
┌─────────────────────────────────────────┐
│  📸 Galerie Foto - [Nume Rezident]      │
├─────────────────────────────────────────┤
│  [Upload Poze]  [Categorii ▼]  [Filtre] │
├─────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │           │
│  └────┘ └────┘ └────┘ └────┘           │
│  Desc   Desc   Desc   Desc              │
│  [🗑️]   [🗑️]   [🗑️]   [🗑️]              │
└─────────────────────────────────────────┘
```

---

### **2. Portal Aparținători - Vizualizare Galerie**
**Locație:** `/family-portal/[accessToken]/gallery`

**Funcționalități:**
- ✅ Login cu email + parolă (generată de admin)
- ✅ SAU acces direct cu link unic (access token)
- ✅ Vizualizare galerie în grid
- ✅ Lightbox pentru poze mari
- ✅ Filtrare după dată și categorie
- ✅ Download individual sau bulk
- ✅ Slideshow automat
- ✅ Responsive (mobile-friendly)

**UI:**
```
┌─────────────────────────────────────────┐
│  👨‍👩‍👧 Portal Familie - [Nume Rezident]  │
├─────────────────────────────────────────┤
│  📸 Galerie Foto  |  📊 Rapoarte         │
├─────────────────────────────────────────┤
│  [Toate ▼]  [Sortare: Recente ▼]        │
├─────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │        │ │        │ │        │       │
│  │  📷    │ │  📷    │ │  📷    │       │
│  │        │ │        │ │        │       │
│  └────────┘ └────────┘ └────────┘       │
│  20.10.2025  19.10.2025  18.10.2025     │
│  Activități  Masă       Kinetoterapie   │
└─────────────────────────────────────────┘
```

---

### **3. Generare Acces Aparținător**
**Locație:** `/residents/[cnp]/settings` (tab "Acces Familie")

**Funcționalități:**
- ✅ Generare parolă automată (sau custom)
- ✅ Generare link unic de acces
- ✅ Trimitere email automat cu credențiale
- ✅ Trimitere SMS cu link (opțional)
- ✅ Resetare parolă
- ✅ Dezactivare acces temporar

**UI:**
```
┌─────────────────────────────────────────┐
│  🔐 Acces Portal Familie                │
├─────────────────────────────────────────┤
│  Email: ana.popa@email.com              │
│  Parolă: ••••••••  [Resetează]          │
│                                          │
│  Link Direct:                            │
│  https://app.com/family/abc123xyz        │
│  [📋 Copiază]  [📧 Trimite Email]        │
│                                          │
│  Status: ✅ Activ                        │
│  Ultima accesare: 20.10.2025, 14:30     │
│                                          │
│  [🔒 Dezactivează Acces]                │
└─────────────────────────────────────────┘
```

---

## 🔐 Securitate

### **Autentificare Aparținători:**
1. **Opțiunea 1: Email + Parolă**
   - Email = apartinatorEmail din Firebase
   - Parolă = generată de admin, hashed în DB
   - Session cu JWT token

2. **Opțiunea 2: Link Direct (recomandat)**
   - Access token unic generat pentru fiecare rezident
   - Format: `/family-portal/{accessToken}/gallery`
   - Token stocat în Firebase, verificat la fiecare request
   - Expirare opțională (ex: 6 luni)

### **Reguli Firebase Security:**
```javascript
// Firestore Rules
match /organizations/{orgId}/locations/{locId}/residents/{cnp}/gallery/{photoId} {
  // Admin poate totul
  allow read, write: if request.auth.uid == orgId;
  
  // Aparținător poate doar citi
  allow read: if request.auth.token.accessToken == resource.data.accessToken;
}

// Storage Rules
match /organizations/{orgId}/residents/{cnp}/photos/{allPaths=**} {
  // Admin poate totul
  allow read, write: if request.auth.uid == orgId;
  
  // Aparținător poate doar citi
  allow read: if request.auth.token.cnp == cnp;
}
```

---

## 📤 Upload Flow

### **Admin Upload:**
```
1. Admin selectează rezident
2. Drag & drop sau click pentru selectare imagini
3. Preview imagini + adăugare descrieri
4. Click "Upload"
5. Pentru fiecare imagine:
   a. Compresie (max 2MB)
   b. Upload la Firebase Storage (original)
   c. Generare thumbnail (300x300px)
   d. Upload thumbnail
   e. Salvare metadata în Firestore
6. Notificare aparținător (opțional): "Poze noi adăugate!"
```

### **Aparținător View:**
```
1. Aparținător primește email cu link
2. Click link → redirect la /family-portal/{token}/gallery
3. Verificare token în Firebase
4. Dacă valid → încărcare galerie
5. Dacă invalid → redirect la login
```

---

## 🎨 Categorii Poze

- 🎉 **Evenimente** - zile de naștere, sărbători
- 🍽️ **Mese** - prânz, cină
- 🏃 **Activități** - kinetoterapie, plimbări
- 🎨 **Creativitate** - pictură, artizanat
- 👥 **Social** - vizite, interacțiuni
- 🏥 **Medical** - consultații (cu permisiune)
- 📸 **Altele**

---

## 📧 Notificări

### **Email către Aparținător:**
```
Subiect: Poze noi cu [Nume Rezident]

Bună ziua,

Au fost adăugate 5 poze noi cu [Nume Rezident] în galeria foto.

Categorii: Activități (3), Mese (2)
Data: 20.10.2025

Vizualizați galeria: [Link Direct]

Cu stimă,
Echipa [Nume Cămin]
```

### **SMS (opțional):**
```
Poze noi cu [Nume]: 5 imagini adăugate.
Vezi aici: [Link Scurt]
```

---

## 🚀 Faze Implementare

### **Faza 1: Backend & Storage** (2-3 ore)
- [ ] Configurare Firebase Storage
- [ ] Structură Firestore pentru galerie
- [ ] API upload imagini
- [ ] API generare thumbnail
- [ ] Security rules

### **Faza 2: Admin Interface** (3-4 ore)
- [ ] Pagină galerie per rezident
- [ ] Upload multiple cu drag & drop
- [ ] Grid view cu poze
- [ ] Ștergere poze
- [ ] Filtrare și sortare

### **Faza 3: Portal Aparținători** (3-4 ore)
- [ ] Sistem autentificare (token-based)
- [ ] Pagină galerie pentru aparținători
- [ ] Lightbox pentru poze mari
- [ ] Download imagini
- [ ] Responsive design

### **Faza 4: Notificări & Polish** (2 ore)
- [ ] Email notificări
- [ ] SMS notificări (opțional)
- [ ] Loading states
- [ ] Error handling
- [ ] Testing

**Total estimat: 10-13 ore**

---

## 🎯 Nice-to-Have (Viitor)

- 📹 **Video clips** (max 30 sec)
- 💬 **Comentarii** aparținători la poze
- ❤️ **Reactions** (like, love)
- 📊 **Statistici** (poze vizualizate, downloads)
- 🎨 **Albume tematice** (Vară 2025, Crăciun 2024)
- 🔔 **Push notifications** (mobile app)
- 🖼️ **Slideshow automat** pentru TV în cămin
- 🎁 **Generare album PDF** pentru print

---

## 📱 Tehnologii

- **Frontend:** Next.js 16 + TypeScript + Tailwind
- **Backend:** Firebase (Firestore + Storage + Auth)
- **Upload:** React Dropzone
- **Compresie:** Browser-image-compression
- **Lightbox:** Yet-another-react-lightbox
- **Notificări:** Nodemailer (email) + Twilio (SMS)

---

## 💰 Costuri Firebase

**Storage:**
- 5GB gratuit/lună
- $0.026/GB peste limită
- Estimat: 100 poze/rezident × 2MB = 200MB/rezident
- 50 rezidenți = 10GB = ~$0.13/lună

**Bandwidth:**
- 1GB gratuit/lună download
- $0.12/GB peste limită
- Estimat: 100 views/lună × 2MB = 200MB = gratuit

**Total estimat: <$1/lună pentru 50 rezidenți**

---

## ✅ Checklist Final

- [ ] Upload imagini funcțional
- [ ] Galerie admin completă
- [ ] Portal aparținători funcțional
- [ ] Autentificare securizată
- [ ] Notificări email
- [ ] Responsive design
- [ ] Testing complet
- [ ] Documentație utilizator
- [ ] Deploy producție

---

**Creat:** 25.10.2025  
**Autor:** Echipa iEmpathy  
**Status:** 📋 Specificații Complete - Ready for Implementation
