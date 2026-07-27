/**
 * API Route: Test OpenAI Connection
 * 
 * GET /api/test-ai
 * 
 * Testează conexiunea cu OpenAI API
 */

import { NextResponse } from 'next/server';
import { openai, MODELS, estimateCost } from '@/lib/openai';

export async function GET() {
  try {
    console.log('🧪 Testare conexiune OpenAI...');

    const response = await openai.chat.completions.create({
      model: MODELS.GPT_4O,
      messages: [
        {
          role: 'user',
          content: 'Răspunde cu "API funcționează perfect!" dacă primești acest mesaj.',
        },
      ],
      max_tokens: 20,
    });

    const message = response.choices[0].message.content;
    const tokensUsed = response.usage?.total_tokens || 0;
    const cost = estimateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    );

    console.log('✅ Test reușit!');
    console.log('📝 Răspuns:', message);
    console.log('🔢 Tokens:', tokensUsed);
    console.log('💰 Cost: $', cost.toFixed(6));

    return NextResponse.json({
      success: true,
      message: message,
      stats: {
        tokensUsed,
        cost: `$${cost.toFixed(6)}`,
        model: MODELS.GPT_4O,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Eroare test AI:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.status || error.code,
      },
      { status: 500 }
    );
  }
}
