'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';

type Mode = 'login' | 'signup' | 'reset';

const BG = '#FBFAF6';
const INK = '#2B2723';
const ACCENT = '#EE6C48';
const MUTED = '#A79E93'; // matcher tokens(false).textMuted i prototype/page.tsx
const HAIRLINE = '#E1DACB';
const MONO = "'IBM Plex Mono', monospace";
const HEAD = "'Bricolage Grotesque', system-ui, sans-serif";
const BODY = "'Hanken Grotesk', system-ui, sans-serif";

function useIsMobile(bp = 860) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth < bp);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [bp]);
  return m;
}

function Field({ id, label, ...props }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} style={{
        display: 'block', fontFamily: MONO, fontSize: 10.5, fontWeight: 600,
        letterSpacing: 1, textTransform: 'uppercase', color: MUTED, marginBottom: 8,
      }}>{label}</label>
      <input
        id={id}
        {...props}
        style={{
          width: '100%', border: 'none', borderBottom: `1px solid ${HAIRLINE}`,
          background: 'transparent', color: INK, fontFamily: BODY, fontSize: 15,
          padding: '2px 0 10px', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, signUpWithEmail, signInWithEmail, resetPassword } = useAuth();
  const mobile = useIsMobile();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) { setErrorMsg('Skriv dit navn.'); setLoading(false); return; }
        await signUpWithEmail(email, password, displayName.trim());
        router.push('/dashboard');
      } else if (mode === 'login') {
        await signInWithEmail(email, password);
        router.push('/dashboard');
      } else {
        await resetPassword(email);
        setSuccessMsg('Vi har sendt et link til at nulstille dit kodeord.');
        setMode('login');
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') setErrorMsg('Denne email er allerede registreret. Log ind i stedet.');
      else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setErrorMsg('Forkert kodeord. Prøv igen eller nulstil det.');
      else if (code === 'auth/user-not-found') setErrorMsg('Vi kan ikke finde en konto med den email.');
      else if (code === 'auth/weak-password') setErrorMsg('Kodeordet skal være mindst 6 tegn.');
      else if (code === 'auth/invalid-email') setErrorMsg('Ugyldig email-adresse.');
      else if (code === 'auth/operation-not-allowed') setErrorMsg('Email/kodeord-login er ikke aktiveret. Aktiver det i Firebase Console → Authentication → Sign-in methods.');
      else if (code === 'auth/too-many-requests') setErrorMsg('For mange forsøg. Vent lidt og prøv igen.');
      else if (code === 'auth/network-request-failed') setErrorMsg('Netværksfejl. Tjek din forbindelse og prøv igen.');
      else setErrorMsg(`Der opstod en fejl (${code ?? 'ukendt'}). Prøv igen.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login();
      router.push('/dashboard');
    } catch {
      setErrorMsg('Google-login fejlede. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: BG }}>
      <Header />

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
        minHeight: 0,
      }}>
        {/* Venstre — brand */}
        {!mobile && (
          <div style={{
            background: INK, color: BG, padding: '56px 48px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div />
            <div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 26, lineHeight: 1.15, letterSpacing: -0.5 }}>
                Din trommelærer.<br />I din lomme.
              </div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, color: '#8A837A' }}>
              FOUNDING MEMBER · 50 KR/MD
            </div>
          </div>
        )}

        {/* Højre — formular */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: mobile ? '32px 22px' : '56px 48px' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 26, letterSpacing: -0.5, color: INK, marginBottom: 6 }}>
                {mode === 'signup' ? 'Opret konto' : mode === 'reset' ? 'Nulstil kodeord' : 'Log ind'}
              </div>
              <p style={{ fontFamily: BODY, fontSize: 13.5, color: MUTED, margin: 0 }}>
                {mode === 'signup'
                  ? 'Lav en konto og start din rejse som trommeslager.'
                  : mode === 'reset'
                  ? 'Vi sender dig et link til at vælge et nyt kodeord.'
                  : 'Velkommen tilbage.'}
              </p>
            </div>

            {successMsg && (
              <div style={{ marginBottom: 18, fontFamily: BODY, fontSize: 13, color: '#3FAE86' }}>
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div style={{ marginBottom: 18, fontFamily: BODY, fontSize: 13, color: '#C9503A' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {mode === 'signup' && (
                <Field id="displayName" label="Dit navn" type="text" placeholder="Hvad skal vi kalde dig?"
                  value={displayName} onChange={e => setDisplayName(e.target.value)} required autoComplete="name" />
              )}
              <Field id="email" label="Email" type="email" placeholder="din@email.dk"
                value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete={mode === 'signup' ? 'email' : 'username'} />
              {mode !== 'reset' && (
                <Field id="password" label="Kodeord" type="password" placeholder={mode === 'signup' ? 'Mindst 6 tegn' : '••••••••'}
                  value={password} onChange={e => setPassword(e.target.value)} required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: 16, border: 'none', borderRadius: 0,
                background: INK, color: BG, fontFamily: BODY, fontSize: 15, fontWeight: 700,
                cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1,
                marginTop: 4,
              }}>
                {loading
                  ? 'Arbejder…'
                  : mode === 'signup'
                  ? 'Opret konto'
                  : mode === 'reset'
                  ? 'Send nulstillingslink'
                  : 'Log ind'}
              </button>
            </form>

            {mode !== 'reset' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0' }}>
                  <div style={{ flex: 1, height: 1, background: HAIRLINE }} />
                  <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 1, color: MUTED }}>ELLER</span>
                  <div style={{ flex: 1, height: 1, background: HAIRLINE }} />
                </div>

                <button onClick={handleGoogle} disabled={loading} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: 15, border: `1px solid ${HAIRLINE}`, borderRadius: 0, background: 'transparent',
                  fontFamily: BODY, fontSize: 14.5, fontWeight: 600, color: INK,
                  cursor: loading ? 'default' : 'pointer',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Fortsæt med Google
                </button>
              </>
            )}

            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              {mode === 'login' && (
                <>
                  <button onClick={() => { setMode('signup'); setErrorMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY, fontSize: 13, color: ACCENT }}>
                    Har du ikke en konto? Opret dig
                  </button>
                  <button onClick={() => { setMode('reset'); setErrorMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY, fontSize: 12.5, color: MUTED }}>
                    Glemt kodeord?
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button onClick={() => { setMode('login'); setErrorMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY, fontSize: 13, color: ACCENT }}>
                  Har du allerede en konto? Log ind
                </button>
              )}
              {mode === 'reset' && (
                <button onClick={() => { setMode('login'); setErrorMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY, fontSize: 13, color: ACCENT }}>
                  Tilbage til login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
