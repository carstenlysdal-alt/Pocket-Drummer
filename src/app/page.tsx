'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  IcHome, IcSpark, IcUser, IcPlay, IcBack, IcChev, IcCheck, IcLock,
  IcSun, IcMoon, IcSend, IcFlame, IcClock, IcTrophy,
  TabKit, TabPractice, IllSnare, IllSticks, DrumNotation,
  IcLoop, IcMin,
} from '@/components/DesktopIcons';
import {
  getUserPlan, getCompletedExercises,
  getPremiumStatus, setPremiumStatus, resetMockDatabase,
  UserPlan,
} from '@/lib/mockData';
import {
  LEVELS, MODULES, PILLARS,
} from '@/lib/curriculum';
import { useAuth } from '@/lib/authContext';
import { useLanguage } from '@/lib/languageContext';
import TiltCard from '@/components/TiltCard';


// ─── DESIGN TOKENS ────────────────────────────────────────────
interface T {
  bg: string; sidebar: string; surface: string; surface2: string;
  surfaceElev: string; border: string; borderStrong: string;
  text: string; textMuted: string; textDim: string;
  accent: string; accentDeep: string; accentSoft: string; accentText: string;
  good: string; goodSoft: string; mono: string; font: string; serif: string;
}
const mkT = (dark = true): T => ({
  bg: dark ? '#0a0a0a' : '#FAF8F5',
  sidebar: dark ? '#0e0e10' : '#F3EFE7',
  surface: dark ? '#141416' : '#ffffff',
  surface2: dark ? '#1c1c1f' : '#EBE6DC',
  surfaceElev: dark ? '#212124' : '#ffffff',
  border: dark ? 'rgba(255,255,255,0.06)' : 'rgba(37,37,37,0.08)',
  borderStrong: dark ? 'rgba(255,255,255,0.13)' : 'rgba(37,37,37,0.14)',
  text: dark ? '#FAF8F5' : '#252525',
  textMuted: dark ? '#8a8580' : '#77716B',
  textDim: dark ? '#56524c' : '#A39C94',
  accent: '#F25545',
  accentDeep: '#C43425',
  accentSoft: dark ? 'rgba(242,85,69,0.13)' : 'rgba(242,85,69,0.08)',
  accentText: dark ? '#f5b8a8' : '#C43425',
  good: '#5dd39e',
  goodSoft: dark ? 'rgba(93,211,158,0.14)' : 'rgba(93,211,158,0.14)',
  mono: 'var(--font-mono, monospace)',
  font: 'var(--font-sans, sans-serif)',
  serif: 'var(--font-serif, Georgia, serif)',
});

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────
const Sect = ({ children, t, color, style = {} }: { children: React.ReactNode; t: T; color?: string; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: t.font, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: color || t.textMuted, marginBottom: 14, ...style }}>{children}</div>
);

const Card = ({ children, t, style = {}, onClick, pad = 24, className }: { children: React.ReactNode; t: T; style?: React.CSSProperties; onClick?: () => void; pad?: number; className?: string }) => (
  <div onClick={onClick} className={className} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: pad, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.2s', ...style }}>
    {children}
  </div>
);

const Display = ({ children, t, size = 36, style = {} }: { children: React.ReactNode; t: T; size?: number; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: size, lineHeight: 1.05, color: t.text, letterSpacing: -0.5, ...style }}>{children}</div>
);

const Prog = ({ pct, t, h = 5, color }: { pct: number; t: T; h?: number; color?: string }) => (
  <div style={{ width: '100%', height: h, background: t.surface2, borderRadius: 999, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color || t.accent, borderRadius: 999, transition: 'width 0.4s ease' }} />
  </div>
);

const Btn = ({ children, t, onClick, variant = 'primary', icon, size = 'md', wide = false, disabled = false }: {
  children: React.ReactNode; t: T; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; wide?: boolean; disabled?: boolean;
}) => {
  const s = { sm: { p: '7px 16px', fs: 11, ls: 1.4 }, md: { p: '12px 22px', fs: 12, ls: 1.6 }, lg: { p: '15px 28px', fs: 13, ls: 1.8 } }[size];
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      padding: s.p, borderRadius: 999, width: wide ? '100%' : 'auto',
      background: variant === 'primary' ? t.accent : variant === 'ghost' ? 'transparent' : t.surface2,
      color: variant === 'primary' ? '#fff' : t.text,
      border: variant === 'primary' ? 'none' : variant === 'ghost' ? 'none' : `1px solid ${t.borderStrong}`,
      fontFamily: t.font, fontSize: s.fs, fontWeight: 700, letterSpacing: s.ls, textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
      boxShadow: variant === 'primary' ? '0 6px 22px rgba(239,90,58,0.30)' : 'none',
      opacity: disabled ? 0.4 : 1, transition: 'opacity 0.15s, transform 0.1s',
    }}>
      {icon}{children}
    </button>
  );
};

const Badge = ({ children, t, tone = 'default' }: { children: React.ReactNode; t: T; tone?: 'accent' | 'good' | 'default' }) => {
  const c = tone === 'accent' ? { bg: t.accentSoft, fg: t.accentText } : tone === 'good' ? { bg: t.goodSoft, fg: t.good } : { bg: t.surface2, fg: t.textMuted };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.fg, padding: '4px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: t.font, letterSpacing: 0.4 }}>{children}</span>;
};

