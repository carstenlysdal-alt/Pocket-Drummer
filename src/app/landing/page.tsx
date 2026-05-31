'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

function markLandingSeen() {
  try { localStorage.setItem('pocketdrummer_landing_seen', '1'); } catch {}
}

function useAppUrl() {
  const [url, setUrl] = useState('/prototype');
  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
    setUrl(mobile ? '/prototype' : '/');
  }, []);
  return url;
}

// ─── DESIGN TOKENS ────────────────────────────────────────────
const T = {
  bg:       '#0C0A07',
  bg1:      '#131008',
  bg2:      '#1A1512',
  bg3:      '#1E1A13',
  surface:  'rgba(255,255,255,0.04)',
  border:   'rgba(255,255,255,0.07)',
  border2:  'rgba(255,255,255,0.12)',
  text:     '#EDE9E4',
  text2:    '#A09890',
  text3:    '#66615C',
  accent:   '#E8703A',
  accentB:  '#D4622E',
  accentD:  'rgba(232,112,58,0.14)',
  accentG:  'rgba(232,112,58,0.22)',
  gold:     '#D4A96A',
  goldD:    'rgba(212,169,106,0.12)',
  head:     "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif",
  body:     "'Inter', system-ui, sans-serif",
  mono:     "'JetBrains Mono', monospace",
  ease:     'cubic-bezier(0.16, 1, 0.3, 1)',
};

// ─── RESPONSIVE HOOK ──────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth < bp);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [bp]);
  return m;
}

