import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import { anthropic, checkAnthropicApiKey, CLAUDE_MODELS } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    checkAnthropicApiKey();
    console.log('🚀 API complete-docx-claude apelat');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const residentDataStr = formData.get('residentData') as string;

    if (!file || !residentDataStr) {
      return NextResponse.json({ error: 'Lipsesc date' }, { status: 400 });
    }

    const residentData = JSON.parse(residentDataStr);
    console.log('📄 Fișier:', file.name);
    console.log('👤 Rezident:', residentData.beneficiarNumeComplet);

    // Citim DOCX cu encoding UTF-8 corect
    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    
    // Citim XML cu encoding UTF-8 explicit
    const xmlFile = zip.file('word/document.xml');
    if (!xmlFile) {
      throw new Error('Nu s-a găsit word/document.xml în DOCX');
    }
    
    let xmlContent = xmlFile.asText();
    console.log('📄 XML citit, lungime:', xmlContent.length);

    // Extragem TEXTUL COMPLET din DOCX
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
    const fullText = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('');
    
    console.log(`📝 Text extras: ${fullText.length} caractere`);
    console.log('📝 Primele 500 caractere:', fullText.substring(0, 500));

    // Formatăm datele EXACT ca în interfață - pentru ca Claude să le înțeleagă natural
    const formattedData = `
📋 BENEFICIAR (persoana care intră în cămin):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nume complet: ${residentData.beneficiarNumeComplet || 'N/A'}
CNP: ${residentData.beneficiarCnp || 'N/A'}
Data nașterii: ${residentData.beneficiarDataNasterii || 'N/A'}
Telefon: ${residentData.beneficiarTelefon || 'N/A'}
Adresă: ${residentData.beneficiarAdresa || 'N/A'}
Cod poștal: ${residentData.beneficiarCodPostal || 'N/A'}

📄 CARTE DE IDENTITATE BENEFICIAR:
CI Serie: ${residentData.beneficiarCiSerie || 'N/A'}
CI Număr: ${residentData.beneficiarCiNumar || 'N/A'}
CI Eliberat data: ${residentData.beneficiarCiEliberatData || 'N/A'}
CI Eliberat de: ${residentData.beneficiarCiEliberatDe || 'N/A'}
CI Valabil până: ${residentData.beneficiarCiValabilPana || 'N/A'}

👥 APARȚINĂTOR (ruda/tutorele):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nume complet: ${residentData.apartinatorNumeComplet || 'N/A'}
CNP: ${residentData.apartinatorCnp || 'N/A'}
Relație: ${residentData.apartinatorRelatie || 'N/A'}
Telefon: ${residentData.apartinatorTelefon || 'N/A'}
Email: ${residentData.apartinatorEmail || 'N/A'}
Adresă: ${residentData.apartinatorAdresa || 'N/A'}

📄 CARTE DE IDENTITATE APARȚINĂTOR:
CI Serie: ${residentData.apartinatorCiSerie || 'N/A'}
CI Număr: ${residentData.apartinatorCiNumar || 'N/A'}
CI Eliberat data: ${residentData.apartinatorCiEliberatData || 'N/A'}
CI Eliberat de: ${residentData.apartinatorCiEliberatDe || 'N/A'}
CI Valabil până: ${residentData.apartinatorCiValabilPana || 'N/A'}

📝 CONTRACT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cost serviciu: ${residentData.costServiciu || 'N/A'} RON
Contribuție beneficiar: ${residentData.contributieBeneficiar || 'N/A'} RON
Data început contract: ${residentData.dataInceputContract || 'N/A'}
Data sfârșit contract: ${residentData.dataSfarsitContract || 'N/A'}
Număr dosar: ${residentData.numarDosar || 'N/A'}
Număr contract: ${residentData.numarContract || 'N/A'}

🏥 DATE MEDICALE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Proveniență: ${residentData.provenienta || 'N/A'}
Diagnostic: ${residentData.diagnostic || 'N/A'}
Alergii: ${residentData.alergii || 'N/A'}
Alimentație: ${residentData.alimentatie || 'N/A'}
Mobilitate: ${residentData.mobilitate || 'N/A'}
Comportament: ${residentData.comportament || 'N/A'}

👨‍⚕️ MEDIC DE FAMILIE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nume: ${residentData.medicFamilieNume || 'N/A'}
Telefon: ${residentData.medicFamilieTelefon || 'N/A'}
Email: ${residentData.medicFamilieEmail || 'N/A'}
`;

    console.log('📊 Date formatate pentru Claude:');
    console.log(formattedData);

    // Prompt SIMPLU și GENERIC - Claude analizează ca un om
    const systemPrompt = `Ești expert în completare documente legale românești.

🎯 ROLUL TĂU:
Ești ca un asistent care completează formulare. Primești:
1. TOATE datele unei persoane (beneficiar, aparținător, contract, medic, etc.)
2. Un document cu spații goale (marcate cu puncte: ....., ......, ........)

Trebuie să completezi TOATE spațiile goale cu informațiile corecte.

📋 CUM SĂ PROCEDEZI:

1. **Citește contextul** din jurul fiecărui spațiu gol
   - Ce scrie ÎNAINTE de puncte?
   - Ce scrie DUPĂ puncte?
   - În ce secțiune te afli? (ex: date beneficiar, date aparținător, contract, etc.)

2. **Înțelege ce se cere:**
   - "Domnul/Doamna ........." → se cere un NUME
   - "CNP nr. ........." → se cere un CNP (13 cifre)
   - "cu domiciliul în ........." → se cere o ADRESĂ
   - "B.I./C.I. seria ......." → se cere SERIA CI (litere)
   - "seria XX nr. ........." → se cere NUMĂRUL CI (cifre)
   - "născut la data de ........." → se cere DATA NAȘTERII
   - etc.

3. **Caută informația corectă** în datele primite:
   - Dacă documentul vorbește despre BENEFICIAR → folosește datele beneficiarului
   - Dacă documentul vorbește despre APARȚINĂTOR → folosește datele aparținătorului
   - Dacă e vorba de CONTRACT → folosește datele contractului
   - etc.

4. **Verificări importante:**
   - CNP = 13 cifre (ex: 1770203036053)
   - CI Număr = 6-7 cifre (ex: 324125)
   - CI Serie = 2-3 litere (ex: ZE, TT)
   - NU confunda CNP cu CI Număr!
   - NU confunda beneficiarul cu aparținătorul!

📤 FORMAT RĂSPUNS (DOAR JSON):
{
  "replacements": [
    {
      "old": "............",
      "new": "IANCU JIANU",
      "field": "Nume beneficiar",
      "reasoning": "Context: 'Domnul/Doamna' în prima secțiune → nume beneficiar"
    },
    {
      "old": ".........",
      "new": "1770203036053",
      "field": "CNP beneficiar",
      "reasoning": "Context: 'CNP nr.' → CNP beneficiar (13 cifre)"
    }
  ]
}

⚠️ IMPORTANT:
- "old" = secvența EXACTĂ de puncte din document
- "new" = valoarea EXACTĂ din datele primite
- "field" = ce completezi (pentru claritate)
- "reasoning" = de ce ai ales această valoare (explică logica ta)
- Procesează spațiile în ORDINEA apariției (de sus în jos)
- Returnează DOAR JSON, fără text suplimentar`;

    const userPrompt = `Iată DATELE REZIDENTULUI:

${formattedData}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Și iată DOCUMENTUL DE COMPLETAT (COMPLET):

${fullText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SARCINA TA:
Citește ÎNTREG documentul de mai sus și identifică TOATE spațiile goale (marcate cu puncte: ....., ......, ........, etc.).

Pentru FIECARE spațiu gol:
1. Citește contextul din jur (ce scrie înainte și după puncte)
2. Înțelege CE informație se cere
3. Caută informația CORECTĂ în datele rezidentului
4. Returnează înlocuirea

Analizează documentul și returnează JSON cu TOATE înlocuirile necesare.`;

    console.log('🤖 Trimit la Claude...');
    
    const aiResponse = await anthropic.messages.create({
      model: CLAUDE_MODELS.SONNET_3_5,
      max_tokens: 4000,
      temperature: 0,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const aiContent = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}';
    console.log('📥 Claude răspuns (primele 500 caractere):', aiContent.substring(0, 500));

    let mapping: any = { replacements: [] };
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      mapping = jsonMatch ? JSON.parse(jsonMatch[0]) : { replacements: [] };
    } catch (e) {
      console.error('⚠️ Eroare parse JSON:', e);
      return NextResponse.json({ error: 'Claude nu a returnat JSON valid' }, { status: 500 });
    }

    console.log(`📋 Claude: ${mapping.replacements?.length || 0} înlocuiri`);

    // Înlocuim în XML - DOAR PRIMA APARIȚIE pentru fiecare valoare
    let modifiedXml = xmlContent;
    let count = 0;

    for (const repl of mapping.replacements || []) {
      const oldValue = repl.old;
      const newValue = repl.new;
      const field = repl.field || 'unknown';
      const reasoning = repl.reasoning || 'N/A';
      
      if (!oldValue || !newValue) {
        console.log(`⚠️ Skip: lipsește old sau new`);
        continue;
      }

      // Escapăm punctele pentru regex
      const escapedOld = oldValue.replace(/\./g, '\\.');
      
      // Găsim PRIMA apariție în XML (fără flag 'g')
      const regex = new RegExp(escapedOld);
      
      if (modifiedXml.match(regex)) {
        // Înlocuim DOAR PRIMA apariție
        modifiedXml = modifiedXml.replace(regex, newValue);
        console.log(`✅ ${count + 1}. ${field}: "${oldValue}" → "${newValue}"`);
        console.log(`   Reasoning: ${reasoning}`);
        count++;
      } else {
        console.log(`⚠️ Nu s-a găsit: "${oldValue}" pentru câmpul "${field}"`);
      }
    }

    console.log(`\n📊 Total completate: ${count} câmpuri`);

    // Salvăm XML-ul cu encoding UTF-8 corect
    // IMPORTANT: Specificăm binary: true pentru a evita probleme cu caractere speciale
    zip.file('word/document.xml', modifiedXml, {
      binary: false,
      base64: false
    });
    
    const finalBuffer = zip.generate({ 
      type: 'nodebuffer', 
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    return new NextResponse(finalBuffer as any, {
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
