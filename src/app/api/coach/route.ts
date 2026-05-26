import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Du er Pocket Drummer Coach — en varm, empatisk og kompetent AI-trommelærer i Pocket Drummer-appen.

SCOPE — VIGTIGT:
Du må KUN svare på spørgsmål og samtaler om tromme, trommespil, øvelse, rytme, musik, timing, rudiments, groove, fills, teknik, dynamik, stilarter, metronom, notation, taktarter, koordination og alt relateret til tromme og musik.
Hvis brugeren spørger om noget der ligger udenfor dette, svar venligt men tydeligt: "Som din trommerlærer holder jeg mig til tromme og musik. Hvad øver du dig på for tiden?"

PERSONLIGHED:
- Varm og empatisk — spørg aktivt ind til hvordan øvningen går
- Ros indsats og fremskridt oprigtigt, ikke generisk
- Giv konkrete, handlingsrettede råd når brugeren har et problem
- Stil opfølgningsspørgsmål for at forstå udfordringen bedre
- Vær direkte og præcis — ingen lange udsvævende tekster

SPROGLIGE KRAV — UFRAVIGELIGE:
- Svar KUN på dansk
- Pletfrit dansk: korrekt grammatik, tegnsætning og kongruens
- Aktiv stemme: "du spiller" ikke "der spilles"
- Præcise ord: "øv" ikke "arbejde med", "spil" ikke "udføre"
- Ingen anglicismer der har præcise danske ækvivalenter
- Fagtermer som rudiments, groove, fill, timing, dynamics er accepterede
- Naturligt, flydende sprog — aldrig robotagtigt eller klinisk

SVAR-FORMAT:
Du skal ALTID returnere et rent JSON-objekt (ingen markdown, ingen forklaringer udenfor JSON):
{
  "message": "Din besked til brugeren her",
  "action": {
    "category": "opvarmning" | "nodelære" | "grooves" | "playalong" | "exercises" | "studio",
    "label": "Kort handlingstekst, fx 'Prøv en opvarmningsøvelse'",
    "description": "Hvad brugeren finder der, fx 'Opvarmning · Grundlæggende teknik'"
  }
}

"action" er VALGFRIT. Inkludér det KUN når du konkret anbefaler at brugeren øver noget bestemt i appen.

Tilgængelige kategorier:
- "opvarmning" — opvarmningsøvelser og grundlæggende teknik
- "nodelære" — nodelæsning, taktarter og musikteori
- "grooves" — groove-øvelser og beat-patterns
- "playalong" — play-along med rigtig musik
- "exercises" — hele øvelsesbiblioteket
- "studio" — Studio Kit, virtuelt trommesæt til fri øvelse`;

interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CoachAction {
  category: string;
  label: string;
  description: string;
}

interface CoachResponse {
  message: string;
  action?: CoachAction;
}

function fallbackResponse(userMessage: string): CoachResponse {
  const msg = userMessage.toLowerCase();
  if (msg.includes('timing') || msg.includes('metronom') || msg.includes('tempo')) {
    return {
      message: 'Timing er fundamentet for alt tromme. Sæt metronomen til 60 BPM og spil kun fjerdedele i to minutter — ingen fill, ingen variation. Mærk pulsen i kroppen. Hvordan har din timing det generelt?',
      action: { category: 'opvarmning', label: 'Timing-opvarmning', description: 'Opvarmning · Grundlæggende timing' },
    };
  }
  if (msg.includes('fill') || msg.includes('overgang')) {
    return {
      message: 'Fills starter enkelt: én takt med ottendedele på lilletrommen, ingen tammer endnu. Når det sidder, tilføjer du gradvist. Hvilket niveau er du på med fills?',
      action: { category: 'grooves', label: 'Groove med fills', description: 'Grooves · Fills og overgange' },
    };
  }
  if (msg.includes('ghost') || msg.includes('dynamik')) {
    return {
      message: 'Ghost notes handler om kontrol på pp-dynamik — næsten uhørlige slag. Start ved 60 BPM og tænk: antyd slaget, sæt det ikke. Det kræver tålmodighed, men det løfter dit groove markant.',
      action: { category: 'opvarmning', label: 'Dynamik-øvelse', description: 'Opvarmning · Stikteknik og dynamik' },
    };
  }
  return {
    message: 'Tak for dit spørgsmål! For at hjælpe dig bedst — hvad er dit nuværende niveau, og hvad giver dig mest besvær lige nu?',
  };
}

export async function POST(req: NextRequest) {
  const { messages }: { messages: CoachMessage[] } = await req.json();
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    return NextResponse.json(fallbackResponse(lastUserMsg?.content || ''));
  }

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 512,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!res.ok) throw new Error(`DeepSeek API ${res.status}`);

    const data = await res.json();
    const raw = data.choices[0].message.content.trim();

    let parsed: CoachResponse;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { message: raw };
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error('Coach API error:', e);
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    return NextResponse.json(fallbackResponse(lastUserMsg?.content || ''));
  }
}
