'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

// ─────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────
const tokens = (dark: boolean) => ({
  bg: dark ? '#0a0a0a' : '#f4f1ec',
  bgGradient: dark ? '#0a0a0a' : '#f4f1ec',
  surface: dark ? '#161618' : '#ffffff',
  surface2: dark ? '#1f1f22' : '#ebe7e0',
  surfaceElev: dark ? '#262629' : '#ffffff',
  border: dark ? 'rgba(255,255,255,0.07)' : 'rgba(20,20,28,0.08)',
  borderStrong: dark ? 'rgba(255,255,255,0.14)' : 'rgba(20,20,28,0.14)',
  text: dark ? '#f4f1ec' : '#16161a',
  textMuted: dark ? '#8a8580' : '#6e6a62',
  textDim: dark ? '#56524c' : '#a8a39a',
  accent: '#ef5a3a',         // coral red
  accentDeep: '#d94527',
  accentSoft: dark ? 'rgba(239,90,58,0.13)' : 'rgba(239,90,58,0.10)',
  accentText: dark ? '#f5b8a8' : '#a83419',
  good: '#5dd39e',
  goodSoft: dark ? 'rgba(93,211,158,0.13)' : 'rgba(93,211,158,0.14)',
  mono: 'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace',
  font: '-apple-system, "SF Pro Text", system-ui, sans-serif',
  serif: '"DM Serif Display", "Playfair Display", Georgia, serif',
});

type ThemeTokens = ReturnType<typeof tokens>;

interface ScreenProps {
  t: ThemeTokens;
  dark: boolean;
}

interface HomeScreenProps extends ScreenProps {
  setDark: (dark: boolean) => void;
  onOpenLesson: (id: string) => void;
  onTab: (tab: string) => void;
  onOpenCoach: () => void;
}

interface PracticeScreenProps extends ScreenProps {
  onOpenTrack: (id: string) => void;
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

interface StudioKitScreenProps extends ScreenProps {
  onOpenPads: () => void;
}

interface KitPadViewProps extends ScreenProps {
  onClose: () => void;
}

interface CoachScreenProps extends ScreenProps {
  onClose: () => void;
}

interface ProfileScreenProps extends ScreenProps {
  setDark: (dark: boolean) => void;
}

interface TabBarProps {
  tab: string;
  onTab: (tab: string) => void;
  t: ThemeTokens;
  dark: boolean;
  isMobile: boolean;
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

const IcHome = (p: IcProps) => <Ic {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></Ic>;
const IcSpark = (p: IcProps) => <Ic {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></Ic>;
const IcUser = (p: IcProps) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Ic>;
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

interface RadialProgressProps {
  size?: number;
  pct?: number;
  color?: string;
  track?: string;
  sw?: number;
  label?: string;
  t: ThemeTokens;
}

const RadialProgress: React.FC<RadialProgressProps> = ({ size = 110, pct = 75, color = '#ef5a3a', track = 'rgba(255,255,255,0.08)', sw = 8, label, t }) => {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={sw} fill="none"/>
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth={sw} fill="none"
        strokeDasharray={c} strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      {label && (
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
              fill={t?.text || '#fff'} fontSize="22" fontWeight="700" fontFamily="ui-monospace, monospace">{label}</text>
      )}
    </svg>
  );
};

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
      fontFamily: t.font, fontSize: 11, fontWeight: 600, letterSpacing: 1.8,
      textTransform: 'uppercase', color: color || t.textMuted, marginBottom: 12,
    }}>{children}</div>
  );
}

function Card({ children, t, style = {}, onClick, padding = 18 }: { children: React.ReactNode; t: ThemeTokens; style?: React.CSSProperties; onClick?: () => void; padding?: number }) {
  return (
    <div onClick={onClick} style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 20, padding, cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

function Pill({ children, t, tone = 'default' }: { children: React.ReactNode; t: ThemeTokens; tone?: 'default' | 'accent' | 'good' }) {
  const map = {
    default: { bg: t.surface2, fg: t.textMuted },
    accent: { bg: t.accentSoft, fg: t.accentText },
    good: { bg: t.goodSoft, fg: t.good },
  };
  const c = map[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: c.bg, color: c.fg, padding: '4px 9px',
      borderRadius: 999, fontSize: 11, fontWeight: 600,
      fontFamily: t.font, letterSpacing: 0.2,
    }}>{children}</span>
  );
}

