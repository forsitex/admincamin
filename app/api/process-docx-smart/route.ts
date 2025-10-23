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
    console.log('🚀 API process-docx-smart apelat');

    // 1. Primim fișierul și datele
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const residentDataStr = formData.get('residentData') as string;

    if (!file || !residentDataStr) {
      return NextResponse.json({ error: 'Lipsesc date' }, { status: 400 });
    }

    const residentData = JSON.parse(residentDataStr);
    console.log('📄 Fișier primit:', file.name);
    console.log('👤 Rezident:', residentData.beneficiarNumeComplet);

    // 2. Citim fișierul DOCX
    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    let xmlContent = zip.file('word/document.xml')?.asText() || '';

    // 3. Extragem textul curat (fără XML)
    console.log('📝 Extragere text curat...');
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
    const fullText = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('');
    console.log(`📝 Text extras: ${fullText.length} caractere`);

    // 4. Găsim TOATE secvențele de puncte cu context
    console.log('🔍 Căutare secvențe de puncte...');
    const punctePattern = /(.{0,80})(\.{3,})(.{0,80})/g;
    const matches = [];
    let match;
    
    while ((match = punctePattern.exec(fullText)) !== null) {
      matches.push({
        before: match[1].trim(),
        puncte: match[2],
        after: match[3].trim(),
        fullMatch: match[0]
      });
    }

    console.log(`🔍 Găsite ${matches.length} secvențe de puncte`);

    // 5. Pregătim datele pentru GPT
    const variabileDisponibile = {
      // BENEFICIAR
      beneficiarNumeComplet: (residentData.beneficiarNumeComplet || '').toUpperCase(),
      beneficiarCnp: residentData.beneficiarCnp || '',
      beneficiarDataNasterii: residentData.beneficiarDataNasterii || '',
      beneficiarAdresa: residentData.beneficiarAdresa || '',
      beneficiarCodPostal: residentData.beneficiarCodPostal || '',
      beneficiarTelefon: residentData.beneficiarTelefon || '',
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
      numarDosar: residentData.numarDosar || '',
      numarContract: residentData.numarContract || '',
      
      // MEDICAL
      provenienta: residentData.provenienta || '',
      diagnostic: residentData.diagnostic || '',
      alergii: residentData.alergii || '',
      alimentatie: residentData.alimentatie || '',
      incontinenta: residentData.incontinenta || '',
      mobilitate: residentData.mobilitate || '',
      greutate: residentData.greutate || '',
      comportament: residentData.comportament || '',
      
      // MEDIC FAMILIE
      medicFamilieNume: residentData.medicFamilieNume || '',
      medicFamilieTelefon: residentData.medicFamilieTelefon || '',
      medicFamilieEmail: residentData.medicFamilieEmail || '',
    };

    // 6. Trimitem la GPT-4o pentru analiză inteligentă
    console.log('🤖 GPT-4o analizează contextul...');

    // ✅ TOATE câmpurile (fără limită de 30)
    const promptMatches = matches.map((m, i) => 
      `${i + 1}. Context înainte: "${m.before}" | Puncte: [${m.puncte.length}] | Context după: "${m.after}"`
    ).join('\n');

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Ești expert în completare documente legale pentru cămine de bătrâni.

MISIUNEA TA: Analizează fiecare secvență de puncte și identifică CE VARIABILĂ trebuie pusă acolo bazat pe CONTEXT.

VARIABILE DISPONIBILE:
${Object.keys(variabileDisponibile).map(k => `- ${k}: ${variabileDisponibile[k as keyof typeof variabileDisponibile]}`).join('\n')}

REGULI:
1. Analizează contextul înainte și după puncte
2. Identifică ce tip de informație se cere
3. Alege variabila CORECTĂ din lista de mai sus
4. Dacă nu ești sigur, pune "SKIP"

EXEMPLE:
- Context: "Domnul/Doamna" + puncte + ", cu domiciliul" → beneficiarNumeComplet
- Context: "Domnul/doamna" + puncte + ", domiciliat/domiciliată" → apartinatorNumeComplet
- Context: "CNP nr." + puncte → beneficiarCnp SAU apartinatorCnp (depinde de secțiune)
- Context: "B.I./C.I. seria" + puncte + "nr." → beneficiarCiSerie SAU apartinatorCiSerie

Returnează JSON:
{
  "replacements": [
    {
      "index": 1,
      "variable": "beneficiarNumeComplet",
      "reason": "Context indică numele beneficiarului"
    }
  ]
}

