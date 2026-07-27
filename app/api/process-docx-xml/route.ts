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
          content: `Ești expert în completare documente. Analizează textul și identifică ce date trebuie completate.

Returnează JSON:
{
  "replacements": [
    {
      "find": "text exact de găsit (cu linii goale)",
      "replace": "valoarea de pus"
    }
  ]
}

REGULI:
- "find" trebuie să fie text EXACT din document (inclusiv ___ sau .......)
- "replace" trebuie să fie valoarea finală (fără ___ sau puncte)
- Înlocuiește TOATE liniile goale: ___, ......., ........., etc.
- Capitalizează numele proprii
- DOAR JSON, fără text suplimentar!`
        },
        {
          role: 'user',
          content: `Text din document:
${fullText.substring(0, 1500)}

Date disponibile:
- Nume: ${(residentData.beneficiarNumeComplet || '').toUpperCase()}
- CNP: ${residentData.beneficiarCnp || ''}
- Adresă: ${residentData.beneficiarAdresa || ''}
- Telefon: ${residentData.beneficiarTelefon || ''}
- Aparținător: ${(residentData.apartinatorNumeComplet || '').toUpperCase()}
- Telefon aparținător: ${residentData.apartinatorTelefon || ''}
- CI Serie: ${residentData.beneficiarCiSerie || ''}
- CI Număr: ${residentData.beneficiarCiNumar || ''}

Creează mapping-ul pentru înlocuiri.`
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

    // 6. Înlocuim în XML
    let modifiedXml = xmlContent;
    let replacedCount = 0;

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

    console.log(`✅ Total înlocuiri: ${replacedCount}`);

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
