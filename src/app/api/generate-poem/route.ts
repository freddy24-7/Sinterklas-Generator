import { NextRequest, NextResponse } from 'next/server';
import { getGeminiResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientName,
      recipientFacts,
      numLines,
      isClassic,
      friendliness,
    } = body;

    // Validate required fields
    if (!recipientName || recipientName.trim() === '') {
      return NextResponse.json(
        { error: 'Naam ontvanger is verplicht' },
        { status: 400 }
      );
    }

    // Determine style and tone
    const style = isClassic ? 'klassiek' : 'vrij stromend';
    const tone =
      friendliness > 70
        ? 'heel vriendelijk en positief'
        : friendliness > 40
          ? 'neutraal en gebalanceerd'
          : 'grappig en scherp met een vleugje humor';

    // Build the prompt
    const prompt = `Schrijf een ${style} Sinterklaas gedicht in het Nederlands voor ${recipientName}.

Belangrijke instructies:
- Het gedicht moet precies ${numLines} regels bevatten
- De stijl moet ${style} zijn
- De toon moet ${tone} zijn
- Het gedicht moet persoonlijk zijn en verwijzen naar ${recipientName}
${
  recipientFacts && recipientFacts.trim() !== ''
    ? `- Gebruik deze feiten over ${recipientName}: ${recipientFacts}`
    : ''
}
- Het gedicht moet traditioneel Nederlands zijn, zoals Sinterklaas gedichten
- Elke regel moet rijmen (AABB of ABAB patroon)
- Begin met "Lieve ${recipientName}," of "Beste ${recipientName},"
- Maak het gedicht grappig, persoonlijk en passend bij de Sinterklaas traditie
- Gebruik geen emoji's in het gedicht zelf

Schrijf alleen het gedicht, zonder extra uitleg of opmerkingen.`;

    // Generate the poem using the Gemini utility
    const poem = await getGeminiResponse(prompt, 'nl');

    // Clean up the poem (remove any markdown formatting if present)
    const cleanedPoem = poem
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .trim();

    return NextResponse.json({ poem: cleanedPoem });
  } catch (error) {
    console.error('Error generating poem:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Er is een fout opgetreden bij het genereren van het gedicht',
      },
      { status: 500 }
    );
  }
}