DOAR JSON, fără text suplimentar!`
        },
        {
          role: 'user',
          content: `Analizează aceste secvențe de puncte și spune-mi ce variabilă trebuie pusă în fiecare:

${promptMatches}

Returnează JSON cu index-ul și variabila pentru fiecare.`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000 // ✅ Crescut pentru toate câmpurile
    });

    const aiContent = aiResponse.choices[0].message.content || '{}';
    console.log('✅ Răspuns GPT primit');

    // 7. Parse JSON
    let mapping: any = { replacements: [] };
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      mapping = jsonMatch ? JSON.parse(jsonMatch[0]) : { replacements: [] };
    } catch (e) {
      console.log('⚠️ Eroare parse JSON, folosesc mapping gol');
    }

    console.log(`📋 GPT a identificat ${mapping.replacements?.length || 0} înlocuiri`);
    console.log('📋 Mapping GPT:', JSON.stringify(mapping.replacements?.slice(0, 5), null, 2));

    // 8. Aplicăm înlocuirile în XML - STRATEGIE NOUĂ
    console.log('🔧 Aplicare înlocuiri în XML...');
    
    // Găsim TOATE tag-urile <w:t> care conțin DOAR puncte
    const xmlPuncteMatches: Array<{tag: string, puncte: string, index: number}> = [];
    const xmlPuncteRegex = /<w:t[^>]*>(\.{3,})<\/w:t>/g;
    let xmlMatch;
    
    while ((xmlMatch = xmlPuncteRegex.exec(xmlContent)) !== null) {
      xmlPuncteMatches.push({
        tag: xmlMatch[0],
        puncte: xmlMatch[1],
        index: xmlMatch.index
      });
    }
    
    console.log(`🔍 Găsite ${xmlPuncteMatches.length} tag-uri cu puncte în XML`);
    
    // Creăm mapping între secvențele din text și tag-urile din XML
    let modifiedXml = xmlContent;
    let replacedCount = 0;
    let usedXmlIndices = new Set<number>();

    for (const replacement of mapping.replacements || []) {
      const matchIndex = replacement.index - 1;
      if (matchIndex < 0 || matchIndex >= matches.length) continue;

      const match = matches[matchIndex];
      const variableName = replacement.variable;
      const value = variabileDisponibile[variableName as keyof typeof variabileDisponibile];

      if (!value || value === 'SKIP') continue;

      // Căutăm primul tag XML cu puncte care are aceeași lungime (aproximativ)
      const targetLength = match.puncte.length;
      let bestMatch = null;
      let bestDiff = Infinity;

      for (let i = 0; i < xmlPuncteMatches.length; i++) {
        if (usedXmlIndices.has(i)) continue;
        
        const xmlPuncte = xmlPuncteMatches[i];
        const diff = Math.abs(xmlPuncte.puncte.length - targetLength);
        
        if (diff < bestDiff) {
          bestDiff = diff;
          bestMatch = { ...xmlPuncte, arrayIndex: i };
        }
      }

      if (bestMatch && bestDiff <= 5) {
        // ✅ Înlocuim tag-ul (PĂSTRĂM DIACRITICE!)
        const newTag = bestMatch.tag.replace(
          bestMatch.puncte,
          value.toString()
        );
        
        modifiedXml = modifiedXml.replace(bestMatch.tag, newTag);
        usedXmlIndices.add(bestMatch.arrayIndex);
        
        console.log(`✅ ${replacedCount + 1}. Înlocuit ${variableName}: "${bestMatch.puncte}" → "${value}"`);
        replacedCount++;
      } else {
        console.log(`⚠️ Nu s-a găsit tag XML pentru: ${variableName} (diff: ${bestDiff})`);
      }
    }

    console.log(`\n📊 REZULTAT FINAL:`);
    console.log(`   ✅ Completate: ${replacedCount}/${matches.length} câmpuri`);
    console.log(`   📋 Identificate de GPT: ${mapping.replacements?.length || 0}`);
    console.log(`   ⚠️ Nereusite: ${(mapping.replacements?.length || 0) - replacedCount}`);

    // 9. Salvăm XML-ul modificat
    zip.file('word/document.xml', modifiedXml);

    // 10. Generăm DOCX-ul final
    const finalBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    console.log('✅ DOCX generat cu succes!');

    // 11. Returnăm
    return new NextResponse(finalBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${file.name.replace('.docx', '')}_completat.docx"`,
      },
    });

  } catch (error: any) {
    console.error('❌ Eroare:', error);
    return NextResponse.json(
      { error: error.message || 'Eroare la procesare' },
      { status: 500 }
    );
  }
}
