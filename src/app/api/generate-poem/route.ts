import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { 
  getAIProvider, 
  getModelId, 
  FREE_MODEL_FALLBACKS, 
  isUsingFreeModel,
  isRateLimitError,
  getDirectGeminiProvider,
  hasDirectGeminiFallback,
  DIRECT_GEMINI_MODEL,
} from '@/lib/ai-provider';
import { 
  checkRateLimit, 
  getClientIP, 
  formatRateLimitMessage,
  DEFAULT_LIMITS,
} from '@/lib/rate-limiter';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Result type for streaming with fallback
type StreamingResult = {
  stream: ReadableStream<Uint8Array>;
  fallbackUsed: boolean;
  modelUsed: string;
  fallbackReason?: string;
};

// Try to start streaming from a model - validates by getting first chunk
// Returns the stream with the first chunk already consumed (we'll prepend it)
async function tryModelStream(
  provider: ReturnType<typeof getAIProvider> | ReturnType<typeof getDirectGeminiProvider>,
  modelId: string,
  prompt: string
): Promise<{ textStream: AsyncIterable<string>; firstChunk: string }> {
  const result = streamText({
    model: provider!(modelId),
    prompt,
    temperature: 0.8,
    // Disable SDK's internal retries - we handle retries ourselves via fallback
    maxRetries: 0,
  });

  const textStream = result.textStream;
  const iterator = textStream[Symbol.asyncIterator]();
  
  // Try to get the first chunk - this validates the model works
  // The error might be thrown here if the model is rate limited
  let firstResult;
  try {
    firstResult = await iterator.next();
  } catch (error) {
    // Re-throw with the original error - this allows fallback detection
    throw error;
  }
  
  if (firstResult.done) {
    // Stream ended without any content - this can happen with rate limits
    // Throw an error that can be detected as rate limit related
    throw new Error('Model returned empty response (possibly rate limited)');
  }
  
  const firstChunk = firstResult.value;
  
  // Create a new async iterable that yields the remaining chunks
  const remainingStream = {
    [Symbol.asyncIterator]: () => iterator,
  };
  
  return { textStream: remainingStream, firstChunk };
}

