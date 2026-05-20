export interface Exercise {
  id: string;
  titel: string;
  kategori: 'rudiments' | 'groove' | 'fills' | 'timing' | 'koordination' | 'stilarter';
  sværhedsgrad: 'begynder' | 'mellemniveau' | 'øvet';
  varighed: number; // i minutter
  youtube_video_id: string;
  musicxml_data?: string;
  midi_data?: string;
  tempo: number; // standard BPM
  takter: number;
  ai_genereret: boolean;
  godkendt: boolean;
  beskrivelse: string;
  genre?: string;
}

export interface UserGoal {
  beskrivelse: string;
  tidshorisont: string; // '1 måned' | '3 måneder' | '6 måneder' | '1 år'
  aktiv: boolean;
  oprettet: string;
  delmål: string[];
}

export interface PlanExercise {
  exercise_id: string;
  dag: number; // 1-7 (Mandag - Søndag)
  uge: number; // 1-4
  status: 'ikke startet' | 'i gang' | 'gennemført';
}

export interface UserPlan {
  goal_id: string;
  uge_start: string;
  fokustema: string; // f.eks. "Uge 1: Grundlæggende koordination"
  milepæl: string; // f.eks. "Spil 8. dels groove ved 100 BPM"
  øvelser: PlanExercise[];
}

