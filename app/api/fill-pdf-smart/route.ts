/**
 * API Route: Completare PDF Smart cu Mappings Fixe
 * Folosește coordonate predefinite + AI pentru mapping valori
 */

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { openai, MODELS } from '@/lib/openai';
import { detectPdfType, PDF_MAPPINGS } from '@/lib/pdf-mappings';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Începe completarea PDF smart...');
    
    // 1. Parse request
    const body = await request.json();
    const { pdfBase64, fileName, residentData } = body;

    if (!pdfBase64 || !fileName || !residentData) {
      return NextResponse.json({ error: 'Date incomplete' }, { status: 400 });
    }

    console.log(`📄 Nume fișier primit: "${fileName}"`);

    // 2. NIVEL 1: Extragem textul din PDF cu pdfjs-dist
    console.log('📖 NIVEL 1: Extragere text din PDF...');
    const pdfData = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    let allText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      allText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    
    console.log(`✅ Text extras: ${allText.length} caractere`);

    // 3. Detectăm tipul PDF-ului după conținut
    let pdfType = detectPdfType(allText);
    
    // Fallback la mapping implicit dacă nu detectăm
    if (!pdfType) {
      console.log('⚠️ Nu s-a putut detecta tipul — folosesc mapping implicit');
      console.log('📝 Text extras (primele 200 caractere):', allText.substring(0, 200));
      pdfType = 'cerere_admitere'; // Default
    }

    console.log(`✅ Tip PDF final: ${pdfType}`);
    
    const template = PDF_MAPPINGS[pdfType];
    const coordMap = template.fields;
    
    console.log(`📋 Găsit mapping cu ${coordMap.length} câmpuri`);

    // 3. Trimitem la OpenAI pentru mapping valori
    console.log('🤖 Trimitere la OpenAI pentru mapping valori...');
    
    const response = await openai.chat.completions.create({
      model: MODELS.GPT_4O,
      messages: [
        {
          role: 'system',
          content: 'Primești o listă de etichete cu coordonate și datele unui rezident. Completează fiecare etichetă cu valoarea potrivită din datele rezidentului. Răspunde DOAR cu JSON valid în formatul: [{"label": "...", "value": "...", "x": ..., "y": ..., "page": ...}]'
        },
        {
          role: 'user',
          content: `PDF-ul conține aceste câmpuri cu coordonate:
${JSON.stringify(coordMap, null, 2)}

Datele rezidentului sunt:
- Nume complet: ${residentData.beneficiarNumeComplet}
- CNP: ${residentData.beneficiarCnp}
- Adresă: ${residentData.beneficiarAdresa}
- Data nașterii: ${residentData.beneficiarDataNasterii}
- Telefon: ${residentData.beneficiarTelefon || 'N/A'}
- Email: ${residentData.beneficiarEmail || 'N/A'}
- Aparținător: ${residentData.apartinatorNumeComplet}
- Telefon aparținător: ${residentData.apartinatorTelefon}
- CI Serie: ${residentData.beneficiarCiSerie || 'N/A'}
- CI Număr: ${residentData.beneficiarCiNumar || 'N/A'}

Returnează un JSON cu [{label, value, x, y, page}] pentru fiecare câmp.
IMPORTANT: Păstrează coordonatele EXACT cum sunt în mapping!`
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI nu a returnat răspuns');
    }

    console.log('✅ Răspuns primit de la OpenAI');
    console.log(`📊 Tokens: ${response.usage?.total_tokens}`);

    // 4. Parse JSON
    let cleanContent = content;
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '');
      cleanContent = cleanContent.replace(/```\s*/g, '');
    }

    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    const fields = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanContent);

    console.log(`📝 Câmpuri de completat: ${fields.length}`);

    // 5. Încarcă PDF-ul
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;

    // 6. Completăm fiecare câmp
    let completedFields = 0;

    for (const field of fields) {
      try {
        const pageIndex = (field.page || 1) - 1;
        const page = pdfDoc.getPages()[pageIndex];
        
        if (!page) {
          console.log(`⚠️ Pagina ${field.page} nu există`);
          continue;
        }

        page.drawText(field.value.toString(), {
          x: field.x,
          y: field.y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });

        completedFields++;
        console.log(`✅ Completat: ${field.label} = ${field.value}`);
        
      } catch (fieldError) {
        console.error(`❌ Eroare la câmpul ${field.label}:`, fieldError);
      }
    }

    console.log(`✅ Completate ${completedFields}/${fields.length} câmpuri`);

    // 7. Salvăm PDF-ul
    const pdfBytes = await pdfDoc.save();
    const pdfBase64Result = Buffer.from(pdfBytes).toString('base64');

    // 8. Returnăm rezultatul
    return NextResponse.json({
      success: true,
      data: {
        pdfBase64: pdfBase64Result,
        completedFields,
        totalFields: fields.length
      }
    });

  } catch (error: any) {
    console.error('❌ Eroare în fill-pdf-smart:', error);
    return NextResponse.json(
      { 
        error: 'Eroare la completarea PDF',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
