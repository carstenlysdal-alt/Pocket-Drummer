import { getStandardDrumMusicXML, initialExercises, PlanExercise } from './mockData';
import { extractXmlPayload, hasScorePartwise } from './musicXml';

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export interface GeneratePlanInput {
  maal: string;
  niveau: 'begynder' | 'mellemniveau' | 'øvet';
  tidPrDag: number;
  tidshorisont: string;
}

export interface LearningPlan {
  fokustema: string;
  milepæl: string;
  øvelser: PlanExercise[];
  alleUger?: { tema: string; mil: string }[];
  source?: 'ai' | 'fallback';
}

// 1. Generering af Læringsplan via DeepSeek
export async function generateLearningPlan(input: GeneratePlanInput): Promise<LearningPlan> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.log("No DEEPSEEK_API_KEY found, using local high-fidelity plan generator fallback");
    return { ...generateFallbackPlan(input), source: 'fallback' };
  }

  try {
    const validExerciseIds = new Set(initialExercises.map(e => e.id));
    const systemPrompt = `Du er Pocket Drummer AI, en ekspert i trommeundervisning på det danske marked. 
Din opgave er at generere en personlig 4-ugers træningsplan for en bruger baseret på deres angivne mål, niveau, daglige øvetid og tidshorisont.
Svar skal være på DANSK.
Du SKAL vælge øvelser fra denne liste af eksisterende øvelses-id'er:
${JSON.stringify(initialExercises.map(e => ({ id: e.id, titel: e.titel, kategori: e.kategori, sværhedsgrad: e.sværhedsgrad })))}

Returner svaret som et rent JSON-objekt med præcis denne struktur:
{
  "fokustema": "Uge 1: Overordnet tema for ugen",
  "milepæl": "Milepæl for ugen, fx Spil 16.-dele ved 90 BPM",
  "øvelser": [
    { "exercise_id": "ex-1", "dag": 1, "uge": 1, "status": "ikke startet" }
  ]
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generer en plan for: Mål: "${input.maal}", Niveau: "${input.niveau}", Øvetid: ${input.tidPrDag} min/dag, Tidshorisont: "${input.tidshorisont}".`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content?.trim();
    if (!rawText) throw new Error("Empty response from DeepSeek");

    const parsed = JSON.parse(rawText) as LearningPlan;
    
    // Runtime validation of plan
    if (!parsed.fokustema || typeof parsed.fokustema !== 'string' || !Array.isArray(parsed.øvelser)) {
      throw new Error("Invalid plan schema from AI provider");
    }

    // Filter and sanitize exercise list to ensure known IDs and valid days/weeks
    const sanitizedExercises: PlanExercise[] = parsed.øvelser
      .filter(ex => ex && validExerciseIds.has(ex.exercise_id))
      .map(ex => ({
        exercise_id: ex.exercise_id,
        dag: Math.min(7, Math.max(1, Number(ex.dag) || 1)),
        uge: Math.min(4, Math.max(1, Number(ex.uge) || 1)),
        status: 'ikke startet' as const,
      }));

    if (sanitizedExercises.length === 0) {
      return { ...generateFallbackPlan(input), source: 'fallback' };
    }

    return {
      fokustema: parsed.fokustema,
      milepæl: parsed.milepæl || "Gennemfør ugens øvelser",
      øvelser: sanitizedExercises,
      alleUger: parsed.alleUger,
      source: 'ai',
    };
  } catch (e) {
    console.error("Error generating AI plan:", e);
    return { ...generateFallbackPlan(input), source: 'fallback' };
  }
}

// 2. Generering af Trommenoder i MusicXML-format via DeepSeek
export interface GenerateMusicXMLInput {
  titel: string;
  kategori: string;
  sværhedsgrad: 'begynder' | 'mellemniveau' | 'øvet';
  tempo: number;
  takter: number;
  fokus: string;
  systemPrompt?: string;
}

export interface GenerateMusicXMLResult {
  xml: string;
  source: 'ai' | 'fallback';
}

