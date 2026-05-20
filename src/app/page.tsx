'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { 
  Sparkles, 
  Play, 
  Music, 
  Calendar, 
  CreditCard, 
  Smartphone, 
  Check, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { setPremiumStatus, resetMockDatabase } from '@/lib/mockData';

export default function LandingPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobilepay'>('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCheckoutStart = () => {
    setShowCheckout(true);
    setPaymentStep('method');
  };

  const handlePay = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPremiumStatus(true);
      setPaymentStep('success');
      setPaymentSuccess(true);
    }, 2000);
  };

  const handleReset = () => {
    resetMockDatabase();
    setPaymentSuccess(false);
    window.location.reload();
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Section */}
      <section className="text-center p-3" style={{ maxWidth: '900px', margin: '4rem auto 2rem auto' }}>
        <span className="badge badge-purple mb-2" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          <Sparkles size={14} style={{ marginRight: '0.25rem' }} /> Nyt i version 1.2: Claude AI-Nodegenerering
        </span>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: '1.1' }} className="logo-brand">
          DRUMM<span style={{ color: 'var(--accent-purple)' }}>.</span>
        </h1>
        <div className="text-serif-italic mb-3" style={{ fontSize: '1.8rem', color: 'var(--accent-purple)', letterSpacing: '0.05em' }}>
          Spil. Øv. Udvikl dig.
        </div>
        <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: '700px', margin: '0 auto 2.5rem auto' }}>
          DRUMM. kombinerer videoer fra professionelle undervisere med interaktive noder og AI-genererede planer, der tilpasser sig dit tempo og dine personlige mål.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/onboarding" className="btn btn-primary">
            Start din læringsplan <Play size={16} />
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            Gå til Dashboard
          </Link>
          <Link href="/prototype" className="btn btn-secondary" style={{ borderColor: '#ef5a3a', color: '#ef5a3a' }}>
            Se Mobil-Prototype 📱
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        <h2 className="text-center mb-3" style={{ fontSize: '2.25rem' }}>Hvorfor vælge DRUMM<span style={{ color: 'var(--accent-purple)' }}>.</span>?</h2>
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass-card glass-card-purple">
            <Calendar size={32} className="text-purple mb-2" />
            <h3 className="mb-1">AI-Læringsplaner</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Claude 3.5 Haiku analyserer din øvetid, dit niveau og dine delmål og stykker en skræddersyet ugekalender sammen til dig.
            </p>
          </div>

          <div className="glass-card glass-card-cyan">
            <Music size={32} className="text-cyan mb-2" />
            <h3 className="mb-1">Interaktive Trommenoder</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Noder renderes som sprød SVG direkte i din browser via OSMD + VexFlow. Tone.js driver en præcis MIDI-metronom til lyd-lytning.
            </p>
          </div>

          <div className="glass-card glass-card-emerald">
            <Sparkles size={32} className="text-emerald mb-2" />
            <h3 className="mb-1">Instant AI-Generering</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Har du brug for en specifik øvelse? Claude Sonnet 4.6 genererer trommenoder som gyldig MusicXML baseret på dine parametre på under 15 sekunder.
            </p>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 className="text-center mb-1" style={{ fontSize: '2.25rem' }}>Enkel prissætning, fuld frihed</h2>
          <p className="text-center text-muted-color mb-3">Ingen bindinger, start gratis med det samme</p>
          
          <div className="pricing-grid">
            
            {/* Free Tier */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-cyan mb-2">GRATIS</span>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>0 kr. <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ md.</span></h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Perfekt til at prøve platformen af</p>
                <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', marginBottom: '1.5rem' }} />
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-cyan" /> 10–15 udvalgte begynderøvelser</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-cyan" /> Indlejrede YouTube-videoer</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-cyan" /> Statisk nodevisning</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>❌ Ingen AI-læringsplan</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>❌ Ingen Tone.js metronom / afspilning</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>❌ Ingen PDF-download</li>
                </ul>
              </div>
              <Link href="/dashboard" className="btn btn-secondary mt-3" style={{ width: '100%' }}>
                Prøv Gratis
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="glass-card pulse-border" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderColor: 'var(--accent-purple)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-purple">PREMIUM</span>
                  <span className="badge badge-purple" style={{ background: 'var(--accent-purple)', color: 'white' }}>Mest Populær</span>
                </div>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>50 kr. <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ md.</span></h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Få det maksimale ud af din øvning</p>
                <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', marginBottom: '1.5rem' }} />
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-purple" /> 2.000+ øvelser i biblioteket</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-purple" /> <b>Personlig AI-læringsplan (Claude)</b></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-purple" /> Interaktive noder med cursor synk</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-purple" /> Tone.js MIDI-afspilning & tempo-skift</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-purple" /> PDF-download af alle noder</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} className="text-purple" /> Ubegrænset AI-nodegenerering</li>
                </ul>
              </div>
              <button onClick={handleCheckoutStart} className="btn btn-primary mt-3" style={{ width: '100%' }}>
                Køb Premium
              </button>
            </div>

          </div>

          <div className="text-center mt-3">
            <button className="btn btn-secondary btn-sm text-muted-color" onClick={handleReset}>
              Nulstil Lokal Database / Premium status
            </button>
          </div>
        </div>
      </section>

      {/* Checkout Modal Dialog */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-2 text-center" style={{ fontSize: '1.8rem' }}>Abonner på DRUMM<span style={{ color: 'var(--accent-purple)' }}>.</span> Premium</h2>
            <p className="text-center text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
              Du modtager en 4-ugers prøveperiode for derefter 50 kr./md.
            </p>

            {paymentStep === 'method' && (
              <div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  <button 
                    onClick={() => setPaymentMethod('card')} 
                    className={`btn w-full ${paymentMethod === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    <CreditCard size={18} /> Kreditkort
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('mobilepay')} 
                    className={`btn w-full ${paymentMethod === 'mobilepay' ? 'btn-accent' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    <Smartphone size={18} /> MobilePay
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                      <label className="form-label">Kortnummer</label>
                      <input type="text" className="form-control" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Udløb</label>
                        <input type="text" className="form-control" placeholder="MM/ÅÅ" defaultValue="12/28" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">CVC</label>
                        <input type="text" className="form-control" placeholder="123" defaultValue="123" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center mb-3 p-2" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.95rem' }} className="mb-2">Indtast dit telefonnummer til MobilePay:</p>
                    <input type="text" className="form-control text-center m-auto" style={{ maxWidth: '250px', fontSize: '1.2rem', fontWeight: 600 }} placeholder="+45 12 34 56 78" defaultValue="+45 12 34 56 78" />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={() => setShowCheckout(false)} className="btn btn-secondary w-full" style={{ flex: 1 }}>
                    Annuller
                  </button>
                  <button onClick={handlePay} className="btn btn-primary w-full" style={{ flex: 1 }}>
                    Godkend betaling
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center p-3">
                <div style={{
                  border: '4px solid rgba(255, 255, 255, 0.1)',
                  borderTop: '4px solid var(--accent-purple)',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  animation: 'spin 1s linear infinite',
                  margin: '2rem auto'
                }}></div>
                <h3 className="mb-1">Behandler transaktion...</h3>
                <p className="text-muted-color">Opretter sikkert abonnementsaftale via Stripe</p>
                <style jsx global>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center p-2">
                <ShieldCheck size={64} className="text-emerald m-auto mb-2" style={{ filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.3))' }} />
                <h3 className="mb-1" style={{ fontSize: '1.6rem' }}>Betaling Gennemført!</h3>
                <p style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>
                  Velkommen til DRUMM. Premium! Din profil er nu opgraderet, og du har fuld adgang til alle funktioner.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link href="/onboarding" className="btn btn-primary w-full" onClick={() => setShowCheckout(false)}>
                    Generer AI-Læringsplan
                  </Link>
                  <button onClick={() => setShowCheckout(false)} className="btn btn-secondary">
                    Luk
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem' }} className="text-muted-color">
          DRUMM. · v1.2 · Skolevenlig og understøtter YouTube Privacy-Enhanced Mode (youtube-nocookie.com)
        </p>
      </footer>
    </div>
  );
}
