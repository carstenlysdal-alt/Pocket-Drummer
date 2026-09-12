'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/authContext';
import { Language, useLanguage } from '@/lib/languageContext';
import { getUserPlan, JourneyProgress, UserPlan, PlanExercise } from '@/lib/mockData';
import TiltCard from '@/components/TiltCard';
import ReactMarkdown from 'react-markdown';


// ─────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────
const tokens = (dark: boolean) => ({
  bg: dark ? '#15120F' : '#FBFAF6',
  bgGradient: dark ? '#15120F' : '#FBFAF6',
  surface: dark ? '#201B17' : '#FFFFFF',
  surface2: dark ? '#2B2520' : '#F4EFE8',
  surfaceElev: dark ? '#332B25' : '#FFFFFF',
  border: dark ? 'rgba(255,255,255,0.08)' : '#EEE9E1',
  borderStrong: dark ? 'rgba(255,255,255,0.15)' : '#E3DDD3',
  text: dark ? '#FBFAF6' : '#2B2723',
  textMuted: dark ? '#B7AEA2' : '#A79E93',
  textDim: dark ? '#7C736A' : '#C6BDB2',
  accent: '#EE6C48',
  accentDeep: '#C95A3C',
  accentSoft: dark ? 'rgba(238,108,72,0.16)' : '#FCE9E1',
  accentText: dark ? '#F8B39F' : '#B5714F',
  accentGlow: '0 8px 20px rgba(238,108,72,0.28)',
  good: '#3FAE86',
  goodSoft: dark ? 'rgba(63,174,134,0.18)' : '#E4F3EC',
  warn: dark ? '#E0AC53' : '#D69A34',
  glassBackground: dark ? 'rgba(32,27,23,0.86)' : '#FFFFFF',
  glassBlur: dark ? 'blur(16px)' : 'none',
  navBackground: dark ? 'rgba(21,18,15,0.92)' : 'rgba(251,250,246,0.92)',
  navBorder: dark ? 'rgba(255,255,255,0.08)' : '#EEE9E1',
  navShadow: dark ? '0 -1px 0 rgba(255,255,255,0.06)' : '0 -8px 22px rgba(43,39,35,0.06)',
  // Fladt taktlinje-designsprog: hairline-skel, tyk taktstreg, dæmpede tick-marks
  hairline: dark ? 'rgba(255,255,255,0.10)' : '#E1DACB',
  tickMuted: dark ? 'rgba(255,255,255,0.14)' : '#D8CFC0',
  mono: "'IBM Plex Mono', var(--font-mono, monospace)",
  font: '"Hanken Grotesk", var(--font-sans, sans-serif)',
  head: '"Bricolage Grotesque", var(--font-head, var(--font-title, sans-serif))',
  serif: '"Bricolage Grotesque", var(--font-head, var(--font-title, sans-serif))',
});

type ThemeTokens = ReturnType<typeof tokens>;

