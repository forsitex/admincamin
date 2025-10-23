/**
 * API Route: Analiză PDF cu OCR + AI
 * 
 * Flow:
 * 1. Primește PDF în Base64
 * 2. Convertește PDF → Imagini
 * 3. OCR pe imagini → Extrage text + coordonate
 * 4. OpenAI analizează textul → Detectează câmpuri
 * 5. Returnează câmpuri + coordonate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { openai, MODELS } from '@/lib/openai';
import { ANALYSIS_PROMPTS } from '@/types/template';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Începe analiza PDF cu OCR...');
    
    // 1. Parse request
    const body = await request.json();
    const { pdfBase64, organizationType, templateName } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: 'PDF lipsește' }, { status: 400 });
    }

    // 2. Convertim Base64 → Buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    // 3. Pentru simplificare, vom folosi prima pagină
    // În producție, ar trebui să procesăm toate paginile
    console.log('📄 Procesare PDF cu OCR...');
    
    // 4. Creăm worker Tesseract cu configurare corectă
    const worker = await createWorker('ron', 1, {
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
    });
    
    // 5. OCR pe PDF (convertit la imagine)
    // Tesseract poate procesa direct PDF-uri
    const { data } = await worker.recognize(pdfBuffer);
    
    console.log('✅ OCR completat');
    console.log(`📊 Text extras: ${data.text.length} caractere`);
    console.log(`📍 Cuvinte detectate: ${data.words.length}`);

    // 6. Extragem câmpurile cu coordonate
    const fieldsWithCoordinates = data.words
      .filter(word => {
        // Filtrăm doar cuvintele care par a fi label-uri de câmpuri
        const text = word.text.toLowerCase();
        return (
          text.includes('nume') ||
          text.includes('cnp') ||
          text.includes('adres') ||
          text.includes('telefon') ||
          text.includes('email') ||
          text.includes('data') ||
          text.includes('domiciliu') ||
          text.includes('cod') ||
          text.includes('seria') ||
          text.includes('numar')
        );
      })
      .map(word => ({
        label: word.text,
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        confidence: word.confidence
      }));

    console.log(`🎯 Câmpuri detectate: ${fieldsWithCoordinates.length}`);

    // 7. Trimitem textul la OpenAI pentru analiză semantică
    const prompt = ANALYSIS_PROMPTS[organizationType] || ANALYSIS_PROMPTS.camin;
    
    console.log('🤖 Trimitere la OpenAI pentru analiză semantică...');
    
    const response = await openai.chat.completions.create({
      model: MODELS.GPT_4O,
      messages: [{
        role: 'user',
        content: `${prompt}

Analizează următorul text extras din PDF și identifică câmpurile care trebuie completate:

${data.text}

Răspunde DOAR cu JSON în formatul:
{
  "fields": [
    {
      "name": "nume_camp_normalizat",
      "label": "Label exact din PDF",
      "type": "text|number|date",
      "required": true|false
    }
  ]
}`
      }],
      max_tokens: 1500,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI nu a returnat răspuns');
    }

    // 8. Parse răspuns OpenAI
    let cleanContent = content;
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '');
      cleanContent = cleanContent.replace(/```\s*/g, '');
    }
    
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    const aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanContent);

    // 9. Combinăm analiza AI cu coordonatele OCR
    const finalFields = aiAnalysis.fields.map((field: any) => {
      // Găsim coordonatele pentru acest câmp
      const ocrField = fieldsWithCoordinates.find(ocr => 
        ocr.label.toLowerCase().includes(field.label.toLowerCase().substring(0, 5))
      );

      return {
        ...field,
        coordinates: ocrField ? {
          x: ocrField.x + ocrField.width + 10, // Poziția unde să scriem (după label)
          y: ocrField.y,
          page: 1
        } : null
      };
    });

    console.log('✅ Analiză completă!');
    
    // 10. Cleanup
    await worker.terminate();

    // 11. Returnăm rezultatul
    return NextResponse.json({
      success: true,
      data: {
        fields: finalFields,
        totalPages: 1,
        ocrConfidence: data.confidence,
        textLength: data.text.length
      }
    });

  } catch (error: any) {
    console.error('❌ Eroare în analyze-pdf-ocr:', error);
    return NextResponse.json(
      { 
        error: 'Eroare la analiza PDF',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