// Create a streaming response with fallback support
async function streamWithFallback(
  provider: ReturnType<typeof getAIProvider>,
  primaryModelId: string,
  prompt: string
): Promise<StreamingResult> {
  const encoder = new TextEncoder();
  
  // If using a paid model, just try once (no fallback)
  if (!isUsingFreeModel()) {
    console.log(`Using paid model: ${primaryModelId}`);
    const { textStream, firstChunk } = await tryModelStream(provider, primaryModelId, prompt);
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send the first chunk we already got
          controller.enqueue(encoder.encode(firstChunk));
          
          // Stream the rest
          for await (const chunk of textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    
    return {
      stream,
      fallbackUsed: false,
      modelUsed: primaryModelId,
    };
  }

  // For free models, try each in the fallback chain
  const modelsToTry = [
    primaryModelId,
    ...FREE_MODEL_FALLBACKS.filter(m => m !== primaryModelId)
  ];

  let lastError: Error | null = null;
  let fallbackCount = 0;

  // Try all free models via OpenRouter FIRST
  console.log(`🔄 Trying ${modelsToTry.length} free OpenRouter model(s) first...`);
  for (const modelId of modelsToTry) {
    try {
      console.log(`  → Trying OpenRouter model: ${modelId}`);
      const { textStream, firstChunk } = await tryModelStream(provider, modelId, prompt);
      
      console.log(`✓ Success with OpenRouter model: ${modelId}${fallbackCount > 0 ? ` (after ${fallbackCount} fallback(s))` : ''}`);
      
      // Create the streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send the first chunk we already got
            controller.enqueue(encoder.encode(firstChunk));
            
            // Stream the rest
            for await (const chunk of textStream) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });
      
      return {
        stream,
        fallbackUsed: fallbackCount > 0,
        modelUsed: modelId,
        fallbackReason: fallbackCount > 0 ? `${fallbackCount} model(s) were busy` : undefined,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check statusCode first to avoid misclassifying errors
      const errorWithStatus = error as Error & { statusCode?: number; responseBody?: string };
      const statusCode = errorWithStatus.statusCode;
      
      // Handle rate limit errors (429)
      if (statusCode === 429 || isRateLimitError(error)) {
        console.log(`  ✗ Rate limited on OpenRouter model ${modelId}, trying next...`);
        fallbackCount++;
        continue;
      }
      
      // For non-rate-limit errors (404, 400, etc.), also try next model
      // This handles cases where a model doesn't exist, is invalid, or requires configuration
      if (statusCode === 404 || statusCode === 400) {
        const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
        const responseBody = errorWithStatus.responseBody || '';
        const fullErrorText = (errorMessage + ' ' + responseBody).toLowerCase();
        
        // Check if it's a data policy/privacy configuration issue
        if (fullErrorText.includes('data policy') || fullErrorText.includes('privacy')) {
          console.log(`  ✗ OpenRouter model ${modelId} requires privacy settings configuration (see https://openrouter.ai/settings/privacy), trying next...`);
        } else {
          console.log(`  ✗ OpenRouter model ${modelId} unavailable (${statusCode}), trying next...`);
        }
        fallbackCount++;
        continue;
      }
      
      // For other errors, throw immediately
      console.error(`  ✗ Error on OpenRouter model ${modelId}:`, error);
      throw error;
    }
  }

  // FINAL FALLBACK: Try direct Gemini API if configured
  if (hasDirectGeminiFallback()) {
    try {
      console.log(`⚠️ All ${modelsToTry.length} free OpenRouter models failed. Falling back to direct Gemini API (using your quota)...`);
      
      const directGeminiProvider = getDirectGeminiProvider();
      if (directGeminiProvider) {
        const { textStream, firstChunk } = await tryModelStream(directGeminiProvider, DIRECT_GEMINI_MODEL, prompt);
        
        console.log(`✓ Success with direct Gemini API (fallback)`);
        
        const stream = new ReadableStream({
          async start(controller) {
            try {
              controller.enqueue(encoder.encode(firstChunk));
              for await (const chunk of textStream) {
                controller.enqueue(encoder.encode(chunk));
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });
        
        return {
          stream,
          fallbackUsed: true,
          modelUsed: 'direct-gemini',
          fallbackReason: 'All free models were busy, used backup',
        };
      }
    } catch (error) {
      console.error('✗ Direct Gemini API fallback also failed:', error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // If all models failed, throw the last error
  throw lastError || new Error('All models are currently unavailable. Please try again in a moment.');
}

export async function POST(request: NextRequest) {
  try {
    // === RATE LIMITING ===
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(clientIP, DEFAULT_LIMITS);
    
    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limited: ${clientIP} - remaining: min=${rateLimitResult.remaining.minute}, hour=${rateLimitResult.remaining.hour}, day=${rateLimitResult.remaining.day}`);
      
      // Determine which limit to show in Retry-After
      let retryAfter = rateLimitResult.resetIn.minute;
      if (rateLimitResult.remaining.hour <= 0) retryAfter = rateLimitResult.resetIn.hour;
      if (rateLimitResult.remaining.day <= 0) retryAfter = rateLimitResult.resetIn.day;
      
      return new Response(
        JSON.stringify({ 
          error: formatRateLimitMessage(rateLimitResult, 'nl'),
          remaining: rateLimitResult.remaining,
          resetIn: rateLimitResult.resetIn,
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit-Minute': String(DEFAULT_LIMITS.perMinute),
            'X-RateLimit-Limit-Hour': String(DEFAULT_LIMITS.perHour),
            'X-RateLimit-Limit-Day': String(DEFAULT_LIMITS.perDay),
            'X-RateLimit-Remaining-Minute': String(rateLimitResult.remaining.minute),
            'X-RateLimit-Remaining-Hour': String(rateLimitResult.remaining.hour),
            'X-RateLimit-Remaining-Day': String(rateLimitResult.remaining.day),
          } 
        }
      );
    }
    
    const body = await request.json();
    const {
      recipientName,
      recipientFacts,
      numLines,
      isClassic,
      friendliness,
      isHumanize,
      authorAge,
      authorGender,
      poemLanguage = 'nl',
    } = body;

    // Validate required fields
    if (!recipientName || recipientName.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Naam ontvanger is verplicht' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate humanize fields if humanize is enabled
    if (isHumanize) {
      if (!authorAge || authorAge.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Leeftijd schrijver is verplicht bij Humanize modus' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (!authorGender || authorGender.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Geslacht schrijver is verplicht bij Humanize modus' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Determine style and tone
    const tone =
      friendliness > 70
        ? 'heel vriendelijk en positief'
        : friendliness > 40
          ? 'neutraal en gebalanceerd'
          : 'grappig en scherp met een vleugje humor';

    // Build humanize instructions based on age and gender
    const getHumanizeInstructions = () => {
      if (!isHumanize || !authorAge || !authorGender) return '';

      const age = Number.parseInt(authorAge);
      const isYoung = age < 10;
      const isTeen = age >= 10 && age < 18;

      let twirks = '';

      const getGenderLabel = (age: number, gender: string) => {
        if (age < 10) {
          return gender === 'jongen' ? 'jongetje' : 'meisje';
        } else if (age < 18) {
          return gender === 'jongen' ? 'jongen' : 'meisje';
        } else {
          return gender === 'man' ? 'man' : 'vrouw';
        }
      };

      const genderLabel = getGenderLabel(age, authorGender);

      if (isYoung) {
        twirks = `- Voeg 2-3 kleine foutjes toe die typisch zijn voor een ${age}-jarig ${genderLabel}:
  * Kleine spelfouten (bijvoorbeeld "sint" i.p.v. "Sint", of "piet" i.p.v. "Piet")
  * Eenvoudige woordkeuze en korte zinnen
  * Soms een woord dat niet helemaal klopt maar wel logisch is
  * Mogelijk een kleine grammaticafout die natuurlijk klinkt voor deze leeftijd`;
      } else if (isTeen) {
        twirks = `- Voeg 2-3 kleine foutjes toe die typisch zijn voor een ${age}-jarige ${genderLabel}:
  * Soms een woord vergeten of een kleine typo
  * Mogelijk een informele woordkeuze die tussendoor sluipt
  * Een kleine inconsistentie in spelling (bijvoorbeeld "Sint" en "sint" door elkaar)
  * Soms een woord dat bijna goed is maar net niet perfect`;
      } else {
        twirks = `- Voeg 2-3 subtiele foutjes toe die typisch zijn voor een ${age}-jarige ${genderLabel}:
  * Een kleine spelfout of typo die snel gemaakt kan worden
  * Mogelijk een woord dat verkeerd gespeld is maar wel begrijpelijk
  * Soms een kleine grammatica-inconsistentie
  * Een subtiele fout die suggereert dat het handgeschreven zou kunnen zijn`;
      }

      return `\n\nBELANGRIJK - HUMANIZE MODUS:\nHet gedicht wordt geschreven door een ${age}-jarige ${genderLabel} en moet daarom authentiek klinken:\n${twirks}\n- De foutjes moeten subtiel en natuurlijk zijn - niet te opvallend\n- Het gedicht moet nog steeds leesbaar en begrijpelijk zijn`;
    };

    // Map poem language codes to language names
    const languageMap: Record<string, string> = {
      nl: 'Nederlands',
      en: 'English',
      ar: 'Arabic',
      tr: 'Turkish',
    };

    const poemLangName = languageMap[poemLanguage] || 'Nederlands';

    // Build the prompt
    let prompt = '';
    
    if (isClassic) {
      prompt = `Schrijf een klassiek Sinterklaas gedicht in het ${poemLangName} voor ${recipientName}.

Belangrijke instructies voor klassieke stijl:
- Het gedicht moet precies ${numLines} regels bevatten
- Gebruik een strikte structuur: groepeer regels in sets van 4 (bijvoorbeeld voor 12 regels: 4+4+4)
- Elke groep van 4 regels moet een AABB rijmstructuur hebben (regel 1 rijmt met regel 2, regel 3 rijmt met regel 4)
- De toon moet ${tone} zijn
- Het gedicht moet persoonlijk zijn en verwijzen naar ${recipientName}
${
  recipientFacts && recipientFacts.trim() !== ''
    ? `- Gebruik deze feiten over ${recipientName}: ${recipientFacts}`
    : ''
}
- Het gedicht moet traditioneel Nederlands zijn, zoals klassieke Sinterklaas gedichten
- Begin met "Lieve ${recipientName}," of "Beste ${recipientName},"
- Maak het gedicht grappig, persoonlijk en passend bij de Sinterklaas traditie
- Gebruik geen emoji's in het gedicht zelf
- Gebruik NOOIT de term "zwarte piet" - gebruik alleen "Piet" of "Sint en Piet"
- Verwijs NOOIT naar de kleur van Piet of naar kleuren in relatie tot mensen of personages
- Houd je strikt aan de 4-regel groepen structuur${getHumanizeInstructions()}

BELANGRIJK: Begin je antwoord met "Madrid, 5 december" gevolgd door twee lege regels, en eindig met twee lege regels gevolgd door "Sint en Piet".

Schrijf alleen het gedicht, zonder extra uitleg of opmerkingen.`;
    } else {
      prompt = `Schrijf een vrij stromend Sinterklaas gedicht in het ${poemLangName} voor ${recipientName}.

Belangrijke instructies voor vrije stromende stijl:
- Het gedicht moet ongeveer ${numLines} regels bevatten (mag iets afwijken)
- Gebruik VARIABELE regelgroepen: bijvoorbeeld 2+3+7, of 3+5+4, of 2+4+6, etc. (niet altijd 4+4+4)
- Rijm is OPTIONEEL en mag variëren: sommige regels kunnen rijmen, andere niet
- Als je rijmt, gebruik verschillende patronen: AABB, ABAB, ABCB, of zelfs alleen sporadisch rijmen
- De toon moet ${tone} zijn
- Het gedicht moet persoonlijk zijn en verwijzen naar ${recipientName}
${
  recipientFacts && recipientFacts.trim() !== ''
    ? `- Gebruik deze feiten over ${recipientName}: ${recipientFacts}`
    : ''
}
- Het gedicht moet modern en vrij zijn, maar nog steeds passend bij de Sinterklaas traditie
- Begin met "Lieve ${recipientName}," of "Beste ${recipientName}," of een andere persoonlijke opening
- Maak het gedicht grappig, persoonlijk en natuurlijk klinkend
- Gebruik geen emoji's in het gedicht zelf
- Gebruik NOOIT de term "zwarte piet" - gebruik alleen "Piet" of "Sint en Piet"
- Verwijs NOOIT naar de kleur van Piet of naar kleuren in relatie tot mensen of personages
- Laat de structuur natuurlijk en vrij stromen - geen strikte patronen${getHumanizeInstructions()}

BELANGRIJK: Begin je antwoord met "Madrid, 5 december" gevolgd door twee lege regels, en eindig met twee lege regels gevolgd door "Sint en Piet".

Schrijf alleen het gedicht, zonder extra uitleg of opmerkingen.`;
    }

    // Get the AI provider and primary model
    const provider = getAIProvider();
    const primaryModelId = getModelId();

    // Stream with automatic fallback for free models
    const { stream, fallbackUsed, modelUsed, fallbackReason } = await streamWithFallback(
      provider,
      primaryModelId,
      prompt
    );
    
    // Log summary for terminal visibility
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 POEM GENERATION STARTED (STREAMING)');
    console.log('───────────────────────────────────────────────────────');
    console.log(`   Model used:     ${modelUsed}`);
    console.log(`   Fallback:       ${fallbackUsed ? `Yes (${fallbackReason})` : 'No'}`);
    console.log(`   Recipient:      ${recipientName}`);
    console.log(`   Style:          ${isClassic ? 'Classic' : 'Free-flowing'}`);
    console.log(`   Lines:          ${numLines}`);
    console.log(`   Language:       ${poemLanguage}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    // Return the streaming response with custom headers for fallback status and rate limits
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Fallback-Used': fallbackUsed ? 'true' : 'false',
        'X-Model-Used': modelUsed,
        ...(fallbackReason ? { 'X-Fallback-Reason': fallbackReason } : {}),
        // Rate limit info for the client
        'X-RateLimit-Limit-Minute': String(DEFAULT_LIMITS.perMinute),
        'X-RateLimit-Limit-Hour': String(DEFAULT_LIMITS.perHour),
        'X-RateLimit-Limit-Day': String(DEFAULT_LIMITS.perDay),
        'X-RateLimit-Remaining-Minute': String(rateLimitResult.remaining.minute),
        'X-RateLimit-Remaining-Hour': String(rateLimitResult.remaining.hour),
        'X-RateLimit-Remaining-Day': String(rateLimitResult.remaining.day),
      },
    });
    
  } catch (error) {
    console.error('Error generating poem:', error);
    
    // Check if it's a rate limit error (all models exhausted)
    if (isRateLimitError(error)) {
      return new Response(
        JSON.stringify({ 
          error: 'Alle gratis modellen zijn momenteel druk. Probeer het over een paar seconden opnieuw.' 
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error
            ? error.message
            : 'Er is een fout opgetreden bij het genereren van het gedicht',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