// ─── TINY ICONS ────────────────────────────────────────────────
function Ic({ path, size = 20, stroke = T.text2, fill = false }: { path: string; size?: number; stroke?: string; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? stroke : 'none'} stroke={fill ? 'none' : stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

// ─── PHONE MOCKUP (CSS app preview) ────────────────────────────
function PhoneMockup() {
  const [beat, setBeat] = useState(2);
  useEffect(() => {
    const id = setInterval(() => setBeat(b => (b + 1) % 8), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: 280, height: 560,
      borderRadius: 42,
      background: T.bg,
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 0 0 10px #0A0806, 0 40px 80px rgba(0,0,0,0.8), 0 0 0 11px rgba(255,255,255,0.06)',
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Dynamic island */}
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 100, height: 30, borderRadius: 20, background: '#000', zIndex: 10 }} />

      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px 0', fontSize: 12, fontWeight: 600, fontFamily: T.body, color: T.text }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <svg width="15" height="11" viewBox="0 0 15 11" fill={T.text}><rect x="0" y="7" width="2.5" height="4" rx="0.5"/><rect x="4" y="4.5" width="2.5" height="6.5" rx="0.5"/><rect x="8" y="2" width="2.5" height="9" rx="0.5"/><rect x="12" y="0" width="2.5" height="11" rx="0.5"/></svg>
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke={T.text} strokeWidth="0.9"/><rect x="2" y="2" width="13" height="7" rx="1.5" fill={T.text}/><rect x="19.5" y="3.5" width="2.5" height="4" rx="1" fill={T.text} opacity="0.5"/></svg>
        </div>
      </div>

      {/* Hero card area */}
      <div style={{ margin: '16px 14px 0', borderRadius: 18, overflow: 'hidden', position: 'relative', height: 220 }}>
        {/* Video thumb */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 28%, rgba(200,100,40,0.6) 0%, transparent 52%), radial-gradient(ellipse at 80% 68%, rgba(130,60,20,0.4) 0%, transparent 46%), linear-gradient(160deg, #2C1A08 0%, #1A0E05 44%, #0C0805 100%)',
        }} />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(12,10,7,0) 25%, rgba(12,10,7,0.92) 100%)' }} />
        {/* Day pill */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <div style={{ background: 'rgba(232,112,58,0.2)', border: '1px solid rgba(232,112,58,0.4)', borderRadius: 20, padding: '4px 10px', fontSize: 9, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: T.body }}>Dag 7 · 14 min</div>
        </div>
        {/* Content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: T.text2, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5, fontFamily: T.body }}>I dag · Grundrytmer</div>
          <div style={{ fontFamily: T.head, fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: -0.4, lineHeight: 1.1, marginBottom: 8 }}>Grooves & fills</div>
          {/* Progress bar */}
          <div style={{ height: 2.5, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ height: '100%', width: '43%', background: T.accent, borderRadius: 2 }} />
          </div>
          {/* CTA button */}
          <div style={{ background: T.accent, borderRadius: 9, padding: '8px 12px', textAlign: 'center', fontFamily: T.head, fontSize: 11, fontWeight: 700, color: '#fff' }}>Start lektion</div>
        </div>
      </div>

      {/* Drum notation strip */}
      <div style={{ margin: '14px 14px 0', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 12px' }}>
        <div style={{ fontSize: 8, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, fontFamily: T.body }}>Live notater</div>
        <svg width="100%" height="44" viewBox="0 0 240 44">
          {/* Staff lines */}
          {[0,1,2,3,4].map(i => (
            <line key={i} x1="20" y1={8 + i * 7} x2="230" y2={8 + i * 7} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
          ))}
          {/* Hi-hat crosses */}
          {[0,1,2,3,4,5,6,7].map(i => {
            const x = 30 + i * 27;
            const isActive = i === beat;
            return (
              <g key={i}>
                <line x1={x-3.5} y1="2" x2={x+3.5} y2="9" stroke={isActive ? T.accent : 'rgba(255,255,255,0.3)'} strokeWidth={isActive ? 1.8 : 1}/>
                <line x1={x+3.5} y1="2" x2={x-3.5} y2="9" stroke={isActive ? T.accent : 'rgba(255,255,255,0.3)'} strokeWidth={isActive ? 1.8 : 1}/>
              </g>
            );
          })}
          {/* Snare on beats 2,6 */}
          {[2,6].map(i => {
            const x = 30 + i * 27;
            const isActive = i === beat;
            return <ellipse key={i} cx={x} cy="22" rx="5" ry="3.5" fill={isActive ? T.accent : 'rgba(255,255,255,0.35)'} transform={`rotate(-15 ${x} 22)`}/>;
          })}
          {/* Kick on beats 0,4 */}
          {[0,4].map(i => {
            const x = 30 + i * 27;
            const isActive = i === beat;
            return <ellipse key={i} cx={x} cy="36" rx="5" ry="3.5" fill={isActive ? T.accent : 'rgba(255,255,255,0.35)'} transform={`rotate(-15 ${x} 36)`}/>;
          })}
        </svg>
      </div>

      {/* Streak row */}
      <div style={{ margin: '10px 14px 0', display: 'flex', gap: 8 }}>
        {['Ma','Ti','On','To','Fr','Lø','Sø'].map((d, i) => (
          <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 7, color: T.text3, fontFamily: T.body, textTransform: 'uppercase', letterSpacing: 0.3 }}>{d}</div>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: i < 6 ? T.accent : 'transparent',
              border: i < 6 ? 'none' : `1px solid ${T.border}`,
              boxShadow: i < 6 ? `0 0 8px ${T.accentG}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i < 6 && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"><path d="M1.5 5L4 7.5L8.5 2.5"/></svg>}
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 72, background: 'rgba(10,8,5,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center',
        paddingBottom: 10,
      }}>
        {[
          { label: 'Hjem', active: true, path: 'M3 9L12 2.5L21 9V21H15V14H9V21H3V9Z' },
          { label: 'Bibliotek', active: false, path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
          { label: 'Progression', active: false, path: 'M3 18L8 12L12 16L19 9M15 9h4v4' },
          { label: 'Profil', active: false, path: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-4 3.6-7 8-7s8 3 8 7' },
        ].map(tab => (
          <div key={tab.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 36, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: tab.active ? T.accentD : 'transparent' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tab.active ? T.accent : T.text3} strokeWidth={tab.active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.path}/>
              </svg>
            </div>
            <span style={{ fontSize: 8, fontWeight: tab.active ? 700 : 500, color: tab.active ? T.accent : T.text3, fontFamily: T.body }}>{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FEATURE CARD ─────────────────────────────────────────────
function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{
      background: T.bg2,
      border: `1px solid ${T.border}`,
      borderRadius: 20,
      padding: '28px 26px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: `border-color 200ms ${T.ease}`,
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,112,58,0.25)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentD, border: `1px solid rgba(232,112,58,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: T.head, fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: -0.3, marginBottom: 8, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontFamily: T.body, fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

// ─── STAT ─────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: T.head, fontSize: 40, fontWeight: 800, color: T.text, letterSpacing: -1.5, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: T.body, fontSize: 13, color: T.text2, marginTop: 6 }}>{label}</div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────
export default function LandingPage() {
  const m = useIsMobile();
  const appUrl = useAppUrl();
  const px = m ? '20px' : '48px';
  const sectionPy = m ? '64px' : '96px';

  return (
    <main style={{ background: T.bg, color: T.text, fontFamily: T.body, minHeight: '100dvh', overflowX: 'hidden' }}>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100dvh',
        maxWidth: 1200,
        margin: '0 auto',
        padding: m ? '72px 20px 48px' : '0 48px',
        display: 'grid',
        gridTemplateColumns: m ? '1fr' : '1fr 1fr',
        alignItems: 'center',
        gap: m ? 48 : 80,
      }}>
        {/* Left: copy */}
        <div style={{ order: m ? 1 : 0 }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: T.accentD, border: `1px solid rgba(232,112,58,0.28)`,
            borderRadius: 20, padding: '6px 14px',
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, boxShadow: `0 0 8px ${T.accentG}` }} />
            <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 600, color: T.accent, letterSpacing: 0.3 }}>Founding member — 50 kr/md</span>
          </div>

          <h1 style={{
            fontFamily: T.head,
            fontSize: m ? '38px' : 'clamp(42px, 5vw, 68px)',
            fontWeight: 800,
            color: T.text,
            letterSpacing: m ? -1.2 : -2,
            lineHeight: 1.05,
            marginBottom: 20,
          }}>
            Lær at spille<br />
            trommer.<br />
            <span style={{ color: T.accent }}>På dine præmisser.</span>
          </h1>

          <p style={{
            fontFamily: T.body,
            fontSize: m ? 16 : 18,
            color: T.text2,
            lineHeight: 1.65,
            maxWidth: 460,
            marginBottom: 32,
          }}>
            Pocket Drummer er en dansk læringsplatform der fortæller dig præcist hvad du skal øve i dag — og beviser at du rykker dig. Med AI-coach, interaktive noder og strukturerede programmer.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', gap: m ? 12 : 14, alignItems: m ? 'stretch' : 'center', flexWrap: 'wrap' }}>
            <Link href={appUrl} onClick={markLandingSeen} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: T.accent, color: '#fff',
              fontFamily: T.head, fontSize: 15, fontWeight: 700,
              padding: '15px 28px', borderRadius: 14,
              textDecoration: 'none', letterSpacing: -0.2,
              boxShadow: `0 8px 32px rgba(232,112,58,0.38)`,
              transition: `background 150ms, transform 150ms ${T.ease}, box-shadow 150ms`,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.accentB; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(232,112,58,0.48)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 8px 32px rgba(232,112,58,0.38)`; }}
            >
              Prøv gratis
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M8 3l5 5-5 5"/></svg>
            </Link>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: T.text2, fontFamily: T.body, fontSize: 15, fontWeight: 500,
              textDecoration: 'none',
              transition: `color 150ms`,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = T.text)}
              onMouseLeave={e => (e.currentTarget.style.color = T.text2)}
            >
              Har du allerede en konto?
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2.5 7h9M7.5 3l4 4-4 4"/></svg>
            </Link>
          </div>

          {/* Social proof micro */}
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {['#E8703A','#D4622E','#C05420','#A84820'].map((c, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: '2px solid ' + T.bg, marginLeft: i === 0 ? 0 : -8 }} />
              ))}
            </div>
            <span style={{ fontFamily: T.body, fontSize: 13, color: T.text2 }}>Founding members trommer allerede i dag</span>
          </div>
        </div>

        {/* Right: phone mockup — hidden on small mobile, shown on tablet+ */}
        <div style={{ display: m ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(232,112,58,0.12) 0%, transparent 70%)`,
            filter: 'blur(30px)', pointerEvents: 'none',
          }} />
          <PhoneMockup />
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════ */}
      <section style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: m ? '40px 20px' : '56px 48px', display: 'grid', gridTemplateColumns: m ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: m ? 24 : 32 }}>
          <Stat value="50 kr" label="per måned — founding member" />
          <Stat value="14 min" label="gennemsnitlig daglig øvelse" />
          <Stat value="30 dage" label="til mærkbar fremgang" />
          <Stat value="AI" label="lærer der husker dig" />
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionPy} ${px}` }}>
        <div style={{ marginBottom: m ? 40 : 64, maxWidth: 560 }}>
          <h2 style={{ fontFamily: T.head, fontSize: m ? '28px' : 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: T.text, letterSpacing: m ? -0.8 : -1.5, lineHeight: 1.1, marginBottom: 14 }}>
            Alt hvad en trommeslager behøver. Intet andet.
          </h2>
          <p style={{ fontFamily: T.body, fontSize: m ? 15 : 16, color: T.text2, lineHeight: 1.65 }}>
            Bygget til den voksne begynder der har præcis 15 minutter om dagen og vil vide, at de bruger dem rigtigt.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : 'repeat(3, 1fr)', gap: m ? 12 : 16 }}>
          <FeatureCard
            icon={<Ic path="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" size={20} stroke={T.accent}/>}
            title="AI-coach der husker dig"
            body="Din personlige trommelærer tilpasser øvelserne til dit præcise niveau og husker hvad du sidst arbejdede med — på dansk."
          />
          <FeatureCard
            icon={<Ic path="M9 3h6l3 18H6L9 3zM12 14l-5-7" size={20} stroke={T.accent}/>}
            title="Strukturerede programmer"
            body="4-ugers forløb med klare mål. Du ved altid hvad du skal øve i dag og kan se præcis hvad du har opnået."
          />
          <FeatureCard
            icon={<Ic path="M9 18V5l12-2v13M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" size={20} stroke={T.accent}/>}
            title="Interaktive trommenoder"
            body="Se og hør dine noder i realtid. Upload et fotografi af noder og få AI til at analysere dem — med det samme."
          />
          <FeatureCard
            icon={<Ic path="M3 18L8 12L12 16L19 9M15 9h4v4" size={20} stroke={T.accent}/>}
            title="Bevis at du rykker dig"
            body="Streak-tæller, progression-map og præcise fremskridtsdata. Du kan se det, og det motiverer dig til at fortsætte."
          />
          <FeatureCard
            icon={<Ic path="M12 3L8 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l4 4 4-4h3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-4-4z" size={20} stroke={T.accent}/>}
            title="Digitalt trommesæt"
            body="Øv dine slag og rytmer direkte i appen — uden ekstra udstyr. Perfekt til at fæstne det i fingrene."
          />
          <FeatureCard
            icon={<Ic path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={20} stroke={T.accent}/>}
            title="Kun 50 kr. om måneden"
            body="Founding member-prisen. Ingen binding. Fuld adgang til alt indhold, AI-coach og nye øvelser hver uge."
          />
        </div>
      </section>

      {/* ══ PROOF / HOW IT WORKS ══════════════════════════════════ */}
      <section style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionPy} ${px}`, display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: m ? 48 : 80, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: T.head, fontSize: m ? '26px' : 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, color: T.text, letterSpacing: m ? -0.7 : -1.2, lineHeight: 1.12, marginBottom: 14 }}>
              Din trommelajrer. I din lomme. Til under en kop kaffe om ugen.
            </h2>
            <p style={{ fontFamily: T.body, fontSize: 15, color: T.text2, lineHeight: 1.7, marginBottom: 32 }}>
              Pocket Drummer er bygget til hverdagen. Åbn appen, se hvad du skal øve i dag, øv i 15 minutter, luk appen. Så enkelt er det. AI-coachen gør det tunge arbejde — du spiller bare.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { n: '01', title: 'Åbn appen', body: 'Din AI-coach har allerede planlagt din dag baseret på dit niveau og forrige session.' },
                { n: '02', title: 'Øv i 15 minutter', body: 'Følg strukturerede lektioner med video, noder og real-time feedback. Ingen gætværk.' },
                { n: '03', title: 'Se fremgangen', body: 'Din streak vokser. Dit progression-map udfyldes. Du kan mærke og bevise, at du rykker dig.' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentD, border: `1px solid rgba(232,112,58,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.accent }}>{step.n}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: T.head, fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: -0.2, marginBottom: 4 }}>{step.title}</div>
                    <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>{step.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second phone mockup — hidden on mobile */}
          <div style={{ display: m ? 'none' : 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: `radial-gradient(circle, rgba(232,112,58,0.08) 0%, transparent 70%)`, filter: 'blur(20px)' }} />
            <div style={{
              width: 260, height: 520, borderRadius: 40,
              background: T.bg, border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 0 9px #0A0806, 0 32px 64px rgba(0,0,0,0.7), 0 0 0 10px rgba(255,255,255,0.05)',
              overflow: 'hidden', position: 'relative',
            }}>
              {/* Dynamic island */}
              <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 92, height: 28, borderRadius: 18, background: '#000', zIndex: 10 }} />

              <div style={{ padding: '52px 18px 0' }}>
                {/* Screen title */}
                <div style={{ fontFamily: T.head, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.7, marginBottom: 16 }}>Progression</div>

                {/* Streak card */}
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: '18px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -30, right: -15, width: 100, height: 100, borderRadius: '50%', background: 'rgba(232,112,58,0.1)', filter: 'blur(15px)' }} />
                  <div>
                    <div style={{ fontFamily: T.head, fontSize: 46, fontWeight: 800, color: T.accent, letterSpacing: -2, lineHeight: 1 }}>12</div>
                    <div style={{ fontFamily: T.body, fontSize: 12, color: T.text2, marginTop: 2 }}>dage i træk</div>
                  </div>
                  <span style={{ fontSize: 38 }}>🔥</span>
                </div>

                {/* Week dots */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {['Ma','Ti','On','To','Fr','Lø','Sø'].map((d, i) => (
                    <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ fontSize: 7, color: T.text3, fontFamily: T.body, textTransform: 'uppercase' }}>{d}</div>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: i < 6 ? T.accent : 'transparent', border: i < 6 ? 'none' : `1px solid ${T.border}`, boxShadow: i < 6 ? `0 0 8px ${T.accentG}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i < 6 && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"><path d="M1.5 5L4 7.5L8.5 2.5"/></svg>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Module bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['Grundrytmer', 71],['Koordination', 45],['Fill-ins', 20],['Rudiments', 8]].map(([name, pct]) => (
                    <div key={name as string} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontFamily: T.head, fontSize: 12, fontWeight: 600, color: T.text }}>{name}</span>
                        <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 600, color: T.accent }}>{pct}%</span>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: T.accent, borderRadius: 2, boxShadow: `0 0 6px rgba(232,112,58,0.3)` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionPy} ${px}` }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: T.head, fontSize: m ? '26px' : 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, color: T.text, letterSpacing: m ? -0.7 : -1.2, lineHeight: 1.12, marginBottom: 14 }}>
            En pris. Fuld adgang.
          </h2>
          <p style={{ fontFamily: T.body, fontSize: 15, color: T.text2, lineHeight: 1.65, marginBottom: 48 }}>
            Founding member-prisen gælder så længe du er aktiv bruger. Ingen bindingsperiode.
          </p>

          {/* Pricing card */}
          <div style={{
            background: T.bg2, border: `1px solid ${T.border}`,
            borderRadius: 24, padding: m ? '28px 20px' : '40px 40px', position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(232,112,58,0.08)', filter: 'blur(30px)', pointerEvents: 'none' }} />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.goldD, border: `1px solid rgba(212,169,106,0.25)`, borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill={T.gold}><path d="M5 0L6.12 3.38H9.51L6.82 5.47L7.94 8.85L5 6.76L2.06 8.85L3.18 5.47L0.49 3.38H3.88L5 0Z"/></svg>
              <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: 0.5 }}>Founding member-pris</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: T.head, fontSize: 64, fontWeight: 800, color: T.text, letterSpacing: -2, lineHeight: 1 }}>50</span>
              <span style={{ fontFamily: T.body, fontSize: 18, color: T.text2 }}>kr/md</span>
            </div>
            <div style={{ fontFamily: T.body, fontSize: 13, color: T.text3, marginBottom: 32 }}>Ingen binding. Opsig når som helst.</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left' }}>
              {[
                'AI-coach der tilpasser sig dit niveau',
                'Fuldt øvelsesbibliotek med nye øvelser ugentligt',
                'Interaktive trommenoder og nodeanalyse',
                'Digitalt trommesæt og play-along tracks',
                'Progression-map og streak-tracking',
                'Adgang til alle fremtidige features',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.accentD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={T.accent} strokeWidth="1.6" strokeLinecap="round"><path d="M1.5 5L4 7.5L8.5 2.5"/></svg>
                  </div>
                  <span style={{ fontFamily: T.body, fontSize: 14, color: T.text2 }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href={appUrl} onClick={markLandingSeen} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: T.accent, color: '#fff',
              fontFamily: T.head, fontSize: 15, fontWeight: 700,
              padding: '16px 32px', borderRadius: 14,
              textDecoration: 'none', letterSpacing: -0.2,
              boxShadow: `0 8px 32px rgba(232,112,58,0.35)`,
              transition: `background 150ms, transform 150ms ${T.ease}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.accentB; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = ''; }}
            >
              Start som founding member
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M8 3l5 5-5 5"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════ */}
      <section style={{ background: T.bg1, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionPy} ${px}`, textAlign: 'center' }}>
          <h2 style={{ fontFamily: T.head, fontSize: m ? '28px' : 'clamp(32px, 4vw, 54px)', fontWeight: 800, color: T.text, letterSpacing: m ? -0.8 : -1.8, lineHeight: 1.08, marginBottom: 18, maxWidth: 700, margin: `0 auto ${m ? '16px' : '20px'}` }}>
            Du behøver ikke en lærer.<br />Du behøver Pocket Drummer.
          </h2>
          <p style={{ fontFamily: T.body, fontSize: 16, color: T.text2, lineHeight: 1.65, maxWidth: 480, margin: '0 auto 40px' }}>
            Kom i gang i dag. Ingen forudgående erfaring krævet.
          </p>
          <Link href={appUrl} onClick={markLandingSeen} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: T.accent, color: '#fff',
            fontFamily: T.head, fontSize: 16, fontWeight: 700,
            padding: '17px 32px', borderRadius: 16,
            textDecoration: 'none', letterSpacing: -0.2,
            boxShadow: `0 8px 40px rgba(232,112,58,0.4)`,
            width: m ? '100%' : 'auto',
            transition: `background 150ms, transform 150ms ${T.ease}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.accentB; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = ''; }}
          >
            Åbn Pocket Drummer
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3.5 8.5h10M8.5 3.5l5 5-5 5"/></svg>
          </Link>
        </div>

        {/* Footer */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: m ? '24px 20px' : '32px 48px', borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: m ? 'column' : 'row', justifyContent: 'space-between', alignItems: m ? 'flex-start' : 'center', gap: m ? 16 : 0 }}>
          <div style={{ fontFamily: T.head, fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: -0.4 }}>Pocket Drummer</div>
          <div style={{ fontFamily: T.body, fontSize: 13, color: T.text3 }}>
            Bygget i Danmark. Til trommespillere på alle niveauer.
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/login" style={{ fontFamily: T.body, fontSize: 13, color: T.text3, textDecoration: 'none' }}>Log ind</Link>
            <Link href={appUrl} onClick={markLandingSeen} style={{ fontFamily: T.body, fontSize: 13, color: T.text3, textDecoration: 'none' }}>Åbn app</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
