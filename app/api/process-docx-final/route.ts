import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ PĂSTRĂM DIACRITICE - Documentele legale necesită caractere corecte
// function removeDiacritics(str: string): string {
//   return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// }

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API process-docx-final apelat');

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

    // ✅ Trimitem la GPT - TOATE câmpurile (nu doar 25!)
    console.log('🤖 GPT-4o analizează TOATE câmpurile...');
    
    // Pregătim prompt cu TOATE matches din TEXT
    const promptMatches = textPuncteMatches.map((m, i) => 
      `${i + 1}. Context înainte: "${m.contextBefore}" | Puncte: [${m.puncte.length}] | Context după: "${m.contextAfter}"`
    ).join('\n');

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `Ești expert în completare documente legale românești pentru cămine de bătrâni.

MISIUNEA TA: Analizează FIECARE secvență de puncte și identifică CE VARIABILĂ EXACTĂ trebuie pusă acolo.

VARIABILE DISPONIBILE (cu valori reale):
${Object.entries(vars).map(([k, v]) => `- ${k}: "${v}"`).join('\n')}

REGULI STRICTE (urmează EXACT ordinea din document):

📋 SECȚIUNEA 1.2 - BENEFICIAR (prima persoană menționată):
1. "Domnul/Doamna" + puncte → beneficiarNumeComplet (NUME COMPLET)
2. "cu domiciliul în" + puncte → beneficiarAdresa (ADRESA COMPLETĂ)
3. "str." + puncte → beneficiarAdresa (doar dacă e separat)
4. "nr." + puncte (după stradă) → parte din beneficiarAdresa
5. "județul/sectorul" + puncte → parte din beneficiarAdresa
6. "CNP nr." + puncte → beneficiarCnp (13 CIFRE!)
7. "contul nr." + puncte → SKIP (nu avem această variabilă)
8. "B.I./C.I. seria" + puncte → beneficiarCiSerie (2-3 LITERE!)
9. "nr." + puncte (după seria CI) → beneficiarCiNumar (6-7 CIFRE!)
10. "având cu" + puncte → SKIP (text de legătură)

📋 SECȚIUNEA 1.3 - APARȚINĂTOR (a doua persoană):
11. "Domnul/doamna" + puncte (în 1.3) → apartinatorNumeComplet
12. "domiciliat/domiciliată în localitatea" + puncte → apartinatorAdresa
13. "str." + puncte (în 1.3) → parte din apartinatorAdresa
14. "nr." + puncte (în 1.3, după stradă) → parte din apartinatorAdresa
15. "județul/sectorul" + puncte (în 1.3) → parte din apartinatorAdresa
16. "B.I./C.I. seria" + puncte (în 1.3) → apartinatorCiSerie
17. "nr." + puncte (în 1.3, după CI seria) → apartinatorCiNumar
18. "eliberat/eliberată la data de" + puncte → apartinatorCiEliberatData
19. "de Secția de poliție" + puncte → apartinatorCiEliberatDe

📋 SECȚIUNEA 2 - CONTRACT:
20. "Cererea de acordare" + "nr." + puncte → numarDosar
21. "Planul individualizat" + "nr." + puncte → SKIP
22. "cost" / "tarif" + puncte → costServiciu
23. "data" + puncte → dataInceputContract

⚠️ ATENȚIE LA CONFUZII FRECVENTE:
- CNP = 13 cifre (ex: 1770203036053) ≠ CI număr (6-7 cifre)
- CI Serie = 2-3 LITERE (ex: ZE, TT) ≠ CI număr
- "nr." poate însemna: număr stradă, CI număr, CNP, cont, dosar
  → Verifică contextul EXACT înainte!
- Județul/sectorul = parte din adresă, NU variabilă separată

🎯 ALGORITM DE DECIZIE:
1. Citește contextul înainte (50 caractere)
2. Identifică secțiunea (1.2 = beneficiar, 1.3 = aparținător)
3. Identifică tipul câmpului (nume, CNP, adresă, CI, etc.)
4. Alege variabila EXACTĂ din lista de mai sus
5. Dacă nu ești 100% sigur → pune "SKIP"

Format răspuns:
{"replacements": [{"index": 1, "variable": "beneficiarNumeComplet", "confidence": "high"}]}

DOAR JSON, fără text suplimentar!`
      }, {
        role: 'user',
        content: `Analizează TOATE cele ${textPuncteMatches.length} secvențe de puncte din document:\n\n${promptMatches}\n\nReturnează JSON cu mapping-ul complet.`
      }],
      temperature: 0.1,
      max_tokens: 4000 // ✅ Crescut pentru a procesa toate câmpurile
    });

    const aiContent = aiResponse.choices[0].message.content || '{}';
    let mapping: any = { replacements: [] };
    
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      mapping = jsonMatch ? JSON.parse(jsonMatch[0]) : { replacements: [] };
    } catch (e) {
      console.log('⚠️ Eroare parse JSON');
    }

    console.log(`📋 GPT: ${mapping.replacements?.length || 0} înlocuiri`);

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

      // ✅ Găsim PRIMA apariție a acestei secvențe de puncte în XML
      const puncteToFind = textMatch.puncte;
      const puncteRegexEscaped = puncteToFind.replace(/\./g, '\\.');
      const searchRegex = new RegExp(`(<w:t[^>]*>)([^<]*)(${puncteRegexEscaped})([^<]*)(</w:t>)`);
      
      const match = modifiedXml.match(searchRegex);
      if (match) {
        // Înlocuim punctele cu valoarea, păstrând textul din jur
        const replacement = `${match[1]}${match[2]}${value.toString()}${match[4]}${match[5]}`;
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

    // Salvăm
    zip.file('word/document.xml', modifiedXml);
    const finalBuffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    return new NextResponse(finalBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${file.name.replace('.docx', '')}_completat.docx"`,
      },
    });

  } catch (error: any) {
    console.error('❌ Eroare:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
