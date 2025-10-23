# 🤖 AI Setup - iEmpathy Platform

**Data creării:** 23 Octombrie 2025  
**Feature:** Completare Automată Contracte Custom cu AI  
**Status:** 📋 Documentație Completă

---

## 🎯 OBIECTIV

Implementare sistem AI pentru **detectare automată și completare contracte custom** pentru toate cele 4 industrii:
- 🏥 Cămin Bătrâni
- 🎨 Grădiniță
- ❤️ Spital/Clinică
- 🏨 Hotel/Pensiune

---

## 📦 CE AI AVEM NEVOIE

### **UN SINGUR API: OpenAI**

#### **Model Specific:**
```
GPT-4o (cu Vision capabilities)
```

#### **De ce GPT-4o?**
✅ Poate analiza **imagini/PDF-uri**  
✅ Poate procesa **text**  
✅ **UN singur model** pentru tot  
✅ Cel mai nou și performant  
✅ Înțelege context și semantică  

---

## 🔧 SETUP COMPLET - Pas cu Pas

### **1. Creare Cont OpenAI**

```
1. Mergi pe: https://platform.openai.com/signup
2. Înregistrare cu email
3. Verificare email
4. Adaugă metodă de plată (card de credit/debit)
```

### **2. Generare API Key**

```
1. Dashboard → API Keys
2. Click "Create new secret key"
3. Nume: "iEmpathy Production"
4. Copiază cheia: sk-proj-xxxxxxxxxxxxx
5. ⚠️ IMPORTANT: Salvează imediat (nu se mai afișează!)
```

### **3. Configurare în Proiect**

#### **A. Adaugă în `.env.local`:**
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

#### **B. Instalează Package:**
```bash
npm install openai
```

#### **C. Creare Client (utils):**
```typescript
// /lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

---

## 💰 COSTURI EXACTE

### **Pricing GPT-4o:**

| Tip | Cost per 1M tokens |
|-----|-------------------|
| **Input** | $2.50 |
| **Output** | $10.00 |

### **Ce înseamnă un token?**
```
~4 caractere = 1 token
~750 cuvinte = 1,000 tokens
1 pagină PDF = ~2,000 tokens
```

---

## 📊 CALCUL COSTURI PENTRU FEATURE CONTRACTE

### **Scenariul: 10 Firme cu Cămine**

#### **A. Setup Inițial (o singură dată):**

```
Operație: Analiză template-uri custom

Per document:
- Input: ~2,000 tokens (imagine PDF)
- Output: ~500 tokens (JSON mapping)
- Cost input: 2,000 × $2.50 / 1M = $0.005
- Cost output: 500 × $10.00 / 1M = $0.005
- TOTAL: $0.01 per document

Per firmă (16 documente):
- 16 × $0.01 = $0.16/firmă

Total 10 firme:
- 10 × $0.16 = $1.60 (setup inițial, o singură dată)
```

#### **B. Generare Lunară (recurent):**

```
Operație: Completare PDF-uri cu date rezident

COST AI: $0 (ZERO!)

Explicație:
- Mapping-ul e salvat în Firebase (din setup)
- Generarea PDF se face cu pdf-lib (JavaScript, local)
- NU mai apelăm OpenAI pentru fiecare rezident
- Doar citim template-ul și completăm câmpurile
```

---

## 📈 COSTURI LA SCALARE

| Firme | Documente | Setup Inițial | Cost Lunar | An 1 |
|-------|-----------|---------------|------------|------|
| **10** | 160 | $1.60 | $0 | **$1.60** |
| **50** | 800 | $8.00 | $0 | **$8.00** |
| **100** | 1,600 | $16.00 | $0 | **$16.00** |
| **500** | 8,000 | $80.00 | $0 | **$80.00** |
| **1,000** | 16,000 | $160.00 | $0 | **$160.00** |

### **Observații:**
- Setup = o singură dată per firmă
- Lunar = $0 (generare locală)
- Scalabil la mii de firme cu costuri minime

---

## 🔄 FLOW TEHNIC COMPLET

### **1. Setup Template (o singură dată per firmă)**

```typescript
// User uploadează contract.pdf în /settings/templates

