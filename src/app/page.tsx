'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IcHome, IcBook, IcSpark, IcUser, IcPlay, IcBack, IcChev, IcCheck, IcLock,
  IcSun, IcMoon, IcSend, IcFlame, IcClock, IcTrophy, IcBell,
  TabKit, TabPractice, RadialProgress, IllSnare, IllKit, IllSticks, DrumNotation,
  IcMetro, IcLoop, IcMin, IcPlus,
} from '@/components/DesktopIcons';
import {
  getSavedExercises, getUserGoal, getUserPlan, getCompletedExercises,
  getPremiumStatus, setPremiumStatus, resetMockDatabase,
  Exercise, UserPlan,
} from '@/lib/mockData';
import {
  LEVELS, MODULES, PILLARS,
  CurriculumLevel, CurriculumModule, CurriculumLesson,
} from '@/lib/curriculum';

// ─── DESIGN TOKENS ────────────────────────────────────────────
interface T {
  bg: string; sidebar: string; surface: string; surface2: string;
  surfaceElev: string; border: string; borderStrong: string;
  text: string; textMuted: string; textDim: string;
  accent: string; accentDeep: string; accentSoft: string; accentText: string;
  good: string; goodSoft: string; mono: string; font: string; serif: string;
}
const mkT = (dark = true): T => ({
  bg: dark ? '#0a0a0a' : '#f4f1ec',
  sidebar: dark ? '#0e0e10' : '#e8e4dd',
  surface: dark ? '#141416' : '#ffffff',
  surface2: dark ? '#1c1c1f' : '#ebe7e0',
  surfaceElev: dark ? '#212124' : '#ffffff',
  border: dark ? 'rgba(255,255,255,0.06)' : 'rgba(20,20,28,0.08)',
  borderStrong: dark ? 'rgba(255,255,255,0.13)' : 'rgba(20,20,28,0.14)',
  text: dark ? '#f4f1ec' : '#16161a',
  textMuted: dark ? '#8a8580' : '#6e6a62',
  textDim: dark ? '#56524c' : '#a8a39a',
  accent: '#ef5a3a',
  accentDeep: '#d94527',
  accentSoft: dark ? 'rgba(239,90,58,0.13)' : 'rgba(239,90,58,0.10)',
  accentText: dark ? '#f5b8a8' : '#a83419',
  good: '#5dd39e',
  goodSoft: dark ? 'rgba(93,211,158,0.14)' : 'rgba(93,211,158,0.14)',
  mono: 'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  serif: '"DM Serif Display", "Playfair Display", Georgia, serif',
});

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────
const Sect = ({ children, t, color, style = {} }: { children: React.ReactNode; t: T; color?: string; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: t.font, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: color || t.textMuted, marginBottom: 14, ...style }}>{children}</div>
);