export async function generateMusicXML(input: GenerateMusicXMLInput): Promise<GenerateMusicXMLResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.log("No DEEPSEEK_API_KEY found, using local MusicXML generator fallback");
    return { xml: generateFallbackMusicXML(input), source: 'fallback' };
  }

  try {
    const defaultSystemPrompt = `Du er Pocket Drummer AI, en ekspert i trommenotering og MusicXML 4.0-struktur.
Du skal generere en syntaktisk komplet og valid MusicXML-fil for en tromme-øvelse.
Regler for noteringen:
- Instrument: Trommesæt (Drums)
- Nøglesignatur: percussion (<sign>percussion</sign>) på linje 2.
- Stortromme (Bass drum): display-step = F, display-octave = 4 (standard notehoved).
- Lilletromme (Snare drum): display-step = C, display-octave = 5 (standard notehoved).
- Hi-hat: display-step = G, display-octave = 5, notehoved skal være x (<notehead>x</notehead>).
- Tom 1: display-step = D, display-octave = 5.
- Floor Tom: display-step = G, display-octave = 4.

Skabelonen skal være på ${input.takter} takter, i 4/4 takt, med tempo ${input.tempo} BPM.
Kategori: ${input.kategori}, Sværhedsgrad: ${input.sværhedsgrad}, Fokus: ${input.fokus}.

Returner KUN den rå XML-tekst startende med <?xml version="1.0" ...> og sluttende med </score-partwise>. Ingen forklarende tekst, ingen markdown-fencing.`;

    const systemPrompt = input.systemPrompt || defaultSystemPrompt;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generer MusicXML for en trommeøvelse med titlen: "${input.titel}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content?.trim();
    if (!rawText) throw new Error("Empty XML response from DeepSeek");

    const xml = extractXmlPayload(rawText);

    if (!hasScorePartwise(xml)) {
      console.warn("DeepSeek returned XML without a valid score-partwise root; falling back.");
      return { xml: generateFallbackMusicXML(input), source: 'fallback' };
    }

    return { xml, source: 'ai' };
  } catch (e) {
    console.error("Error generating AI MusicXML:", e);
    return { xml: generateFallbackMusicXML(input), source: 'fallback' };
  }
}

// Fallback Læringsplan Generator
function generateFallbackPlan(input: GeneratePlanInput): LearningPlan {
  const matchingExercises = initialExercises.filter(e => e.sværhedsgrad === input.niveau);
  const otherExercises = initialExercises.filter(e => e.sværhedsgrad !== input.niveau);
  const pool = [...matchingExercises, ...matchingExercises, ...otherExercises];

  const uger = [1, 2, 3, 4];
  const ugentligeTemaer = {
    begynder: [
      { tema: "Uge 1: Grundlæggende stikteknik & timing", mil: "Spil Single Stroke Roll stabilt ved 90 BPM i 1 minut" },
      { tema: "Uge 2: Dit første 8. dels Rockgroove", mil: "Spil klassisk rockbeat ved 100 BPM synkroniseret" },
      { tema: "Uge 3: Introduktion til simple Fills", mil: "Lav en 16. dels tam-tam overgang uden at tabe tempoet" },
      { tema: "Uge 4: Kombination af Groove & Fills", mil: "Spil 3 takter groove og 1 takt fill flydende" }
    ],
    mellemniveau: [
      { tema: "Uge 1: Paradiddles og stikuafhængighed", mil: "Spil Paradiddle-kombinationer flydende ved 110 BPM" },
      { tema: "Uge 2: Syncoper og hi-hat åbninger", mil: "Spil syncoperet funk beat med sprøde hi-hat åbninger" },
      { tema: "Uge 3: Timing uafhængighed", mil: "Spil 80 BPM med metronom klik kun på 1 og 3" },
      { tema: "Uge 4: Udholdenhed & præcision", mil: "Gennemfør 15 minutters uafbrudt funk-improvisation" }
    ],
    øvet: [
      { tema: "Uge 1: Avanceret uafhængighed (Latin)", mil: "Spil Bossa Nova groove med stabil rim-click bossa clave" },
      { tema: "Uge 2: Lineære overgange (Linear fills)", mil: "Udfør 32. dels lineære jazz fills ved 120 BPM" },
      { tema: "Uge 3: Komplekse taktarter & polyrytmer", mil: "Spil i 5/4 og 7/8 taktarter stabilt" },
      { tema: "Uge 4: Hastighed & Dynamikkontrol", mil: "Mestre svære polyrytmiske fills ved 140 BPM" }
    ]
  };

  const valgtTemaer = ugentligeTemaer[input.niveau] || ugentligeTemaer.begynder;
  const planExercises: PlanExercise[] = [];
  
  uger.forEach((uge) => {
    const dagsValg = [1, 3, 5, 7];
    dagsValg.forEach((dag, idx) => {
      const exIndex = (uge * 4 + idx) % pool.length;
      const ex = pool[exIndex];
      planExercises.push({
        exercise_id: ex.id,
        dag,
        uge,
        status: 'ikke startet'
      });
    });
  });

  return {
    fokustema: valgtTemaer[0].tema,
    milepæl: valgtTemaer[0].mil,
    øvelser: planExercises,
    alleUger: valgtTemaer
  };
}

// Fallback MusicXML Generator
function generateFallbackMusicXML(input: GenerateMusicXMLInput): string {
  let patternType = 'standard';
  if (input.kategori.toLowerCase().includes('rudiment')) {
    patternType = 'rudiment';
  } else if (input.kategori.toLowerCase().includes('fill') || input.kategori.toLowerCase().includes('overgang')) {
    patternType = 'fill';
  }
  
  return getStandardDrumMusicXML(input.titel || "AI Tromme Øvelse", input.tempo || 100, patternType);
}