function Progress({ pct, t, h = 6, color }: { pct: number; t: ThemeTokens; h?: number; color?: string }) {
  return (
    <div style={{ width: '100%', height: h, background: t.surface2, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || t.accent, borderRadius: 999 }} />
    </div>
  );
}

function CTA({ children, t, onClick, variant = 'primary', icon }: { children: React.ReactNode; t: ThemeTokens; onClick?: () => void; variant?: 'primary' | 'secondary'; icon?: React.ReactNode }) {
  const isPrimary = variant === 'primary';
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '16px 18px', borderRadius: 999,
      background: isPrimary ? t.accent : 'transparent',
      color: isPrimary ? '#fff' : t.text,
      border: isPrimary ? 'none' : `1px solid ${t.borderStrong}`,
      fontFamily: t.font, fontSize: 13, fontWeight: 700,
      letterSpacing: 2, textTransform: 'uppercase',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: isPrimary ? '0 8px 24px rgba(239,90,58,0.3)' : 'none',
    }}>
      {icon}{children}
    </button>
  );
}

function Display({ children, t, size = 32, style = {} }: { children: React.ReactNode; t: ThemeTokens; size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: t.serif, fontStyle: 'italic', fontSize: size,
      lineHeight: 1.05, color: t.text, letterSpacing: -0.3, ...style,
    }}>{children}</div>
  );
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
function OnboardingScreen({ t, dark, onStart }: { t: ThemeTokens; dark: boolean; onStart: () => void }) {
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
          DrumLab<span style={{ color: t.accent, fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{
          fontFamily: t.font, fontSize: 12, fontWeight: 700, letterSpacing: 2.4,
          textTransform: 'uppercase', color: t.textMuted, marginTop: 6,
        }}>Spil. Øv. Udvikl dig.</div>
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
          Din rejse begynder her
        </Display>
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.7,
          textAlign: 'center', lineHeight: 1.4, marginBottom: 24, padding: '0 12px',
        }}>
          Uanset dit niveau, hjælper vi dig med at blive en bedre trommeslager.
        </div>

        <CTA t={t} onClick={onStart}>Kom i gang</CTA>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onStart} style={{
            background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase',
            fontFamily: t.font,
          }}>Har du allerede en konto? Log ind</button>
        </div>
      </div>
    </div>
  );
}