// ─── EXERCISE PROGRESS ────────────────────────────────────────
const PROGRESS_KEY = 'pocketdrummer_exercise_progress';
interface ExerciseProgressItem { openedAt: number; completedAt?: number }
function useExerciseProgress() {
  const [progress, setProgress] = React.useState<Record<string, ExerciseProgressItem>>({});
  useEffect(() => {
    try { const s = localStorage.getItem(PROGRESS_KEY); if (s) setProgress(JSON.parse(s)); } catch {}
  }, []);
  const save = (next: Record<string, ExerciseProgressItem>) => {
    setProgress(next);
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch {}
  };
  const markOpened = (key: string) => {
    setProgress(prev => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: { openedAt: Date.now() } };
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const markCompleted = (key: string) => {
    setProgress(prev => {
      const next = { ...prev, [key]: { ...(prev[key] || { openedAt: Date.now() }), completedAt: Date.now() } };
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const isCompleted = (key: string) => !!progress[key]?.completedAt;
  return { markOpened, markCompleted, isCompleted, save };
}

// ─── EXERCISE DETAIL MODAL ────────────────────────────────────
interface ExerciseDetailData {
  key: string;
  title: string;
  sub: string;
  level: string;
  bpm: number | string;
  tags?: string[];
  videoId?: string;
}

const COACH_MESSAGES: Record<string, { praise: string; next: string }> = {
  Begynder: {
    praise: 'Flot arbejde — du har taget det første vigtige skridt. Regelmæssighed slår hurtigt alt andet.',
    next: 'Nu er grundmønsteret siddet fast. Det næste trin bygger videre på præcis den kontrol, du lige har trænet — lad tempoet stige naturligt.',
  },
  Mellemniveau: {
    praise: 'Stærkt — du er i gang med at konsolidere teknikkerne og mærke det i kroppen. Det er her, det virkelig begynder at sidde.',
    next: 'Med det fundament du har nu, er du klar til at arbejde med finere detaljer. Det næste trin handler om kvalitet frem for hastighed.',
  },
  Øvet: {
    praise: 'Imponerende — det her niveau kræver fokus og tålmodighed, og du leverer begge dele.',
    next: 'Næste øvelse introducerer et nyt lag af kompleksitet. Tag det roligt og lad kroppen absorbere det — din teknik er klar til det.',
  },
};

function getCoachMessage(level: string) {
  const key = level.includes('Begynder') || level.includes('0') || level.includes('1') ? 'Begynder'
    : level.includes('Mellemniveau') || level.includes('2') || level.includes('3') ? 'Mellemniveau'
    : 'Øvet';
  return COACH_MESSAGES[key];
}

function ExerciseDetailModal({ t, ex, nextExercise, onNavigateNext, onClose }: {
  t: T;
  ex: ExerciseDetailData;
  nextExercise?: ExerciseDetailData;
  onNavigateNext?: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState<'noder' | 'video'>('noder');
  const [bpm, setBpm] = React.useState(typeof ex.bpm === 'number' ? ex.bpm : 90);
  const [metroPlaying, setMetroPlaying] = React.useState(false);
  const [currentBeat, setCurrentBeat] = React.useState(0);
  const [justCompleted, setJustCompleted] = React.useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const { markCompleted, isCompleted } = useExerciseProgress();
  const done = isCompleted(ex.key);
  const coach = getCoachMessage(ex.level);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  useEffect(() => {
    if (!metroPlaying) return;
    const interval = setInterval(() => {
      setCurrentBeat(prev => {
        const next = (prev + 1) % 4;
        try {
          const ctx = getAudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(next === 0 ? 1000 : 600, ctx.currentTime);
          gain.gain.setValueAtTime(next === 0 ? 0.2 : 0.09, ctx.currentTime);
          osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.stop(ctx.currentTime + 0.06);
        } catch {}
        return next;
      });
    }, (60 / bpm) * 1000);
    return () => clearInterval(interval);
  }, [metroPlaying, bpm]);

  useEffect(() => () => { audioCtxRef.current?.close(); }, []);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 840, maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: t.surface, borderRadius: 20, border: `1px solid ${t.borderStrong}`, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontFamily: t.mono, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{ex.level}</span>
              {done && <span style={{ fontSize: 10, fontFamily: t.mono, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: t.goodSoft, color: t.good }}>FÆRDIG</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: t.surface2, border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11"/></svg>
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
          {(['noder', 'video'] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              padding: '11px 24px', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === tb ? t.accent : 'transparent'}`,
              cursor: 'pointer', fontFamily: t.font, fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: tab === tb ? t.accent : t.textMuted, transition: 'color 0.15s',
            }}>{tb === 'noder' ? 'Noder' : 'Video'}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {tab === 'noder' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', background: '#FAF8F5', border: `1px solid ${t.border}`, padding: '24px 16px' }}>
                <DrumNotation color="#16161a" width={740} accent={t.accent} active={metroPlaying ? currentBeat : -1} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setBpm(b => Math.max(40, b - 5))} style={{ width: 32, height: 32, borderRadius: '50%', background: t.surface2, border: `1px solid ${t.border}`, cursor: 'pointer', color: t.text, fontSize: 16 }}>−</button>
                  <span style={{ fontFamily: t.mono, fontSize: 13, fontWeight: 700, color: t.text, minWidth: 64, textAlign: 'center' }}>{bpm} BPM</span>
                  <button onClick={() => setBpm(b => Math.min(220, b + 5))} style={{ width: 32, height: 32, borderRadius: '50%', background: t.surface2, border: `1px solid ${t.border}`, cursor: 'pointer', color: t.text, fontSize: 16 }}>+</button>
                </div>
                <button
                  onClick={() => setMetroPlaying(p => !p)}
                  style={{ padding: '8px 20px', borderRadius: 999, background: metroPlaying ? t.accent : t.surface2, border: `1px solid ${metroPlaying ? t.accent : t.border}`, cursor: 'pointer', fontFamily: t.font, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: metroPlaying ? '#fff' : t.text }}
                >
                  {metroPlaying ? 'Stop metronom' : 'Start metronom'}
                </button>
                {metroPlaying && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: currentBeat === i ? t.accent : t.surface2, transition: 'background 0.05s' }} />
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => { if (!done) { markCompleted(ex.key); setJustCompleted(true); } }}
                style={{ alignSelf: 'flex-start', padding: '11px 24px', borderRadius: 999, background: done ? t.goodSoft : t.accent, border: 'none', cursor: done ? 'default' : 'pointer', fontFamily: t.font, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: done ? t.good : '#fff', boxShadow: done ? 'none' : '0 6px 22px rgba(242,85,69,0.3)' }}
              >
                {done ? '✓ Gennemført' : 'Markér som færdig'}
              </button>

              {(done || justCompleted) && (
                <div style={{ borderRadius: 16, border: `1px solid ${t.good}33`, background: `${t.good}0a`, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Coach praise */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: t.mono, fontWeight: 700, letterSpacing: 1, color: t.accent, textTransform: 'uppercase', marginBottom: 5 }}>AI Coach</div>
                      <div style={{ fontSize: 13.5, color: t.text, lineHeight: 1.6 }}>{coach.praise}</div>
                    </div>
                  </div>

                  {/* Next exercise */}
                  {nextExercise && (
                    <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
                      <div style={{ fontSize: 10, fontFamily: t.mono, fontWeight: 700, letterSpacing: 1, color: t.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>Næste øvelse</div>
                      <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.55, marginBottom: 14 }}>{coach.next}</div>
                      <button
                        onClick={onNavigateNext}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 12, padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'border-color 0.15s' }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 2 }}>{nextExercise.title}</div>
                          <div style={{ fontSize: 11, color: t.textMuted }}>{nextExercise.level} · {nextExercise.bpm} BPM</div>
                        </div>
                        <div style={{ fontFamily: t.mono, fontSize: 18, color: t.accent, flexShrink: 0 }}>→</div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'video' && (
            <div>
              {ex.videoId ? (
                <div style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ex.videoId}?rel=0&modestbranding=1`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div style={{ aspectRatio: '16/9', borderRadius: 12, background: t.surface2, border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <div style={{ fontSize: 40, opacity: 0.3 }}>▶</div>
                  <div style={{ fontSize: 13, color: t.textMuted }}>Ingen video tilknyttet denne øvelse endnu</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PLAY-ALONG TRACK MODAL ───────────────────────────────────
interface PlayAlongTrackData {
  key: string;
  title: string;
  bpm: number | string;
  level?: string;
}

function PlayAlongTrackModal({ t, track, onClose }: {
  t: T;
  track: PlayAlongTrackData;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [guideVol, setGuideVol] = useState(60);
  const [backingVol, setBackingVol] = useState(80);
  const { markCompleted, isCompleted } = useExerciseProgress();
  const done = isCompleted(track.key);
  const sections = ['INTRO', 'VERS', 'OMKVÆD', 'BRIDGE', 'OUTRO'];
  const totalSecs = 248;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress(p => {
      if (p >= 100) { setPlaying(false); return 100; }
      return p + 0.4;
    }), 1000);
    return () => clearInterval(id);
  }, [playing]);

  const currentSectionIdx = Math.min(Math.floor((progress / 100) * sections.length), sections.length - 1);
  const currentSecs = Math.round((progress / 100) * totalSecs);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 600, background: t.surface, borderRadius: 20, border: `1px solid ${t.borderStrong}`, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 3 }}>{track.title}</div>
            <div style={{ fontFamily: t.mono, fontSize: 11, color: t.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{track.bpm} BPM · BACKING TRACK</div>
          </div>
          {done && <span style={{ fontSize: 10, fontFamily: t.mono, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: t.goodSoft, color: t.good }}>FÆRDIG</span>}
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: t.surface2, border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11"/></svg>
          </button>
        </div>

        <div style={{ padding: '28px 28px 32px' }}>
          {/* Form timeline */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontFamily: t.mono, fontWeight: 700, letterSpacing: 1, color: t.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>Opbygning</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {sections.map((s, si) => (
                <div key={si} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 8, fontWeight: 700, fontFamily: t.mono, letterSpacing: 0.3, color: si === currentSectionIdx && playing ? t.accent : t.textMuted, marginBottom: 5, transition: 'color 0.5s' }}>{s}</div>
                  <div style={{ height: 4, borderRadius: 2, background: si < currentSectionIdx ? t.accent : si === currentSectionIdx && playing ? t.accentSoft : t.surface2, transition: 'background 0.5s' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar + time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span style={{ fontFamily: t.mono, fontSize: 12, color: t.textMuted, minWidth: 36 }}>{fmt(currentSecs)}</span>
            <div
              style={{ flex: 1, position: 'relative', height: 6, borderRadius: 999, background: t.surface2, cursor: 'pointer' }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
              }}
            >
              <div style={{ width: `${progress}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${t.accent}, #ff7a4f)` }} />
              <div style={{ position: 'absolute', top: '50%', left: `${progress}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: `0 0 0 3px ${t.accent}` }} />
            </div>
            <span style={{ fontFamily: t.mono, fontSize: 12, color: t.textMuted, minWidth: 36, textAlign: 'right' }}>{fmt(totalSecs)}</span>
          </div>

          {/* Play button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <button
              onClick={() => setPlaying(p => !p)}
              style={{ width: 60, height: 60, borderRadius: '50%', background: t.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 32px rgba(242,85,69,0.4)`, transition: 'transform 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              {playing
                ? <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><rect x="3" y="3" width="4" height="12" rx="1"/><rect x="11" y="3" width="4" height="12" rx="1"/></svg>
                : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 3.5l11 5.5-11 5.5V3.5z" fill="white"/></svg>
              }
            </button>
          </div>

          {/* Mixer */}
          <div style={{ background: t.surface2, borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontFamily: t.mono, fontWeight: 700, letterSpacing: 1, color: t.textMuted, textTransform: 'uppercase', marginBottom: 14 }}>Mixer</div>
            {[
              { label: 'Guide-trommer', vol: guideVol, set: setGuideVol },
              { label: 'Backing track', vol: backingVol, set: setBackingVol },
            ].map(({ label, vol, set }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: t.text }}>{label}</span>
                  <span style={{ fontFamily: t.mono, fontSize: 11, color: t.textMuted }}>{vol}%</span>
                </div>
                <input type="range" min={0} max={100} value={vol} onChange={e => set(+e.target.value)} style={{ width: '100%', accentColor: t.accent }} />
              </div>
            ))}
          </div>

          <button
            onClick={() => { if (!done) markCompleted(track.key); }}
            style={{ width: '100%', padding: '12px 24px', borderRadius: 12, background: done ? t.goodSoft : t.surface2, border: `1px solid ${done ? t.good + '55' : t.border}`, cursor: done ? 'default' : 'pointer', fontFamily: t.font, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: done ? t.good : t.text }}
          >
            {done ? '✓ Markeret som færdig' : 'Markér som færdig'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MACWINDOW CHROME ─────────────────────────────────────────
const TrafficLights = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    {['#ff736a', '#febc2e', '#19c332'].map((bg, i) => (
      <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: bg, border: '0.5px solid rgba(0,0,0,0.12)' }} />
    ))}
  </div>
);

// ─── SCALE HOOK ───────────────────────────────────────────────
function useFitScale(w: number, h: number, mg = 0) {
  const [sc, setSc] = useState(1);
  useEffect(() => {
    const calc = () => {
      const s = Math.min((window.innerWidth - mg * 2) / w, (window.innerHeight - mg * 2) / h, 1);
      setSc(s > 0 ? s : 1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [w, h, mg]);
  return sc;
}

// ─── SIDEBAR ──────────────────────────────────────────────────
type ViewId = 'home' | 'category' | 'exercises' | 'studio' | 'profile';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NAV_ITEMS: { id: ViewId; label: string; icon: React.FC<any>; category?: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' }[] = [
  { id: 'home', label: 'Hjem', icon: IcHome },
  { id: 'category', label: 'Play-along', icon: IcPlay, category: 'playalong' },
  { id: 'exercises', label: 'Øvelser', icon: TabPractice },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { id: 'studio', label: 'Studio Kit', icon: ({ size, color, sw }: any) => <TabKit size={size} color={color} sw={sw} /> },
  { id: 'profile', label: 'Profil', icon: IcUser },
];

function Sidebar({ t, view, onView, selectedCategory, setSelectedCategory, isPremium, onUpgrade }: {
  t: T;
  view: ViewId;
  onView: (v: ViewId) => void;
  selectedCategory: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null;
  setSelectedCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null) => void;
  dark: boolean;
  isPremium: boolean;
  onUpgrade: () => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage, t: translate } = useLanguage();
  const { user } = useAuth();
  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const languages: { code: typeof language; flag: string }[] = [
    { code: 'da', flag: '🇩🇰' },
    { code: 'en', flag: '🇬🇧' },
    { code: 'de', flag: '🇩🇪' },
    { code: 'es', flag: '🇪🇸' },
  ];

  return (
    <div style={{ width: 240, height: '100%', flexShrink: 0, background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', padding: '18px 14px 16px' }}>
      {/* Brand */}
      <div style={{ padding: '4px 6px 24px' }}>
        <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 22, letterSpacing: -0.5, color: t.text, display: 'flex', alignItems: 'baseline', gap: 2 }}>
          Pocket Drummer<span style={{ color: t.accent, fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{ fontSize: 10, fontFamily: t.mono, color: t.textDim, letterSpacing: 0.5, marginTop: 2 }}>ACADEMY</div>
      </div>

      {/* Search */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.textDim} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input ref={searchRef} placeholder="Søg..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontFamily: t.font, fontSize: 12, padding: 0, margin: 0 }} />
        <span style={{ fontFamily: t.mono, fontSize: 9, color: t.textDim, padding: '1px 5px', borderRadius: 4, border: `1px solid ${t.border}` }}>⌘K</span>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Sect t={t} style={{ marginBottom: 8 }}>{translate('home')}</Sect>
        {NAV_ITEMS.map(it => {
          const active = it.id === 'category'
            ? (view === 'category' && selectedCategory === it.category)
            : (view === it.id);
          
          const labelTranslated = it.id === 'home' ? translate('home') :
                                  it.id === 'exercises' ? translate('practice') :
                                  it.id === 'category' ? translate('playalong') :
                                  it.id === 'studio' ? translate('kit') :
                                  it.id === 'profile' ? translate('profile') : it.label;

          return (
            <button key={it.label} onClick={() => {
              if (it.id === 'category' && it.category) {
                setSelectedCategory(it.category);
              } else {
                setSelectedCategory(null);
              }
              onView(it.id);
            }} aria-current={active ? 'page' : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px',
              background: active ? t.accentSoft : 'transparent',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              color: active ? t.accent : t.text, fontFamily: t.font,
              fontSize: 13.5, fontWeight: active ? 600 : 450, textAlign: 'left', width: '100%',
            }}>
              <it.icon size={17} color={active ? t.accent : t.textMuted} sw={active ? 1.8 : 1.4} />
              <span style={{ flex: 1 }}>{labelTranslated}</span>
              {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.accent }} />}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Language Switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, padding: '0 6px', justifyContent: 'center' }}>
        {languages.map(l => (
          <button 
            key={l.code} 
            onClick={() => setLanguage(l.code)}
            style={{
              background: language === l.code ? t.accentSoft : 'transparent',
              border: `1px solid ${language === l.code ? t.accent : 'transparent'}`,
              borderRadius: 8,
              padding: '6px 8px',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <span>{l.flag}</span>
          </button>
        ))}
      </div>


      {/* Premium CTA or status */}
      {!isPremium ? (
        <div style={{
          background: `linear-gradient(135deg, ${t.accentSoft} 0%, rgba(255,255,255,0.01) 100%)`,
          border: `1px solid ${t.accent}`,
          borderRadius: 14, padding: '16px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <IcSpark size={14} color={t.accent} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: t.accent }}>Premium</span>
          </div>
          <p style={{ fontSize: 11.5, margin: '0 0 12px', color: t.textMuted, lineHeight: 1.5, fontFamily: t.font }}>
            AI-læringsplaner, 300+ øvelser og play-alongs.
          </p>
          <button onClick={onUpgrade} style={{
            width: '100%', background: t.accent, color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 12px', fontSize: 11, fontWeight: 700,
            letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239,90,58,0.35)',
          }}>
            Opgrader nu
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 14px', background: t.goodSoft, borderRadius: 12, border: `1px solid rgba(93,211,158,0.2)` }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: t.good, marginBottom: 4 }}>✦ Premium aktiv</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>Fuld adgang til alt indhold.</div>
        </div>
      )}

      {/* Auth / User chip */}
      <div style={{ borderTop: `1px solid ${t.border}`, marginTop: 12, paddingTop: 14 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.displayName}
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, fontFamily: t.mono }}>
                {translate('level')} {user.level || 1} · {isPremium ? 'PRO' : 'FREE'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 6px' }}>
            <a href="/login" style={{
              display: 'block', textAlign: 'center', padding: '9px 12px',
              background: t.accent, color: '#fff', borderRadius: 8,
              fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,90,58,0.35)',
            }}>
              Opret konto
            </a>
            <a href="/login" style={{
              display: 'block', textAlign: 'center', padding: '8px 12px',
              border: `1px solid ${t.borderStrong}`, color: t.textMuted, borderRadius: 8,
              fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              Log ind
            </a>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── AI COACH PANEL ───────────────────────────────────────────
interface CoachAction {
  category: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | 'exercises' | 'studio';
  label: string;
  description: string;
}
interface ChatMessage { id: number; role: 'ai' | 'user'; text: string; action?: CoachAction }

type CategoryId = 'opvarmning' | 'nodelære' | 'grooves' | 'playalong';

function CoachPanel({ t, open, onToggle, isPremium, onUpgrade, onNavigate }: {
  t: T; dark: boolean; open: boolean; onToggle: () => void;
  isPremium: boolean; onUpgrade: () => void;
  onNavigate: (view: ViewId, category?: CategoryId) => void;
}) {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: 0, role: 'ai', text: 'Hej! Jeg er din personlige trommelærer. Hvad vil du fokusere på i dag — og hvor er du henne i dit forløb?' },
  ]);
  const msgIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = async () => {
    if (!input.trim()) return;
    if (!isPremium && msgs.filter(m => m.role === 'user').length >= 2) { onUpgrade(); return; }
    const q = input.trim();
    setInput('');
    const userMsg: ChatMessage = { id: msgIdRef.current++, role: 'user', text: q };
    setMsgs(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const history = [...msgs, userMsg].slice(-12).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));
      const res = await fetch('https://us-central1-gen-lang-client-0782413722.cloudfunctions.net/kaldDeepSeek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTyping(false);
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: data.message, action: data.action }]);
    } catch {
      setTyping(false);
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: 'Beklager, der opstod en fejl. Prøv igen.' }]);
    }
  };

  const handleAction = (action: CoachAction) => {
    if (action.category === 'exercises') { onNavigate('exercises'); return; }
    if (action.category === 'studio') { onNavigate('studio'); return; }
    onNavigate('category', action.category as CategoryId);
  };

  if (!open) return (
    <button onClick={onToggle} style={{
      position: 'absolute', bottom: 28, right: 28, width: 48, height: 48, borderRadius: '50%',
      background: t.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(239,90,58,0.45)', zIndex: 100,
    }}>
      <IcSpark size={20} color="#fff" />
    </button>
  );

  return (
    <div style={{
      position: 'absolute', bottom: 88, right: 28, zIndex: 100,
      width: 340, height: 480, borderRadius: 16,
      background: t.sidebar, border: `1px solid ${t.border}`,
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IcSpark size={15} color={t.accent} />
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>AI Coach</span>
            <Badge t={t} tone="accent">PRO</Badge>
          </div>
          <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 2 }}>Personlig trommelærer</div>
        </div>
        <button onClick={onToggle} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 4 }}>
          <IcMin size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? t.accent : t.surface,
              color: m.role === 'user' ? '#fff' : t.text,
              border: m.role === 'user' ? 'none' : `1px solid ${t.border}`,
              fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
            {m.role === 'ai' && m.action && (
              <button
                onClick={() => handleAction(m.action!)}
                style={{
                  marginTop: 6, maxWidth: '82%', width: '100%', padding: '9px 13px',
                  borderRadius: 10, background: t.accentSoft,
                  border: `1px solid ${t.accent}40`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 9,
                  fontFamily: t.font, textAlign: 'left',
                }}
              >
                <IcPlay size={13} color={t.accent} />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: t.accentText }}>{m.action.label}</div>
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>{m.action.description}</div>
                </div>
              </button>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: t.surface, borderRadius: 14, width: 'fit-content', border: `1px solid ${t.border}` }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: t.textMuted, animation: `dotPulse 0.8s ${i * 0.2}s infinite ease-in-out` }} />)}
          </div>
        )}
      </div>

      {/* Chips */}
      <div style={{ padding: '8px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Vis timing-tip', 'Fills til begyndere', 'Ghost notes'].map(chip => (
          <button key={chip} onClick={() => { setInput(chip); }} style={{
            padding: '5px 11px', borderRadius: 999, background: t.surface2, border: `1px solid ${t.border}`,
            fontSize: 11, color: t.textMuted, cursor: 'pointer', fontFamily: t.font,
          }}>{chip}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px 16px', borderTop: `1px solid ${t.border}` }}>
        {!isPremium && msgs.filter(m => m.role === 'user').length >= 2 && (
          <div style={{ marginBottom: 8, padding: '8px 12px', background: t.accentSoft, borderRadius: 8, fontSize: 11, color: t.accentText }}>
            Opgrader til Premium for ubegrænset AI Coach adgang.
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Spørg din coach…"
            style={{
              flex: 1, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
              padding: '9px 13px', color: t.text, fontFamily: t.font, fontSize: 12.5, outline: 'none',
            }}
          />
          <button onClick={send} style={{
            width: 38, height: 38, borderRadius: 10, background: t.accent, border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239,90,58,0.3)',
          }}>
            <IcSend size={16} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STREAK DOTS ──────────────────────────────────────────────
function StreakDots({ active = 0, todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1, t }: { active?: number; todayIndex?: number; t: T }) {
  const days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {days.map((d, i) => {
        const on = i < active;
        const isToday = i === todayIndex;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className={`streak-dot${on ? ' on' : ''}${isToday ? ' today' : ''}`}>
              {on ? <IcCheck size={11} sw={2.5} color="#fff" /> : null}
            </div>
            <span style={{ fontSize: 9, color: t.textMuted, fontWeight: 600, letterSpacing: 0.3, fontFamily: t.mono }}>{d}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── HOME VIEW ────────────────────────────────────────────────
function HomeView({ t, dark, setDark, onView, isPremium, onUpgrade, onSelectCategory }: {
  t: T;
  dark: boolean;
  setDark: (d: boolean) => void;
  onView: (v: ViewId) => void;
  isPremium: boolean;
  onUpgrade: () => void;
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
}) {
  const { user } = useAuth();
  const { t: translate } = useLanguage();
  const today = new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
  const displayName = user?.displayName || 'dig';

  const xp = user?.xp !== undefined ? user.xp : 0;
  const level = user?.level || 1;
  const streak = user?.streak !== undefined ? user.streak : 0;
  const xpToNext = 200 - (xp % 200);
  const xpPct = ((xp % 200) / 200) * 100;

  const plan = getUserPlan();
  const hasProject = !!plan;

  const CATEGORIES = [
    { id: 'opvarmning' as const, title: translate('warmup'), tagline: translate('warmupTagline'), icon: <IllSticks size={52} color={t.accent} /> },
    { id: 'nodelære' as const, title: translate('musicTheory'), tagline: translate('theoryTagline'), icon: <div style={{ transform: 'scale(0.8)', marginTop: -20, marginBottom: -10 }}><DrumNotation color={t.text} width={140} accent={t.accent} active={2} /></div> },
    { id: 'grooves' as const, title: translate('grooves'), tagline: translate('groovesTagline'), icon: <IllSnare size={62} color={t.accent} /> },
    { id: 'playalong' as const, title: translate('playalong'), tagline: translate('playalongTagline'), icon: <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcPlay size={20} fill color={t.accent} /></div> },
  ];

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font, maxWidth: 1100 }}>
      {/* Header */}
      <div className="anim-fade-up d-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted, marginBottom: 10, fontFamily: t.mono }}>
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </div>
          <Display t={t} size={48} style={{ lineHeight: 1 }}>
            {hasProject ? `Velkommen tilbage, ${displayName}.` : 'Nu begynder dit projekt som trommeslager.'}
          </Display>
          {hasProject && plan && (
            <div className="anim-fade-up d-160" style={{ fontSize: 14, color: t.textMuted, marginTop: 10 }}>
              Næste skridt:{' '}
              <span style={{ color: t.accent, fontWeight: 600 }}>
                {plan.fokustema.replace(/^Uge \d+:\s*/, '')}
              </span>
            </div>
          )}
        </div>
        <button onClick={() => setDark(!dark)} style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {dark ? <IcSun size={15} /> : <IcMoon size={15} />}
        </button>
      </div>

      {hasProject ? (
        <>
          {/* Streak + XP row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Streak card with dots */}
            <Card t={t} pad={22} style={{}} className="anim-fade-up d-240">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IcFlame size={16} color={t.accent} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {streak} {streak === 1 ? 'dags' : 'dages'} streak
                  </span>
                </div>
                <span style={{ fontFamily: t.mono, fontSize: 9, color: t.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Uge {Math.ceil(new Date().getDate() / 7) + (new Date().getMonth() > 0 ? 4 : 0)}
                </span>
              </div>
              <StreakDots active={streak > 7 ? 7 : streak} t={t} />
            </Card>

            {/* XP card */}
            <Card t={t} pad={22} className="anim-fade-up d-320">
              <Sect t={t} style={{ marginBottom: 10 }}>{translate('level')} {level}</Sect>
              <Display t={t} size={28} style={{ marginBottom: 6 }}>{xpToNext} XP</Display>
              <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 14 }}>fra næste niveau</div>
              <div className="bar anim-progress" style={{ height: 5 }}>
                <i style={{ '--pct': xpPct + '%' } as React.CSSProperties} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: t.mono, fontSize: 9, color: t.textDim }}>
                <span>NIV. {level} · {xp % 200} XP</span>
                <span>NIV. {level + 1} · 200 XP</span>
              </div>
            </Card>
          </div>

          {/* Fortsæt projekt — primær handling */}
          <div className={`card-lift anim-fade-up d-400`} onClick={() => onSelectCategory('grooves')} style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 20, padding: 24, marginBottom: 24,
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
          }}>
            {/* Radial glow */}
            <div style={{
              position: 'absolute', top: -60, right: -60, width: 240, height: 240,
              borderRadius: '50%', background: t.accent, filter: 'blur(90px)', opacity: 0.14, pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: t.accent, fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>Fortsæt projekt</span>
                <span style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted }}>
                  {plan?.fokustema?.split(':')[0] || 'Uge 1'}
                </span>
              </div>
              <Display t={t} size={28} style={{ marginBottom: 4 }}>
                {plan?.fokustema?.replace(/^Uge \d+:\s*/, '') || 'Grundlæggende færdigheder'}
              </Display>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>Grooves & Timing</div>
              <DrumNotation color={dark ? '#f4f1ec' : '#252525'} width={Math.min(600, 600)} accent={t.accent} active={2} />
              <div className="bar" style={{ height: 4, marginTop: 16, marginBottom: 16 }}>
                <i style={{ width: '27%' }} />
              </div>
              <Btn t={t} icon={<IcPlay size={12} />} size="lg">Fortsæt hvor du slap</Btn>
            </div>
          </div>

          {/* AI Coach kommentar */}
          <div className="anim-fade-up d-480" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: 22, marginBottom: 8, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.accentSoft, border: `1px solid ${t.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🥁</div>
            <div>
              <div style={{ fontSize: 9.5, fontFamily: t.mono, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: t.accent, marginBottom: 6 }}>AI Coach · Næste skridt</div>
              <div style={{ fontSize: 13.5, color: t.text, lineHeight: 1.65, marginBottom: 10 }}>
                {plan?.fokustema?.includes('Uge 1') || !plan?.fokustema
                  ? 'Du er ved at lægge fundamentet — og det er det vigtigste arbejde du kan gøre nu. Sæt tempoet lavt, hold timingen præcis, og lad mønstret sætte sig.'
                  : plan?.fokustema?.includes('Uge 2')
                  ? 'Grundmønstrene sidder bedre nu. Denne uge handler om at flytte opmærksomheden fra "hvad gør jeg" til "hvad hører jeg". Lyt aktivt til din egen timing.'
                  : plan?.fokustema?.includes('Uge 3')
                  ? 'Du er halvvejs — og teknikken begynder at blive til musikalitet. Fokusér på dynamik og nuancer frem for hastighed denne uge.'
                  : 'Du er tæt på at fuldføre dit første projekt. Gennemfør de resterende øvelser i dit eget tempo — du har allerede bevist, at du kan holde kursen.'}
              </div>
              <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: t.text }}>Hvad du skal fokusere på: </span>
                {plan?.fokustema?.includes('Uge 1') || !plan?.fokustema
                  ? 'Begynd med opvarmning i 5 min, derefter ét grooveønske på 80 BPM. Gentag tre gange.'
                  : plan?.fokustema?.includes('Uge 2')
                  ? 'Øv med metronomen i 10 min. Spil langsomt, mærk hvert slag — og øg BPM med 5 når det sidder.'
                  : plan?.fokustema?.includes('Uge 3')
                  ? 'Veksl mellem stille og kraftigt spil i dit foretrukne groove. Dynamikken er din næste musikalske dimension.'
                  : 'Kør én fuld session med play-along og notér, hvad der stadig udfordrer dig. Det er din næste fokuszone.'}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Ny bruger — ingen plan */
        <div className="anim-fade-up d-160" style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.7, marginBottom: 28, maxWidth: 480 }}>
            Vi husker hvor du er. Hvad du øver. Hvad der venter forude. Du behøver kun komme tilbage.
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/onboarding" style={{ display: 'inline-flex' }}>
              <Btn t={t} size="lg" icon={<IcPlay size={13} />}>Start dit første projekt</Btn>
            </a>
            <Btn t={t} variant="secondary" size="lg" onClick={() => onSelectCategory('grooves')}>Udforsk øvespor</Btn>
          </div>
        </div>
      )}

      {/* Vælg øvespor */}
      <Sect t={t} style={{ marginBottom: 18 }}>{translate('choosePracticeTrack')}</Sect>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 40 }}>
        {CATEGORIES.map((cat, i) => (
          <div key={cat.id} className={`card-lift anim-fade-up d-${(i + 1) * 80}`} onClick={() => onSelectCategory(cat.id)} style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 18, padding: 22,
            display: 'flex', alignItems: 'center', gap: 18,
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, background: t.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: `1px solid ${t.border}` }}>
              {cat.icon}
            </div>
            <div style={{ flex: 1 }}>
              <Display t={t} size={19} style={{ marginBottom: 4 }}>{cat.title}</Display>
              <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.4, fontStyle: 'italic' }}>{cat.tagline}</div>
            </div>
            <IcChev size={15} color={t.textDim} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CATEGORY DETAIL VIEW ──────────────────────────────────────
interface CategoryDetailViewProps {
  t: T;
  category: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong';
  onBack: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

function CategoryDetailView({ t, category, onBack }: CategoryDetailViewProps) {
  const [activeChip, setActiveChip] = useState('Alle');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetailData | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [selectedPlayAlongTrack, setSelectedPlayAlongTrack] = useState<PlayAlongTrackData | null>(null);
  const { markOpened, isCompleted } = useExerciseProgress();

  // Metronome widget states (nodelære-sektion)
  const [bpm, setBpm] = useState(90);
  const [metroPlaying, setMetroPlaying] = useState(false);
  const [subdivision, setSubdivision] = useState<'quarter' | 'eighth'>('quarter');
  const [currentBeat, setCurrentBeat] = useState(0);

  // Play-along states
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [playalongPlaying, setPlayalongPlaying] = useState(false);
  const [mixerVols, setMixerVols] = useState({ drums: 70, music: 60 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  useEffect(() => {
    if (!metroPlaying) return;
    const intervalTime = (60 / bpm) * (subdivision === 'eighth' ? 500 : 1000);
    const id = setInterval(() => {
      setCurrentBeat(prev => {
        const next = subdivision === 'eighth' ? (prev + 1) % 8 : (prev + 1) % 4;
        try {
          const ctx = getAudioCtx();
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          const isDown = next === 0; const isSub = subdivision === 'eighth' && next % 2 !== 0;
          osc.frequency.setValueAtTime(isDown ? 1000 : isSub ? 450 : 600, ctx.currentTime);
          gain.gain.setValueAtTime(isDown ? 0.2 : isSub ? 0.04 : 0.09, ctx.currentTime);
          osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05); osc.stop(ctx.currentTime + 0.06);
        } catch {}
        return next;
      });
    }, intervalTime);
    return () => clearInterval(id);
  }, [metroPlaying, bpm, subdivision]);

  useEffect(() => () => { audioCtxRef.current?.close(); }, []);


  const categoryChips = {
    opvarmning: ['Alle', '5 min', '10 min', 'Hænder', 'Fødder', 'Single strokes', 'Double strokes', 'Paradiddles', 'Accenter', 'Dynamik', 'Tempo-ladder', 'Venstre hånd', 'Stortrommekontrol'],
    nodelære: ['Alle', 'Fjerdedele', 'Ottendedele', 'Sekstendedele', 'Pauser', 'Accenter', 'Ghost notes', 'Taktarter', '4/4', '3/4', '6/8', 'Shuffle-notation', 'Charts', 'Prima vista', 'Læs og spil', 'Nodequiz'],
    grooves: ['Alle', 'Basic rock', 'Pop', 'Funk', 'Jazz', 'Blues', 'Shuffle', 'Samba', 'Songo', 'Latin', 'Reggae', 'Hip-hop', 'Metal', 'Brushes', 'Ghost notes', 'Linear grooves', 'Fills', 'Overgange', 'Odd meters', 'Koordination'],
    playalong: ['Alle', 'Rock tracks', 'Pop tracks', 'Funk tracks', 'Blues tracks', 'Jazz tracks', 'Latin tracks', 'No-drums tracks', 'Guided play-alongs', 'Call and response', 'Begyndertracks', 'Mellemtracks', 'Øvede tracks', 'Formtræning', 'Vers/omkvæd', 'Fill cues']
  }[category];

  const categoryExercises = {
    opvarmning: [
      { id: 1, title: '5 minutters teknik-start', sub: 'Single strokes og håndkontrol', dur: '5 min', bpm: 80, tags: ['5 min', 'Single strokes'], level: 'Begynder' },
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
    opvarmning: 'Opvarmning',
    nodelære: 'Nodelære',
    grooves: 'Groove',
    playalong: 'Play-along'
  }[category];

  const categoryBlurb = {
    opvarmning: 'Start med hænder, fødder, kontrol og timing. Skab et solidt fundament for dit trommespil.',
    nodelære: 'Forstå rytmer, taktarter og trommenotation. Lær at læse og spille noder flydende.',
    grooves: 'Spil beats, fills, overgange og genrer. Udvid dit rytmiske ordforråd på tværs af musikstile.',
    playalong: 'Spil med musik, backing tracks og form. Anvend dine øvelser direkte i musikalske formforløb.'
  }[category];

  const filteredExercises = categoryExercises.filter(ex => {
    if (activeChip === 'Alle') return true;
    return ex.tags.some(tag => tag.toLowerCase().includes(activeChip.toLowerCase()));
  });

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font, maxWidth: 1100 }}>
      {/* Back button and Category Header */}
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 1.2, padding: '4px 0', marginBottom: 20
      }}>
        <IcBack size={15} color={t.textMuted} /> Tilbage til Hjem
      </button>

      <div style={{ marginBottom: 32 }}>
        <Display t={t} size={48} style={{ marginBottom: 12 }}>{categoryTitle}</Display>
        <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6, maxWidth: 650 }}>{categoryBlurb}</p>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 28, flexWrap: 'wrap', scrollbarWidth: 'none' }}>
        {categoryChips.map(chip => {
          const active = activeChip === chip;
          return (
            <button key={chip} onClick={() => setActiveChip(chip)} style={{
              padding: '8px 16px', borderRadius: 999, border: `1px solid ${active ? t.accent : t.border}`,
              background: active ? t.accentSoft : t.surface, color: active ? t.accent : t.textMuted,
              fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s ease',
              letterSpacing: '0.12em',
              boxShadow: active ? '0 0 14px rgba(242, 85, 69, 0.38)' : 'none',
            }}>{chip}</button>
          );
        })}
      </div>

      {/* Interactive metronome widget for Nodelære */}
      {category === 'nodelære' && (
        <Card t={t} pad={24} style={{ marginBottom: 36, borderLeft: `4px solid ${t.accent}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.accent, marginBottom: 4 }}>Interaktiv Nodelæser</div>
              <Display t={t} size={24}>Metronom & Node-øvebænk</Display>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setSubdivision('quarter'); setCurrentBeat(0); }} style={{
                padding: '6px 12px', borderRadius: 6, border: `1.5px solid ${subdivision === 'quarter' ? t.accent : t.border}`,
                background: subdivision === 'quarter' ? t.accentSoft : 'transparent', color: subdivision === 'quarter' ? t.accent : t.textMuted,
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: t.font
              }}>Fjerdedele</button>
              <button onClick={() => { setSubdivision('eighth'); setCurrentBeat(0); }} style={{
                padding: '6px 12px', borderRadius: 6, border: `1.5px solid ${subdivision === 'eighth' ? t.accent : t.border}`,
                background: subdivision === 'eighth' ? t.accentSoft : 'transparent', color: subdivision === 'eighth' ? t.accent : t.textMuted,
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: t.font
              }}>Ottendedele</button>
            </div>
          </div>

          <div style={{ background: '#FAF8F5', border: `1px solid ${t.border}`, borderRadius: 16, padding: '24px 16px', position: 'relative', marginBottom: 24, overflow: 'hidden' }}>
            {/* Playhead SVG overlay */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, pointerEvents: 'none' }}>
              <svg width="100%" height="100%">
                {(() => {
                  const beatsCount = subdivision === 'eighth' ? 8 : 4;
                  const startX = 64;
                  const step = (800 - startX) / beatsCount;
                  const x = startX + step * (currentBeat + 0.5);
                  if (!metroPlaying) return null;
                  return (
                    <line x1={x} y1="0" x2={x} y2="100%" stroke={t.accent} strokeWidth="2.5" opacity="0.85" />
                  );
                })()}
              </svg>
            </div>

            {/* Static Drum Notation Rendering */}
            <div style={{ color: '#16161a' }}>
              <DrumNotation color="#16161a" width={800} accent={t.accent} active={metroPlaying ? currentBeat : -1} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => setMetroPlaying(!metroPlaying)} style={{
                width: 52, height: 52, borderRadius: '50%', background: t.accent, border: 'none', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(242,85,69,0.35)', transition: 'all 0.15s ease'
              }}>
                {metroPlaying ? <span style={{ fontSize: 16 }}>◼</span> : <IcPlay size={16} fill color="#fff" />}
              </button>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{metroPlaying ? 'Spiller…' : 'Start metronom'}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>Mål timing på subdivisioner</div>
              </div>
            </div>

            <div style={{ flex: 1, maxWidth: 350, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.textMuted }}>BPM:</span>
              <button onClick={() => setBpm(Math.max(40, bpm - 5))} style={{ width: 28, height: 28, borderRadius: '50%', background: t.surface2, border: 'none', color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>-</button>
              <input type="range" min={40} max={220} value={bpm} onChange={e => setBpm(+e.target.value)} style={{ flex: 1, accentColor: t.accent }} />
              <button onClick={() => setBpm(Math.min(220, bpm + 5))} style={{ width: 28, height: 28, borderRadius: '50%', background: t.surface2, border: 'none', color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
              <span style={{ fontFamily: t.mono, fontSize: 14, fontWeight: 700, width: 60, textAlign: 'right' }}>{bpm} BPM</span>
            </div>
          </div>
        </Card>
      )}

      {/* Play Along accordion queue */}
      {category === 'playalong' && (() => {
        const queue = [
          { id: 1, title: 'Slow Rock i 78 BPM',    bpm: 78,  sections: ['INTRO', 'VERSE 1', 'CHORUS', 'BRIDGE', 'VERSE 2', 'OUTRO'] },
          { id: 2, title: 'Funk Groove Odyssey',   bpm: 96,  sections: ['INTRO', 'FUNK 1', 'CHORUS', 'FILL', 'FUNK 2', 'OUTRO'] },
          { id: 3, title: 'Halv-tempo Ballade',    bpm: 64,  sections: ['INTRO', 'VERSE', 'CHORUS', 'OUTRO'] },
          { id: 4, title: 'Linear Groove i 100',   bpm: 100, sections: ['INTRO', 'GROOVE', 'BREAK', 'GROOVE', 'OUTRO'] },
        ];
        const activeQueueId = openExerciseId?.startsWith('pa-') ? parseInt(openExerciseId.replace('pa-', '')) : null;
        return (
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <Display t={t} size={26}>Play along</Display>
              <span style={{ fontSize: 12, color: t.textMuted }}>{queue.length} numre i køen</span>
            </div>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, overflow: 'hidden' }}>
              {queue.map((tr, qi) => {
                const isActive = activeQueueId === tr.id;
                return (
                  <div key={tr.id} style={{ borderBottom: qi < queue.length - 1 ? `1px solid ${t.border}` : 'none', background: isActive ? t.surface2 : 'transparent' }}>
                    {/* Row header */}
                    <button
                      onClick={() => setOpenExerciseId(isActive ? null : `pa-${tr.id}`)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: 'radial-gradient(circle at 30% 30%, #ff7a4f, #c43425)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isActive ? (
                          <div className="wave-vis playing anim-wave">
                            <span/><span/><span/><span/><span/>
                          </div>
                        ) : (
                          <IcPlay size={14} fill color="#fff" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{tr.title}</div>
                        <div style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted, marginTop: 2, letterSpacing: 0.5 }}>{tr.bpm} BPM · BACKING TRACK</div>
                      </div>
                      {!isActive && <IcChev size={13} color={t.textDim} />}
                    </button>

                    {/* Expanded player */}
                    {isActive && (
                      <div className="anim-fade-up d-0" style={{ padding: '0 18px 20px' }}>
                        {/* Form timeline */}
                        <div style={{ marginBottom: 18 }}>
                          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                            {tr.sections.map((s, si) => (
                              <span key={si} style={{ flex: 1, fontSize: 8, color: si === 1 ? t.accent : t.textMuted, fontWeight: 700, fontFamily: t.mono, letterSpacing: 0.3, textAlign: 'center' }}>{s}</span>
                            ))}
                          </div>
                          <div style={{ position: 'relative', height: 8, borderRadius: 999, background: t.surface, overflow: 'visible' }}>
                            <div style={{ width: '36%', height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${t.accent}, #ff7a4f)` }} />
                            <div style={{ position: 'absolute', left: '36%', top: -3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transform: 'translateX(-50%)', boxShadow: `0 0 0 3px ${t.accent}` }} />
                          </div>
                        </div>

                        {/* Play button + time */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                          <span style={{ fontFamily: t.mono, fontSize: 11, color: t.textMuted }}>1:32</span>
                          <button
                            onClick={() => setPlayalongPlaying(!playalongPlaying)}
                            style={{ width: 54, height: 54, borderRadius: '50%', background: t.accent, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(242,85,69,0.35)' }}
                          >
                            {playalongPlaying ? <span style={{ fontSize: 18, lineHeight: 1 }}>◼</span> : <IcPlay size={20} fill color="#fff" />}
                          </button>
                          <span style={{ fontFamily: t.mono, fontSize: 11, color: t.textMuted }}>4:08</span>
                        </div>

                        {/* Guide drums slider */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: t.text }}>Guide-trommer</span>
                            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.textMuted }}>{mixerVols.drums}%</span>
                          </div>
                          <input type="range" min={0} max={100} value={mixerVols.drums} onChange={e => setMixerVols(prev => ({ ...prev, drums: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
                        </div>

                        {/* Backing track slider */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: t.text }}>Backing track</span>
                            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.textMuted }}>{mixerVols.music}%</span>
                          </div>
                          <input type="range" min={0} max={100} value={mixerVols.music} onChange={e => setMixerVols(prev => ({ ...prev, music: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Exercise list */}
      <Sect t={t}>{category === 'playalong' ? 'Tracks' : 'Lektioner'} ({filteredExercises.length})</Sect>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredExercises.map((ex, idx) => {
          const exKey = `${category}-${idx}`;
          const done = isCompleted(exKey);
          const isNext = !done && idx === 0;
          const isPlayAlong = category === 'playalong';
          return (
            <button
              key={exKey}
              className="anim-fade-up"
              onClick={() => {
                if (isPlayAlong) {
                  setSelectedPlayAlongTrack({ key: exKey, title: ex.title, bpm: ex.bpm, level: ex.level });
                } else {
                  markOpened(exKey);
                  setSelectedIdx(idx);
                  setSelectedExercise({ key: exKey, title: ex.title, sub: ex.sub, level: ex.level, bpm: ex.bpm, tags: ex.tags });
                }
              }}
              style={{
                animationDelay: `${idx * 60}ms`,
                width: '100%', textAlign: 'left', background: t.surface,
                border: `1px solid ${done ? t.good + '44' : isNext ? t.accent + '55' : t.border}`,
                borderRadius: 14, padding: '14px 18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: isPlayAlong ? 10 : '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? t.good : isNext ? t.accentSoft : isPlayAlong ? 'radial-gradient(circle at 30% 30%, #ff7a4f, #c43425)' : 'transparent',
                border: done ? 'none' : isPlayAlong ? 'none' : `1px solid ${t.borderStrong}`,
                color: done ? '#fff' : isNext ? t.accent : t.textMuted,
                fontFamily: t.mono, fontSize: 12, fontWeight: 700,
              }}>
                {done ? <IcCheck size={14} sw={2.5} color="#fff" /> : isPlayAlong ? <IcPlay size={13} fill color="#fff" /> : <span>{idx + 1}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.title}</div>
                <div style={{ fontSize: 11, color: isNext ? t.accent : t.textMuted, fontWeight: isNext ? 600 : 400 }}>{isNext && !isPlayAlong ? 'Næste op' : ex.sub}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {done && <span style={{ fontFamily: t.mono, fontSize: 9, color: t.good, letterSpacing: 0.5 }}>FÆRDIG</span>}
                <span className="content-badge">{isPlayAlong ? 'PLAYER' : 'NODER'}</span>
                <span className={`level-niv ${ex.level === 'Begynder' ? 'level-niv-0' : ex.level === 'Mellemniveau' ? 'level-niv-1' : 'level-niv-2'}`}>
                  NIV. {ex.level === 'Begynder' ? 0 : ex.level === 'Mellemniveau' ? 1 : 2}
                </span>
                <IcChev size={13} color={t.textDim} />
              </div>
            </button>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: t.textMuted }}>
          <div style={{ fontSize: 13 }}>Ingen {category === 'playalong' ? 'tracks' : 'lektioner'} matcher filteret &quot;{activeChip}&quot;.</div>
        </div>
      )}

      {selectedPlayAlongTrack && (
        <PlayAlongTrackModal t={t} track={selectedPlayAlongTrack} onClose={() => setSelectedPlayAlongTrack(null)} />
      )}

      {selectedExercise && (() => {
        const nextEx = filteredExercises[selectedIdx + 1];
        const nextData: ExerciseDetailData | undefined = nextEx ? { key: `${category}-${selectedIdx + 1}`, title: nextEx.title, sub: nextEx.sub, level: nextEx.level, bpm: nextEx.bpm, tags: nextEx.tags } : undefined;
        return (
          <ExerciseDetailModal
            t={t}
            ex={selectedExercise}
            nextExercise={nextData}
            onNavigateNext={nextData ? () => { const k = `${category}-${selectedIdx + 1}`; markOpened(k); setSelectedIdx(selectedIdx + 1); setSelectedExercise(nextData); } : undefined}
            onClose={() => setSelectedExercise(null)}
          />
        );
      })()}
    </div>
  );
}



// ─── EXERCISES VIEW ───────────────────────────────────────────
function ExercisesView({ t, isPremium, onUpgrade, completedIds }: { t: T; isPremium: boolean; onUpgrade: () => void; completedIds: string[] }) {
  const [catFilter, setCatFilter] = useState('all');
  const [lvlFilter, setLvlFilter] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetailData | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const { markOpened } = useExerciseProgress();
  const CATS = ['all', 'rudiments', 'groove', 'fills', 'timing', 'koordination', 'stilarter'];
  const LVLS = ['all', 'begynder', 'mellemniveau', 'øvet'];
  const allLessons = MODULES.flatMap(m => m.lessons);
  const filtered = allLessons.filter(l => {
    if (catFilter !== 'all' && !l.skills.some(s => s.includes(catFilter))) return false;
    if (lvlFilter !== 'all') {
      const lvlMap: Record<string, number[]> = { begynder: [0, 1], mellemniveau: [2, 3], øvet: [4, 5] };
      if (!lvlMap[lvlFilter]?.includes(l.level)) return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font }}>
      <Display t={t} size={48} style={{ marginBottom: 8 }}>Øvelsesbibliotek</Display>
      <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 28 }}>{allLessons.length} øvelser · {allLessons.filter(l => !l.premium).length} gratis · {allLessons.filter(l => l.premium).length} premium</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: '7px 16px', borderRadius: 999, fontFamily: t.font, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            background: catFilter === c ? t.accent : t.surface2,
            color: catFilter === c ? '#fff' : t.textMuted,
            border: `1px solid ${catFilter === c ? t.accent : t.border}`,
            textTransform: 'capitalize',
          }}>{c === 'all' ? 'Alle kategorier' : c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {LVLS.map(l => (
          <button key={l} onClick={() => setLvlFilter(l)} style={{
            padding: '7px 16px', borderRadius: 999, fontFamily: t.font, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            background: lvlFilter === l ? t.surface : 'transparent',
            color: lvlFilter === l ? t.text : t.textMuted,
            border: `1px solid ${lvlFilter === l ? t.borderStrong : 'transparent'}`,
            textTransform: 'capitalize',
          }}>{l === 'all' ? 'Alle niveauer' : l}</button>
        ))}
      </div>

      {/* Exercise grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {filtered.map((lesson, idx) => {
          const done = completedIds.includes(lesson.id);
          const locked = lesson.premium && !isPremium;
          const lv = LEVELS[lesson.level];
          const toData = (l: typeof lesson): ExerciseDetailData => ({ key: l.id, title: l.title, sub: l.skills?.join(', ') || '', level: `Niveau ${l.level}`, bpm: l.bpm ? `${l.bpm.min}–${l.bpm.max}` : '–', tags: l.format });
          return (
            <Card key={lesson.id} t={t} pad={20} onClick={locked ? onUpgrade : () => { markOpened(lesson.id); setSelectedIdx(idx); setSelectedExercise(toData(lesson)); }} style={{ cursor: 'pointer', position: 'relative' }}>
              {done && (
                <div style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, borderRadius: '50%', background: t.goodSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IcCheck size={12} color={t.good} />
                </div>
              )}
              {locked && (
                <div style={{ position: 'absolute', top: 16, right: 16 }}><IcLock size={14} color={t.textDim} /></div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: lv?.color || t.accent }} />
                <span style={{ fontSize: 9.5, fontFamily: t.mono, fontWeight: 700, letterSpacing: 1, color: t.textMuted, textTransform: 'uppercase' }}>Niv. {lesson.level} · {lesson.duration} min</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 8, lineHeight: 1.35 }}>{lesson.title}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {lesson.format.map(f => (
                  <span key={f} style={{ padding: '3px 8px', borderRadius: 4, background: t.surface2, fontSize: 9.5, fontFamily: t.mono, color: t.textDim, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f}</span>
                ))}
                {lesson.bpm && (
                  <span style={{ padding: '3px 8px', borderRadius: 4, background: t.surface2, fontSize: 9.5, fontFamily: t.mono, color: t.textDim }}>{lesson.bpm.min}–{lesson.bpm.max} BPM</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: t.textMuted }}>
          <div style={{ fontSize: 14 }}>Ingen øvelser matcher dine filtre.</div>
        </div>
      )}

      {selectedExercise && (() => {
        const nextLesson = filtered[selectedIdx + 1];
        const nextData: ExerciseDetailData | undefined = nextLesson ? { key: nextLesson.id, title: nextLesson.title, sub: nextLesson.skills?.join(', ') || '', level: `Niveau ${nextLesson.level}`, bpm: nextLesson.bpm ? `${nextLesson.bpm.min}–${nextLesson.bpm.max}` : '–', tags: nextLesson.format } : undefined;
        return (
          <ExerciseDetailModal
            t={t}
            ex={selectedExercise}
            nextExercise={nextData}
            onNavigateNext={nextData ? () => { markOpened(nextData.key); setSelectedIdx(selectedIdx + 1); setSelectedExercise(nextData); } : undefined}
            onClose={() => setSelectedExercise(null)}
          />
        );
      })()}
    </div>
  );
}

// ─── STUDIO VIEW ─────────────────────────────────────────────
function StudioView({ t }: { t: T; dark?: boolean }) {
  const pads = [
    { label: 'Hi-hat', sub: 'Lukket', desc: 'Holdes lukket med foden. Giver en skarp, kort lyd. Bruges til at markere 8.-dele og 16.-dele.' },
    { label: 'Hi-hat', sub: 'Åben', desc: 'Åbnes med foden for en længere, svævende lyd. Bruges til accenter og variation i grooves.' },
    { label: 'Crash', desc: 'Cymbal med skarp, eksplosiv lyd. Bruges til at markere slag og overgange — typisk på takt 1.' },
    { label: 'Lilletromme', desc: 'Kernen i de fleste grooves. Spilles typisk på slag 2 og 4 i 4/4-takt. Snare-lyd.' },
    { label: 'Tom 1', sub: '10"', desc: 'Lille tom — høj toneleje. Bruges i fills fra høj til lav. Placeret tæt på bækkenet.' },
    { label: 'Tom 2', sub: '12"', desc: 'Mellemtom. Lidt dybere end Tom 1. Del af standard fill-bevægelsen nedad.' },
    { label: 'Gulvtom', sub: '14"', desc: 'Dyb, kraftfuld lyd. Sidder på gulvet til højre. Bruges som afslutning på fills og i tunge grooves.' },
    { label: 'Ride', sub: '20"', desc: 'Cymbal til rytmisk fremføring. Bruges i jazz og som alternativ til hi-hat. Giver en tydelig "ping"-lyd.' },
    { label: 'Stortromme', desc: 'Spilles med foden via en pedal. Markerer takt 1 og 3 i standard rock — fundamentet i alle grooves.' },
  ];
  const [selectedPad, setSelectedPad] = useState<number | null>(null);
  return (
    <div style={{ padding: '28px 44px 60px', color: t.text, fontFamily: t.font }}>
      <div style={{ marginBottom: 28 }}>
        <Sect t={t} color={t.accent}>Lær trommesættet at kende</Sect>
        <Display t={t} size={44}>Trommesættet</Display>
        <p style={{ fontSize: 13, color: t.textMuted, marginTop: 10, maxWidth: 520 }}>
          Tryk på en del af trommesættet for at se hvad den hedder og hvordan den bruges.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Pad grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, alignContent: 'start' }}>
          {pads.map((pad, i) => {
            const isSelected = selectedPad === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedPad(isSelected ? null : i)}
                style={{
                  padding: '20px 10px 16px',
                  borderRadius: 14,
                  border: `1.5px solid ${isSelected ? t.accent : t.border}`,
                  background: isSelected ? t.accentSoft : t.surface,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s',
                  transform: isSelected ? 'scale(0.97)' : 'scale(1)',
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? t.accent : t.text, textAlign: 'center' }}>{pad.label}</div>
                {pad.sub && <div style={{ fontSize: 9.5, fontFamily: t.mono, color: t.textDim }}>{pad.sub}</div>}
              </button>
            );
          })}
        </div>

        {/* Info panel */}
        <Card t={t} pad={24} style={{ alignSelf: 'start', minHeight: 200 }}>
          {selectedPad !== null ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: t.accent, marginBottom: 8 }}>
                {pads[selectedPad].label}{pads[selectedPad].sub ? ` — ${pads[selectedPad].sub}` : ''}
              </div>
              <p style={{ fontSize: 14, color: t.text, lineHeight: 1.7, margin: 0 }}>
                {pads[selectedPad].desc}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 160, color: t.textMuted, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🥁</div>
              <div style={{ fontSize: 13 }}>Tryk på en del af trommesættet for at lære om den.</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── RADIAL RING ──────────────────────────────────────────────
function RadialRing({ size = 100, pct = 62, sw = 8, color = '#f25545', track = 'rgba(255,255,255,0.08)', label, sub }: { size?: number; pct?: number; sw?: number; color?: string; track?: string; label: string; sub?: string }) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={sw} fill="none"/>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={sw} fill="none"
                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontStyle: 'italic', fontSize: size * 0.22, lineHeight: 1 }}>{label}</div>
        {sub && <div style={{ fontSize: size * 0.095, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── WEEK BARS ────────────────────────────────────────────────
function WeekBars({ values = [22, 38, 12, 0, 45, 30, 18], t }: { values?: number[]; t: T }) {
  const max = Math.max(...values, 1);
  const days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72, marginTop: 4 }}>
      {values.map((v, i) => {
        const h = Math.max(4, (v / max) * 62);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div className={`anim-pop d-${i * 50}`} style={{
              width: '100%', height: h,
              background: v > 0 ? `linear-gradient(180deg, #ff7a4f, ${t.accent})` : t.surface2,
              borderRadius: 4,
              boxShadow: v > 0 ? `0 0 8px rgba(242,85,69,0.25)` : 'none',
              transition: 'height 0.4s ease-out',
            }}/>
            <span style={{ fontSize: 9, color: t.textMuted, fontWeight: 600, fontFamily: t.mono }}>{days[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────
function ProfileView({ t, dark, setDark, isPremium, onUpgrade, completedIds, onReset, onNavigateExercises }: { t: T; dark: boolean; setDark: (d: boolean) => void; isPremium: boolean; onUpgrade: () => void; completedIds: string[]; onReset: () => void; onNavigateExercises?: () => void }) {
  const { user, login, logout } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoginLoading(true);
    try {
      await login();
    } catch {
      setErrorMsg('Fejl under login med Google. Prøv igen.');
    } finally {
      setLoginLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font }}>
      {/* User profile / Login form */}
      {!user ? (
        <div style={{ display: 'flex', gap: 40, marginBottom: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, maxWidth: 460 }}>
            <Sect t={t} color={t.accent}>Brugerstyring</Sect>
            <Display t={t} size={36} style={{ marginBottom: 14 }}>Log ind eller opret profil</Display>
            <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
              Log ind med din Google-konto for at gemme dine øvelser, fremskridt og skræddersyede AI-træningsplaner i skyen, så du kan tilgå dem fra enhver enhed.
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loginLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    background: t.surface,
                    border: `1px solid ${t.borderStrong}`,
                    borderRadius: 12,
                    padding: '12px 24px',
                    color: t.text,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: t.font,
                    outline: 'none',
                    cursor: loginLoading ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                  onMouseOver={(e) => { if (!loginLoading) e.currentTarget.style.background = t.surface2; }}
                  onMouseOut={(e) => { if (!loginLoading) e.currentTarget.style.background = t.surface; }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.56 2.69-3.86 2.69-6.57z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.33-1.58-5.04-3.71H.94v2.3C2.42 16.03 5.48 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.96 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.94A8.99 8.99 0 000 9c0 1.45.35 2.82.94 4.04l3.02-2.3z"/>
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.41 0 9 0 5.48 0 2.42 1.97.94 4.96l3.02 2.3c.71-2.13 2.69-3.71 5.04-3.71z"/>
                  </svg>
                  {loginLoading ? 'Logger ind...' : 'Fortsæt med Google'}
                </button>
              </div>
              {errorMsg && (
                <div style={{ color: t.accent, fontSize: 12, fontWeight: 500 }}>{errorMsg}</div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', marginTop: 24 }}>
            <Btn t={t} variant="secondary" onClick={() => setDark(!dark)} icon={dark ? <IcSun size={14} /> : <IcMoon size={14} />}>
              {dark ? 'Lys tilstand' : 'Mørk tilstand'}
            </Btn>
          </div>
        </div>
      ) : (
        /* Logged in state */
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 40 }}>
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              style={{ 
                width: 110, height: 110, borderRadius: '50%', 
                objectFit: 'cover', border: `3px solid ${t.accent}`,
                boxShadow: '0 16px 40px rgba(239,90,58,0.25)'
              }} 
            />
          ) : (
            <div style={{ 
              width: 110, height: 110, borderRadius: '50%', background: t.accent, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: '#fff', fontFamily: t.serif, fontStyle: 'italic', fontSize: 42, 
              boxShadow: '0 16px 40px rgba(239,90,58,0.4)' 
            }}>
              {getInitials(user.displayName)}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Sect t={t} color={t.accent} style={{ marginBottom: 0 }}>
                {user.role === 'admin' ? 'Administrator' : `Niveau 1 · ${isPremium ? 'PRO' : 'Gratis'}`}
              </Sect>
              {isPremium ? <Badge t={t} tone="good">✦ Premium</Badge> : <Badge t={t} tone="accent">Gratis plan</Badge>}
            </div>
            <Display t={t} size={52}>{user.displayName}</Display>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>{user.email}</div>
            
            {user.role === 'admin' && (
              <div style={{ marginTop: 12 }}>
                <a href="/admin" style={{ 
                  color: t.accent, textDecoration: 'none', fontSize: 13, 
                  fontWeight: 600, borderBottom: `1px solid ${t.accent}` 
                }}>
                  Gå til Admin-panel →
                </a>
              </div>
            )}
            
            <div style={{ marginTop: 16, maxWidth: 380 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5 }}>
                <span>Niv. 1</span><span>120 / 200 XP</span><span>Niv. 2</span>
              </div>
              <Prog pct={60} t={t} h={6} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isPremium && <Btn t={t} onClick={onUpgrade}>Køb Premium</Btn>}
            <Btn t={t} variant="secondary" onClick={logout}>Log ud</Btn>
            <Btn t={t} variant="secondary" onClick={() => setDark(!dark)} icon={dark ? <IcSun size={14} /> : <IcMoon size={14} />}>
              {dark ? 'Lys tilstand' : 'Mørk tilstand'}
            </Btn>
          </div>
        </div>
      )}

      {/* Stats grid — 2+2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Streak tile */}
        <Card t={t} pad={20} style={{ position: 'relative', overflow: 'hidden' }} className="anim-fade-up d-80">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <IcFlame size={14} color={t.accent} />
            <Sect t={t} style={{ marginBottom: 0, fontSize: 9 }}>Streak</Sect>
          </div>
          <Display t={t} size={56} style={{ lineHeight: 0.9, marginBottom: 4 }}>
            {user?.streak || 0}
          </Display>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>dage i træk</div>
          {/* Celebration rings */}
          {(user?.streak || 0) >= 7 && (
            <div className="anim-celeb" style={{ position: 'absolute', bottom: -20, right: -20, width: 60, height: 60 }}>
              <i style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${t.accent}`, animationDelay: '0ms' }}/>
              <i style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${t.accent}`, animationDelay: '500ms' }}/>
            </div>
          )}
        </Card>

        {/* XP radial ring */}
        <Card t={t} pad={20} className="anim-fade-up d-160">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <IcTrophy size={14} color={t.good} />
            <Sect t={t} style={{ marginBottom: 0, fontSize: 9 }}>Niveau {user?.level || 1}</Sect>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 6px' }}>
            <RadialRing
              size={90}
              pct={((user?.xp || 0) % 200) / 2}
              label={`${Math.round(((user?.xp || 0) % 200) / 2)}%`}
              sub={`til niv. ${(user?.level || 1) + 1}`}
              color={t.accent}
              track="rgba(255,255,255,0.07)"
            />
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, textAlign: 'center', marginTop: 4 }}>
            {200 - ((user?.xp || 0) % 200)} XP til næste
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 40 }}>
        {/* Week bars */}
        <Card t={t} pad={18} className="anim-fade-up d-240">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IcClock size={14} color={t.text} />
              <Sect t={t} style={{ marginBottom: 0, fontSize: 9 }}>Denne uge</Sect>
            </div>
            <span style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted }}>2t 45m</span>
          </div>
          <WeekBars values={[22, 38, 12, 0, 45, 30, 18]} t={t} />
        </Card>

        {/* Completed count */}
        <Card t={t} pad={18} className="anim-fade-up d-320">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <IcCheck size={14} color={t.good} />
            <Sect t={t} style={{ marginBottom: 0, fontSize: 9 }}>Færdige</Sect>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <Display t={t} size={52} style={{ lineHeight: 0.9 }}>{completedIds.length || 34}</Display>
            <IcCheck size={18} color={t.good} sw={2.5} />
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>lektioner i alt</div>
        </Card>
      </div>

      {/* Pillars progress */}
      <Sect t={t} style={{ marginBottom: 14 }}>Fremskridt per søjle</Sect>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
        {PILLARS.map((p, pi) => {
          const pillarLessons = MODULES.filter(m => m.pillarId === p.id).flatMap(m => m.lessons);
          const done = pillarLessons.filter(l => completedIds.includes(l.id)).length;
          const pct = pillarLessons.length ? Math.round((done / pillarLessons.length) * 100) : 0;
          return (
            <div
              key={p.id}
              className={`card-lift anim-fade-up d-${(pi + 4) * 80}`}
              onClick={onNavigateExercises}
              style={{
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14,
                padding: '12px 16px', cursor: onNavigateExercises ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{p.name}</span>
                  </div>
                  <span style={{ fontFamily: t.mono, fontSize: 11, color: t.textMuted }}>{pct}%</span>
                </div>
                <div className="bar anim-progress" style={{ height: 5 }}>
                  <i style={{ '--pct': pct + '%' } as React.CSSProperties} />
                </div>
                <div style={{ fontSize: 10, color: t.textDim, marginTop: 5, fontFamily: t.mono }}>{done}/{pillarLessons.length} lektioner</div>
              </div>
              {onNavigateExercises && <IcChev size={12} color={t.textDim} />}
            </div>
          );
        })}
      </div>

      {/* Settings */}
      <Sect t={t}>Indstillinger & Data</Sect>
      <Card t={t} pad={20}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={onReset} style={{
            background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 10,
            padding: '12px 16px', color: t.textMuted, fontSize: 12.5, cursor: 'pointer',
            textAlign: 'left', fontFamily: t.font, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <IcLoop size={15} /> Nulstil lokal database og premium status
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── CHECKOUT MODAL ───────────────────────────────────────────
function CheckoutModal({ t, onClose, onSuccess }: { t: T; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<'pricing' | 'method' | 'processing' | 'success'>('pricing');
  const [method, setMethod] = useState<'card' | 'mobilepay'>('card');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [phone, setPhone] = useState('');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => { setPremiumStatus(true); onSuccess(); setStep('success'); }, 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: 24, padding: '40px 44px', width: 520, maxWidth: '90vw',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)', position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: t.surface2, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✕</button>

        {step === 'pricing' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent, marginBottom: 12 }}>Pocket Drummer Premium</div>
              <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 40, color: t.text, lineHeight: 1.1, marginBottom: 8 }}>Fuld adgang til alt</div>
              <p style={{ color: t.textMuted, fontSize: 13.5, lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>AI-læringsplaner, 300+ øvelser, play-alongs og din personlige AI Coach.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              {[
                { name: 'Gratis', price: '0 kr.', period: 'for altid', features: ['10 begynderlektioner', 'Statiske noder', 'Simpel play-along', 'Basis Studio Kit'], cta: 'Aktiv plan', disabled: true },
                { name: 'Premium', price: '50 kr.', period: 'pr. måned', features: ['300+ øvelser', 'AI-læringsplan', 'Interaktive noder', 'Play-along Academy', 'Ubegrænset AI Coach'], cta: 'Start 4-ugers prøve', highlight: true },
              ].map((plan, i) => (
                <div key={i} style={{
                  padding: '22px 20px', borderRadius: 16,
                  border: `1.5px solid ${plan.highlight ? t.accent : t.border}`,
                  background: plan.highlight ? t.accentSoft : t.surface2,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: plan.highlight ? t.accent : t.textMuted, marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontFamily: t.mono, fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 }}>{plan.price}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 18, fontFamily: t.mono }}>{plan.period}</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, flex: 1 }}>
                    {plan.features.map((f, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: plan.highlight ? t.text : t.textMuted }}>
                        <IcCheck size={13} color={plan.highlight ? t.accent : t.textDim} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => !plan.disabled && setStep('method')} disabled={plan.disabled} style={{
                    padding: '11px 18px', borderRadius: 10,
                    background: plan.highlight ? t.accent : 'transparent',
                    color: plan.highlight ? '#fff' : t.textMuted,
                    border: `1px solid ${plan.highlight ? t.accent : t.border}`,
                    fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                    cursor: plan.disabled ? 'default' : 'pointer',
                    boxShadow: plan.highlight ? '0 6px 20px rgba(239,90,58,0.3)' : 'none',
                    opacity: plan.disabled ? 0.5 : 1,
                  }}>
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: t.textDim }}>Ingen binding · Opsig når som helst · Sikker betaling via Stripe</p>
          </>
        )}

        {step === 'method' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <button onClick={() => setStep('pricing')} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: 0, marginBottom: 20 }}>
                <IcBack size={14} /> Tilbage
              </button>
              <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 28, color: t.text, marginBottom: 6 }}>Vælg betalingsmetode</div>
              <p style={{ color: t.textMuted, fontSize: 12.5 }}>4-ugers prøveperiode — derefter 50 kr./md.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {(['card', 'mobilepay'] as const).map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{
                  flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${method === m ? t.accent : t.border}`,
                  background: method === m ? t.accentSoft : t.surface2,
                  color: method === m ? t.accent : t.textMuted,
                  fontFamily: t.font, fontSize: 13, fontWeight: 600,
                }}>
                  {m === 'card' ? '💳 Kreditkort' : '📱 MobilePay'}
                </button>
              ))}
            </div>
            {method === 'card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Kortnummer</label>
                  <input value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="4242 4242 4242 4242" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Udløb</label>
                    <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/ÅÅ" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>CVC</label>
                    <input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="CVC" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', background: t.surface2, borderRadius: 12, marginBottom: 24 }}>
                <p style={{ color: t.textMuted, marginBottom: 12, fontSize: 13 }}>Indtast dit telefonnummer:</p>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+45 12 34 56 78" style={{ background: 'transparent', border: 'none', outline: 'none', color: t.text, fontFamily: t.mono, fontSize: 22, fontWeight: 700, textAlign: 'center', width: '100%' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn t={t} variant="secondary" onClick={onClose} wide>Annuller</Btn>
              <Btn t={t} onClick={handlePay} wide>Godkend betaling</Btn>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 52, height: 52, border: `4px solid ${t.border}`, borderTop: `4px solid ${t.accent}`, borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 0.8s linear infinite' }} />
            <Display t={t} size={24} style={{ marginBottom: 8 }}>Behandler betaling…</Display>
            <p style={{ color: t.textMuted, fontSize: 13 }}>Opretter sikkert abonnement via Stripe</p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <Display t={t} size={32} style={{ marginBottom: 12 }}>Velkommen til Premium!</Display>
            <p style={{ color: t.textMuted, fontSize: 13.5, lineHeight: 1.6, marginBottom: 28 }}>
              Din konto er nu opgraderet. Du har fuld adgang til alle lektioner, AI Coach og play-alongs.
            </p>
            <Btn t={t} onClick={onClose} wide size="lg">Begynd at øve</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const router = useRouter();
  const { user, syncCompletedExercises, syncPremiumStatus } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dark, setDark] = useState(false); // Default to Light mode
  const [selectedCategory, setSelectedCategory] = useState<'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null>(null);
  const [view, setView] = useState<ViewId>('home');
  const [coachOpen, setCoachOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [, setPlan] = useState<UserPlan | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const t = useMemo(() => mkT(dark), [dark]);
  // Sync state with user profile
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        setCompletedIds(user.completedExercises || []);
        setIsPremium(user.isPremium || false);
      } else {
        setCompletedIds(getCompletedExercises());
        setIsPremium(getPremiumStatus());
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (mobile) {
      router.replace('/prototype');
      return;
    }

    const landingSeen = localStorage.getItem('pocketdrummer_landing_seen');
    if (!landingSeen) {
      router.replace('/landing');
      return;
    }

    const timer = setTimeout(() => {
      setMounted(true);
      setIsMobile(mobile);
      setPlan(getUserPlan());
      if (!user) {
        setCompletedIds(getCompletedExercises());
        setIsPremium(getPremiumStatus());
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [router, user]);

  const openCheckout = () => setShowCheckout(true);
  const handlePremiumSuccess = () => {
    setIsPremium(true);
    syncPremiumStatus(true);
  };
  const handleReset = () => {
    resetMockDatabase();
    setIsPremium(false);
    setCompletedIds([]);
    setPlan(null);
    if (user) {
      syncCompletedExercises([]);
      syncPremiumStatus(false);
    }
  };

  // Loading / redirect state
  if (!mounted || isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#252525' }}>
          Pocket Drummer<span style={{ color: '#F25545' }}>.</span>
        </div>
      </div>
    );
  }

  // Render current view
  let content: React.ReactNode;
  if (view === 'home') {
    content = (
      <HomeView
        t={t}
        dark={dark}
        setDark={setDark}
        onView={setView}
        isPremium={isPremium}
        onUpgrade={openCheckout}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setView('category');
        }}
      />
    );
  }
  else if (view === 'category') {
    content = (
      <CategoryDetailView
        t={t}
        category={selectedCategory || 'opvarmning'}
        onBack={() => { setView('home'); setSelectedCategory(null); }}
        isPremium={isPremium}
        onUpgrade={openCheckout}
      />
    );
  }
  else if (view === 'exercises') content = <ExercisesView t={t} isPremium={isPremium} onUpgrade={openCheckout} completedIds={completedIds} />;
  else if (view === 'studio') content = <StudioView t={t} dark={dark} />;
  else if (view === 'profile') content = <ProfileView t={t} dark={dark} setDark={setDark} isPremium={isPremium} onUpgrade={openCheckout} completedIds={completedIds} onReset={handleReset} onNavigateExercises={() => setView('exercises')} />;

  const hideCoach = view === 'studio';

  return (
    <div style={{ width: '100vw', height: '100vh', background: t.bg, color: t.text, fontFamily: t.font, display: 'flex', overflow: 'hidden' }}>
      <Sidebar
        t={t}
        view={view}
        onView={setView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dark={dark}
        isPremium={isPremium}
        onUpgrade={openCheckout}
      />
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {content}
        {!hideCoach && (
          <CoachPanel
            t={t}
            dark={dark}
            open={coachOpen}
            onToggle={() => setCoachOpen(!coachOpen)}
            isPremium={isPremium}
            onUpgrade={openCheckout}
            onNavigate={(v, cat) => {
              if (cat) { setSelectedCategory(cat); setView('category'); }
              else setView(v);
              setCoachOpen(false);
            }}
          />
        )}
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal t={t} onClose={() => setShowCheckout(false)} onSuccess={handlePremiumSuccess} />
      )}

    </div>
  );
}

