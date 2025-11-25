import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment - check multiple possible variable names
function getApiKey(): string {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'API key niet gevonden. Zorg ervoor dat GOOGLE_GENAI_API_KEY of GEMINI_API_KEY in je .env bestand staat.'
    );
  }

  return apiKey;
}

// Get model name from environment or use default
function getModelName(): string {
  return (
    process.env.GOOGLE_GENERATIVE_AI_MODEL ||
    process.env.GEMINI_MODEL ||
    'gemini-2.0-flash'
  );
}

function getModel() {
  const apiKey = getApiKey();
  const ai = new GoogleGenerativeAI(apiKey);
  const modelName = getModelName();
  return ai.getGenerativeModel({ model: modelName });
}

export async function getGeminiResponse(
  prompt: string,
  outputLanguage: string = 'nl'
): Promise<string> {
  const model = getModel();

  // Count tokens before making the request
  const { totalTokens } = await model.countTokens(prompt);
  console.log(`Request token count: ${totalTokens}`);

  // Add output language instruction to the prompt
  const languagePrompt = `${prompt}\n\nPlease provide your response in ${outputLanguage}.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: languagePrompt }] }],
  });

  return result.response.text();
}

