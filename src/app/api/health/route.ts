import { generateText } from 'ai';
import {
  getAIProvider,
  getDirectGeminiProvider,
  FREE_MODEL_FALLBACKS,
  DIRECT_GEMINI_FALLBACK_MODELS,
  hasDirectGeminiFallback,
} from '@/lib/ai-provider';

export const maxDuration = 30;

const PROMPT = 'Reply with exactly one word: OK';

type ModelResult = {
  model: string;
  provider: 'openrouter' | 'direct-gemini';
  ok: boolean;
  error?: string;
};

async function testModel(
  provider: ReturnType<typeof getAIProvider> | ReturnType<typeof getDirectGeminiProvider>,
  modelId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await generateText({
      model: provider!(modelId),
      prompt: PROMPT,
      maxTokens: 10,
      maxRetries: 0,
    });
    return { ok: true };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const status = (e as Error & { statusCode?: number }).statusCode;
    return { ok: false, error: `${status ?? 'err'}: ${e.message.slice(0, 120)}` };
  }
}

export async function GET() {
  const results: ModelResult[] = [];

  const openRouterProvider = getAIProvider();
  for (const modelId of FREE_MODEL_FALLBACKS) {
    const result = await testModel(openRouterProvider, modelId);
    results.push({ model: modelId, provider: 'openrouter', ...result });
  }

  if (hasDirectGeminiFallback()) {
    const geminiProvider = getDirectGeminiProvider();
    if (geminiProvider) {
      for (const modelId of DIRECT_GEMINI_FALLBACK_MODELS) {
        const result = await testModel(geminiProvider, modelId);
        results.push({ model: modelId, provider: 'direct-gemini', ...result });
      }
    }
  }

  const anyOk = results.some((r) => r.ok);
  const status = anyOk ? 200 : 503;

  return Response.json(
    {
      status: anyOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      models: results,
    },
    { status },
  );
}
