import { NextRequest, NextResponse } from 'next/server';
import { anthropic, checkAnthropicApiKey, CLAUDE_MODELS } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    checkAnthropicApiKey();
    console.log('🤖 API generate-letter-ai apelat');

    const body = await request.json();
    const { type, tema, activitati, materiale, anunturi, grupa, momenteSpeciale, progresGeneral, activitatiWeekend } = body;

    if (!tema) {
      return NextResponse.json({ error: 'Tema lipsă' }, { status: 400 });
    }

    console.log('📊 Generez scrisoare pentru:', grupa);
    console.log('📅 Tip:', type);
    console.log('🎨 Tema:', tema);

    if (type === 'monday') {
      if (!activitati || activitati.length === 0) {
        return NextResponse.json({ error: 'Activități lipsă' }, { status: 400 });
      }
      console.log('📝 Număr activități:', activitati.length);
    } else if (type === 'friday') {
      if (!momenteSpeciale || momenteSpeciale.length === 0) {
        return NextResponse.json({ error: 'Momente speciale lipsă' }, { status: 400 });
      }
      console.log('🌟 Număr momente speciale:', momenteSpeciale.length);
    }
    
    // Construiește prompt-ul pentru Claude
    let prompt = '';

    if (type === 'monday') {
      prompt = `Ești un educator experimentat și expert în comunicarea cu părinților.
Creează o scrisoare săptămânală prietenoasă și detaliată pentru părinți.

GRUPA: ${grupa}
TEMA SĂPTĂMÂNII: ${tema}
NUMĂR ACTIVITĂȚI: ${activitati.length}

ACTIVITĂȚI PLANIFICATE (TOATE TREBUIE SCRISE COMPLET):
${activitati.map((act: any, i: number) => `
${i + 1}. ${act.zi} - "${act.titlu}" ${act.domeniu ? `(${act.domeniu})` : ''}
   Descriere: ${act.descriere}
`).join('\n')}

MATERIALE NECESARE: ${materiale || 'Nu sunt necesare materiale speciale'}

ANUNȚURI: ${anunturi || 'Nu sunt anunțuri speciale'}

---

Scrie o scrisoare completă în limba română cu următoarea structură:

1. Introducere (2-3 propoziții)
2. Tema săptămânii
3. TOATE ${activitati.length} activități (fiecare cu 3-4 paragrafe)
4. Materiale necesare
5. Sfaturi pentru acasă (3-4 puncte)
6. Închidere

Pentru FIECARE din cele ${activitati.length} activități, scrie:
- Paragraf 1: Ce vor face copiii
- Paragraf 2: Lista cu 5 abilități dezvoltate
- Paragraf 3: Cum se desfășoară activitatea
- Paragraf 4: Ce vor învăța

SCRIE COMPLET pentru:
${activitati.map((act: any, i: number) => `${i + 1}. ${act.zi} - ${act.titlu}`).join('\n')}

---

REGULI FOARTE IMPORTANTE:

✅ **Ton:** Prietenos, cald, entuziast, profesional
✅ **Limbaj:** Simplu, pe înțelesul oricărui părinte, FĂRĂ termeni tehnici
✅ **Lungime:** 800-1000 cuvinte (scrisoare DETALIATĂ!)
✅ **Emoji:** Folosește emoji pentru structură (🔵, 📦, 📢, 💡, etc.)
✅ **Detalii:** Fii FOARTE FOARTE detaliat pentru fiecare activitate
✅ **Beneficii:** Explică clar ce vor învăța copiii și DE CE este important
✅ **Proces:** Descrie cum se va desfășura activitatea
✅ **Rezultat:** Ce vor putea face copiii la final
✅ **Pozitiv:** TOT textul trebuie să fie pozitiv și încurajator
✅ **Concret:** Exemple concrete, nu generalități
✅ **Personalizat:** Folosește numele grupei (${grupa})

STRUCTURĂ OBLIGATORIE:

Dragi părinți,

[Introducere prietenoasă - 2-3 propoziții]

🎨 TEMA SĂPTĂMÂNII: "${tema}"

📚 ACTIVITĂȚI PLANIFICATE:

${activitati.map((act: any, i: number) => `
🔵 ${act.zi} - "${act.titlu}" ${act.domeniu ? `(${act.domeniu})` : ''}

[Paragraf 1 - Introducere activitate]
[Paragraf 2 - Lista abilități dezvoltate (5 puncte)]
[Paragraf 3 - Detalii proces]
[Paragraf 4 - Beneficii și rezultat]
`).join('\n')}

📦 MATERIALE NECESARE: [dacă există]

📢 ANUNȚURI IMPORTANTE: [dacă există]

💡 PREGĂTIRE ACASĂ:

[3-4 sugestii concrete]

[Închidere caldă]

Cu drag,
👩‍🏫 Educatoarele [Nume]
${grupa}

---

⚠️ REGULI ABSOLUTE:

INTERZIS:
❌ "[Continuă...]" ❌ "[...]" ❌ "[Notă...]" ❌ "limită de caractere"

OBLIGATORIU:
✅ Scrie TOATE ${activitati.length} activități COMPLET
✅ Fiecare activitate = 4 paragrafe
✅ Nu te opri până nu termini ULTIMA activitate
✅ Ai 8000 tokens - folosește-i!`;
    } else if (type === 'friday') {
      prompt = `Ești un educator experimentat și expert în comunicarea cu părinților.
Creează o scrisoare săptămânală de VINERI - recap despre ce am realizat în această săptămână.

GRUPA: ${grupa}
TEMA SĂPTĂMÂNII: ${tema}

ACTIVITĂȚI REALIZATE (din planul de Luni):
${activitati.map((act: any, i: number) => `
${i + 1}. ${act.zi} - "${act.titlu}"
`).join('\n')}

MOMENTE SPECIALE ALE SĂPTĂMÂNII:
${momenteSpeciale.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}

PROGRES GENERAL: ${progresGeneral || 'Toți copiii au participat activ'}

ACTIVITĂȚI PENTRU WEEKEND: ${activitatiWeekend || 'Plimbare în parc, activități creative'}

---

Scrie o scrisoare completă în limba română cu următoarea structură:

1. Introducere celebrativă (2-3 propoziții)
2. Tema săptămânii
3. Pentru FIECARE activitate realizată - scrie 2-3 paragrafe despre:
   - Ce au făcut copiii
   - Cum au participat
   - Ce au învățat
4. Momente speciale (evidențiază fiecare moment)
5. Progres general
6. Activități pentru weekend (3-4 sugestii)
7. Închidere caldă

SCRIE COMPLET pentru TOATE ${activitati.length} activități realizate!

---

REGULI:

✅ Ton: Celebrativ, pozitiv, mândru de realizări
✅ Limbaj: Simplu, prietenos
✅ Emoji: 🟢 pentru activități, 🌟 pentru momente speciale
✅ Detalii: Fii specific despre ce au făcut copiii
✅ Pozitiv: Evidențiază succesele și progresul

STRUCTURĂ:

Dragi părinți,

[Introducere celebrativă]

🎨 TEMA SĂPTĂMÂNII: "${tema}"

📚 CE AM REALIZAT:

${activitati.map((act: any, i: number) => `
🟢 ${act.zi} - "${act.titlu}"
[2-3 paragrafe despre activitate]
`).join('\n')}

🌟 MOMENTE SPECIALE:
${momenteSpeciale.map((m: string) => `• ${m}`).join('\n')}

📊 PROGRES GENERAL:
[Paragraf despre progres]

🏠 ACTIVITĂȚI PENTRU WEEKEND:
[3-4 sugestii]

[Închidere caldă]

Cu drag,
👩‍🏫 Educatoarele ${grupa}

---

⚠️ REGULI ABSOLUTE:

INTERZIS:
❌ "[Continuă...]" ❌ "[...]" ❌ "[Notă...]"

OBLIGATORIU:
✅ Scrie pentru TOATE ${activitati.length} activități
✅ Fiecare activitate = 2-3 paragrafe
✅ Evidențiază toate momentele speciale
✅ Ai 8000 tokens - folosește-i!`;
    }

    console.log('🤖 Trimit la Claude...');

    // Apel Claude
    const claudeResponse = await anthropic.messages.create({
      model: CLAUDE_MODELS.SONNET_3_5,
      max_tokens: 8000, // Mărit pentru a permite scrisori mai lungi cu toate activitățile
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = claudeResponse.content[0].type === 'text' 
      ? claudeResponse.content[0].text 
      : '';

    console.log('✅ Scrisoare generată cu succes');
    console.log('📊 Tokens folosiți:', claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens);

    return NextResponse.json({
      success: true,
      content: content,
      metadata: {
        tokensUsed: claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens,
        model: CLAUDE_MODELS.SONNET_3_5,
        tema: tema,
        activitatiCount: activitati.length,
      }
    });

  } catch (error: any) {
    console.error('❌ Eroare în generate-letter-ai:', error);

    // Gestionare erori specifice Anthropic
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'API Key Anthropic invalid. Verifică configurația.' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit depășit. Încearcă din nou în câteva secunde.' },
        { status: 429 }
      );
    }

    // Eroare generică
    return NextResponse.json(
      { 
        error: 'Eroare la generarea scrisorii',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
