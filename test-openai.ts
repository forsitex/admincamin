import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('🚀 Testare conexiune OpenAI...\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: "Spune 'Funcționează perfect!' dacă primești acest mesaj."
      }],
      max_tokens: 20
    });
    
    console.log('✅ SUCCESS! OpenAI API funcționează!\n');
    console.log('📝 Răspuns:', response.choices[0].message.content);
    console.log('🔢 Tokens folosiți:', response.usage?.total_tokens);
    console.log('💰 Cost estimat: $', ((response.usage?.total_tokens || 0) * 0.0000025).toFixed(6));
    console.log('\n✨ Gata de dezvoltare! Poți începe să implementezi feature-ul AI pentru contracte.\n');
    
  } catch (error: any) {
    console.error('❌ EROARE:', error.message);
    
    if (error.status === 401) {
      console.error('\n→ API Key invalid! Verifică .env.local');
      console.error('→ Asigură-te că ai copiat cheia completă');
    }
    if (error.status === 429) {
      console.error('\n→ Rate limit sau credit insuficient!');
      console.error('→ Verifică: https://platform.openai.com/usage');
    }
    if (error.status === 500) {
      console.error('\n→ Eroare server OpenAI. Încearcă din nou în câteva secunde.');
    }
    if (error.code === 'ENOTFOUND') {
      console.error('\n→ Probleme de conexiune la internet.');
    }
  }
}

console.log('═══════════════════════════════════════════════════════');
console.log('   TEST OpenAI API - iEmpathy Platform');
console.log('═══════════════════════════════════════════════════════\n');

testOpenAI();