// 1. Conversie PDF → Base64
const pdfBase64 = await convertPdfToBase64(file);

// 2. API Call către OpenAI
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{
    role: "user",
    content: [
      {
        type: "text",
        text: `Analizează acest contract și identifică poziția câmpurilor:
        - Nume beneficiar/rezident/copil/pacient
        - CNP
        - Data nașterii
        - Adresa
        - Telefon
        - Contact urgență/Aparținător
        
        Returnează JSON cu format:
        {
          "fields": [
            {
              "name": "nume_beneficiar",
              "label": "Nume beneficiar:",
              "page": 1,
              "position": "approximate coordinates or description"
            }
          ]
        }`
      },
      {
        type: "image_url",
        image_url: {
          url: `data:application/pdf;base64,${pdfBase64}`
        }
      }
    ]
  }],
  max_tokens: 1000
});

// 3. Parse răspuns
const mapping = JSON.parse(response.choices[0].message.content);

// 4. Salvare în Firebase
await setDoc(doc(db, `organizations/${userId}/templates/${templateId}`), {
  name: "Contract Cămin Fortunei",
  pdfUrl: uploadedPdfUrl,
  fieldMapping: mapping.fields,
  createdAt: serverTimestamp(),
  type: 'camin' // sau gradinita/spital/hotel
});

// COST: $0.01 per document
```

---

### **2. Generare Contract Completat (pentru fiecare rezident)**

```typescript
// User adaugă rezident nou

// 1. Citire mapping din Firebase (GRATUIT)
const templateDoc = await getDoc(
  doc(db, `organizations/${userId}/templates/${templateId}`)
);
const template = templateDoc.data();

// 2. Citire date rezident (GRATUIT)
const residentDoc = await getDoc(
  doc(db, `organizations/${userId}/locations/${locationId}/residents/${cnp}`)
);
const resident = residentDoc.data();

// 3. Încărcare PDF template (GRATUIT)
const pdfBytes = await fetch(template.pdfUrl).then(r => r.arrayBuffer());
const pdfDoc = await PDFDocument.load(pdfBytes);

// 4. Completare câmpuri cu pdf-lib (GRATUIT)
const pages = pdfDoc.getPages();

for (const field of template.fieldMapping) {
  const page = pages[field.page - 1];
  const value = resident[field.name]; // ex: resident.nume
  
  page.drawText(value || '', {
    x: field.x || 100,
    y: field.y || 500,
    size: 12,
    color: rgb(0, 0, 0)
  });
}

// 5. Salvare PDF completat (GRATUIT)
const completedPdfBytes = await pdfDoc.save();

// Upload în Firebase Storage
const storageRef = ref(storage, `contracts/${userId}/${cnp}/${templateId}.pdf`);
await uploadBytes(storageRef, completedPdfBytes);

// COST AI: $0 (ZERO - totul e local!)
```

---

## 🛠️ IMPLEMENTARE - Fișiere Necesare

### **Structură Propusă:**

```
/app/settings/templates/
  - page.tsx                    # Pagină gestionare template-uri
  - upload/page.tsx             # Upload contract nou

/app/api/
  - analyze-contract/route.ts   # Analiză AI contract
  - generate-contract/route.ts  # Generare PDF completat

/lib/
  - openai.ts                   # Client OpenAI
  - pdf-utils.ts                # Utilități PDF (pdf-lib)

/components/templates/
  - TemplateList.tsx            # Lista template-uri
  - TemplateUpload.tsx          # Form upload
  - TemplateMappingEditor.tsx   # Editor mapping câmpuri
  - TemplatePreview.tsx         # Preview PDF
```

---

## 📋 STRUCTURĂ FIREBASE

### **Template-uri Custom:**

```
organizations/
  {userId}/
    templates/
      {templateId}/
        - name: "Contract Cămin Fortunei"
        - type: "camin" | "gradinita" | "spital" | "hotel"
        - pdfUrl: "gs://bucket/templates/template.pdf"
        - fieldMapping: [
            {
              name: "nume_beneficiar",
              label: "Nume beneficiar:",
              page: 1,
              x: 120,
              y: 450,
              width: 200
            },
            {
              name: "cnp",
              label: "CNP:",
              page: 1,
              x: 120,
              y: 480,
              width: 150
            }
          ]
        - createdAt: Timestamp
        - isActive: boolean
