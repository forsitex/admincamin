# ✅ Task List - Multi-Industry Platform

## 🎯 Prioritate MAXIMĂ (Săptămâna 1)

### **1. Refactorizare Firebase Structure**
- [ ] **Task 1.1:** Redenumire collection `companies` → `organizations`
  - Fișiere de modificat:
    - `/lib/firestore.ts`
    - `/app/register/page.tsx`
    - `/app/dashboard-new/page.tsx`
    - `/app/camine/add/page.tsx`
  - Estimare: 2 ore

- [ ] **Task 1.2:** Adăugare câmp `type` în organization
  - Schema nouă:
    ```typescript
    interface Organization {
      name: string;
      email: string;
      type: 'camin' | 'gradinita' | 'spital' | 'hotel';
      createdAt: Timestamp;
      settings: {
        aiEnabled: boolean;
        subscription: 'standard' | 'premium' | 'gold';
      }
    }
    ```
  - Estimare: 1 oră

- [ ] **Task 1.3:** Redenumire subcollection `camine` → `locations`
  - Update toate referințele
  - Migrare date existente
  - Estimare: 3 ore

- [ ] **Task 1.4:** Salvare tip organizație la înregistrare
  - Update `/app/register/select-type/page.tsx`
  - Salvare în Firestore
  - Estimare: 1 oră

---

## 🎨 Prioritate MARE (Săptămâna 2)

### **2. Sidebar Dinamic**
- [ ] **Task 2.1:** Creare funcție `getSidebarConfig(type)`
  - Fișier nou: `/lib/sidebar-config.ts`
  - Return sidebar items bazat pe tip
  - Estimare: 2 ore

- [ ] **Task 2.2:** Update `Sidebar.tsx` să folosească config dinamic
  - Citește tip din localStorage/Firebase
  - Render sidebar dinamic
  - Estimare: 2 ore

- [ ] **Task 2.3:** Adăugare iconuri noi
  - Import iconuri Lucide pentru toate industriile
  - Estimare: 1 oră

- [ ] **Task 2.4:** Testing sidebar pentru toate tipurile
  - Test manual pentru fiecare industrie
  - Estimare: 1 oră

---

### **3. Dashboard per Industrie**
- [ ] **Task 3.1:** Template Dashboard Cămin (existent, doar refactor)
  - Estimare: 1 oră

- [ ] **Task 3.2:** Template Dashboard Grădiniță
  - Fișier: `/app/dashboard-gradinita/page.tsx`
  - Statistici: copii, activități, prezență
  - Estimare: 4 ore

- [ ] **Task 3.3:** Template Dashboard Spital
  - Fișier: `/app/dashboard-spital/page.tsx`
  - Statistici: pacienți, programări, tratamente
  - Estimare: 4 ore

- [ ] **Task 3.4:** Template Dashboard Hotel
  - Fișier: `/app/dashboard-hotel/page.tsx`
  - Statistici: rezervări, ocupare, revenue
  - Estimare: 4 ore

---

## 🚀 Prioritate MEDIE (Săptămâna 3-4)

### **4. Formulare Specifice per Industrie**

#### **Grădiniță**
- [ ] **Task 4.1:** Formular Adăugare Copil
  - Fișier: `/app/children/add/page.tsx`
  - Câmpuri: nume, CNP, dată naștere, părinți, alergii
  - Estimare: 6 ore

- [ ] **Task 4.2:** Formular Activități
  - Fișier: `/app/activities/add/page.tsx`
  - Câmpuri: nume activitate, descriere, copii participanți
  - Estimare: 4 ore

#### **Spital**
- [ ] **Task 4.3:** Formular Adăugare Pacient
  - Fișier: `/app/patients/add/page.tsx`
  - Câmpuri: nume, CNP, diagnostic, tratamente
  - Estimare: 6 ore

- [ ] **Task 4.4:** Formular Programări
  - Fișier: `/app/appointments/add/page.tsx`
  - Câmpuri: pacient, dată, oră, doctor, tip consultație
  - Estimare: 4 ore

#### **Hotel**
- [ ] **Task 4.5:** Formular Rezervare
  - Fișier: `/app/reservations/add/page.tsx`
  - Câmpuri: client, check-in, check-out, cameră, servicii
  - Estimare: 6 ore

- [ ] **Task 4.6:** Formular Camere
  - Fișier: `/app/rooms/add/page.tsx`
  - Câmpuri: număr cameră, tip, preț, facilități
  - Estimare: 4 ore

---

## 🤖 Prioritate MEDIE-SCĂZUTĂ (Săptămâna 5-6)

### **5. AI Integration**

- [ ] **Task 5.1:** Setup OpenAI API
  - Creare cont OpenAI
  - Setup API keys în `.env`
  - Fișier: `/lib/openai.ts`
  - Estimare: 2 ore

- [ ] **Task 5.2:** Meniu Generator AI
  - Fișier: `/app/menu-ai/page.tsx`
  - Input: ingrediente, restricții
  - Output: meniu zilnic
  - Estimare: 8 ore

- [ ] **Task 5.3:** Document Analysis AI
  - Fișier: `/app/ai-analysis/page.tsx`
  - Upload document → Extract info
  - Estimare: 10 ore

