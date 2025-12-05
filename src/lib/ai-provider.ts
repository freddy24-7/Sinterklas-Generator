import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// OpenRouter is OpenAI-compatible, so we use the OpenAI provider with custom baseURL
export function getAIProvider() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY not found. Please add it to your .env file. ' +
      'Get your free API key at https://openrouter.ai/keys'
    );
  }

  return createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    headers: {
      'HTTP-Referer': process.env.SITE_URL || 'https://www.sinterklaas-poem.nl',
      'X-Title': 'Sinterklaas Gedichten Generator',
    },
  });
}

// Direct Google Gemini provider (uses your own API key and quota)
export function getDirectGeminiProvider() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return null; // No direct Gemini key configured
  }

  return createGoogleGenerativeAI({
    apiKey,
  });
}

// Check if direct Gemini fallback is available
export function hasDirectGeminiFallback(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

// Get the direct Gemini model ID
export const DIRECT_GEMINI_MODEL = 'gemini-2.0-flash';

// Available models through OpenRouter
// Free models are marked with :free suffix
export const AVAILABLE_MODELS = {
  // Free tier models (great for development)
  'gemini-2.0-flash-free': 'google/gemini-2.0-flash-exp:free',
  'gemini-flash-free': 'google/gemini-flash-1.5-8b-exp',
  'llama-3.1-8b': 'meta-llama/llama-3.1-8b-instruct:free',
  
  // Paid but affordable models
  'gemini-2.0-flash': 'google/gemini-2.0-flash-001',
  'gemini-1.5-flash': 'google/gemini-flash-1.5',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'claude-3-haiku': 'anthropic/claude-3-haiku',
  
  // Premium models (best quality)
  'gpt-4o': 'openai/gpt-4o',
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  'gemini-1.5-pro': 'google/gemini-pro-1.5',
} as const;

export type ModelKey = keyof typeof AVAILABLE_MODELS;

// Free models to try in order when rate limited (fallback chain)
export const FREE_MODEL_FALLBACKS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemini-flash-1.5-8b-exp',
] as const;

// Get the primary model to use - defaults to free Gemini
export function getModelId(): string {
  const modelKey = (process.env.AI_MODEL || 'gemini-2.0-flash-free') as ModelKey;
  return AVAILABLE_MODELS[modelKey] || AVAILABLE_MODELS['gemini-2.0-flash-free'];
}

// Check if the configured model is a free model (uses fallback chain)
export function isUsingFreeModel(): boolean {
  const modelId = getModelId();
  return FREE_MODEL_FALLBACKS.includes(modelId as typeof FREE_MODEL_FALLBACKS[number]);
}

// Check if an error is a rate limit error (429)
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate') ||
      message.includes('429') ||
      message.includes('too many requests') ||
      message.includes('temporarily rate-limited')
    );
  }
  return false;
}

