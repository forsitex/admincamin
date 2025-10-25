import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import { anthropic, checkAnthropicApiKey, CLAUDE_MODELS } from '@/lib/anthropic';

// Helper pentru a evita probleme cu caractere speciale
function safeStringReplace(text: string, searchValue: string, replaceValue: string): string {
  // Escapăm caracterele speciale în searchValue
  const escapedSearch = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedSearch);
  return text.replace(regex, replaceValue);
}

export const runtime = 'nodejs';
export const maxDuration = 60;

// ✅ PĂSTRĂM DIACRITICE - Documentele legale necesită caractere corecte
// function removeDiacritics(str: string): string {
//   return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// }

export async function POST(request: NextRequest) {
  try {
    // Verifică API key la runtime
    checkAnthropicApiKey();
    console.log('🚀 API process-docx-final apelat (folosind Claude 3.5 Sonnet)');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const residentDataStr = formData.get('residentData') as string;

    if (!file || !residentDataStr) {
      return NextResponse.json({ error: 'Lipsesc date' }, { status: 400 });
    }

    const residentData = JSON.parse(residentDataStr);
    console.log('📄 Fișier:', file.name);
    console.log('👤 Rezident:', residentData.beneficiarNumeComplet);

    // Citim DOCX
    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    let xmlContent = zip.file('word/document.xml')?.asText() || '';

    // ✅ STRATEGIE NOUĂ: Extragem textul curat mai întâi
    console.log('📝 Extragere text curat din DOCX...');
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
    const fullText = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('');
    console.log(`📝 Text extras: ${fullText.length} caractere`);

    // Găsim TOATE secvențele de puncte în TEXT (nu în XML!)
    console.log('🔍 Căutare secvențe de puncte în text...');
    const punctePattern = /\.{3,}/g;
    const textPuncteMatches: Array<{puncte: string, contextBefore: string, contextAfter: string, startPos: number}> = [];
    
    let match;
    while ((match = punctePattern.exec(fullText)) !== null) {
      const start = Math.max(0, match.index - 80);
      const end = Math.min(fullText.length, match.index + match[0].length + 80);
      
      textPuncteMatches.push({
        puncte: match[0],
        contextBefore: fullText.substring(start, match.index).trim(),
        contextAfter: fullText.substring(match.index + match[0].length, end).trim(),
        startPos: match.index
      });
    }

    console.log(`🔍 Găsite ${textPuncteMatches.length} secvențe de puncte în text`);
    
    // Acum găsim tag-urile XML care conțin puncte
    const xmlPuncteMatches: Array<{tag: string, puncte: string, index: number}> = [];
    const xmlPuncteRegex = /<w:t[^>]*>([^<]*\.{3,}[^<]*)<\/w:t>/g;
    
    while ((match = xmlPuncteRegex.exec(xmlContent)) !== null) {
      const puncteInTag = match[1].match(/\.{3,}/g);
      if (puncteInTag) {
        for (const p of puncteInTag) {
          xmlPuncteMatches.push({
            tag: match[0],
            puncte: p,
            index: match.index
          });
        }
      }
    }
    
    console.log(`🔍 Găsite ${xmlPuncteMatches.length} tag-uri XML cu puncte`);

    // ✅ Pregătim TOATE datele (50+ variabile)
    const vars = {
      // BENEFICIAR
      beneficiarNumeComplet: (residentData.beneficiarNumeComplet || '').toUpperCase(),
      beneficiarCnp: residentData.beneficiarCnp || '',
      beneficiarDataNasterii: residentData.beneficiarDataNasterii || '',
      beneficiarAdresa: residentData.beneficiarAdresa || '',
      beneficiarCodPostal: residentData.beneficiarCodPostal || '',
      beneficiarTelefon: residentData.beneficiarTelefon || '',
      beneficiarEmail: residentData.beneficiarEmail || '',
      beneficiarCiSerie: residentData.beneficiarCiSerie || '',
      beneficiarCiNumar: residentData.beneficiarCiNumar || '',
      beneficiarCiEliberatData: residentData.beneficiarCiEliberatData || '',
      beneficiarCiEliberatDe: residentData.beneficiarCiEliberatDe || '',
      beneficiarCiValabilPana: residentData.beneficiarCiValabilPana || '',
      
      // APARȚINĂTOR
      apartinatorNumeComplet: (residentData.apartinatorNumeComplet || '').toUpperCase(),
      apartinatorCnp: residentData.apartinatorCnp || '',
      apartinatorRelatie: residentData.apartinatorRelatie || '',
      apartinatorTelefon: residentData.apartinatorTelefon || '',
      apartinatorEmail: residentData.apartinatorEmail || '',
      apartinatorAdresa: residentData.apartinatorAdresa || '',
      apartinatorCiSerie: residentData.apartinatorCiSerie || '',
      apartinatorCiNumar: residentData.apartinatorCiNumar || '',
      apartinatorCiEliberatData: residentData.apartinatorCiEliberatData || '',
      apartinatorCiEliberatDe: residentData.apartinatorCiEliberatDe || '',
      apartinatorCiValabilPana: residentData.apartinatorCiValabilPana || '',
      
      // CONTRACT
      costServiciu: residentData.costServiciu || '',
      contributieBeneficiar: residentData.contributieBeneficiar || '0',
      dataInceputContract: residentData.dataInceputContract || '',
      dataSfarsitContract: residentData.dataSfarsitContract || '',
      dataInregistrare: residentData.dataInregistrare || '',
      numarDosar: residentData.numarDosar || '',
      numarContract: residentData.numarContract || '',
      durataNedeterminata: residentData.durataNedeterminata ? 'DA' : 'NU',
      
      // MEDICAL
      provenienta: residentData.provenienta || '',
      provenientaDetalii: residentData.provenientaDetalii || '',
      diagnostic: residentData.diagnostic || '',
      alergii: residentData.alergii || '',
      alimentatie: residentData.alimentatie || '',
      incontinenta: residentData.incontinenta || '',
      mobilitate: residentData.mobilitate || '',
      comportament: residentData.comportament || '',
      stareGenerala: residentData.stareGenerala || '',
      escare: residentData.escare || '',
      greutate: residentData.greutate || '',
      temperatura: residentData.temperatura || '',
      tensiuneArteriala: residentData.tensiuneArteriala || '',
      puls: residentData.puls || '',
      glicemie: residentData.glicemie || '',
      saturatieOxigen: residentData.saturatieOxigen || '',
      
      // MEDIC FAMILIE
      medicFamilieNume: residentData.medicFamilieNume || '',
      medicFamilieTelefon: residentData.medicFamilieTelefon || '',
      medicFamilieEmail: residentData.medicFamilieEmail || '',
      
      // CĂMIN
      caminId: residentData.caminId || '',
      companyCui: residentData.companyCui || '',
    };

    // ✅ Trimitem la Claude 3.5 Sonnet - TOATE câmpurile (nu doar 25!)
    console.log('🤖 Claude 3.5 Sonnet analizează TOATE câmpurile...');
    
    // Pregătim prompt cu TOATE matches din TEXT
    const promptMatches = textPuncteMatches.map((m, i) => 
      `${i + 1}. Context înainte: "${m.contextBefore}" | Puncte: [${m.puncte.length}] | Context după: "${m.contextAfter}"`
    ).join('\n');

    const systemPrompt = `Ești expert în completare documente legale românești pentru cămine de bătrâni.

🎯 MISIUNEA TA PRINCIPALĂ:
Analizează ETICHETELE din document (textul ÎNAINTE de puncte), NU punctele în sine!

EXEMPLU:
❌ GREȘIT: "Găsesc puncte: ......... și ghicesc ce înseamnă"
✅ CORECT: "Citesc eticheta: 'CNP nr.' → înțeleg că se cere CNP → caut în date → găsesc 1770203036053"

📊 DATELE DISPONIBILE:
${Object.entries(vars).map(([k, v]) => `${k}: "${v}"`).join('\n')}

📖 DICȚIONAR DE ETICHETE (ce înseamnă fiecare etichetă):

**ETICHETE PENTRU NUME:**
- "Domnul/Doamna" → beneficiarNumeComplet (prima apariție)
- "Domnul/doamna" → apartinatorNumeComplet (a doua apariție)
- "Nume și Prenume:" → beneficiarNumeComplet
- "Nume:" → poate fi beneficiar sau apartinator (verifică secțiunea)

**ETICHETE PENTRU CNP:**
- "CNP:" sau "CNP nr." → beneficiarCnp SAU apartinatorCnp (13 CIFRE!)
- ⚠️ NU confunda cu CI număr (6-7 cifre)!

**ETICHETE PENTRU ADRESĂ:**
- "cu domiciliul în" → beneficiarAdresa (prima apariție)
- "domiciliat în localitatea" → apartinatorAdresa (a doua apariție)
- "Adresă:" sau "Adresa:" → verifică secțiunea (beneficiar sau aparținător)

**ETICHETE PENTRU CARTE IDENTITATE:**
- "B.I./C.I. seria" → beneficiarCiSerie SAU apartinatorCiSerie (LITERE: ZE, TT)
- "seria XX nr." → beneficiarCiNumar SAU apartinatorCiNumar (CIFRE: 324125)
- "eliberat la data de" → apartinatorCiEliberatData (format: YYYY-MM-DD)
- "de Secția de poliție" → apartinatorCiEliberatDe

**ETICHETE PENTRU DATE:**
- "Data nașterii:" → beneficiarDataNasterii (format: DD.MM.YYYY, ex: 03.02.1977)
- ⚠️ NU pune timestamp (1761216640406)! Pune data formatată!
- "Data:" (în context contract) → dataInceputContract

**ETICHETE PENTRU NUMERE:**
- "Vârstă:" → CALCULEAZĂ din data nașterii (ex: 47 ani, nu 87!)
- "Greutate:" → greutate (ex: 87 kg)
- "Nr." sau "Număr dosar:" → numarDosar

**ETICHETE PENTRU DATE MEDICALE:**
- "Diagnostic:" → diagnostic
- "Alergii:" → alergii
- "Alimentație:" → alimentatie
- "Mobilitate:" → mobilitate
- "Comportament:" → comportament

📚 EXEMPLE CONCRETE din documente reale:

EXEMPLU 1 - Secțiunea 1.2 Beneficiar:
Text: "1.2. Domnul/Doamna ............, cu domiciliul în ........., str. ......, nr. ....., județul/sectorul ........, CNP nr. ........., contul nr. ........., B.I./C.I. seria ..... nr. ........., având cu"
Mapping CORECT:
- "Domnul/Doamna ............" → beneficiarNumeComplet (ex: "IANCU JIANU")
- "cu domiciliul în ........." → beneficiarAdresa (ex: "Strada Nimic 12")
- "CNP nr. ........." → beneficiarCnp (ex: "1770203036053" - 13 CIFRE!)
- "contul nr. ........." → SKIP (nu avem variabilă pentru cont bancar)
- "B.I./C.I. seria ....." → beneficiarCiSerie (ex: "ZE" - LITERE!)
- "seria XX nr. ........." → beneficiarCiNumar (ex: "324125" - CIFRE!)

EXEMPLU 2 - Secțiunea 1.3 Aparținător:
Text: "1.3. Domnul/doamna ............, domiciliat/domiciliată în localitatea ........., str. ......, nr. ....., județul/sectorul ........, B.I./C.I. seria ..... nr. ........., eliberat/eliberată la data de ......... de Secția de poliție ........."
Mapping CORECT:
- "Domnul/doamna ............" (în 1.3!) → apartinatorNumeComplet (ex: "ANA MARIA POPA")
- "localitatea ........." → apartinatorAdresa (ex: "Strada Ilie Manea 23")
- "B.I./C.I. seria ....." (în 1.3!) → apartinatorCiSerie (ex: "TT")
- "seria XX nr. ........." (în 1.3!) → apartinatorCiNumar (ex: "98343")
- "eliberat la data de ........." → apartinatorCiEliberatData (ex: "1920-10-12")
- "de Secția de poliție ........." → apartinatorCiEliberatDe (ex: "UASV")

⚠️ REGULI CRITICE - CITEȘTE CU ATENȚIE:

1. **CNP vs CI număr - NU LE CONFUNDA!**
   - CNP = 13 cifre (ex: 1770203036053)
   - CI număr = 6-7 cifre (ex: 324125)
   - Context CNP: "CNP nr. ........."
   - Context CI număr: "B.I./C.I. seria XX nr. ........."

2. **CI Serie vs CI Număr:**
   - CI Serie = 2-3 LITERE (ex: ZE, TT)
   - CI Număr = 6-7 CIFRE (ex: 324125)
   - Ordinea: "B.I./C.I. seria ..... nr. ........."
   - Prima secvență puncte după "seria" = beneficiarCiSerie
   - A doua secvență puncte după "nr." = beneficiarCiNumar

3. **Secțiunea 1.2 vs 1.3:**
   - 1.2 = BENEFICIAR (persoana care intră în cămin)
   - 1.3 = APARȚINĂTOR (ruda/tutorele)
   - Variabilele încep cu "beneficiar" sau "apartinator"

4. **Adrese - NU LE AMESTECA:**
   - beneficiarAdresa = adresa din secțiunea 1.2
   - apartinatorAdresa = adresa din secțiunea 1.3
   - Context: "cu domiciliul în" sau "domiciliat în localitatea"

5. **Date - Format YYYY-MM-DD:**
   - Dacă vezi "1920-10-12" → este DATA NAȘTERII apartinatorului
   - Dacă vezi "2025-10-12" → poate fi data contract/eliberare CI
   - NU pune date în loc de CNP sau CI număr!

📋 ALGORITM PAS CU PAS:

Pentru fiecare secvență de puncte:

PASUL 1: Citește contextul înainte (ultimele 80 caractere)
PASUL 2: Identifică secțiunea:
   - Dacă vezi "1.2" sau "Domnul/Doamna" (prima dată) → BENEFICIAR
   - Dacă vezi "1.3" sau "având cu" → APARȚINĂTOR

PASUL 3: Identifică tipul câmpului:
   - "Domnul/Doamna" + puncte → Nume complet
   - "cu domiciliul în" + puncte → Adresă
   - "CNP nr." + puncte → CNP (13 cifre!)
   - "B.I./C.I. seria" + puncte → CI Serie (litere!)
   - "seria XX nr." + puncte → CI Număr (cifre!)
   - "eliberat la data de" + puncte → Data eliberare CI
   - "de Secția" + puncte → Unde s-a eliberat CI

PASUL 4: Alege variabila:
   - Dacă BENEFICIAR + Nume → beneficiarNumeComplet
   - Dacă BENEFICIAR + CNP → beneficiarCnp
   - Dacă BENEFICIAR + CI Serie → beneficiarCiSerie
   - Dacă BENEFICIAR + CI Număr → beneficiarCiNumar
   - Dacă APARȚINĂTOR + Nume → apartinatorNumeComplet
   - Dacă APARȚINĂTOR + Adresă → apartinatorAdresa
   - etc.

PASUL 5: Verificare finală ÎNAINTE de a returna răspunsul:
   ✅ CNP-ul are 13 cifre? (ex: 1770203036053)
   ✅ CI Numărul are 6-7 cifre? (ex: 324125)
   ✅ CI Seria are 2-3 litere? (ex: ZE, TT)
   ✅ Data e formatată DD.MM.YYYY? (ex: 03.02.1977, NU 1761216640406)
   ✅ Vârsta e calculată din data nașterii? (ex: 47 ani, NU 87)
   ✅ Numele NU e duplicat? (ex: "IANCU JIANU", NU "IANCU JIANU IANCU JIANU")
   ✅ Beneficiar ≠ Aparținător? (nume diferite, CNP-uri diferite)

🚫 NU FACE NICIODATĂ:
- NU pune CNP în loc de CI număr
- NU pune CI număr în loc de CNP
- NU amesteca beneficiar cu aparținător
- NU pune adrese în locuri greșite
- NU pune date în loc de numere
- NU pune numere în loc de nume
- NU pune sume de bani în loc de nume persoane
- NU pune date în loc de adrese

🎯 ORDINEA STRICTĂ în document (RESPECTĂ-O!):
Secțiunea 1.2 (Beneficiar):
1. Nume complet beneficiar
2. Adresă beneficiar
3. CNP beneficiar (13 cifre)
4. Cont bancar (SKIP)
5. CI Serie beneficiar (litere)
6. CI Număr beneficiar (cifre)

Secțiunea 1.3 (Aparținător):
7. Nume complet aparținător
8. Adresă aparținător
9. CI Serie aparținător (litere)
10. CI Număr aparținător (cifre)
11. Data eliberare CI aparținător
12. Locație eliberare CI aparținător

Secțiunea 2 (Contract):
13. Cost serviciu (sumă)
14. Data început contract

Format răspuns JSON:
{"replacements": [
  {"index": 1, "variable": "beneficiarNumeComplet", "confidence": "high", "reasoning": "Context: 'Domnul/Doamna' în secțiunea 1.2"},
  {"index": 6, "variable": "beneficiarCnp", "confidence": "high", "reasoning": "Context: 'CNP nr.' - 13 cifre"}
]}

IMPORTANT: Adaugă "reasoning" pentru fiecare mapping să văd logica ta!`;

    const userPrompt = `Analizează TOATE cele ${textPuncteMatches.length} secvențe de puncte din document:\n\n${promptMatches}\n\nReturnează JSON cu mapping-ul complet.`;

    // Apel Claude 3.5 Sonnet
    const aiResponse = await anthropic.messages.create({
      model: CLAUDE_MODELS.SONNET_3_5,
      max_tokens: 4000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const aiContent = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}';
    let mapping: any = { replacements: [] };
    
    // 🔍 DEBUG: Salvăm răspunsul Claude pentru analiză
    console.log('🤖 Claude răspuns RAW (primele 500 caractere):');
    console.log(aiContent.substring(0, 500));
    
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      mapping = jsonMatch ? JSON.parse(jsonMatch[0]) : { replacements: [] };
    } catch (e) {
      console.log('⚠️ Eroare parse JSON:', e);
      console.log('📄 Content complet:', aiContent);
    }

    console.log(`📋 Claude: ${mapping.replacements?.length || 0} înlocuiri`);
    
    // 🔍 DEBUG: Afișăm primele 10 mapping-uri pentru verificare
    if (mapping.replacements && mapping.replacements.length > 0) {
      console.log('🔍 Primele 10 mapping-uri de la Claude:');
      mapping.replacements.slice(0, 10).forEach((r: any) => {
        console.log(`  ${r.index}. ${r.variable} = "${vars[r.variable as keyof typeof vars]}" | Reasoning: ${r.reasoning || 'N/A'}`);
      });
    }

    // ✅ STRATEGIE NOUĂ: Înlocuire DIRECTĂ în ordinea apariției
    let modifiedXml = xmlContent;
    let count = 0;
    let skipped = 0;

    // Sortăm replacement-urile după index
    const sortedReplacements = (mapping.replacements || []).sort((a: any, b: any) => a.index - b.index);

    for (const repl of sortedReplacements) {
      const idx = repl.index - 1;
      if (idx < 0 || idx >= textPuncteMatches.length) {
        console.log(`⚠️ Index invalid: ${repl.index}`);
        continue;
      }

      const textMatch = textPuncteMatches[idx];
      const value = vars[repl.variable as keyof typeof vars];
      
      if (!value || value === 'SKIP') {
        console.log(`⏭️ Skip câmp ${repl.index}: ${repl.variable} (fără valoare)`);
        skipped++;
        continue;
      }

      // ✅ Găsim PRIMA apariție NEÎNLOCUITĂ a acestei secvențe de puncte în XML
      const puncteToFind = textMatch.puncte;
      const puncteRegexEscaped = puncteToFind.replace(/\./g, '\\.');
      
      // IMPORTANT: Căutăm doar secvențe de puncte care NU au fost deja înlocuite
      // Adăugăm un marker unic după fiecare înlocuire pentru a evita confuziile
      const searchRegex = new RegExp(`(<w:t[^>]*>)([^<]*)(${puncteRegexEscaped})([^<]*)(</w:t>)`);
      
      const match = modifiedXml.match(searchRegex);
      if (match) {
        // Înlocuim punctele cu valoarea + un marker invizibil temporar
        // Marker-ul va fi eliminat la final
        const uniqueMarker = `<!--REPLACED_${count}-->`;
        const replacement = `${match[1]}${match[2]}${value.toString()}${uniqueMarker}${match[4]}${match[5]}`;
        modifiedXml = modifiedXml.replace(searchRegex, replacement);
        
        console.log(`✅ ${count + 1}. ${repl.variable}: "${puncteToFind}" → "${value}" (confidence: ${repl.confidence || 'N/A'})`);
        count++;
      } else {
        console.log(`⚠️ Nu s-a găsit în XML: "${puncteToFind}" pentru ${repl.variable}`);
        skipped++;
      }
    }

    console.log(`\n📊 REZULTAT FINAL:`);
    console.log(`   ✅ Completate: ${count}/${textPuncteMatches.length} câmpuri`);
    console.log(`   ⏭️ Omise: ${skipped} câmpuri`);
    console.log(`   📋 Rămase necompletate: ${textPuncteMatches.length - count - skipped}`);

    // ✅ Eliminăm marker-ii temporari înainte de salvare
    modifiedXml = modifiedXml.replace(/<!--REPLACED_\d+-->/g, '');
    console.log('🧹 Marker-i temporari eliminați');

    // Salvăm
    zip.file('word/document.xml', modifiedXml);
    const finalBuffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    // Eliminăm diacriticele din numele fișierului pentru header-ul HTTP
    const safeFileName = file.name
      .replace('.docx', '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimină diacritice
      .replace(/[^a-zA-Z0-9_-]/g, '_'); // Înlocuiește caractere speciale cu _
    
    return new NextResponse(finalBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFileName}_completat.docx"`,
      },
    });

  } catch (error: any) {
    console.error('❌ Eroare:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