- [ ] **Task 5.4:** Chatbot Assistant
  - Fișier: `/components/ChatbotWidget.tsx`
  - Widget floating în colț
  - Răspunde la întrebări
  - Estimare: 12 ore

- [ ] **Task 5.5:** Predictive Analytics
  - Fișier: `/app/ai-predictions/page.tsx`
  - Prezice ocupare, costuri
  - Estimare: 10 ore

---

## 📄 Prioritate SCĂZUTĂ (Săptămâna 7-8)

### **6. PDF Generation per Industrie**

#### **Cămin (16 documente)**
- [ ] **Task 6.1:** Template Contract Cămin
  - Folosește date din Firebase
  - Estimare: 4 ore

- [ ] **Task 6.2:** Template Cerere Admitere
  - Estimare: 2 ore

- [ ] **Task 6.3:** Template Fișă Intrare
  - Estimare: 2 ore

- [ ] **Task 6.4-6.16:** Restul documentelor (13 bucăți)
  - Estimare: 20 ore total

#### **Grădiniță**
- [ ] **Task 6.17:** Template Contract Grădiniță
  - Estimare: 4 ore

- [ ] **Task 6.18:** Template Fișă Copil
  - Estimare: 2 ore

#### **Spital**
- [ ] **Task 6.19:** Template Fișă Pacient
  - Estimare: 4 ore

- [ ] **Task 6.20:** Template Rețetă
  - Estimare: 2 ore

#### **Hotel**
- [ ] **Task 6.21:** Template Confirmare Rezervare
  - Estimare: 3 ore

- [ ] **Task 6.22:** Template Factură
  - Estimare: 3 ore

---

## 🧪 Testing & QA (Săptămâna 9)

### **7. Testing Complet**
- [ ] **Task 7.1:** Testing flow Cămin
  - Register → Select Type → Dashboard → Add Location → Add Resident
  - Estimare: 4 ore

- [ ] **Task 7.2:** Testing flow Grădiniță
  - Register → Select Type → Dashboard → Add Location → Add Child
  - Estimare: 4 ore

- [ ] **Task 7.3:** Testing flow Spital
  - Register → Select Type → Dashboard → Add Location → Add Patient
  - Estimare: 4 ore

- [ ] **Task 7.4:** Testing flow Hotel
  - Register → Select Type → Dashboard → Add Location → Add Reservation
  - Estimare: 4 ore

- [ ] **Task 7.5:** Testing AI Features
  - Meniu AI, Document Analysis, Chatbot
  - Estimare: 6 ore

- [ ] **Task 7.6:** Bug Fixes
  - Fix toate bug-urile găsite
  - Estimare: 10 ore

---

## 🎨 UI/UX Polish (Săptămâna 10)

### **8. Design Improvements**
- [ ] **Task 8.1:** Responsive design pentru toate paginile
  - Mobile, Tablet, Desktop
  - Estimare: 8 ore

- [ ] **Task 8.2:** Animații și tranziții
  - Smooth transitions
  - Loading states
  - Estimare: 4 ore

- [ ] **Task 8.3:** Dark mode (opțional)
  - Toggle dark/light
  - Estimare: 6 ore

- [ ] **Task 8.4:** Accessibility (A11y)
  - ARIA labels
  - Keyboard navigation
  - Estimare: 4 ore

---

## 📱 Mobile App (Viitor - Lună 3-4)

### **9. React Native App**
- [ ] **Task 9.1:** Setup React Native project
- [ ] **Task 9.2:** Authentication
- [ ] **Task 9.3:** Dashboard mobile
- [ ] **Task 9.4:** Forms mobile
- [ ] **Task 9.5:** Push notifications
- [ ] **Task 9.6:** Offline mode
- [ ] **Task 9.7:** QR code scanning

---

## 📊 Analytics & Monitoring (Săptămâna 11)

### **10. Analytics Setup**
- [ ] **Task 10.1:** Google Analytics 4
  - Track user behavior
  - Estimare: 2 ore

- [ ] **Task 10.2:** Sentry Error Tracking
  - Monitor errors
  - Estimare: 2 ore

- [ ] **Task 10.3:** Performance Monitoring
  - Lighthouse scores
  - Estimare: 2 ore

---

## 🚀 Deployment & Launch (Săptămâna 12)

### **11. Production Deployment**
- [ ] **Task 11.1:** Environment variables setup
- [ ] **Task 11.2:** Vercel deployment
- [ ] **Task 11.3:** Custom domain
- [ ] **Task 11.4:** SSL certificate
- [ ] **Task 11.5:** CDN setup
- [ ] **Task 11.6:** Backup strategy

### **12. Documentation**
- [ ] **Task 12.1:** User documentation
- [ ] **Task 12.2:** Video tutorials
- [ ] **Task 12.3:** API documentation
- [ ] **Task 12.4:** FAQ

### **13. Marketing**
- [ ] **Task 13.1:** Landing page
- [ ] **Task 13.2:** Social media
- [ ] **Task 13.3:** Email campaign
- [ ] **Task 13.4:** Partnerships

---

## 📈 Estimare Totală

- **Total ore:** ~250 ore
- **Total săptămâni:** 12 săptămâni
- **Echipă:** 2 developeri
- **Timeline:** 3 luni

---

**Status:** 🟡 In Progress  
**Ultima actualizare:** 22 Octombrie 2025