```

---

## 🎯 FEATURES IMPLEMENTATE

### **Pagină Gestionare Template-uri:**

```
/settings/templates

✅ Lista template-uri existente
✅ Upload contract nou (PDF)
✅ Analiză automată cu AI
✅ Preview mapping detectat
✅ Editare manuală mapping (drag & drop)
✅ Testare cu date dummy
✅ Activare/dezactivare template
✅ Ștergere template
```

### **Flow Utilizare:**

```
1. User → Settings → Templates
2. Click "Upload Contract Nou"
3. Selectează PDF (contract custom)
4. AI analizează automat (5-10 secunde)
5. Afișare preview cu câmpuri detectate
6. User verifică/ajustează mapping
7. Salvare template
8. La adăugare rezident → Dropdown "Selectează template"
9. Generare automată PDF completat (instant)
10. Download/Print PDF
```

---

## 💡 EXEMPLE PROMPT-URI

### **1. Analiză Contract Cămin:**

```
Analizează acest contract de internare în cămin și identifică:
- Nume complet beneficiar
- CNP beneficiar
- Data nașterii
- Adresa completă
- Telefon beneficiar
- Nume aparținător
- Telefon aparținător
- Data semnării contractului

Pentru fiecare câmp, returnează:
- name: identificator unic (ex: "nume_beneficiar")
- label: textul din contract (ex: "Nume beneficiar:")
- page: numărul paginii (1-indexed)
- approximate_position: descriere poziție (ex: "top-left", "center", "bottom-right")
```

### **2. Analiză Contract Grădiniță:**

```
Analizează acest contract de înscriere în grădiniță și identifică:
- Nume complet copil
- CNP copil
- Data nașterii
- Grupa
- Nume părinte 1
- Telefon părinte 1
- Nume părinte 2
- Telefon părinte 2
- Alergii/Restricții
```

### **3. Analiză Fișă Pacient Spital:**

```
Analizează această fișă pacient și identifică:
- Nume complet pacient
- CNP pacient
- Diagnostic principal
- Medic curant
- Data internării
- Contact urgență (nume + telefon)
```

### **4. Analiză Confirmare Rezervare Hotel:**

```
Analizează această confirmare de rezervare și identifică:
- Nume client
- Telefon client
- Email client
- Data check-in
- Data check-out
- Număr cameră
- Tip cameră
- Preț total
```

---

## 🔒 SECURITATE & BEST PRACTICES

### **1. API Key Security:**

```bash
# .env.local (NICIODATĂ în Git!)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# .gitignore (verifică că e adăugat)
.env.local
.env*.local
```

### **2. Rate Limiting:**

```typescript
// Protecție împotriva abuse
const rateLimiter = {
  maxRequests: 10, // per user
  timeWindow: 60000 // 1 minut
};
```

### **3. Error Handling:**

```typescript
try {
  const response = await openai.chat.completions.create({...});
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded
    return { error: "Prea multe cereri. Încearcă în 1 minut." };
  }
  if (error.status === 401) {
    // Invalid API key
    return { error: "Eroare autentificare AI. Contactează suportul." };
  }
  // Generic error
  return { error: "Eroare analiză contract. Încearcă din nou." };
}
```

### **4. Cost Monitoring:**

```typescript
// Track usage în Firebase
await setDoc(doc(db, `usage/${userId}/ai/${month}`), {
  contractAnalyses: increment(1),
  tokensUsed: increment(2500),
  costUSD: increment(0.01),
  timestamp: serverTimestamp()
});
```

---

## 📊 MONITORIZARE & ANALYTICS

### **Dashboard OpenAI:**

```
https://platform.openai.com/usage

