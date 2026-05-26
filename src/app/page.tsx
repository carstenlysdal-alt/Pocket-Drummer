'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  IcHome, IcSpark, IcUser, IcPlay, IcBack, IcChev, IcCheck, IcLock,
  IcSun, IcMoon, IcSend, IcFlame, IcClock, IcTrophy, IcBell,
  TabKit, TabPractice, IllSnare, IllKit, IllSticks, DrumNotation,
  IcMetro, IcLoop, IcMin,
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
type ViewId = 'home' | 'category' | 'exercises' | 'studio' | 'profile';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NAV_ITEMS: { id: ViewId; label: string; icon: React.FC<any>; category?: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' }[] = [
  { id: 'home', label: 'Hjem', icon: IcHome },
  { id: 'category', label: 'Pocket Play-along', icon: IcPlay, category: 'playalong' },
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
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
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
        <input ref={searchRef} placeholder="Søg øvelser, genrer…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontFamily: t.font, fontSize: 12, padding: 0, margin: 0 }} />
        <span style={{ fontFamily: t.mono, fontSize: 9, color: t.textDim, padding: '1px 5px', borderRadius: 4, border: `1px solid ${t.border}` }}>⌘K</span>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Sect t={t} style={{ marginBottom: 8 }}>Naviger</Sect>
        {NAV_ITEMS.map(it => {
          const active = it.id === 'category'
            ? (view === 'category' && selectedCategory === it.category)
            : (view === it.id);
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
interface ChatMessage { id: number; role: 'ai' | 'user'; text: string }
function CoachPanel({ t, open, onToggle, isPremium, onUpgrade }: { t: T; dark: boolean; open: boolean; onToggle: () => void; isPremium: boolean; onUpgrade: () => void }) {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: 0, role: 'ai', text: 'Hej 👋 Jeg er din AI-trommerlærer.\n\nHvad øver du dig på i dag?' },
  ]);
  const msgIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = () => {
    if (!input.trim()) return;
    if (!isPremium && msgs.filter(m => m.role === 'user').length >= 2) { onUpgrade(); return; }
    const q = input.trim();
    setInput('');
    setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'user', text: q }]);
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
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: reply }]);
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
        {msgs.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
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

// ─── HOME VIEW ────────────────────────────────────────────────
function HomeView({ t, dark, setDark, onSelectCategory }: {
  t: T;
  dark: boolean;
  setDark: (d: boolean) => void;
  onView: (v: ViewId) => void;
  isPremium: boolean;
  onUpgrade: () => void;
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
}) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
  const displayName = user ? user.displayName : 'Anders';

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font, maxWidth: 1100 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted, marginBottom: 10 }}>
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </div>
          <Display t={t} size={48}>Hej, {displayName}</Display>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 36 }}>
        {/* Recommended Daily Exercise */}
        <Card t={t} pad={0} style={{ overflow: 'hidden', display: 'flex', borderLeft: `4px solid ${t.accent}` }}>
          <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <Sect t={t} color={t.accent}>Dagens anbefaling</Sect>
              <Display t={t} size={30} style={{ marginBottom: 8 }}>Paradiddle Grooves</Display>
              <div style={{ fontSize: 11, color: t.textMuted, fontFamily: t.mono, letterSpacing: 0.5, marginBottom: 12 }}>12 MIN · LET ØVET</div>
              <p style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5, margin: '0 0 16px' }}>
                Styrk din koordination, fingerkontrol og balance på trommerne med dagens fokuserede paradiddle-grooves.
              </p>
            </div>
            <div>
              <Btn t={t} onClick={() => onSelectCategory('grooves')} icon={<IcPlay size={11} />}>Start dagens øvelse</Btn>
            </div>
          </div>
          <div style={{ width: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? '#101012' : '#F3EFE7', borderLeft: `1px solid ${t.border}`, flexShrink: 0 }}>
            <div style={{ position: 'absolute', width: 140, height: 140, background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 65%)` }} />
            <div style={{ position: 'relative' }}><IllSnare size={130} color={t.accent} sw={1.4} /></div>
          </div>
        </Card>

        {/* Weekly Progression */}
        <Card t={t} pad={24} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <Sect t={t}>Din progression</Sect>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>Denne uge</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 12 }}>
              3 øvedage · 72 min · Niveau 2
            </div>
            <p style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.4, marginBottom: 14 }}>
              Du er 72% af vejen mod dit ugentlige øvemål på 100 minutter.
            </p>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5 }}>
              <span>UGEMÅL STATUS</span><span>72%</span>
            </div>
            <Prog pct={72} t={t} h={5} />
            <div style={{ marginTop: 10, fontSize: 11, color: t.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🔥 7 dages streak · Fortsæt timingen!</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Choose practice category */}
      <Sect t={t} style={{ marginBottom: 18 }}>Vælg øvespor</Sect>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {[
          { id: 'opvarmning' as const, title: 'Pocket Opvarmning', desc: 'Start med hænder, fødder, kontrol og timing.', icon: <IllSticks size={52} color={t.accent} /> },
          { id: 'nodelære' as const, title: 'Pocket Nodelære', desc: 'Forstå rytmer, taktarter og trommenotation.', icon: <div style={{ transform: 'scale(0.8)', marginTop: -20, marginBottom: -10 }}><DrumNotation color={t.text} width={140} accent={t.accent} active={2} /></div> },
          { id: 'grooves' as const, title: 'Pocket Groove', desc: 'Spil beats, fills, overgange og genrer.', icon: <IllSnare size={62} color={t.accent} /> },
          { id: 'playalong' as const, title: 'Pocket Play-along', desc: 'Spil med musik, backing tracks og form.', icon: <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent }}><IcPlay size={20} fill color={t.accent} /></div> },
        ].map((cat, i) => (
          <Card key={i} t={t} pad={24} onClick={() => onSelectCategory(cat.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20, transition: 'transform 0.15s ease, border-color 0.15s ease' }}>
            <div style={{ width: 80, height: 80, borderRadius: 14, background: t.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: `1px solid ${t.border}` }}>
              {cat.icon}
            </div>
            <div style={{ flex: 1 }}>
              <Display t={t} size={22} style={{ marginBottom: 6 }}>{cat.title}</Display>
              <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.4 }}>{cat.desc}</div>
            </div>
            <IcChev size={16} color={t.textDim} />
          </Card>
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
  const [bpm, setBpm] = useState(90);
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
          // Synthesize tick
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
    
    // Base tempo is 105 BPM, speed alters it
    const actualBpm = 105 * (playalongSpeed / 100);
    const intervalTime = (60 / actualBpm) * 500; // eighth notes
    
    const intervalId = setInterval(() => {
      setPlayalongBeat(prev => {
        const nextBeat = (prev + 1) % 32; // 4 measures of 8 eighth notes (32 clicks total)
        
        let section = 'Intro';
        if (nextBeat >= 8 && nextBeat < 24) section = 'Verse';
        else if (nextBeat >= 24 && nextBeat < 28) section = 'Chorus';
        else if (nextBeat >= 28 && nextBeat < 30) section = 'Fill Cue';
        else section = 'Outro';
        
        try {
          const ctx = getAudioCtx();
          const now = ctx.currentTime;
          
          // Drums synthesis
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
          
          // Music synth backing chords
          if (mixerVols.music > 0 && nextBeat % 2 === 0) {
            const synth = ctx.createOscillator();
            const synthGain = ctx.createGain();
            synth.connect(synthGain);
            synthGain.connect(ctx.destination);
            synth.type = 'sine';
            
            let baseFreq = 130.81; // C3
            if (section === 'Verse') baseFreq = 146.83; // D3
            else if (section === 'Chorus') baseFreq = 164.81; // E3
            else if (section === 'Fill Cue') baseFreq = 196.00; // G3
            else if (section === 'Outro') baseFreq = 130.81; // C3
            
            const harmony = ctx.createOscillator();
            harmony.connect(synthGain);
            harmony.type = 'sine';
            harmony.frequency.setValueAtTime(baseFreq * 1.5, now); // fifth
            
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
    opvarmning: 'Pocket Opvarmning',
    nodelære: 'Pocket Nodelære',
    grooves: 'Pocket Groove',
    playalong: 'Pocket Play-along'
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
              fontFamily: t.font, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s ease'
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

      {/* Interactive Backing Track Player for Play-along */}
      {category === 'playalong' && (
        <Card t={t} pad={24} style={{ marginBottom: 36, borderLeft: `4px solid ${t.accent}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.accent, marginBottom: 4 }}>Tromme Backing Track Player</div>
              <Display t={t} size={24}>Funk Groove Odyssey</Display>
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>105 BPM · Let øvet · Modalt loop</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([80, 90, 100, 110] as const).map(speed => (
                <button key={speed} onClick={() => setPlayalongSpeed(speed)} style={{
                  padding: '5px 10px', borderRadius: 4, border: `1.5px solid ${playalongSpeed === speed ? t.accent : t.border}`,
                  background: playalongSpeed === speed ? t.accentSoft : 'transparent', color: playalongSpeed === speed ? t.accent : t.textMuted,
                  fontSize: 10.5, fontFamily: t.mono, fontWeight: 700, cursor: 'pointer'
                }}>{speed}%</button>
              ))}
            </div>
          </div>

          {/* Form timeline visualizer */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 8 }}>
              <span>FORM FORLØB TIMELINE</span>
              <span style={{ color: playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.textMuted }}>
                {playalongBeat >= 28 && playalongBeat < 30 ? '⚠️ GØR KLAR TIL FILL CUE!' : 'Næste sektion: Chorus'}
              </span>
            </div>

            {/* Timeline bars */}
            <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', background: t.surface2, border: `1px solid ${t.border}`, position: 'relative' }}>
              <div style={{ width: '25%', background: playalongBeat < 8 ? t.accentSoft : 'rgba(0,0,0,0.03)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>Intro (1)</div>
              <div style={{ width: '50%', background: playalongBeat >= 8 && playalongBeat < 24 ? t.accentSoft : 'rgba(0,0,0,0.03)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>Verse (2)</div>
              <div style={{ width: '12.5%', background: playalongBeat >= 24 && playalongBeat < 28 ? t.accentSoft : 'rgba(0,0,0,0.03)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>Chorus</div>
              <div style={{ width: '6.25%', background: playalongBeat >= 28 && playalongBeat < 30 ? '#F2554533' : 'rgba(0,0,0,0.03)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, color: t.accent }}>Fill</div>
              <div style={{ width: '6.25%', background: playalongBeat >= 30 ? t.accentSoft : 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>Outro</div>

              {/* Progress marker */}
              {playalongPlaying && (
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${(playalongBeat / 32) * 100}%`, width: 3, background: t.accent,
                  boxShadow: '0 0 10px #F25545', transition: 'left 0.15s linear'
                }} />
              )}
            </div>

            {/* Prompt banner */}
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: playalongBeat >= 28 && playalongBeat < 30 ? t.accentSoft : t.surface,
              border: `1px solid ${playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.border}`,
              textAlign: 'center', fontSize: 13.5, fontWeight: 700,
              color: playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.text
            }}>
              {playalongBeat < 8 && 'AKTIV: INTRO — Lyt til timingen og start roligt med fjerdedele.'}
              {playalongBeat >= 8 && playalongBeat < 24 && 'AKTIV: VERS — Spil en stabil basic funk beat med ghost notes.'}
              {playalongBeat >= 24 && playalongBeat < 28 && 'AKTIV: OMKVÆD (CHORUS) — Mere energi! Åbn hi-hatten.'}
              {playalongBeat >= 28 && playalongBeat < 30 && 'FILL CUE — Spil et 16.-dels snare roll fill med et crash på 1!'}
              {playalongBeat >= 30 && 'AKTIV: OUTRO — Dæmp energien og spil grooves mod slutningen.'}
            </div>
          </div>

          {/* Controls Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => setPlayalongPlaying(!playalongPlaying)} style={{
                width: 52, height: 52, borderRadius: '50%', background: t.accent, border: 'none', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(242,85,69,0.35)'
              }}>
                {playalongPlaying ? <span style={{ fontSize: 16 }}>◼</span> : <IcPlay size={16} fill color="#fff" />}
              </button>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{playalongPlaying ? 'Backing track spiller…' : 'Afspil backing track'}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>BPM: {Math.round(105 * (playalongSpeed / 100))} (mål: 105)</div>
              </div>
            </div>

            {/* Mixer drums volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>
                <span>GUIDE TROMMER</span>
                <span style={{ fontFamily: t.mono }}>{mixerVols.drums}%</span>
              </div>
              <input type="range" min={0} max={100} value={mixerVols.drums} onChange={e => setMixerVols(prev => ({ ...prev, drums: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
            </div>

            {/* Mixer music volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>
                <span>BACKING TRACK</span>
                <span style={{ fontFamily: t.mono }}>{mixerVols.music}%</span>
              </div>
              <input type="range" min={0} max={100} value={mixerVols.music} onChange={e => setMixerVols(prev => ({ ...prev, music: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
            </div>
          </div>
        </Card>
      )}

      {/* Grid of exercises */}
      <Sect t={t}>Undervisning & Lektioner ({filteredExercises.length})</Sect>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filteredExercises.map(ex => {
          return (
            <Card key={ex.id} t={t} pad={20} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 140 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Badge t={t} tone={ex.level === 'Begynder' ? 'good' : ex.level === 'Mellemniveau' ? 'default' : 'accent'}>{ex.level}</Badge>
                  <span style={{ fontFamily: t.mono, fontSize: 11, color: t.textDim }}>{ex.dur} · {ex.bpm} BPM</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>{ex.title}</div>
                <div style={{ fontSize: 12.5, color: t.textMuted }}>{ex.sub}</div>
              </div>
              
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
                {ex.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '3px 8px', borderRadius: 4, background: t.surface2, fontSize: 10,
                    fontFamily: t.mono, color: t.textMuted
                  }}>{tag}</span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: t.textMuted }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 13 }}>Ingen lektioner matcher filteret &quot;{activeChip}&quot;.</div>
        </div>
      )}
    </div>
  );
}



// ─── EXERCISES VIEW ───────────────────────────────────────────
function ExercisesView({ t, isPremium, onUpgrade, completedIds }: { t: T; isPremium: boolean; onUpgrade: () => void; completedIds: string[] }) {
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
function StudioView({ t }: { t: T; dark: boolean }) {
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
  const channelGainsRef = useRef<Record<string, GainNode>>({});
  const volsRef = useRef(vols);
  useEffect(() => { volsRef.current = vols; }, [vols]);

  const getCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      channelGainsRef.current = {};
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const getChannelGain = (ctx: AudioContext, channel: string): GainNode => {
    if (!channelGainsRef.current[channel]) {
      const g = ctx.createGain();
      g.connect(ctx.destination);
      channelGainsRef.current[channel] = g;
    }
    channelGainsRef.current[channel].gain.value = (volsRef.current[channel] ?? 100) / 100;
    return channelGainsRef.current[channel];
  };

  const hit = useCallback((i: number) => {
    setActive(a => ({ ...a, [i]: Date.now() }));
    setTimeout(() => setActive(a => { const n = { ...a }; delete n[i]; return n; }), 220);
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const label = pads[i].label;

      if (label === 'Kick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain); gain.connect(getChannelGain(ctx, 'kick'));
        osc.start(now); osc.stop(now + 0.4);

      } else if (label === 'Snare') {
        const ch = getChannelGain(ctx, 'snare');
        const bufSize = ctx.sampleRate * 0.2;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1);
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        noise.connect(noiseGain); noiseGain.connect(ch);
        noise.start(now); noise.stop(now + 0.2);

        const body = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        body.type = 'triangle';
        body.frequency.setValueAtTime(220, now);
        body.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        bodyGain.gain.setValueAtTime(0.5, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        body.connect(bodyGain); bodyGain.connect(ch);
        body.start(now); body.stop(now + 0.12);

      } else if (label === 'Hi-hat') {
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
        noise.connect(filter); filter.connect(gain); gain.connect(getChannelGain(ctx, 'hihat'));
        noise.start(now); noise.stop(now + decay + 0.01);

      } else if (label === 'Crash' || label === 'Ride') {
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
        noise.connect(filter); filter.connect(gain); gain.connect(getChannelGain(ctx, 'cymbals'));
        noise.start(now); noise.stop(now + decay + 0.01);

      } else {
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
        osc.connect(gain); gain.connect(getChannelGain(ctx, 'toms'));
        osc.start(now); osc.stop(now + 0.32);
      }
    } catch { }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hitRef = useRef(hit);
  useEffect(() => { hitRef.current = hit; }, [hit]);

  useEffect(() => {
    const keys: Record<string, number> = { 'h': 0, 'g': 1, 'c': 2, 's': 3, 't': 4, 'y': 5, 'f': 6, 'r': 7, 'k': 8 };
    const onKey = (e: KeyboardEvent) => { const idx = keys[e.key.toLowerCase()]; if (idx !== undefined) { e.preventDefault(); hitRef.current(idx); } };
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
  const { user, login, logout } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Indtast venligst en gyldig e-mailadresse');
      return;
    }
    setErrorMsg('');
    setLoginLoading(true);
    try {
      await login(emailInput);
    } catch {
      setErrorMsg('Fejl under login. Prøv igen.');
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
              Log ind med din e-mailadresse for at gemme dine øvelser, fremskridt og skræddersyede AI-træningsplaner i skyen, så du kan tilgå dem fra enhver enhed.
            </div>
            
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="email"
                  placeholder="Indtast din e-mailadresse..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: t.surface,
                    border: `1px solid ${t.borderStrong}`,
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: t.text,
                    fontSize: 14,
                    fontFamily: t.font,
                    outline: 'none',
                  }}
                />
                <Btn t={t} onClick={() => {}} disabled={loginLoading}>
                  {loginLoading ? 'Logger ind...' : 'Fortsæt'}
                </Btn>
              </div>
              {errorMsg && (
                <div style={{ color: t.accent, fontSize: 12, fontWeight: 500 }}>{errorMsg}</div>
              )}
            </form>
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
          <div style={{ 
            width: 110, height: 110, borderRadius: '50%', background: t.accent, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: '#fff', fontFamily: t.serif, fontStyle: 'italic', fontSize: 42, 
            boxShadow: '0 16px 40px rgba(239,90,58,0.4)' 
          }}>
            {getInitials(user.displayName)}
          </div>
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
  const [coachOpen, setCoachOpen] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [, setPlan] = useState<UserPlan | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const t = useMemo(() => mkT(dark), [dark]);
  const scale = useFitScale(1440, 900, 0);

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
            <span style={{ fontFamily: t.font, fontSize: 13, fontWeight: 600, color: t.textMuted, letterSpacing: 0.3 }}>Pocket Drummer Academy</span>
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
