'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  Target, 
  BookOpen, 
  CheckCircle, 
  Play, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw,
  FolderOpen,
  Home,
  Drum,
  User,
  Bell
} from 'lucide-react';
import { 
  getSavedExercises, 
  getUserGoal, 
  getUserPlan, 
  getCompletedExercises,
  saveUserPlan,
  Exercise, 
  UserGoal, 
  UserPlan,
  resetMockDatabase
} from '@/lib/mockData';

// Custom desktop UI components
import {
  IcHome, IcBook, IcSpark, IcUser, IcPlay, IcPause, IcBack, IcChev, IcChevDown, IcMore, IcCheck, IcLock, IcSun, IcMoon, IcSend, IcPlus, IcMetro, IcMic, IcTuner, IcVideo, IcFlame, IcClock, IcTrophy, IcBell, IcLogout, IcWave, IcCalendar, IcAttach, IcLoop, IcMin,
  TabHome, TabPractice, TabKit, TabUser,
  DrumNotation, IllSnare, IllKit, IllSticks,
  RadialProgress
} from '@/components/DesktopIcons';

declare global {
  interface Window {
    __dkitAudio?: AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
}

// ─────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────
interface ThemeTokens {
  bg: string;
  sidebar: string;
  surface: string;
  surface2: string;
  surfaceElev: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  accentText: string;
  good: string;
  goodSoft: string;
  mono: string;
  font: string;
  serif: string;
}

const D_TOKENS = (dark = true): ThemeTokens => ({
  bg: dark ? '#0a0a0a' : '#f4f1ec',
  sidebar: dark ? '#0f0f10' : '#ebe7e0',
  surface: dark ? '#141416' : '#ffffff',
  surface2: dark ? '#1c1c1f' : '#ebe7e0',
  surfaceElev: dark ? '#1f1f22' : '#ffffff',
  border: dark ? 'rgba(255,255,255,0.06)' : 'rgba(20,20,28,0.08)',
  borderStrong: dark ? 'rgba(255,255,255,0.12)' : 'rgba(20,20,28,0.14)',
  text: dark ? '#f4f1ec' : '#16161a',
  textMuted: dark ? '#8a8580' : '#6e6a62',
  textDim: dark ? '#56524c' : '#a8a39a',
  accent: '#ef5a3a',
  accentDeep: '#d94527',
  accentSoft: dark ? 'rgba(239,90,58,0.12)' : 'rgba(239,90,58,0.10)',
  accentText: dark ? '#f5b8a8' : '#a83419',
  good: '#5dd39e',
  goodSoft: 'rgba(93,211,158,0.13)',
  mono: 'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
});

// ─────────────────────────────────────────────────────────────
// Design Components (Primitives)
// ─────────────────────────────────────────────────────────────
const DSection: React.FC<{ children: React.ReactNode; t: ThemeTokens; color?: string; style?: React.CSSProperties }> = ({ children, t, color, style = {} }) => (
  <div style={{
    fontFamily: t.font, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8,
    textTransform: 'uppercase', color: color || t.textMuted, marginBottom: 14, ...style,
  }}>{children}</div>
);

const DCard: React.FC<{ children: React.ReactNode; t: ThemeTokens; style?: React.CSSProperties; onClick?: () => void; padding?: number }> = ({ children, t, style = {}, onClick, padding = 24 }) => (
  <div onClick={onClick} style={{
    background: t.surface, border: `1px solid ${t.border}`,
    borderRadius: 20, padding, cursor: onClick ? 'pointer' : 'default', ...style,
  }}>{children}</div>
);

const DDisplay: React.FC<{ children: React.ReactNode; t: ThemeTokens; size?: number; style?: React.CSSProperties }> = ({ children, t, size = 36, style = {} }) => (
  <div style={{
    fontFamily: t.serif, fontStyle: 'italic', fontSize: size,
    lineHeight: 1.0, color: t.text, letterSpacing: -0.4,
    whiteSpace: 'nowrap', ...style,
  }}>{children}</div>
);

const DPill: React.FC<{ children: React.ReactNode; t: ThemeTokens; tone?: 'default' | 'accent' | 'good' }> = ({ children, t, tone = 'default' }) => {
  const c = tone === 'accent' ? { bg: t.accentSoft, fg: t.accentText }
       : tone === 'good' ? { bg: t.goodSoft, fg: t.good }
       : { bg: t.surface2, fg: t.textMuted };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.fg, padding: '5px 11px',
      borderRadius: 999, fontSize: 11, fontWeight: 600,
      fontFamily: t.font, letterSpacing: 0.3,
    }}>{children}</span>
  );
};

const DProgress: React.FC<{ pct: number; t: ThemeTokens; h?: number; color?: string }> = ({ pct, t, h = 6, color }) => (
  <div style={{ width: '100%', height: h, background: t.surface2, borderRadius: 999, overflow: 'hidden' }}>
    <div style={{ width: `${pct}%`, height: '100%', background: color || t.accent, borderRadius: 999, transition: 'width 0.3s' }} />
  </div>
);

const DCTA: React.FC<{ children: React.ReactNode; t: ThemeTokens; onClick?: () => void; variant?: 'primary' | 'ghost' | 'secondary'; icon?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; wide?: boolean }> = ({ children, t, onClick, variant = 'primary', icon, size = 'md', wide = false }) => {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const sizes = {
    sm: { pad: '8px 16px', fs: 11, ls: 1.4 },
    md: { pad: '13px 22px', fs: 12, ls: 1.6 },
    lg: { pad: '16px 26px', fs: 13, ls: 1.8 },
  }[size];
  return (
    <button onClick={onClick} style={{
      padding: sizes.pad, borderRadius: 999,
      width: wide ? '100%' : 'auto',
      background: isPrimary ? t.accent : isGhost ? 'transparent' : t.surface,
      color: isPrimary ? '#fff' : t.text,
      border: isPrimary ? 'none' : isGhost ? 'none' : `1px solid ${t.borderStrong}`,
      fontFamily: t.font, fontSize: sizes.fs, fontWeight: 700,
      letterSpacing: sizes.ls, textTransform: 'uppercase',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: isPrimary ? '0 6px 20px rgba(239,90,58,0.32)' : 'none',
      transition: 'transform 0.1s',
    }}>
      {icon}{children}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// Fit Scale Hook
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// macOS Window TitleBar
// ─────────────────────────────────────────────────────────────
const MacTrafficLights: React.FC = () => {
  const dot = (bg: string) => (
    <div style={{
      width: 14, height: 14, borderRadius: '50%', background: bg,
      border: '0.5px solid rgba(0,0,0,0.1)',
    }} />
  );
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'center', padding: 1 }}>
      {dot('#ff736a')}{dot('#febc2e')}{dot('#19c332')}
    </div>
  );
};

const TitleBar: React.FC<{ t: ThemeTokens }> = ({ t }) => {
  return (
    <div style={{
      height: 44, flexShrink: 0,
      background: t.sidebar,
      borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14,
      position: 'relative',
    }}>
      <MacTrafficLights />
      <div style={{ flex: 1, textAlign: 'center', fontFamily: t.font, fontSize: 13, fontWeight: 600, color: t.textMuted, letterSpacing: 0.3 }}>
        DrumLab
      </div>
      <div style={{ width: 60 }} />
    </div>
  );
};

// Practice tracks details data
const PRACTICE_TRACKS_STATIC = [
  {
    id: 'rytme-timing',
    title: 'Rytme & Timing',
    subtitle: 'Forbedr din timing',
    blurb: 'Styrk din indre puls og få bedre kontrol over rytme, tempo og dynamik. Et forløb der bygger din timing fra bunden — fra subdivisioner til polyrytmer.',
    lessonCount: 15,
    level: 'Begynder til øvet',
    ill: 'sticks',
    progress: 27,
  },
  {
    id: 'fills-grooves',
    title: 'Fills & Grooves',
    subtitle: 'Udvid dit vokabular',
    blurb: 'Byg et bibliotek af fills og pocket grooves du kan trække i hvilken som helst situation — fra rock og funk til linear playing.',
    lessonCount: 22,
    level: 'Niveau 3 og op',
    ill: 'snare',
    progress: 12,
  },
  {
    id: 'jazz-brush',
    title: 'Jazz & Brushwork',
    subtitle: 'Subtil dynamik',
    blurb: 'Lær brushteknikker, swing-feel og dynamisk kontrol i jazztraditionen. Med fokus på lyttearbejde og subtile detaljer.',
    lessonCount: 14,
    level: 'Niveau 5+',
    ill: 'sticks',
    progress: 0,
  },
  {
    id: 'odd-time',
    title: 'Skæve taktarter',
    subtitle: 'Ud over 4/4',
    blurb: 'Naviger 5/8, 7/8 og 11/16 — fra polyrytmer til moderne progrock og fusion.',
    lessonCount: 12,
    level: 'Niveau 6+',
    ill: 'snare',
    progress: 0,
  },
];

// Helper to filter db exercises into practice tracks
const getExercisesForTrack = (trackId: string, allExercises: Exercise[]): Exercise[] => {
  if (trackId === 'rytme-timing') {
    return allExercises.filter(e => e.kategori === 'timing' || e.kategori === 'rudiments');
  }
  if (trackId === 'fills-grooves') {
    return allExercises.filter(e => e.kategori === 'fills' || e.kategori === 'groove');
  }
  if (trackId === 'jazz-brush') {
    return allExercises.filter(e => e.kategori === 'stilarter' || e.kategori === 'koordination');
  }
  if (trackId === 'odd-time') {
    return allExercises.filter(e => e.sværhedsgrad === 'øvet');
  }
  return [];
};