Verifică:
- Tokens used (input/output)
- Cost per day/month
- Rate limits
- Error rates
```

### **Metrici de Urmărit:**

```
✅ Număr analize contracte/lună
✅ Cost total AI/lună
✅ Timp mediu analiză
✅ Rate de succes (% contracte analizate corect)
✅ Erori API
```

---

## 🚀 NEXT STEPS - Implementare

### **Faza 1: Setup Inițial (1 zi)**
```
✅ Creare cont OpenAI
✅ Generare API key
✅ Configurare .env.local
✅ Instalare package openai
✅ Testare API call simplu
```

### **Faza 2: Backend API (2 zile)**
```
✅ /api/analyze-contract/route.ts
✅ /api/generate-contract/route.ts
✅ Integrare cu Firebase
✅ Error handling
✅ Rate limiting
```

### **Faza 3: Frontend (2 zile)**
```
✅ Pagină /settings/templates
✅ Upload form
✅ Preview mapping
✅ Editor câmpuri
✅ Lista template-uri
```

### **Faza 4: Testing & Optimization (1 zi)**
```
✅ Testare cu contracte reale
✅ Ajustare prompt-uri
✅ Optimizare costuri
✅ Documentație utilizare
```

---

## 💰 MODEL DE PRICING PENTRU CLIENȚI

### **Cum să Monetizezi Feature-ul:**

#### **Plan Standard** ($29/lună):
```
❌ Fără AI contracte custom
✅ Template-uri fixe (16 documente standard)
```

#### **Plan Premium** ($79/lună):
```
✅ Template-uri custom + AI
✅ Inclus: 100 documente/lună
✅ Extra: $0.50 per document suplimentar
```

#### **Plan Gold** ($199/lună):
```
✅ Documente nelimitate
✅ AI avansat (analiză predictivă, rapoarte)
✅ Support prioritar
✅ Integrări custom
```

### **Profitabilitate:**

```
Exemplu: 10 firme pe Plan Premium

Revenue: 10 × $79 = $790/lună
Cost AI: $1.60 (setup) + $0/lună (generare)
Profit An 1: $9,480 - $1.60 = $9,478.40

Marjă profit: 99.98% 🚀
```

---

## ⚠️ LIMITĂRI & CONSIDERAȚII

### **1. Calitate PDF:**
```
✅ Funcționează: PDF-uri tipărite, scanate HD
⚠️ Probleme: Scanări de calitate foarte proastă, faxuri vechi
```

### **2. Layout Complex:**
```
✅ Funcționează: Contracte standard, formulare
⚠️ Probleme: Tabele complexe, layout multi-coloană
```

### **3. Limbi Suportate:**
```
✅ Română (excelent)
✅ Engleză (excelent)
✅ Maghiară (bun)
⚠️ Alte limbi (variabil)
```

### **4. Validare Umană:**
```
⚠️ IMPORTANT: Contractele generate trebuie verificate
   înainte de semnare/printare!
```

---

## 🎯 CONCLUZIE

### **Setup AI = EXTREM DE SIMPLU:**

✅ **UN singur API:** OpenAI  
✅ **UN singur model:** GPT-4o  
✅ **UN singur API key:** sk-proj-xxxxx  
✅ **Costuri minime:** $1.60 pentru 10 firme  
✅ **Fără costuri lunare:** generarea e locală  
✅ **Scalabil:** funcționează pentru mii de firme  
✅ **Multi-industry:** aplicabil pentru toate cele 4 industrii  

### **ROI Extraordinar:**

```
Investiție: $1.60 (setup 10 firme)
Revenue potențial: $9,480/an (10 firme × $79/lună)
ROI: 592,400% 🚀
```

---

## 📞 SUPORT & RESURSE

### **Documentație OpenAI:**
- API Reference: https://platform.openai.com/docs/api-reference
- Vision Guide: https://platform.openai.com/docs/guides/vision
- Pricing: https://openai.com/api/pricing/

### **Librării Necesare:**
- OpenAI SDK: https://github.com/openai/openai-node
- pdf-lib: https://pdf-lib.js.org/
- Firebase: https://firebase.google.com/docs

---

**Ultima actualizare:** 23 Octombrie 2025  
**Versiune:** 1.0  
**Status:** 📋 Documentație Completă - Ready for Implementation
