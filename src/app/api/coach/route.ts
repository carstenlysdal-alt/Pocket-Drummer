import { NextRequest, NextResponse } from 'next/server';

import { checkRateLimit, rateLimitResponse } from '@/lib/apiSecurity';

type CoachLanguage = 'da' | 'en' | 'de' | 'es';

const LANGUAGE_NAMES: Record<CoachLanguage, string> = {
  da: 'dansk',
  en: 'engelsk',
  de: 'tysk',
  es: 'spansk',
};

const SYSTEM_PROMPT = `Du er Pocket Drummer Coach — en varm, empatisk og kompetent AI-trommelærer i Pocket Drummer-appen.

SCOPE — VIGTIGT:
Du må KUN svare på spørgsmål og samtaler om tromme, trommespil, øvelse, rytme, musik, timing, rudiments, groove, fills, teknik, dynamik, stilarter, metronom, notation, taktarter, koordination og alt relateret til tromme og musik.
Hvis brugeren spørger om noget der ligger udenfor dette, svar venligt men tydeligt: "Som din trommerlærer holder jeg mig til tromme og musik. Hvad øver du dig på for tiden?"

PERSONLIGHED:
- Varm og empatisk — spørg aktivt ind til hvordan øvningen går
- Ros indsats og fremskridt oprigtigt, ikke generisk
- Giv konkrete, handlingsrettede råd når brugeren har et problem
- Tilpas altid dine svar til brugerens niveau og aktuelle øvelse
- Stil opfølgningsspørgsmål for at forstå udfordringen bedre
- Vær direkte og præcis — ingen lange udsvævende tekster

SPROGLIGE KRAV — UFRAVIGELIGE:
- Svar KUN på det sprog, som den sidste systembesked kræver
- Brug korrekt grammatik, tegnsætning og naturligt fagsprog på det valgte sprog
- Aktiv stemme: "du spiller" ikke "der spilles"
- Brug præcise og handlingsrettede ord
- Undgå unødvendige anglicismer, når sproget har en præcis ækvivalent
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

export interface CoachUserContext {
  level?: string | null;
  technique?: string | null;
  currentExercise?: string | null;
  journey?: {
    level?: string;
    technique?: string;
    lastExerciseId?: number;
  } | null;
}

const FALLBACK_COPY: Record<CoachLanguage, {
  timing: CoachResponse;
  fills: CoachResponse;
  dynamics: CoachResponse;
  generic: CoachResponse;
  empty: string;
}> = {
  da: {
    timing: { message: 'Timing er fundamentet for alt trommespil. Sæt metronomen til 60 BPM, og spil kun fjerdedele i to minutter. Mærk pulsen i kroppen. Hvordan oplever du din timing?', action: { category: 'opvarmning', label: 'Timing-opvarmning', description: 'Opvarmning · Grundlæggende timing' } },
    fills: { message: 'Start enkelt med fills: spil én takt med ottendedele på lilletrommen. Tilføj gradvist tammer, når det sidder sikkert. Hvilket niveau er du på med fills?', action: { category: 'grooves', label: 'Groove med fills', description: 'Grooves · Fills og overgange' } },
    dynamics: { message: 'Ghost notes kræver kontrol ved meget lav dynamik. Start ved 60 BPM, og tænk på at antyde slaget. Tålmodig træning løfter dit groove markant.', action: { category: 'opvarmning', label: 'Dynamikøvelse', description: 'Opvarmning · Teknik og dynamik' } },
    generic: { message: 'Tak for dit spørgsmål. Hvad er dit nuværende niveau, og hvad giver dig mest besvær lige nu?' },
    empty: 'AI’en svarede ikke korrekt. Prøv igen.',
  },
  en: {
    timing: { message: 'Timing is the foundation of drumming. Set the metronome to 60 BPM and play quarter notes for two minutes. Feel the pulse in your body. How does your timing feel?', action: { category: 'opvarmning', label: 'Timing warm-up', description: 'Warm-up · Fundamental timing' } },
    fills: { message: 'Start simple with fills: play one bar of eighth notes on the snare. Add toms gradually once it feels secure. What level are you at with fills?', action: { category: 'grooves', label: 'Groove with fills', description: 'Grooves · Fills and transitions' } },
    dynamics: { message: 'Ghost notes require control at a very low dynamic. Start at 60 BPM and think about suggesting the stroke. Patient practice will lift your groove significantly.', action: { category: 'opvarmning', label: 'Dynamics exercise', description: 'Warm-up · Technique and dynamics' } },
    generic: { message: 'Thanks for your question. What is your current level, and what is giving you the most trouble right now?' },
    empty: 'The AI did not respond correctly. Please try again.',
  },
  de: {
    timing: { message: 'Timing ist die Grundlage des Schlagzeugspiels. Stelle das Metronom auf 60 BPM und spiele zwei Minuten lang Viertelnoten. Spüre den Puls im Körper. Wie fühlt sich dein Timing an?', action: { category: 'opvarmning', label: 'Timing-Warm-up', description: 'Aufwärmen · Grundlegendes Timing' } },
    fills: { message: 'Beginne bei Fills einfach: Spiele einen Takt Achtelnoten auf der Snare. Füge nach und nach Toms hinzu, sobald es sicher sitzt. Auf welchem Niveau bist du bei Fills?', action: { category: 'grooves', label: 'Groove mit Fills', description: 'Grooves · Fills und Übergänge' } },
    dynamics: { message: 'Ghostnotes erfordern Kontrolle bei sehr leiser Dynamik. Beginne bei 60 BPM und deute den Schlag nur an. Geduldiges Üben verbessert deinen Groove deutlich.', action: { category: 'opvarmning', label: 'Dynamikübung', description: 'Aufwärmen · Technik und Dynamik' } },
    generic: { message: 'Danke für deine Frage. Welches Niveau hast du derzeit, und was bereitet dir gerade die größten Schwierigkeiten?' },
    empty: 'Die KI hat nicht korrekt geantwortet. Bitte versuche es erneut.',
  },
  es: {
    timing: { message: 'El tempo es la base de la batería. Pon el metrónomo a 60 BPM y toca negras durante dos minutos. Siente el pulso en el cuerpo. ¿Cómo notas tu tempo?', action: { category: 'opvarmning', label: 'Calentamiento de tempo', description: 'Calentamiento · Tempo fundamental' } },
    fills: { message: 'Empieza los fills de forma sencilla: toca un compás de corcheas en la caja. Añade toms poco a poco cuando lo domines. ¿Qué nivel tienes con los fills?', action: { category: 'grooves', label: 'Groove con fills', description: 'Grooves · Fills y transiciones' } },
    dynamics: { message: 'Las ghost notes requieren control a un volumen muy bajo. Empieza a 60 BPM y piensa en insinuar el golpe. La práctica paciente mejorará mucho tu groove.', action: { category: 'opvarmning', label: 'Ejercicio de dinámica', description: 'Calentamiento · Técnica y dinámica' } },
    generic: { message: 'Gracias por tu pregunta. ¿Cuál es tu nivel actual y qué es lo que más te cuesta ahora mismo?' },
    empty: 'La IA no respondió correctamente. Inténtalo de nuevo.',
  },
};

function fallbackResponse(userMessage: string, language: CoachLanguage): CoachResponse {
  const msg = userMessage.toLowerCase();
  if (msg.includes('timing') || msg.includes('metronom') || msg.includes('tempo')) {
    return FALLBACK_COPY[language].timing;
  }
  if (msg.includes('fill') || msg.includes('overgang') || msg.includes('übergang') || msg.includes('transición')) {
    return FALLBACK_COPY[language].fills;
  }
  if (msg.includes('ghost') || msg.includes('dynamik') || msg.includes('dynamic') || msg.includes('dinámica')) {
    return FALLBACK_COPY[language].dynamics;
  }
  return FALLBACK_COPY[language].generic;
}

const HISTORY_WINDOW = 12;
const MAX_ATTEMPTS = 3;

// 'empty' er det eneste tilfælde der skal retries — DeepSeeks json_object-mode kan i sjældne
// tilfælde returnere ren whitespace. 'text' er et brugbart, blot ikke-JSON-formateret svar,
// og skal vises til brugeren i stedet for at blive kasseret.
type CallResult =
  | { status: 'ok'; data: CoachResponse }
  | { status: 'text'; text: string }
  | { status: 'empty' };

async function callDeepSeek(
  apiKey: string,
  history: CoachMessage[],
  language: CoachLanguage,
  userContext?: CoachUserContext
): Promise<CallResult> {
  const contextLines: string[] = [];
  if (userContext?.level) contextLines.push(`- Niveau: ${userContext.level}`);
  if (userContext?.technique) contextLines.push(`- Valgt teknikfokus: ${userContext.technique}`);
  if (userContext?.currentExercise) contextLines.push(`- Nuværende øvelse: ${userContext.currentExercise}`);
  if (userContext?.journey) {
    contextLines.push(`- Rejse-status: Niveau '${userContext.journey.level || 'begynder'}', Teknik '${userContext.journey.technique || 'enkeltslag'}', Sidste øvelses-trin: ${userContext.journey.lastExerciseId ?? 'start'}`);
  }

  const contextPrompt = contextLines.length > 0
    ? `BRUGERENS REELLE DATA OG KONTEKST:\n${contextLines.join('\n')}\nHusk brugerens niveau og referér til deres aktuelle øvelse/teknik når relevant.`
    : 'BRUGERENS KONTEKST: Ingen gemt historik endnu.';

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
        { role: 'system', content: contextPrompt },
        { role: 'system', content: `Svar udelukkende på ${LANGUAGE_NAMES[language]}. Alle tekster i JSON-svaret, inklusive action.label og action.description, skal være på ${LANGUAGE_NAMES[language]}.` },
        ...history,
      ],
    }),
  });

  if (!res.ok) throw new Error(`DeepSeek API ${res.status}`);

  const data = await res.json();
  const raw: string | undefined = data.choices?.[0]?.message?.content;

  if (!raw || raw.trim().length === 0) return { status: 'empty' };

  try {
    const parsed = JSON.parse(raw.trim());
    if (!parsed.message || typeof parsed.message !== 'string' || parsed.message.trim().length === 0) {
      return { status: 'text', text: raw.trim() };
    }
    return { status: 'ok', data: parsed };
  } catch {
    return { status: 'text', text: raw.trim() };
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting pr. IP: max 25 requests pr. minut
  const rateLimit = checkRateLimit(req, { limit: 25, windowMs: 60000, prefix: 'coach' });
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetSeconds);
  }

  const body: {
    messages: CoachMessage[];
    language?: string;
    userContext?: CoachUserContext;
  } = await req.json();

  const messages = body.messages || [];
  const language: CoachLanguage = body.language && ['da', 'en', 'de', 'es'].includes(body.language)
    ? body.language as CoachLanguage
    : 'da';
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const history = messages.slice(-HISTORY_WINDOW);

  if (!apiKey) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    return NextResponse.json(fallbackResponse(lastUserMsg?.content || '', language));
  }

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const result = await callDeepSeek(apiKey, history, language, body.userContext);
      if (result.status === 'ok') return NextResponse.json(result.data);
      if (result.status === 'text') return NextResponse.json({ message: result.text });
      // 'empty' — prøv igen
    }
    // Alle forsøg gav tomt svar — vis en ærlig fejl, ikke rå JSON-fejl
    return NextResponse.json({ message: FALLBACK_COPY[language].empty });
  } catch (e) {
    console.error('Coach API error:', e);
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    return NextResponse.json(fallbackResponse(lastUserMsg?.content || '', language));
  }
}

