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

// ─── LANDING NAV ──────────────────────────────────────────────
function LandingNav({ appUrl, m }: { appUrl: string; m: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 64,
      background: scrolled ? 'rgba(12,10,7,0.94)' : 'rgba(12,10,7,0)',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: `1px solid ${scrolled ? T.border : 'transparent'}`,
      transition: `background 300ms ${T.ease}, border-color 300ms ${T.ease}`,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: m ? '0 20px' : '0 48px',
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div style={{
          fontFamily: T.head, fontSize: m ? 16 : 18,
          fontWeight: 800, color: T.text, letterSpacing: -0.4,
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          Pocket Drummer<span style={{ color: T.accent, fontWeight: 900 }}>.</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: m ? 10 : 20 }}>
          {!m && (
            <Link href="/login" style={{
              fontFamily: T.body, fontSize: 14, color: T.text2,
              textDecoration: 'none', transition: `color 150ms`,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = T.text)}
              onMouseLeave={e => (e.currentTarget.style.color = T.text2)}
            >
              Log ind
            </Link>
          )}
          <Link
            href={appUrl}
            onClick={markLandingSeen}
            style={{
              fontFamily: T.body, fontSize: 13, fontWeight: 600, color: '#fff',
              background: T.accent, padding: '9px 20px', borderRadius: 10,
              textDecoration: 'none', letterSpacing: -0.1,
              boxShadow: `0 4px 16px rgba(232,112,58,0.35)`,
              transition: `background 150ms, transform 150ms ${T.ease}`,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.accentB; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = ''; }}
          >
            Kom i gang
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── LEVEL SELECTOR ────────────────────────────────────────────
function LevelSelector({ appUrl }: { appUrl: string }) {
  const [selected, setSelected] = useState<string | null>(null);

  const levels = [
    {
      id: 'begynder',
      label: 'Begynder',
      desc: 'Helt ny — har brug for struktur og et solidt udgangspunkt',
      dots: 1,
    },
    {
      id: 'mellemniveau',
      label: 'Mellemniveau',
      desc: 'Kender grundrytmerne og vil konsolidere nye teknikker',
      dots: 2,
    },
    {
      id: 'øvet',
      label: 'Øvet',
      desc: 'Erfaren trommeslager der vil skubbe til egne grænser',
      dots: 3,
    },
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    try { localStorage.setItem('pocketdrummer_level', id); } catch {}
  };

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.text2,
        letterSpacing: 1.2, textTransform: 'uppercase',
        marginBottom: 16, fontFamily: T.body,
      }}>
        Hvad er dit niveau?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {levels.map(lv => {
          const active = selected === lv.id;
          return (
            <button
              key={lv.id}
              onClick={() => handleSelect(lv.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: active ? 'rgba(232,112,58,0.10)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? 'rgba(232,112,58,0.40)' : T.border2}`,
                borderRadius: 14, padding: '14px 18px',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: `all 150ms ${T.ease}`,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = T.border2; }}
            >
              {/* Level dots */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {[1, 2, 3].map(d => (
                  <div key={d} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: d <= lv.dots
                      ? (active ? T.accent : 'rgba(255,255,255,0.45)')
                      : 'rgba(255,255,255,0.10)',
                    transition: `background 150ms`,
                  }} />
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: T.head, fontSize: 15, fontWeight: 700,
                  color: active ? T.text : T.text,
                  marginBottom: 3,
                }}>{lv.label}</div>
                <div style={{ fontFamily: T.body, fontSize: 12, color: T.text2, lineHeight: 1.4 }}>{lv.desc}</div>
              </div>
              {active && (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={T.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M3 9l4.5 4.5L15 4.5"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <Link
        href={appUrl}
        onClick={markLandingSeen}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: T.accent, color: '#fff',
          fontFamily: T.head, fontSize: 15, fontWeight: 700,
          padding: '16px 28px', borderRadius: 14,
          textDecoration: 'none', letterSpacing: -0.2,
          boxShadow: `0 8px 32px rgba(232,112,58,0.40)`,
          transition: `background 150ms, transform 150ms ${T.ease}`,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = T.accentB; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = ''; }}
      >
        {selected ? `Start som ${selected}` : 'Prøv gratis'}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M8 3l5 5-5 5"/></svg>
      </Link>

      <div style={{ marginTop: 14, textAlign: 'center', fontFamily: T.body, fontSize: 12, color: T.text3 }}>
        Ingen kreditkort krævet · Founding member: 50 kr/md
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
    <>
      <LandingNav appUrl={appUrl} m={m} />
      <main style={{ background: T.bg, color: T.text, fontFamily: T.body, minHeight: '100dvh', overflowX: 'hidden' }}>

        {/* ══ HERO ══════════════════════════════════════════════════ */}
        <section style={{
          minHeight: '100dvh',
          maxWidth: 1200,
          margin: '0 auto',
          padding: m ? '88px 20px 48px' : '0 48px',
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
              marginBottom: 36,
            }}>
              Pocket Drummer er en dansk læringsplatform der fortæller dig præcist hvad du skal øve i dag — og beviser at du rykker dig. Med AI-coach, interaktive noder og strukturerede programmer.
            </p>

            {/* Social proof micro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {['#E8703A','#D4622E','#C05420','#A84820'].map((c, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: '2px solid ' + T.bg, marginLeft: i === 0 ? 0 : -8 }} />
                ))}
              </div>
              <span style={{ fontFamily: T.body, fontSize: 13, color: T.text2 }}>Founding members trommer allerede i dag</span>
            </div>
          </div>

          {/* Right: Level selector */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            position: 'relative', order: m ? 0 : 1,
          }}>
            {/* Ambient glow */}
            <div style={{
              position: 'absolute', width: 400, height: 400, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(232,112,58,0.10) 0%, transparent 70%)`,
              filter: 'blur(30px)', pointerEvents: 'none',
            }} />
            <LevelSelector appUrl={appUrl} />
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
                Din trommelærer. I din lomme. Til under en kop kaffe om ugen.
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

            {/* Second level selector preview card */}
            <div style={{ display: m ? 'none' : 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: `radial-gradient(circle, rgba(232,112,58,0.08) 0%, transparent 70%)`, filter: 'blur(20px)' }} />
              <div style={{
                width: 320, borderRadius: 24,
                background: T.bg2, border: `1px solid ${T.border2}`,
                padding: '28px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              }}>
                <div style={{ fontFamily: T.head, fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: -0.5, marginBottom: 6 }}>Dag 7 · Grundrytmer</div>
                <div style={{ fontFamily: T.body, fontSize: 13, color: T.text2, marginBottom: 20 }}>Din AI-coach har valgt 3 øvelser til i dag.</div>

                {/* Progress bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {[['Grundrytmer', 71],['Koordination', 45],['Fill-ins', 20]].map(([name, pct]) => (
                    <div key={name as string}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontFamily: T.head, fontSize: 12, fontWeight: 600, color: T.text }}>{name}</span>
                        <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 600, color: T.accent }}>{pct}%</span>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: T.accent, borderRadius: 2, boxShadow: `0 0 6px rgba(232,112,58,0.3)` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Week streak */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Ma','Ti','On','To','Fr','Lø','Sø'].map((d, i) => (
                    <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ fontSize: 7, color: T.text3, fontFamily: T.body, textTransform: 'uppercase' }}>{d}</div>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: i < 6 ? T.accent : 'transparent', border: i < 6 ? 'none' : `1px solid ${T.border}`, boxShadow: i < 6 ? `0 0 8px ${T.accentG}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i < 6 && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"><path d="M1.5 5L4 7.5L8.5 2.5"/></svg>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CREATE PROFILE ════════════════════════════════════════ */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionPy} ${px}` }}>
          <div style={{
            background: T.bg2, border: `1px solid ${T.border2}`,
            borderRadius: 28, overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: m ? '1fr' : '1fr 1fr',
          }}>
            {/* Left */}
            <div style={{ padding: m ? '32px 24px' : '52px 48px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: T.accentD, border: `1px solid rgba(232,112,58,0.28)`,
                borderRadius: 20, padding: '5px 14px', marginBottom: 22,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, boxShadow: `0 0 8px ${T.accentG}` }} />
                <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 600, color: T.accent }}>Gratis at oprette</span>
              </div>
              <h2 style={{
                fontFamily: T.head,
                fontSize: m ? '24px' : 'clamp(26px, 3vw, 38px)',
                fontWeight: 800, color: T.text,
                letterSpacing: m ? -0.6 : -1.1, lineHeight: 1.1, marginBottom: 14,
              }}>
                Opret din profil.<br />Din coach husker dig.
              </h2>
              <p style={{ fontFamily: T.body, fontSize: 15, color: T.text2, lineHeight: 1.65 }}>
                Din AI-coach gemmer dit niveau, dine fremskridt og tilpasser øvelserne efter dig fra dag 1. Ingen tidligere erfaring krævet.
              </p>
            </div>

            {/* Right: feature list + CTA */}
            <div style={{
              background: T.bg1,
              borderLeft: m ? 'none' : `1px solid ${T.border}`,
              borderTop: m ? `1px solid ${T.border}` : 'none',
              padding: m ? '28px 24px' : '52px 44px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{ fontFamily: T.head, fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 22 }}>Kom i gang på under et minut</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                {[
                  { label: 'Fuld adgang fra dag 1', desc: 'Alle øvelser, AI-coach og progression-tracking' },
                  { label: 'Ingen binding', desc: 'Afmeld til enhver tid — ingen forklaring krævet' },
                  { label: 'Founding member-pris', desc: '50 kr/md — låst fast så længe du er aktiv' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: T.accentD,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 4.5L3.5 6.5L7.5 2.5"/></svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontFamily: T.body, fontSize: 12, color: T.text2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/login" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: T.accent, color: '#fff',
                fontFamily: T.head, fontSize: 14, fontWeight: 700,
                padding: '15px 24px', borderRadius: 12,
                textDecoration: 'none', letterSpacing: -0.1,
                boxShadow: `0 6px 24px rgba(232,112,58,0.35)`,
                transition: `background 150ms, transform 150ms ${T.ease}`,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.accentB; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = ''; }}
              >
                Opret gratis konto
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 7.5h9M7.5 3l4.5 4.5L7.5 12"/></svg>
              </Link>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Link href="/login" style={{ fontFamily: T.body, fontSize: 12, color: T.text3, textDecoration: 'none' }}>
                  Har du allerede en konto? Log ind
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRICING ═══════════════════════════════════════════════ */}
        <section style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${sectionPy} ${px}` }}>
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
          </div>
        </section>

        {/* ══ FINAL CTA ═════════════════════════════════════════════ */}
        <section style={{ background: T.bg }}>
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
    </>
  );
}