// Skabelon til en gyldig tromme-MusicXML (bruges af OSMD)
export function getStandardDrumMusicXML(title: string, tempo: number = 100, patternType: string = 'standard'): string {
  const bpm = tempo;
  let measuresXml = '';
  
  if (patternType === 'rudiment') {
    // Rudiment: Hvirvel (højre/venstre) - en masse hvirvlende 16.-dels slag på lilletrommen (C5)
    measuresXml = `
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>percussion</sign><line>2</line></clef>
      </attributes>
      <direction placement="above">
        <direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${bpm}</per-minute></metronome></direction-type>
        <sound tempo="${bpm}"/>
      </direction>
      <!-- Beat 1: R L R L (16th notes) -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <!-- Beat 2: R L R L -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <!-- Beat 3: R L R L -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <!-- Beat 4: R L R L -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
    </measure>
    <measure number="2">
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>R</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>16th</type><lyric><text>L</text></lyric></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>4</duration><voice>1</voice><type>quarter</type><lyric><text>R</text></lyric></note>
      <note><rest/><duration>4</duration><voice>1</voice><type>quarter</type></note>
    </measure>
    `;
  } else if (patternType === 'fill') {
    // Fill: 1 takt groove, 1 takt fill (hvirvel rundt på tammerne)
    measuresXml = `
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>percussion</sign><line>2</line></clef>
      </attributes>
      <!-- Standard beat 1 -->
      <note><unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched><duration>2</duration><voice>1</voice><type>quarter</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>2</duration><voice>1</voice><type>quarter</type><notehead>x</notehead></note>
      <!-- Beat 2 -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>2</duration><voice>1</voice><type>quarter</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>2</duration><voice>1</voice><type>quarter</type><notehead>x</notehead></note>
      <!-- Beat 3 -->
      <note><unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched><duration>2</duration><voice>1</voice><type>quarter</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>2</duration><voice>1</voice><type>quarter</type><notehead>x</notehead></note>
      <!-- Beat 4 -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>2</duration><voice>1</voice><type>quarter</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>2</duration><voice>1</voice><type>quarter</type><notehead>x</notehead></note>
    </measure>
    <measure number="2">
      <!-- Fill: Snare (C5), Tom 1 (D5), Tom 2 (A4), Floor Tom (G4) - all eighth notes -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><unpitched><display-step>D</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><unpitched><display-step>D</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><unpitched><display-step>A</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><unpitched><display-step>A</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><unpitched><display-step>G</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><unpitched><display-step>G</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
    </measure>
    `;
  } else {
    // standard / groove: Klassisk 8. dels rockgroove
    measuresXml = `
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>percussion</sign><line>2</line></clef>
      </attributes>
      <direction placement="above">
        <direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${bpm}</per-minute></metronome></direction-type>
        <sound tempo="${bpm}"/>
      </direction>
      <!-- Beat 1: Bass drum (F4) + HiHat (G5, x) -->
      <note><unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      <!-- Beat 1.5: HiHat (G5, x) -->
      <note><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type><notehead>x</notehead></note>
      
      <!-- Beat 2: Snare drum (C5) + HiHat (G5, x) -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      <!-- Beat 2.5: HiHat (G5, x) -->
      <note><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type><notehead>x</notehead></note>
      
      <!-- Beat 3: Bass drum (F4) + HiHat (G5, x) -->
      <note><unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      <!-- Beat 3.5: HiHat (G5, x) -->
      <note><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type><notehead>x</notehead></note>
      
      <!-- Beat 4: Snare drum (C5) + HiHat (G5, x) -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      <!-- Beat 4.5: HiHat (G5, x) -->
      <note><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type><notehead>x</notehead></note>
    </measure>
    <measure number="2">
      <!-- Beat 1: Bass drum (F4) + HiHat (G5, x) -->
      <note><unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      <!-- Beat 1.5: HiHat (G5, x) -->
      <note><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type><notehead>x</notehead></note>
      
      <!-- Beat 2: Snare drum (C5) + HiHat (G5, x) -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      <!-- Beat 2.5: HiHat (G5, x) -->
      <note><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type><notehead>x</notehead></note>
      
      <!-- Beat 3: Bass drum (F4) + HiHat (G5, x) -->
      <note><unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      <!-- Beat 3.5: Bass drum (F4) -->
      <note><unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      
      <!-- Beat 4: Snare drum (C5) + HiHat (G5, x) -->
      <note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type></note>
      <note><chord/><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</voice><type>eighth</type><notehead>x</notehead></note>
      <!-- Beat 4.5: HiHat (G5, x) -->
      <note><unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><voice>1</voice><type>eighth</type><notehead>x</notehead></note>
    </measure>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
    "-//Recordare//DTD MusicXML 4.0 Partwise//EN"
    "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${title}</work-title>
  </work>
  <part-list>
    <score-part id="P1">
      <part-name>Drums</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    ${measuresXml}
  </part>
</score-partwise>`;
}

export const initialExercises: Exercise[] = [
  {
    id: "ex-1",
    titel: "Single Stroke Roll (Hvirvel)",
    kategori: "rudiments",
    sværhedsgrad: "begynder",
    varighed: 5,
    youtube_video_id: "g4mHPEA-wP8", // Standard drum basic lesson
    tempo: 90,
    takter: 2,
    ai_genereret: false,
    godkendt: true,
    beskrivelse: "Det mest fundamentale rudiment. Skift mellem højre (R) og venstre (L) hånd med jævnt tempo og ensartet volumen på lilletrommen.",
    musicxml_data: getStandardDrumMusicXML("Single Stroke Roll", 90, "rudiment")
  },
  {
    id: "ex-2",
    titel: "Klassisk 8. dels Rockgroove",
    kategori: "groove",
    sværhedsgrad: "begynder",
    varighed: 10,
    youtube_video_id: "84G2yU_q1c0", // Basic rock groove tutorial
    tempo: 100,
    takter: 2,
    ai_genereret: false,
    godkendt: true,
    beskrivelse: "Det grundlæggende rockgroove. Spil jævne 8. dele på hi-hatten, lilletrommen på 2 og 4, og stortrommen på 1 og 3.",
    musicxml_data: getStandardDrumMusicXML("Klassisk 8. dels Rockgroove", 100, "standard")
  },
  {
    id: "ex-3",
    titel: "16. dels Tam-tam Overgang",
    kategori: "fills",
    sværhedsgrad: "begynder",
    varighed: 8,
    youtube_video_id: "gKca_56QWpA", // Simple drum fills lesson
    tempo: 80,
    takter: 2,
    ai_genereret: false,
    godkendt: true,
    beskrivelse: "Et simpelt drumfill over to takter. Første takt er et standard 8. dels groove, anden takt ruller ned over tammerne.",
    musicxml_data: getStandardDrumMusicXML("16. dels Tam-tam Overgang", 80, "fill")
  },
  {
    id: "ex-4",
    titel: "Paradiddle Kombination",
    kategori: "rudiments",
    sværhedsgrad: "mellemniveau",
    varighed: 10,
    youtube_video_id: "e5ZqX-z56qE",
    tempo: 110,
    takter: 2,
    ai_genereret: false,
    godkendt: true,
    beskrivelse: "Spil R-L-R-R L-R-L-L. Fokuser på at holde accentslagene på det første slag af hver gruppe skarpe og spøgelsesslagene svage.",
    musicxml_data: getStandardDrumMusicXML("Paradiddle Kombination", 110, "rudiment")
  },
  {
    id: "ex-5",
    titel: "Syncoperet Funk Beat",
    kategori: "groove",
    sværhedsgrad: "mellemniveau",
    varighed: 15,
    youtube_video_id: "Z73UfE02fO0",
    tempo: 95,
    takter: 2,
    ai_genereret: false,
    godkendt: true,
    beskrivelse: "Et funky groove med forskudt stortrommeslag på '3-og' samt spøgelsesslag (ghost notes) på lilletrommen.",
    musicxml_data: getStandardDrumMusicXML("Syncoperet Funk Beat", 95, "standard")
  },
  {
    id: "ex-6",
    titel: "Metronom Timing & 'The Grid'",
    kategori: "timing",
    sværhedsgrad: "begynder",
    varighed: 10,
    youtube_video_id: "M0Fw-K2P_wI",
    tempo: 80,
    takter: 2,
    ai_genereret: false,
    godkendt: true,
    beskrivelse: "Lær at spille præcist ovenpå metronomen. Vi fjerner klikket på 2 og 4 gradvist for at styrke dit indre ur.",
    musicxml_data: getStandardDrumMusicXML("Metronom Timing", 80, "standard")
  },
  {
    id: "ex-7",
    titel: "Linear Jazz Fills",
    kategori: "fills",
    sværhedsgrad: "øvet",
    varighed: 15,
    youtube_video_id: "P005T3-gCws",
    tempo: 120,
    takter: 2,
    ai_genereret: false,
    godkendt: true,
    beskrivelse: "Lineære fills hvor ingen trommer eller bækkener slås an samtidigt. Skaber en flydende kaskade-effekt.",
    musicxml_data: getStandardDrumMusicXML("Linear Jazz Fills", 120, "fill")
  },
  {
    id: "ex-8",
    titel: "Latin Bossa Nova Groove",
    kategori: "stilarter",
    sværhedsgrad: "øvet",
    varighed: 15,
    youtube_video_id: "Wex9C7O0cEE",
    tempo: 130,
    takter: 2,
    ai_genereret: false,
    godkendt: true,
    beskrivelse: "Kræver uafhængig kontrol. Rim-click mønster i venstre hånd kombineres med stortrommens bossa-mønster og 8.-dele på hi-hat.",
    musicxml_data: getStandardDrumMusicXML("Latin Bossa Nova", 130, "standard")
  }
];

// Database State Helpers (persisteret via localStorage)
export function getSavedExercises(): Exercise[] {
  if (typeof window === 'undefined') return initialExercises;
  const saved = localStorage.getItem('drumlab_exercises');
  if (!saved) {
    localStorage.setItem('drumlab_exercises', JSON.stringify(initialExercises));
    return initialExercises;
  }
  return JSON.parse(saved);
}

export function saveExercise(exercise: Exercise) {
  if (typeof window === 'undefined') return;
  const exercises = getSavedExercises();
  const index = exercises.findIndex(e => e.id === exercise.id);
  if (index >= 0) {
    exercises[index] = exercise;
  } else {
    exercises.push(exercise);
  }
  localStorage.setItem('drumlab_exercises', JSON.stringify(exercises));
}

export function getCompletedExercises(): string[] {
  if (typeof window === 'undefined') return [];
  const completed = localStorage.getItem('drumlab_completed');
  return completed ? JSON.parse(completed) : [];
}

export function toggleExerciseCompleted(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const completed = getCompletedExercises();
  const index = completed.indexOf(id);
  let isCompleted = false;
  if (index >= 0) {
    completed.splice(index, 1);
  } else {
    completed.push(id);
    isCompleted = true;
  }
  localStorage.setItem('drumlab_completed', JSON.stringify(completed));
  return isCompleted;
}

export function getUserGoal(): UserGoal {
  const defaultGoal: UserGoal = {
    beskrivelse: "Bliv klar til at spille i skoleband",
    tidshorisont: "3 måneder",
    aktiv: true,
    oprettet: new Date().toISOString(),
    delmål: [
      "Lær et klassisk 8. dels rockgroove ved 110 BPM",
      "Kunne udføre en tam-tam overgang stabilt",
      "Styrk hi-hat-koordinationen"
    ]
  };
  
  if (typeof window === 'undefined') return defaultGoal;
  const saved = localStorage.getItem('drumlab_user_goal');
  if (!saved) {
    localStorage.setItem('drumlab_user_goal', JSON.stringify(defaultGoal));
    return defaultGoal;
  }
  return JSON.parse(saved);
}

export function saveUserGoal(goal: UserGoal) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('drumlab_user_goal', JSON.stringify(goal));
}

export function getUserPlan(): UserPlan | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('drumlab_user_plan');
  return saved ? JSON.parse(saved) : null;
}

export function saveUserPlan(plan: UserPlan) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('drumlab_user_plan', JSON.stringify(plan));
}

export function getPremiumStatus(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('drumlab_premium_active') === 'true';
}

export function setPremiumStatus(active: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('drumlab_premium_active', active ? 'true' : 'false');
}

export function resetMockDatabase() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('drumlab_exercises', JSON.stringify(initialExercises));
  localStorage.removeItem('drumlab_completed');
  localStorage.removeItem('drumlab_user_goal');
  localStorage.removeItem('drumlab_user_plan');
  localStorage.setItem('drumlab_premium_active', 'false');
}
