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
      isHumanize,
      authorAge,
      authorGender,
    } = body;

    // Validate required fields
    if (!recipientName || recipientName.trim() === '') {
      return NextResponse.json(
        { error: 'Naam ontvanger is verplicht' },
        { status: 400 }
      );
    }

    // Validate humanize fields if humanize is enabled
    if (isHumanize) {
      if (!authorAge || authorAge.trim() === '') {
        return NextResponse.json(
          { error: 'Leeftijd schrijver is verplicht bij Humanize modus' },
          { status: 400 }
        );
      }
      if (!authorGender || authorGender.trim() === '') {
        return NextResponse.json(
          { error: 'Geslacht schrijver is verplicht bij Humanize modus' },
          { status: 400 }
        );
      }
    }

    // Determine style and tone
    const style = isClassic ? 'klassiek' : 'vrij stromend';
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
      const isAdult = age >= 18;

      let twirks = '';

      // Determine gender label based on age and gender value
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
        // Young children (5-9)
        twirks = `- Voeg 2-3 kleine foutjes toe die typisch zijn voor een ${age}-jarig ${genderLabel}:
  * Kleine spelfouten (bijvoorbeeld "sint" i.p.v. "Sint", of "piet" i.p.v. "Piet")
  * Eenvoudige woordkeuze en korte zinnen
  * Soms een woord dat niet helemaal klopt maar wel logisch is
  * Mogelijk een kleine grammaticafout die natuurlijk klinkt voor deze leeftijd`;
      } else if (isTeen) {
        // Teenagers (10-17)
        twirks = `- Voeg 2-3 kleine foutjes toe die typisch zijn voor een ${age}-jarige ${genderLabel}:
  * Soms een woord vergeten of een kleine typo
  * Mogelijk een informele woordkeuze die tussendoor sluipt
  * Een kleine inconsistentie in spelling (bijvoorbeeld "Sint" en "sint" door elkaar)
  * Soms een woord dat bijna goed is maar net niet perfect`;
      } else {
        // Adults (18+)
        twirks = `- Voeg 2-3 subtiele foutjes toe die typisch zijn voor een ${age}-jarige ${genderLabel}:
  * Een kleine spelfout of typo die snel gemaakt kan worden
  * Mogelijk een woord dat verkeerd gespeld is maar wel begrijpelijk
  * Soms een kleine grammatica-inconsistentie
  * Een subtiele fout die suggereert dat het handgeschreven zou kunnen zijn`;
      }

      return `\n\nBELANGRIJK - HUMANIZE MODUS:\nHet gedicht wordt geschreven door een ${age}-jarige ${genderLabel} en moet daarom authentiek klinken:\n${twirks}\n- De foutjes moeten subtiel en natuurlijk zijn - niet te opvallend\n- Het gedicht moet nog steeds leesbaar en begrijpelijk zijn`;
    };

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
- Gebruik NOOIT de term "zwarte piet" - gebruik alleen "Piet" of "Sint en Piet"
- Verwijs NOOIT naar de kleur van Piet of naar kleuren in relatie tot mensen of personages (bijvoorbeeld "zwart", "zo zwart als roet", of andere kleurverwijzingen)
- Houd je strikt aan de 4-regel groepen structuur${getHumanizeInstructions()}

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
- Gebruik NOOIT de term "zwarte piet" - gebruik alleen "Piet" of "Sint en Piet"
- Verwijs NOOIT naar de kleur van Piet of naar kleuren in relatie tot mensen of personages (bijvoorbeeld "zwart", "zo zwart als roet", of andere kleurverwijzingen)
- Laat de structuur natuurlijk en vrij stromen - geen strikte patronen${getHumanizeInstructions()}

Schrijf alleen het gedicht, zonder extra uitleg of opmerkingen.`;
    }

    // Generate the poem using the Gemini utility
    const poem = await getGeminiResponse(prompt, 'nl');

    // Clean up the poem (remove any markdown formatting if present)
    let cleanedPoem = poem
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .trim();

    // Filter out problematic terms and color references related to Piet or people
    // Replace "zwarte piet" with "Piet"
    cleanedPoem = cleanedPoem.replace(/\b[zZ]warte\s+[pP]iet\b/gi, 'Piet');
    
    // Remove the specific problematic phrase "zo zwart als roet" entirely
    cleanedPoem = cleanedPoem.replace(/\bzo\s+zwart\s+als\s+roet\b/gi, '');
    
    // Remove "als roet" phrase (common variation)
    cleanedPoem = cleanedPoem.replace(/\bals\s+roet\b/gi, '');
    
    // Filter out "zwart" or "zwarte" when it appears in the same line as "Piet"
    // Process line by line to avoid false positives
    const lines = cleanedPoem.split('\n');
    const filteredLines = lines.map((line) => {
      // If line contains "Piet", remove color-related words from that line
      if (/\b[Pp]iet\b/i.test(line)) {
        // Remove "zwart" or "zwarte" from lines containing "Piet"
        line = line.replace(/\b[zZ]warte?\b/gi, '');
      }
      return line;
    });
    cleanedPoem = filteredLines.join('\n');
    
    // Clean up any double spaces or awkward spacing created by replacements
    cleanedPoem = cleanedPoem.replace(/\s{2,}/g, ' '); // Multiple spaces to single space
    cleanedPoem = cleanedPoem.replace(/\n\s+/g, '\n'); // Spaces after newlines
    cleanedPoem = cleanedPoem.replace(/\s+\n/g, '\n'); // Spaces before newlines
    cleanedPoem = cleanedPoem.trim();

    // Add required header and footer
    const header = 'Madrid, 5 december\n\n';
    const footer = '\n\nSint en Piet';

    // Ensure the poem doesn't already start/end with these
    if (!cleanedPoem.startsWith('Madrid')) {
      cleanedPoem = header + cleanedPoem;
    }
    if (!cleanedPoem.endsWith('Sint en Piet')) {
      cleanedPoem = cleanedPoem + footer;
    }

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