// ─────────────────────────────────────────────────────────────
// MAIN ROUTE EXPORT
// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  
  // Responsive check
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Desktop States
  const [dark, setDark] = useState(true);
  const [desktopView, setDesktopView] = useState<'home' | 'practice' | 'kit' | 'library' | 'profile'>('home');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [coachOpen, setCoachOpen] = useState(true);

  // Metronome & Audio Mixer (Virtual Kit)
  const [activePads, setActivePads] = useState<Record<number, number>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [kitBpm, setKitBpm] = useState(92);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [vols, setVols] = useState<Record<string, number>>({ kick: 80, snare: 70, hihat: 65, toms: 60, cymbals: 55 });
  const [selectedKit, setSelectedKit] = useState('Maple Studio');

  // AI Coach Chat
  const [coachInput, setCoachInput] = useState('');
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const [coachMessages, setCoachMessages] = useState([
    { role: 'ai', text: 'Hej Anders 👋\nJeg har set, du arbejder med 16-dele hi-hat. Hvordan går det?' },
    { role: 'user', text: 'Det er svært at holde tempo når jeg tilføjer kick.' },
    { role: 'ai', text: 'Klassisk udfordring. Prøv:\n\n1. Sæt metronomen til 70 BPM\n2. Spil KUN hi-hat 16-dele i 8 takter\n3. Tilføj så kick på 1\n\nFokuser bevidst på at hånden IKKE accelererer.' },
  ]);

  const coachScrollRef = useRef<HTMLDivElement>(null);
  
  // Mobile Calendar & Library Filter
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [activeWeek, setActiveWeek] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const themeTokens = useMemo(() => D_TOKENS(dark), [dark]);

  useEffect(() => {
    setMounted(true);
    // Load mock database
    setExercises(getSavedExercises());
    setGoal(getUserGoal());
    setPlan(getUserPlan());
    setCompletedIds(getCompletedExercises());

    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Sync AI coach scrollbar
  useEffect(() => {
    if (coachScrollRef.current) {
      coachScrollRef.current.scrollTop = coachScrollRef.current.scrollHeight;
    }
  }, [coachMessages, isCoachTyping]);

  const handleSkipExercise = (exerciseId: string, day: number) => {
    if (!plan) return;
    const updatedExercises = plan.øvelser.map(pe => {
      if (pe.exercise_id === exerciseId && pe.dag === day && pe.uge === activeWeek) {
        return { ...pe, dag: (day % 7) + 1 };
      }
      return pe;
    });

    const updatedPlan = { ...plan, øvelser: updatedExercises };
    setPlan(updatedPlan);
    saveUserPlan(updatedPlan);
  };

  // Skip delay database trigger for fast reactive state
  const handleResetDatabase = () => {
    resetMockDatabase();
    setExercises(getSavedExercises());
    setGoal(getUserGoal());
    setPlan(getUserPlan());
    setCompletedIds(getCompletedExercises());
    alert("Din fremgang og læringsplan er blevet nulstillet.");
  };

  // Progress computation
  const totalPlanExercises = plan ? plan.øvelser.length : 0;
  const completedPlanExercises = plan ? plan.øvelser.filter(pe => completedIds.includes(pe.exercise_id)).length : 0;
  const progressPercent = totalPlanExercises > 0 
    ? Math.round((completedPlanExercises / totalPlanExercises) * 100) 
    : 0;

  // Filtered exercises for catalog
  const filteredExercises = exercises.filter(ex => {
    const catMatch = categoryFilter === 'all' || ex.kategori === categoryFilter;
    const lvlMatch = levelFilter === 'all' || ex.sværhedsgrad === levelFilter;
    return catMatch && lvlMatch;
  });

  const getTodaysExercise = (): Exercise | null => {
    if (!plan || plan.øvelser.length === 0) {
      return exercises[0] || null;
    }
    const incompletePlanEx = plan.øvelser.find(pe => !completedIds.includes(pe.exercise_id));
    if (incompletePlanEx) {
      return exercises.find(e => e.id === incompletePlanEx.exercise_id) || exercises[0];
    }
    return exercises[0];
  };

  const todaysExercise = getTodaysExercise();
  const weekdayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

  // ─────────────────────────────────────────────────────────────
  // Virtual Studio Kit Sound Generator
  // ─────────────────────────────────────────────────────────────
  const studioPads = [
    { label: 'Hi-hat', sub: 'Closed', freq: 800, type: 'square' as OscillatorType },
    { label: 'Hi-hat', sub: 'Open',   freq: 700, type: 'square' as OscillatorType },
    { label: 'Crash',  sub: '16"',    freq: 600, type: 'square' as OscillatorType },
    { label: 'Snare',  sub: 'Center', freq: 200, type: 'triangle' as OscillatorType },
    { label: 'Tom 1',  sub: '10"',    freq: 350, type: 'triangle' as OscillatorType },
    { label: 'Tom 2',  sub: '12"',    freq: 280, type: 'triangle' as OscillatorType },
    { label: 'Floor',  sub: '14"',    freq: 180, type: 'triangle' as OscillatorType },
    { label: 'Ride',   sub: '20"',    freq: 500, type: 'square' as OscillatorType },
    { label: 'Kick',   sub: 'Bass',   freq: 60,  type: 'sine' as OscillatorType },
  ];

  const getVolumeForPad = (label: string): number => {
    const name = label.toLowerCase();
    if (name.includes('kick')) return vols.kick;
    if (name.includes('snare')) return vols.snare;
    if (name.includes('hi-hat') || name.includes('hihat')) return vols.hihat;
    if (name.includes('crash') || name.includes('ride')) return vols.cymbals;
    if (name.includes('tom') || name.includes('floor')) return vols.toms;
    return 70;
  };

  const hitPad = (idx: number) => {
    setActivePads(prev => ({ ...prev, [idx]: Date.now() }));
    setTimeout(() => {
      setActivePads(prev => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }, 240);

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = window.__dkitAudio || (window.__dkitAudio = new AudioCtx());
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const pad = studioPads[idx];
      const volumeLevel = getVolumeForPad(pad.label);
      const vol = volumeLevel / 100;
      const now = ctx.currentTime;

      // Helper to play noise (Snare wires, Hi-hats, Cymbals)
      const playNoise = (decay: number, filterFreq: number, filterType: BiquadFilterType = 'highpass', gainMul: number = 0.25) => {
        const bufferSize = ctx.sampleRate * decay;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;
        
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(gainMul * vol, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        noiseSource.start(now);
        noiseSource.stop(now + decay);
      };

      // Helper to play pitch-swept tone (Kick, Snare body, Toms)
      const playOsc = (startFreq: number, endFreq: number, decay: number, oscType: OscillatorType = 'sine', gainMul: number = 0.35) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = oscType;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + (decay * 0.7));
        
        gainNode.gain.setValueAtTime(gainMul * vol, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + decay);
      };

      const type = pad.label.toLowerCase();
      
      if (type.includes('kick')) {
        playOsc(150, 45, 0.22, 'sine', 0.6);
      } 
      else if (type.includes('snare')) {
        playOsc(180, 100, 0.12, 'triangle', 0.28);
        playNoise(0.18, 1200, 'highpass', 0.3);
      } 
      else if (type.includes('hi-hat') || type.includes('hihat')) {
        const isOpen = pad.sub.toLowerCase().includes('open');
        playNoise(isOpen ? 0.38 : 0.05, 8000, 'highpass', 0.16);
      } 
      else if (type.includes('crash')) {
        playNoise(1.3, 5500, 'highpass', 0.24);
      } 
      else if (type.includes('ride')) {
        playNoise(0.65, 5000, 'highpass', 0.12);
        playOsc(420, 380, 0.45, 'sine', 0.05);
      } 
      else if (type.includes('tom') || type.includes('floor')) {
        const startF = type.includes('floor') ? 110 : type.includes('1') ? 180 : 140;
        const endF = type.includes('floor') ? 65 : type.includes('1') ? 110 : 85;
        playOsc(startF, endF, 0.32, 'sine', 0.4);
      }
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  // Keyboard binds for drum kit (only when on Kit view)
  useEffect(() => {
    if (desktopView !== 'kit' || isMobile) return;
    
    const keyBinds: Record<string, number> = {
      'h': 0, 'g': 1, 'c': 2, 's': 3, 't': 4, 'y': 5, 'f': 6, 'r': 7, 'k': 8, ' ': 8
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      const idx = keyBinds[e.key.toLowerCase()];
      if (idx !== undefined) {
        e.preventDefault();
        hitPad(idx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [desktopView, isMobile, vols]);

  // Metronome engine
  useEffect(() => {
    if (!isMetronomePlaying || isMobile) return;

    const intervalMs = (60 / kitBpm) * 1000;
    let tickCount = 0;

    const triggerClick = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = window.__dkitAudio || (window.__dkitAudio = new AudioCtx());
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        const isDownbeat = tickCount % 4 === 0;
        osc.frequency.value = isDownbeat ? 1000 : 800;
        gainNode.gain.setValueAtTime(isDownbeat ? 0.07 : 0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
        tickCount++;
      } catch (err) {}
    };

    triggerClick();
    const timerId = setInterval(triggerClick, intervalMs);
    return () => clearInterval(timerId);
  }, [isMetronomePlaying, kitBpm, isMobile]);

  // ─────────────────────────────────────────────────────────────
  // AI Coach Dialog Engine
  // ─────────────────────────────────────────────────────────────
  const sendCoachMessage = (customText?: string) => {
    const textToSend = customText || coachInput;
    if (!textToSend.trim()) return;

    const updated = [...coachMessages, { role: 'user', text: textToSend }];
    setCoachMessages(updated);
    setCoachInput('');
    setIsCoachTyping(true);

    // Simulate smart interactive helper responses
    setTimeout(() => {
      setIsCoachTyping(false);
      let replyText = "Det lyder super spændende! Som din AI Coach foreslår jeg, at vi arbejder med subdivisions. Skal vi indstille tempoet til 80 BPM på trommesættet?";
      
      const textLower = textToSend.toLowerCase();
      if (textLower.includes('synkoper')) {
        replyText = "Synkoper opstår, når man accentuerer de slag, som normalt er ubetonede. For eksempel 'og'-slagene i stedet for selve 1, 2, 3 eller 4.\n\nPrøv at tælle højt imens du øver: 1-og-2-og-3-og-4-og, og spil kun hi-hat på 'og'!";
      } else if (textLower.includes('paradiddle')) {
        replyText = "En single paradiddle spilles som:\nH-V-H-H V-H-V-V\n\n(H = Højre hånd, V = Venstre hånd). Den kombinerer to enkeltslag med ét dobbeltslag. Prøv at sætte metronomen til 60 BPM i Studio Kit og spil med!";
      } else if (textLower.includes('dagens øvelse') || textLower.includes('anbefal')) {
        if (todaysExercise) {
          replyText = `Dagens anbefalede lektion til dig er '${todaysExercise.titel}'.\nDen vil passe helt perfekt ind i dit nuværende fokusområde (${plan?.fokustema || 'Koordination'}). Skal vi starte den nu?`;
        } else {
          replyText = "Jeg foreslår, at vi øver Single Stroke Roll lektionen for at styrke dine håndled!";
        }
      }

      setCoachMessages(prev => [...prev, { role: 'ai', text: replyText }]);
    }, 1000);
  };

  // Scale computation for desktop mockup
  const scaleRatio = useFitScale(1440, 900, 20);

  // Return mobile views if width is thin, or render SSR fallback
  if (!mounted || isMobile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, background: 'var(--bg-deep)' }} className="grid-bg">
          <div className="dashboard-grid">
            
            {/* Main Dashboard Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* AI Learning Plan Calendar */}
              <div className="glass-card">
                <div className="calendar-header">
                  <div className="flex align-center gap-2">
                    <CalendarIcon className="text-purple" size={24} />
                    <div>
                      <h2 style={{ fontSize: '1.4rem' }}>Din AI-Læringsplan</h2>
                      {plan && <p style={{ fontSize: '0.85rem' }} className="text-muted-color">{plan.fokustema}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {plan && calendarView === 'week' && (
                      <div className="flex align-center gap-1" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <button 
                          disabled={activeWeek === 1} 
                          onClick={() => setActiveWeek(activeWeek - 1)} 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '0.2rem 0.4rem', border: 'none', background: 'transparent' }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Uge {activeWeek}</span>
                        <button 
                          disabled={activeWeek === 4} 
                          onClick={() => setActiveWeek(activeWeek + 1)} 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '0.2rem 0.4rem', border: 'none', background: 'transparent' }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}

                    <div className="calendar-toggle">
                      <button 
                        onClick={() => setCalendarView('week')} 
                        className={`calendar-toggle-btn ${calendarView === 'week' ? 'active' : ''}`}
                      >
                        Uge
                      </button>
                      <button 
                        onClick={() => setCalendarView('month')} 
                        className={`calendar-toggle-btn ${calendarView === 'month' ? 'active' : ''}`}
                      >
                        Måned
                      </button>
                    </div>
                  </div>
                </div>

                {plan ? (
                  <div>
                    {calendarView === 'week' ? (
                      /* Week View */
                      <div className="calendar-week-grid">
                        {weekdayNames.map((dayName, index) => {
                          const dayNum = index + 1;
                          const planExsForDay = plan.øvelser.filter(pe => pe.dag === dayNum && pe.uge === activeWeek);
                          
                          return (
                            <div 
                              key={dayName} 
                              className={`calendar-day-card ${dayNum === 3 ? 'today' : ''}`}
                            >
                              <div className="calendar-day-name">
                                {dayName} {dayNum === 3 && <span style={{ fontSize: '0.7rem' }}> (I dag)</span>}
                              </div>
                              
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                {planExsForDay.length > 0 ? (
                                  planExsForDay.map(pe => {
                                    const ex = exercises.find(e => e.id === pe.exercise_id);
                                    if (!ex) return null;
                                    
                                    const isCompleted = completedIds.includes(ex.id);
                                    
                                    return (
                                      <div key={pe.exercise_id} style={{ margin: '0.25rem 0' }}>
                                        <Link href={`/exercise/${ex.id}`}>
                                          <div className="calendar-day-content" style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                            {ex.titel}
                                          </div>
                                        </Link>
                                        
                                        <div className="flex justify-between align-center mt-1">
                                          <span className={`badge ${isCompleted ? 'badge-emerald' : 'badge-purple'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                            {isCompleted ? 'Færdig' : `${ex.varighed} min`}
                                          </span>
                                          {!isCompleted && (
                                            <button 
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleSkipExercise(ex.id, dayNum);
                                              }}
                                              className="btn btn-secondary btn-sm" 
                                              style={{ padding: '0.1rem 0.3rem', fontSize: '0.65rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                                              title="Flyt til næste dag"
                                            >
                                              Udsæt
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '0.5rem' }}>
                                    Hviledag
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Month View */
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                          {weekdayNames.map(d => (
                            <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{d.substring(0, 3)}</div>
                          ))}
                        </div>
                        <div className="calendar-month-grid">
                          {Array.from({ length: 28 }).map((_, idx) => {
                            const ugeNum = Math.floor(idx / 7) + 1;
                            const dagNum = (idx % 7) + 1;
                            const hasExercise = plan.øvelser.some(pe => pe.uge === ugeNum && pe.dag === dagNum);
                            const allDone = hasExercise && plan.øvelser
                              .filter(pe => pe.uge === ugeNum && pe.dag === dagNum)
                              .every(pe => completedIds.includes(pe.exercise_id));
                              
                            return (
                              <div 
                                key={idx} 
                                className="calendar-month-day"
                                style={{ 
                                  background: hasExercise ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                                  borderColor: (ugeNum === activeWeek && dagNum === 3) ? 'var(--accent-purple)' : 'var(--border-color)'
                                }}
                              >
                                <span className="calendar-month-number">{idx + 1}</span>
                                {hasExercise && (
                                  <div 
                                    className="calendar-month-indicator"
                                    style={{ background: allDone ? 'var(--accent-emerald)' : 'var(--accent-purple)' }}
                                    title={allDone ? "Gennemført" : "Planlagt øvelse"}
                                  ></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-3" style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dotted var(--border-color)', margin: '1rem 0' }}>
                    <Sparkles size={36} className="text-purple m-auto mb-2" />
                    <h3>Du har ikke oprettet en læringsplan endnu</h3>
                    <p className="mb-2" style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                      Svar på et par hurtige spørgsmål, og lad Claude AI designe en perfekt 4-ugers træningsplan til dig.
                    </p>
                    <Link href="/onboarding" className="btn btn-primary btn-sm">
                      Opret AI-Læringsplan
                    </Link>
                  </div>
                )}
              </div>

              {/* Exercise Catalog (Library) */}
              <div className="glass-card" id="library">
                <div className="flex justify-between align-center mb-2">
                  <div className="flex align-center gap-2">
                    <BookOpen className="text-cyan" size={24} />
                    <h2 style={{ fontSize: '1.4rem' }}>Øvelsesbibliotek</h2>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select 
                      className="form-control" 
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">Alle kategorier</option>
                      <option value="rudiments">Rudiments</option>
                      <option value="groove">Groove</option>
                      <option value="fills">Fills</option>
                      <option value="timing">Timing</option>
                      <option value="koordination">Koordination</option>
                      <option value="stilarter">Stilarter</option>
                    </select>

                    <select 
                      className="form-control" 
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                    >
                      <option value="all">Alle niveauer</option>
                      <option value="begynder">Begynder</option>
                      <option value="mellemniveau">Mellemniveau</option>
                      <option value="øvet">Øvet</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                  {filteredExercises.map(ex => {
                    const isCompleted = completedIds.includes(ex.id);
                    
                    return (
                      <Link href={`/exercise/${ex.id}`} key={ex.id}>
                        <div className="glass-card" style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-card)' }}>
                          <div>
                            <div className="flex justify-between align-center mb-1">
                              <span className="calendar-day-name" style={{ fontSize: '0.7rem' }}>{ex.kategori}</span>
                              {isCompleted && <CheckCircle size={14} className="text-emerald" />}
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }} className="mb-1">{ex.titel}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mb-2">
                              {ex.beskrivelse.substring(0, 60)}...
                            </p>
                          </div>
                          <div className="flex justify-between align-center mt-2">
                            <span className={`badge ${ex.sværhedsgrad === 'begynder' ? 'badge-cyan' : ex.sværhedsgrad === 'mellemniveau' ? 'badge-purple' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                              {ex.sværhedsgrad}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }} className="text-purple flex align-center gap-1">
                              Øv nu <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Sidebar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div className="flex align-center justify-between" style={{ padding: '0.5rem 0 0 0' }}>
                <div className="flex align-center gap-2">
                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--accent-purple)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px var(--accent-purple-glow))' }}>
                    <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6" />
                  </svg>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Hej, Anders</h2>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: '1px solid var(--border-color)', background: 'transparent' }}>
                  <Bell size={18} className="text-muted-color" />
                </button>
              </div>

              {/* Daily Goal */}
              <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>DAGLIGT MÅL</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="3.5"
                      />
                      <path
                        strokeDasharray="75, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--accent-purple)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 4px var(--accent-purple-glow))' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.1rem', fontWeight: 700 }}>
                      75%
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>22 / 30 min</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>Fortsæt det gode arbejde!</p>
                    <Link href="/onboarding" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
                      SE DETALJER &gt;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Continue practice */}
              <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>FORTSÆT HVOR DU SLAP</h3>
                {todaysExercise ? (
                  <Link href={`/exercise/${todaysExercise.id}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Play size={18} fill="white" stroke="white" style={{ marginLeft: '2px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{todaysExercise.titel}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.1rem 0' }}>Lektion {todaysExercise.id.replace('ex-', '')}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <div className="progress-bar-container" style={{ margin: 0, height: '4px', flex: 1 }}>
                            <div className="progress-bar-fill" style={{ width: '60%', background: 'var(--accent-purple)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>60%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ingen aktive lektioner fundet.</p>
                )}
              </div>

              {/* Recommended */}
              <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>ANBEFALEDE TIL DIG</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {exercises.slice(1, 3).map((ex) => (
                    <Link href={`/exercise/${ex.id}`} key={ex.id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }} className="hover-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ color: 'var(--accent-purple)' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6" />
                            </svg>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{ex.titel}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{ex.kategori === 'rudiments' ? 'Forbedr din timing' : 'Udvid dit vokabular'}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-muted-color" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Kid Safe */}
              <div className="glass-card" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }} className="text-muted-color">Børnesikkerhed & Lovgivning</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Overholder den danske lovgivning for børn og unge. Alle YouTube-afspillere kører under <b>youtube-nocookie.com</b> (Privacy-Enhanced Mode) og blokerer eksterne sporingscookies samt reklamer.
                </p>
              </div>

            </div>

          </div>
        </main>

        {/* Mobile floating bottom navigation */}
        <div className="bottom-nav">
          <button onClick={() => router.push('/dashboard')} className="bottom-nav-item active">
            <Home size={20} />
            <span>Hjem</span>
          </button>
          <button onClick={() => {
            const el = document.getElementById('library');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} className="bottom-nav-item">
            <BookOpen size={20} />
            <span>Øvelser</span>
          </button>
          <button onClick={() => router.push('/drumkit')} className="bottom-nav-item">
            <Drum size={20} />
            <span>Trommesæt</span>
          </button>
          <button onClick={() => router.push('/onboarding')} className="bottom-nav-item">
            <User size={20} />
            <span>Profil</span>
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // DESKTOP TABS ROUTING / RENDERS
  // ─────────────────────────────────────────────────────────────
  
  // Track Detail view
  const renderTrackView = (trackId: string) => {
    const track = PRACTICE_TRACKS_STATIC.find(x => x.id === trackId) || PRACTICE_TRACKS_STATIC[0];
    const trackExercises = getExercisesForTrack(trackId, exercises);
    
    const dynamicLessons = trackExercises.map((ex, index) => {
      const isDone = completedIds.includes(ex.id);
      const isActive = trackExercises.find(e => !completedIds.includes(e.id))?.id === ex.id;
      
      let bpm = 92;
      const bpmMatch = ex.beskrivelse.match(/(\d+)\s*BPM/i) || ex.titel.match(/(\d+)\s*BPM/i);
      if (bpmMatch) {
        bpm = parseInt(bpmMatch[1], 10);
      }

      return {
        id: ex.id,
        n: index + 1,
        title: ex.titel,
        dur: `${ex.varighed} min`,
        done: isDone,
        active: isActive,
        locked: false,
        bpm: bpm
      };
    });

    return (
      <div style={{ padding: '28px 48px 60px', color: themeTokens.text, fontFamily: themeTokens.font }}>
        {/* Back navigation */}
        <button onClick={() => setSelectedTrackId(null)} style={{
          background: 'transparent', border: 'none', color: themeTokens.textMuted, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px 6px 0',
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
          fontFamily: themeTokens.font, marginBottom: 16,
        }}><IcBack size={12} /> ØVELSER</button>

        {/* Hero details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, marginBottom: 40 }}>
          <div>
            <DSection t={themeTokens} color={themeTokens.accent}>{track.subtitle}</DSection>
            <DDisplay t={themeTokens} size={56} style={{ marginBottom: 18, lineHeight: 0.95 }}>{track.title}</DDisplay>
            <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 18, color: themeTokens.text, opacity: 0.85, lineHeight: 1.5, maxWidth: 500, marginBottom: 28 }}>
              {track.blurb}
            </div>

            <div style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
              {dynamicLessons.length > 0 ? (
                <Link href={`/exercise/${dynamicLessons[0].id}`}>
                  <DCTA t={themeTokens} icon={<IcPlay size={12} fill color="#fff"/>} size="lg">
                    Start forløb
                  </DCTA>
                </Link>
              ) : (
                <DCTA t={themeTokens} icon={<IcPlay size={12} fill color="#fff"/>} size="lg" onClick={() => alert("Ingen øvelser tilgængelige for dette forløb endnu.")}>
                  Start forløb
                </DCTA>
              )}
              <DCTA t={themeTokens} variant="ghost" size="lg" onClick={() => alert("Forløb gemt i dit bibliotek!")}>Gem</DCTA>
            </div>

            <div style={{ display: 'flex', gap: 28 }}>
              {[
                { icon: <IcClock size={16} />, title: `${dynamicLessons.length} lektioner`, sub: track.level },
                { icon: <IcWave size={16} />, title: 'Interaktive noder', sub: 'Med MIDI support' },
                { icon: <IcTrophy size={16} />, title: 'XP Belønning', sub: 'Tjen op til 500 XP' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    border: `1px solid ${themeTokens.borderStrong}`, color: themeTokens.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{f.icon}</div>
                  <div>
                    <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 16, lineHeight: 1.1 }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: themeTokens.textMuted, marginTop: 2 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Graphical side illustration */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', width: 320, height: 320,
              background: `radial-gradient(circle, ${themeTokens.accentSoft} 0%, transparent 65%)`,
            }} />
            <div style={{ position: 'relative' }}>
              {track.ill === 'snare' ? <IllSnare size={240} color={themeTokens.accent} sw={1.4}/> : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: -10 }}>
                  <IllSticks size={120} color={themeTokens.accent} sw={1.8}/>
                  <IllSnare size={200} color={themeTokens.accent} sw={1.4} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lektionsliste */}
        <DSection t={themeTokens}>Lektioner i forløbet</DSection>
        <DCard t={themeTokens} padding={0}>
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 32px',
            padding: '14px 24px',
            borderBottom: `1px solid ${themeTokens.border}`,
            fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: themeTokens.textMuted,
            alignItems: 'center', gap: 16,
          }}>
            <span>#</span>
            <span>Titel</span>
            <span>Tempo</span>
            <span>Længde</span>
            <span></span>
          </div>
          {dynamicLessons.map((l, i) => (
            <Link key={l.id} href={`/exercise/${l.id}`}>
              <div style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 32px',
                padding: '16px 24px',
                borderBottom: i < dynamicLessons.length - 1 ? `1px solid ${themeTokens.border}` : 'none',
                alignItems: 'center', gap: 16,
                transition: 'background 0.2s',
                cursor: 'pointer'
              }} className="hover-desktop-row">
                <div>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: l.done ? themeTokens.accent : l.active ? themeTokens.accentSoft : 'transparent',
                    border: l.done || l.active ? 'none' : `1px solid ${themeTokens.borderStrong}`,
                    color: l.done ? '#fff' : l.active ? themeTokens.accent : themeTokens.textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: themeTokens.mono, fontSize: 12, fontWeight: 700,
                  }}>
                    {l.done ? <IcCheck size={14} /> : l.locked ? <IcLock size={12} /> : l.n}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 17, lineHeight: 1.15, color: themeTokens.text }}>{l.title}</div>
                  {l.active && <div style={{ marginTop: 4 }}><DPill t={themeTokens} tone="accent">NÆSTE UP · I GANG</DPill></div>}
                </div>
                <div style={{ fontFamily: themeTokens.mono, fontSize: 13, color: themeTokens.text, fontWeight: 500 }}>{l.bpm} <span style={{ color: themeTokens.textMuted, fontSize: 10 }}>BPM</span></div>
                <div style={{ fontFamily: themeTokens.mono, fontSize: 13, color: themeTokens.textMuted }}>{l.dur}</div>
                <div><IcChev size={14} color={themeTokens.textDim} /></div>
              </div>
            </Link>
          ))}
        </DCard>
      </div>
    );
  };

  // Home Dashboard view
  const renderHomeView = () => {
    return (
      <div style={{ padding: '36px 48px 60px', color: themeTokens.text, fontFamily: themeTokens.font }}>
        {/* Header line */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: themeTokens.textMuted, marginBottom: 10 }}>
              ONSDAG · 20. MAJ
            </div>
            <DDisplay t={themeTokens} size={56}>Hej, Anders</DDisplay>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDark(!dark)} style={{
              width: 40, height: 40, borderRadius: '50%', background: 'transparent',
              border: `1px solid ${themeTokens.border}`, color: themeTokens.text, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{dark ? <IcSun size={16} /> : <IcMoon size={16} />}</button>
            <button style={{
              width: 40, height: 40, borderRadius: '50%', background: 'transparent',
              border: `1px solid ${themeTokens.border}`, color: themeTokens.text, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              <IcBell size={16} />
              <div style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: '50%', background: themeTokens.accent }} />
            </button>
          </div>
        </div>

        {/* Hero grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, marginBottom: 28 }}>
          {/* Daily Goal Donut */}
          <DCard t={themeTokens} padding={24} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <RadialProgress size={120} pct={75} color={themeTokens.accent} track={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'} sw={10} t={themeTokens} label="75%" />
            <div style={{ flex: 1 }}>
              <DSection t={themeTokens}>Dagligt mål</DSection>
              <div style={{ fontFamily: themeTokens.mono, fontSize: 16, fontWeight: 600 }}>
                22 <span style={{ color: themeTokens.textMuted, fontWeight: 500 }}>/ 30 min</span>
              </div>
              <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 17, marginTop: 8, color: themeTokens.text, lineHeight: 1.2 }}>
                Fortsæt det gode arbejde
              </div>
            </div>
          </DCard>

          {/* Continue Practice card */}
          <DCard t={themeTokens} padding={0} style={{ overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <DSection t={themeTokens}>Fortsæt hvor du slap</DSection>
                  <DDisplay t={themeTokens} size={28} style={{ marginBottom: 4 }}>
                    {todaysExercise ? todaysExercise.titel : 'Ingen lektioner i gang'}
                  </DDisplay>
                  <div style={{ fontSize: 12, color: themeTokens.textMuted, fontFamily: themeTokens.mono, letterSpacing: 0.5 }}>
                    LEKTION {todaysExercise ? todaysExercise.id.replace('ex-', '') : '0'} · 12 MIN TILBAGE
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: themeTokens.textMuted, marginBottom: 6, fontFamily: themeTokens.mono, fontWeight: 600, letterSpacing: 0.5 }}>
                    <span>FREMSKRIDT</span>
                    <span>60%</span>
                  </div>
                  <DProgress pct={60} t={themeTokens} h={5} />
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    {todaysExercise ? (
                      <Link href={`/exercise/${todaysExercise.id}`}>
                        <DCTA t={themeTokens} icon={<IcPlay size={11} fill color="#fff"/>}>Fortsæt</DCTA>
                      </Link>
                    ) : (
                      <DCTA t={themeTokens} icon={<IcPlay size={11} fill color="#fff"/>}>Fortsæt</DCTA>
                    )}
                    <DCTA t={themeTokens} variant="ghost" onClick={() => { setSelectedTrackId('rytme-timing'); setDesktopView('practice'); }}>Detaljer</DCTA>
                  </div>
                </div>
              </div>
              <div style={{
                width: 220, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: dark ? '#101012' : '#ebe7e0',
                borderLeft: `1px solid ${themeTokens.border}`,
              }}>
                <div style={{
                  position: 'absolute', width: 220, height: 220,
                  background: `radial-gradient(circle, ${themeTokens.accentSoft} 0%, transparent 65%)`,
                }} />
                <div style={{ position: 'relative' }}>
                  <IllSnare size={180} color={themeTokens.accent} sw={1.4}/>
                </div>
              </div>
            </div>
          </DCard>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Streak', value: '12', sub: 'dage i træk', icon: <IcFlame size={16} color={themeTokens.accent} /> },
            { label: 'Denne uge', value: '4t 32m', sub: '6/7 dage', icon: <IcClock size={16} /> },
            { label: 'Niveau', value: 'Niv. 4', sub: '620 / 1000 XP', icon: <IcTrophy size={16} /> },
            { label: 'Forløb', value: `${completedIds.length} / ${exercises.length}`, sub: 'gennemførte noder', icon: <TabPractice size={16} color={themeTokens.text} sw={1.6} /> },
          ].map((s, i) => (
            <DCard key={i} t={themeTokens} padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', border: `1px solid ${themeTokens.borderStrong}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeTokens.text,
                }}>{s.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: themeTokens.textMuted }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 28, marginTop: 10, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: themeTokens.textMuted, marginTop: 4 }}>{s.sub}</div>
            </DCard>
          ))}
        </div>

        {/* Recommended forløb */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <DDisplay t={themeTokens} size={28}>Anbefalede til dig</DDisplay>
            <button onClick={() => setDesktopView('practice')} style={{
              background: 'transparent', border: 'none', color: themeTokens.accent, cursor: 'pointer',
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 4, fontFamily: themeTokens.font,
            }}>Se alle <IcChev size={11} color={themeTokens.accent}/></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {PRACTICE_TRACKS_STATIC.slice(0, 3).map(r => (
              <DCard key={r.id} t={themeTokens} padding={20} onClick={() => { setSelectedTrackId(r.id); setDesktopView('practice'); }} style={{
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -20, right: -30, width: 130, height: 130,
                  background: `radial-gradient(circle, ${themeTokens.accentSoft} 0%, transparent 65%)`,
                }} />
                <div style={{ position: 'absolute', top: 12, right: 14, opacity: 0.5 }}>
                  <IllSticks size={70} color={themeTokens.accent} sw={1.5}/>
                </div>
                <div style={{ position: 'relative', paddingTop: 30 }}>
                  <DSection t={themeTokens} color={themeTokens.accent}>{r.subtitle}</DSection>
                  <DDisplay t={themeTokens} size={24} style={{ marginBottom: 14 }}>{r.title}</DDisplay>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: themeTokens.textMuted, fontFamily: themeTokens.mono, letterSpacing: 0.5 }}>{r.lessonCount} LEKTIONER</span>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: themeTokens.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><IcChev size={12} color="#fff" /></div>
                  </div>
                </div>
              </DCard>
            ))}
          </div>
        </div>

        {/* Recent activity & Videos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {/* Recent activity */}
          <div>
            <DSection t={themeTokens}>Seneste aktivitet (Gennemførte øvelser)</DSection>
            <DCard t={themeTokens} padding={0}>
              {completedIds.length > 0 ? (
                completedIds.slice(0, 4).map((cId, i) => {
                  const ex = exercises.find(e => e.id === cId);
                  if (!ex) return null;
                  return (
                    <div key={cId} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      borderBottom: i < Math.min(completedIds.length, 4) - 1 ? `1px solid ${themeTokens.border}` : 'none',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: themeTokens.accent, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><IcCheck size={14} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.titel}</div>
                        <div style={{ fontSize: 11, color: themeTokens.textMuted, marginTop: 1 }}>{ex.kategori} · {ex.varighed} min</div>
                      </div>
                      <div style={{ fontSize: 10, color: themeTokens.textDim, fontFamily: themeTokens.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Gennemført</div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: themeTokens.textMuted, fontStyle: 'italic', fontSize: 13 }}>
                  Ingen gennemførte øvelser endnu. Kom i gang ovenfor!
                </div>
              )}
            </DCard>
          </div>

          {/* Youtube videos */}
          <div>
            <DSection t={themeTokens}>Anbefalede videoer</DSection>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: 'Sådan holder du stikkerne korrekt', dur: '4:12', author: 'Mikkel Holm' },
                { title: 'Paradiddles fra nul', dur: '7:48', author: 'Sofie Krarup' },
                { title: 'Linear fills i 4/4', dur: '11:02', author: 'Daniel Lund' },
              ].map((v, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: 10,
                  background: themeTokens.surface, border: `1px solid ${themeTokens.border}`, borderRadius: 14, cursor: 'pointer',
                }}>
                  <div style={{
                    width: 76, height: 50, borderRadius: 8, position: 'relative',
                    background: dark ? '#1a1a1c' : '#e8e3da',
                    overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IllSticks size={42} color={themeTokens.accent} sw={1.4}/>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.55)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                    }}><IcPlay size={10} fill color="#fff" /></div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                    <div style={{ fontSize: 11, color: themeTokens.textMuted, marginTop: 2 }}>{v.author} · <span style={{ fontFamily: themeTokens.mono }}>{v.dur}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Practice List view
  const renderPracticeView = () => {
    if (selectedTrackId) {
      return renderTrackView(selectedTrackId);
    }

    return (
      <div style={{ padding: '36px 48px 60px', color: themeTokens.text, fontFamily: themeTokens.font }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <DSection t={themeTokens}>Forløb og lektioner</DSection>
            <DDisplay t={themeTokens} size={48}>Øvelser</DDisplay>
          </div>
        </div>

        {/* Dynamic AI Calendar card inside Exercises tab */}
        <div style={{ marginBottom: 32 }}>
          <DSection t={themeTokens}>Din AI-Plan Kalender</DSection>
          <DCard t={themeTokens} padding={20}>
            {plan ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontFamily: themeTokens.serif, fontStyle: 'italic' }}>{plan.fokustema}</h3>
                    <p style={{ fontSize: '0.8rem', color: themeTokens.textMuted }}>Fremskridt: {progressPercent}% færdiggjort</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4].map(wNum => (
                      <button 
                        key={wNum} 
                        onClick={() => setActiveWeek(wNum)} 
                        style={{
                          width: 32, height: 32, borderRadius: '8px', border: `1px solid ${activeWeek === wNum ? themeTokens.accent : themeTokens.border}`,
                          background: activeWeek === wNum ? themeTokens.accent : 'transparent',
                          color: activeWeek === wNum ? '#fff' : themeTokens.text,
                          fontFamily: themeTokens.mono, fontSize: 12, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        U{wNum}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
                  {weekdayNames.map((dName, idx) => {
                    const dayNum = idx + 1;
                    const dayExs = plan.øvelser.filter(pe => pe.dag === dayNum && pe.uge === activeWeek);

                    return (
                      <div key={dName} style={{ 
                        background: themeTokens.surface2, border: `1px solid ${themeTokens.border}`, 
                        borderRadius: 12, padding: 12, minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: themeTokens.textMuted }}>{dName.toUpperCase()}</div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '8px 0' }}>
                          {dayExs.length > 0 ? (
                            dayExs.map(pe => {
                              const ex = exercises.find(e => e.id === pe.exercise_id);
                              if (!ex) return null;
                              const isCompleted = completedIds.includes(ex.id);
                              return (
                                <Link key={pe.exercise_id} href={`/exercise/${ex.id}`}>
                                  <div style={{ 
                                    fontSize: 12, fontWeight: 600, color: isCompleted ? themeTokens.accent : themeTokens.text,
                                    textDecoration: isCompleted ? 'line-through' : 'none', cursor: 'pointer', lineHeight: 1.25
                                  }}>
                                    {ex.titel}
                                  </div>
                                </Link>
                              );
                            })
                          ) : (
                            <span style={{ fontSize: 11, color: themeTokens.textDim, fontStyle: 'italic' }}>Hviledag</span>
                          )}
                        </div>
                        {dayExs.length > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 9, background: themeTokens.borderStrong, padding: '2px 6px', borderRadius: 4, fontFamily: themeTokens.mono, color: themeTokens.textMuted }}>
                              {dayExs.every(pe => completedIds.includes(pe.exercise_id)) ? 'Færdig' : 'Aktiv'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Link href="/onboarding" style={{ color: themeTokens.accent, fontWeight: 600 }}>Opret din AI-læringsplan her &gt;</Link>
              </div>
            )}
          </DCard>
        </div>

        {/* Practice Tracks */}
        <DSection t={themeTokens}>Redaktionelle forløb</DSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 40 }}>
          {PRACTICE_TRACKS_STATIC.map(tr => (
            <DCard key={tr.id} t={themeTokens} padding={28} onClick={() => setSelectedTrackId(tr.id)} style={{
              position: 'relative', overflow: 'hidden', minHeight: 220,
            }}>
              <div style={{
                position: 'absolute', top: -30, right: -40, width: 220, height: 220,
                background: `radial-gradient(circle, ${themeTokens.accentSoft} 0%, transparent 65%)`,
              }} />
              <div style={{ position: 'absolute', top: 26, right: 26, opacity: 0.6 }}>
                {tr.ill === 'snare' ? <IllSnare size={120} color={themeTokens.accent} sw={1.3}/> : <IllSticks size={100} color={themeTokens.accent} sw={1.5}/>}
              </div>
              <div style={{ position: 'relative', maxWidth: 'calc(100% - 130px)' }}>
                <DSection t={themeTokens} color={themeTokens.accent}>{tr.subtitle}</DSection>
                <DDisplay t={themeTokens} size={32} style={{ marginBottom: 10 }}>{tr.title}</DDisplay>
                <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 14, color: themeTokens.text, opacity: 0.8, lineHeight: 1.5, marginBottom: 18 }}>
                  {tr.blurb}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <DPill t={themeTokens}>{tr.lessonCount} lekt.</DPill>
                  <DPill t={themeTokens}>{tr.level}</DPill>
                  {tr.progress > 0 && <DPill t={themeTokens} tone="accent">{tr.progress}% i gang</DPill>}
                </div>
              </div>
            </DCard>
          ))}
        </div>

        {/* Database Search Filter catalog inside exercises tab */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <DDisplay t={themeTokens} size={28}>Øvelsesbibliotek</DDisplay>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', border: `1px solid ${themeTokens.border}`, background: themeTokens.surface, color: themeTokens.text, outline: 'none' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Alle kategorier</option>
              <option value="rudiments">Rudiments</option>
              <option value="groove">Groove</option>
              <option value="fills">Fills</option>
              <option value="timing">Timing</option>
              <option value="koordination">Koordination</option>
              <option value="stilarter">Stilarter</option>
            </select>

            <select 
              style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', border: `1px solid ${themeTokens.border}`, background: themeTokens.surface, color: themeTokens.text, outline: 'none' }}
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">Alle niveauer</option>
              <option value="begynder">Begynder</option>
              <option value="mellemniveau">Mellemniveau</option>
              <option value="øvet">Øvet</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {filteredExercises.map(ex => {
            const isCompleted = completedIds.includes(ex.id);
            return (
              <Link href={`/exercise/${ex.id}`} key={ex.id}>
                <DCard t={themeTokens} padding={20} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: isCompleted ? 'rgba(93, 211, 158, 0.03)' : themeTokens.surface }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: themeTokens.textMuted, fontWeight: 700 }}>{ex.kategori.toUpperCase()}</span>
                      {isCompleted && <IcCheck size={14} color={themeTokens.good} />}
                    </div>
                    <DDisplay t={themeTokens} size={20} style={{ marginBottom: 8 }}>{ex.titel}</DDisplay>
                    <p style={{ fontSize: 12, color: themeTokens.textMuted, lineHeight: 1.4 }}>{ex.beskrivelse.substring(0, 75)}...</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <DPill t={themeTokens} tone={ex.sværhedsgrad === 'øvet' ? 'accent' : 'default'}>{ex.sværhedsgrad}</DPill>
                    <span style={{ fontSize: 12, fontWeight: 700, color: themeTokens.accent }}>ØV NU &gt;</span>
                  </div>
                </DCard>
              </Link>
            );
          })}
        </div>

      </div>
    );
  };

  // Studio Kit view
  const renderKitView = () => {
    return (
      <div style={{ padding: '28px 48px 60px', color: themeTokens.text, fontFamily: themeTokens.font }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <DSection t={themeTokens} color={themeTokens.accent}>Dit virtuelle trommesæt</DSection>
            <DDisplay t={themeTokens} size={56}>Studio Kit</DDisplay>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => {
              setIsRecording(!isRecording);
              if (!isRecording) {
                console.log("Optagelse startet");
              } else {
                alert("Optagelse gemt i biblioteket!");
              }
            }} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: isRecording ? themeTokens.accent : 'transparent',
              border: `1px solid ${isRecording ? themeTokens.accent : themeTokens.borderStrong}`,
              color: isRecording ? '#fff' : themeTokens.text,
              padding: '10px 16px', borderRadius: 999, cursor: 'pointer',
              fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
              fontFamily: themeTokens.font,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isRecording ? '#fff' : themeTokens.accent }} />
              {isRecording ? 'Stop' : 'Optag'}
            </button>
            <DCTA t={themeTokens} variant="ghost" icon={<IcLoop size={14}/>} onClick={() => alert("Eksporterer MIDI-fil...")}>Eksport</DCTA>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
          {/* Center drum layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DCard t={themeTokens} padding={0} style={{ position: 'relative', overflow: 'hidden', height: 280 }}>
              <div style={{
                position: 'absolute', width: 400, height: 400,
                background: `radial-gradient(circle, ${themeTokens.accentSoft} 0%, transparent 65%)`,
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IllKit size={420} color={themeTokens.accent} sw={1.4}/>
              </div>
              <div style={{ position: 'absolute', top: 18, left: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: themeTokens.good }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: themeTokens.textMuted }}>Live Synth</span>
              </div>
              <div style={{ position: 'absolute', top: 18, right: 22, fontFamily: themeTokens.mono, fontSize: 13, color: themeTokens.accent, fontWeight: 700 }}>
                {isRecording ? '● OPTAGER' : ''}
              </div>
              <div style={{ position: 'absolute', bottom: 18, left: 22, fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 18, whiteSpace: 'nowrap' }}>
                {selectedKit} Kit
              </div>
              <div style={{ position: 'absolute', bottom: 18, right: 22, fontFamily: themeTokens.mono, fontSize: 11, color: themeTokens.textMuted, letterSpacing: 0.5 }}>
                4-PIECE · SHELLS SYNTH
              </div>
            </DCard>

            {/* Pads grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {studioPads.map((p, i) => {
                const isActive = activePads[i];
                return (
                  <button key={i} onMouseDown={() => hitPad(i)} onTouchStart={() => hitPad(i)} style={{
                    height: 96, borderRadius: 16,
                    background: isActive ? themeTokens.accent : themeTokens.surface,
                    border: `1px solid ${isActive ? themeTokens.accent : themeTokens.border}`,
                    color: isActive ? '#fff' : themeTokens.text, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontFamily: themeTokens.font, transition: 'all 0.08s ease-out',
                    transform: isActive ? 'scale(0.96)' : 'scale(1)',
                    boxShadow: isActive ? `0 0 32px ${themeTokens.accent}66` : 'none',
                    padding: 0, position: 'relative',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.7 }}>{p.sub}</div>
                    <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 24, marginTop: 4, lineHeight: 1 }}>{p.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Transport (Metronome control) */}
            <DCard t={themeTokens} padding={16} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => setIsMetronomePlaying(!isMetronomePlaying)} style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: isMetronomePlaying ? themeTokens.accent : themeTokens.surface2,
                  border: 'none', color: isMetronomePlaying ? '#fff' : themeTokens.text, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><IcMetro size={18} /></button>
                <div>
                  <div style={{ fontFamily: themeTokens.mono, fontSize: 22, fontWeight: 600 }}>{kitBpm}</div>
                  <div style={{ fontSize: 9, color: themeTokens.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>BPM</div>
                </div>
                <input type="range" min={40} max={220} value={kitBpm} onChange={e => setKitBpm(+e.target.value)} style={{
                  width: 220, accentColor: themeTokens.accent,
                }}/>
              </div>
              <div style={{ fontFamily: themeTokens.mono, fontSize: 11, color: themeTokens.textMuted, letterSpacing: 0.5 }}>
                TASTATUR: H · G · C · S · T · Y · F · R · SPACE
              </div>
            </DCard>
          </div>

          {/* Mixer and kit choice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <DCard t={themeTokens} padding={20}>
              <DSection t={themeTokens}>Mixer</DSection>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { id: 'kick', label: 'Kick' },
                  { id: 'snare', label: 'Snare' },
                  { id: 'hihat', label: 'Hi-hat' },
                  { id: 'toms', label: 'Toms' },
                  { id: 'cymbals', label: 'Cymbals' },
                ].map(ch => (
                  <div key={ch.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                      <span style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 14 }}>{ch.label}</span>
                      <span style={{ fontFamily: themeTokens.mono, color: themeTokens.textMuted, fontSize: 11 }}>{vols[ch.id]}</span>
                    </div>
                    <input type="range" min={0} max={100} value={vols[ch.id]}
                      onChange={e => setVols(v => ({ ...v, [ch.id]: +e.target.value }))}
                      style={{ width: '100%', accentColor: themeTokens.accent }} />
                  </div>
                ))}
              </div>
            </DCard>

            <DCard t={themeTokens} padding={20}>
              <DSection t={themeTokens}>Sæt-type</DSection>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Maple Studio', sub: 'Naturlig' },
                  { name: 'Vintage Birch', sub: 'Varm' },
                  { name: 'Punch Steel', sub: 'Aggressiv' },
                  { name: 'Jazz Brushwork', sub: 'Subtil' },
                ].map((k, i) => {
                  const isActive = selectedKit === k.name;
                  return (
                    <div key={i} onClick={() => setSelectedKit(k.name)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      background: isActive ? themeTokens.accentSoft : 'transparent',
                      border: `1px solid ${isActive ? themeTokens.accent : themeTokens.border}`,
                      borderRadius: 12, cursor: 'pointer',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        border: isActive ? 'none' : `1px solid ${themeTokens.borderStrong}`,
                        background: isActive ? themeTokens.accent : 'transparent',
                        color: isActive ? '#fff' : themeTokens.textMuted,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{isActive ? <IcCheck size={13} /> : <TabKit size={14} color={themeTokens.textMuted} sw={1.5}/>}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{k.name}</div>
                        <div style={{ fontSize: 10, color: themeTokens.textMuted, marginTop: 1, letterSpacing: 0.5 }}>{k.sub.toUpperCase()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DCard>
          </div>
        </div>
      </div>
    );
  };

  // Library view
  const renderLibraryView = () => {
    return (
      <div style={{ padding: '36px 48px 60px', color: themeTokens.text, fontFamily: themeTokens.font }}>
        <DSection t={themeTokens}>Gemte ressourcer</DSection>
        <DDisplay t={themeTokens} size={48} style={{ marginBottom: 28 }}>Bibliotek</DDisplay>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { tag: 'NODER', title: 'Basic Rock Groove', sub: '4/4 · 92 BPM' },
            { tag: 'NODER', title: 'Half-time Shuffle', sub: '4/4 · 84 BPM' },
            { tag: 'VIDEO', title: 'Paradiddles fra nul', sub: '7:48 · Sofie Krarup' },
            { tag: 'VIDEO', title: 'Linear fills i 4/4', sub: '11:02 · Daniel Lund' },
            { tag: 'OPTAGELSE', title: 'Take 04 — 16-dele', sub: '2:18 · I går' },
            { tag: 'OPTAGELSE', title: 'Take 02 — Ghost notes', sub: '1:55 · 2 dage' },
          ].map((it, i) => (
            <DCard key={i} t={themeTokens} padding={20} style={{ cursor: 'pointer' }}>
              <DSection t={themeTokens} color={themeTokens.accent}>{it.tag}</DSection>
              <DDisplay t={themeTokens} size={20} style={{ marginBottom: 8 }}>{it.title}</DDisplay>
              <div style={{ fontSize: 11, color: themeTokens.textMuted, fontFamily: themeTokens.mono, letterSpacing: 0.5 }}>{it.sub.toUpperCase()}</div>
            </DCard>
          ))}
        </div>
      </div>
    );
  };

  // Profile view
  const renderProfileView = () => {
    return (
      <div style={{ padding: '36px 48px 60px', color: themeTokens.text, fontFamily: themeTokens.font }}>
        {/* Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 32 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', background: themeTokens.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 48,
            boxShadow: '0 14px 38px rgba(239,90,58,0.45)',
          }}>AL</div>
          <div style={{ flex: 1 }}>
            <DSection t={themeTokens} color={themeTokens.accent}>Niveau 4 · Intermediate · Pro</DSection>
            <DDisplay t={themeTokens} size={56}>Anders Lind</DDisplay>
            <div style={{ marginTop: 16, maxWidth: 360 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: themeTokens.textMuted, marginBottom: 6, fontFamily: themeTokens.mono, fontWeight: 600, letterSpacing: 0.5 }}>
                <span>NIV 4</span>
                <span>620 / 1000 XP</span>
                <span>NIV 5</span>
              </div>
              <DProgress pct={62} t={themeTokens} h={6} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DCTA t={themeTokens} variant="ghost" onClick={() => alert("Profil-redigering åbner snart!")}>Rediger profil</DCTA>
            <DCTA t={themeTokens} onClick={() => alert("Delingslink kopieret til udklipsholderen!")}>Del</DCTA>
          </div>
        </div>

        {/* Profile Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
          {[
            { icon: <IcFlame size={16} color={themeTokens.accent} />, value: '12', label: 'Dage streak' },
            { icon: <IcClock size={16} />, value: '48t', label: 'Total øvetid' },
            { icon: <IcCalendar size={16} />, value: '34/60', label: 'Aktive dage' },
            { icon: <IcTrophy size={16} />, value: `${completedIds.length}`, label: 'Færdige noder' },
          ].map((s, i) => (
            <DCard key={i} t={themeTokens} padding={20}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', border: `1px solid ${themeTokens.borderStrong}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeTokens.text,
                }}>{s.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: themeTokens.textMuted }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 40, marginTop: 12, lineHeight: 1 }}>{s.value}</div>
            </DCard>
          ))}
        </div>

        {/* Heatmap & Settings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          {/* Heatmap activity */}
          <div>
            <DSection t={themeTokens}>Aktivitet — sidste 12 uger</DSection>
            <DCard t={themeTokens} padding={24}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
                {Array.from({ length: 84 }).map((_, i) => {
                  const v = ((Math.sin(i * 2.4) + Math.cos(i * 1.7)) + 2) / 4;
                  const intensity = i < 4 ? 0 : v;
                  const op = intensity < 0.2 ? 0.06 : intensity < 0.4 ? 0.25 : intensity < 0.65 ? 0.55 : 0.95;
                  return (
                    <div key={i} style={{
                      aspectRatio: '1', borderRadius: 4,
                      background: intensity < 0.05 ? themeTokens.surface2 : themeTokens.accent,
                      opacity: intensity < 0.05 ? 1 : op,
                    }} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 11, color: themeTokens.textMuted, fontFamily: themeTokens.mono, letterSpacing: 0.5 }}>FEB 2026 — MAJ 2026</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: themeTokens.textMuted, fontFamily: themeTokens.mono, letterSpacing: 0.5 }}>
                  <span>MIN</span>
                  {[0.1, 0.3, 0.55, 0.85].map((op, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: themeTokens.accent, opacity: op }}/>
                  ))}
                  <span>MAX</span>
                </div>
              </div>
            </DCard>

            <div style={{ marginTop: 28 }}>
              <DSection t={themeTokens}>Mærker</DSection>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {[
                  { icon: <IcFlame size={22} />, label: '7 dage', earned: true },
                  { icon: <IcTrophy size={22} />, label: 'Niv. 4', earned: true },
                  { icon: <IcWave size={22} />, label: 'Groove', earned: true },
                  { icon: <IcMic size={22} />, label: 'Optag', earned: true },
                  { icon: <IcLock size={20} />, label: 'Speed', earned: false },
                  { icon: <IcLock size={20} />, label: 'Polyrytme', earned: false },
                ].map((b, i) => (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: 14, background: themeTokens.surface,
                    border: `1px solid ${themeTokens.border}`, display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 6, opacity: b.earned ? 1 : 0.4,
                  }}>
                    <div style={{ color: b.earned ? themeTokens.accent : themeTokens.textDim }}>{b.icon}</div>
                    <div style={{ fontSize: 10, color: themeTokens.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings / resetting database option */}
          <div>
            <DSection t={themeTokens}>Indstillinger</DSection>
            <DCard t={themeTokens} padding={0}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                borderBottom: `1px solid ${themeTokens.border}`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', border: `1px solid ${themeTokens.borderStrong}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{dark ? <IcMoon size={14} /> : <IcSun size={14} />}</div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Mørkt tema</div>
                <button onClick={() => setDark(!dark)} style={{
                  width: 46, height: 26, borderRadius: 999, position: 'relative',
                  background: dark ? themeTokens.accent : themeTokens.surface2,
                  border: 'none', cursor: 'pointer',
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: dark ? 22 : 2, transition: 'left 0.2s',
                    width: 22, height: 22, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  }} />
                </button>
              </div>
              
              <div onClick={handleResetDatabase} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                borderBottom: `1px solid ${themeTokens.border}`,
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', border: `1px solid ${themeTokens.borderStrong}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeTokens.accent,
                }}><RefreshCw size={14} /></div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: themeTokens.accent }}>Nulstil Database</div>
                <IcChev size={14} color={themeTokens.textDim} />
              </div>

              {[
                { icon: <IcBell size={14} />, label: 'Notifikationer', detail: 'Hver dag kl. 18' },
                { icon: <IcMetro size={14} />, label: 'Standard metronom', detail: '92 BPM' },
                { icon: <IcUser size={14} />, label: 'Konto', detail: 'Pro' },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                  borderBottom: 'none',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', border: `1px solid ${themeTokens.borderStrong}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeTokens.text,
                  }}>{s.icon}</div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{s.label}</div>
                  {s.detail && <span style={{ fontSize: 12, color: themeTokens.textMuted }}>{s.detail}</span>}
                  <IcChev size={14} color={themeTokens.textDim} />
                </div>
              ))}
            </DCard>
          </div>
        </div>
      </div>
    );
  };

  // Find active main panel content based on routing
  let activeMainPanelContent;
  if (desktopView === 'home') {
    activeMainPanelContent = renderHomeView();
  } else if (desktopView === 'practice') {
    activeMainPanelContent = renderPracticeView();
  } else if (desktopView === 'kit') {
    activeMainPanelContent = renderKitView();
  } else if (desktopView === 'library') {
    activeMainPanelContent = renderLibraryView();
  } else if (desktopView === 'profile') {
    activeMainPanelContent = renderProfileView();
  }

  // Sidebar item list
  const sidebarItems = [
    { id: 'home', label: 'Hjem', Icon: TabHome },
    { id: 'practice', label: 'Øvelser', Icon: TabPractice },
    { id: 'kit', label: 'Trommesæt', Icon: TabKit },
    { id: 'library', label: 'Bibliotek', Icon: IcBook },
    { id: 'profile', label: 'Profil', Icon: TabUser },
  ] as const;

  // Determine if coach panel is hidden (hide on Kit view to allow mixer view room)
  const isCoachPanelHidden = desktopView === 'kit' && !selectedTrackId;

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#040404', 
      padding: '20px', 
      overflow: 'hidden' 
    }}>
      <div style={{ 
        transform: `scale(${scaleRatio})`, 
        transformOrigin: 'center center',
        transition: 'transform 0.1s ease-out'
      }}>
        <div style={{
          width: 1440, height: 900, borderRadius: 14, overflow: 'hidden',
          background: themeTokens.bg, color: themeTokens.text,
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
          fontFamily: themeTokens.font, display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Top MacOS Window Bar */}
          <TitleBar t={themeTokens} />

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Sidebar Navigation */}
            <div style={{
              width: 248, height: '100%', flexShrink: 0,
              background: themeTokens.sidebar,
              borderRight: `1px solid ${themeTokens.border}`,
              display: 'flex', flexDirection: 'column',
              padding: '20px 16px 16px',
            }}>
              {/* Wordmark */}
              <div style={{ padding: '4px 8px 22px' }}>
                <div style={{
                  fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 24,
                  letterSpacing: -0.5, color: themeTokens.text, display: 'flex', alignItems: 'baseline',
                }}>
                  DrumLab<span style={{ color: themeTokens.accent, fontStyle: 'normal' }}>.</span>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{
                background: themeTokens.surface, border: `1px solid ${themeTokens.border}`,
                borderRadius: 12, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 22,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={themeTokens.textDim} strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
                </svg>
                <input 
                  placeholder="Søg lektioner, sange…" 
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: themeTokens.text, fontFamily: themeTokens.font, fontSize: 13,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      alert(`Søger efter: "${(e.target as HTMLInputElement).value}"...`);
                    }
                  }}
                />
                <span style={{
                  fontFamily: themeTokens.mono, fontSize: 10, color: themeTokens.textDim,
                  padding: '2px 6px', borderRadius: 4, border: `1px solid ${themeTokens.border}`,
                }}>⌘K</span>
              </div>

              {/* Navigation Menu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sidebarItems.map(it => {
                  const active = desktopView === it.id;
                  return (
                    <button 
                      key={it.id} 
                      onClick={() => {
                        setSelectedTrackId(null);
                        setDesktopView(it.id);
                      }} 
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                        background: active ? themeTokens.accentSoft : 'transparent',
                        border: 'none', borderRadius: 10, cursor: 'pointer',
                        color: active ? themeTokens.accent : themeTokens.text, fontFamily: themeTokens.font,
                        fontSize: 14, fontWeight: active ? 600 : 500, textAlign: 'left',
                        outline: 'none', width: '100%'
                      }}
                    >
                      <it.Icon size={18} color={active ? themeTokens.accent : themeTokens.textMuted} sw={active ? 1.8 : 1.5} />
                      <span style={{ flex: 1 }}>{it.label}</span>
                      {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: themeTokens.accent }} />}
                    </button>
                  );
                })}
              </div>

              <div style={{ flex: 1 }} />

              {/* "I Gang" lesson overview widget */}
              <div style={{
                background: themeTokens.surface, border: `1px solid ${themeTokens.border}`, borderRadius: 14,
                padding: 14, marginBottom: 12,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: themeTokens.textMuted }}>I gang</div>
                <div style={{ fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 16, marginTop: 6, lineHeight: 1.15 }}>
                  {todaysExercise ? todaysExercise.titel : 'Ingen aktive lektioner'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: themeTokens.textMuted, fontFamily: themeTokens.mono, fontWeight: 600 }}>
                  <span>LEKTION {todaysExercise ? todaysExercise.id.replace('ex-', '') : '0'}</span>
                  <span>60%</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <DProgress pct={60} t={themeTokens} h={3} />
                </div>
              </div>

              {/* User Chip */}
              <div 
                onClick={() => setDesktopView('profile')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: 8,
                  borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s'
                }}
                className="hover-user-chip"
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: themeTokens.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontFamily: themeTokens.serif, fontStyle: 'italic', fontSize: 14,
                }}>AL</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Anders Lind</div>
                  <div style={{ fontSize: 11, color: themeTokens.textMuted }}>Niveau 4 · Pro</div>
                </div>
                <IcChev size={12} color={themeTokens.textDim} />
              </div>
            </div>

            {/* Main scrollable Viewport Panel */}
            <div style={{ flex: 1, overflow: 'auto', background: themeTokens.bg, position: 'relative' }}>
              {activeMainPanelContent}
            </div>

            {/* Right Collapsible AI Coach panel */}
            {!isCoachPanelHidden && (
              <>
                {coachOpen ? (
                  <div style={{
                    width: 380, height: '100%', flexShrink: 0,
                    background: themeTokens.bg, borderLeft: `1px solid ${themeTokens.border}`,
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {/* Coach header info */}
                    <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${themeTokens.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: themeTokens.accent, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(239,90,58,0.35)',
                      }}><IcSpark size={18} color="#fff" /></div>
                      <div style={{ flex: 1 }}>
                        <DDisplay t={themeTokens} size={20}>AI Coach</DDisplay>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: themeTokens.good }} />
                          <span style={{ fontSize: 11, color: themeTokens.textMuted }}>Online · husker dit niveau</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setCoachOpen(false)} 
                        style={{
                          width: 32, height: 32, borderRadius: '50%', background: 'transparent',
                          border: `1px solid ${themeTokens.border}`, color: themeTokens.textMuted, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
                          <path d="M6 6l12 12M6 18L18 6"/>
                        </svg>
                      </button>
                    </div>

                    {/* Chat scroll content */}
                    <div ref={coachScrollRef} style={{ flex: 1, overflow: 'auto', padding: '18px 20px' }}>
                      {coachMessages.map((m, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                          <div style={{
                            maxWidth: '85%',
                            padding: '11px 14px', borderRadius: 18,
                            borderBottomRightRadius: m.role === 'user' ? 6 : 18,
                            borderBottomLeftRadius: m.role === 'ai' ? 6 : 18,
                            background: m.role === 'user' ? themeTokens.accent : themeTokens.surface,
                            color: m.role === 'user' ? '#fff' : themeTokens.text,
                            border: m.role === 'ai' ? `1px solid ${themeTokens.border}` : 'none',
                            fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                          }}>{m.text}</div>
                        </div>
                      ))}
                      {isCoachTyping && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                          <div style={{
                            padding: '11px 18px', borderRadius: 18, borderBottomLeftRadius: 6,
                            background: themeTokens.surface, border: `1px solid ${themeTokens.border}`,
                            color: themeTokens.textMuted, fontSize: 13.5
                          }}>
                            Skriver...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat quick suggestions list */}
                    <div style={{ padding: '8px 16px 4px', display: 'flex', gap: 6, overflowX: 'auto' }}>
                      {['Forklar synkoper', 'Vis paradiddle', 'Dagens øvelse'].map((s, i) => (
                        <button key={i} onClick={() => sendCoachMessage(s)} style={{
                          flexShrink: 0, padding: '6px 11px', borderRadius: 999,
                          background: 'transparent', border: `1px solid ${themeTokens.border}`,
                          color: themeTokens.textMuted, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                          fontFamily: themeTokens.font, whiteSpace: 'nowrap', outline: 'none'
                        }}>{s}</button>
                      ))}
                    </div>

                    {/* Chat Input form area */}
                    <div style={{ padding: '10px 16px 16px' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: themeTokens.surface, border: `1px solid ${themeTokens.border}`,
                        borderRadius: 999, padding: '4px 4px 4px 14px',
                      }}>
                        <input
                          value={coachInput}
                          onChange={e => setCoachInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendCoachMessage()}
                          placeholder="Stil et spørgsmål…"
                          style={{
                            flex: 1, border: 'none', outline: 'none', background: 'transparent',
                            fontFamily: themeTokens.font, fontSize: 13.5, color: themeTokens.text, padding: '8px 0',
                          }}
                        />
                        <button 
                          onClick={() => sendCoachMessage()} 
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: coachInput.trim() ? themeTokens.accent : themeTokens.surface2,
                            border: 'none', color: coachInput.trim() ? '#fff' : themeTokens.textDim,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none'
                          }}
                        >
                          <IcSend size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Floating circular spark icon when closed */
                  <div style={{
                    position: 'absolute', right: 24, bottom: 24, zIndex: 10
                  }}>
                    <button onClick={() => setCoachOpen(true)} style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: themeTokens.accent, border: 'none', color: '#fff', cursor: 'pointer',
                      boxShadow: '0 10px 28px rgba(239,90,58,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none'
                    }}>
                      <IcSpark size={22} color="#fff" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
