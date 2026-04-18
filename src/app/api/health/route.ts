import {
  FREE_MODEL_FALLBACKS,
  DIRECT_GEMINI_FALLBACK_MODELS,
  hasDirectGeminiFallback,
} from '@/lib/ai-provider';

export const maxDuration = 30;

// Validates the Gemini API key by listing models — zero token cost
async function checkGeminiKey(): Promise<{ ok: boolean; error?: string; models?: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, error: 'GEMINI_API_KEY not set' };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `${res.status}: ${body.slice(0, 120)}` };
    }
    const data = await res.json() as { models?: Array<{ name: string }> };
    const available = (data.models ?? []).map((m) => m.name.replace('models/', ''));
    const configured = DIRECT_GEMINI_FALLBACK_MODELS.filter((m) => available.includes(m));
    return {
      ok: configured.length > 0,
      models: configured,
      ...(configured.length === 0 ? { error: 'None of the configured models are available' } : {}),
    };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    return { ok: false, error: e.message.slice(0, 120) };
  }
}

// Validates the OpenRouter key with a lightweight account check — zero token cost
async function checkOpenRouterKey(): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, error: 'OPENROUTER_API_KEY not set' };
  if (FREE_MODEL_FALLBACKS.length === 0) return { ok: true, error: 'no free models configured' };

  try {
    const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { ok: false, error: `${res.status}: invalid or expired key` };
    }
    return { ok: true };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    return { ok: false, error: e.message.slice(0, 120) };
  }
}

export async function GET() {
  const [gemini, openrouter] = await Promise.all([
    hasDirectGeminiFallback() ? checkGeminiKey() : Promise.resolve(null),
    checkOpenRouterKey(),
  ]);

  const ok = gemini?.ok || openrouter.ok;

  return Response.json(
    {
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      gemini: gemini ?? { ok: false, error: 'not configured' },
      openrouter,
    },
    { status: ok ? 200 : 503 },
  );
}
