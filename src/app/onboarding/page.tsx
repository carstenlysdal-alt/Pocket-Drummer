'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { saveUserGoal, saveUserPlan } from '@/lib/mockData';

const GOAL_TAGS = [
  "Hi-hat kontrol",
  "Rudiments & Hvirvler",
  "Jazz Swing",
  "Funk Syncoper",
  "Koordination",
  "Fills og kombinationer",
];

// step: 0 = mål, 1 = niveau, 2 = øvetid
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyserer dine mål...");
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeTextGoal, setFreeTextGoal] = useState("");
  const [level, setLevel] = useState<'begynder' | 'mellemniveau' | 'øvet'>('begynder');
  const [practiceMinutes, setPracticeMinutes] = useState(20);
  const [timeframe, setTimeframe] = useState("3 måneder");

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => { if (step > 0) setStep(s => s - 1); };

  const handleSubmit = async () => {
    setErrorMsg('');
    setLoading(true);
    setLoadingMessage("Din personlige trommelærer analyserer dine mål...");

    const timers = [
      setTimeout(() => setLoadingMessage("Tilpasser øvelserne til dit niveau..."), 1500),
      setTimeout(() => setLoadingMessage("Sammensætter din 4-ugers plan..."), 3000),
      setTimeout(() => setLoadingMessage("Færdiggør milepæle og kalender..."), 4500),
    ];

    try {
      const compiledGoalDescription =
        freeTextGoal.trim() ||
        (selectedTags.length > 0 ? `Forbedre: ${selectedTags.join(', ')}` : "Generel tromme progression");

      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maal: compiledGoalDescription,
          niveau: level,
          tidPrDag: practiceMinutes,
          tidshorisont: timeframe,
        }),
      });

      if (!response.ok) throw new Error("Kunne ikke oprette læringsplan");

      const planData = await response.json();

      saveUserGoal({
        beskrivelse: compiledGoalDescription,
        tidshorisont: timeframe,
        aktiv: true,
        oprettet: new Date().toISOString(),
        delmål: selectedTags.length > 0
          ? selectedTags.slice(0, 3)
          : ["Følg daglige øvelser", "Styrk timing", "Øv med metronom"],
      });

      saveUserPlan({
        goal_id: 'active-goal',
        uge_start: new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long' }),
        fokustema: planData.fokustema || "Uge 1: Grundlæggende færdigheder",
        milepæl: planData.milepæl || "Kunne gennemføre ugens øvelser stabilt",
        øvelser: planData.øvelser || [],
      });

      timers.forEach(t => clearTimeout(t));
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      timers.forEach(t => clearTimeout(t));
      setLoading(false);
      setErrorMsg("Der skete en fejl under plan-genereringen. Tjek din internetforbindelse og prøv igen.");
    }
  };

  const goalsValid = selectedTags.length > 0 || freeTextGoal.trim().length > 0;

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
                margin: '2rem auto',
              }} />
              <h2 className="mb-2" style={{ fontSize: '1.8rem' }}>Skaber din læringsplan</h2>
              <p className="text-purple" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{loadingMessage}</p>
              <style jsx global>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div>
              {/* Progress dots — 3 trin */}
              <div
                role="progressbar"
                aria-valuenow={step + 1}
                aria-valuemin={1}
                aria-valuemax={3}
                aria-label={`Trin ${step + 1} af 3`}
                style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}
              >
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: i === step ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i <= step ? 'var(--accent-purple)' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.25s ease',
                  }} />
                ))}
              </div>

              {/* Trin 0: Mål */}
              {step === 0 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvad vil du gerne blive bedre til?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Vælg et eller flere fokusområder — eller skriv dit eget mål nedenfor.
                  </p>

                  <div className="tag-select mb-3" role="group" aria-label="Fokusområder">
                    {GOAL_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                        aria-pressed={selectedTags.includes(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="form-group mt-3">
                    <label className="form-label" htmlFor="free-text-goal">Eget mål (valgfrit)</label>
                    <input
                      id="free-text-goal"
                      type="text"
                      className="form-control"
                      placeholder="F.eks. lære at spille 'In The Air Tonight'..."
                      value={freeTextGoal}
                      onChange={(e) => setFreeTextGoal(e.target.value)}
                      aria-label="Skriv dit eget mål"
                    />
                  </div>

                  {!goalsValid && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Vælg mindst ét fokusområde, eller skriv dit eget mål.
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                      onClick={handleNext}
                      className="btn btn-primary"
                      disabled={!goalsValid}
                    >
                      Næste <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 1: Niveau */}
              {step === 1 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvad er dit nuværende niveau?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Det afgør sværhedsgraden af de øvelser din plan indeholder.
                  </p>

                  <div role="radiogroup" aria-label="Vælg dit niveau" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
                    <label
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderColor: level === 'begynder' ? 'var(--accent-cyan)' : 'var(--border-color)', padding: '1.25rem' }}
                    >
                      <input type="radio" name="level" value="begynder" checked={level === 'begynder'} onChange={() => setLevel('begynder')} className="sr-only" />
                      <div>
                        <h4 className="text-cyan">Begynder</h4>
                        <p style={{ fontSize: '0.85rem' }}>0–2 år. Grundlæggende rytmer og stikteknik er i fokus.</p>
                      </div>
                    </label>

                    <label
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderColor: level === 'mellemniveau' ? 'var(--accent-purple)' : 'var(--border-color)', padding: '1.25rem' }}
                    >
                      <input type="radio" name="level" value="mellemniveau" checked={level === 'mellemniveau'} onChange={() => setLevel('mellemniveau')} className="sr-only" />
                      <div>
                        <h4 className="text-purple">Mellemniveau</h4>
                        <p style={{ fontSize: '0.85rem' }}>2–5 år. Spiller måske i band — vil udfordres på dynamik og fills.</p>
                      </div>
                    </label>

                    <label
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderColor: level === 'øvet' ? 'var(--accent-emerald)' : 'var(--border-color)', padding: '1.25rem' }}
                    >
                      <input type="radio" name="level" value="øvet" checked={level === 'øvet'} onChange={() => setLevel('øvet')} className="sr-only" />
                      <div>
                        <h4 className="text-emerald">Øvet</h4>
                        <p style={{ fontSize: '0.85rem' }}>5+ år. Kender rudiments — vil mestre uafhængighed og stilarter.</p>
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

              {/* Trin 2: Øvetid */}
              {step === 2 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvor meget kan du øve dig?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Din daglige rutine tilpasses din hverdag — ikke omvendt.
                  </p>

                  <div className="form-group mb-3">
                    <label className="form-label flex justify-between">
                      <span>Daglig øvetid</span>
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

                  {errorMsg && (
                    <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', fontSize: '0.875rem', color: '#f87171' }}>
                      {errorMsg}
                      <button
                        onClick={() => { setErrorMsg(''); handleSubmit(); }}
                        style={{ marginLeft: '0.75rem', background: 'none', border: 'none', color: '#f87171', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Prøv igen
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <button onClick={handleBack} className="btn btn-secondary">
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button onClick={handleSubmit} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' }}>
                      Skab min læringsplan <Sparkles size={16} />
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
