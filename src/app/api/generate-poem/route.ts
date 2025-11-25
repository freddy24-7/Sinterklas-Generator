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

    // Build the prompt with different instructions for classic vs free-flowing
    let prompt = '';
    
    if (isClassic) {
      // Classic style: strict 4+4+4 pattern
      prompt = `Schrijf een klassiek Sinterklaas gedicht in het Nederlands voor ${recipientName}.

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
- Houd je strikt aan de 4-regel groepen structuur

Schrijf alleen het gedicht, zonder extra uitleg of opmerkingen.`;
    } else {
      // Free-flowing style: variable line groupings, less strict rhyming
      prompt = `Schrijf een vrij stromend Sinterklaas gedicht in het Nederlands voor ${recipientName}.

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
- Laat de structuur natuurlijk en vrij stromen - geen strikte patronen

Schrijf alleen het gedicht, zonder extra uitleg of opmerkingen.`;
    }

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


