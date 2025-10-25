import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import OpenAI from 'openai';

// Inițializare client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Structura datelor unui rezident (simplificată pentru AI)
interface ResidentData {
  beneficiarNumeComplet: string;
  beneficiarCnp: string;
  beneficiarDataNasterii: string;
  diagnostic?: string;
  alergii?: string;
  alimentatie?: string;
  incontinenta?: string;
  mobilitate?: string;
  greutate?: number;
  comportament?: string;
  medicFamilieNume?: string;
  medicFamilieTelefon?: string;
  tensiuneArteriala?: string;
  puls?: string;
  glicemie?: string;
  temperatura?: string;
  saturatieOxigen?: string;
  escare?: string;
  stareGenerala?: string;
  dataInregistrare: number;
}

export async function POST(req: NextRequest) {
  try {
    const { question, caminId } = await req.json();
    console.log('📥 AI Chat Request received:', { question, caminId });

    // Verificare autentificare server-side
    const authHeader = req.headers.get('authorization');
    console.log('🔐 Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid Bearer token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing Bearer token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token extracted:', token.substring(0, 20) + '...');
    
    let userId: string;
    
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      userId = decodedToken.uid;
      console.log('✅ User authenticated:', userId);
    } catch (error: any) {
      console.log('❌ Token verification failed:', error.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Autentificare eșuată. Token invalid.' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Căutare rezidenți în căminul specificat
    console.log('📂 Accessing residents path:', `organizations/${userId}/locations/${caminId}/residents`);
    
    let residents: ResidentData[] = [];
    
    try {
      const residentsSnapshot = await adminDb.collection(`organizations/${userId}/locations/${caminId}/residents`).get();
      console.log('📄 Residents found:', residentsSnapshot.size);
      
      residents = residentsSnapshot.docs.map(doc => ({
        beneficiarNumeComplet: doc.data().beneficiarNumeComplet,
        beneficiarCnp: doc.data().beneficiarCnp,
        beneficiarDataNasterii: doc.data().beneficiarDataNasterii,
        diagnostic: doc.data().diagnostic,
        alergii: doc.data().alergii,
        alimentatie: doc.data().alimentatie,
        incontinenta: doc.data().incontinenta,
        mobilitate: doc.data().mobilitate,
        greutate: doc.data().greutate,
        comportament: doc.data().comportament,
        medicFamilieNume: doc.data().medicFamilieNume,
        medicFamilieTelefon: doc.data().medicFamilieTelefon,
        tensiuneArteriala: doc.data().tensiuneArteriala,
        puls: doc.data().puls,
        glicemie: doc.data().glicemie,
        temperatura: doc.data().temperatura,
        saturatieOxigen: doc.data().saturatieOxigen,
        escare: doc.data().escare,
        stareGenerala: doc.data().stareGenerala,
        dataInregistrare: doc.data().dataInregistrare,
      }));
    } catch (firestoreError: any) {
      console.log('❌ Firestore access failed:', firestoreError.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Nu s-au putut încărca datele rezidenților. Verifică configurarea Firebase.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Dacă nu există rezidenți, returnăm eroare
    if (residents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No residents found in this location' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construire context pentru AI
    const residentsContext = residents.map(r => `
Nume: ${r.beneficiarNumeComplet}
CNP: ${r.beneficiarCnp}
Data nașterii: ${r.beneficiarDataNasterii}
Diagnostic: ${r.diagnostic || 'N/A'}
Alergii: ${r.alergii || 'N/A'}
Alimentație: ${r.alimentatie || 'N/A'}
Incontinență: ${r.incontinenta || 'N/A'}
Mobilitate: ${r.mobilitate || 'N/A'}
Greutate: ${r.greutate || 'N/A'} kg
Comportament: ${r.comportament || 'N/A'}
Medic de familie: ${r.medicFamilieNume || 'N/A'} (${r.medicFamilieTelefon || 'N/A'})
Tensiune arterială: ${r.tensiuneArteriala || 'N/A'}
Puls: ${r.puls || 'N/A'}
Glicemie: ${r.glicemie || 'N/A'}
Temperatură: ${r.temperatura || 'N/A'}
Saturație oxigen: ${r.saturatieOxigen || 'N/A'}
Escare: ${r.escare || 'N/A'}
Stare generală: ${r.stareGenerala || 'N/A'}
    `.trim()).join('\n\n');

    // Interogare AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Ești un asistent AI specializat în îngrijirea persoanelor în cămine. 
          Ai acces la datele medicale și personale ale rezidenților. 
          Răspunde la întrebări despre starea lor de sănătate, medicamente, comportament, etc. 
          Dacă întrebarea se referă la un anumit rezident, oferă informații specifice despre acesta. 
          Dacă întrebarea este generală, oferă statistici sau informații agregate despre toți rezidenții. 
          Datele rezidenților sunt următoarele:\n\n${residentsContext}`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const answer = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        success: true,
        answer,
        residentsCount: residents.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
