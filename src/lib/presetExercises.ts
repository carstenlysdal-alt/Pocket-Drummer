import { getStandardDrumMusicXML, Exercise } from './mockData';

export interface PresetExercise {
  titel: string;
  kategori: Exercise['kategori'];
  sværhedsgrad: Exercise['sværhedsgrad'];
  tempo: number;
  takter: number;
  beskrivelse: string;
  genre: string;
  patternType: 'standard' | 'rudiment' | 'fill';
}

export const presetExercises: PresetExercise[] = [
  {
    titel: "Klassisk 8. dels Groove med Åben Hi-hat",
    kategori: "groove",
    sværhedsgrad: "begynder",
    tempo: 95,
    takter: 2,
    beskrivelse: "Et populært rockgroove med en markeret åben hi-hat på det sidste slag i anden takt. God øvelse i koordination og klangkontrol.",
    genre: "Rock",
    patternType: "standard"
  },
  {
    titel: "Double Stroke Roll (R R L L)",
    kategori: "rudiments",
    sværhedsgrad: "begynder",
    tempo: 85,
    takter: 2,
    beskrivelse: "Udfør dobbeltslag (to slag med hver hånd: R-R-L-L) jævnt og i et kontrolleret tempo. Fokuser på ensartet dynamik og stick height.",
    genre: "Rudiment",
    patternType: "rudiment"
  },
  {
    titel: "Purdie Half-Time Shuffle",
    kategori: "groove",
    sværhedsgrad: "øvet",
    tempo: 90,
    takter: 2,
    beskrivelse: "Det legendariske Bernard Purdie Half-Time Shuffle med spøgelsesslag (ghost notes) på lilletrommen og et flydende triplet-ride-mønster.",
    genre: "Funk / Soul",
    patternType: "standard"
  },
  {
    titel: "Classic Jazz Swing Ride",
    kategori: "stilarter",
    sværhedsgrad: "mellemniveau",
    tempo: 120,
    takter: 2,
    beskrivelse: "Det ikoniske swing-mønster på ride-bækkenet (1 - 2-så - 3 - 4-så) kombineret med hi-hat-tråd på 2 og 4 samt let fjerdedels-stortromme (feathering).",
    genre: "Jazz",
    patternType: "standard"
  },
  {
    titel: "Syncoperet Lineær Funk",
    kategori: "groove",
    sværhedsgrad: "øvet",
    tempo: 100,
    takter: 2,
    beskrivelse: "Et lineært groove (ingen samtidige slag), der skaber et stærkt synkoperet og dansabelt beat. Fremragende til timing og stikuafhængighed.",
    genre: "Funk",
    patternType: "standard"
  },
  {
    titel: "Six-Stroke Roll Overgang (Fill)",
    kategori: "fills",
    sværhedsgrad: "øvet",
    tempo: 95,
    takter: 2,
    beskrivelse: "Et avanceret fill bygget på six-stroke roll (R-L-L-R-R-L). Starter som et groove i takt 1 og bevæger sig rundt på tammerne i takt 2.",
    genre: "Fusion / Progressiv",
    patternType: "fill"
  }
];

export function getPresetMusicXML(preset: PresetExercise): string {
  return getStandardDrumMusicXML(preset.titel, preset.tempo, preset.patternType);
}
