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

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Result type for fallback tracking
type GenerationResult = {
  text: string;
  fallbackUsed: boolean;
  modelUsed: string;
  fallbackReason?: string;
};

// Try a single model and return the full text, or throw if it fails
// We get the full response to ensure the model works before returning
async function tryModel(
  provider: ReturnType<typeof getAIProvider> | ReturnType<typeof getDirectGeminiProvider>,
  modelId: string,
  prompt: string
): Promise<string> {
  const result = streamText({
    model: provider!(modelId),
    prompt,
    temperature: 0.8,
    // Disable SDK's internal retries - we handle retries ourselves via fallback
    maxRetries: 0,
  });

  // Get the full text - this will throw if rate limited
  // We sacrifice streaming to ensure reliable fallback
  const text = await result.text;
  
  return text;
}

// Generate with automatic fallback for free models
async function generateWithFallback(
  provider: ReturnType<typeof getAIProvider>,
  primaryModelId: string,
  prompt: string
): Promise<GenerationResult> {
  // If using a paid model, just try once (no fallback)
  if (!isUsingFreeModel()) {
    console.log(`Using paid model: ${primaryModelId}`);
    const text = await tryModel(provider, primaryModelId, prompt);
    return {
      text,
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

  // Try all free models via OpenRouter
  for (const modelId of modelsToTry) {
    try {
      console.log(`Trying model: ${modelId}`);
      const text = await tryModel(provider, modelId, prompt);
      
      console.log(`✓ Success with model: ${modelId}${fallbackCount > 0 ? ` (after ${fallbackCount} fallback(s))` : ''}`);
      
      return {
        text,
        fallbackUsed: fallbackCount > 0,
        modelUsed: modelId,
        fallbackReason: fallbackCount > 0 ? `${fallbackCount} model(s) were busy` : undefined,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (isRateLimitError(error)) {
        console.log(`✗ Rate limited on ${modelId}, trying next model...`);
        fallbackCount++;
        continue;
      }
      
      // For non-rate-limit errors, throw immediately
      console.error(`✗ Error on ${modelId}:`, error);
      throw error;
    }
  }

  // FINAL FALLBACK: Try direct Gemini API if configured
  if (hasDirectGeminiFallback()) {
    try {
      console.log(`All free models exhausted. Falling back to direct Gemini API (using your quota)...`);
      
      const directGeminiProvider = getDirectGeminiProvider();
      if (directGeminiProvider) {
        const text = await tryModel(directGeminiProvider, DIRECT_GEMINI_MODEL, prompt);
        
        console.log(`✓ Success with direct Gemini API (backup)`);
        
        return {
          text,
          fallbackUsed: true,
          modelUsed: 'direct-gemini',
          fallbackReason: 'All free models were busy, used backup',
        };
      }
    } catch (error) {
      console.error('✗ Direct Gemini API also failed:', error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // If all models failed, throw the last error
  throw lastError || new Error('All free models are currently rate limited. Please try again in a moment.');
}

export async function POST(request: NextRequest) {
  try {
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

    // Generate with automatic fallback for free models
    const { text, fallbackUsed, modelUsed, fallbackReason } = await generateWithFallback(
      provider,
      primaryModelId,
      prompt
    );
    
    // Return the poem text with custom headers for fallback status
    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Fallback-Used': fallbackUsed ? 'true' : 'false',
        'X-Model-Used': modelUsed,
        ...(fallbackReason ? { 'X-Fallback-Reason': fallbackReason } : {}),
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