const Card = ({ children, t, style = {}, onClick, pad = 24 }: { children: React.ReactNode; t: T; style?: React.CSSProperties; onClick?: () => void; pad?: number }) => (
  <div onClick={onClick} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: pad, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.2s', ...style }}>
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
type ViewId = 'home' | 'academy' | 'exercises' | 'studio' | 'profile';
const NAV_ITEMS: { id: ViewId; label: string; icon: React.FC<any> }[] = [
  { id: 'home', label: 'Hjem', icon: IcHome },
  { id: 'academy', label: 'Akademi', icon: IcBook },
  { id: 'exercises', label: 'Øvelser', icon: TabPractice },
  { id: 'studio', label: 'Studio Kit', icon: ({ size, color, sw }: any) => <TabKit size={size} color={color} sw={sw} /> },
  { id: 'profile', label: 'Profil', icon: IcUser },
];

function Sidebar({ t, view, onView, dark, isPremium, onUpgrade }: { t: T; view: ViewId; onView: (v: ViewId) => void; dark: boolean; isPremium: boolean; onUpgrade: () => void }) {
  return (
    <div style={{ width: 240, height: '100%', flexShrink: 0, background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', padding: '18px 14px 16px' }}>
      {/* Brand */}
      <div style={{ padding: '4px 6px 24px' }}>
        <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 22, letterSpacing: -0.5, color: t.text, display: 'flex', alignItems: 'baseline', gap: 2 }}>
          DrumLab<span style={{ color: t.accent, fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{ fontSize: 10, fontFamily: t.mono, color: t.textDim, letterSpacing: 0.5, marginTop: 2 }}>ACADEMY</div>
      </div>

      {/* Search */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.textDim} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input placeholder="Søg øvelser, genrer…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontFamily: t.font, fontSize: 12, padding: 0, margin: 0 }} />
        <span style={{ fontFamily: t.mono, fontSize: 9, color: t.textDim, padding: '1px 5px', borderRadius: 4, border: `1px solid ${t.border}` }}>⌘K</span>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Sect t={t} style={{ marginBottom: 8 }}>Naviger</Sect>
        {NAV_ITEMS.map(it => {
          const active = view === it.id;
          return (
            <button key={it.id} onClick={() => onView(it.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px',
              background: active ? t.accentSoft : 'transparent',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              color: active ? t.accent : t.text, fontFamily: t.font,
              fontSize: 13.5, fontWeight: active ? 600 : 450, textAlign: 'left', width: '100%',
            }}>
              <it.icon size={17} color={active ? t.accent : t.textMuted} sw={active ? 1.8 : 1.4} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.accent }} />}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

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
          <p style={{ fontSize: 11.5, margin: '0 0 12px', color: t.textMuted, lineHeight: 1.5 }}>
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

      {/* User chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 6px 0', borderTop: `1px solid ${t.border}`, marginTop: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>AL</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Anders Lind</div>
          <div style={{ fontSize: 10, color: t.textMuted, fontFamily: t.mono }}>Niveau 1 · {isPremium ? 'PRO' : 'FREE'}</div>
        </div>
      </div>
    </div>
  );
}

// ─── AI COACH PANEL ───────────────────────────────────────────
interface ChatMessage { role: 'ai' | 'user'; text: string }
function CoachPanel({ t, dark, open, onToggle, isPremium, onUpgrade }: { t: T; dark: boolean; open: boolean; onToggle: () => void; isPremium: boolean; onUpgrade: () => void }) {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Hej 👋 Jeg er din AI-trommerlærer.\n\nHvad øver du dig på i dag?' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = () => {
    if (!input.trim()) return;
    if (!isPremium && msgs.filter(m => m.role === 'user').length >= 2) { onUpgrade(); return; }
    const q = input.trim();
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: q }]);
    setTyping(true);
    setTimeout(() => {
      const replies: Record<string, string> = {
        timing: 'Prøv: Sæt metronomen til 60 BPM og spil kun fjerdedele i 2 minutter. Øg 5 BPM ad gangen.',
        fills: 'Begynd enkelt: én takt fill med ottendedele på lilletrommen. Tilføj gradvist tammerne.',
        ghost: 'Ghost notes kræver tålmodighed. Spil dem på dynamik pp — næsten uhørlige. Start på 60 BPM.',
        shuffle: 'Shuffle-feel: tænk "trioli-trioli" i ottendedele. Midterslaget fjedles.',
      };
      const match = Object.keys(replies).find(k => q.toLowerCase().includes(k));
      const reply = match ? replies[match] : 'Godt spørgsmål! Hvad er dit nuværende niveau, og hvad øver du dig mest på?';
      setTyping(false);
      setMsgs(prev => [...prev, { role: 'ai', text: reply }]);
    }, 900);
  };

  if (!open) return (
    <button onClick={onToggle} style={{
      position: 'absolute', bottom: 28, right: 24, width: 48, height: 48, borderRadius: '50%',
      background: t.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(239,90,58,0.45)',
    }}>
      <IcSpark size={20} color="#fff" />
    </button>
  );

  return (
    <div style={{ width: 340, height: '100%', flexShrink: 0, borderLeft: `1px solid ${t.border}`, background: t.sidebar, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IcSpark size={15} color={t.accent} />
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>AI Coach</span>
            <Badge t={t} tone="accent">PRO</Badge>
          </div>
          <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 2 }}>Personlig trommerlærer</div>
        </div>
        <button onClick={onToggle} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 4 }}>
          <IcMin size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? t.accent : t.surface,
              color: m.role === 'user' ? '#fff' : t.text,
              border: m.role === 'user' ? 'none' : `1px solid ${t.border}`,
              fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: t.surface, borderRadius: 14, width: 'fit-content', border: `1px solid ${t.border}` }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: t.textMuted, animation: `bounce 0.8s ${i * 0.15}s infinite alternate` }} />)}
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
      <style>{`@keyframes bounce { to { transform: translateY(-5px); opacity: 0.4; } }`}</style>
    </div>
  );
}

// ─── HOME VIEW ────────────────────────────────────────────────
function HomeView({ t, dark, setDark, onView, isPremium, onUpgrade }: { t: T; dark: boolean; setDark: (d: boolean) => void; onView: (v: ViewId) => void; isPremium: boolean; onUpgrade: () => void }) {
  const today = new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
  const stats = [
    { label: 'Streak', value: '7', sub: 'dage', icon: <IcFlame size={15} color="#ef5a3a" /> },
    { label: 'Uge', value: '2t 14m', sub: '4/7 dage', icon: <IcClock size={15} color={t.textMuted} /> },
    { label: 'Niveau', value: 'Niv. 1', sub: '120 / 200 XP', icon: <IcTrophy size={15} color={t.textMuted} /> },
    { label: 'Lektioner', value: '8', sub: 'gennemført', icon: <IcCheck size={15} color={t.good} /> },
  ];

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font, maxWidth: 1100 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted, marginBottom: 10 }}>
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </div>
          <Display t={t} size={52}>God øvelse, Anders</Display>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDark(!dark)} style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {dark ? <IcSun size={15} /> : <IcMoon size={15} />}
          </button>
          <button style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <IcBell size={15} />
            <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: t.accent }} />
          </button>
        </div>
      </div>

      {/* Hero grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 24 }}>
        {/* Daily goal */}
        <Card t={t} pad={24} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <RadialProgress size={120} pct={40} color={t.accent} track={dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} sw={9} label="40%" t={t} />
          <div style={{ flex: 1 }}>
            <Sect t={t}>Daglig mål</Sect>
            <div style={{ fontFamily: t.mono, fontSize: 15, fontWeight: 600 }}>8 <span style={{ color: t.textMuted, fontWeight: 500 }}>/ 20 min</span></div>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 16, marginTop: 8, color: t.text, lineHeight: 1.25 }}>Bliv ved — du er godt i gang!</div>
            <div style={{ marginTop: 14 }}><Prog pct={40} t={t} /></div>
          </div>
        </Card>

        {/* Continue lesson */}
        <Card t={t} pad={0} style={{ overflow: 'hidden', display: 'flex' }}>
          <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <Sect t={t}>Fortsæt hvor du slap</Sect>
              <Display t={t} size={26} style={{ marginBottom: 6 }}>Single Stroke Roll</Display>
              <div style={{ fontSize: 11.5, color: t.textMuted, fontFamily: t.mono, letterSpacing: 0.5 }}>MODUL 2 · LEKTION 1 · 10 MIN</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5 }}>
                <span>FREMSKRIDT</span><span>30%</span>
              </div>
              <Prog pct={30} t={t} h={4} />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Btn t={t} icon={<IcPlay size={11} />}>Fortsæt</Btn>
                <Btn t={t} variant="ghost">Detaljer</Btn>
              </div>
            </div>
          </div>
          <div style={{ width: 200, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? '#101012' : '#ebe7e0', borderLeft: `1px solid ${t.border}` }}>
            <div style={{ position: 'absolute', width: 200, height: 200, background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 65%)` }} />
            <div style={{ position: 'relative' }}><IllSnare size={160} color={t.accent} sw={1.4} /></div>
          </div>
        </Card>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <Card key={i} t={t} pad={18}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${t.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: t.textMuted }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 34, lineHeight: 1, color: t.text }}>{s.value}</div>
            <div style={{ fontSize: 10.5, color: t.textDim, fontFamily: t.mono, marginTop: 4 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Anbefalet i dag */}
      <Sect t={t}>Anbefalet i dag</Sect>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 36 }}>
        {[
          { title: 'Double Strokes', mod: 'Modul 2', dur: '10 min', tag: 'TEKNIK', premium: false },
          { title: 'Basic Rockbeat', mod: 'Modul 3', dur: '12 min', tag: 'GROOVE', premium: false },
          { title: 'Fill uden tempo-tab', mod: 'Modul 6', dur: '10 min', tag: 'TIMING', premium: true },
        ].map((item, i) => (
          <Card key={i} t={t} pad={20} onClick={item.premium && !isPremium ? onUpgrade : undefined} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            {item.premium && !isPremium && (
              <div style={{ position: 'absolute', top: 14, right: 14 }}><IcLock size={13} color={t.textDim} /></div>
            )}
            <Sect t={t} color={t.accent} style={{ marginBottom: 6 }}>{item.tag}</Sect>
            <Display t={t} size={18} style={{ marginBottom: 6 }}>{item.title}</Display>
            <div style={{ fontSize: 11, color: t.textMuted, fontFamily: t.mono }}>{item.mod} · {item.dur}</div>
            {item.premium && !isPremium && (
              <div style={{ marginTop: 12 }}><Badge t={t} tone="accent">Premium</Badge></div>
            )}
          </Card>
        ))}
      </div>

      {/* Dagens node */}
      <Sect t={t}>Dagens nodevisning</Sect>
      <Card t={t} pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ padding: '24px 28px', flex: 1 }}>
            <Display t={t} size={22} style={{ marginBottom: 6 }}>Basic Rock Groove</Display>
            <div style={{ fontSize: 11, color: t.textMuted, fontFamily: t.mono, marginBottom: 20 }}>4/4 · 90 BPM · BEGYNDER</div>
            <DrumNotation color={dark ? '#f4f1ec' : '#16161a'} width={400} accent={t.accent} active={2} />
          </div>
          <div style={{ width: 200, background: dark ? '#101012' : '#f0ece6', borderLeft: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
            <Btn t={t} icon={<IcPlay size={11} />} size="sm">Afspil</Btn>
            <Btn t={t} variant="secondary" size="sm">PDF</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── ACADEMY VIEW ─────────────────────────────────────────────
function AcademyView({ t, dark, isPremium, onUpgrade, completedIds }: { t: T; dark: boolean; isPremium: boolean; onUpgrade: () => void; completedIds: string[] }) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const userXP = 120; // mock
  const currentLevel = LEVELS.findIndex((l, i) => {
    const next = LEVELS[i + 1];
    return userXP >= l.xpRequired && (!next || userXP < next.xpRequired);
  });

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font }}>
      <Display t={t} size={48} style={{ marginBottom: 6 }}>DrumLab Akademi</Display>
      <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 36, maxWidth: 580, lineHeight: 1.6 }}>
        Et komplet undervisningsprogram fra begynder til avanceret. Følg din personlige læringssti gennem 6 niveauer og 10 moduler.
      </p>

      {/* Level selector */}
      <Sect t={t}>Dit læringsforløb</Sect>
      <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
        {LEVELS.map((lv, i) => {
          const unlocked = userXP >= lv.xpRequired;
          const active = i === currentLevel;
          const selected = selectedLevel === i;
          return (
            <button key={lv.id} onClick={() => setSelectedLevel(selected ? null : i)} style={{
              padding: '10px 18px', borderRadius: 999, cursor: unlocked ? 'pointer' : 'default',
              background: selected ? lv.color : active ? t.accentSoft : t.surface2,
              color: selected ? '#fff' : active ? t.accent : unlocked ? t.text : t.textDim,
              border: active ? `1px solid ${t.accent}` : `1px solid ${selected ? 'transparent' : t.border}`,
              fontFamily: t.font, fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 7, opacity: unlocked ? 1 : 0.5,
              transition: 'all 0.2s',
            }}>
              {!unlocked && <IcLock size={11} />}
              {active && <span style={{ fontSize: 8, background: t.accent, color: '#fff', padding: '2px 5px', borderRadius: 4, fontWeight: 800, letterSpacing: 0.5 }}>AKTIV</span>}
              Niv. {i} — {lv.name}
            </button>
          );
        })}
      </div>

      {/* Selected level detail */}
      {selectedLevel !== null && (
        <Card t={t} pad={28} style={{ marginBottom: 36, border: `1px solid ${LEVELS[selectedLevel].color}33` }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: LEVELS[selectedLevel].color }} />
                <Sect t={t} color={LEVELS[selectedLevel].color} style={{ marginBottom: 0 }}>{LEVELS[selectedLevel].subtitle}</Sect>
                <span style={{ fontSize: 11, color: t.textDim, fontFamily: t.mono }}>· {LEVELS[selectedLevel].duration}</span>
              </div>
              <Display t={t} size={30} style={{ marginBottom: 14 }}>Niveau {selectedLevel}: {LEVELS[selectedLevel].name}</Display>
              <p style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.6, marginBottom: 18, maxWidth: 500 }}>{LEVELS[selectedLevel].description}</p>
              <Sect t={t} style={{ marginBottom: 8 }}>Du lærer</Sect>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LEVELS[selectedLevel].objectives.map((obj, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: t.textMuted }}>
                    <IcCheck size={14} color={LEVELS[selectedLevel].color} />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ width: 220, padding: '16px 20px', background: t.surface2, borderRadius: 14, flexShrink: 0 }}>
              <Sect t={t} style={{ marginBottom: 10 }}>Slutmål</Sect>
              <p style={{ fontSize: 12.5, color: t.textMuted, lineHeight: 1.6, fontStyle: 'italic' }}>{LEVELS[selectedLevel].finalGoal}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Modules grid */}
      <Sect t={t}>Moduler ({MODULES.length} i alt · {MODULES.reduce((a, m) => a + m.lessons.length, 0)} lektioner)</Sect>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {MODULES.map(mod => {
          const pillar = PILLARS.find(p => p.id === mod.pillarId);
          const completedInMod = mod.lessons.filter(l => completedIds.includes(l.id)).length;
          const pct = Math.round((completedInMod / mod.lessons.length) * 100);
          const expanded = selectedModule === mod.id;
          return (
            <div key={mod.id}>
              <Card t={t} pad={22} onClick={() => setSelectedModule(expanded ? null : mod.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {pillar?.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontFamily: t.mono, color: t.textDim }}>MOD. {mod.number.toString().padStart(2, '0')}</span>
                      <span style={{ fontSize: 10, fontFamily: t.mono, color: t.textMuted }}>Niv. {mod.levelMin}{mod.levelMax !== mod.levelMin ? `–${mod.levelMax}` : ''}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 4 }}>{mod.name}</div>
                    <div style={{ fontSize: 11.5, color: t.textMuted, marginBottom: 12 }}>{mod.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Prog pct={pct} t={t} h={3} />
                      <span style={{ fontSize: 10, fontFamily: t.mono, color: t.textDim, flexShrink: 0 }}>{completedInMod}/{mod.lessons.length}</span>
                    </div>
                  </div>
                  <IcChev size={16} color={t.textDim} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </Card>

              {/* Expanded lesson list */}
              {expanded && (
                <div style={{ marginTop: 2, background: t.surface2, borderRadius: '0 0 16px 16px', padding: '8px 0', border: `1px solid ${t.border}`, borderTop: 'none' }}>
                  {mod.lessons.map((lesson, li) => {
                    const done = completedIds.includes(lesson.id);
                    const locked = lesson.premium && !isPremium;
                    return (
                      <div key={lesson.id} onClick={locked ? onUpgrade : undefined} style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '10px 22px',
                        cursor: 'pointer', borderBottom: li < mod.lessons.length - 1 ? `1px solid ${t.border}` : 'none',
                        opacity: locked ? 0.6 : 1,
                      }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${done ? t.good : t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? t.goodSoft : 'transparent', flexShrink: 0 }}>
                          {done && <IcCheck size={12} color={t.good} />}
                          {locked && <IcLock size={11} color={t.textDim} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: done ? 500 : 600, color: done ? t.textMuted : t.text }}>{lesson.title}</div>
                          <div style={{ fontSize: 10.5, color: t.textDim, fontFamily: t.mono, marginTop: 2 }}>
                            {lesson.duration} min
                            {lesson.bpm && ` · ${lesson.bpm.min}–${lesson.bpm.max} BPM`}
                            {' · '}{lesson.format.join(', ')}
                          </div>
                        </div>
                        {!locked && !done && <IcPlay size={13} color={t.accent} />}
                        {locked && <Badge t={t} tone="accent">PRO</Badge>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── EXERCISES VIEW ───────────────────────────────────────────
function ExercisesView({ t, exercises, isPremium, onUpgrade, completedIds }: { t: T; exercises: Exercise[]; isPremium: boolean; onUpgrade: () => void; completedIds: string[] }) {
  const [catFilter, setCatFilter] = useState('all');
  const [lvlFilter, setLvlFilter] = useState('all');
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
        {filtered.map((lesson) => {
          const done = completedIds.includes(lesson.id);
          const locked = lesson.premium && !isPremium;
          const lv = LEVELS[lesson.level];
          return (
            <Card key={lesson.id} t={t} pad={20} onClick={locked ? onUpgrade : undefined} style={{ cursor: 'pointer', position: 'relative' }}>
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
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14 }}>Ingen øvelser matcher dine filtre.</div>
        </div>
      )}
    </div>
  );
}

// ─── STUDIO VIEW ─────────────────────────────────────────────
function StudioView({ t, dark }: { t: T; dark: boolean }) {
  const pads = [
    { label: 'Hi-hat', sub: 'Closed', freq: 800, key: 'H' }, { label: 'Hi-hat', sub: 'Open', freq: 700, key: 'G' },
    { label: 'Crash', sub: '16"', freq: 600, key: 'C' }, { label: 'Snare', sub: 'Center', freq: 200, key: 'S' },
    { label: 'Tom 1', sub: '10"', freq: 350, key: 'T' }, { label: 'Tom 2', sub: '12"', freq: 280, key: 'Y' },
    { label: 'Floor', sub: '14"', freq: 180, key: 'F' }, { label: 'Ride', sub: '20"', freq: 500, key: 'R' },
    { label: 'Kick', sub: 'Bass', freq: 60, key: 'K' },
  ];
  const [active, setActive] = useState<Record<number, number>>({});
  const [bpm, setBpm] = useState(92);
  const [metro, setMetro] = useState(false);
  const [vols, setVols] = useState<Record<string, number>>({ kick: 80, snare: 70, hihat: 65, toms: 60, cymbals: 55 });
  const [rec, setRec] = useState(false);

  // Shared AudioContext (reused across hits to avoid Safari limits)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const hit = (i: number) => {
    setActive(a => ({ ...a, [i]: Date.now() }));
    setTimeout(() => setActive(a => { const n = { ...a }; delete n[i]; return n; }), 220);
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const label = pads[i].label;

      if (label === 'Kick') {
        // Pitch-swept sine — stortromme
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.4);

      } else if (label === 'Snare') {
        // Noise burst (overtoner) + body tone (lilletromme)
        const bufSize = ctx.sampleRate * 0.2;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1);
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        noise.connect(noiseGain); noiseGain.connect(ctx.destination);
        noise.start(now); noise.stop(now + 0.2);

        const body = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        body.type = 'triangle';
        body.frequency.setValueAtTime(220, now);
        body.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        bodyGain.gain.setValueAtTime(0.5, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        body.connect(bodyGain); bodyGain.connect(ctx.destination);
        body.start(now); body.stop(now + 0.12);

      } else if (label === 'Hi-hat') {
        // Bandpass-filtreret white noise
        const bufSize = ctx.sampleRate * 0.06;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1);
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = pads[i].sub === 'Open' ? 8000 : 10000;
        filter.Q.value = 0.8;
        const gain = ctx.createGain();
        const decay = pads[i].sub === 'Open' ? 0.25 : 0.06;
        gain.gain.setValueAtTime(0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        noise.start(now); noise.stop(now + decay + 0.01);

      } else if (label === 'Crash' || label === 'Ride') {
        // Metallic filtered noise — cymbal
        const bufSize = ctx.sampleRate * 0.8;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1);
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = label === 'Crash' ? 6000 : 4500;
        const gain = ctx.createGain();
        const decay = label === 'Crash' ? 0.7 : 0.4;
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        noise.start(now); noise.stop(now + decay + 0.01);

      } else {
        // Toms — pitch-swept sine ved varierende frekvenser
        const freqMap: Record<string, [number, number]> = {
          'Tom 1': [280, 100], 'Tom 2': [220, 80], 'Floor': [170, 60],
        };
        const [start, end] = freqMap[label] ?? [200, 70];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(start, now);
        osc.frequency.exponentialRampToValueAtTime(end, now + 0.18);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.32);
      }
    } catch { }
  };


  useEffect(() => {
    const keys: Record<string, number> = { 'h': 0, 'g': 1, 'c': 2, 's': 3, 't': 4, 'y': 5, 'f': 6, 'r': 7, 'k': 8 };
    const onKey = (e: KeyboardEvent) => { const idx = keys[e.key.toLowerCase()]; if (idx !== undefined) { e.preventDefault(); hit(idx); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ padding: '28px 44px 60px', color: t.text, fontFamily: t.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <Sect t={t} color={t.accent}>Virtuelt trommesæt</Sect>
          <Display t={t} size={48}>Studio Kit</Display>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setRec(!rec)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: rec ? t.accent : 'transparent',
            border: `1px solid ${rec ? t.accent : t.borderStrong}`,
            color: rec ? '#fff' : t.text, padding: '9px 16px', borderRadius: 999,
            cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: rec ? '#fff' : t.accent }} />
            {rec ? 'Stop' : 'Optag'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Kit illustration */}
          <Card t={t} pad={0} style={{ position: 'relative', overflow: 'hidden', height: 240 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 380, height: 380, background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 65%)` }} />
              <IllKit size={380} color={t.accent} sw={1.3} />
            </div>
            <div style={{ position: 'absolute', top: 16, left: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.good }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted }}>Live</span>
            </div>
            <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: t.mono, fontSize: 11, color: t.textMuted }}>
              <span style={{ color: t.text, fontWeight: 700 }}>{bpm}</span> BPM
            </div>
          </Card>

          {/* Pads grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {pads.map((pad, i) => (
              <button key={i} onClick={() => hit(i)} style={{
                padding: '24px 12px 18px', borderRadius: 14, border: `1.5px solid ${active[i] ? t.accent : t.border}`,
                background: active[i] ? t.accentSoft : t.surface,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 0.05s', transform: active[i] ? 'scale(0.96)' : 'scale(1)',
                boxShadow: active[i] ? `0 0 20px ${t.accentSoft}` : 'none',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 8.5, fontFamily: t.mono, fontWeight: 700, color: active[i] ? t.accent : t.textDim, padding: '1px 4.5px', background: active[i] ? t.surface : t.surface2, borderRadius: 4, border: `1px solid ${t.borderStrong}` }}>
                  {pad.key}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: active[i] ? t.accent : t.text }}>{pad.label}</div>
                <div style={{ fontSize: 10, fontFamily: t.mono, color: t.textDim }}>{pad.sub}</div>
              </button>
            ))}
          </div>

          {/* BPM */}
          <Card t={t} pad={18} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <IcMetro size={18} color={t.textMuted} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted }}>Tempo</span>
                <span style={{ fontFamily: t.mono, fontSize: 14, fontWeight: 700, color: t.text }}>{bpm} BPM</span>
              </div>
              <input type="range" min={40} max={220} value={bpm} onChange={e => setBpm(+e.target.value)} style={{ width: '100%', accentColor: t.accent }} />
            </div>
            <button onClick={() => setMetro(!metro)} style={{
              padding: '8px 14px', borderRadius: 8, border: `1px solid ${metro ? t.accent : t.border}`,
              background: metro ? t.accentSoft : 'transparent', color: metro ? t.accent : t.textMuted,
              fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
            }}>
              {metro ? '◼ STOP' : '▶ METRO'}
            </button>
          </Card>
        </div>

        {/* Mixer */}
        <Card t={t} pad={20}>
          <Sect t={t} style={{ marginBottom: 18 }}>Mixer</Sect>
          {Object.entries(vols).map(([ch, vol]) => (
            <div key={ch} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize', letterSpacing: 0.5 }}>{ch}</span>
                <span style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted }}>{vol}</span>
              </div>
              <input type="range" min={0} max={100} value={vol} onChange={e => setVols(v => ({ ...v, [ch]: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
            </div>
          ))}
          <Sect t={t} style={{ marginTop: 20, marginBottom: 12 }}>Tip</Sect>
          <div style={{ fontSize: 11.5, color: t.textMuted, lineHeight: 1.6 }}>
            Brug tangenterne H G C S T Y F R K til at spille på pads.
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────
function ProfileView({ t, dark, setDark, isPremium, onUpgrade, completedIds, onReset }: { t: T; dark: boolean; setDark: (d: boolean) => void; isPremium: boolean; onUpgrade: () => void; completedIds: string[]; onReset: () => void }) {
  const lv = LEVELS[1]; // mock
  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 40 }}>
        <div style={{ width: 110, height: 110, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: t.serif, fontStyle: 'italic', fontSize: 42, boxShadow: '0 16px 40px rgba(239,90,58,0.4)' }}>AL</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Sect t={t} color={t.accent} style={{ marginBottom: 0 }}>Niveau 1 · {isPremium ? 'PRO' : 'Gratis'}</Sect>
            {isPremium ? <Badge t={t} tone="good">✦ Premium</Badge> : <Badge t={t} tone="accent">Gratis plan</Badge>}
          </div>
          <Display t={t} size={52}>Anders Lind</Display>
          <div style={{ marginTop: 16, maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5 }}>
              <span>Niv. 1</span><span>120 / 200 XP</span><span>Niv. 2</span>
            </div>
            <Prog pct={60} t={t} h={6} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isPremium && <Btn t={t} onClick={onUpgrade}>Køb Premium</Btn>}
          <Btn t={t} variant="secondary" onClick={() => setDark(!dark)} icon={dark ? <IcSun size={14} /> : <IcMoon size={14} />}>
            {dark ? 'Lys tilstand' : 'Mørk tilstand'}
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
        {[
          { icon: <IcFlame size={15} color={t.accent} />, value: '7', label: 'Streak dage' },
          { icon: <IcClock size={15} />, value: '18t', label: 'Total øvetid' },
          { icon: <IcTrophy size={15} />, value: `${completedIds.length}`, label: 'Lektioner ✓' },
          { icon: <IcCheck size={15} color={t.good} />, value: '2/10', label: 'Moduler i gang' },
        ].map((s, i) => (
          <Card key={i} t={t} pad={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${t.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>{s.icon}</div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 38, lineHeight: 1, color: t.text }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Pillars progress */}
      <Sect t={t} style={{ marginBottom: 18 }}>Fremskridt per søjle</Sect>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 40 }}>
        {PILLARS.map(p => {
          const pillarLessons = MODULES.filter(m => m.pillarId === p.id).flatMap(m => m.lessons);
          const done = pillarLessons.filter(l => completedIds.includes(l.id)).length;
          const pct = pillarLessons.length ? Math.round((done / pillarLessons.length) * 100) : 0;
          return (
            <Card key={p.id} t={t} pad={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: t.textMuted, fontFamily: t.mono }}>{done}/{pillarLessons.length} lektioner</div>
                </div>
                <span style={{ fontFamily: t.mono, fontSize: 12, fontWeight: 700, color: pct > 0 ? t.accent : t.textDim }}>{pct}%</span>
              </div>
              <Prog pct={pct} t={t} h={4} />
            </Card>
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
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent, marginBottom: 12 }}>DrumLab Premium</div>
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
                  <input defaultValue="4242 4242 4242 4242" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Udløb</label>
                    <input defaultValue="12/28" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>CVC</label>
                    <input defaultValue="123" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', background: t.surface2, borderRadius: 12, marginBottom: 24 }}>
                <p style={{ color: t.textMuted, marginBottom: 12, fontSize: 13 }}>Indtast dit telefonnummer:</p>
                <input defaultValue="+45 12 34 56 78" style={{ background: 'transparent', border: 'none', outline: 'none', color: t.text, fontFamily: t.mono, fontSize: 22, fontWeight: 700, textAlign: 'center', width: '100%' }} />
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
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dark, setDark] = useState(true);
  const [view, setView] = useState<ViewId>('home');
  const [coachOpen, setCoachOpen] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const t = useMemo(() => mkT(dark), [dark]);
  const scale = useFitScale(1440, 900, 0);

  useEffect(() => {
    setMounted(true);
    // Mobile redirect
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) { router.replace('/prototype'); return; }

    // Load data
    setExercises(getSavedExercises());
    setPlan(getUserPlan());
    setCompletedIds(getCompletedExercises());
    setIsPremium(getPremiumStatus());
  }, [router]);

  const openCheckout = () => setShowCheckout(true);
  const handlePremiumSuccess = () => { setIsPremium(true); };
  const handleReset = () => {
    resetMockDatabase();
    setIsPremium(false);
    setCompletedIds([]);
    setPlan(null);
    setExercises(getSavedExercises());
  };

  // Loading / redirect state
  if (!mounted || isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#f4f1ec' }}>
          DrumLab<span style={{ color: '#ef5a3a' }}>.</span>
        </div>
      </div>
    );
  }

  // Render current view
  let content: React.ReactNode;
  if (view === 'home') content = <HomeView t={t} dark={dark} setDark={setDark} onView={setView} isPremium={isPremium} onUpgrade={openCheckout} />;
  else if (view === 'academy') content = <AcademyView t={t} dark={dark} isPremium={isPremium} onUpgrade={openCheckout} completedIds={completedIds} />;
  else if (view === 'exercises') content = <ExercisesView t={t} exercises={exercises} isPremium={isPremium} onUpgrade={openCheckout} completedIds={completedIds} />;
  else if (view === 'studio') content = <StudioView t={t} dark={dark} />;
  else if (view === 'profile') content = <ProfileView t={t} dark={dark} setDark={setDark} isPremium={isPremium} onUpgrade={openCheckout} completedIds={completedIds} onReset={handleReset} />;

  const hideCoach = view === 'studio';

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* macOS window */}
      <div style={{
        transform: `scale(${scale})`, transformOrigin: 'center center',
        width: 1440, height: 900, borderRadius: 14, overflow: 'hidden',
        background: t.bg, color: t.text,
        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
        fontFamily: t.font, display: 'flex', flexDirection: 'column',
      }}>
        {/* Title bar */}
        <div style={{ height: 44, flexShrink: 0, background: t.sidebar, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative' }}>
          <TrafficLights />
          <div style={{
            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto',
          }}>
            <span style={{ fontFamily: t.font, fontSize: 13, fontWeight: 600, color: t.textMuted, letterSpacing: 0.3 }}>DrumLab Academy</span>
            {isPremium ? (
              <span style={{ fontSize: 9, fontWeight: 800, background: t.goodSoft, color: t.good, padding: '2px 8px', borderRadius: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>PRO</span>
            ) : (
              <button onClick={openCheckout} style={{ fontSize: 9, fontWeight: 800, background: t.accent, color: '#fff', border: 'none', padding: '3px 9px', borderRadius: 4, letterSpacing: 0.8, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,90,58,0.4)' }}>
                Opgrader
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          <Sidebar t={t} view={view} onView={setView} dark={dark} isPremium={isPremium} onUpgrade={openCheckout} />
          <div style={{ flex: 1, overflow: 'auto', background: t.bg, position: 'relative' }}>
            {content}
          </div>
          {!hideCoach && (
            <CoachPanel t={t} dark={dark} open={coachOpen} onToggle={() => setCoachOpen(!coachOpen)} isPremium={isPremium} onUpgrade={openCheckout} />
          )}
        </div>
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal t={t} onClose={() => setShowCheckout(false)} onSuccess={handlePremiumSuccess} />
      )}
    </div>
  );
}