function getCleanPdfUrl(url: string) {
  const separator = url.includes('#') ? '&' : '#';
  return `${url}${separator}toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
}

interface ScreenProps {
  t: ThemeTokens;
  dark: boolean;
}

interface HomeScreenProps extends ScreenProps {
  setDark: (dark: boolean) => void;
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
  onSelectLevel: (level: TrainingLevel) => void;
  onOpenCoach: () => void;
  guestXp: number;
  isDesktop?: boolean;
  journey?: JourneyProgress | null;
  onStartJourneyTrack?: (level: TrainingLevel, tech: TechniqueProgram) => void;
}

type TrainingLevel = 'begynder' | 'oevet' | 'rutineret';
type TechniqueProgram = 'enkeltslag' | 'dobbeltslag' | 'paradiddles' | 'mix';

const TRAINING_LEVELS: Array<{
  id: TrainingLevel;
  number: string;
}> = [
  { id: 'begynder', number: '01' },
  { id: 'oevet', number: '02' },
  { id: 'rutineret', number: '03' },
];

const TECHNIQUE_PROGRAMS: Array<{
  id: TechniqueProgram;
  number: string;
}> = [
  { id: 'enkeltslag', number: '01' },
  { id: 'dobbeltslag', number: '02' },
  { id: 'paradiddles', number: '03' },
  { id: 'mix', number: '04' },
];

interface PrototypeCopy {
  guest: string;
  greeting: string;
  chooseLevel: string;
  warmupTechnique: string;
  levels: Record<TrainingLevel, { label: string; description: string }>;
  techniques: Record<TechniqueProgram, { label: string; description: string }>;
  focusAreas: string[];
  libraryCount: string;
  playWithMusic: string;
  digitalKit: string;
  askAnything: string;
  todayFundamentals: string;
  lessonTitle: string;
  lessonDescription: string;
  continueLesson: string;
  keepPracticing: string;
  dayStreak: string;
  continueWhere: string;
  timingTitle: string;
  timingMeta: string;
  thisWeek: string;
  practiceDays: string;
  chooseTechnique: string;
  completed: string;
  progressiveExercises: string;
  backToTechniques: string;
  backHome: string;
  markCompleted: string;
  askCoachExercise: string;
  sheetMusic: string;
  video: string;
  close: string;
  back: string;
  next: string;
  play: string;
  pause: string;
  loop: string;
  loadingNotation: string;
  notationError: string;
  lightMode: string;
  darkMode: string;
  languageName: Record<Language, string>;
  exercisesTitle: string;
  exercisesUnit: string;
  free: string;
  searchExercises: string;
  noExerciseMatches: string;
  saveProgressDescription: string;
  loginError: string;
  signingIn: string;
  askQuestion: string;
  coachIntro: string;
  coachStatus: string;
  coachFallback: string;
  coachOffline: string;
  coachSuggestions: string[];
  startJourney: string;
  signInAndStartJourney: string;
  continueJourney: string;
  journeyHint: string;
  journeySaving: string;
  journeyLoginError: string;
  continueHere: string;
}

const PROTOTYPE_COPY: Record<Language, PrototypeCopy> = {
  da: {
    guest: 'Gæst', greeting: 'Hej', chooseLevel: 'Vælg dit niveau', warmupTechnique: 'Opvarmning / teknik',
    levels: {
      begynder: { label: 'Begynder', description: 'Byg kontrol, puls og gode grundvaner.' },
      oevet: { label: 'Øvet', description: 'Udvid tempo, dynamik og koordination.' },
      rutineret: { label: 'Rutineret', description: 'Forfin teknik, flow og udholdenhed.' },
    },
    techniques: {
      enkeltslag: { label: 'Enkeltslag', description: 'Skiftevis højre og venstre med jævn lyd.' },
      dobbeltslag: { label: 'Dobbeltslag', description: 'To kontrollerede slag med hver hånd.' },
      paradiddles: { label: 'Paradiddles', description: 'Kombinér enkeltslag og dobbeltslag.' },
      mix: { label: 'Mix', description: 'Saml teknikkerne i en komplet opvarmning.' },
    },
    focusAreas: ['Kontrol', 'Jævn puls', 'Accenter', 'Dynamik', 'Udholdenhed', 'Tempo', 'Koordination', 'Fuld sekvens'],
    libraryCount: '15 i biblioteket', playWithMusic: 'Spil med musik', digitalKit: 'Digitalt trommesæt', askAnything: 'Spørg om alt',
    todayFundamentals: 'I dag · Grundrytmer', lessonTitle: 'Grooves & fills del 1', lessonDescription: 'Hi-hat-mønstre med halvnoder over bastromme.',
    continueLesson: 'Fortsæt lektion', keepPracticing: 'Øv videre', dayStreak: 'dage i streg', continueWhere: 'Fortsæt hvor du slap',
    timingTitle: 'Sekstendedele · timing', timingMeta: 'Nodelære · 4 min tilbage', thisWeek: 'Denne uge', practiceDays: 'øvedage',
    chooseTechnique: 'Vælg teknikspor', completed: 'Gennemført', progressiveExercises: '8 progressive øvelser',
    backToTechniques: 'Tilbage til teknikspor', backHome: 'Tilbage til forsiden', markCompleted: 'Marker som gennemført',
    askCoachExercise: 'Spørg AI Coach om denne øvelse', sheetMusic: 'Noder', video: 'Video', close: 'Luk', back: 'Tilbage', next: 'Næste', play: 'Afspil', pause: 'Pause', loop: 'Gentag',
    loadingNotation: 'Indlæser noder…', notationError: 'Kunne ikke hente noder. Upload via admin-knappen.',
    lightMode: 'Lys tilstand', darkMode: 'Mørk tilstand', languageName: { da: 'Dansk', en: 'Engelsk', de: 'Tysk', es: 'Spansk' },
    exercisesTitle: 'Øvelser', exercisesUnit: 'øvelser', free: 'gratis', searchExercises: 'Søg efter teknik, groove…', noExerciseMatches: 'Ingen øvelser matcher',
    saveProgressDescription: 'Log ind med Google for at gemme dine øvelser, point og streak.', loginError: 'Fejl under login med Google. Prøv igen.', signingIn: 'Logger ind…', askQuestion: 'Stil et spørgsmål…',
    coachIntro: 'Hej {name} 👋\nJeg er din AI Coach. Hvad øver du dig på for øjeblikket, og hvordan går det?', coachStatus: 'Online · husker dit niveau',
    coachFallback: 'Noget gik galt. Prøv igen.', coachOffline: 'Jeg kan ikke nå serveren lige nu. Tjek din forbindelse og prøv igen.',
    coachSuggestions: ['Hvad skal jeg øve i dag?', 'Hjælp med timing', 'Forklar paradiddle', 'Hjælp med fills'],
    startJourney: 'Start min rejse', signInAndStartJourney: 'Log ind og start min rejse', continueJourney: 'Fortsæt min rejse',
    journeyHint: 'Din rejse og dine fremskridt gemmes, så du altid kan fortsætte.', journeySaving: 'Gemmer din rejse…', journeyLoginError: 'Login mislykkedes. Prøv igen.',
    continueHere: 'Fortsæt her',
  },
  en: {
    guest: 'Guest', greeting: 'Hi', chooseLevel: 'Choose your level', warmupTechnique: 'Warm-up / technique',
    levels: {
      begynder: { label: 'Beginner', description: 'Build control, pulse, and strong fundamentals.' },
      oevet: { label: 'Intermediate', description: 'Expand your tempo, dynamics, and coordination.' },
      rutineret: { label: 'Advanced', description: 'Refine your technique, flow, and endurance.' },
    },
    techniques: {
      enkeltslag: { label: 'Single strokes', description: 'Alternate right and left with an even sound.' },
      dobbeltslag: { label: 'Double strokes', description: 'Play two controlled strokes with each hand.' },
      paradiddles: { label: 'Paradiddles', description: 'Combine single and double strokes.' },
      mix: { label: 'Mix', description: 'Bring the techniques together in a complete warm-up.' },
    },
    focusAreas: ['Control', 'Steady pulse', 'Accents', 'Dynamics', 'Endurance', 'Tempo', 'Coordination', 'Full sequence'],
    libraryCount: '15 in the library', playWithMusic: 'Play with music', digitalKit: 'Digital drum kit', askAnything: 'Ask anything',
    todayFundamentals: 'Today · Fundamentals', lessonTitle: 'Grooves & fills pt. 1', lessonDescription: 'Hi-hat patterns with half notes over the bass drum.',
    continueLesson: 'Continue lesson', keepPracticing: 'Keep practicing', dayStreak: 'day streak', continueWhere: 'Continue where you left off',
    timingTitle: 'Sixteenths · timing', timingMeta: 'Notation · 4 min left', thisWeek: 'This week', practiceDays: 'practice days',
    chooseTechnique: 'Choose a technique track', completed: 'Completed', progressiveExercises: '8 progressive exercises',
    backToTechniques: 'Back to technique tracks', backHome: 'Back to home', markCompleted: 'Mark as completed',
    askCoachExercise: 'Ask AI Coach about this exercise', sheetMusic: 'Sheet music', video: 'Video', close: 'Close', back: 'Back', next: 'Next', play: 'Play', pause: 'Pause', loop: 'Loop',
    loadingNotation: 'Loading sheet music…', notationError: 'Could not load the sheet music. Upload it with the admin button.',
    lightMode: 'Light mode', darkMode: 'Dark mode', languageName: { da: 'Danish', en: 'English', de: 'German', es: 'Spanish' },
    exercisesTitle: 'Exercises', exercisesUnit: 'exercises', free: 'free', searchExercises: 'Search techniques, grooves…', noExerciseMatches: 'No exercises match',
    saveProgressDescription: 'Sign in with Google to save your exercises, points, and streak.', loginError: 'Google sign-in failed. Please try again.', signingIn: 'Signing in…', askQuestion: 'Ask a question…',
    coachIntro: 'Hi {name} 👋\nI’m your AI Coach. What are you practicing right now, and how is it going?', coachStatus: 'Online · remembers your level',
    coachFallback: 'Something went wrong. Please try again.', coachOffline: 'I can’t reach the server right now. Check your connection and try again.',
    coachSuggestions: ['What should I practice today?', 'Help with timing', 'Explain paradiddles', 'Help with fills'],
    startJourney: 'Start my journey', signInAndStartJourney: 'Sign in and start my journey', continueJourney: 'Continue my journey',
    journeyHint: 'Your journey and progress are saved, so you can always continue.', journeySaving: 'Saving your journey…', journeyLoginError: 'Sign-in failed. Please try again.',
    continueHere: 'Continue here',
  },
  de: {
    guest: 'Gast', greeting: 'Hallo', chooseLevel: 'Wähle dein Niveau', warmupTechnique: 'Aufwärmen / Technik',
    levels: {
      begynder: { label: 'Anfänger', description: 'Baue Kontrolle, Pulsgefühl und gute Grundlagen auf.' },
      oevet: { label: 'Fortgeschritten', description: 'Erweitere Tempo, Dynamik und Koordination.' },
      rutineret: { label: 'Erfahren', description: 'Verfeinere Technik, Spielfluss und Ausdauer.' },
    },
    techniques: {
      enkeltslag: { label: 'Einzelschläge', description: 'Rechts und links abwechselnd mit gleichmäßigem Klang.' },
      dobbeltslag: { label: 'Doppelschläge', description: 'Zwei kontrollierte Schläge mit jeder Hand.' },
      paradiddles: { label: 'Paradiddles', description: 'Kombiniere Einzel- und Doppelschläge.' },
      mix: { label: 'Mix', description: 'Verbinde die Techniken zu einem kompletten Warm-up.' },
    },
    focusAreas: ['Kontrolle', 'Gleichmäßiger Puls', 'Akzente', 'Dynamik', 'Ausdauer', 'Tempo', 'Koordination', 'Komplette Sequenz'],
    libraryCount: '15 in der Bibliothek', playWithMusic: 'Mit Musik spielen', digitalKit: 'Digitales Schlagzeug', askAnything: 'Alles fragen',
    todayFundamentals: 'Heute · Grundlagen', lessonTitle: 'Grooves & Fills Teil 1', lessonDescription: 'Hi-Hat-Muster mit halben Noten über der Bassdrum.',
    continueLesson: 'Lektion fortsetzen', keepPracticing: 'Weiterüben', dayStreak: 'Tage am Stück', continueWhere: 'Dort weitermachen, wo du aufgehört hast',
    timingTitle: 'Sechzehntel · Timing', timingMeta: 'Notenlehre · noch 4 Min.', thisWeek: 'Diese Woche', practiceDays: 'Übungstage',
    chooseTechnique: 'Technikpfad wählen', completed: 'Abgeschlossen', progressiveExercises: '8 aufbauende Übungen',
    backToTechniques: 'Zurück zu den Technikpfaden', backHome: 'Zurück zur Startseite', markCompleted: 'Als abgeschlossen markieren',
    askCoachExercise: 'KI-Coach zu dieser Übung fragen', sheetMusic: 'Noten', video: 'Video', close: 'Schließen', back: 'Zurück', next: 'Weiter', play: 'Abspielen', pause: 'Pause', loop: 'Wiederholen',
    loadingNotation: 'Noten werden geladen…', notationError: 'Noten konnten nicht geladen werden. Über die Admin-Schaltfläche hochladen.',
    lightMode: 'Heller Modus', darkMode: 'Dunkler Modus', languageName: { da: 'Dänisch', en: 'Englisch', de: 'Deutsch', es: 'Spanisch' },
    exercisesTitle: 'Übungen', exercisesUnit: 'Übungen', free: 'kostenlos', searchExercises: 'Technik oder Groove suchen…', noExerciseMatches: 'Keine Übungen passen zu',
    saveProgressDescription: 'Melde dich mit Google an, um Übungen, Punkte und deine Serie zu speichern.', loginError: 'Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.', signingIn: 'Anmeldung läuft…', askQuestion: 'Stelle eine Frage…',
    coachIntro: 'Hallo {name} 👋\nIch bin dein KI-Coach. Was übst du gerade, und wie läuft es?', coachStatus: 'Online · merkt sich dein Niveau',
    coachFallback: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.', coachOffline: 'Der Server ist gerade nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.',
    coachSuggestions: ['Was soll ich heute üben?', 'Hilfe beim Timing', 'Paradiddles erklären', 'Hilfe bei Fills'],
    startJourney: 'Meine Reise starten', signInAndStartJourney: 'Anmelden und meine Reise starten', continueJourney: 'Meine Reise fortsetzen',
    journeyHint: 'Deine Reise und Fortschritte werden gespeichert, damit du jederzeit weitermachen kannst.', journeySaving: 'Deine Reise wird gespeichert…', journeyLoginError: 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.',
    continueHere: 'Hier weitermachen',
  },
  es: {
    guest: 'Invitado', greeting: 'Hola', chooseLevel: 'Elige tu nivel', warmupTechnique: 'Calentamiento / técnica',
    levels: {
      begynder: { label: 'Principiante', description: 'Desarrolla control, pulso y buenos fundamentos.' },
      oevet: { label: 'Intermedio', description: 'Amplía el tempo, la dinámica y la coordinación.' },
      rutineret: { label: 'Avanzado', description: 'Perfecciona la técnica, la fluidez y la resistencia.' },
    },
    techniques: {
      enkeltslag: { label: 'Golpes simples', description: 'Alterna derecha e izquierda con un sonido uniforme.' },
      dobbeltslag: { label: 'Golpes dobles', description: 'Toca dos golpes controlados con cada mano.' },
      paradiddles: { label: 'Paradiddles', description: 'Combina golpes simples y dobles.' },
      mix: { label: 'Mix', description: 'Combina las técnicas en un calentamiento completo.' },
    },
    focusAreas: ['Control', 'Pulso estable', 'Acentos', 'Dinámica', 'Resistencia', 'Tempo', 'Coordinación', 'Secuencia completa'],
    libraryCount: '15 en la biblioteca', playWithMusic: 'Toca con música', digitalKit: 'Batería digital', askAnything: 'Pregunta lo que quieras',
    todayFundamentals: 'Hoy · Fundamentos', lessonTitle: 'Grooves y fills, parte 1', lessonDescription: 'Patrones de hi-hat con blancas sobre el bombo.',
    continueLesson: 'Continuar lección', keepPracticing: 'Sigue practicando', dayStreak: 'días seguidos', continueWhere: 'Continúa donde lo dejaste',
    timingTitle: 'Semicorcheas · tempo', timingMeta: 'Notación · quedan 4 min', thisWeek: 'Esta semana', practiceDays: 'días de práctica',
    chooseTechnique: 'Elige una ruta técnica', completed: 'Completado', progressiveExercises: '8 ejercicios progresivos',
    backToTechniques: 'Volver a las rutas técnicas', backHome: 'Volver al inicio', markCompleted: 'Marcar como completado',
    askCoachExercise: 'Pregunta al Coach de IA sobre este ejercicio', sheetMusic: 'Partitura', video: 'Vídeo', close: 'Cerrar', back: 'Volver', next: 'Siguiente', play: 'Reproducir', pause: 'Pausa', loop: 'Repetir',
    loadingNotation: 'Cargando partitura…', notationError: 'No se pudo cargar la partitura. Súbela con el botón de administración.',
    lightMode: 'Modo claro', darkMode: 'Modo oscuro', languageName: { da: 'Danés', en: 'Inglés', de: 'Alemán', es: 'Español' },
    exercisesTitle: 'Ejercicios', exercisesUnit: 'ejercicios', free: 'gratis', searchExercises: 'Busca técnica o groove…', noExerciseMatches: 'Ningún ejercicio coincide con',
    saveProgressDescription: 'Inicia sesión con Google para guardar tus ejercicios, puntos y racha.', loginError: 'Error al iniciar sesión con Google. Inténtalo de nuevo.', signingIn: 'Iniciando sesión…', askQuestion: 'Haz una pregunta…',
    coachIntro: 'Hola {name} 👋\nSoy tu Coach de IA. ¿Qué estás practicando ahora y cómo te va?', coachStatus: 'En línea · recuerda tu nivel',
    coachFallback: 'Algo salió mal. Inténtalo de nuevo.', coachOffline: 'No puedo conectar con el servidor ahora. Comprueba tu conexión e inténtalo de nuevo.',
    coachSuggestions: ['¿Qué debería practicar hoy?', 'Ayuda con el tempo', 'Explica los paradiddles', 'Ayuda con fills'],
    startJourney: 'Empezar mi viaje', signInAndStartJourney: 'Iniciar sesión y empezar mi viaje', continueJourney: 'Continuar mi viaje',
    journeyHint: 'Tu viaje y tu progreso se guardan para que siempre puedas continuar.', journeySaving: 'Guardando tu viaje…', journeyLoginError: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
    continueHere: 'Continuar aquí',
  },
};

interface PracticeScreenProps extends ScreenProps {
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
  isDesktop?: boolean;
}

interface TrackDetailProps extends ScreenProps {
  trackId: string;
  onClose: () => void;
  onOpenLesson: (id: string) => void;
  onOpenCoach: () => void;
}

interface LessonDetailProps extends ScreenProps {
  lessonId: string;
  onClose: () => void;
  onOpenCoach: () => void;
}

type StudioKitScreenProps = ScreenProps;


interface CoachScreenProps extends ScreenProps {
  onClose: () => void;
  selectedLevel?: TrainingLevel | null;
  selectedTechnique?: TechniqueProgram | null;
  journey?: JourneyProgress | null;
  currentExerciseTitle?: string | null;
}

interface ProfileScreenProps extends ScreenProps {
  setDark: (dark: boolean) => void;
  guestXp: number;
}

interface TabBarProps {
  tab: string;
  onTab: (tab: string) => void;
  t: ThemeTokens;
  dark: boolean;
  isMobile: boolean;
  selectedCategory: string | null;
  isAdmin?: boolean;
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
  onOpenAdmin?: () => void;
}


// ─────────────────────────────────────────────────────────────
// Icons & illustrations
// ─────────────────────────────────────────────────────────────
interface IcProps extends Omit<React.SVGProps<SVGSVGElement>, 'fill'> {
  size?: number;
  color?: string;
  fill?: boolean;
  sw?: number;
}

const Ic: React.FC<IcProps> = ({ size = 22, color = 'currentColor', children, fill = false, sw = 1.8, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);


const IcSpark = (p: IcProps) => <Ic {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></Ic>;
// const _IcUser = (p: IcProps) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Ic>;
const IcPlay = (p: IcProps) => <Ic {...p} fill><path d="M7 4l13 8-13 8V4z" stroke="none"/></Ic>;
const IcPause = (p: IcProps) => <Ic {...p} fill><rect x="6" y="4" width="4" height="16" rx="1" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" stroke="none"/></Ic>;
const IcBack = (p: IcProps) => <Ic {...p}><path d="M15 5l-7 7 7 7"/></Ic>;
const IcChev = (p: IcProps) => <Ic {...p}><path d="M9 5l7 7-7 7"/></Ic>;
const IcMore = (p: IcProps) => <Ic {...p}><circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></Ic>;
const IcCheck = (p: IcProps) => <Ic {...p}><path d="M4 12l5 5L20 6"/></Ic>;
const IcLock = (p: IcProps) => <Ic {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Ic>;
const IcSun = (p: IcProps) => <Ic {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Ic>;
const IcMoon = (p: IcProps) => <Ic {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></Ic>;
const IcSend = (p: IcProps) => <Ic {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></Ic>;
const IcPlus = (p: IcProps) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>;
const IcMetro = (p: IcProps) => <Ic {...p}><path d="M9 3h6l3 18H6L9 3z"/><path d="M12 14L7 7"/></Ic>;
const IcMic = (p: IcProps) => <Ic {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 12a7 7 0 0 0 14 0M12 19v3"/></Ic>;
const IcTuner = (p: IcProps) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M12 12l4-6"/></Ic>;
const IcFlame = (p: IcProps) => <Ic {...p}><path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s-1 6 4 6 4-4 4-6c0-4-4-7-4-7z"/></Ic>;
const IcClock = (p: IcProps) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>;
const IcTrophy = (p: IcProps) => <Ic {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M5 6H3v2a3 3 0 0 0 3 3M19 6h2v2a3 3 0 0 1-3 3"/><path d="M10 13v3h4v-3M8 20h8"/></Ic>;
const IcBell = (p: IcProps) => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></Ic>;
const IcLogout = (p: IcProps) => <Ic {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></Ic>;
const IcWave = (p: IcProps) => <Ic {...p}><path d="M2 12h2l2-6 4 12 4-16 4 16 2-6h2"/></Ic>;
const IcCalendar = (p: IcProps) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></Ic>;
const IcAttach = (p: IcProps) => <Ic {...p}><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3 3 0 1 1 4 4l-9 9a1 1 0 0 1-2-2l8-8"/></Ic>;
const IcLoop = (p: IcProps) => <Ic {...p}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></Ic>;
const IcMin = (p: IcProps) => <Ic {...p}><path d="M5 12h14"/></Ic>;
const IcUpload = (p: IcProps) => <Ic {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></Ic>;
const IcArrowRight = (p: IcProps) => <Ic {...p}><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></Ic>;
const IcArrowLeft = (p: IcProps) => <Ic {...p}><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></Ic>;
const IcSearch = (p: IcProps) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Ic>;
const IcHeart = (p: IcProps) => <Ic {...p}><path d="M12 20.5S3.5 15 3.5 8.8A4.8 4.8 0 0 1 12 5.7a4.8 4.8 0 0 1 8.5 3.1c0 6.2-8.5 11.7-8.5 11.7z"/></Ic>;

function TabHome({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/>
    </svg>
  );
}
function TabPractice({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <path d="M3 12 L5 8 L7 16 L9 6 L11 18 L13 7 L15 17 L17 9 L19 14 L21 12"/>
    </svg>
  );
}
function TabKit({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <ellipse cx="8" cy="12" rx="4" ry="2"/>
      <ellipse cx="16" cy="10" rx="4" ry="2"/>
      <path d="M4 12v5M12 12v5M12 10v5M20 10v6"/>
    </svg>
  );
}
function TabUser({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    </svg>
  );
}

function TabPlayalong({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Line-art drum illustrations
// ─────────────────────────────────────────────────────────────
function IllSnare({ size = 280, color = '#ef5a3a', sw = 1.4 }) {
  const W = size, H = size * 0.95;
  return (
    <svg width={W} height={H} viewBox="0 0 280 266" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="140" cy="220" rx="125" ry="22" opacity="0.18"/>
      <ellipse cx="140" cy="220" rx="95" ry="16" opacity="0.25"/>
      <line x1="60" y1="20" x2="170" y2="120" strokeWidth={sw + 0.6}/>
      <circle cx="60" cy="20" r="5"/>
      <line x1="220" y1="20" x2="110" y2="120" strokeWidth={sw + 0.6}/>
      <circle cx="220" cy="20" r="5"/>
      <ellipse cx="140" cy="142" rx="78" ry="16"/>
      <line x1="62" y1="142" x2="62" y2="200"/>
      <line x1="218" y1="142" x2="218" y2="200"/>
      <path d="M62 200 Q140 230 218 200"/>
      {[0, 1, 2, 3, 4, 5, 6].map(i => {
        const x = 80 + i * 16.6;
        return <line key={i} x1={x} y1="138" x2={x} y2="150" opacity="0.7"/>;
      })}
      <line x1="62" y1="170" x2="218" y2="170" opacity="0.55"/>
      <line x1="62" y1="180" x2="218" y2="180" opacity="0.35"/>
    </svg>
  );
}

function IllKit({ size = 280, color = '#ef5a3a', sw = 1.3 }) {
  const W = size, H = size * 0.72;
  return (
    <svg width={W} height={H} viewBox="0 0 320 230" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="50" cy="78" rx="34" ry="5"/>
      <line x1="50" y1="78" x2="50" y2="200" opacity="0.7"/>
      <line x1="40" y1="200" x2="60" y2="200"/>
      <ellipse cx="260" cy="50" rx="42" ry="6" transform="rotate(-10 260 50)"/>
      <line x1="260" y1="50" x2="270" y2="200" opacity="0.7"/>
      <line x1="262" y1="200" x2="282" y2="200"/>
      <ellipse cx="290" cy="105" rx="32" ry="5" transform="rotate(8 290 105)"/>
      <ellipse cx="120" cy="110" rx="26" ry="5"/>
      <path d="M94 110 v32 a26 5 0 0 0 52 0 v-32" />
      <ellipse cx="180" cy="110" rx="26" ry="5"/>
      <path d="M154 110 v32 a26 5 0 0 0 52 0 v-32" />
      <ellipse cx="150" cy="170" rx="62" ry="14"/>
      <path d="M88 170 v18 a62 14 0 0 0 124 0 v-18" />
      <ellipse cx="150" cy="172" rx="20" ry="4" opacity="0.6"/>
      <ellipse cx="65" cy="148" rx="22" ry="5"/>
      <path d="M43 148 v22 a22 5 0 0 0 44 0 v-22" />
      <line x1="43" y1="170" x2="87" y2="172" opacity="0.5"/>
      <line x1="65" y1="175" x2="50" y2="208" opacity="0.5"/>
      <line x1="65" y1="175" x2="80" y2="208" opacity="0.5"/>
    </svg>
  );
}

function IllSticks({ size = 80, color = '#ef5a3a', sw = 1.6 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <line x1="6" y1="8" x2="92" y2="50"/>
      <circle cx="6" cy="8" r="3"/>
      <line x1="94" y1="8" x2="8" y2="50"/>
      <circle cx="94" cy="8" r="3"/>
    </svg>
  );
}



// Lazy OSMD wrapper — kun client-side
const OsmdRenderer = dynamic(() => import('@/components/OsmdRenderer'), { ssr: false });

function NotationRenderer({ xml, accent }: { xml: string; accent: string }) {
  const [measure, setMeasure] = React.useState(1);
  return (
    <div style={{ width: '100%', background: '#FAF8F5' }}>
      <OsmdRenderer xmlData={xml} zoom={0.7} currentMeasure={measure} onLoadStatus={() => {}} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
        <button onClick={() => setMeasure(m => Math.max(1, m - 1))} style={{ background: 'transparent', border: `1px solid ${accent}`, color: accent, borderRadius: 6, padding: '2px 10px', fontSize: 14, cursor: 'pointer' }}>‹</button>
        <span style={{ fontSize: 11, color: '#8a8580', alignSelf: 'center' }}>Takt {measure}</span>
        <button onClick={() => setMeasure(m => m + 1)} style={{ background: 'transparent', border: `1px solid ${accent}`, color: accent, borderRadius: 6, padding: '2px 10px', fontSize: 14, cursor: 'pointer' }}>›</button>
      </div>
    </div>
  );
}

interface DrumNotationProps {
  color?: string;
  width?: number;
  accent?: string;
  active?: number;
}

const DrumNotation: React.FC<DrumNotationProps> = ({ color = '#f5f5f7', width = 340, accent = '#ef5a3a', active = 2 }) => {
  const top = 28, lineGap = 9;
  const lines = [0, 1, 2, 3, 4].map(i => top + i * lineGap);
  const W = width;
  const startX = 60;
  const endX = W - 18;
  const span = endX - startX;
  const xs = Array.from({ length: 8 }, (_, i) => startX + (span / 8) * (i + 0.5));

  return (
    <svg width={W} height={130} viewBox={`0 0 ${W} 130`} style={{ display: 'block' }}>
      {lines.map((y, i) => (
        <line key={i} x1={14} y1={y} x2={W - 6} y2={y} stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      ))}
      <line x1={14} y1={lines[0]} x2={14} y2={lines[4]} stroke={color} strokeOpacity="0.5" strokeWidth="1.5" />
      <line x1={W - 6} y1={lines[0]} x2={W - 6} y2={lines[4]} stroke={color} strokeOpacity="0.5" strokeWidth="1.5" />
      <text x={22} y={lines[1] + 4} fill={color} fontSize="16" fontWeight="700" fontFamily="Georgia, serif">4</text>
      <text x={22} y={lines[3] + 4} fill={color} fontSize="16" fontWeight="700" fontFamily="Georgia, serif">4</text>

      {xs.map((x, i) => {
        const isActive = i === active;
        return (
          <g key={`hh-${i}`} opacity={isActive ? 1 : 0.6}>
            <path d={`M${x-4},${top - 12} L${x+4},${top - 4} M${x+4},${top - 12} L${x-4},${top - 4}`} stroke={isActive ? accent : color} strokeWidth="1.8" strokeLinecap="round"/>
          </g>
        );
      })}

      {[2, 6].map(i => {
        const x = xs[i];
        const isActive = i === active;
        return (
          <g key={`sn-${i}`}>
            <ellipse cx={x} cy={lines[2]} rx="5" ry="3.6" fill={isActive ? accent : color} transform={`rotate(-18 ${x} ${lines[2]})`}/>
          </g>
        );
      })}

      {[0, 4].map(i => {
        const x = xs[i];
        const isActive = i === active;
        return (
          <ellipse key={`kk-${i}`} cx={x} cy={lines[4] + 12} rx="5" ry="3.6" fill={isActive ? accent : color} transform={`rotate(-18 ${x} ${lines[4] + 12})`}/>
        );
      })}

      {xs.map((x, i) => (
        <line key={`stem-${i}`} x1={x + 4} y1={top - 8} x2={x + 4} y2={top - 28} stroke={color} strokeOpacity="0.5" strokeWidth="1.4"/>
      ))}
      {[0, 2, 4, 6].map(i => (
        <line key={`beam-${i}`} x1={xs[i] + 4} y1={top - 28} x2={xs[i + 1] + 4} y2={top - 28} stroke={color} strokeOpacity="0.5" strokeWidth="3"/>
      ))}

      {[0, 2, 4, 6].map((i, idx) => (
        <text key={`bn-${i}`} x={xs[i]} y={lines[4] + 32} fill={color} opacity="0.45" fontSize="11" fontFamily="ui-monospace, monospace" textAnchor="middle">{idx + 1}</text>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Design Components
// ─────────────────────────────────────────────────────────────
function SectionLabel({ children, t, color }: { children: React.ReactNode; t: ThemeTokens; color?: string }) {
  return (
    <div style={{
      fontFamily: t.font, fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
      textTransform: 'uppercase', color: color || t.textMuted, marginBottom: 12,
    }}>{children}</div>
  );
}

function Card({ children, t, style = {}, onClick, padding = 18, className = '' }: { children: React.ReactNode; t: ThemeTokens; style?: React.CSSProperties; onClick?: () => void; padding?: number; className?: string }) {
  return (
    <div className={className} onClick={onClick} style={{
      background: 'transparent',
      border: `1px solid ${t.hairline}`,
      borderRadius: 0, padding, cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      ...style,
    }}>{children}</div>
  );
}

// Statustag — farvet prik + mono versaltekst, ingen pilleform (kun semantiske "IGANG"-lignende korte tags)
function Pill({ children, t, tone = 'default' }: { children: React.ReactNode; t: ThemeTokens; tone?: 'default' | 'accent' | 'good' }) {
  const map = {
    default: t.textMuted,
    accent: t.accent,
    good: t.good,
  };
  const fg = map[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      color: fg, fontSize: 10.5, fontWeight: 700,
      fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: fg, flexShrink: 0 }} />
      {children}
    </span>
  );
}

// Signaturelement — taktlinje af tick-marks i stedet for en glat gradient-bjælke
function Progress({ pct, t, h = 6, color, bars = 12 }: { pct: number; t: ThemeTokens; h?: number; color?: string; bars?: number }) {
  const filled = Math.round((pct / 100) * bars);
  return (
    <div style={{ width: '100%', height: h, display: 'flex', alignItems: 'flex-end', gap: Math.max(2, h * 0.18) }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} style={{
          flex: 1, height: '100%',
          background: i < filled ? (color || t.accent) : t.tickMuted,
        }} />
      ))}
    </div>
  );
}

function CTA({ children, t, onClick, variant = 'primary', icon, className = '' }: { children: React.ReactNode; t: ThemeTokens; onClick?: () => void; variant?: 'primary' | 'secondary'; icon?: React.ReactNode; className?: string }) {
  const isPrimary = variant === 'primary';
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      className={className}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        width: '100%', padding: '16px 18px', borderRadius: 0,
        background: isPrimary ? t.text : 'transparent',
        color: isPrimary ? t.bg : t.text,
        border: isPrimary ? 'none' : `1px solid ${t.hairline}`,
        fontFamily: t.font, fontSize: 15, fontWeight: 700,
        letterSpacing: 0.2, textTransform: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
      }}>
      {icon}{children}
    </button>
  );
}

function Display({ children, t, size = 32, style = {} }: { children: React.ReactNode; t: ThemeTokens; size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: t.head, fontWeight: 800, fontSize: size,
      lineHeight: 1.08, color: t.text, letterSpacing: -0.6, ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Exercise Progress Tracking (localStorage)
// ─────────────────────────────────────────────────────────────
const PROGRESS_KEY = 'pocketdrummer_exercise_progress';

interface ExerciseProgressItem {
  opened: boolean;
  completed: boolean;
  lastOpened?: string;
}

function useExerciseProgress() {
  const [progress, setProgress] = React.useState<Record<string, ExerciseProgressItem>>({});

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) setTimeout(() => setProgress(JSON.parse(stored)), 0);
    } catch {}
  }, []);

  const save = (updated: Record<string, ExerciseProgressItem>) => {
    setProgress(updated);
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated)); } catch {}
  };

  const markOpened = (key: string) =>
    save({ ...progress, [key]: { ...progress[key], opened: true, lastOpened: new Date().toISOString() } });

  const markCompleted = (key: string) =>
    save({ ...progress, [key]: { ...progress[key], opened: true, completed: true, lastOpened: new Date().toISOString() } });

  const isCompleted = (key: string) => !!progress[key]?.completed;

  const getCategoryProgress = (category: string, total: number) => {
    const done = Object.keys(progress).filter(k =>
      k.startsWith(`${category}_`) && progress[k]?.completed
    ).length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  return { progress, markOpened, markCompleted, isCompleted, getCategoryProgress };
}

// ─────────────────────────────────────────────────────────────
// Video URL mapping (category + exercise id → YouTube embed)
// ─────────────────────────────────────────────────────────────
const EXERCISE_VIDEOS: Record<string, string[]> = {
  opvarmning: [
    'https://www.youtube-nocookie.com/embed/F4FO7rsp-e0?rel=0&modestbranding=1',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=120',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=240',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=360',
  ],
  nodelære: [
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=150',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=300',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=450',
  ],
  grooves: [
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=180',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=360',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=540',
  ],
  playalong: [
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=200',
    'https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&start=400',
  ],
};

function getVideoUrl(category: string, id: number): string {
  const arr = EXERCISE_VIDEOS[category] ?? EXERCISE_VIDEOS.grooves;
  return arr[Math.min(id - 1, arr.length - 1)];
}

// ─────────────────────────────────────────────────────────────
// iOS Frame components
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      display: 'flex', gap: 154, alignItems: 'center', padding: '21px 24px 19px', boxSizing: 'border-box',
      position: 'relative', zIndex: 20, width: '100%',
    }}>
      <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', paddingTop: 1.5 }}>
        <span style={{
          fontFamily: '-apple-system, "SF Pro", system-ui', fontWeight: 590,
          fontSize: 17, lineHeight: '22px', color: c,
        }}>{time}</span>
      </div>
      <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', gap: 7, paddingTop: 1, paddingRight: 1 }}>
        <svg width="19" height="12" viewBox="0 0 19 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c}/>
          <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c}/>
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c}/>
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c}/>
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/>
          <circle cx="8.5" cy="10.5" r="1.5" fill={c}/>
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c}/>
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screens
// ─────────────────────────────────────────────────────────────

// 1. Onboarding Splash
function OnboardingScreen({ t, onStart }: { t: ThemeTokens; dark: boolean; onStart: () => void }) {
  const { language } = useLanguage();
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, background: t.bg,
      color: t.text, fontFamily: t.font,
      paddingTop: 'calc(var(--safe-top, 62px) + 28px)',
      paddingBottom: 'calc(var(--safe-bottom, 0px) + 32px)',
      paddingLeft: 28, paddingRight: 28,
      display: 'flex', flexDirection: 'column', }}>
      <div>
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 56, letterSpacing: -1,
          lineHeight: 1, display: 'flex', alignItems: 'baseline',
        }}>
          Pocket Drummer<span style={{ color: t.accent, fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{
          fontFamily: t.font, fontSize: 12, fontWeight: 700, letterSpacing: 2.4,
          textTransform: 'uppercase', color: t.textMuted, marginTop: 6,
        }}>
          {language === 'da' ? 'Spil. Øv. Udvikl dig.' : language === 'en' ? 'Play. Practice. Progress.' : language === 'de' ? 'Spielen. Üben. Fortschreiten.' : 'Tocar. Practicar. Progresar.'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1 }}>
        <div style={{
          position: 'absolute', width: 280, height: 280,
          background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 70%)`,
          borderRadius: '50%', filter: 'blur(10px)',
        }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IllSticks size={130} color={t.accent} sw={1.8} />
          <div style={{ marginTop: -10 }}>
            <IllSnare size={250} color={t.accent} sw={1.5} />
          </div>
        </div>
      </div>

      <div>
        <Display t={t} size={22} style={{ textAlign: 'center', marginBottom: 10 }}>
          {language === 'da' ? 'Din rejse begynder her' : language === 'en' ? 'Your journey starts here' : language === 'de' ? 'Deine Reise beginnt hier' : 'Tu viaje comienza aquí'}
        </Display>
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.7,
          textAlign: 'center', lineHeight: 1.4, marginBottom: 24, padding: '0 12px',
        }}>
          {language === 'da' ? 'Uanset dit niveau, hjælper vi dig med at blive en bedre trommeslager.' : language === 'en' ? 'No matter your level, we help you become a better drummer.' : language === 'de' ? 'Egal welches Niveau, wir helfen dir ein besserer Schlagzeuger zu werden.' : 'No importa tu nivel, te ayudamos a convertirte en un mejor baterista.'}
        </div>

        <CTA t={t} onClick={onStart} className="active-pulse">{language === 'da' ? 'Kom i gang' : language === 'en' ? 'Get Started' : language === 'de' ? 'Loslegen' : 'Comenzar'}</CTA>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onStart} style={{
            background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase',
            fontFamily: t.font,
          }}>
            {language === 'da' ? 'Har du allerede en konto? Log ind' : language === 'en' ? 'Already have an account? Log in' : language === 'de' ? 'Hast du bereits ein Konto? Anmelden' : '¿Ya tienes una cuenta? Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Home Screen
function HomeScreen({ t, dark, setDark, onSelectCategory, onSelectLevel, onOpenCoach, guestXp, isDesktop, journey, onStartJourneyTrack }: HomeScreenProps) {
  const { user } = useAuth();
  const { language, setLanguage, t: translate } = useLanguage();
  const copy = PROTOTYPE_COPY[language];
  const displayName = user ? (user.displayName || user.email?.split('@')[0] || copy.guest) : copy.guest;

  const dateLang = language === 'da' ? 'da-DK' : language === 'en' ? 'en-US' : language === 'de' ? 'de-DE' : 'es-ES';
  const todayRaw = new Date().toLocaleDateString(dateLang, { weekday: 'long', day: 'numeric', month: 'long' });
  const todayStr = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

  const xp = user?.xp !== undefined ? user.xp : guestXp;
  const level = user ? (user.level || 1) : Math.floor(xp / 200) + 1;
  const streak = user?.streak !== undefined ? user.streak : 3;
  const xpPct = ((xp % 200) / 200) * 100;
  const contentMax = isDesktop ? 980 : undefined;

  // Dagens anbefalede øvelse — udledt dynamisk af journey-state (P1.4)
  const recLevel: TrainingLevel = journey?.level || 'begynder';
  const recTechnique: TechniqueProgram = journey?.technique || 'enkeltslag';
  const currentStepNumber = (journey?.lastExerciseId ?? 0) + 1;
  const hasActiveJourney = Boolean(journey);

  const recTag = hasActiveJourney
    ? `${copy.levels[recLevel].label} · ${copy.continueHere}`
    : `${copy.todayFundamentals}`;

  const recTitle = hasActiveJourney
    ? `${copy.levels[recLevel].label} · ${copy.techniques[recTechnique].label}`
    : `${copy.levels.begynder.label} · ${copy.techniques.enkeltslag.label}`;

  const recDescription = hasActiveJourney
    ? `${copy.techniques[recTechnique].description} (Trin ${currentStepNumber} af 8 i dit personlige spor)`
    : `${copy.techniques.enkeltslag.description} (Trin 1: Single Stroke Roll)`;

  const recProgressPct = hasActiveJourney
    ? Math.min(100, Math.max(14, (currentStepNumber / 8) * 100))
    : 12.5;

  const handleStartRecommended = () => {
    if (onStartJourneyTrack) {
      onStartJourneyTrack(recLevel, recTechnique);
    } else {
      onSelectLevel(recLevel);
    }
  };

  const quickTiles = [
    {
      id: 'practice',
      title: translate('practice') || 'Øvelser',
      desc: copy.libraryCount,
      icon: <TabPractice size={22} color={t.good} />,
      iconColor: t.good,
      action: () => onSelectCategory('nodelære'),
    },
    {
      id: 'playalong',
      title: translate('playalong') || 'Play-along',
      desc: copy.playWithMusic,
      icon: <TabPlayalong size={22} color={t.accent} />,
      iconColor: t.accent,
      action: () => onSelectCategory('playalong'),
    },
    {
      id: 'kit',
      title: translate('kit') || 'Studio Kit',
      desc: copy.digitalKit,
      icon: <TabKit size={22} color="#7B6FB0" />,
      iconColor: '#7B6FB0',
      action: () => onSelectCategory('grooves'),
    },
    {
      id: 'coach',
      title: 'AI Coach',
      desc: copy.askAnything,
      icon: <IcSpark size={21} color={t.warn} />,
      iconColor: t.warn,
      action: onOpenCoach,
    },
  ];

  const levelSelector = (desktop: boolean) => (
    <section style={{ marginTop: desktop ? 28 : 20, marginBottom: desktop ? 0 : 28 }} aria-labelledby={`level-heading-${desktop ? 'desktop' : 'mobile'}`}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16,
        paddingBottom: 12, borderBottom: `2px solid ${t.text}`,
      }}>
        <Display t={t} size={desktop ? 20 : 17} style={{ letterSpacing: -0.2 }}>
          <span id={`level-heading-${desktop ? 'desktop' : 'mobile'}`}>{copy.chooseLevel}</span>
        </Display>
        <span style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1.2 }}>
          {copy.warmupTechnique}
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: desktop ? 'repeat(3, minmax(0, 1fr))' : '1fr',
        borderBottom: `1px solid ${t.hairline}`,
      }}>
        {TRAINING_LEVELS.map((lvl, index) => (
          <button key={lvl.id} type="button" onClick={() => onSelectLevel(lvl.id)} style={{
            minHeight: desktop ? 132 : 82,
            padding: desktop ? '22px 24px' : '16px 0',
            background: 'transparent', color: t.text, border: 'none',
            borderRight: desktop && index < TRAINING_LEVELS.length - 1 ? `1px solid ${t.hairline}` : 'none',
            borderBottom: !desktop && index < TRAINING_LEVELS.length - 1 ? `1px solid ${t.hairline}` : 'none',
            textAlign: 'left', cursor: 'pointer', fontFamily: t.font,
            display: 'grid', gridTemplateColumns: '38px 1fr auto', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 700, color: t.accent }}>{lvl.number}</span>
            <span>
              <span style={{ display: 'block', fontSize: desktop ? 20 : 17, fontWeight: 800, marginBottom: 4 }}>{copy.levels[lvl.id].label}</span>
              <span style={{ display: 'block', fontSize: 12.5, lineHeight: 1.45, color: t.textMuted }}>{copy.levels[lvl.id].description}</span>
            </span>
            <IcArrowRight size={18} color={t.textMuted} />
          </button>
        ))}
      </div>
    </section>
  );

  if (isDesktop) {
    return (
      <div style={{
        width: '100%', minHeight: '100%', boxSizing: 'border-box',
        padding: '80px clamp(32px, 4vw, 72px) 48px',
        color: t.text, fontFamily: t.font,
      }}>
        <header style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 32, paddingBottom: 24, borderBottom: `2px solid ${t.text}`,
        }}>
          <div>
            <div style={{
              fontFamily: t.mono, fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
              textTransform: 'uppercase', color: t.textMuted, marginBottom: 10,
            }}>{todayStr}</div>
            <Display t={t} size={48}>{copy.greeting} {displayName}</Display>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { code: 'da', flag: '🇩🇰' },
                { code: 'en', flag: '🇬🇧' },
                { code: 'de', flag: '🇩🇪' },
                { code: 'es', flag: '🇪🇸' },
              ] satisfies { code: Language; flag: string }[]).map(l => (
                <button key={l.code} onClick={() => setLanguage(l.code)} aria-label={copy.languageName[l.code]} aria-pressed={language === l.code} style={{
                  width: 44, height: 44, background: 'transparent',
                  border: `1px solid ${language === l.code ? t.text : t.hairline}`,
                  color: t.text, fontSize: 16, cursor: 'pointer',
                }}>{l.flag}</button>
              ))}
            </div>
            <button onClick={() => setDark(!dark)} aria-label={dark ? copy.lightMode : copy.darkMode} style={{
              width: 44, height: 44, background: 'transparent', border: `1px solid ${t.hairline}`,
              color: t.textMuted, cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}>
              {dark ? <IcSun size={17} /> : <IcMoon size={17} />}
            </button>
          </div>
        </header>

        {/* Hero: Dagens Anbefalede Øvelse (Primær handling øverst) */}
        <main style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(360px, 0.85fr)',
          gap: 'clamp(32px, 4vw, 72px)', paddingTop: 32,
        }}>
          <section onClick={handleStartRecommended} style={{
            minHeight: 'clamp(400px, 55vh, 620px)', padding: 'clamp(28px, 3vw, 52px)',
            background: t.surface2, display: 'flex', flexDirection: 'column', cursor: 'pointer',
            border: `1px solid ${t.hairline}`, position: 'relative',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: t.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              textTransform: 'uppercase', color: t.accent, marginBottom: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.accent }} />
              {recTag}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Display t={t} size={54} style={{ maxWidth: 720, marginBottom: 20 }}>
                {recTitle}
              </Display>
              <p style={{ margin: 0, maxWidth: 560, color: t.textMuted, fontSize: 18, lineHeight: 1.6 }}>
                {recDescription}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 240px', alignItems: 'end', gap: 28 }}>
              <Progress pct={recProgressPct} t={t} h={44} bars={8} />
              <CTA t={t} onClick={handleStartRecommended} icon={<IcPlay size={17} color={t.bg} />}>
                {hasActiveJourney ? copy.continueJourney : copy.startJourney}
              </CTA>
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              paddingBottom: 14, borderBottom: `2px solid ${t.text}`,
            }}>
              <Display t={t} size={18}>{copy.keepPracticing}</Display>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: t.mono, fontSize: 11, color: t.textMuted }}>
                <IcFlame size={15} color={t.accent} />
                {streak} {copy.dayStreak}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
              {quickTiles.map((tile, i) => (
                <button key={tile.id} onClick={tile.action} style={{
                  minHeight: 150, padding: 24, background: 'transparent', color: t.text,
                  border: 'none', borderRight: i % 2 === 0 ? `1px solid ${t.hairline}` : 'none',
                  borderBottom: i < 2 ? `1px solid ${t.hairline}` : 'none',
                  textAlign: 'left', cursor: 'pointer', fontFamily: t.font,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      width: 42, height: 42, display: 'grid', placeItems: 'center',
                      border: `1px solid ${t.hairline}`, color: tile.iconColor,
                    }}>{tile.icon}</span>
                    <span style={{ fontFamily: t.mono, fontSize: 12, fontWeight: 700, color: t.accent }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>{tile.title}</div>
                    <div style={{ fontSize: 13, color: t.textMuted }}>{tile.desc}</div>
                  </div>
                  <IcArrowRight size={18} color={t.textMuted} />
                </button>
              ))}
            </div>
          </aside>
        </main>

        {/* Sekundær mulighed: Niveauvalg & skift */}
        {levelSelector(true)}

        <footer style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr',
          marginTop: 32, borderTop: `1px solid ${t.hairline}`,
        }}>
          <button onClick={() => onSelectCategory('nodelære')} style={{
            padding: '24px 28px 24px 0', background: 'transparent', border: 'none',
            borderRight: `1px solid ${t.hairline}`, textAlign: 'left', cursor: 'pointer', fontFamily: t.font,
          }}>
            <div style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
              {copy.continueWhere}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{copy.timingTitle}</div>
          </button>
          <div style={{ padding: 24, borderRight: `1px solid ${t.hairline}` }}>
            <div style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>{copy.thisWeek}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.accent }}>3 {copy.practiceDays} · 72 min</div>
          </div>
          <div style={{ padding: '24px 0 24px 24px' }}>
            <div style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>{translate('level')} {level}</div>
            <Progress pct={xpPct} t={t} h={12} bars={5} />
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div style={isDesktop ? {
      maxWidth: contentMax, margin: '0 auto', padding: '40px 48px 60px',
      color: t.text, fontFamily: t.font,
    } : {
      padding: '8px 22px 40px', color: t.text, fontFamily: t.font,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14, marginBottom: 6 }}>
        <div style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted }}>{todayStr}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <IcFlame size={17} color={t.accent} />
          <Display t={t} size={20}>{streak}</Display>
          <span style={{ fontFamily: t.mono, fontSize: 10.5, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
            {copy.dayStreak}
          </span>
        </div>
      </div>
      <Display t={t} size={isDesktop ? 34 : 27} style={{ letterSpacing: -0.5, marginBottom: 12 }}>
        {copy.greeting} {displayName}
      </Display>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            { code: 'da', flag: '🇩🇰' },
            { code: 'en', flag: '🇬🇧' },
            { code: 'de', flag: '🇩🇪' },
            { code: 'es', flag: '🇪🇸' }
          ] satisfies { code: Language; flag: string }[]).map(l => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              aria-label={copy.languageName[l.code]}
              aria-pressed={language === l.code}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${language === l.code ? t.accent : 'transparent'}`,
                borderRadius: 0, padding: '2px 4px 4px',
                fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1,
                opacity: language === l.code ? 1 : 0.5,
              }}
            >
              {l.flag}
            </button>
          ))}
        </div>
        <button onClick={() => setDark(!dark)} aria-label={dark ? copy.lightMode : copy.darkMode} style={{
          width: 34, height: 34, borderRadius: 0,
          background: 'transparent', border: `1px solid ${t.hairline}`, color: t.textMuted, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {dark ? <IcSun size={15} /> : <IcMoon size={15} />}
        </button>
      </div>

      {/* Primær handling: Dagens anbefalede øvelse (Øverst for entydigt fokus) */}
      <div onClick={handleStartRecommended} style={{
        borderTop: `2px solid ${t.accent}`,
        paddingTop: 16,
        marginBottom: 26,
        background: t.surface2,
        padding: 18,
        cursor: 'pointer',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: t.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase', color: t.accent, marginBottom: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent }} />
          {recTag}
        </div>
        <Display t={t} size={isDesktop ? 36 : 28} style={{ marginBottom: 8 }}>
          {recTitle}
        </Display>
        <p style={{ margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.55, color: t.textMuted }}>
          {recDescription}
        </p>
        <div style={{ marginBottom: 18 }}>
          <Progress pct={recProgressPct} t={t} h={28} bars={8} />
        </div>
        <CTA t={t} onClick={handleStartRecommended} icon={<IcPlay size={17} color={t.bg} />}>
          {hasActiveJourney ? copy.continueJourney : copy.startJourney}
        </CTA>
      </div>

      {/* Sekundær sektion: Vælg eller skift niveau */}
      {levelSelector(false)}

      {/* Tertiær sektion: Hurtig adgang */}
      <Display t={t} size={11} style={{
        fontFamily: t.mono, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase',
        color: t.textMuted, marginBottom: 2,
      }}>
        {copy.keepPracticing}
      </Display>
      {quickTiles.map((tile, i) => (
        <button key={tile.id} onClick={tile.action} style={{
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${t.hairline}`,
          padding: '16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: t.font,
        }}>
          <span style={{
            width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center',
            border: `1px solid ${t.hairline}`, color: tile.iconColor,
          }}>{tile.icon}</span>
          <span style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 600, color: t.accent, width: 18, flexShrink: 0 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{tile.title}</div>
            <div style={{ fontSize: 12.5, color: t.textMuted, marginTop: 2 }}>{tile.desc}</div>
          </div>
          <IcArrowRight size={16} color={t.textMuted} />
        </button>
      ))}

      <div style={{ height: 26 }} />

      <Display t={t} size={11} style={{
        fontFamily: t.mono, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase',
        color: t.textMuted, marginBottom: 10,
      }}>
        {copy.continueWhere}
      </Display>
      <button onClick={() => onSelectCategory('nodelære')} style={{
        background: 'transparent',
        border: 'none',
        borderBottom: `1px solid ${t.hairline}`,
        padding: '0 0 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: t.font,
        marginBottom: 26,
      }}>
        <span style={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', border: `1px solid ${t.hairline}` }}>
          <IcMetro size={20} color={t.accent} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {copy.timingTitle}
          </div>
          <div style={{ fontFamily: t.mono, fontSize: 11.5, color: t.textMuted, marginTop: 3 }}>
            {copy.timingMeta}
          </div>
        </div>
        <IcArrowRight size={17} color={t.textMuted} />
      </button>

      <div style={{ padding: 16, borderTop: `1px solid ${t.hairline}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 12.5, color: t.text, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 800 }}>{copy.thisWeek}</span>
            {' · '}
            <span style={{ fontWeight: 800, color: t.accent }}>3 {copy.practiceDays}</span>
            {' · 72 min · '}
            <span style={{ fontWeight: 800 }}>{translate('level')} {level}</span>
          </div>
          <div style={{ width: 64, flexShrink: 0 }}><Progress pct={xpPct} t={t} h={5} bars={5} /></div>
        </div>
      </div>
    </div>
  );
}

// 3. Practice Catalog Screen
const practiceTracks = [
  {
    id: 'rytme-timing',
    title: 'Rytme & Timing',
    subtitle: 'Forbedr din timing',
    blurb: 'Styrk din indre puls og få bedre kontrol over rytme, tempo og dynamik.',
    lessonCount: 15,
    level: 'Fra begynder til øvet',
    ill: 'sticks',
    progress: 27,
  },
  {
    id: 'fills-grooves',
    title: 'Fills & Grooves',
    subtitle: 'Udvid dit vokabular',
    blurb: 'Byg et bibliotek af fills og pocket grooves du kan trække i hvilken som helst situation.',
    lessonCount: 22,
    level: 'Niveau 3 og op',
    ill: 'snare',
    progress: 12,
  },
  {
    id: 'jazz-brush',
    title: 'Jazz & Brushwork',
    subtitle: 'Subtil dynamik',
    blurb: 'Lær brushteknikker, swing-feel og dynamisk kontrol i jazztraditionen.',
    lessonCount: 14,
    level: 'Niveau 5+',
    ill: 'sticks',
    progress: 0,
  },
  {
    id: 'odd-time',
    title: 'Skæve taktarter',
    subtitle: 'Ud over 4/4',
    blurb: 'Naviger 5/8, 7/8 og 11/16 — fra polyrytmer til moderne progrock.',
    lessonCount: 12,
    level: 'Niveau 6+',
    ill: 'snare',
    progress: 0,
  },
];

function PracticeScreen({ t, dark, onSelectCategory, isDesktop }: PracticeScreenProps) {
  const [search, setSearch] = useState('');
  const { language, t: translate } = useLanguage();
  const copy = PROTOTYPE_COPY[language];
  const [activeChip, setActiveChip] = useState<'Alle' | 'opvarmning' | 'nodelære' | 'grooves' | 'playalong'>('Alle');

  const allExercises = [
    { id: 'warmup-1', cat: 'opvarmning' as const, title: language === 'da' ? '5 min teknik-start' : language === 'en' ? '5 min tech startup' : language === 'de' ? '5 Min. Technik-Start' : 'Inicio técnico de 5 min', sub: language === 'da' ? 'Single strokes og håndkontrol' : language === 'en' ? 'Single strokes and hand control' : language === 'de' ? 'Single Strokes und Handkontrolle' : 'Single strokes y control de manos', dur: '5 min', bpm: '80', level: 'Begynder', tags: ['5 min', 'Single strokes'] },
    { id: 'warmup-2', cat: 'opvarmning' as const, title: language === 'da' ? 'Hånd-hastighed & kontrol' : language === 'en' ? 'Hand Speed & Control' : language === 'de' ? 'Handgeschwindigkeit & Kontrolle' : 'Velocidad y control de manos', sub: language === 'da' ? 'Dobbelt slag og paradiddle kontrol' : language === 'en' ? 'Double strokes and paradiddle control' : language === 'de' ? 'Doppelschläge und Paradiddle-Kontrolle' : 'Golpes dobles y control de paradiddle', dur: '10 min', bpm: '100', level: 'Mellemniveau', tags: ['10 min', 'Hænder', 'Double strokes', 'Paradiddles'] },
    { id: 'warmup-3', cat: 'opvarmning' as const, title: language === 'da' ? 'Stortromme styrke' : language === 'en' ? 'Bass Drum Power' : language === 'de' ? 'Bassdrum-Stärke' : 'Fuerza de bombo', sub: language === 'da' ? 'Fodkontrol og udholdenhed' : language === 'en' ? 'Foot control and endurance' : language === 'de' ? 'Fußkontrolle und Ausdauer' : 'Control de pie y resistencia', dur: '12 min', bpm: '90', level: 'Øvet', tags: ['Fødder', 'Stortrommekontrol'] },
    { id: 'notes-1', cat: 'nodelære' as const, title: language === 'da' ? 'Læs fjerdedele & pauser' : language === 'en' ? 'Read Quarter Notes & Rests' : language === 'de' ? 'Viertelnoten & Pausen lesen' : 'Leer negras y silencios', sub: language === 'da' ? 'Grundlæggende nodelæsning' : language === 'en' ? 'Basic sheet music reading' : language === 'de' ? 'Grundlegendes Notenlesen' : 'Lectura básica de partituras', dur: '5 min', bpm: '80', level: 'Begynder', tags: ['Fjerdedele', 'Pauser'] },
    { id: 'notes-2', cat: 'nodelære' as const, title: language === 'da' ? 'Ottendedele syncopation' : language === 'en' ? 'Eighth Note Syncopation' : language === 'de' ? 'Achtelnoten-Synkopen' : 'Síncopa de corcheas', sub: language === 'da' ? 'Udfordr din timing' : language === 'en' ? 'Challenge your timing' : language === 'de' ? 'Fordere dein Timing heraus' : 'Desafía tu tempo', dur: '8 min', bpm: '90', level: 'Mellemniveau', tags: ['Ottendedele', 'Accenter'] },
    { id: 'notes-3', cat: 'nodelære' as const, title: language === 'da' ? 'Sekstendedele ghost notes' : language === 'en' ? 'Sixteenth Note Ghost Notes' : language === 'de' ? 'Sechzehntel-Ghostnotes' : 'Notas fantasma de semicorcheas', sub: language === 'da' ? 'Avanceret nodeforståelse' : language === 'en' ? 'Advanced notation comprehension' : language === 'de' ? 'Fortgeschrittenes Notenverständnis' : 'Comprensión avanzada de notación', dur: '12 min', bpm: '96', level: 'Øvet', tags: ['Sekstendedele', 'Ghost notes'] },
    { id: 'grooves-1', cat: 'grooves' as const, title: 'Basic Rock Beat', sub: language === 'da' ? 'Klassisk 8.-dels groove' : language === 'en' ? 'Classic 8th note groove' : language === 'de' ? 'Klassischer Achtelgroove' : 'Groove clásico de corcheas', dur: '6 min', bpm: '90', level: 'Begynder', tags: ['Basic rock', 'Pop'] },
    { id: 'grooves-2', cat: 'grooves' as const, title: 'Funk Pocket Groove', sub: language === 'da' ? 'Syncoperet 16.-dels hi-hat groove' : language === 'en' ? 'Syncopated 16th note hi-hat groove' : language === 'de' ? 'Synkopierter Sechzehntel-Hi-Hat-Groove' : 'Groove sincopado de semicorcheas en hi-hat', dur: '10 min', bpm: '95', level: 'Mellemniveau', tags: ['Funk', 'Ghost notes'] },
    { id: 'grooves-3', cat: 'grooves' as const, title: 'Linear Funk Pattern', sub: language === 'da' ? 'Linear timing uden overlappende slag' : language === 'en' ? 'Linear timing without overlapping hits' : language === 'de' ? 'Lineares Timing ohne überlappende Schläge' : 'Tempo lineal sin golpes superpuestos', dur: '15 min', bpm: '100', level: 'Øvet', tags: ['Funk', 'Linear grooves'] },
    { id: 'playalong-1', cat: 'playalong' as const, title: 'Classic Rock 4/4 Beat', sub: language === 'da' ? 'Spil med et stærkt rock backing track' : language === 'en' ? 'Play along with a strong rock backing track' : language === 'de' ? 'Spiele zu einem starken Rock-Backing-Track' : 'Toca con una fuerte pista de acompañamiento de rock', dur: '3 min', bpm: '92', level: 'Begynder', tags: ['Rock tracks', 'Begyndertracks'] },
    { id: 'playalong-2', cat: 'playalong' as const, title: 'Funk Groove Odyssey', sub: language === 'da' ? 'Super funky synth-backing track' : language === 'en' ? 'Super funky synth backing track' : language === 'de' ? 'Super funky Synth-Backing-Track' : 'Pista de acompañamiento de sintetizador súper funky', dur: '4 min', bpm: '105', level: 'Mellemniveau', tags: ['Funk tracks', 'Formtræning'] },
  ];

  const getLevelLabel = (lvl: string) => {
    if (lvl === 'Begynder') return translate('beginner');
    if (lvl === 'Mellemniveau') return translate('intermediate');
    if (lvl === 'Øvet') return translate('advanced');
    return lvl;
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'opvarmning') return translate('warmup');
    if (cat === 'nodelære') return translate('musicTheory');
    if (cat === 'grooves') return translate('grooves');
    if (cat === 'playalong') return translate('playalong');
    return cat;
  };

  const filtered = allExercises.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(search.toLowerCase()) || ex.sub.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeChip === 'Alle') return true;
    return ex.cat === activeChip;
  });

  const chips = [
    { id: 'Alle' as const, label: language === 'da' ? 'Alle' : language === 'en' ? 'All' : language === 'de' ? 'Alle' : 'Todos' },
    { id: 'opvarmning' as const, label: translate('warmup') },
    { id: 'nodelære' as const, label: translate('musicTheory') },
    { id: 'grooves' as const, label: translate('grooves') },
    { id: 'playalong' as const, label: translate('playalong') }
  ];

  return (
    <div style={{ color: t.text, fontFamily: t.font }}>
      <div style={{
        width: '100%', boxSizing: 'border-box',
        padding: isDesktop ? '80px clamp(32px, 4vw, 72px) 60px' : '8px 22px 40px',
      }}>
        <Display t={t} size={isDesktop ? 34 : 28} style={{ marginBottom: 4 }}>
          {copy.exercisesTitle}
        </Display>
        <div style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 600, letterSpacing: 1, color: t.textMuted, textTransform: 'uppercase', marginBottom: 20 }}>
          {filtered.length} {copy.exercisesUnit} · 40 {copy.free}
        </div>

        <div style={{ position: 'relative', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, borderBottom: `2px solid ${t.text}`, paddingBottom: 12 }}>
          <IcSearch size={17} color={t.textMuted} />
          <input
            type="text"
            placeholder={copy.searchExercises}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: 0, border: 'none', background: 'transparent',
              color: t.text, fontSize: 14.5, outline: 'none', fontFamily: t.font,
              boxSizing: 'border-box',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 14
            }}>✕</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 22, marginBottom: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {chips.map(chip => {
            const active = activeChip === chip.id;
            return (
              <button key={chip.id} onClick={() => setActiveChip(chip.id)} style={{
                background: 'transparent',
                color: active ? t.text : t.textMuted,
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                padding: '0 0 10px',
                whiteSpace: 'nowrap',
                border: 'none',
                borderBottom: `2px solid ${active ? t.text : 'transparent'}`,
                borderRadius: 0,
                cursor: 'pointer',
                fontFamily: t.font,
              }}>
                {chip.label}
              </button>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))' : '1fr',
          columnGap: isDesktop ? 40 : 0,
        }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: t.textMuted }}>
              <div style={{ fontSize: 13 }}>{copy.noExerciseMatches} &quot;{search}&quot;</div>
            </div>
          ) : filtered.map((ex, idx) => {
            const levelColor = ex.level === 'Begynder' ? t.good : ex.level === 'Mellemniveau' ? t.warn : t.accent;
            const iconColor = ex.cat === 'playalong' ? t.accent : ex.cat === 'nodelære' ? t.warn : ex.cat === 'grooves' ? t.good : '#7B6FB0';
            return (
              <button key={ex.id} onClick={() => onSelectCategory(ex.cat)} style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${t.hairline}`,
                padding: '18px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                textAlign: 'left',
                fontFamily: t.font,
              }}>
                <span style={{
                  width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center',
                  border: `1px solid ${t.hairline}`,
                }}>
                  {ex.cat === 'playalong' ? <TabPlayalong size={22} color={iconColor} /> : ex.cat === 'nodelære' ? <IcMetro size={22} color={iconColor} /> : ex.cat === 'grooves' ? <TabKit size={22} color={iconColor} /> : <TabPractice size={22} color={iconColor} />}
                </span>
                <span style={{ fontFamily: t.head, fontWeight: 700, fontSize: 16, color: t.tickMuted, width: 22, flexShrink: 0 }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: t.text, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: t.mono, fontSize: 11, letterSpacing: 0.5, color: t.textMuted }}>
                    <span style={{ color: levelColor, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: levelColor, display: 'inline-block' }} />
                      {getLevelLabel(ex.level).toUpperCase()}
                    </span>
                    <span>· {ex.dur.toUpperCase()}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {getCategoryLabel(ex.cat)}</span>
                  </div>
                </div>
                <IcArrowRight size={16} color={t.textMuted} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Exercise Detail Popup
