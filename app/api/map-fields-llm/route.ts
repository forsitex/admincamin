/**
 * API Route: Mapping Câmpuri cu LLM
 * Primește text + labels cu coordonate și returnează mapping complet
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Începe mapping cu LLM...');
    
    // 1. Parse request
    const body = await request.json();
    const { fullText, labels, residentData } = body;

    if (!fullText || !labels || !residentData) {
      return NextResponse.json({ error: 'Date incomplete' }, { status: 400 });
    }

    // 2. Pregătim prompt-ul pentru LLM
    const labelsText = labels.map((l: any) => 
      `"${l.text}" la poziția (x:${l.x}, y:${l.y}, pagina:${l.page})`
    ).join('\n');

    const prompt = `Ești un asistent care analizează documente PDF pentru cămine de bătrâni.

**Text extras din PDF:**
${fullText}

**Label-uri detectate cu coordonate:**
${labelsText}

**Date rezident disponibile:**
- Nume complet: ${residentData.beneficiarNumeComplet}
- CNP: ${residentData.beneficiarCnp}
- Adresă: ${residentData.beneficiarAdresa}
- Data nașterii: ${residentData.beneficiarDataNasterii}
- Telefon: ${residentData.beneficiarTelefon || 'N/A'}
- Email: ${residentData.beneficiarEmail || 'N/A'}
- Aparținător: ${residentData.apartinatorNumeComplet}
- Telefon aparținător: ${residentData.apartinatorTelefon}

**Sarcina ta:**
Pentru fiecare label detectat, identifică:
1. Ce câmp reprezintă (ex: "nume", "cnp", "adresa")
2. Ce valoare trebuie scrisă (din datele rezidentului)
3. Unde exact să scriem (coordonate x, y după label)

Răspunde DOAR cu JSON în formatul:
\`\`\`json
{
  "fields": [
    {
      "label": "Nume:",
      "field_name": "beneficiarNumeComplet",
      "value": "PETRE ION",
      "x": 150,
      "y": 200,
      "page": 1
    }
  ]
}
\`\`\`

IMPORTANT:
- x trebuie să fie DUPĂ label (adaugă ~50-100 la x-ul label-ului)
- y trebuie să fie același cu y-ul label-ului
- Returnează doar câmpurile pe care le-ai identificat cu certitudine`;

    // 3. Apel LLM
    console.log('📤 Trimitere la OpenAI...');
    const response = await openai.chat.completions.create({
      model: MODELS.GPT_4O,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 2000,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI nu a returnat răspuns');
    }

    console.log('✅ Răspuns primit de la OpenAI');
    console.log(`📊 Tokens: ${response.usage?.total_tokens}`);

    // 4. Parse JSON din răspuns
    let cleanContent = content;
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/g, '');
      cleanContent = cleanContent.replace(/```\s*/g, '');
    }

    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    const mappingResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanContent);

    console.log(`✅ Mapping complet: ${mappingResult.fields.length} câmpuri`);
    console.log('📋 Câmpuri returnate:', JSON.stringify(mappingResult.fields, null, 2));

    // 5. Returnăm rezultatul
    return NextResponse.json({
      success: true,
      data: mappingResult
    });

  } catch (error: any) {
    console.error('❌ Eroare în map-fields-llm:', error);
    return NextResponse.json(
      { 
        error: 'Eroare la mapping câmpuri',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
