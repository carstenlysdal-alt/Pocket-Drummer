'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { saveUserGoal, saveUserPlan, setPremiumStatus } from '@/lib/mockData';

const GOAL_TAGS = [
  "Hi-hat kontrol", "Stortromme styrke", "Fills og fills-kombinationer",
  "Rudiments & Hvirvler", "Jazz Swing", "Funk Syncoper",
  "Metronom Timing", "Stikuafhængighed", "Koordination", "Tempo/Hastighed"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyserer dine mål...");

  // Formular state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeTextGoal, setFreeTextGoal] = useState("");
  const [level, setLevel] = useState<'begynder' | 'mellemniveau' | 'øvet'>('begynder');
  const [practiceMinutes, setPracticeMinutes] = useState(20);
  const [timeframe, setTimeframe] = useState("3 måneder");

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingMessage("Kontakter Claude AI...");

    // Simulér trin i genereringen for en fed brugeroplevelse
    const timers = [
      setTimeout(() => setLoadingMessage("Analyserer din valgte sværhedsgrad..."), 1500),
      setTimeout(() => setLoadingMessage("Sammensætter 4-ugers øvelsesrækkefølge..."), 3000),
      setTimeout(() => setLoadingMessage("Færdiggør kalender & milepæle..."), 4500)
    ];

    try {
      const compiledGoalDescription = freeTextGoal.trim() || (selectedTags.length > 0 ? `Forbedre: ${selectedTags.join(', ')}` : "Generel tromme progression");
      
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maal: compiledGoalDescription,
          niveau: level,
          tidPrDag: practiceMinutes,
          tidshorisont: timeframe
        })
      });

      if (!response.ok) {
        throw new Error("Kunne ikke oprette læringsplan");
      }

      const planData = await response.json();
      
      // Gem til mock database
      saveUserGoal({
        beskrivelse: compiledGoalDescription,
        tidshorisont: timeframe,
        aktiv: true,
        oprettet: new Date().toISOString(),
        delmål: selectedTags.length > 0 ? selectedTags.slice(0, 3) : ["Følg daglige øvelser", "Styrk timing", "Øv med metronom"]
      });

      // Konverter og gem AI-genereret plan
      saveUserPlan({
        goal_id: 'active-goal',
        uge_start: new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long' }),
        fokustema: planData.fokustema || "Uge 1: Grundlæggende færdigheder",
        milepæl: planData.milepæl || "Kunne gennemføre ugens øvelser stabilt",
        øvelser: planData.øvelser || []
      });

      // Sæt premium status til sandt så de kan se hele appen i demoen
      setPremiumStatus(true);

      // Ryd timere og omdiriger
      timers.forEach(t => clearTimeout(t));
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Der skete en fejl under plan-genereringen. Prøv venligst igen.");
    }
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem' }}>
          
          {loading ? (
            <div className="text-center p-3">
              <div style={{
                border: '4px solid rgba(255, 255, 255, 0.1)',
                borderTop: '4px solid var(--accent-purple)',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                animation: 'spin 1.2s linear infinite',
                margin: '2rem auto'
              }}></div>
              <h2 className="mb-2" style={{ fontSize: '1.8rem' }}>Skaber din læringsplan</h2>
              <p className="text-purple" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{loadingMessage}</p>
              <p className="text-muted-color mt-3" style={{ fontSize: '0.85rem' }}>
                Claude 3.5 Haiku tilpasser øvelserne til dit niveau...
              </p>
              <style jsx global>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div>
              {/* Progress dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: (step === 0 || step === 1) ? 'var(--accent-purple)' : 'rgba(255,255,255,0.2)' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: step === 2 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.2)' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: step === 3 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.2)' }}></span>
              </div>

              {/* Step 0: Splash Screen */}
              {step === 0 && (
                <div className="text-center">
                  <div className="logo-brand" style={{ fontSize: '3.5rem', marginBottom: '0.1rem' }}>
                    DRUMM<span style={{ color: 'var(--accent-purple)' }}>.</span>
                  </div>
                  <div className="text-serif-italic mb-3" style={{ fontSize: '1.25rem', color: 'var(--accent-purple)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Spil. Øv. Udvikl dig.
                  </div>
                  
                  <div className="snare-art-container" style={{ margin: '1.5rem auto' }}>
                    <svg viewBox="0 0 100 100" width="160" height="160" stroke="var(--accent-purple)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px rgba(242,92,61,0.15))' }}>
                      {/* Crossed Drum Sticks */}
                      <line x1="20" y1="35" x2="80" y2="65" strokeWidth="2.5" />
                      <line x1="80" y1="35" x2="20" y2="65" strokeWidth="2.5" />
                      
                      <circle cx="80" cy="65" r="2" fill="var(--accent-purple)" />
                      <circle cx="20" cy="65" r="2" fill="var(--accent-purple)" />
                      
                      {/* Snare Drum body */}
                      <ellipse cx="50" cy="53" rx="30" ry="11" fill="var(--bg-deep)" strokeWidth="2" />
                      <ellipse cx="50" cy="63" rx="30" ry="11" fill="none" strokeWidth="2" />
                      
                      {/* Vertical bars/ribs */}
                      <line x1="20" y1="53" x2="20" y2="63" />
                      <line x1="30" y1="59" x2="30" y2="69" />
                      <line x1="40" y1="62" x2="40" y2="72" />
                      <line x1="50" y1="64" x2="50" y2="74" />
                      <line x1="60" y1="62" x2="60" y2="72" />
                      <line x1="70" y1="59" x2="70" y2="69" />
                      <line x1="80" y1="53" x2="80" y2="63" />
                      
                      {/* Orbit wave ring */}
                      <circle cx="50" cy="56" r="38" stroke="var(--accent-purple)" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                    </svg>
                  </div>

                  <h3 className="mb-2 font-title" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    DIN REJSE BEGYNDER HER
                  </h3>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                    Uanset dit niveau, hjælper vi dig med at blive en bedre trommeslager.
                  </p>

                  <button 
                    onClick={() => setStep(1)} 
                    className="btn btn-primary w-full mb-3"
                    style={{ padding: '0.8rem 1.5rem', fontSize: '1.05rem', fontWeight: 600 }}
                  >
                    KOM I GANG
                  </button>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="btn-link"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
                    >
                      HAR DU ALLEREDE EN KONTO? LOG IND
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Goals */}
              {step === 1 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvad vil du gerne blive bedre til?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Vælg et eller flere fokusområder eller skriv dit eget mål.
                  </p>
                  
                  <div className="tag-select mb-3">
                    {GOAL_TAGS.map((tag) => (
                      <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="form-group mt-3">
                    <label className="form-label">Eget mål (valgfrit)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="F.eks. Lære at spille sangen 'In The Air Tonight'..."
                      value={freeTextGoal}
                      onChange={(e) => setFreeTextGoal(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button onClick={handleBack} className="btn btn-secondary">
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button 
                      onClick={handleNext} 
                      className="btn btn-primary"
                      disabled={selectedTags.length === 0 && !freeTextGoal.trim()}
                    >
                      Næste <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Level */}
              {step === 2 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvad er dit nuværende niveau?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Dette afgør sværhedsgraden af de øvelser Claude vælger.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
                    <label 
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderLeft: level === 'begynder' ? '4px solid var(--accent-cyan)' : '1px solid var(--border-color)', padding: '1.25rem' }}
                      onClick={() => setLevel('begynder')}
                    >
                      <input type="radio" checked={level === 'begynder'} onChange={() => {}} style={{ display: 'none' }} />
                      <div>
                        <h4 className="text-cyan">Begynder</h4>
                        <p style={{ fontSize: '0.85rem' }}>Jeg har spillet 0-2 år, øver grundlæggende rytmer og skal opbygge stikteknik.</p>
                      </div>
                    </label>

                    <label 
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderLeft: level === 'mellemniveau' ? '4px solid var(--accent-purple)' : '1px solid var(--border-color)', padding: '1.25rem' }}
                      onClick={() => setLevel('mellemniveau')}
                    >
                      <input type="radio" checked={level === 'mellemniveau'} onChange={() => {}} style={{ display: 'none' }} />
                      <div>
                        <h4 className="text-purple">Mellemniveau</h4>
                        <p style={{ fontSize: '0.85rem' }}>Jeg har spillet 2-5 år, spiller måske i band og vil udfordres på dynamik og fills.</p>
                      </div>
                    </label>

                    <label 
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderLeft: level === 'øvet' ? '4px solid var(--accent-emerald)' : '1px solid var(--border-color)', padding: '1.25rem' }}
                      onClick={() => setLevel('øvet')}
                    >
                      <input type="radio" checked={level === 'øvet'} onChange={() => {}} style={{ display: 'none' }} />
                      <div>
                        <h4 className="text-emerald">Øvet</h4>
                        <p style={{ fontSize: '0.85rem' }}>Jeg har spillet 5+ år, kan mine rudiments og vil mestre uafhængighed og stilarter.</p>
                      </div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button onClick={handleBack} className="btn btn-secondary">
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button onClick={handleNext} className="btn btn-primary">
                      Næste <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Practicing Time & Horizon */}
              {step === 3 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvor meget kan du øve dig?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Vi planlægger din daglige rutine, så den passer ind i din hverdag.
                  </p>

                  <div className="form-group mb-3">
                    <label className="form-label flex justify-between">
                      <span>Daglige øvetid</span>
                      <span className="text-purple" style={{ fontWeight: 700 }}>{practiceMinutes} minutter</span>
                    </label>
                    <input 
                      type="range" 
                      min="5" 
                      max="60" 
                      step="5"
                      className="w-full" 
                      value={practiceMinutes}
                      onChange={(e) => setPracticeMinutes(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-muted-color" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      <span>5 min</span>
                      <span>30 min</span>
                      <span>60 min</span>
                    </div>
                  </div>

                  <div className="form-group mt-3">
                    <label className="form-label">Tidshorisont</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      {["1 måned", "3 måneder", "6 måneder", "1 år"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`btn ${timeframe === time ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => setTimeframe(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center p-2 mb-3 mt-3" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.8rem' }} className="text-emerald">
                      <Shield size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Du er beskyttet af YouTube Privacy-Enhanced mode i alle videoafspillere.
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button onClick={handleBack} className="btn btn-secondary">
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button onClick={handleSubmit} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' }}>
                      Skab AI-Læringsplan <Sparkles size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
