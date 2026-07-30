import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Citim key-ul din .env.local (local) sau process.env (Vercel)
function getApiKey(): string {
  // Pe Vercel, variabilele de mediu sunt setate în dashboard
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return process.env.OPENAI_API_KEY;
  }
  // Local, citim din .env.local pentru a evita override-ul din ~/.zshrc
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    return match ? match[1].trim() : '';
  } catch {
    return process.env.OPENAI_API_KEY || '';
  }
}

const PROMPT = `This is an image of a Romanian identity document used by an administrator of a nursing home to register new residents. The administrator has legal authority to process this data.

Extract ALL visible text fields from this document image and return them as JSON with these exact fields:
{
  "nume_complet": "full name as written on document",
  "cnp": "13-digit personal numeric code",
  "data_nasterii": "extract from CNP: digit 1 = sex/century (1=M 1900s, 2=F 1900s, 5=M 2000s, 6=F 2000s), digits 2-3 = year, digits 4-5 = month, digits 6-7 = day. Format: DD.MM.YYYY",
  "loc_nastere": "place of birth",
  "adresa": "full address",
  "ci_serie": "ID card series (2 letters)",
  "ci_numar": "ID card number",
  "ci_eliberat_de": "issued by authority",
  "ci_data_eliberarii": "issue date - this appears on the document next to the expiry date, format: DD.MM.YYYY - DD.MM.YYYY. The FIRST date is the issue date.",
  "ci_valabil_pana": "expiry date - the SECOND date from the pair above",
  "sex": "M or F based on first CNP digit (odd=M, even=F)",
  "cetatenie": "citizenship"
}

IMPORTANT RULES:
1. data_nasterii MUST be calculated from CNP, not read from the image. Example: CNP 2810501410077 -> born 01.10.1981 (female, year 81=1981, month 10, day 01)
2. ci_data_eliberarii and ci_valabil_pana appear together as "issue_date - expiry_date" on the document. Split them.
3. Return ONLY the JSON, no other text.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: 'Lipsește imaginea' }, { status: 400 });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'API key lipsă din .env.local' }, { status: 500 });
    }

    // Folosim fetch direct în loc de SDK pentru a evita override-ul din process.env
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType || 'image/jpeg'};base64,${image}`,
                detail: 'high',
              },
            },
          ],
        }],
        max_tokens: 1000,
        temperature: 0,
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json();
      console.error('OpenAI error:', resp.status, errData);
      return NextResponse.json({
        error: `OpenAI ${resp.status}: ${errData.error?.message || 'eroare'}`,
      }, { status: 500 });
    }

    const data = await resp.json();
    const content = data.choices[0].message.content;

    // Extragem JSON-ul din răspuns (poate fi în code block)
    let jsonStr = content || '';
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let extractedData;
    try {
      extractedData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({
        error: 'Eroare la parsarea răspunsului AI',
        raw: content,
      }, { status: 500 });
    }

    return NextResponse.json({
      data: extractedData,
      tokens: data.usage?.total_tokens || 0,
    });
  } catch (error: any) {
    console.error('Eroare extract-id-card:', error);
    return NextResponse.json({
      error: error.message || 'Eroare la extragerea datelor',
    }, { status: 500 });
  }
}
