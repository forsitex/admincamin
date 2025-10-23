/**
 * OpenAI Client Configuration
 * 
 * Acest fișier configurează clientul OpenAI pentru întreaga aplicație.
 * API Key-ul este încărcat automat din .env.local
 */

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    'OPENAI_API_KEY lipsește din variabilele de mediu. ' +
    'Verifică că ai creat fișierul .env.local cu cheia API.'
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Modele disponibile
 */
export const MODELS = {
  GPT_4O: 'gpt-4o', // Pentru analiză contracte (cu Vision)
  GPT_4_TURBO: 'gpt-4-turbo', // Pentru alte task-uri AI
} as const;

/**
 * Costuri estimate per 1M tokens
 */
export const COSTS = {
  GPT_4O_INPUT: 2.50,
  GPT_4O_OUTPUT: 10.00,
} as const;

/**
 * Calculează costul estimat pentru un request
 */
export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * COSTS.GPT_4O_INPUT;
  const outputCost = (outputTokens / 1_000_000) * COSTS.GPT_4O_OUTPUT;
  return inputCost + outputCost;
}