// ─────────────────────────────────────────────────────────────
interface ExerciseItem {
  id: number;
  title: string;
  sub: string;
  dur: string;
  bpm: number | string;
  tags: string[];
  level: string;
  nodrums?: boolean;
  notation?: string; // filnavn i public/content/notation/, fx 'opvarmning-2014.xml'
}

interface ExerciseDetailPopupProps {
  t: ThemeTokens;
  dark: boolean;
  exercise: ExerciseItem;
  category: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong';
  onClose: () => void;
  onMarkDone: () => void;
  isCompleted: boolean;
  onOpenCoach: () => void;
  isAdmin?: boolean;
}

function ExerciseDetailPopup({ t, exercise, category, onClose, onMarkDone, isCompleted, onOpenCoach, isAdmin }: ExerciseDetailPopupProps) {
  const { language } = useLanguage();
  const copy = PROTOTYPE_COPY[language];
  const [tab, setTab] = React.useState<'noder' | 'video'>(exercise.notation ? 'noder' : 'video');
  const [isDesktopView, setIsDesktopView] = React.useState(false);
  const [bpm, setBpm] = React.useState(typeof exercise.bpm === 'number' ? exercise.bpm : 90);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsDesktopView(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [beat, setBeat] = React.useState(0);
  const [notationXml, setNotationXml] = React.useState<string | null>(null);
  const [notationImageUrl, setNotationImageUrl] = React.useState<string | null>(null);
  const [notationLoading, setNotationLoading] = React.useState(false);
  const [notationError, setNotationError] = React.useState(false);

  const notationExt = exercise.notation?.split('.').pop()?.toLowerCase() ?? '';
  const isImageNotation = ['jpg', 'jpeg', 'png'].includes(notationExt);
  const isPdfNotation = notationExt === 'pdf';

  // Admin upload panel
  const [showUploadPanel, setShowUploadPanel] = React.useState(false);
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadXml, setUploadXml] = React.useState('');
  const [uploadImageFile, setUploadImageFile] = React.useState<File | null>(null);
  const [uploadLog, setUploadLog] = React.useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = React.useState(false);
  const [uploadSaveMsg, setUploadSaveMsg] = React.useState('');
  const suggestedFilename = `${category}-${exercise.id}`;

  // Indlæs notation: tjek Firestore-override først, derefter static file
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Tjek Firestore for URL uploadet via admin-panel
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDoc(doc(db, 'exerciseNotations', `${category}_${exercise.id}`));
        if (!cancelled && snap.exists()) {
          const data = snap.data() as { dataUrl?: string; xml?: string; mimeType?: string };
          if (data.dataUrl) {
            setNotationImageUrl(data.dataUrl);
          } else if (data.xml) {
            setNotationXml(data.xml);
          }
          setNotationLoading(false);
          return;
        }
      } catch { /* ingen Firestore-override — fortsæt til static */ }

      if (cancelled) return;

      // Static fil fra curriculum.ts
      if (!exercise.notation) return;
      if (isImageNotation || isPdfNotation) {
        setNotationImageUrl(`/content/notation/${exercise.notation}`);
        return;
      }
      setNotationLoading(true);
      setNotationError(false);
      fetch(`/content/notation/${exercise.notation}`)
        .then(r => { if (!r.ok) throw new Error(); return r.text(); })
        .then(xml => { if (!cancelled) { setNotationXml(xml); setNotationLoading(false); } })
        .catch(() => { if (!cancelled) { setNotationError(true); setNotationLoading(false); } });
    };
    load();
    return () => { cancelled = true; };
  }, [category, exercise.id, exercise.notation, isImageNotation, isPdfNotation]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Metronome
  useEffect(() => {
    if (!playing) { setTimeout(() => setBeat(0), 0); return; }
    const ms = (60000 / bpm) / 2;
    const id = setInterval(() => {
      setBeat(b => {
        const next = (b + 1) % 8;
        try {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
          }
          const ctx = audioCtxRef.current!;
          if (ctx.state === 'suspended') ctx.resume();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(next === 0 ? 880 : 660, ctx.currentTime);
          gain.gain.setValueAtTime(next === 0 ? 0.15 : 0.07, ctx.currentTime);
          osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.stop(ctx.currentTime + 0.06);
        } catch {}
        return next;
      });
    }, ms);
    return () => clearInterval(id);
  }, [playing, bpm]);

  useEffect(() => () => { audioCtxRef.current?.close(); }, []);

  const addUploadLog = (msg: string) => setUploadLog(l => [...l, msg]);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const saveNotationToFirestore = async (payload: Record<string, string>) => {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');
    await setDoc(doc(db, 'exerciseNotations', `${category}_${exercise.id}`), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  };

  const handleAdminUpload = async () => {
    if (!uploadFile) return;
    setUploadLoading(true);
    setUploadLog([]);
    setUploadXml('');
    setUploadImageFile(null);
    setUploadSaveMsg('');

    const fname = uploadFile.name.toLowerCase();
    const isXml = fname.match(/\.(xml|musicxml)$/);
    const isImage = fname.match(/\.(jpg|jpeg|png)$/) || uploadFile.type.startsWith('image/');
    const isPdf = fname.endsWith('.pdf') || uploadFile.type === 'application/pdf';

    try {
      if (isXml) {
        addUploadLog('MusicXML-fil indlæses...');
        const xml = await uploadFile.text();
        setUploadXml(xml);
        addUploadLog('XML indlæst. Klar til gem.');
      } else if (isImage || isPdf) {
        addUploadLog(`Konverterer ${uploadFile.name} til data URL...`);
        const dataUrl = await fileToDataUrl(uploadFile);
        addUploadLog('Gemmer i Firestore...');
        await saveNotationToFirestore({ dataUrl, mimeType: uploadFile.type, name: uploadFile.name });
        setNotationImageUrl(dataUrl);
        setNotationError(false);
        setUploadSaveMsg('✅ Gemt — du kan se det nu.');
        addUploadLog('✅ Klar.');
      } else {
        addUploadLog(`Sender til Gemini OMR...`);
        const formData = new FormData();
        formData.append('file', uploadFile);
        const res = await fetch('/api/scan-sheet-music', { method: 'POST', body: formData });
        const text = await res.text();
        let data: Record<string, string>;
        try { data = JSON.parse(text); } catch { throw new Error('Serverfejl — prøv igen.'); }
        if (!res.ok || data.error) {
          addUploadLog(`❌ ${data.error ?? 'Ukendt fejl'}`);
        } else {
          setUploadXml(data.xml ?? '');
          if (data.warning) addUploadLog(`⚠️ ${data.warning}`);
          addUploadLog('Scanning færdig. Klar til gem.');
        }
      }
    } catch (e) {
      addUploadLog(`❌ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAdminSave = async () => {
    if (!uploadXml) return;
    setUploadSaveMsg('Gemmer...');
    try {
      await saveNotationToFirestore({ xml: uploadXml, mimeType: 'application/xml', name: `${suggestedFilename}.xml` });
      setUploadSaveMsg('✅ XML gemt.');
      setNotationXml(uploadXml);
      setNotationImageUrl(null);
      setNotationError(false);
    } catch (e) {
      setUploadSaveMsg(`❌ ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const videoUrl = getVideoUrl(category, exercise.id);
  const lvlColor = exercise.level === 'Begynder' ? '#4edea3' : exercise.level === 'Mellemniveau' ? t.textMuted : t.accent;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 130,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      {/* Header: back | title | X */}
      <div style={{ padding: '0 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}` }}>
        <button onClick={onClose} aria-label={copy.back} style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcBack size={16} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', padding: '0 10px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: lvlColor, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>
            {exercise.level} · {exercise.dur}
          </div>
          <Display t={t} size={16}>{exercise.title}</Display>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAdmin && (
            <button
              onClick={() => setShowUploadPanel(v => !v)}
              title="Admin: Upload materiale"
              style={{
                width: 38, height: 38, borderRadius: '50%', background: showUploadPanel ? t.accent : 'transparent',
                border: `1px solid ${showUploadPanel ? t.accent : t.border}`,
                color: showUploadPanel ? '#fff' : t.textMuted, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <IcUpload size={16} />
            </button>
          )}
          <button onClick={onClose} aria-label={copy.close} style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, lineHeight: 1 }}>✕</button>
        </div>
      </div>

      {/* Admin upload panel */}
      {isAdmin && showUploadPanel && (
        <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Admin · Upload materiale til {exercise.title}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted }}>
            Filnavn: <span style={{ fontFamily: 'monospace', color: t.text }}>{suggestedFilename}.xml</span>
          </div>

          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            border: `1px dashed ${t.border}`, borderRadius: 10, cursor: 'pointer',
            fontSize: 13, color: t.textMuted,
          }}>
            <IcUpload size={16} color={t.accent} />
            <span style={{ color: uploadFile ? t.text : t.textMuted }}>
              {uploadFile ? uploadFile.name : 'Vælg PDF, billede eller XML'}
            </span>
            <input
              type="file"
              accept="image/*,application/pdf,.xml,.musicxml"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) { setUploadFile(e.target.files[0]); setUploadXml(''); setUploadLog([]); setUploadSaveMsg(''); }}}
            />
          </label>

          <button
            onClick={handleAdminUpload}
            disabled={!uploadFile || uploadLoading}
            style={{
              padding: '10px', borderRadius: 10, border: 'none',
              background: (!uploadFile || uploadLoading) ? t.surface2 : t.accent,
              color: (!uploadFile || uploadLoading) ? t.textMuted : '#fff',
              fontFamily: t.font, fontSize: 13, fontWeight: 600, cursor: uploadFile && !uploadLoading ? 'pointer' : 'default',
            }}
          >
            {uploadLoading ? 'Scanner...' : 'Start scanning / indlæs'}
          </button>

          {uploadLog.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '8px 10px', maxHeight: 80, overflowY: 'auto' }}>
              {uploadLog.map((l, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: l.startsWith('❌') ? '#F25545' : t.textMuted, marginBottom: 2 }}>{l}</div>
              ))}
            </div>
          )}

          {uploadSaveMsg && !uploadXml && (
            <div style={{ fontSize: 12, color: uploadSaveMsg.startsWith('❌') ? '#F25545' : '#4edea3', fontFamily: 'monospace' }}>
              {uploadSaveMsg}
            </div>
          )}

          {uploadXml && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                XML klar ({(uploadXml.length / 1024).toFixed(1)} KB) — gem og noderne opdateres med det samme.
              </div>
              <button
                onClick={handleAdminSave}
                style={{
                  padding: '10px', borderRadius: 10, border: 'none',
                  background: '#4edea3', color: '#0a2a1a',
                  fontFamily: t.font, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Gem som {suggestedFilename}.xml
              </button>
              {uploadSaveMsg && (
                <div style={{ fontSize: 12, color: uploadSaveMsg.startsWith('❌') ? '#F25545' : '#4edea3', fontFamily: 'monospace' }}>
                  {uploadSaveMsg}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabs — kun på mobil */}
      {!isDesktopView && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}` }}>
          {(['noder', 'video'] as const).map(tt => (
            <button key={tt} onClick={() => setTab(tt)} style={{
              flex: 1, padding: '11px 0', border: 'none', background: 'transparent',
              borderBottom: `2px solid ${tab === tt ? t.accent : 'transparent'}`,
              color: tab === tt ? t.accent : t.textMuted,
              fontFamily: t.font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              textTransform: 'capitalize',
            }}>{tt === 'noder' ? copy.sheetMusic : copy.video}</button>
          ))}
        </div>
      )}

      {/* Content — noder øverst, video under (begge synlige på desktop) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px', scrollbarWidth: 'none' }}>

        {(tab === 'noder' || isDesktopView) && (
          <div>
            {(() => {
              const urlIsPdf = notationImageUrl?.startsWith('data:application/pdf') || Boolean(notationImageUrl && /\.pdf([?#]|$)/i.test(notationImageUrl));
              const pdfUrl = notationImageUrl && urlIsPdf ? getCleanPdfUrl(notationImageUrl) : '';
              const hasMedia = notationImageUrl || notationXml;
              const noPadding = Boolean(notationImageUrl);
              return (
            <div style={{
              background: urlIsPdf ? 'transparent' : t.surface2,
              border: urlIsPdf ? 'none' : `1px solid ${t.hairline}`,
              borderRadius: 0,
              padding: noPadding ? 0 : '14px 6px',
              margin: urlIsPdf ? '0 -16px 14px' : '0 0 14px',
              overflowX: noPadding ? 'hidden' : 'auto',
              overflowY: urlIsPdf ? 'visible' : 'hidden',
              minHeight: urlIsPdf ? 'calc(100dvh - 190px)' : 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {notationImageUrl ? (
                urlIsPdf ? (
                  <iframe
                    src={pdfUrl}
                    title="Nodeark PDF"
                    style={{
                      width: '100%',
                      height: isDesktopView ? 'min(82vh, 900px)' : 'calc(100dvh - 190px)',
                      border: 'none',
                      borderRadius: 0,
                      background: '#fff',
                      display: 'block',
                    }}
                  >
                    <p style={{ padding: 16, fontSize: 13, color: '#8a8580' }}>
                      PDF kan ikke vises direkte — <a href={notationImageUrl} download="nodeark.pdf" style={{ color: '#ef5a3a' }}>klik for at downloade</a>
                    </p>
                  </iframe>
                ) : (
                  <img src={notationImageUrl} alt="Nodeark" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16 }} />
                )
              ) : notationXml ? (
                <NotationRenderer xml={notationXml} accent={t.accent} />
              ) : notationLoading ? (
                <div style={{ color: '#8a8580', fontSize: 13 }}>{copy.loadingNotation}</div>
              ) : notationError ? (
                <div style={{ color: '#F25545', fontSize: 12, padding: '0 12px', textAlign: 'center' }}>{copy.notationError}</div>
              ) : !hasMedia ? (
                <div style={{ width: '100%' }}>
                  <DrumNotation width={320} color="#16161a" accent={t.accent} active={playing ? beat : 99} />
                  <DrumNotation width={320} color="#16161a" accent={t.accent} active={99} />
                </div>
              ) : null}
            </div>
          );
        })()}

            {/* BPM + Play */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${t.hairline}`, paddingTop: 16, marginBottom: 14 }}>
              <div style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textMuted }}>Tempo</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <button onClick={() => setBpm(Math.max(40, bpm - 4))} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex' }}><IcMin size={15} /></button>
                <span style={{ fontFamily: t.head, fontWeight: 700, fontSize: 26, letterSpacing: -0.5, color: t.text }}>
                  {bpm}<span style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 600, color: t.textMuted, marginLeft: 4 }}>BPM</span>
                </span>
                <button onClick={() => setBpm(Math.min(220, bpm + 4))} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex' }}><IcPlus size={15} /></button>
              </div>
            </div>

            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>{exercise.sub}</div>

            <button onClick={() => { onMarkDone(); onClose(); }} style={{
              width: '100%', padding: '15px', borderRadius: 0, border: 'none', marginBottom: 10,
              background: isCompleted ? 'transparent' : t.text, color: isCompleted ? t.good : t.bg,
              ...(isCompleted ? { border: `1px solid ${t.good}` } : {}),
              fontFamily: t.font, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {isCompleted ? <><IcCheck size={16} /> {copy.completed}</> : copy.markCompleted}
            </button>
            <button onClick={() => { onOpenCoach(); onClose(); }} style={{
              width: '100%', padding: '12px', borderRadius: 0, border: `1px solid ${t.hairline}`,
              background: 'transparent', color: t.textMuted, fontFamily: t.font, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <IcSpark size={14} color={t.accent} /> {copy.askCoachExercise}
            </button>
          </div>
        )}

        {(tab === 'video' || isDesktopView) && (
          <div>
            <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: t.text, marginBottom: 16 }}>
              <iframe width="100%" height="100%" src={videoUrl} title={exercise.title}
                frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen style={{ width: '100%', height: '100%', border: '0' }} />
            </div>
            <Display t={t} size={18} style={{ marginBottom: 4 }}>{exercise.title}</Display>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 20 }}>{exercise.sub} · {exercise.level} · {exercise.dur}</div>
            <button onClick={() => { onMarkDone(); onClose(); }} style={{
              width: '100%', padding: '15px', borderRadius: 0, border: 'none',
              background: isCompleted ? 'transparent' : t.text, color: isCompleted ? t.good : t.bg,
              ...(isCompleted ? { border: `1px solid ${t.good}` } : {}),
              fontFamily: t.font, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {isCompleted ? <><IcCheck size={16} /> {copy.completed}</> : copy.markCompleted}
            </button>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '18px 30px calc(env(safe-area-inset-bottom) + 30px)',
        background: t.bg,
        borderTop: `2px solid ${t.text}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button aria-label={copy.loop} style={{
          background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex',
        }}>
          <IcLoop size={20} />
        </button>
        <button onClick={() => setPlaying(!playing)} aria-label={playing ? copy.pause : copy.play} style={{
          width: 62, height: 62, borderRadius: '50%', background: t.text, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg,
          cursor: 'pointer',
        }}>
          {playing ? <IcPause size={24} fill color={t.bg} /> : <IcPlay size={24} fill color={t.bg} />}
        </button>
        <button aria-label={copy.next} style={{
          background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex',
        }}>
          <IcArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

function TechniqueProgramScreen({
  t,
  dark,
  level,
  technique,
  isDesktop,
  onSelectTechnique,
  onBack,
  onOpenCoach,
  journey,
  isLoggedIn,
  journeySaving,
  journeyError,
  onStartJourney,
  onOpenExercise,
}: ScreenProps & {
  level: TrainingLevel;
  technique: TechniqueProgram | null;
  isDesktop?: boolean;
  onSelectTechnique: (technique: TechniqueProgram) => void;
  onBack: () => void;
  onOpenCoach: () => void;
  journey: JourneyProgress | null;
  isLoggedIn: boolean;
  journeySaving: boolean;
  journeyError: boolean;
  onStartJourney: (technique: TechniqueProgram) => void;
  onOpenExercise: (technique: TechniqueProgram, exerciseId: number) => void;
}) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const { markOpened, markCompleted, isCompleted } = useExerciseProgress();
  const { language, setLanguage } = useLanguage();
  const copy = PROTOTYPE_COPY[language];
  const levelInfo = TRAINING_LEVELS.find(item => item.id === level) ?? TRAINING_LEVELS[0];
  const techniqueInfo = TECHNIQUE_PROGRAMS.find(item => item.id === technique);
  const localizedLevel = copy.levels[level];
  const localizedTechnique = technique ? copy.techniques[technique] : null;
  const activeJourney = journey?.level === level ? journey : null;

  const iconFor = (id: TechniqueProgram, color: string, size = 22) => {
    if (id === 'enkeltslag') return <TabPractice size={size} color={color} />;
    if (id === 'dobbeltslag') return <IcWave size={size} color={color} />;
    if (id === 'paradiddles') return <IcLoop size={size} color={color} />;
    return <IcSpark size={size} color={color} />;
  };

  const baseBpm: Record<TrainingLevel, number> = { begynder: 60, oevet: 84, rutineret: 104 };
  const exercises: ExerciseItem[] = techniqueInfo && localizedTechnique ? Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    title: `${localizedTechnique.label} ${index + 1}`,
    sub: `${copy.focusAreas[index]} · ${localizedLevel.label}`,
    dur: `${5 + Math.floor(index / 2)} min`,
    bpm: baseBpm[level] + index * 4,
    level: localizedLevel.label,
    tags: [localizedTechnique.label, copy.focusAreas[index]],
  })) : [];

  const exerciseKey = (exercise: ExerciseItem) => `program-${level}-${technique}-${exercise.id}`;
  const completedCount = exercises.filter(exercise => isCompleted(exerciseKey(exercise))).length;

  const openExercise = (exercise: ExerciseItem) => {
    markOpened(exerciseKey(exercise));
    if (technique) onOpenExercise(technique, exercise.id);
    setSelectedExercise(exercise);
  };

  const handleJourneyAction = () => {
    const targetTechnique = technique ?? activeJourney?.technique ?? 'enkeltslag';
    onStartJourney(targetTechnique);
    if (activeJourney?.technique === technique && activeJourney.lastExerciseId) {
      const exercise = exercises.find(item => item.id === activeJourney.lastExerciseId);
      if (exercise) openExercise(exercise);
    }
  };

  return (
    <div style={{
      width: '100%', minHeight: '100%', boxSizing: 'border-box', color: t.text, fontFamily: t.font,
      padding: isDesktop ? '80px clamp(32px, 4vw, 72px) 60px' : '8px 22px 40px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginBottom: 18 }}>
        <button type="button" onClick={onBack} style={{
          minWidth: 44, minHeight: 44, padding: 0,
          background: 'transparent', border: `1px solid ${t.hairline}`, color: t.text,
          display: 'inline-grid', placeItems: 'center', cursor: 'pointer',
        }} aria-label={technique ? copy.backToTechniques : copy.backHome}>
          <IcArrowLeft size={19} />
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            { code: 'da', flag: '🇩🇰' },
            { code: 'en', flag: '🇬🇧' },
            { code: 'de', flag: '🇩🇪' },
            { code: 'es', flag: '🇪🇸' },
          ] satisfies { code: Language; flag: string }[]).map(item => (
            <button key={item.code} type="button" onClick={() => setLanguage(item.code)}
              aria-label={copy.languageName[item.code]} aria-pressed={language === item.code} style={{
                width: 36, height: 36, padding: 0, background: 'transparent', cursor: 'pointer',
                border: `1px solid ${language === item.code ? t.text : t.hairline}`,
                opacity: language === item.code ? 1 : 0.55, fontSize: 14,
              }}>
              {item.flag}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24,
        paddingBottom: 18, borderBottom: `2px solid ${t.text}`, marginBottom: 0,
      }}>
        <div>
          <div style={{ fontFamily: t.mono, fontSize: 10.5, color: t.accent, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 8 }}>
            {levelInfo.number} · {localizedLevel.label} · {copy.warmupTechnique}
          </div>
          <Display t={t} size={isDesktop ? 42 : 28}>
            {localizedTechnique ? localizedTechnique.label : copy.chooseTechnique}
          </Display>
        </div>
        {techniqueInfo && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: t.head, fontWeight: 800, fontSize: isDesktop ? 28 : 21 }}>{completedCount}/8</div>
            <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{copy.completed}</div>
          </div>
        )}
      </div>

      {!techniqueInfo ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(2, minmax(0, 1fr))' : '1fr',
        }}>
          {TECHNIQUE_PROGRAMS.map((program, index) => (
            <button key={program.id} type="button" onClick={() => onSelectTechnique(program.id)} style={{
              minHeight: isDesktop ? 190 : 106,
              padding: isDesktop ? '28px 30px' : '18px 0',
              background: 'transparent', color: t.text, border: 'none',
              borderRight: isDesktop && index % 2 === 0 ? `1px solid ${t.hairline}` : 'none',
              borderBottom: `1px solid ${t.hairline}`,
              display: 'grid', gridTemplateColumns: isDesktop ? '54px 1fr auto' : '48px 1fr auto',
              alignItems: 'center', gap: 18, textAlign: 'left', cursor: 'pointer', fontFamily: t.font,
            }}>
              <span style={{
                width: isDesktop ? 54 : 46, height: isDesktop ? 54 : 46,
                display: 'grid', placeItems: 'center', border: `1px solid ${t.hairline}`,
              }}>{iconFor(program.id, t.accent, isDesktop ? 25 : 21)}</span>
              <span>
                <span style={{ display: 'block', fontSize: isDesktop ? 23 : 17, fontWeight: 800, marginBottom: 5 }}>{copy.techniques[program.id].label}</span>
                <span style={{ display: 'block', color: t.textMuted, fontSize: isDesktop ? 14 : 12.5, lineHeight: 1.5 }}>{copy.techniques[program.id].description}</span>
                <span style={{ display: 'block', marginTop: 9, fontFamily: t.mono, fontSize: 10, color: t.accent, textTransform: 'uppercase', letterSpacing: 1 }}>{copy.progressiveExercises}</span>
              </span>
              <IcArrowRight size={18} color={t.textMuted} />
            </button>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(2, minmax(0, 1fr))' : '1fr',
          columnGap: isDesktop ? 40 : 0,
        }}>
          {exercises.map((exercise, index) => {
            const key = exerciseKey(exercise);
            const done = isCompleted(key);
            const isResumePoint = activeJourney?.technique === technique && activeJourney.lastExerciseId === exercise.id;
            return (
              <button key={key} type="button" onClick={() => openExercise(exercise)} style={{
                minHeight: 88, padding: '16px 0', background: 'transparent', color: t.text,
                border: 'none', borderBottom: `1px solid ${t.hairline}`,
                borderLeft: isResumePoint ? `3px solid ${t.accent}` : '3px solid transparent',
                display: 'grid', gridTemplateColumns: '44px 1fr auto', alignItems: 'center', gap: 16,
                textAlign: 'left', cursor: 'pointer', fontFamily: t.font,
                paddingLeft: isResumePoint ? 12 : 0,
              }}>
                <span style={{
                  width: 44, height: 44, display: 'grid', placeItems: 'center',
                  background: done ? t.goodSoft : 'transparent', border: `1px solid ${done ? t.good : t.hairline}`,
                  color: done ? t.good : t.accent,
                }}>
                  {done ? <IcCheck size={19} color={t.good} /> : <span style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 700 }}>{String(index + 1).padStart(2, '0')}</span>}
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 800, marginBottom: 5 }}>{exercise.title}</span>
                  <span style={{ display: 'block', fontFamily: t.mono, fontSize: 10.5, color: t.textMuted, letterSpacing: 0.4 }}>
                    {exercise.sub.toUpperCase()} · {exercise.bpm} BPM · {exercise.dur.toUpperCase()}
                  </span>
                  {isResumePoint && (
                    <span style={{ display: 'block', marginTop: 5, fontFamily: t.mono, fontSize: 9.5, color: t.accent, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {copy.continueHere}
                    </span>
                  )}
                </span>
                <IcArrowRight size={17} color={t.textMuted} />
              </button>
            );
          })}
        </div>
      )}

      <div style={{
        marginTop: isDesktop ? 42 : 30,
        paddingTop: isDesktop ? 28 : 22,
        paddingBottom: isDesktop ? 8 : 22,
        borderTop: `2px solid ${t.text}`,
      }}>
        <p style={{ margin: '0 0 14px', color: t.textMuted, fontSize: 13, lineHeight: 1.55, textAlign: 'center' }}>
          {copy.journeyHint}
        </p>
        <button type="button"
          disabled={journeySaving}
          onClick={handleJourneyAction}
          style={{
            width: '100%', minHeight: 54, padding: '14px 20px',
            border: 'none', background: journeySaving ? t.surface2 : t.text,
            color: journeySaving ? t.textMuted : t.bg,
            fontFamily: t.font, fontSize: 15, fontWeight: 800,
            cursor: journeySaving ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
          {!isLoggedIn && !activeJourney && <IcLock size={17} color={journeySaving ? t.textMuted : t.bg} />}
          {journeySaving
            ? copy.journeySaving
            : activeJourney
              ? copy.continueJourney
              : isLoggedIn
                ? copy.startJourney
                : copy.signInAndStartJourney}
          {!journeySaving && <IcArrowRight size={17} color={t.bg} />}
        </button>
        {journeyError && (
          <div role="alert" style={{ marginTop: 10, color: t.accent, fontSize: 12, textAlign: 'center' }}>
            {copy.journeyLoginError}
          </div>
        )}
      </div>

      {selectedExercise && techniqueInfo && (
        <ExerciseDetailPopup
          t={t}
          dark={dark}
          exercise={selectedExercise}
          category="opvarmning"
          onClose={() => setSelectedExercise(null)}
          onMarkDone={() => markCompleted(exerciseKey(selectedExercise))}
          isCompleted={isCompleted(exerciseKey(selectedExercise))}
          onOpenCoach={onOpenCoach}
        />
      )}
    </div>
  );
}

interface MobileCategoryDetailProps {
  t: ThemeTokens;
  dark: boolean;
  category: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong';
  onClose: () => void;
  onOpenCoach: () => void;
}

function MobileCategoryDetail({ t, dark, category, onClose, onOpenCoach }: MobileCategoryDetailProps) {
  const [activeChip, setActiveChip] = useState('Alle');
  const [statusFilter, setStatusFilter] = useState<'alle' | 'gennemfort' | 'mangler'>('alle');
  const [bpm, setBpm] = useState(category === 'playalong' ? 105 : 90);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const { markOpened, markCompleted, isCompleted } = useExerciseProgress();
  const { user, syncCompletedExercises } = useAuth();

  const handleMarkCompleted = async (key: string) => {
    markCompleted(key);

    // XP: +25 per gennemført øvelse
    const XP_PER_EXERCISE = 25;
    const today = new Date().toISOString().slice(0, 10);

    try {
      if (user) {
        // Streak-logik
        const lastDate = localStorage.getItem('pocketdrummer_last_practice');
        let newStreak = user.streak || 0;
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          newStreak = lastDate === yesterday ? newStreak + 1 : 1;
        }
        localStorage.setItem('pocketdrummer_last_practice', today);

        const newXp = (user.xp || 0) + XP_PER_EXERCISE;
        const newLevel = Math.floor(newXp / 200) + 1;

        // Opdater completedExercises
        const completed = [...(user.completedExercises || [])];
        if (!completed.includes(key)) completed.push(key);

        const { firestoreService } = await import('@/lib/firestoreService');
        await firestoreService.saveUserProfile(user.uid, {
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          completedExercises: completed,
        });
        await syncCompletedExercises(completed);
      } else {
        // Gæst: gem streak og XP i localStorage
        const lastDate = localStorage.getItem('pocketdrummer_last_practice');
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const prevStreak = parseInt(localStorage.getItem('pocketdrummer_streak') || '0', 10);
          const newStreak = lastDate === yesterday ? prevStreak + 1 : 1;
          localStorage.setItem('pocketdrummer_streak', String(newStreak));
          localStorage.setItem('pocketdrummer_last_practice', today);
        }
        const prevXp = parseInt(localStorage.getItem('pocketdrummer_xp') || '0', 10);
        localStorage.setItem('pocketdrummer_xp', String(prevXp + XP_PER_EXERCISE));
      }
    } catch (err) {
      console.error('Fejl ved opdatering af XP/streak:', err);
    }
  };

  // Escape key to close this overlay (only when no sub-popup is open)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !selectedExercise) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, selectedExercise]);
  const [metroPlaying, setMetroPlaying] = useState(false);
  const [subdivision, setSubdivision] = useState<'quarter' | 'eighth'>('quarter');
  const [currentBeat, setCurrentBeat] = useState(0);

  // Play-along states
  const [playalongPlaying, setPlayalongPlaying] = useState(false);
  const [playalongSpeed, setPlayalongSpeed] = useState<80 | 90 | 100 | 110>(100);
  const [mixerVols, setMixerVols] = useState({ drums: 70, music: 60 });
  const [playalongBeat, setPlayalongBeat] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Metronome Sound loop
  useEffect(() => {
    if (!metroPlaying) return;
    const intervalTime = (60 / bpm) * (subdivision === 'eighth' ? 500 : 1000);
    const intervalId = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = subdivision === 'eighth' ? (prev + 1) % 8 : (prev + 1) % 4;
        try {
          const ctx = getAudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const isDownbeat = nextBeat === 0;
          const isSub = subdivision === 'eighth' && nextBeat % 2 !== 0;
          
          osc.frequency.setValueAtTime(isDownbeat ? 1000 : isSub ? 450 : 600, ctx.currentTime);
          gain.gain.setValueAtTime(isDownbeat ? 0.2 : isSub ? 0.04 : 0.09, ctx.currentTime);
          
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.stop(ctx.currentTime + 0.06);
        } catch {}
        return nextBeat;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [metroPlaying, bpm, subdivision]);

  // Backing Track Synthesizer loop
  useEffect(() => {
    if (!playalongPlaying) return;
    
    const actualBpm = 105 * (playalongSpeed / 100);
    const intervalTime = (60 / actualBpm) * 500; // eighth notes
    
    const intervalId = setInterval(() => {
      setPlayalongBeat(prev => {
        const nextBeat = (prev + 1) % 32;
        
        let section = 'Intro';
        if (nextBeat >= 8 && nextBeat < 24) section = 'Verse';
        else if (nextBeat >= 24 && nextBeat < 28) section = 'Chorus';
        else if (nextBeat >= 28 && nextBeat < 30) section = 'Fill Cue';
        else section = 'Outro';
        
        try {
          const ctx = getAudioCtx();
          const now = ctx.currentTime;
          
          if (mixerVols.drums > 0) {
            const subBeat = nextBeat % 8;
            if (subBeat === 0 || subBeat === 4) {
              const kick = ctx.createOscillator();
              const kickGain = ctx.createGain();
              kick.connect(kickGain);
              kickGain.connect(ctx.destination);
              kick.frequency.setValueAtTime(140, now);
              kick.frequency.exponentialRampToValueAtTime(45, now + 0.08);
              kickGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.35, now);
              kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
              kick.start();
              kick.stop(now + 0.2);
            }
            
            if (subBeat === 4) {
              const snare = ctx.createOscillator();
              const snareGain = ctx.createGain();
              snare.connect(snareGain);
              snareGain.connect(ctx.destination);
              snare.type = 'triangle';
              snare.frequency.setValueAtTime(240, now);
              snareGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.22, now);
              snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
              snare.start();
              snare.stop(now + 0.1);
            }
            
            const hh = ctx.createOscillator();
            const hhGain = ctx.createGain();
            hh.connect(hhGain);
            hhGain.connect(ctx.destination);
            hh.type = 'sine';
            hh.frequency.setValueAtTime(8000, now);
            hhGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.02, now);
            hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            hh.start();
            hh.stop(now + 0.04);
          }
          
          if (mixerVols.music > 0 && nextBeat % 2 === 0) {
            const synth = ctx.createOscillator();
            const synthGain = ctx.createGain();
            synth.connect(synthGain);
            synthGain.connect(ctx.destination);
            synth.type = 'sine';
            
            let baseFreq = 130.81;
            if (section === 'Verse') baseFreq = 146.83;
            else if (section === 'Chorus') baseFreq = 164.81;
            else if (section === 'Fill Cue') baseFreq = 196.00;
            else if (section === 'Outro') baseFreq = 130.81;
            
            const harmony = ctx.createOscillator();
            harmony.connect(synthGain);
            harmony.type = 'sine';
            harmony.frequency.setValueAtTime(baseFreq * 1.5, now);
            
            synth.frequency.setValueAtTime(baseFreq, now);
            synthGain.gain.setValueAtTime((mixerVols.music / 100) * 0.06, now);
            synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            synth.start();
            harmony.start();
            synth.stop(now + 0.45);
            harmony.stop(now + 0.45);
          }
        } catch {}
        return nextBeat;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [playalongPlaying, playalongSpeed, mixerVols]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const categoryChips = {
    opvarmning: ['Alle', '5 min', '10 min', 'Hænder', 'Fødder', 'Single strokes', 'Double strokes', 'Paradiddles', 'Accenter', 'Dynamik', 'Tempo-ladder', 'Venstre hånd', 'Stortrommekontrol'],
    nodelære: ['Alle', 'Fjerdedele', 'Ottendedele', 'Sekstendedele', 'Pauser', 'Accenter', 'Ghost notes', 'Taktarter', '4/4', '3/4', '6/8', 'Shuffle-notation', 'Charts', 'Prima vista', 'Læs og spil', 'Nodequiz'],
    grooves: ['Alle', 'Basic rock', 'Pop', 'Funk', 'Jazz', 'Blues', 'Shuffle', 'Samba', 'Songo', 'Latin', 'Reggae', 'Hip-hop', 'Metal', 'Brushes', 'Ghost notes', 'Linear grooves', 'Fills', 'Overgange', 'Odd meters', 'Koordination'],
    playalong: ['Alle', 'Rock tracks', 'Pop tracks', 'Funk tracks', 'Blues tracks', 'Jazz tracks', 'Latin tracks', 'No-drums tracks', 'Guided play-alongs', 'Call and response', 'Begyndertracks', 'Mellemtracks', 'Øvede tracks', 'Formtræning', 'Vers/omkvæd', 'Fill cues']
  }[category];

  const categoryExercises = {
    opvarmning: [
      { id: 1, title: '5 minutters teknik-start', sub: 'Single strokes og håndkontrol', dur: '5 min', bpm: 80, tags: ['5 min', 'Single strokes'], level: 'Begynder', notation: 'opvarmning-2014.xml' },
      { id: 2, title: 'Hånd-hastighed & kontrol', sub: 'Dobbelt slag og paradiddle kontrol', dur: '10 min', bpm: 100, tags: ['10 min', 'Hænder', 'Double strokes', 'Paradiddles'], level: 'Mellemniveau' },
      { id: 3, title: 'Stortromme styrke & kontrol', sub: 'Fodkontrol og udholdenhed', dur: '12 min', bpm: 90, tags: ['Fødder', 'Stortrommekontrol'], level: 'Øvet' },
      { id: 4, title: 'Tempo-ladder udfordring', sub: 'Øg tempoet gradvist', dur: '15 min', bpm: '80-140', tags: ['Tempo-ladder', 'Dynamik'], level: 'Øvet' },
    ],
    nodelære: [
      { id: 1, title: 'Læs fjerdedele & pauser', sub: 'Grundlæggende nodelæsning', dur: '5 min', bpm: 80, tags: ['Fjerdedele', 'Pauser'], level: 'Begynder' },
      { id: 2, title: 'Ottendedele syncopation', sub: 'Udfordr din timing', dur: '8 min', bpm: 90, tags: ['Ottendedele', 'Accenter'], level: 'Mellemniveau' },
      { id: 3, title: 'Sekstendedele ghost notes', sub: 'Avanceret nodeforståelse', dur: '12 min', bpm: 96, tags: ['Sekstendedele', 'Ghost notes'], level: 'Øvet' },
      { id: 4, title: 'Taktartsskift (4/4 til 3/4)', sub: 'Leg med taktarter', dur: '10 min', bpm: 100, tags: ['Taktarter', '3/4'], level: 'Øvet' },
    ],
    grooves: [
      { id: 1, title: 'Basic Rock Beat', sub: 'Klassisk 8.-dels groove', dur: '6 min', bpm: 90, tags: ['Basic rock', 'Pop'], level: 'Begynder' },
      { id: 2, title: 'Funk Pocket Groove', sub: 'Syncoperet 16.-dels hi-hat groove', dur: '10 min', bpm: 95, tags: ['Funk', 'Ghost notes'], level: 'Mellemniveau' },
      { id: 3, title: 'Jazz Swing comping', sub: 'Swing-feel og ride bækken mønster', dur: '12 min', bpm: 120, tags: ['Jazz', 'Brushes'], level: 'Øvet' },
      { id: 4, title: 'Linear Funk Pattern', sub: 'Linear timing uden overlappende slag', dur: '15 min', bpm: 100, tags: ['Funk', 'Linear grooves'], level: 'Øvet' },
    ],
    playalong: [
      { id: 1, title: 'Classic Rock 4/4 Beat', sub: 'Spil med et stærkt rock backing track', dur: '3 min', bpm: 92, tags: ['Rock tracks', 'Begyndertracks'], level: 'Begynder', nodrums: true },
      { id: 2, title: 'Funk Groove Odyssey', sub: 'Super funky synth-backing track', dur: '4 min', bpm: 105, tags: ['Funk tracks', 'Mellemtracks', 'Formtræning'], level: 'Mellemniveau', nodrums: true },
      { id: 3, title: 'Modern Jazz swing along', sub: 'Swing med bas og piano', dur: '5 min', bpm: 130, tags: ['Jazz tracks', 'Øvede tracks'], level: 'Øvet', nodrums: true },
    ]
  }[category];

  const categoryTitle = {
    opvarmning: 'Pocket Opvarmning',
    nodelære: 'Pocket Nodelære',
    grooves: 'Pocket Groove',
    playalong: 'Pocket Play-along'
  }[category];

  const categoryBlurb = {
    opvarmning: 'Start med hænder, fødder, kontrol og timing.',
    nodelære: 'Forstå rytmer, taktarter og trommenotation.',
    grooves: 'Spil beats, fills, overgange og genrer.',
    playalong: 'Spil med musik, backing tracks og form.'
  }[category];

  const filteredExercises = categoryExercises.filter(ex => {
    const key = `${category}_${ex.id}`;
    const done = isCompleted(key);
    if (statusFilter === 'gennemfort' && !done) return false;
    if (statusFilter === 'mangler' && done) return false;
    if (activeChip === 'Alle') return true;
    return ex.tags.some(tag => tag.toLowerCase().includes(activeChip.toLowerCase()));
  });

  return (
    <div className="ios-screen-overlay" style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 120,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      {/* Header: back | title | X */}
      <div style={{ padding: '0 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}` }}>
        <button onClick={onClose} aria-label="Tilbage" style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcBack size={16} />
        </button>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' }}>Øvespor</div>
          <Display t={t} size={18} style={{ marginTop: 2 }}>{categoryTitle}</Display>
        </div>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, lineHeight: 1 }}>✕</button>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '16px 20px 60px' }}>

        {/* Status filter */}
        {(() => {
          const total = categoryExercises.length;
          const done = categoryExercises.filter(ex => isCompleted(`${category}_${ex.id}`)).length;
          const missing = total - done;
          const statuses: { key: 'alle' | 'gennemfort' | 'mangler'; label: string; count: number; color: string }[] = [
            { key: 'alle', label: 'Alle', count: total, color: t.accent },
            { key: 'gennemfort', label: 'Gennemført', count: done, color: t.good },
            { key: 'mangler', label: 'Mangler', count: missing, color: t.textMuted },
          ];
          return (
            <div style={{ display: 'flex', gap: 22, borderBottom: `1px solid ${t.hairline}`, marginBottom: 20, paddingBottom: 2 }}>
              {statuses.map(s => {
                const active = statusFilter === s.key;
                return (
                  <button key={s.key} onClick={() => setStatusFilter(s.key)} style={{
                    padding: '0 0 10px', border: 'none', borderBottom: `2px solid ${active ? t.text : 'transparent'}`,
                    background: 'transparent',
                    color: active ? t.text : t.textMuted,
                    fontFamily: t.font, fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'baseline', gap: 6,
                  }}>
                    <span style={{ fontFamily: t.head, fontSize: 15, fontWeight: 700 }}>{s.count}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Tag chips */}
        <div style={{ display: 'flex', gap: 18, overflowX: 'auto', paddingBottom: 12, marginBottom: 8, scrollbarWidth: 'none' }}>
          {categoryChips.map(chip => {
            const active = activeChip === chip;
            return (
              <button key={chip} onClick={() => setActiveChip(chip)} style={{
                padding: '0 0 8px', border: 'none', borderBottom: `2px solid ${active ? t.accent : 'transparent'}`,
                background: 'transparent', color: active ? t.text : t.textMuted,
                fontFamily: t.font, fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: 'pointer',
                whiteSpace: 'nowrap', borderRadius: 0,
              }}>{chip}</button>
            );
          })}
        </div>

        {/* Exercises List */}
        <div style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
          Lektioner & øvelser ({filteredExercises.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredExercises.map((ex, idx) => {
            const key = `${category}_${ex.id}`;
            const done = isCompleted(key);
            const levelColor = ex.level === 'Begynder' ? t.good : ex.level === 'Mellemniveau' ? t.warn : t.accent;
            return (
              <div key={ex.id} onClick={() => { markOpened(key); setSelectedExercise(ex as ExerciseItem); }} style={{
                background: 'transparent', border: 'none', borderBottom: `1px solid ${t.hairline}`,
                padding: '16px 0', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <span style={{ fontFamily: t.head, fontWeight: 700, fontSize: 18, color: done ? t.tickMuted : t.tickMuted, width: 24, flexShrink: 0 }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: t.font, fontSize: 15, fontWeight: 700, color: done ? t.textMuted : t.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.title}</div>
                  <div style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: 0.5, color: t.textMuted, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: levelColor, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: levelColor, display: 'inline-block' }} />
                      {ex.level.toUpperCase()}
                    </span>
                    <span>· {ex.dur.toUpperCase()}</span>
                  </div>
                </div>
                {done ? <IcCheck size={16} color={t.good} /> : <IcArrowRight size={16} color={t.textMuted} />}
              </div>
            );
          })}

          {filteredExercises.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: t.textMuted }}>
              <div style={{ fontSize: 12 }}>Ingen øvelser matcher chip &quot;{activeChip}&quot;.</div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Exercise detail popup */}
      {selectedExercise && (
        <ExerciseDetailPopup
          t={t} dark={dark}
          exercise={selectedExercise}
          category={category}
          onClose={() => setSelectedExercise(null)}
          onMarkDone={() => handleMarkCompleted(`${category}_${selectedExercise.id}`)}
          isCompleted={isCompleted(`${category}_${selectedExercise.id}`)}
          onOpenCoach={onOpenCoach}
          isAdmin={user?.role === 'admin'}
        />
      )}
    </div>
  );
}

// 4. Track Detail Overlay
function TrackDetail({ t, trackId, onClose, onOpenLesson, onOpenCoach }: TrackDetailProps) {
  const track = practiceTracks.find(x => x.id === trackId) || practiceTracks[0];

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  const lessonList = [
    { n: 1, title: 'Indre puls — fod og hånd', dur: '6 min', done: true },
    { n: 2, title: 'Click på 2 & 4', dur: '8 min', done: true },
    { n: 3, title: 'Subdivisioner i 4/4', dur: '10 min', done: true },
    { n: 4, title: '16-dele hi-hat', dur: '12 min', done: false, active: true },
    { n: 5, title: 'Tempo-flytning', dur: '14 min', done: false },
    { n: 6, title: 'Polyrytme 3:2', dur: '15 min', done: false, locked: true },
    { n: 7, title: 'Polyrytme 4:3', dur: '16 min', done: false, locked: true },
  ];

  return (
    <div className="ios-screen-overlay" style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 100,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '0 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} aria-label="Tilbage" style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcBack size={16} /></button>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted }}>Forløb</div>
        <button style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 40px' }}>
        <div style={{ display: 'flex', margin: '4px 0 10px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 180, height: 130 }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 65%)`,
              borderRadius: '50%',
            }} />
            <div style={{ position: 'relative' }}>
              <IllSticks size={120} color={t.accent} sw={1.7}/>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Display t={t} size={34} style={{ marginBottom: 6 }}>{track.title}</Display>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent }}>{track.subtitle}</div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.85, lineHeight: 1.45 }}>
          {track.blurb}
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: <IcClock size={18} />, title: `${track.lessonCount} lektioner`, sub: track.level },
            { icon: <IcWave size={18} />, title: 'Interaktive øvelser', sub: 'Spil med og få feedback' },
            { icon: <IcTrophy size={18} />, title: 'Fremgangssporing', sub: 'Se din udvikling over tid' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                border: `1px solid ${t.borderStrong}`, color: t.accent,
                display: 'flex', alignItems: 'center', }}>{f.icon}</div>
              <div>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.1 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <SectionLabel t={t}>Lektioner</SectionLabel>
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 18, overflow: 'hidden',
          }}>
            {lessonList.map((l, i) => (
              <div key={i} className={`stagger-item d-${Math.min(i * 80, 480)}`} onClick={() => !l.locked && onOpenLesson(`${track.id}-${l.n}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderBottom: i < lessonList.length - 1 ? `1px solid ${t.border}` : 'none',
                opacity: l.locked ? 0.45 : 1,
                cursor: l.locked ? 'default' : 'pointer',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: l.done ? t.accent : l.active ? t.accentSoft : 'transparent',
                  border: l.done || l.active ? 'none' : `1px solid ${t.borderStrong}`,
                  color: l.done ? '#fff' : l.active ? t.accent : t.textMuted,
                  display: 'flex', alignItems: 'center', fontFamily: t.mono, fontSize: 11, fontWeight: 700,
                }}>
                  {l.done ? <IcCheck size={13} /> : l.locked ? <IcLock size={11} /> : l.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2, fontFamily: t.mono, letterSpacing: 0.5 }}>{l.dur.toUpperCase()}</div>
                </div>
                {l.active && <Pill t={t} tone="accent">I GANG</Pill>}
                {!l.locked && <IcChev size={14} color={t.textDim} />}
              </div>
            ))}
          </div>
        </div>

        <div onClick={onOpenCoach} style={{
          marginTop: 18, padding: 14, borderRadius: 16,
          border: `1px solid ${t.border}`, background: t.surface,
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcSpark size={16} color="#fff" />
          </div>
          <div style={{ flex: 1, fontSize: 13 }}>
            <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 15 }}>Spørg AI Coach</span>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>Få hjælp med dette forløb</div>
          </div>
          <IcChev size={14} color={t.textDim} />
        </div>
      </div>

      <div style={{
        padding: '12px 20px 30px', borderTop: `1px solid ${t.border}`,
        background: t.bg,
      }}>
        <CTA t={t} onClick={() => onOpenLesson(`${track.id}-4`)} className="active-pulse" icon={<IcPlay size={13} fill color={t.bg}/>}>
          {track.progress > 0 ? 'Fortsæt forløb' : 'Start forløb'}
        </CTA>
      </div>
    </div>
  );
}

// 5. Lesson Detail Overlay
function LessonDetail({ t, dark, onClose, onOpenCoach }: LessonDetailProps) {
  const [tab, setTab] = useState('noder');
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(92);
  const [beat, setBeat] = useState(0);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1");

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    if (!playing) return;
    const interval = (60 / bpm) * 500;
    const id = setInterval(() => setBeat(b => (b + 1) % 8), interval);
    return () => clearInterval(id);
  }, [playing, bpm]);

  const timeToSeconds = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const handleChapterClick = (timeStr: string) => {
    const seconds = timeToSeconds(timeStr);
    setVideoUrl(`https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&autoplay=1&start=${seconds}`);
  };

  const exercises = [
    { title: 'Spil takten i 60 BPM', detail: '8 takter uden stop', done: true },
    { title: 'Øg til 80 BPM', detail: '8 takter uden stop', done: true },
    { title: 'Spil i 92 BPM', detail: 'Måltempo · 16 takter', done: false },
    { title: 'Spil med metronom på 2 & 4', detail: '32 takter uden fejl', done: false },
    { title: 'Optag og evaluér', detail: '1 fuld take', done: false },
  ];

  return (
    <div className="ios-screen-overlay" style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 110,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          width: 40, height: 40, borderRadius: 12, background: t.surface,
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 12px rgba(43,39,35,.06)',
        }} aria-label="Tilbage"><IcBack size={16} /></button>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1.8, textTransform: 'uppercase' }}>Lektion 04</div>
          <Display t={t} size={16} style={{ marginTop: 2 }}>16-dele hi-hat</Display>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 12, background: t.surface,
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 12px rgba(43,39,35,.06)',
        }}><IcMore size={18} /></button>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', background: t.surface, borderRadius: 16, padding: 4, border: `1px solid ${t.border}`, boxShadow: '0 3px 12px rgba(43,39,35,.04)' }}>
          {[
            { id: 'noder', label: 'Noder' },
            { id: 'video', label: 'Video' },
            { id: 'ovelser', label: 'Øvelser' },
          ].map(tt => (
            <button key={tt.id} onClick={() => setTab(tt.id)} style={{
              flex: 1, padding: '9px 12px', borderRadius: 12, border: 'none',
              background: tab === tt.id ? t.accent : 'transparent',
              color: tab === tt.id ? '#fff' : t.textMuted,
              fontWeight: tab === tt.id ? 700 : 500, fontSize: 12,
              letterSpacing: tab === tt.id ? 1.5 : 0.3, textTransform: tab === tt.id ? 'uppercase' : 'none',
              fontFamily: t.font, cursor: 'pointer',
            }}>{tt.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 118px' }}>
        {tab === 'noder' && (
          <div>
            <div style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: '18px 16px',
              boxShadow: '0 4px 16px rgba(43,39,35,.05)',
            }}>
              <div style={{ display: 'flex', padding: '0 0 14px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, color: t.text, fontWeight: 800 }}>Takt 3</div>
                <Pill t={t} tone="accent">4/4 · {bpm} BPM</Pill>
              </div>
              <div style={{ background: dark ? '#FBFAF6' : '#FFFFFF', borderRadius: 16, overflowX: 'auto' }}>
                <DrumNotation width={330} color="#16161a" accent={t.accent} active={playing ? beat : 99} />
                <DrumNotation width={330} color="#16161a" accent={t.accent} active={99} />
              </div>
            </div>

            <div style={{
              marginTop: 14, background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 16, padding: '12px 14px',
              boxShadow: '0 4px 16px rgba(43,39,35,.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 13, background: t.goodSoft,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><IcMetro size={18} color={t.good} /></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: t.text }}>Tempo</div>
                    <div style={{ fontSize: 11, color: t.textMuted }}>{playing ? 'Metronom spiller' : 'Metronom klar'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setBpm(Math.max(40, bpm - 4))} style={{
                    width: 32, height: 32, borderRadius: 10, background: t.surface2,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><IcMin size={14} /></button>
                  <span style={{ fontFamily: t.head, fontWeight: 800, fontSize: 18, minWidth: 64, textAlign: 'center' }}>{bpm} BPM</span>
                  <button onClick={() => setBpm(Math.min(220, bpm + 4))} style={{
                    width: 32, height: 32, borderRadius: 10, background: t.surface2,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><IcPlus size={14} /></button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22, fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.text, opacity: 0.8, lineHeight: 1.5, textAlign: 'center', padding: '0 12px' }}>
              &quot;Hold venstre hånd afslappet. Tæl højt 1-e-og-a mens du spiller — det hjælper med at sætte 16-delene præcist.&quot;
            </div>
          </div>
        )}

        {tab === 'video' && (
          <div>
            <div style={{
              aspectRatio: '16/10', borderRadius: 22, position: 'relative',
              background: '#000',
              border: `1px solid ${t.border}`, overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(43,39,35,.05)',
            }}>
              <iframe
                width="100%"
                height="100%"
                src={videoUrl}
                title="Trommelektion - 16-dele Hi-Hat"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: '0' }}
              />
            </div>
            <div style={{ marginTop: 16, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 16, boxShadow: '0 4px 16px rgba(43,39,35,.05)' }}>
              <Display t={t} size={20}>16-dele hi-hat</Display>
              <Display t={t} size={20} style={{ opacity: 0.5 }}>— forklaret enkelt</Display>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8, letterSpacing: 0.5 }}>Mikkel Holm · Drum School DK · 124k visninger</div>
            </div>

            <div style={{ marginTop: 24 }}>
              <SectionLabel t={t}>Kapitler (Klik for at afspille stempel)</SectionLabel>
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { time: '0:00', title: 'Introduktion' },
                  { time: '1:42', title: 'Højre hånd alene' },
                  { time: '4:18', title: 'Tilføj kick og snare' },
                  { time: '7:55', title: 'Spil med click' },
                  { time: '10:30', title: 'Almindelige fejl' },
                ].map((c, i, arr) => (
                  <div key={i} onClick={() => handleChapterClick(c.time)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none', cursor: 'pointer',
                  }}>
                    <div style={{ fontFamily: t.mono, fontSize: 12, fontWeight: 600, color: t.accent, width: 44 }}>{c.time}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.title}</div>
                    <IcPlay size={11} color={t.textDim} fill />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {tab === 'ovelser' && (
          <div>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.8, lineHeight: 1.5, marginBottom: 18, textAlign: 'center', padding: '0 16px' }}>
              Fem trin der bygger dig op til at spille grooven flydende i måltempo.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exercises.map((ex, i) => {
                const isNext = !ex.done && exercises.findIndex(e => !e.done) === i;
                return (
                  <div key={i} className={`stagger-item d-${Math.min(i * 80, 480)}`} style={{
                    background: t.surface, border: `1px solid ${isNext ? t.accent : t.border}`,
                    borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: ex.done ? 'none' : `1.5px solid ${t.borderStrong}`,
                      background: ex.done ? t.accent : 'transparent',
                      display: 'flex', alignItems: 'center', color: ex.done ? '#fff' : t.textMuted, fontFamily: t.mono, fontWeight: 700,
                      fontSize: 12, flexShrink: 0,
                    }}>
                      {ex.done ? <IcCheck size={14} /> : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.title}</div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{ex.detail}</div>
                    </div>
                    <IcChev size={14} color={t.textDim} />
                  </div>
                );
              })}
            </div>

            <div onClick={onOpenCoach} style={{
              marginTop: 22, background: t.accentSoft, border: `1px solid ${t.accent}`,
              borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: t.accent,
                display: 'flex', alignItems: 'center', }}><IcSpark size={18} color="#fff" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.accentText }}>Spørg AI Coach</div>
                <div style={{ fontSize: 11, color: t.accentText, opacity: 0.85, marginTop: 1 }}>Få hjælp til denne lektion</div>
              </div>
              <IcChev size={14} color={t.accentText} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 6. Studio Kit Screen
// Konstanter uden for komponenten — stabile referencer, forhindrer useEffect-restart
const METRO_TIME_SIGS = [
  { label: '2/4', beats: 2, note: 4 },
  { label: '3/4', beats: 3, note: 4 },
  { label: '4/4', beats: 4, note: 4 },
  { label: '5/4', beats: 5, note: 4 },
  { label: '6/4', beats: 6, note: 4 },
  { label: '6/8', beats: 6, note: 8 },
  { label: '7/8', beats: 7, note: 8 },
  { label: '9/8', beats: 9, note: 8 },
] as const;

const METRO_SUBDIVISIONS = [
  { label: 'Kvart',      mult: 1 },
  { label: 'Ottendedel', mult: 2 },
  { label: '16.-del',    mult: 4 },
  { label: 'Triol',      mult: 3 },
] as const;

function StudioKitScreen({ t }: StudioKitScreenProps) {
  const [bpm, setBpm] = React.useState(90);
  const [bpmInput, setBpmInput] = React.useState('90');
  const [playing, setPlaying] = React.useState(false);
  const [pulseBeat, setPulseBeat] = React.useState(-1);
  const [subBeat, setSubBeat] = React.useState(-1);
  const [tapTimes, setTapTimes] = React.useState<number[]>([]);
  const [timeSigIdx, setTimeSigIdx] = React.useState(2);
  const [subIdx, setSubIdx] = React.useState(0);
  const [mode, setMode] = React.useState<'normal' | 'gap' | 'backbeat' | 'ramp'>('normal');
  const [gapOn, setGapOn] = React.useState(1);
  const [gapOff, setGapOff] = React.useState(1);
  const [rampStart, setRampStart] = React.useState(80);
  const [rampEnd, setRampEnd] = React.useState(120);
  const [rampBars, setRampBars] = React.useState(8);
  const [swing, setSwing] = React.useState(50);
  const [sound, setSound] = React.useState<'click' | 'woodblock' | 'hihat'>('click');

  const timeSig = METRO_TIME_SIGS[timeSigIdx];
  const sub = METRO_SUBDIVISIONS[subIdx];

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const rampBpmRef = React.useRef(bpm);
  const barCountRef = React.useRef(0);
  const gapBarRef = React.useRef(0);
  const gapModeRef = React.useRef<'on'|'off'>('on');

  // Spacebar → toggle play
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        setPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const getCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playSound = React.useCallback((isAccent: boolean, soundType: string, isSub = false) => {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      const vol = isSub ? 0.07 : (isAccent ? 0.38 : 0.18);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isSub ? 0.04 : 0.08));

      if (soundType === 'hihat') {
        const bufSize = ctx.sampleRate * (isSub ? 0.025 : 0.05);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = isSub ? 'lowpass' : 'highpass';
        filter.frequency.value = isSub ? 2500 : (isAccent ? 8000 : 10000);
        src.connect(filter); filter.connect(gain);
        src.start(); src.stop(ctx.currentTime + (isSub ? 0.025 : 0.05));
      } else {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        const baseFreq = soundType === 'woodblock' ? (isAccent ? 900 : 700) : (isAccent ? 1200 : 800);
        osc.frequency.setValueAtTime(isSub ? baseFreq * 0.42 : baseFreq, ctx.currentTime);
        osc.start(); osc.stop(ctx.currentTime + (isSub ? 0.03 : 0.06));
      }
    } catch {}
  }, []);

  // Metronome engine — bruger primitive dependencies for at undgå useEffect-genstart
  const totalBeats = timeSig.beats;
  const subMult = sub.mult;

  React.useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!playing) {
      setTimeout(() => { setPulseBeat(-1); setSubBeat(-1); }, 0);
      barCountRef.current = 0; gapBarRef.current = 0; gapModeRef.current = 'on';
      return;
    }

    const totalTicks = totalBeats * subMult;
    let tick = 0;
    rampBpmRef.current = mode === 'ramp' ? rampStart : bpm;

    const schedule = () => {
      const isPulse = tick % subMult === 0;
      const pulseIdx = Math.floor(tick / subMult);
      const isAccent = tick === 0;
      const muted = mode === 'gap' && gapModeRef.current === 'off';
      const backbeatOnly = mode === 'backbeat' && isPulse && !(pulseIdx === 1 || pulseIdx === 3);

      if (!muted && !backbeatOnly) {
        if (isPulse) playSound(isAccent, sound, false);
        else playSound(false, sound, true);
      }

      setPulseBeat(pulseIdx);
      setSubBeat(tick);
      tick = (tick + 1) % totalTicks;

      if (tick === 0) {
        barCountRef.current++;
        if (mode === 'gap') {
          gapBarRef.current++;
          if (gapBarRef.current >= (gapModeRef.current === 'on' ? gapOn : gapOff)) {
            gapModeRef.current = gapModeRef.current === 'on' ? 'off' : 'on';
            gapBarRef.current = 0;
          }
        }
        if (mode === 'ramp' && rampBpmRef.current < rampEnd) {
          rampBpmRef.current = Math.min(rampEnd, rampBpmRef.current + (rampEnd - rampStart) / rampBars);
          clearInterval(intervalRef.current!);
          intervalRef.current = setInterval(schedule, (60000 / rampBpmRef.current) / subMult);
        }
      }
    };

    schedule();
    intervalRef.current = setInterval(schedule, (60000 / (mode === 'ramp' ? rampStart : bpm)) / subMult);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, bpm, totalBeats, subMult, mode, gapOn, gapOff, rampStart, rampEnd, rampBars, sound, playSound]);

  React.useEffect(() => () => { audioCtxRef.current?.close(); }, []);

  const handleBpmChange = (val: number) => {
    const clamped = Math.max(20, Math.min(400, Math.round(val * 2) / 2));
    setBpm(clamped); setBpmInput(String(clamped));
  };

  const handleTap = () => {
    const now = Date.now();
    const recent = [...tapTimes, now].filter(t => now - t < 4000).slice(-6);
    setTapTimes(recent);
    if (recent.length >= 2) {
      const intervals = recent.slice(1).map((t, i) => t - recent[i]);
      handleBpmChange(60000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length));
    }
  };

  const totalTicks = totalBeats * subMult;

  return (
    <div style={{ color: t.text, fontFamily: t.font, padding: '0 0 60px', userSelect: 'none' }}>

      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted }}>
          Rytmeboks <span style={{ marginLeft: 8, fontWeight: 400, opacity: 0.45 }}>· mellemrumstast = start/stop</span>
        </div>
      </div>

      {/* Taktart */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted, marginBottom: 8 }}>Taktart</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {METRO_TIME_SIGS.map((ts, i) => (
            <button key={ts.label} onClick={() => { setTimeSigIdx(i); setPlaying(false); }} style={{
              padding: '5px 11px', borderRadius: 7,
              border: `1px solid ${timeSigIdx === i ? t.accent : t.border}`,
              background: timeSigIdx === i ? t.accentSoft : 'transparent',
              color: timeSigIdx === i ? t.accent : t.textMuted,
              fontFamily: t.mono, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>{ts.label}</button>
          ))}
        </div>
      </div>

      {/* Beat visualizer */}
      <div style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        {Array.from({ length: totalBeats }).map((_, i) => {
          const active = playing && pulseBeat === i;
          const isFirst = i === 0;
          return (
            <div key={i} style={{
              width: isFirst ? 20 : 14, height: isFirst ? 20 : 14,
              borderRadius: '50%',
              background: active ? (isFirst ? t.accent : t.good) : t.surface2,
              border: `2px solid ${active ? 'transparent' : t.border}`,
              boxShadow: active ? `0 0 12px ${isFirst ? t.accentGlow : 'rgba(93,211,158,0.5)'}` : 'none',
              transition: 'background 0.04s, transform 0.04s, box-shadow 0.04s',
              transform: active ? 'scale(1.4)' : 'scale(1)',
            }} />
          );
        })}
      </div>

      {/* Sub-beat dots */}
      {subMult > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
          {Array.from({ length: totalTicks }).map((_, i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: playing && subBeat === i ? t.accent : t.border,
              opacity: i % subMult === 0 ? 1 : 0.35,
              transition: 'background 0.03s',
            }} />
          ))}
        </div>
      )}

      {/* BPM */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px 8px' }}>
        <input
          type="number" value={bpmInput} min={20} max={400} step={0.5}
          onChange={e => setBpmInput(e.target.value)}
          onBlur={() => handleBpmChange(parseFloat(bpmInput) || bpm)}
          onKeyDown={e => e.key === 'Enter' && handleBpmChange(parseFloat(bpmInput) || bpm)}
          style={{
            fontFamily: t.mono, fontSize: 80, fontWeight: 700,
            color: t.text, background: 'transparent', border: 'none',
            outline: 'none', textAlign: 'center', width: 200, lineHeight: 1, letterSpacing: -2,
          }}
        />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: t.textMuted }}>BPM</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          {[-5, -1].map(d => (
            <button key={d} onClick={() => handleBpmChange(bpm + d)} style={{
              padding: '6px 12px', borderRadius: 8, border: `1px solid ${t.border}`,
              background: t.surface2, color: t.textMuted, fontFamily: t.mono, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>{d}</button>
          ))}
          <div style={{ display: 'flex', gap: 6 }}>
            {[60, 80, 100, 120].map(p => (
              <button key={p} onClick={() => handleBpmChange(p)} style={{
                padding: '5px 9px', borderRadius: 6,
                border: `1px solid ${bpm === p ? t.accent : t.border}`,
                background: bpm === p ? t.accentSoft : 'transparent',
                color: bpm === p ? t.accent : t.textMuted,
                fontFamily: t.mono, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
          {[1, 5].map(d => (
            <button key={d} onClick={() => handleBpmChange(bpm + d)} style={{
              padding: '6px 12px', borderRadius: 8, border: `1px solid ${t.border}`,
              background: t.surface2, color: t.textMuted, fontFamily: t.mono, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>+{d}</button>
          ))}
        </div>
      </div>

      {/* Start / Tap */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '12px 20px' }}>
        <button onClick={handleTap} style={{
          padding: '12px 24px', borderRadius: 999, border: `1px solid ${t.border}`,
          background: 'transparent', color: t.textMuted, fontFamily: t.font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Tap tempo</button>
        <button onClick={() => setPlaying(p => !p)} style={{
          padding: '12px 32px', borderRadius: 999,
          background: playing ? t.surface2 : t.accent,
          border: `1px solid ${playing ? t.border : 'transparent'}`,
          color: playing ? t.text : '#fff', fontSize: 20, cursor: 'pointer', fontWeight: 700,
          boxShadow: playing ? 'none' : `0 6px 20px ${t.accentGlow}`,
          transition: 'all 0.18s',
        }}>{playing ? '⏸' : '▶'}</button>
      </div>

      {/* Underdeling */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted, marginBottom: 8 }}>Underdeling</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {METRO_SUBDIVISIONS.map((s, i) => (
            <button key={s.label} onClick={() => { setSubIdx(i); setPlaying(false); }} style={{
              padding: '5px 12px', borderRadius: 7, flex: 1,
              border: `1px solid ${subIdx === i ? t.accent : t.border}`,
              background: subIdx === i ? t.accentSoft : 'transparent',
              color: subIdx === i ? t.accent : t.textMuted,
              fontFamily: t.font, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Kliklyd */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted, marginBottom: 8 }}>Kliklyd</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['click', 'woodblock', 'hihat'] as const).map(s => (
            <button key={s} onClick={() => setSound(s)} style={{
              padding: '5px 14px', borderRadius: 7, flex: 1,
              border: `1px solid ${sound === s ? t.accent : t.border}`,
              background: sound === s ? t.accentSoft : 'transparent',
              color: sound === s ? t.accent : t.textMuted,
              fontFamily: t.font, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>{s === 'click' ? 'Klik' : s === 'woodblock' ? 'Træblok' : 'Hi-hat'}</button>
          ))}
        </div>
      </div>

      {/* Træningstilstand */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted, marginBottom: 8 }}>Træningstilstand</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['normal', 'gap', 'backbeat', 'ramp'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setPlaying(false); }} style={{
              padding: '5px 10px', borderRadius: 7, flex: 1,
              border: `1px solid ${mode === m ? t.accent : t.border}`,
              background: mode === m ? t.accentSoft : 'transparent',
              color: mode === m ? t.accent : t.textMuted,
              fontFamily: t.font, fontSize: 10, fontWeight: 600, cursor: 'pointer',
            }}>{m === 'normal' ? 'Normal' : m === 'gap' ? 'Gap' : m === 'backbeat' ? 'Backbeat' : 'Ramp'}</button>
          ))}
        </div>
        {mode === 'gap' && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', background: t.surface2, borderRadius: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: t.textMuted }}>Klik på</span>
            <input type="number" min={1} max={8} value={gapOn} onChange={e => setGapOn(Number(e.target.value))}
              style={{ width: 44, textAlign: 'center', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, padding: '4px', fontFamily: t.mono, fontSize: 14 }} />
            <span style={{ fontSize: 12, color: t.textMuted }}>takt, pause i</span>
            <input type="number" min={1} max={8} value={gapOff} onChange={e => setGapOff(Number(e.target.value))}
              style={{ width: 44, textAlign: 'center', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, padding: '4px', fontFamily: t.mono, fontSize: 14 }} />
            <span style={{ fontSize: 12, color: t.textMuted }}>takt</span>
          </div>
        )}
        {mode === 'backbeat' && (
          <div style={{ padding: '8px 12px', background: t.surface2, borderRadius: 10, fontSize: 12, color: t.textMuted }}>
            Klik kun på slag 2 og 4 — træner intern puls
          </div>
        )}
        {mode === 'ramp' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '10px 12px', background: t.surface2, borderRadius: 10 }}>
            <span style={{ fontSize: 12, color: t.textMuted }}>Fra</span>
            <input type="number" min={20} max={400} value={rampStart} onChange={e => setRampStart(Number(e.target.value))}
              style={{ width: 52, textAlign: 'center', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, padding: '4px', fontFamily: t.mono, fontSize: 13 }} />
            <span style={{ fontSize: 12, color: t.textMuted }}>til</span>
            <input type="number" min={20} max={400} value={rampEnd} onChange={e => setRampEnd(Number(e.target.value))}
              style={{ width: 52, textAlign: 'center', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, padding: '4px', fontFamily: t.mono, fontSize: 13 }} />
            <span style={{ fontSize: 12, color: t.textMuted }}>BPM over</span>
            <input type="number" min={1} max={64} value={rampBars} onChange={e => setRampBars(Number(e.target.value))}
              style={{ width: 44, textAlign: 'center', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, padding: '4px', fontFamily: t.mono, fontSize: 13 }} />
            <span style={{ fontSize: 12, color: t.textMuted }}>takter</span>
          </div>
        )}
      </div>

      {/* Swing */}
      {subIdx >= 1 && subIdx <= 2 && (
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted }}>Swing</div>
            <span style={{ fontFamily: t.mono, fontSize: 12, color: swing > 50 ? t.accent : t.textMuted }}>{swing}%</span>
          </div>
          <input type="range" min={50} max={70} step={1} value={swing} onChange={e => setSwing(Number(e.target.value))}
            style={{ width: '100%', accentColor: t.accent }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textDim, marginTop: 4 }}>
            <span>Lige</span><span>Shuffle</span><span>Tung</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 8. Coach Screen Overlay
interface CoachMessage {
  role: string;
  text: string;
  typing?: boolean;
}

function CoachScreen({ t, onClose, selectedLevel, selectedTechnique, journey, currentExerciseTitle }: CoachScreenProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const copy = PROTOTYPE_COPY[language];
  const firstName = (user?.displayName || user?.email?.split('@')[0] || copy.guest).split(' ')[0];
  const introMessage = copy.coachIntro.replace('{name}', firstName);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([
    { role: 'ai', text: introMessage },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousLanguage = useRef(language);

  useEffect(() => {
    if (previousLanguage.current !== language) {
      previousLanguage.current = language;
      setMessages([{ role: 'ai', text: introMessage }]);
      setInput('');
    }
  }, [introMessage, language]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    const next: CoachMessage[] = [...messages, { role: 'user', text: msg }];
    setMessages(next);
    setLoading(true);
    setMessages(m => [...m, { role: 'ai', text: '...', typing: true }]);

    try {
      const history = next
        .filter(m => !m.typing)
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          language,
          userContext: {
            level: selectedLevel || journey?.level || null,
            technique: selectedTechnique || journey?.technique || null,
            currentExercise: currentExerciseTitle || null,
            journey: journey || null,
          }
        }),
      });
      const data = await res.json();
      const reply = data.message || copy.coachFallback;
      setMessages([...next, { role: 'ai', text: reply }]);
    } catch {
      setMessages([...next, { role: 'ai', text: copy.coachOffline }]);
    } finally {
      setLoading(false);
    }
  };

  const suggested = copy.coachSuggestions;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 130,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '4px 16px 14px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} aria-label={copy.back} style={{
            width: 38, height: 38, borderRadius: '50%', background: 'transparent',
            border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', }}><IcBack size={16} /></button>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: t.accent, color: '#fff',
            display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(239,90,58,0.35)',
          }}><IcSpark size={20} color="#fff" /></div>
          <div style={{ flex: 1 }}>
            <Display t={t} size={20} style={{ lineHeight: 1 }}>AI Coach</Display>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.good }} />
              <span style={{ fontSize: 11, color: t.textMuted }}>{copy.coachStatus}</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '18px 16px 8px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', marginBottom: 12,
          }}>
            <div style={{
              maxWidth: '82%',
              padding: '11px 14px', borderRadius: 18,
              borderBottomRightRadius: m.role === 'user' ? 6 : 18,
              borderBottomLeftRadius: m.role === 'ai' ? 6 : 18,
              background: m.role === 'user' ? t.accent : t.surface,
              color: m.role === 'user' ? '#fff' : t.text,
              border: m.role === 'ai' ? `1px solid ${t.border}` : 'none',
              fontSize: 14, lineHeight: 1.5,
              whiteSpace: m.role === 'user' ? 'pre-wrap' : 'normal',
              fontWeight: m.role === 'user' ? 500 : 400,
            }}>
              {m.role === 'ai' ? (
                <ReactMarkdown components={{
                  p: ({ children }) => <p style={{ margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ margin: '0 0 8px', paddingLeft: 18 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '0 0 8px', paddingLeft: 18 }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: t.accent }}>{children}</a>,
                }}>{m.text}</ReactMarkdown>
              ) : m.text}
              {m.typing && <span style={{ marginLeft: 4, opacity: 0.5 }}>•••</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '8px 16px 4px', display: 'flex', gap: 8, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {suggested.map((s, i) => (
          <button key={i} onClick={() => setInput(s)} style={{
            flexShrink: 0, padding: '8px 13px', borderRadius: 999,
            background: 'transparent', border: `1px solid ${t.border}`,
            color: t.textMuted, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            fontFamily: t.font, whiteSpace: 'nowrap',
          }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: '10px 16px 22px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 999, padding: '6px 6px 6px 16px',
        }}>
          <button style={{
            width: 32, height: 32, borderRadius: '50%', background: 'transparent',
            border: 'none', color: t.textMuted, cursor: 'pointer',
            display: 'flex', alignItems: 'center', }}><IcAttach size={18} /></button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={copy.askQuestion}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: t.font, fontSize: 14, color: t.text, padding: '8px 0',
            }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: (input.trim() && !loading) ? t.accent : t.surface2,
            border: 'none', color: (input.trim() && !loading) ? '#fff' : t.textDim,
            cursor: (input.trim() && !loading) ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}>{loading ? <span style={{ fontSize: 10, opacity: 0.6 }}>•••</span> : <IcSend size={16} />}</button>
        </div>
      </div>
    </div>
  );
}

// 9. Profile Screen
function ProfileScreen({ t, dark, setDark, guestXp }: ProfileScreenProps) {
  const { user, login, logout } = useAuth();
  const { language, setLanguage, t: translate } = useLanguage();
  const copy = PROTOTYPE_COPY[language];
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoginLoading(true);
    try {
      await login();
    } catch {
      setErrorMsg(copy.loginError);
    } finally {
      setLoginLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const xp = user?.xp !== undefined ? user.xp : guestXp;
  const level = user ? (user.level || 1) : Math.floor(xp / 200) + 1;
  const streak = user?.streak !== undefined ? user.streak : 7;
  const xpPct = ((xp % 200) / 200) * 100;
  const isPremium = user ? (user.isPremium || false) : false;

  return (
    <div style={{ color: t.text, fontFamily: t.font, padding: '4px 0 40px' }}>
      <div style={{ padding: '4px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted }}>
          {translate('profile') || 'Profil'}
        </div>
      </div>

      {!user ? (
        /* Login view */
        <div style={{ padding: '30px 20px 10px' }}>
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 20, padding: 24, textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
            <Display t={t} size={22} style={{ marginBottom: 8 }}>
              {language === 'da' ? 'Gem dine fremskridt' : language === 'en' ? 'Save Your Progress' : language === 'de' ? 'Speichere deinen Fortschritt' : 'Guarda tu progreso'}
            </Display>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 20, lineHeight: 1.5 }}>
              {copy.saveProgressDescription}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleGoogleLogin}
                disabled={loginLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: t.surface2,
                  border: `1px solid ${t.borderStrong}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  color: t.text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loginLoading ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                  fontFamily: t.font,
                  outline: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 18 18" style={{ marginRight: 4 }}>
                  <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.56 2.69-3.86 2.69-6.57z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.33-1.58-5.04-3.71H.94v2.3C2.42 16.03 5.48 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.96 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.94A8.99 8.99 0 000 9c0 1.45.35 2.82.94 4.04l3.02-2.3z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.41 0 9 0 5.48 0 2.42 1.97.94 4.96l3.02 2.3c.71-2.13 2.69-3.71 5.04-3.71z"/>
                </svg>
                {loginLoading ? copy.signingIn : translate('loginGoogle')}
              </button>
              {errorMsg && (
                <div style={{ color: t.accent, fontSize: 11, fontWeight: 500, marginTop: 4 }}>{errorMsg}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Logged in view */
        <>
          <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  style={{ 
                    width: 96, height: 96, borderRadius: '50%', 
                    objectFit: 'cover', border: `3px solid ${t.accent}`,
                    boxShadow: '0 10px 28px rgba(239,90,58,0.25)',
                  }} 
                />
              ) : (
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: t.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.serif, fontStyle: 'italic', fontSize: 36, color: '#fff',
                  boxShadow: '0 10px 28px rgba(239,90,58,0.4)',
                }}>{getInitials(user.displayName)}</div>
              )}
            </div>
            <Display t={t} size={28} style={{ marginTop: 16 }}>{user.displayName}</Display>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent, marginTop: 6 }}>
              {user.role === 'admin' ? (translate('adminPanel') || 'Administrator') : `${translate('level')} ${level} · ${isPremium ? 'PRO' : (translate('freePlan') || 'Gratis')}`}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>{user.email}</div>

            {user.role === 'admin' && (
              <div style={{ marginTop: 12 }}>
                <a href="/admin" style={{ 
                  color: t.accent, textDecoration: 'none', fontSize: 12, 
                  fontWeight: 600, borderBottom: `1px solid ${t.accent}` 
                }}>
                  {translate('adminPanel')} →
                </a>
              </div>
            )}

            <div style={{ marginTop: 18, padding: '0 12px' }}>
              <div style={{ display: 'flex', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5, justifyContent: 'space-between' }}>
                <span>{translate('level').toUpperCase()} {level}</span>
                <span>{xp % 200} / 200 point</span>
                <span>{translate('level').toUpperCase()} {level + 1}</span>
              </div>
              <Progress pct={xpPct} t={t} h={6} />
            </div>
          </div>

          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: <IcFlame size={16} color={t.accent} />, value: String(streak), label: language === 'da' ? 'Dage streak' : language === 'en' ? 'Day Streak' : language === 'de' ? 'Tage am Stück' : 'Racha de días' },
                { icon: <IcClock size={16} color={t.text} />, value: '18t', label: language === 'da' ? 'Total øvetid' : language === 'en' ? 'Total Practice' : language === 'de' ? 'Gesamtübungszeit' : 'Práctica total' },
                { icon: <IcCalendar size={16} color={t.text} />, value: '3/10', label: language === 'da' ? 'Moduler i gang' : language === 'en' ? 'Active Modules' : language === 'de' ? 'Aktive Module' : 'Módulos activos' },
                { icon: <IcTrophy size={16} color={t.text} />, value: `${user.completedExercises?.length || 0}`, label: language === 'da' ? 'Lektioner ✓' : language === 'en' ? 'Lessons Completed' : language === 'de' ? 'Lektionen ✓' : 'Lecciones ✓' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: 16, padding: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.icon}
                    <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                  <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 26, marginTop: 6, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Settings section */}
      <div style={{ padding: '26px 20px 0' }}>
        <SectionLabel t={t}>
          {language === 'da' ? 'Indstillinger' : language === 'en' ? 'Settings' : language === 'de' ? 'Einstellungen' : 'Configuraciones'}
        </SectionLabel>
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 18, overflow: 'hidden',
        }}>
          {/* Dark Mode Switcher Row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', border: `1px solid ${t.borderStrong}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text,
            }}>{dark ? <IcMoon size={14} /> : <IcSun size={14} />}</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
              {language === 'da' ? 'Mørkt tema' : language === 'en' ? 'Dark Theme' : language === 'de' ? 'Dunkles Design' : 'Tema oscuro'}
            </div>
            <button onClick={() => setDark(!dark)} style={{
              width: 46, height: 26, borderRadius: 999, position: 'relative',
              background: dark ? t.accent : t.surface2,
              border: 'none', cursor: 'pointer', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: dark ? 22 : 2, transition: 'left 0.2s',
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }} />
            </button>
          </div>

          {/* Language Switcher Setting Row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', border: `1px solid ${t.borderStrong}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text,
              fontSize: 14
            }}>🌐</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
              {language === 'da' ? 'Sprog' : language === 'en' ? 'Language' : language === 'de' ? 'Sprache' : 'Idioma'}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {([
                { code: 'da', flag: '🇩🇰' },
                { code: 'en', flag: '🇬🇧' },
                { code: 'de', flag: '🇩🇪' },
                { code: 'es', flag: '🇪🇸' }
              ] satisfies { code: Language; flag: string }[]).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  style={{
                    background: language === l.code ? t.accentSoft : 'transparent',
                    border: `1px solid ${language === l.code ? t.accent : 'transparent'}`,
                    borderRadius: 6,
                    padding: '4px 6px',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {l.flag}
                </button>
              ))}
            </div>
          </div>

          {user && (
            <div onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', border: `1px solid ${t.borderStrong}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text,
              }}><IcLogout size={14} /></div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{translate('logout')}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, fontSize: 10, color: t.textDim, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase' }}>
        Pocket Drummer v1.2.0
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App Tab bar & Shell Wrapper
// ─────────────────────────────────────────────────────────────
function TabBar({ tab, onTab, t, dark, isMobile, selectedCategory, isAdmin, onSelectCategory, onOpenAdmin }: TabBarProps) {
  const { t: translate } = useLanguage();
  const tabs = [
    { id: 'home', label: translate('home') || 'Hjem', icon: TabHome },
    { id: 'practice', label: translate('practice') || 'Øvelser', icon: TabPractice },
    { id: 'playalong', label: translate('playalong') || 'Play-along', icon: TabPlayalong },
    { id: 'kit', label: translate('kit') || 'Rytmeboks', icon: TabKit },
    { id: 'profile', label: translate('profile') || 'Profil', icon: TabUser },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 150,
      paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 10px)' : 24,
      paddingTop: 10, paddingLeft: 8, paddingRight: 8,
      background: t.navBackground,
      backdropFilter: dark ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: dark ? 'blur(16px)' : 'none',
      borderTop: `2px solid ${t.text}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', padding: 0 }}>
        {tabs.map(tt => {
          const active = tt.id === 'playalong' ? selectedCategory === 'playalong' : (tab === tt.id && selectedCategory === null);
          const Icon = tt.icon;
          return (
            <button key={tt.id} onClick={() => {
              if (tt.id === 'playalong') {
                onSelectCategory('playalong');
              } else {
                onTab(tt.id);
              }
            }} style={{
              flex: 1, minWidth: 0, minHeight: 52,
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '4px 2px', fontFamily: t.font,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              color: active ? t.text : t.textDim,
              transition: 'color 0.2s cubic-bezier(0.16,1,0.3,1)',
            }} aria-current={active ? 'page' : undefined}>
              <span style={{
                width: 38, height: 27, display: 'grid', placeItems: 'center',
                borderBottom: `2px solid ${active ? t.accent : 'transparent'}`,
              }}>
                <Icon size={20} color={active ? t.accent : t.textDim} sw={active ? 2 : 1.5} />
              </span>
              <span style={{
                maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontSize: 9.5, fontWeight: active ? 700 : 500, letterSpacing: 0.1,
              }}>{tt.label}</span>
            </button>
          );
        })}
        {isAdmin && (
          <button onClick={onOpenAdmin} style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 0', fontFamily: t.font, color: t.textDim,
          }}>
            <div style={{ width: 40, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
              <IcUpload size={20} color={t.textDim} sw={1.5} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 500 }}>Admin</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop Rail — venstresøjle på ≥ 1024px
// ─────────────────────────────────────────────────────────────
function DesktopRail({ tab, onTab, t, onSelectCategory, onOpenCoach, selectedCategory, onOpenAdmin }: {
  tab: string;
  onTab: (tab: string) => void;
  t: ThemeTokens;
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
  onOpenCoach: () => void;
  selectedCategory: string | null;
  onOpenAdmin?: () => void;
}) {
  const { t: translate } = useLanguage();
  const { user } = useAuth();

  const items = [
    { id: 'home',     label: translate('home') || 'Hjem',       icon: TabHome },
    { id: 'practice', label: translate('practice') || 'Øvelser', icon: TabPractice },
    { id: 'playalong',label: translate('playalong') || 'Play-along', icon: TabPlayalong },
    { id: 'kit',      label: translate('kit') || 'Rytmeboks',   icon: TabKit },
    { id: 'profile',  label: translate('profile') || 'Profil',  icon: TabUser },
  ];

  const initials = user
    ? (user.displayName || user.email || 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div style={{
      width: 80, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: t.bg, borderRight: `2px solid ${t.text}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 20, paddingBottom: 16, zIndex: 10,
    }}>
      {/* Logo — fører altid til Hjem, uanset auth-state */}
      <button onClick={() => onTab('home')} aria-label="Gå til forsiden" style={{
        marginBottom: 28, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        display: 'flex', lineHeight: 0,
      }}>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <circle cx="17" cy="7.2" r="3.1" stroke={t.accent} strokeWidth="2" />
          <path d="M12.6 13.2c1.7-1.8 7.1-1.8 8.8 0" stroke={t.accent} strokeWidth="2" strokeLinecap="round" />
          <path d="M14.2 15.2l-4.3 3.6M19.8 15.2l4.3 3.6" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 9.4l5.1 5.2M25 9.4l-5.1 5.2" stroke={t.accent} strokeWidth="1.7" strokeLinecap="round" />
          <ellipse cx="8.5" cy="23.8" rx="5.5" ry="3.2" stroke={t.accent} strokeWidth="2" />
          <ellipse cx="25.5" cy="23.8" rx="5.5" ry="3.2" stroke={t.accent} strokeWidth="2" />
          <ellipse cx="17" cy="26.4" rx="6.4" ry="3.6" stroke={t.accent} strokeWidth="2" />
          <path d="M14.5 19.4c1.3.7 3.7.7 5 0" stroke={t.accent} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', padding: '0 8px' }}>
        {items.map(item => {
          const active = item.id === 'playalong'
            ? selectedCategory === 'playalong'
            : (tab === item.id && selectedCategory === null);
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => {
              if (item.id === 'playalong') {
                onSelectCategory('playalong');
              } else {
                onTab(item.id);
              }
            }} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 4px', borderRadius: 0, border: 'none', cursor: 'pointer',
              borderLeft: `2px solid ${active ? t.accent : 'transparent'}`,
              background: 'transparent',
              color: active ? t.text : t.textDim,
              fontFamily: t.font, transition: 'all 0.18s',
              width: '100%',
            }}>
              <Icon size={20} color={active ? t.accent : t.textDim} sw={active ? 2 : 1.5} />
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: 0.2 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Admin upload knap (kun admin) */}
      {user?.role === 'admin' && onOpenAdmin && (
        <button onClick={onOpenAdmin} title="Admin: Upload materiale" style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'transparent', border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', marginBottom: 8, color: t.textMuted,
        }}>
          <IcUpload size={16} color={t.textMuted} />
        </button>
      )}

      {/* Coach */}
      <button onClick={onOpenCoach} style={{
        width: 44, height: 44, borderRadius: '50%',
        background: t.accentSoft, border: `1px solid ${t.accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 12,
      }}>
        <IcSpark size={18} color={t.accent} />
      </button>

      {/* User avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: t.accentSoft, border: `1px solid ${t.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: t.accent,
        fontFamily: t.font,
      }}>{initials}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Admin Panel Overlay
// ─────────────────────────────────────────────────────────────
function AdminPanel({ t, onClose }: { t: ThemeTokens; onClose: () => void }) {
  const allExercises = [
    { id: 1, cat: 'opvarmning' as const, title: '5 minutters teknik-start', level: 'Begynder', notation: 'opvarmning-2014.xml' },
    { id: 2, cat: 'opvarmning' as const, title: 'Hånd-hastighed & kontrol', level: 'Mellemniveau' },
    { id: 3, cat: 'opvarmning' as const, title: 'Stortromme styrke & kontrol', level: 'Øvet' },
    { id: 4, cat: 'opvarmning' as const, title: 'Tempo-ladder udfordring', level: 'Øvet' },
    { id: 1, cat: 'nodelære' as const, title: 'Læs fjerdedele & pauser', level: 'Begynder' },
    { id: 2, cat: 'nodelære' as const, title: 'Ottendedele syncopation', level: 'Mellemniveau' },
    { id: 3, cat: 'nodelære' as const, title: 'Sekstendedele ghost notes', level: 'Øvet' },
    { id: 1, cat: 'grooves' as const, title: 'Basic Rock Beat', level: 'Begynder' },
    { id: 2, cat: 'grooves' as const, title: 'Funk Pocket Groove', level: 'Mellemniveau' },
    { id: 3, cat: 'grooves' as const, title: 'Linear Funk Pattern', level: 'Øvet' },
    { id: 1, cat: 'playalong' as const, title: 'Classic Rock 4/4 Beat', level: 'Begynder' },
    { id: 2, cat: 'playalong' as const, title: 'Funk Groove Odyssey', level: 'Mellemniveau' },
  ] as Array<{ id: number; cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong'; title: string; level: string; notation?: string }>;

  const [uploadingFor, setUploadingFor] = React.useState<string | null>(null);
  const [uploadLog, setUploadLog] = React.useState<Record<string, string>>({});
  const [notationStatus, setNotationStatus] = React.useState<Record<string, string | null>>({});

  React.useEffect(() => {
    const load = async () => {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const snap = await getDocs(collection(db, 'exerciseNotations'));
      const map: Record<string, string | null> = {};
      snap.forEach(d => { map[d.id] = 'firestore'; });
      setNotationStatus(map);
    };
    load().catch(() => {});
  }, []);

  const catLabel = (c: string) => ({ opvarmning: 'Opvarmning', nodelære: 'Nodelære', grooves: 'Grooves', playalong: 'Play-along' })[c] ?? c;
  const lvlColor = (l: string) => l === 'Begynder' ? '#4edea3' : l === 'Mellemniveau' ? t.textMuted : t.accent;

  const handleFileUpload = async (ex: typeof allExercises[0], file: File) => {
    const key = `${ex.cat}_${ex.id}`;
    setUploadingFor(key);
    const addLog = (msg: string) => setUploadLog(p => ({ ...p, [key]: msg }));
    try {
      const fname = file.name.toLowerCase();
      const isXml = fname.match(/\.(xml|musicxml)$/);
      const isImage = fname.match(/\.(jpg|jpeg|png)$/) || file.type.startsWith('image/');
      const isPdf = fname.endsWith('.pdf') || file.type === 'application/pdf';

      if (isXml) {
        addLog('Indlæser XML...');
        const xml = await file.text();
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        await setDoc(doc(db, 'exerciseNotations', key), { xml, mimeType: 'application/xml', name: file.name, updatedAt: serverTimestamp() });
        setNotationStatus(p => ({ ...p, [key]: 'firestore' }));
        addLog('✅ XML gemt');
      } else if (isImage || isPdf) {
        addLog('Konverterer til data URL...');
        const dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
        });
        addLog('Gemmer i Firestore...');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        await setDoc(doc(db, 'exerciseNotations', key), { dataUrl, mimeType: file.type, name: file.name, updatedAt: serverTimestamp() });
        setNotationStatus(p => ({ ...p, [key]: 'firestore' }));
        addLog('✅ Gemt');
      } else {
        addLog('Sender til Gemini OMR...');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/scan-sheet-music', { method: 'POST', body: formData });
        const text = await res.text();
        let data: Record<string, string>;
        try { data = JSON.parse(text); } catch { throw new Error('Serverfejl'); }
        if (!res.ok || data.error) throw new Error(data.error);
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        await setDoc(doc(db, 'exerciseNotations', key), { xml: data.xml, mimeType: 'application/xml', name: file.name, updatedAt: serverTimestamp() });
        setNotationStatus(p => ({ ...p, [key]: 'firestore' }));
        addLog('✅ Scannet og gemt');
      }
    } catch (e) {
      setUploadLog(p => ({ ...p, [key]: `❌ ${e instanceof Error ? e.message : String(e)}` }));
    } finally {
      setUploadingFor(null);
    }
  };

  const groups = ['opvarmning', 'nodelære', 'grooves', 'playalong'] as const;

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, zIndex: 135, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />
      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcUpload size={14} color={t.accent} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: 0.8, textTransform: 'uppercase' }}>Admin</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: t.head }}>Upload materiale</div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        {groups.map(cat => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>{catLabel(cat)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allExercises.filter(e => e.cat === cat).map(ex => {
                const key = `${ex.cat}_${ex.id}`;
                const hasNotation = ex.notation || notationStatus[key];
                const isUploading = uploadingFor === key;
                const log = uploadLog[key];
                return (
                  <div key={key} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: log ? 8 : 0 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 2 }}>{ex.title}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: lvlColor(ex.level), fontWeight: 600 }}>{ex.level}</span>
                          {hasNotation && <span style={{ fontSize: 10, color: '#4edea3', fontWeight: 600 }}>· ✓ Notation</span>}
                        </div>
                      </div>
                      <label style={{
                        padding: '6px 12px', borderRadius: 8, cursor: isUploading ? 'default' : 'pointer',
                        background: isUploading ? t.surface2 : t.accentSoft,
                        border: `1px solid ${isUploading ? t.border : t.accent}20`,
                        fontSize: 11, fontWeight: 700, color: isUploading ? t.textMuted : t.accent,
                        display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                      }}>
                        {isUploading ? '...' : <><IcUpload size={12} color={t.accent} /> Upload</>}
                        <input type="file" accept="image/*,application/pdf,.xml,.musicxml" style={{ display: 'none' }}
                          disabled={isUploading}
                          onChange={e => { if (e.target.files?.[0]) handleFileUpload(ex, e.target.files[0]); e.target.value = ''; }}
                        />
                      </label>
                    </div>
                    {log && <div style={{ fontSize: 11, fontFamily: 'monospace', color: log.startsWith('❌') ? '#F25545' : '#4edea3', marginTop: 4 }}>{log}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ padding: '16px', background: t.surface2, borderRadius: 12, border: `1px dashed ${t.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>Fuld admin-side</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 10 }}>Scan, generer og administrer alt indhold</div>
          <a href="/admin" style={{ fontSize: 12, fontWeight: 700, color: t.accent, textDecoration: 'none' }}>Åbn /admin →</a>
        </div>
      </div>
    </div>
  );
}

function useFitScale(w: number, h: number, margin = 24) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const s = Math.min(
        (window.innerWidth - margin * 2) / w,
        (window.innerHeight - margin * 2) / h,
        1
      );
      setScale(s > 0 ? s : 1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [w, h, margin]);
  return scale;
}

type PreviewMode = 'mobile' | 'desktop';

function PreviewModeToggle({ mode, onChange }: {
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Skift preview-størrelse"
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 14,
        background: 'rgba(20, 18, 16, 0.9)',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {(['mobile', 'desktop'] as const).map((option) => {
        const active = mode === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option)}
            style={{
              minHeight: 44,
              padding: '0 16px',
              border: 0,
              borderRadius: 10,
              background: active ? '#EE6C48' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.72)',
              font: '700 13px "Hanken Grotesk", sans-serif',
              cursor: 'pointer',
              transition: 'background 160ms ease, color 160ms ease',
            }}
          >
            {option === 'mobile' ? 'Mobil' : 'Desktop'}
          </button>
        );
      })}
    </div>
  );
}

export default function MobilePrototype() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState('home');
  const [trackId, setTrackId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [desktopReady, setDesktopReady] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<TrainingLevel | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueProgram | null>(null);
  const [journey, setJourney] = useState<JourneyProgress | null>(null);
  const [journeySaving, setJourneySaving] = useState(false);
  const [journeyError, setJourneyError] = useState(false);
  const [guestXp, setGuestXp] = useState(120);
  const [adminOpen, setAdminOpen] = useState(false);

  const { user, loading: authLoading, login, syncLearningPlan } = useAuth();

  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 768;
      const desktop = window.innerWidth >= 1024;
      setIsMobileViewport(mobile);
      setIsDesktopViewport(desktop);
      // Desktop springer onboarding over — det er et mobil-first flow
      if (desktop) setDesktopReady(true);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Genoptag den seneste rejse, når lokal/cloud-synkronisering er færdig.
  useEffect(() => {
    if (authLoading) return;
    const savedJourney = getUserPlan()?.journey;
    const validLevel = savedJourney && TRAINING_LEVELS.some(item => item.id === savedJourney.level);
    const validTechnique = savedJourney && TECHNIQUE_PROGRAMS.some(item => item.id === savedJourney.technique);
    if (!savedJourney || !validLevel || !validTechnique) return;

    const timeout = window.setTimeout(() => {
      setJourney(savedJourney);
      const params = new URLSearchParams(window.location.search);
      const canResume = !params.has('level') && !params.has('category') && params.get('coach') !== '1'
        && (!params.get('tab') || params.get('tab') === 'home');
      if (!canResume) return;

      setTab('home');
      setSelectedLevel(savedJourney.level);
      setSelectedTechnique(savedJourney.technique);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'home');
      url.searchParams.set('level', savedJourney.level);
      url.searchParams.set('technique', savedJourney.technique);
      window.history.replaceState({}, '', url);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [authLoading, user?.uid]);

  // Initialize guest XP, onboarded status, and landing-page gate
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const valXp = localStorage.getItem('pocketdrummer_xp');
        if (valXp) setTimeout(() => setGuestXp(Number(valXp)), 0);

        const valOnboard = localStorage.getItem('pocketdrummer-onboarded');
        setTimeout(() => {
          setOnboarded(valOnboard === '1');
        }, 0);

        // First-visit redirect: send mobile users to landing page
        const landingSeen = localStorage.getItem('pocketdrummer_landing_seen');
        if (!landingSeen && window.innerWidth < 1024) {
          window.location.replace('/landing');
        }
      }
    } catch {
      // Ignore errors silently on SSR
    }
  }, []);

  // URL-synkroniseret navigation — så browserens frem/tilbage-knapper virker
  // og fane/kategori/coach kan deep-linkes og genindlæses.
  type Category = 'opvarmning' | 'nodelære' | 'grooves' | 'playalong';
  const VALID_TABS = ['home', 'practice', 'kit', 'profile'];
  const VALID_CATEGORIES: Category[] = ['opvarmning', 'nodelære', 'grooves', 'playalong'];
  useEffect(() => {
    const applyFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      const urlCategory = params.get('category');
      const urlView = params.get('view');
      const urlLevel = params.get('level');
      const urlTechnique = params.get('technique');
      const validLevel = TRAINING_LEVELS.some(item => item.id === urlLevel)
        ? urlLevel as TrainingLevel
        : null;
      const validTechnique = validLevel && TECHNIQUE_PROGRAMS.some(item => item.id === urlTechnique)
        ? urlTechnique as TechniqueProgram
        : null;
      setTab(urlTab && VALID_TABS.includes(urlTab) ? urlTab : 'home');
      setSelectedCategory(
        urlCategory && (VALID_CATEGORIES as string[]).includes(urlCategory) ? (urlCategory as Category) : null
      );
      setCoachOpen(params.get('coach') === '1');
      setPreviewMode(urlView === 'mobile' || urlView === 'desktop' ? urlView : null);
      setSelectedLevel(validLevel);
      setSelectedTechnique(validTechnique);
    };
    applyFromUrl();
    window.addEventListener('popstate', applyFromUrl);
    return () => window.removeEventListener('popstate', applyFromUrl);
  }, []);

  const pushNavUrl = (params: {
    tab?: string;
    category?: Category | null;
    coach?: boolean;
    level?: TrainingLevel | null;
    technique?: TechniqueProgram | null;
  }) => {
    const url = new URL(window.location.href);
    if (params.tab !== undefined) url.searchParams.set('tab', params.tab);
    if (params.category !== undefined) {
      if (params.category) url.searchParams.set('category', params.category); else url.searchParams.delete('category');
    }
    if (params.coach !== undefined) {
      if (params.coach) url.searchParams.set('coach', '1'); else url.searchParams.delete('coach');
    }
    if (params.level !== undefined) {
      if (params.level) url.searchParams.set('level', params.level); else url.searchParams.delete('level');
    }
    if (params.technique !== undefined) {
      if (params.technique) url.searchParams.set('technique', params.technique); else url.searchParams.delete('technique');
    }
    window.history.pushState({}, '', url);
  };

  const planWithJourney = (progress: JourneyProgress): UserPlan => {
    const current = getUserPlan();
    const defaultExercises: PlanExercise[] = progress.level === 'rutineret'
      ? [
          { exercise_id: 'ex-7', dag: 1, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-8', dag: 3, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-6', dag: 5, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-4', dag: 7, uge: 1, status: 'ikke startet' },
        ]
      : progress.level === 'oevet'
      ? [
          { exercise_id: 'ex-4', dag: 1, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-5', dag: 3, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-6', dag: 5, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-2', dag: 7, uge: 1, status: 'ikke startet' },
        ]
      : [
          { exercise_id: 'ex-1', dag: 1, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-2', dag: 3, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-3', dag: 5, uge: 1, status: 'ikke startet' },
          { exercise_id: 'ex-6', dag: 7, uge: 1, status: 'ikke startet' },
        ];

    return {
      goal_id: current?.goal_id ?? `journey-${progress.level}`,
      uge_start: current?.uge_start ?? new Date().toISOString().slice(0, 10),
      fokustema: current?.fokustema ?? `Pocket Drummer · ${progress.level} (${progress.technique})`,
      milepæl: current?.milepæl ?? 'Gennemfør 8 progressive trin i dit teknikspor',
      øvelser: current?.øvelser && current.øvelser.length > 0 ? current.øvelser : defaultExercises,
      journey: progress,
    };
  };

  const saveJourneyLocation = async (
    level: TrainingLevel,
    technique: TechniqueProgram,
    lastExerciseId?: number,
    uidOverride?: string,
  ) => {
    const now = new Date().toISOString();
    const currentJourney = getUserPlan()?.journey;
    const progress: JourneyProgress = {
      level,
      technique,
      lastExerciseId,
      startedAt: currentJourney?.level === level ? currentJourney.startedAt : now,
      updatedAt: now,
    };
    setJourney(progress);
    await syncLearningPlan(planWithJourney(progress), uidOverride);
  };

  const startJourney = async (technique: TechniqueProgram) => {
    if (!selectedLevel || journeySaving) return;
    setJourneySaving(true);
    setJourneyError(false);
    try {
      const uid = user?.uid || await login();
      const lastExerciseId = journey?.level === selectedLevel && journey.technique === technique
        ? journey.lastExerciseId
        : undefined;
      await saveJourneyLocation(selectedLevel, technique, lastExerciseId, uid);
      setSelectedTechnique(technique);
      pushNavUrl({ tab: 'home', level: selectedLevel, technique });
    } catch {
      setJourneyError(true);
    } finally {
      setJourneySaving(false);
    }
  };

  const navigateTab = (id: string) => {
    setTab(id);
    setSelectedCategory(null);
    setCoachOpen(false);
    setTrackId(null);
    setLessonId(null);
    setSelectedLevel(null);
    setSelectedTechnique(null);
    pushNavUrl({ tab: id, category: null, coach: false, level: null, technique: null });
  };
  const openCategory = (cat: Category) => {
    setSelectedLevel(null);
    setSelectedTechnique(null);
    setSelectedCategory(cat);
    pushNavUrl({ category: cat, level: null, technique: null });
  };
  const closeCategory = () => {
    setSelectedCategory(null);
    pushNavUrl({ category: null });
  };
  const openTrainingLevel = (level: TrainingLevel) => {
    setTab('home');
    setSelectedCategory(null);
    setSelectedLevel(level);
    const savedTechnique = journey?.level === level ? journey.technique : null;
    setSelectedTechnique(savedTechnique);
    setJourneyError(false);
    pushNavUrl({ tab: 'home', category: null, level, technique: savedTechnique });
  };
  const openTechniqueProgram = (technique: TechniqueProgram) => {
    setSelectedTechnique(technique);
    pushNavUrl({ technique });
    if (selectedLevel && journey?.level === selectedLevel) {
      void saveJourneyLocation(
        selectedLevel,
        technique,
        journey.technique === technique ? journey.lastExerciseId : undefined,
      );
    }
  };
  const recordJourneyExercise = (technique: TechniqueProgram, exerciseId: number) => {
    if (!selectedLevel || journey?.level !== selectedLevel) return;
    void saveJourneyLocation(selectedLevel, technique, exerciseId);
  };
  const backFromTechniqueProgram = () => {
    if (selectedTechnique) {
      setSelectedTechnique(null);
      pushNavUrl({ technique: null });
      return;
    }
    setSelectedLevel(null);
    pushNavUrl({ level: null, technique: null });
  };
  const openCoachOverlay = () => {
    setCoachOpen(true);
    pushNavUrl({ coach: true });
  };
  const closeCoachOverlay = () => {
    setCoachOpen(false);
    pushNavUrl({ coach: false });
  };
  const openCoachFromCategory = () => {
    setSelectedCategory(null);
    setCoachOpen(true);
    pushNavUrl({ category: null, coach: true });
  };

  const t = tokens(dark);
  const scale = useFitScale(402, 874);
  const isDesktop = previewMode === 'desktop' || (previewMode === null && isDesktopViewport);
  const isMobile = !isDesktop && isMobileViewport;
  const effectivePreviewMode: PreviewMode = isDesktop ? 'desktop' : 'mobile';

  const changePreviewMode = (mode: PreviewMode) => {
    setPreviewMode(mode);
    if (mode === 'desktop') setDesktopReady(true);
    const url = new URL(window.location.href);
    url.searchParams.set('view', mode);
    window.history.replaceState({}, '', url);
  };

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [tab, selectedLevel, selectedTechnique]);

  const completeOnboarding = () => {
    try { localStorage.setItem('pocketdrummer-onboarded', '1'); } catch {}
    setOnboarded(true);
  };

  const handleResetOnboarding = () => {
    try { localStorage.removeItem('pocketdrummer-onboarded'); } catch {}
    setOnboarded(false);
  };

  // ── Desktop layout ────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: t.bg, color: t.text, fontFamily: t.font,
        WebkitFontSmoothing: 'antialiased',
      }}>
        {previewMode && <PreviewModeToggle mode={effectivePreviewMode} onChange={changePreviewMode} />}
        <DesktopRail
          tab={tab} onTab={navigateTab} t={t}
          onSelectCategory={openCategory}
          onOpenCoach={openCoachOverlay}
          selectedCategory={selectedCategory}
          onOpenAdmin={() => setAdminOpen(true)}
        />
        <div ref={contentRef} style={{
          flex: 1, overflowY: 'auto', position: 'relative',
          zIndex: 0, // stacking context — overlays kan ikke dække railen
          background: t.bg,
        }}>
          <div key={tab} className="tab-content-enter">
            {tab === 'home' && selectedLevel && (
              <TechniqueProgramScreen
                t={t} dark={dark} level={selectedLevel} technique={selectedTechnique}
                isDesktop onSelectTechnique={openTechniqueProgram}
                onBack={backFromTechniqueProgram} onOpenCoach={openCoachOverlay}
                journey={journey} isLoggedIn={Boolean(user)}
                journeySaving={journeySaving} journeyError={journeyError}
                onStartJourney={startJourney} onOpenExercise={recordJourneyExercise}
              />
            )}
            {tab === 'home' && !selectedLevel && (
              <HomeScreen t={t} dark={dark} setDark={setDark}
                onSelectCategory={openCategory}
                onSelectLevel={openTrainingLevel}
                onStartJourneyTrack={(lvl, tech) => {
                  openTrainingLevel(lvl);
                  openTechniqueProgram(tech);
                }}
                onOpenCoach={openCoachOverlay}
                journey={journey}
                guestXp={guestXp} isDesktop />
            )}
            {tab === 'practice' && (
              <PracticeScreen t={t} dark={dark} isDesktop
                onSelectCategory={openCategory} />
            )}
            {tab === 'kit' && (
              <StudioKitScreen t={t} dark={dark} />
            )}
            {tab === 'profile' && (
              <ProfileScreen t={t} dark={dark} setDark={setDark} guestXp={guestXp} />
            )}
          </div>

          {/* Overlays fill content area (not the rail) */}
          {selectedCategory && (
            <MobileCategoryDetail t={t} dark={dark} category={selectedCategory}
              onClose={closeCategory}
              onOpenCoach={openCoachFromCategory} />
          )}
          {trackId && (
            <TrackDetail t={t} dark={dark} trackId={trackId}
              onClose={() => setTrackId(null)}
              onOpenLesson={(id: string) => setLessonId(id)}
              onOpenCoach={() => { setTrackId(null); openCoachOverlay(); }} />
          )}
          {lessonId && (
            <LessonDetail t={t} dark={dark} lessonId={lessonId}
              onClose={() => setLessonId(null)}
              onOpenCoach={() => { setLessonId(null); openCoachOverlay(); }} />
          )}
          {coachOpen && (
            <CoachScreen
              t={t}
              dark={dark}
              onClose={closeCoachOverlay}
              selectedLevel={selectedLevel}
              selectedTechnique={selectedTechnique}
              journey={journey}
            />
          )}
          {adminOpen && user?.role === 'admin' && <AdminPanel t={t} onClose={() => setAdminOpen(false)} />}
          {!desktopReady && <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 28, color: t.text }}>
              Pocket Drummer<span style={{ color: t.accent }}>.</span>
            </div>
          </div>}
        </div>
      </div>
    );
  }

  const safeVars = {
    '--safe-top': isMobile ? 'calc(env(safe-area-inset-top) + 12px)' : '62px',
    '--safe-bottom': isMobile ? 'env(safe-area-inset-bottom)' : '0px',
  } as React.CSSProperties;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050505' }}>
      {previewMode && <PreviewModeToggle mode={effectivePreviewMode} onChange={changePreviewMode} />}

      {/* Main Studio Frame container */}
      <div style={isMobile ? {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: t.bg,
        overflow: 'hidden'
      } : {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        background: 'radial-gradient(circle at center, #111 0%, #050505 100%)',
        overflow: 'hidden'
      }}>
        {/* Reset button to clear localStorage onboarding state */}
        <button 
          onClick={handleResetOnboarding}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            padding: '6px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: t.mono,
            zIndex: 90
          }}
        >
          Reset Intro
        </button>

        {/* Scaled Device Shell */}
        <div style={isMobile ? {
          width: '100%',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          ...safeVars
        } : {
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: 402,
          height: 874,
          ...safeVars
        }}>
          <div style={isMobile ? {
            width: '100%',
            height: '100%',
            position: 'relative',
            background: t.bg,
            fontFamily: t.font,
            WebkitFontSmoothing: 'antialiased',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          } : {
            width: 402,
            height: 874,
            borderRadius: 48,
            overflow: 'hidden',
            position: 'relative',
            background: dark ? '#000' : '#F2F2F7',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 12px rgba(15,15,15,1)',
            fontFamily: t.font,
            WebkitFontSmoothing: 'antialiased'
          }}>
            {/* Dynamic island */}
            {!isMobile && (
              <div style={{
                position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
                width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 180,
              }} />
            )}

            {/* Page background */}
            <div style={{
              position: 'absolute', inset: 0, background: t.bg, transition: 'background 0.3s',
            }} />

            {/* Status bar */}
            {!isMobile && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 170 }}>
                <IOSStatusBar dark={dark} />
              </div>
            )}

            {/* Content area */}
            <div ref={contentRef} style={{
              position: 'absolute',
              top: 'var(--safe-top)',
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'auto',
              paddingBottom: 'calc(var(--safe-bottom) + 100px)',
            }}>
              <div key={tab} className="tab-content-enter">
                {tab === 'home' && selectedLevel && (
                  <TechniqueProgramScreen
                    t={t} dark={dark} level={selectedLevel} technique={selectedTechnique}
                    onSelectTechnique={openTechniqueProgram}
                    onBack={backFromTechniqueProgram} onOpenCoach={openCoachOverlay}
                    journey={journey} isLoggedIn={Boolean(user)}
                    journeySaving={journeySaving} journeyError={journeyError}
                    onStartJourney={startJourney} onOpenExercise={recordJourneyExercise}
                  />
                )}
                {tab === 'home' && !selectedLevel && (
                  <HomeScreen t={t} dark={dark} setDark={setDark}
                    onSelectCategory={openCategory}
                    onSelectLevel={openTrainingLevel}
                    onStartJourneyTrack={(lvl, tech) => {
                      openTrainingLevel(lvl);
                      openTechniqueProgram(tech);
                    }}
                    onOpenCoach={openCoachOverlay}
                    journey={journey}
                    guestXp={guestXp} />
                )}
                {tab === 'practice' && (
                  <PracticeScreen t={t} dark={dark}
                    onSelectCategory={openCategory} />
                )}
                {tab === 'kit' && (
                  <StudioKitScreen t={t} dark={dark} />
                )}
                {tab === 'profile' && (
                  <ProfileScreen t={t} dark={dark} setDark={setDark} guestXp={guestXp} />
                )}
              </div>
            </div>

            {/* Tab bar */}
            <TabBar tab={tab} onTab={navigateTab} t={t} dark={dark} isMobile={isMobile}
              selectedCategory={selectedCategory}
              isAdmin={user?.role === 'admin'}
              onSelectCategory={openCategory}
              onOpenAdmin={() => setAdminOpen(true)} />

            {/* Category detail overlay */}
            {selectedCategory && (
              <MobileCategoryDetail t={t} dark={dark} category={selectedCategory}
                onClose={closeCategory}
                onOpenCoach={openCoachFromCategory} />
            )}

            {/* Track detail overlay */}
            {trackId && (
              <TrackDetail t={t} dark={dark} trackId={trackId}
                onClose={() => setTrackId(null)}
                onOpenLesson={(id: string) => setLessonId(id)}
                onOpenCoach={() => { setTrackId(null); openCoachOverlay(); }} />
            )}

            {/* Lesson detail overlay */}
            {lessonId && (
              <LessonDetail t={t} dark={dark} lessonId={lessonId}
                onClose={() => setLessonId(null)}
                onOpenCoach={() => { setLessonId(null); openCoachOverlay(); }} />
            )}

            {/* Coach overlay */}
            {coachOpen && (
              <CoachScreen
                t={t}
                dark={dark}
                onClose={closeCoachOverlay}
                selectedLevel={selectedLevel}
                selectedTechnique={selectedTechnique}
                journey={journey}
              />
            )}

            {/* Pad view overlay */}
  
            {/* Onboarding (covers everything) */}
            {!onboarded && (
              <OnboardingScreen t={t} dark={dark} onStart={completeOnboarding} />
            )}

            {/* Home indicator */}
            {!isMobile && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 160,
                height: 34, display: 'flex', alignItems: 'flex-end',
                paddingBottom: 8, pointerEvents: 'none',
              }}>
                <div style={{
                  width: 139, height: 5, borderRadius: 100,
                  background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.3)',
                }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
