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
  source?: 'ai' | 'fallback';
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
    timing: { message: 'Timing er fundamentet for alt trommespil. Sæt metronomen til 60 BPM, og spil kun fjerdedele i to minutter. Mærk pulsen i kroppen. Hvordan oplever du din timing?', action: { category: 'opvarmning', label: 'Timing-opvarmning', description: 'Opvarmning · Grundlæggende timing' }, source: 'fallback' },
    fills: { message: 'Start enkelt med fills: spil én takt med ottendedele på lilletrommen. Tilføj gradvist tammer, når det sidder sikkert. Hvilket niveau er du på med fills?', action: { category: 'grooves', label: 'Groove med fills', description: 'Grooves · Fills og overgange' }, source: 'fallback' },
    dynamics: { message: 'Ghost notes kræver kontrol ved meget lav dynamik. Start ved 60 BPM, og tænk på at antyde slaget. Tålmodig træning løfter dit groove markant.', action: { category: 'opvarmning', label: 'Dynamikøvelse', description: 'Opvarmning · Teknik og dynamik' }, source: 'fallback' },
    generic: { message: 'Tak for dit spørgsmål. Hvad er dit nuværende niveau, og hvad giver dig mest besvær lige nu?', source: 'fallback' },
    empty: 'AI-coachen svarede ikke korrekt. Prøv igen.',
  },
  en: {
    timing: { message: 'Timing is the foundation of drumming. Set the metronome to 60 BPM and play quarter notes for two minutes. Feel the pulse in your body. How does your timing feel?', action: { category: 'opvarmning', label: 'Timing warm-up', description: 'Warm-up · Fundamental timing' }, source: 'fallback' },
    fills: { message: 'Start simple with fills: play one bar of eighth notes on the snare. Add toms gradually once it feels secure. What level are you at with fills?', action: { category: 'grooves', label: 'Groove with fills', description: 'Grooves · Fills and transitions' }, source: 'fallback' },
    dynamics: { message: 'Ghost notes require control at a very low dynamic. Start at 60 BPM and think about suggesting the stroke. Patient practice will lift your groove significantly.', action: { category: 'opvarmning', label: 'Dynamics exercise', description: 'Warm-up · Technique and dynamics' }, source: 'fallback' },
    generic: { message: 'Thanks for your question. What is your current level, and what is giving you the most trouble right now?', source: 'fallback' },
    empty: 'The AI did not respond correctly. Please try again.',
  },
  de: {
    timing: { message: 'Timing ist die Grundlage des Schlagzeugspiels. Stelle das Metronom auf 60 BPM und spiele zwei Minuten lang Viertelnoten. Spüre den Puls im Körper. Wie fühlt sich dein Timing an?', action: { category: 'opvarmning', label: 'Timing-Warm-up', description: 'Aufwärmen · Grundlegendes Timing' }, source: 'fallback' },
    fills: { message: 'Beginne bei Fills einfach: Spiele einen Takt Achtelnoten auf der Snare. Füge nach und nach Toms hinzu, sobald es sicher sitzt. Auf welchem Niveau bist du bei Fills?', action: { category: 'grooves', label: 'Groove mit Fills', description: 'Grooves · Fills und Übergänge' }, source: 'fallback' },
    dynamics: { message: 'Ghostnotes erfordern Kontrolle bei sehr leiser Dynamik. Beginne bei 60 BPM und deute den Schlag nur an. Geduldiges Üben verbessert deinen Groove deutlich.', action: { category: 'opvarmning', label: 'Dynamikübung', description: 'Aufwärmen · Technik und Dynamik' }, source: 'fallback' },
    generic: { message: 'Danke für deine Frage. Welches Niveau hast du derzeit, und was bereitet dir gerade die größten Schwierigkeiten?', source: 'fallback' },
    empty: 'Die KI hat nicht korrekt geantwortet. Bitte versuche es erneut.',
  },
  es: {
    timing: { message: 'El tempo es la base de la batería. Pon el metrónomo a 60 BPM y toca negras durante dos minutos. Siente el pulso en el cuerpo. ¿Cómo notas tu tempo?', action: { category: 'opvarmning', label: 'Calentamiento de tempo', description: 'Calentamiento · Tempo fundamental' }, source: 'fallback' },
    fills: { message: 'Empieza los fills de forma sencilla: toca un compás de corcheas en la caja. Añade toms poco a poco cuando lo domines. ¿Qué nivel tienes con los fills?', action: { category: 'grooves', label: 'Groove con fills', description: 'Grooves · Fills y transiciones' }, source: 'fallback' },
    dynamics: { message: 'Las ghost notes requieren control a un volumen muy bajo. Empieza a 60 BPM y piensa en insinuar el golpe. La práctica paciente mejorará mucho tu groove.', action: { category: 'opvarmning', label: 'Ejercicio de dinámica', description: 'Calentamiento · Técnica y dinámica' }, source: 'fallback' },
    generic: { message: 'Gracias por tu pregunta. ¿Cuál es tu nivel actual y qué es lo que más te cuesta ahora mismo?', source: 'fallback' },
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
const MAX_ATTEMPTS = 2;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

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
  if (userContext?.level) contextLines.push(`- Niveau: ${String(userContext.level).slice(0, 50)}`);
  if (userContext?.technique) contextLines.push(`- Valgt teknikfokus: ${String(userContext.technique).slice(0, 50)}`);
  if (userContext?.currentExercise) contextLines.push(`- Nuværende øvelse: ${String(userContext.currentExercise).slice(0, 80)}`);
  if (userContext?.journey) {
    contextLines.push(`- Rejse-status: Niveau '${String(userContext.journey.level || 'begynder').slice(0, 30)}', Teknik '${String(userContext.journey.technique || 'enkeltslag').slice(0, 30)}', Sidste øvelses-trin: ${userContext.journey.lastExerciseId ?? 'start'}`);
  }

  const contextPrompt = contextLines.length > 0
    ? `BRUGERENS REELLE DATA OG KONTEKST:\n${contextLines.join('\n')}\nHusk brugerens niveau og referér til deres aktuelle øvelse/teknik når relevant.`
    : 'BRUGERENS KONTEKST: Ingen gemt historik endnu.';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
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
  clearTimeout(timeout);

  if (!res.ok) throw new Error(`DeepSeek API ${res.status}`);

  const data = await res.json();
  const raw: string | undefined = data.choices?.[0]?.message?.content;

  if (!raw || raw.trim().length === 0) return { status: 'empty' };

  try {
    const parsed = JSON.parse(raw.trim());
    if (!parsed.message || typeof parsed.message !== 'string' || parsed.message.trim().length === 0) {
      return { status: 'text', text: raw.trim() };
    }
    return { status: 'ok', data: { ...parsed, source: 'ai' } };
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

  const rawBody = await req.json().catch(() => null);
  if (!rawBody || typeof rawBody !== 'object') {
    return NextResponse.json({ error: 'Ugyldig request body (skal være JSON-objekt).' }, { status: 400 });
  }

  const body = rawBody as {
    messages?: unknown;
    language?: unknown;
    userContext?: unknown;
  };

  // Runtime validation (F14) - verify messages is an array
  if (!Array.isArray(body.messages)) {
    return NextResponse.json(
      { error: 'messages skal være et array af beskeder.' },
      { status: 400 }
    );
  }

  // Validate and sanitize messages array
  const sanitizedMessages: CoachMessage[] = [];
  for (const item of body.messages) {
    if (!item || typeof item !== 'object') continue;
    const msg = item as { role?: unknown; content?: unknown };
    const role = msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user';
    const content = typeof msg.content === 'string' ? msg.content.slice(0, 1500) : '';
    if (content.trim().length > 0) {
      sanitizedMessages.push({ role, content });
    }
  }

  const language: CoachLanguage = typeof body.language === 'string' && ['da', 'en', 'de', 'es'].includes(body.language)
    ? body.language as CoachLanguage
    : 'da';
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const history = sanitizedMessages.slice(-HISTORY_WINDOW);

  if (!apiKey) {
    const lastUserMsg = [...sanitizedMessages].reverse().find(m => m.role === 'user');
    return NextResponse.json(fallbackResponse(lastUserMsg?.content || '', language));
  }

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const result = await callDeepSeek(apiKey, history, language, body.userContext as CoachUserContext | undefined);
      if (result.status === 'ok') return NextResponse.json(result.data);
      if (result.status === 'text') return NextResponse.json({ message: result.text, source: 'ai' });
    }
    // Alle forsøg gav tomt svar
    return NextResponse.json({ message: FALLBACK_COPY[language].empty, source: 'fallback' });
  } catch (e) {
    console.error('Coach API error:', e);
    const lastUserMsg = [...sanitizedMessages].reverse().find(m => m.role === 'user');
    return NextResponse.json(fallbackResponse(lastUserMsg?.content || '', language));
  }
}
