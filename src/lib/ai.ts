import { getStandardDrumMusicXML, initialExercises, PlanExercise } from './mockData';

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

interface GeneratePlanInput {
  maal: string;
  niveau: 'begynder' | 'mellemniveau' | 'øvet';
  tidPrDag: number;
  tidshorisont: string;
}

interface LearningPlan {
  fokustema: string;
  milepæl: string;
  øvelser: PlanExercise[];
  alleUger?: { tema: string; mil: string }[];
}

// 1. Generering af Læringsplan via DeepSeek
export async function generateLearningPlan(input: GeneratePlanInput): Promise<LearningPlan> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.log("No DEEPSEEK_API_KEY found, using local high-fidelity plan generator fallback");
    return generateFallbackPlan(input);
  }

  try {
    const systemPrompt = `Du er DrumLab AI, en ekspert i trommeundervisning på det danske marked. 
Din opgave er at generere en personlig 4-ugers træningsplan for en bruger baseret på deres angivne mål, niveau, daglige øvetid og tidshorisont.
Svar skal være på DANSK.
Du SKAL vælge øvelser fra denne liste af eksisterende øvelses-id'er:
${JSON.stringify(initialExercises.map(e => ({ id: e.id, titel: e.titel, kategori: e.kategori, sværhedsgrad: e.sværhedsgrad })))}

Returner svaret som et rent JSON-objekt med præcis denne struktur:
{
  "fokustema": "Uge 1: Overordnet tema for ugen",
  "milepæl": "Milepæl for ugen, fx Spil 16.-dele ved 90 BPM",
  "øvelser": [
    { "exercise_id": "ex-1", "dag": 1, "uge": 1, "status": "ikke startet" },
    ... generer i alt 4-5 øvelser per uge for 4 uger (uge 1 til uge 4)
  ]
}`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
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

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content.trim();
    return JSON.parse(rawText);
  } catch (e) {
    console.error("Error generating AI plan:", e);
    return generateFallbackPlan(input);
  }
}

// 2. Generering af Trommenoder i MusicXML-format via DeepSeek
interface GenerateMusicXMLInput {
  titel: string;
  kategori: string;
  sværhedsgrad: 'begynder' | 'mellemniveau' | 'øvet';
  tempo: number;
  takter: number;
  fokus: string;
  systemPrompt?: string;
}

export async function generateMusicXML(input: GenerateMusicXMLInput): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.log("No DEEPSEEK_API_KEY found, using local high-fidelity MusicXML generator fallback");
    return generateFallbackMusicXML(input);
  }

  try {
    const defaultSystemPrompt = `Du er DrumLab AI, en ekspert i trommenotering og MusicXML 4.0-struktur.
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

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
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

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    let rawText = data.choices[0].message.content.trim();
    // Rens eventuel markdown-omslutning
    rawText = rawText.replace(/^```xml/, "").replace(/^```/, "").replace(/```$/, "").trim();
    return rawText;
  } catch (e) {
    console.error("Error generating AI MusicXML:", e);
    return generateFallbackMusicXML(input);
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
