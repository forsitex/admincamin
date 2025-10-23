/**
 * API Route: Completare DOCX prin Înlocuire XML
 * 
 * Flow:
 * 1. User uploadează DOCX cu linii goale (___)
 * 2. Despachetăm ZIP-ul și citim XML-ul
 * 3. GPT-4o analizează textul și creează mapping inteligent
 * 4. Înlocuim direct în XML
 * 5. Reîmpachetăm și returnăm DOCX completat
 */

import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function removeDiacritics(str: string): string {
  return str
    .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i')
    .replace(/ș/g, 's').replace(/ț/g, 't')
    .replace(/Ă/g, 'A').replace(/Â/g, 'A').replace(/Î/g, 'I')
    .replace(/Ș/g, 'S').replace(/Ț/g, 'T');
}

export async function POST(req: NextRequest) {
  try {
    console.log('📄 Procesare DOCX cu XML...');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const residentDataStr = formData.get('residentData') as string;

    if (!file) {
      return NextResponse.json({ error: 'Fișier lipsă' }, { status: 400 });
    }

    const residentData = residentDataStr ? JSON.parse(residentDataStr) : {};
    console.log(`📄 DOCX uploadat: ${file.name}`);

    // 1. Citim DOCX-ul ca ZIP
    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    // 2. Extragem XML-ul principal
    const xmlContent = zip.file('word/document.xml')?.asText();
    
    if (!xmlContent) {
      throw new Error('Nu s-a putut citi document.xml din DOCX');
    }

    console.log('📖 XML extras cu succes');

    // 3. Extragem textul vizibil pentru GPT
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const fullText = textMatches
      .map(match => match.replace(/<[^>]+>/g, ''))
      .join(' ');

    console.log(`📝 Text extras: ${fullText.substring(0, 200)}...`);

    // 4. GPT-4o creează mapping inteligent
    console.log('🤖 GPT-4o analizează și creează mapping...');

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Ești expert în completare documente legale pentru cămine de bătrâni. 

MISIUNEA TA: Analizează FIECARE linie din document și identifică TOATE spațiile goale (......, ___) care trebuie completate cu date.

Returnează JSON:
{
  "replacements": [
    {
      "find": "text exact de găsit (cu linii goale)",
      "replace": "valoarea de pus"
    }
  ]
}

REGULI CRITICE:
1. Analizează FOARTE ATENT fiecare linie - nu te grăbi!
2. "find" = text EXACT din document (inclusiv punctele: ......, ........., ............)
3. "replace" = valoarea finală (fără puncte)
4. Capitalizează TOATE numele proprii (NUME PRENUME)

PATTERN-URI COMUNE ȘI CE VARIABILE SĂ FOLOSEȘTI:

📋 BENEFICIAR (persoana care intră în cămin):
- "Domnul XXXX" sau "cu domiciliul în ..." → beneficiarNumeComplet + beneficiarAdresa
- "CNP nr. ..." → beneficiarCnp
- "str. ... nr. ..." → extrage din beneficiarAdresa
- "B.I./C.I. seria ... nr. ..." → beneficiarCiSerie + beneficiarCiNumar
- "eliberat/eliberată la data de ..." → beneficiarCiEliberatData
- "de ..." (după "eliberat") → beneficiarCiEliberatDe
- "valabil până ..." → beneficiarCiValabilPana

👤 APARȚINĂTOR (reprezentant legal - soț/soție/fiu/fiică):
- "Domnul/doamna ..." (în secțiunea 1.3) → apartinatorNumeComplet
- "domiciliat/domiciliată în localitatea ..." → apartinatorAdresa
- "județul/sectorul ..." → extrage din apartinatorAdresa
- "B.I./C.I. seria ... nr. ..." (în secțiunea aparținător) → apartinatorCiSerie + apartinatorCiNumar
- "eliberat/eliberată la data de ..." (aparținător) → apartinatorCiEliberatData
- "de Secția de poliție ..." → apartinatorCiEliberatDe

📄 CONTRACT:
- "cost serviciu ... RON" → costServiciu
- "contribuție ... RON" → contributieBeneficiar
- "data început ..." → dataInceputContract
- "număr dosar ..." → numarDosar
- "număr contract ..." → numarContract

FII FOARTE ATENT: 
- Secțiunea 1.2 = BENEFICIAR
- Secțiunea 1.3 = APARȚINĂTOR
- Nu le confunda!

DOAR JSON, fără text suplimentar!`
        },
        {
          role: 'user',
          content: `Text din document:
${fullText.substring(0, 1500)}

Date disponibile pentru completare:

📋 BENEFICIAR:
- Nume complet: ${(residentData.beneficiarNumeComplet || '').toUpperCase()}
- CNP: ${residentData.beneficiarCnp || ''}
- Data nașterii: ${residentData.beneficiarDataNasterii || ''}
- Adresă: ${residentData.beneficiarAdresa || ''}
- Cod poștal: ${residentData.beneficiarCodPostal || ''}
- Telefon: ${residentData.beneficiarTelefon || ''}
- CI Serie: ${residentData.beneficiarCiSerie || ''}
- CI Număr: ${residentData.beneficiarCiNumar || ''}
- CI Eliberat data: ${residentData.beneficiarCiEliberatData || ''}
- CI Eliberat de: ${residentData.beneficiarCiEliberatDe || ''}
- CI Valabil până: ${residentData.beneficiarCiValabilPana || ''}

👤 APARȚINĂTOR:
- Nume complet: ${(residentData.apartinatorNumeComplet || '').toUpperCase()}
- CNP: ${residentData.apartinatorCnp || ''}
- Relație: ${residentData.apartinatorRelatie || ''}
- Telefon: ${residentData.apartinatorTelefon || ''}
- Email: ${residentData.apartinatorEmail || ''}
- Adresă: ${residentData.apartinatorAdresa || ''}
- CI Serie: ${residentData.apartinatorCiSerie || ''}
- CI Număr: ${residentData.apartinatorCiNumar || ''}
- CI Eliberat data: ${residentData.apartinatorCiEliberatData || ''}
- CI Eliberat de: ${residentData.apartinatorCiEliberatDe || ''}
- CI Valabil până: ${residentData.apartinatorCiValabilPana || ''}

📄 CONTRACT:
- Cost serviciu: ${residentData.costServiciu || ''} RON
- Contribuție beneficiar: ${residentData.contributieBeneficiar || '0'} RON
- Data început: ${residentData.dataInceputContract || ''}
- Data sfârșit: ${residentData.dataSfarsitContract || 'Nedeterminată'}
- Număr dosar: ${residentData.numarDosar || ''}
- Număr contract: ${residentData.numarContract || ''}

🏥 MEDICAL:
- Proveniență: ${residentData.provenienta || ''}
- Diagnostic: ${residentData.diagnostic || ''}
- Alergii: ${residentData.alergii || ''}
- Alimentație: ${residentData.alimentatie || ''}
- Incontinență: ${residentData.incontinenta || ''}
- Mobilitate: ${residentData.mobilitate || ''}
- Greutate: ${residentData.greutate || ''} kg
- Comportament: ${residentData.comportament || ''}

👨‍⚕️ MEDIC FAMILIE:
- Nume: ${residentData.medicFamilieNume || ''}
- Telefon: ${residentData.medicFamilieTelefon || ''}
- Email: ${residentData.medicFamilieEmail || ''}

Creează mapping-ul pentru înlocuiri. Folosește datele de mai sus pentru a completa liniile goale din document.`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    const aiContent = aiResponse.choices[0].message.content || '{}';
    console.log('✅ Răspuns GPT primit');

    // 5. Parse JSON
    let mapping;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      mapping = jsonMatch ? JSON.parse(jsonMatch[0]) : { replacements: [] };
    } catch (e) {
      console.log('⚠️ Eroare parse JSON, folosesc mapping gol');
      mapping = { replacements: [] };
    }

    console.log(`📋 Mapping-uri de făcut: ${mapping.replacements?.length || 0}`);

    // 6. Înlocuim în XML - STRATEGIE NOUĂ: Înlocuim direct punctele
    let modifiedXml = xmlContent;
    let replacedCount = 0;

    // Mai întâi aplicăm mapping-urile GPT
    for (const replacement of mapping.replacements || []) {
      const findText = removeDiacritics(replacement.find);
      const replaceText = removeDiacritics(replacement.replace);

      // Încercăm să găsim și să înlocuim în XML
      // Căutăm pattern-ul în tag-uri <w:t>
      const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(<w:t[^>]*>)([^<]*${escapedFind}[^<]*)(<\\/w:t>)`, 'g');

      if (modifiedXml.match(regex)) {
        modifiedXml = modifiedXml.replace(regex, (match, opening, content, closing) => {
          const newContent = content.replace(findText, replaceText);
          replacedCount++;
          console.log(`✅ Înlocuit: "${findText}" → "${replaceText}"`);
          return opening + newContent + closing;
        });
      } else {
        console.log(`⚠️ Nu s-a găsit: "${findText}"`);
      }
    }

    console.log(`✅ Total înlocuiri GPT: ${replacedCount}`);

    // 6.5. NORMALIZARE XML - Combinăm tag-urile <w:t> consecutive
    console.log('🔧 Normalizare XML - combinare tag-uri <w:t>...');
    
    // Combinăm toate <w:t>...</w:t> consecutive într-un singur tag
    modifiedXml = modifiedXml.replace(/(<w:t[^>]*>)([^<]*)<\/w:t>\s*(<w:t[^>]*>)/g, (match, opening1, content1, opening2) => {
      // Păstrăm primul opening tag și conținutul, eliminăm closing + opening următor
      return opening1 + content1;
    });
    
    console.log('✅ XML normalizat');

    // 6.6. STRATEGIE NOUĂ: Înlocuim direct în tag-urile <w:t> individuale
    console.log('🔧 Înlocuire directă în tag-uri <w:t>...');
    
    // Găsim toate secvențele de puncte și le înlocuim direct
    const puncteReplacements = [
      { search: /(<w:t[^>]*>)\.{8,}(<\/w:t>)/g, replace: (match: string, opening: string, closing: string, context: string) => {
        // Verificăm contextul înainte
        if (context.includes('Domnul/doamna')) {
          return opening + removeDiacritics(residentData.apartinatorNumeComplet || '').toUpperCase() + closing;
        }
        if (context.includes('localitatea')) {
          return opening + removeDiacritics(residentData.apartinatorAdresa || '') + closing;
        }
        if (context.includes('judetul/sectorul')) {
          return opening + 'Sector 3' + closing;
        }
        if (context.includes('domiciliul in')) {
          return opening + removeDiacritics(residentData.beneficiarAdresa || '') + closing;
        }
        return match; // Păstrăm dacă nu știm ce e
      }}
    ];

    // Înlocuim punctele în contextul lor
    const lines = modifiedXml.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Domnul/doamna
      if (line.includes('Domnul/doamna') && line.match(/\.{8,}/)) {
        lines[i] = line.replace(/(<w:t[^>]*>)\.{8,}(<\/w:t>)/g, 
          `$1${removeDiacritics(residentData.apartinatorNumeComplet || '').toUpperCase()}$2`);
        console.log('✅ Înlocuit: Domnul/doamna');
        replacedCount++;
      }
      
      // Localitatea
      if (line.includes('localitatea') && line.match(/\.{8,}/)) {
        lines[i] = line.replace(/(<w:t[^>]*>)\.{8,}(<\/w:t>)/g, 
          `$1${removeDiacritics(residentData.apartinatorAdresa || '')}$2`);
        console.log('✅ Înlocuit: localitatea');
        replacedCount++;
      }
      
      // Județul/sectorul
      if (line.includes('judetul/sectorul') && line.match(/\.{8,}/)) {
        lines[i] = line.replace(/(<w:t[^>]*>)\.{8,}(<\/w:t>)/g, '$1Sector 3$2');
        console.log('✅ Înlocuit: judetul/sectorul');
        replacedCount++;
      }
      
      // CI seria
      if (line.includes('seria') && line.match(/\.{5,}/)) {
        lines[i] = line.replace(/(<w:t[^>]*>)\.{5,}(<\/w:t>)/g, 
          `$1${removeDiacritics(residentData.apartinatorCiSerie || '')}$2`);
        console.log('✅ Înlocuit: CI seria');
        replacedCount++;
      }
      
      // Eliberat la data
      if (line.includes('eliberat') && line.includes('data') && line.match(/\.{8,}/)) {
        lines[i] = line.replace(/(<w:t[^>]*>)\.{8,}(<\/w:t>)/g, 
          `$1${residentData.apartinatorCiEliberatData || ''}$2`);
        console.log('✅ Înlocuit: data eliberare');
        replacedCount++;
      }
    }
    
    modifiedXml = lines.join('\n');

    console.log(`✅ Total înlocuiri finale: ${replacedCount}`);

    // 7. Salvăm XML-ul modificat înapoi în ZIP
    zip.file('word/document.xml', modifiedXml);

    // 8. Generăm DOCX-ul final
    const finalBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    console.log('✅ DOCX generat cu succes!');

    // 9. Returnăm
    return new NextResponse(finalBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${file.name.replace('.docx', '')}_completat.docx"`,
      },
    });

  } catch (error: any) {
    console.error('❌ Eroare:', error);
    return NextResponse.json(
      {
        error: 'Eroare la procesare DOCX',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
