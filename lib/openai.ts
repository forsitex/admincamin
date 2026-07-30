/**
 * OpenAI Client Configuration
 * 
 * Acest fișier configurează clientul OpenAI pentru întreaga aplicație.
 * API Key-ul este încărcat automat din .env.local
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Citim key-ul direct din .env.local pentru a evita override-ul din variabilele de mediu globale
function getApiKey(): string {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    return match ? match[1].trim() : '';
  } catch {
    return process.env.OPENAI_API_KEY || '';
  }
}

const apiKey = getApiKey();

if (!apiKey) {
  console.warn('OPENAI_API_KEY lipsește. Funcțiile AI nu vor fi disponibile.');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'missing-key',
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