// 2. Home Screen
function HomeScreen({ t, dark, setDark, onOpenLesson, onTab, onOpenCoach }: HomeScreenProps) {
  return (
    <div style={{ padding: '4px 20px 40px', color: t.text, fontFamily: t.font }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h2l2-6 3 12 3-14 3 14 3-12 2 6h3"/>
          </svg>
          <Display t={t} size={20}>Hej, Astrid</Display>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onOpenCoach} style={{
            width: 38, height: 38, borderRadius: '50%', background: 'transparent',
            border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', }}><IcSpark size={16} color={t.accent} /></button>
          <button style={{
            width: 38, height: 38, borderRadius: '50%', background: 'transparent',
            border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', }}><IcBell size={16} /></button>
        </div>
      </div>

      <SectionLabel t={t}>Dagligt mål</SectionLabel>
      <Card t={t} padding={20} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <RadialProgress size={104} pct={73} color={t.accent} track={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'} sw={8} t={t} label="73%" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.mono, fontSize: 14, fontWeight: 600 }}>
            22 <span style={{ color: t.textMuted, fontWeight: 500 }}>/ 30 min</span>
          </div>
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 16, marginTop: 4, color: t.text, lineHeight: 1.25 }}>
            Fortsæt det gode arbejde
          </div>
          <button onClick={() => onTab('practice')} style={{
            marginTop: 12, background: 'transparent', border: 'none',
            color: t.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>Se detaljer <IcChev size={11} color={t.accent}/></button>
        </div>
      </Card>

      <div style={{ marginTop: 28 }}>
        <SectionLabel t={t}>Fortsæt hvor du slap</SectionLabel>
        <Card t={t} padding={16} onClick={() => onOpenLesson('rock-groove-7')} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button style={{
            width: 44, height: 44, borderRadius: '50%', background: t.accent,
            border: 'none', color: '#fff', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', boxShadow: '0 4px 14px rgba(239,90,58,0.4)',
          }}><IcPlay size={16} fill color="#fff" /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Display t={t} size={17} style={{ lineHeight: 1.15 }}>Paradiddle Grooves</Display>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>Lektion 12</span>
              <span style={{ fontFamily: t.mono, color: t.text, fontWeight: 600 }}>60%</span>
            </div>
            <div style={{ marginTop: 6 }}><Progress pct={60} t={t} h={4} /></div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionLabel t={t}>Anbefalede til dig</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { title: 'Rytme & Timing', sub: 'Forbedr din timing', cat: 'practice', topic: 'rytme-timing' },
            { title: 'Fills & Grooves', sub: 'Udvid dit vokabular', cat: 'practice', topic: 'fills-grooves' },
            { title: 'Studio Kit', sub: 'Dit virtuelle trommesæt', cat: 'kit', topic: 'studio-kit' },
          ].map((r, i) => (
            <div key={i} onClick={() => onTab(r.cat)} style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: t.accentSoft, color: t.accent, flexShrink: 0,
                display: 'flex', alignItems: 'center', }}>
                {i === 0 ? <IcWave size={20} /> : i === 1 ? <IcMetro size={18} /> : <TabKit size={20} color={t.accent} sw={1.7} />}
              </div>
              <div style={{ flex: 1 }}>
                <Display t={t} size={16} style={{ lineHeight: 1.1 }}>{r.title}</Display>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{r.sub}</div>
              </div>
              <IcChev size={14} color={t.textDim} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionLabel t={t}>AI Coach</SectionLabel>
        <div onClick={onOpenCoach} style={{
          position: 'relative', overflow: 'hidden',
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 20, padding: 18, cursor: 'pointer',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -30, width: 150, height: 150,
            borderRadius: '50%', background: t.accent, filter: 'blur(70px)', opacity: 0.22,
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: t.accent, color: '#fff',
              display: 'flex', alignItems: 'center', boxShadow: '0 6px 16px rgba(239,90,58,0.4)',
            }}><IcSpark size={20} color="#fff" /></div>
            <div style={{ flex: 1 }}>
              <Display t={t} size={18} style={{ lineHeight: 1.1 }}>Spørg din Coach</Display>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Få hjælp · forklaring · øvelse</div>
            </div>
            <IcChev size={14} color={t.textDim} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => setDark(!dark)} style={{
          background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted,
          padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
          fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6, fontFamily: t.font,
        }}>
          {dark ? <IcSun size={12} /> : <IcMoon size={12} />}
          {dark ? 'Skift til lyst tema' : 'Skift til mørkt tema'}
        </button>
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

function PracticeScreen({ t, dark, onOpenTrack }: PracticeScreenProps) {
  return (
    <div style={{ color: t.text, fontFamily: t.font, padding: '4px 0 40px' }}>
      <div style={{ padding: '4px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Display t={t} size={22}>Øvelser</Display>
        <button style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {practiceTracks.map((tr) => (
          <div key={tr.id} onClick={() => onOpenTrack(tr.id)} style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 22, padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}>
            <SectionLabel t={t}>{tr.subtitle}</SectionLabel>
            <Display t={t} size={26} style={{ marginBottom: 8 }}>{tr.title}</Display>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5, marginBottom: 14, fontFamily: t.serif, fontStyle: 'italic' }}>
              {tr.blurb}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: t.accentSoft,
                  display: 'flex', alignItems: 'center', }}><IcClock size={14} color={t.accent} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tr.lessonCount} lektioner</div>
                  <div style={{ fontSize: 10, color: t.textMuted }}>{tr.level}</div>
                </div>
              </div>
            </div>
            {tr.progress > 0 ? (
              <div>
                <div style={{ display: 'flex', fontSize: 10, color: t.textMuted, marginBottom: 4, fontFamily: t.mono, letterSpacing: 0.5 }}>
                  <span>I GANG</span>
                  <span>{tr.progress}%</span>
                </div>
                <Progress pct={tr.progress} t={t} h={4} />
              </div>
            ) : (
              <CTA t={t}>Start forløb</CTA>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Track Detail Overlay
function TrackDetail({ t, dark, trackId, onClose, onOpenLesson, onOpenCoach }: TrackDetailProps) {
  const track = practiceTracks.find(x => x.id === trackId) || practiceTracks[0];
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
        <button onClick={onClose} style={{
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
              <div key={i} onClick={() => !l.locked && onOpenLesson(`${track.id}-${l.n}`)} style={{
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
        <CTA t={t} onClick={() => onOpenLesson(`${track.id}-4`)} icon={<IcPlay size={13} fill color="#fff"/>}>
          {track.progress > 0 ? 'Fortsæt forløb' : 'Start forløb'}
        </CTA>
      </div>
    </div>
  );
}

// 5. Lesson Detail Overlay
function LessonDetail({ t, dark, lessonId, onClose, onOpenCoach }: LessonDetailProps) {
  const [tab, setTab] = useState('noder');
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(92);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = (60 / bpm) * 500;
    const id = setInterval(() => setBeat(b => (b + 1) % 8), interval);
    return () => clearInterval(id);
  }, [playing, bpm]);

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
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcBack size={16} /></button>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1.8, textTransform: 'uppercase' }}>Lektion 04</div>
          <Display t={t} size={16} style={{ marginTop: 2 }}>16-dele hi-hat</Display>
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', background: t.surface, borderRadius: 999, padding: 4, border: `1px solid ${t.border}` }}>
          {[
            { id: 'noder', label: 'Noder' },
            { id: 'video', label: 'Video' },
            { id: 'ovelser', label: 'Øvelser' },
          ].map(tt => (
            <button key={tt.id} onClick={() => setTab(tt.id)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 999, border: 'none',
              background: tab === tt.id ? t.accent : 'transparent',
              color: tab === tt.id ? '#fff' : t.textMuted,
              fontWeight: tab === tt.id ? 700 : 500, fontSize: 12,
              letterSpacing: tab === tt.id ? 1.5 : 0.3, textTransform: tab === tt.id ? 'uppercase' : 'none',
              fontFamily: t.font, cursor: 'pointer',
            }}>{tt.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px 24px' }}>
        {tab === 'noder' && (
          <div>
            <div style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: '18px 8px',
            }}>
              <div style={{ display: 'flex', padding: '0 12px 12px', alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Takt 1 af 8</div>
                <Pill t={t} tone="accent">4/4 · {bpm} BPM</Pill>
              </div>
              <DrumNotation width={340} color={t.text} accent={t.accent} active={playing ? beat : 99} />
              <DrumNotation width={340} color={t.text} accent={t.accent} active={99} />
            </div>

            <div style={{
              marginTop: 14, background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button style={{
                    width: 40, height: 40, borderRadius: '50%', background: t.surface2,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', }}><IcLoop size={16} /></button>
                  <div>
                    <div style={{ fontFamily: t.mono, fontSize: 22, fontWeight: 600 }}>{bpm}</div>
                    <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>BPM</div>
                  </div>
                </div>

                <button onClick={() => setPlaying(!playing)} style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: t.accent, border: 'none', color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 10px 28px rgba(239,90,58,0.45)',
                }}>
                  {playing ? <IcPause size={22} fill color="#fff" /> : <IcPlay size={22} fill color="#fff" />}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setBpm(Math.max(40, bpm - 4))} style={{
                    width: 36, height: 36, borderRadius: '50%', background: t.surface2,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', }}><IcMin size={14} /></button>
                  <button onClick={() => setBpm(Math.min(220, bpm + 4))} style={{
                    width: 36, height: 36, borderRadius: '50%', background: t.surface2,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', }}><IcPlus size={14} /></button>
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
              aspectRatio: '16/9', borderRadius: 18, position: 'relative',
              background: dark ? '#1a1a1c' : '#e8e3da',
              border: `1px solid ${t.border}`, overflow: 'hidden',
              display: 'flex', alignItems: 'center', cursor: 'pointer',
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IllKit size={260} color={t.accent} sw={1.2}/>
              </div>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: t.accent,
                display: 'flex', alignItems: 'center', color: '#fff',
                boxShadow: '0 8px 32px rgba(239,90,58,0.5)', zIndex: 2,
              }}><IcPlay size={24} fill color="#fff" /></div>
              <div style={{
                position: 'absolute', bottom: 10, left: 12, right: 12, zIndex: 2,
                display: 'flex', alignItems: 'center',
              }}>
                <Pill t={t} tone="default">YouTube</Pill>
                <div style={{
                  background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '3px 8px',
                  borderRadius: 6, fontSize: 11, fontFamily: t.mono, fontWeight: 600,
                }}>12:48</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Display t={t} size={20}>16-dele hi-hat</Display>
              <Display t={t} size={20} style={{ opacity: 0.5 }}>— forklaret enkelt</Display>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8, letterSpacing: 0.5 }}>Mikkel Holm · Drum School DK · 124k visninger</div>
            </div>

            <div style={{ marginTop: 24 }}>
              <SectionLabel t={t}>Kapitler</SectionLabel>
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { time: '0:00', title: 'Introduktion' },
                  { time: '1:42', title: 'Højre hånd alene' },
                  { time: '4:18', title: 'Tilføj kick og snare' },
                  { time: '7:55', title: 'Spil med click' },
                  { time: '10:30', title: 'Almindelige fejl' },
                ].map((c, i, arr) => (
                  <div key={i} style={{
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
                  <div key={i} style={{
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
function StudioKitScreen({ t, dark, onOpenPads }: StudioKitScreenProps) {
  return (
    <div style={{ color: t.text, fontFamily: t.font, padding: '4px 0 40px' }}>
      <div style={{ padding: '4px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted }}>Trommesæt</div>
        <button style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', margin: '10px 0 14px', position: 'relative' }}>
          <div style={{
            position: 'absolute', width: 240, height: 180,
            background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 65%)`,
            borderRadius: '50%', top: 0,
          }} />
          <div style={{ position: 'relative' }}>
            <IllKit size={300} color={t.accent} sw={1.3}/>
          </div>
        </div>

        <Display t={t} size={36} style={{ marginBottom: 6 }}>Studio Kit</Display>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent, marginBottom: 14 }}>
          Dit virtuelle trommesæt
        </div>

        <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.8, lineHeight: 1.5 }}>
          Et professionelt trommesæt med realistisk lyd og respons.
        </div>

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { icon: <IcWave size={18} />, title: 'Realistisk lyd', sub: 'Optaget i studiekvalitet' },
            { icon: <IcTuner size={18} />, title: 'Tilpas dit kit', sub: 'Justér lyd og opsætning' },
            { icon: <IcMic size={18} />, title: 'Responsiv følelse', sub: 'Naturlig spiloplevelse' },
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

        <div style={{ marginTop: 30 }}>
          <CTA t={t} onClick={onOpenPads} icon={<IcPlay size={13} fill color="#fff"/>}>Åbn trommesæt</CTA>
        </div>
      </div>
    </div>
  );
}

// 7. Pad view overlay
const pads = [
  { label: 'Hi-hat', sub: 'Closed', color: '#ef5a3a', accent: true, key: 'h' },
  { label: 'Hi-hat', sub: 'Open',   color: '#ef5a3a', key: 'g' },
  { label: 'Crash',  sub: '16"',    color: '#ef5a3a', key: 'c' },
  { label: 'Snare',  sub: 'Center', color: '#ef5a3a', accent: true, key: 's' },
  { label: 'Tom 1',  sub: '10"',    color: '#ef5a3a', key: 't' },
  { label: 'Tom 2',  sub: '12"',    color: '#ef5a3a', key: 'y' },
  { label: 'Floor',  sub: '14"',    color: '#ef5a3a', key: 'f' },
  { label: 'Ride',   sub: '20"',    color: '#ef5a3a', key: 'r' },
  { label: 'Kick',   sub: 'Bass',   color: '#ef5a3a', accent: true, key: 'k' },
];

interface CustomWindow extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
  __kitAudio?: AudioContext;
}

function KitPadView({ t, dark, onClose }: KitPadViewProps) {
  const [active, setActive] = useState<Record<number, number>>({});
  const [recording, setRecording] = useState(false);

  const hit = (i: number) => {
    setActive(a => ({ ...a, [i]: Date.now() }));
    setTimeout(() => setActive(a => {
      const next = { ...a };
      delete next[i];
      return next;
    }), 240);

    // Audio synthesizer synthesis
    try {
      if (typeof window !== 'undefined') {
        const win = window as unknown as CustomWindow;
        const AudioCtx = win.AudioContext || win.webkitAudioContext;
        if (AudioCtx) {
          const ctx = win.__kitAudio || (win.__kitAudio = new AudioCtx());
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const isKick = pads[i].label === 'Kick';
          const isSnare = pads[i].label === 'Snare';
          o.type = isKick ? 'sine' : isSnare ? 'triangle' : 'square';
          o.frequency.value = isKick ? 60 : isSnare ? 200 : (300 + i * 40);
          g.gain.value = 0.06;
          o.connect(g); g.connect(ctx.destination);
          o.start();
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (isKick ? 0.18 : 0.08));
          o.stop(ctx.currentTime + 0.2);
        }
      }
    } catch {
      // Ignore audio synthesis errors
    }
  };

  // Keyboard triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = pads.findIndex(p => p.key === e.key.toLowerCase());
      if (idx !== -1) {
        hit(idx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 150,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcBack size={16} /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1.8, textTransform: 'uppercase' }}>Studio Kit</div>
          <Display t={t} size={16} style={{ marginTop: 2 }}>Live play</Display>
        </div>
        <button onClick={() => setRecording(!recording)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: recording ? t.accent : 'transparent',
          border: `1px solid ${recording ? t.accent : t.border}`,
          color: recording ? '#fff' : t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMic size={16} /></button>
      </div>

      <div style={{ display: 'flex', padding: '6px 0 16px', position: 'relative' }}>
        <div style={{
          position: 'absolute', width: 200, height: 130,
          background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 60%)`,
          borderRadius: '50%', top: 0,
        }} />
        <div style={{ position: 'relative' }}>
          <IllKit size={200} color={t.accent} sw={1.3}/>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px', overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {pads.map((p, i) => {
            const isActive = active[i];
            return (
              <button key={i} onMouseDown={() => hit(i)} onTouchStart={() => hit(i)} style={{
                aspectRatio: '1', borderRadius: 18,
                background: isActive ? t.accent : t.surface,
                border: `1px solid ${isActive ? t.accent : (p.accent ? t.borderStrong : t.border)}`,
                color: isActive ? '#fff' : t.text, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: t.font, transition: 'all 0.08s ease-out',
                transform: isActive ? 'scale(0.96)' : 'scale(1)',
                boxShadow: isActive ? '0 0 30px rgba(239,90,58,0.4)' : 'none',
                padding: 0,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.7 }}>{p.sub}</div>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 22, marginTop: 4, lineHeight: 1 }}>{p.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 18, padding: 14,
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: recording ? t.accent : t.textDim }} />
            <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{recording ? 'Optager' : 'Klar'}</div>
          </div>
          <div style={{ fontFamily: t.mono, fontSize: 14, fontWeight: 600 }}>00:00</div>
          <button style={{
            background: 'transparent', border: `1px solid ${t.border}`, color: t.text,
            padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: t.font,
          }}><IcMetro size={12} /> 92 BPM</button>
        </div>
      </div>
    </div>
  );
}

// 8. Coach Screen Overlay
interface CoachMessage {
  role: string;
  text: string;
  typing?: boolean;
}

function CoachScreen({ t, onClose }: CoachScreenProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([
    { role: 'ai', text: 'Hej Astrid 👋\nJeg er din AI Coach. Jeg har set, du arbejder med 16-dele hi-hat lige nu. Hvordan går det?' },
    { role: 'user', text: 'Det er svært at holde tempo når jeg tilføjer kick. Højre hånd bliver hurtig.' },
    { role: 'ai', text: 'Det er en klassisk udfordring — kroppen vil gerne synkronisere bevægelserne. Prøv det her:\n\n1.   Sæt metronomen til 70 BPM\n2.   Spil KUN hi-hat 16-dele i 8 takter\n3.   Hold tempo, og tilføj så kun kick på 1\n\nFokuser bevidst på at hi-hat-hånden IKKE accelererer. Vil du have, jeg åbner en øvelse til dig?' },
    { role: 'user', text: 'Ja tak.' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', text: input }];
    setInput('');
    setMessages(next);
    setTimeout(() => {
      setMessages([...next, { role: 'ai', text: 'Lad mig finde den…', typing: true }]);
      setTimeout(() => {
        setMessages([...next, { role: 'ai', text: 'Klar — jeg har bygget et 4-trins forløb til dig: starter i 60 BPM og bygger op til 100 BPM. Tryk Start når du er klar.' }]);
      }, 1100);
    }, 250);
  };

  const suggested = [
    'Forklar synkoper',
    'Vis paradiddle',
    'Hvad skal jeg øve i dag?',
    'Hjælp med 16-dele',
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 130,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '4px 16px 14px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
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
              <span style={{ fontSize: 11, color: t.textMuted }}>Online · husker dit niveau</span>
            </div>
          </div>
          <button style={{
            width: 38, height: 38, borderRadius: '50%', background: 'transparent',
            border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
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
              fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              fontWeight: m.role === 'user' ? 500 : 400,
            }}>
              {m.text}
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
            placeholder="Stil et spørgsmål…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: t.font, fontSize: 14, color: t.text, padding: '8px 0',
            }}
          />
          <button onClick={send} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: input.trim() ? t.accent : t.surface2,
            border: 'none', color: input.trim() ? '#fff' : t.textDim,
            cursor: 'pointer', display: 'flex', alignItems: 'center', }}><IcSend size={16} /></button>
        </div>
      </div>
    </div>
  );
}

// 9. Profile Screen
function ProfileScreen({ t, dark, setDark }: ProfileScreenProps) {
  return (
    <div style={{ color: t.text, fontFamily: t.font, padding: '4px 0 40px' }}>
      <div style={{ padding: '4px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted }}>Profil</div>
        <button style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
      </div>

      <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: t.accent,
            display: 'flex', alignItems: 'center', fontFamily: t.serif, fontStyle: 'italic', fontSize: 36, color: '#fff',
            boxShadow: '0 10px 28px rgba(239,90,58,0.4)',
          }}>AL</div>
        </div>
        <Display t={t} size={28} style={{ marginTop: 16 }}>Astrid Lind</Display>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent, marginTop: 6 }}>Niveau 4 · Intermediate</div>

        <div style={{ marginTop: 18, padding: '0 12px' }}>
          <div style={{ display: 'flex', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5 }}>
            <span>NIV 4</span>
            <span>620 / 1000 XP</span>
            <span>NIV 5</span>
          </div>
          <Progress pct={62} t={t} h={6} />
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: <IcFlame size={16} color={t.accent} />, value: '12', label: 'Dage streak' },
            { icon: <IcClock size={16} color={t.text} />, value: '48t', label: 'Total øvetid' },
            { icon: <IcCalendar size={16} color={t.text} />, value: '34/60', label: 'Aktive dage' },
            { icon: <IcTrophy size={16} color={t.text} />, value: '2', label: 'Forløb færdige' },
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

      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel t={t}>Mærker</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { icon: <IcFlame size={20} />, label: '7 dage', earned: true },
            { icon: <IcTrophy size={20} />, label: 'Niv. 4', earned: true },
            { icon: <IcWave size={20} />, label: 'Groove', earned: true },
            { icon: <IcLock size={18} />, label: 'Speed', earned: false },
          ].map((b, i) => (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 16, background: t.surface,
              border: `1px solid ${t.border}`, display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 6, opacity: b.earned ? 1 : 0.4,
            }}>
              <div style={{ color: b.earned ? t.accent : t.textDim }}>{b.icon}</div>
              <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '26px 20px 0' }}>
        <SectionLabel t={t}>Indstillinger</SectionLabel>
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 18, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', border: `1px solid ${t.borderStrong}`,
              display: 'flex', alignItems: 'center', color: t.text,
            }}>{dark ? <IcMoon size={14} /> : <IcSun size={14} />}</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Mørkt tema</div>
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
          {[
            { icon: <IcBell size={14} />, label: 'Notifikationer', detail: 'Hver dag kl. 18' },
            { icon: <IcMetro size={14} />, label: 'Standard metronom', detail: '92 BPM' },
            { icon: <IcUser size={14} />, label: 'Konto og abonnement', detail: 'Pro' },
            { icon: <IcLogout size={14} />, label: 'Log ud' },
          ].map((s, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', border: `1px solid ${t.borderStrong}`,
                display: 'flex', alignItems: 'center', color: t.text,
              }}>{s.icon}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{s.label}</div>
              {s.detail && <span style={{ fontSize: 12, color: t.textMuted, marginRight: 2 }}>{s.detail}</span>}
              <IcChev size={14} color={t.textDim} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, fontSize: 10, color: t.textDim, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase' }}>
        DrumLab v1.2.0
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App Tab bar & Shell Wrapper
// ─────────────────────────────────────────────────────────────
function TabBar({ tab, onTab, t, dark, isMobile }: TabBarProps) {
  const tabs = [
    { id: 'home', label: 'Hjem', icon: TabHome },
    { id: 'practice', label: 'Øvelser', icon: TabPractice },
    { id: 'kit', label: 'Trommesæt', icon: TabKit },
    { id: 'profile', label: 'Profil', icon: TabUser },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
      paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 8px)' : 24,
      paddingTop: 14, paddingLeft: 0, paddingRight: 0,
      background: dark
        ? 'linear-gradient(to top, rgba(10,10,10,1) 50%, rgba(10,10,10,0.85) 80%, rgba(10,10,10,0))'
        : 'linear-gradient(to top, rgba(244,241,236,1) 50%, rgba(244,241,236,0.85) 80%, rgba(244,241,236,0))',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 4px',
      }}>
        {tabs.map(tt => {
          const active = tab === tt.id;
          const Icon = tt.icon;
          return (
            <button key={tt.id} onClick={() => onTab(tt.id)} style={{
              flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '6px 0', fontFamily: t.font,
              color: active ? t.accent : t.textMuted,
            }}>
              <Icon size={24} color={active ? t.accent : t.textMuted} sw={active ? 1.8 : 1.4} />
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: 0.2,
              }}>{tt.label}</span>
            </button>
          );
        })}
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

export default function MobilePrototype() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState('home');
  const [trackId, setTrackId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const [padsOpen, setPadsOpen] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize onboarded status from localStorage client-side
  useEffect(() => {
    try {
      const val = localStorage.getItem('drumlab-onboarded');
      setTimeout(() => {
        setOnboarded(val === '1');
      }, 0);
    } catch {
      // Ignore errors silently on SSR
    }
  }, []);

  const t = tokens(dark);
  const scale = useFitScale(402, 874);

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [tab]);

  const STATUS_BAR = 62;

  const completeOnboarding = () => {
    try {
      localStorage.setItem('drumlab-onboarded', '1');
    } catch {
      // Ignore errors silently
    }
    setOnboarded(true);
  };

  const handleResetOnboarding = () => {
    try {
      localStorage.removeItem('drumlab-onboarded');
    } catch {
      // Ignore errors silently
    }
    setOnboarded(false);
  };

  const safeVars = {
    '--safe-top': isMobile ? 'calc(env(safe-area-inset-top) + 12px)' : '62px',
    '--safe-bottom': isMobile ? 'env(safe-area-inset-bottom)' : '0px',
  } as React.CSSProperties;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050505' }}>
      <Header />

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
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              overflow: 'auto',
              paddingTop: 'var(--safe-top)',
              paddingBottom: 'calc(var(--safe-bottom) + 100px)',
            }}>
              {tab === 'home' && (
                <HomeScreen t={t} dark={dark} setDark={setDark}
                  onOpenLesson={(id: string) => setLessonId(id)}
                  onTab={(id: string) => setTab(id)}
                  onOpenCoach={() => setCoachOpen(true)} />
              )}
              {tab === 'practice' && (
                <PracticeScreen t={t} dark={dark} onOpenTrack={(id: string) => setTrackId(id)} />
              )}
              {tab === 'kit' && (
                <StudioKitScreen t={t} dark={dark} onOpenPads={() => setPadsOpen(true)} />
              )}
              {tab === 'profile' && (
                <ProfileScreen t={t} dark={dark} setDark={setDark} />
              )}
            </div>

            {/* Tab bar */}
            <TabBar tab={tab} onTab={setTab} t={t} dark={dark} isMobile={isMobile} />

            {/* Track detail overlay */}
            {trackId && (
              <TrackDetail t={t} dark={dark} trackId={trackId}
                onClose={() => setTrackId(null)}
                onOpenLesson={(id: string) => setLessonId(id)}
                onOpenCoach={() => { setTrackId(null); setCoachOpen(true); }} />
            )}

            {/* Lesson detail overlay */}
            {lessonId && (
              <LessonDetail t={t} dark={dark} lessonId={lessonId}
                onClose={() => setLessonId(null)}
                onOpenCoach={() => { setLessonId(null); setCoachOpen(true); }} />
            )}

            {/* Coach overlay */}
            {coachOpen && (
              <CoachScreen t={t} dark={dark} onClose={() => setCoachOpen(false)} />
            )}

            {/* Pad view overlay */}
            {padsOpen && (
              <KitPadView t={t} dark={dark} onClose={() => setPadsOpen(false)} />
            )}

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
