'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  Target, 
  BookOpen, 
  CheckCircle, 
  Play, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw,
  FolderOpen,
  Home,
  Drum,
  User,
  Bell
} from 'lucide-react';
import { 
  getSavedExercises, 
  getUserGoal, 
  getUserPlan, 
  getCompletedExercises,
  saveUserPlan,
  Exercise, 
  UserGoal, 
  UserPlan,
  resetMockDatabase
} from '@/lib/mockData';

export default function DashboardPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  
  // Calendar states
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [activeWeek, setActiveWeek] = useState(1);
  
  // Filter states for library
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    // Indlæs data fra mock database
    setTimeout(() => {
      setExercises(getSavedExercises());
      setGoal(getUserGoal());
      setPlan(getUserPlan());
      setCompletedIds(getCompletedExercises());
    }, 0);
  }, []);

  const handleSkipExercise = (exerciseId: string, day: number) => {
    if (!plan) return;
    // Flyt øvelsen til næste dag (eller cyklisk fremad)
    const updatedExercises = plan.øvelser.map(pe => {
      if (pe.exercise_id === exerciseId && pe.dag === day && pe.uge === activeWeek) {
        return { ...pe, dag: (day % 7) + 1 }; // Flyt til næste dag
      }
      return pe;
    });

    const updatedPlan = { ...plan, øvelser: updatedExercises };
    setPlan(updatedPlan);
    saveUserPlan(updatedPlan);
  };

  // Beregn fremgangsprocent for planen
  const totalPlanExercises = plan ? plan.øvelser.length : 0;
  const completedPlanExercises = plan ? plan.øvelser.filter(pe => {
    return completedIds.includes(pe.exercise_id);
  }).length : 0;
  
  const progressPercent = totalPlanExercises > 0 
    ? Math.round((completedPlanExercises / totalPlanExercises) * 100) 
    : 0;

  // Filtrer øvelsesbiblioteket
  const filteredExercises = exercises.filter(ex => {
    const catMatch = categoryFilter === 'all' || ex.kategori === categoryFilter;
    const lvlMatch = levelFilter === 'all' || ex.sværhedsgrad === levelFilter;
    return catMatch && lvlMatch;
  });

  // Find dagens anbefalede øvelse (f.eks. den første ikke-gennemførte øvelse i planen for i dag, eller bare standard)
  const getTodaysExercise = (): Exercise | null => {
    if (!plan || plan.øvelser.length === 0) {
      return exercises[0] || null;
    }
    // Simple mock logic: Find en øvelse i planen for den aktive uge, der ikke er færdiggjort endnu
    const incompletePlanEx = plan.øvelser.find(pe => !completedIds.includes(pe.exercise_id));
    if (incompletePlanEx) {
      return exercises.find(e => e.id === incompletePlanEx.exercise_id) || exercises[0];
    }
    return exercises[0];
  };

  const todaysExercise = getTodaysExercise();

  // Danske ugedage navne
  const weekdayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: 'var(--bg-deep)' }} className="grid-bg">
        <div className="dashboard-grid">
          
          {/* Main Dashboard Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* AI Learning Plan Calendar */}
            <div className="glass-card">
              <div className="calendar-header">
                <div className="flex align-center gap-2">
                  <CalendarIcon className="text-purple" size={24} />
                  <div>
                    <h2 style={{ fontSize: '1.4rem' }}>Din AI-Læringsplan</h2>
                    {plan && <p style={{ fontSize: '0.85rem' }} className="text-muted-color">{plan.fokustema}</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {plan && calendarView === 'week' && (
                    <div className="flex align-center gap-1" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <button 
                        disabled={activeWeek === 1} 
                        onClick={() => setActiveWeek(activeWeek - 1)} 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.2rem 0.4rem', border: 'none', background: 'transparent' }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Uge {activeWeek}</span>
                      <button 
                        disabled={activeWeek === 4} 
                        onClick={() => setActiveWeek(activeWeek + 1)} 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.2rem 0.4rem', border: 'none', background: 'transparent' }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

                  <div className="calendar-toggle">
                    <button 
                      onClick={() => setCalendarView('week')} 
                      className={`calendar-toggle-btn ${calendarView === 'week' ? 'active' : ''}`}
                    >
                      Uge
                    </button>
                    <button 
                      onClick={() => setCalendarView('month')} 
                      className={`calendar-toggle-btn ${calendarView === 'month' ? 'active' : ''}`}
                    >
                      Måned
                    </button>
                  </div>
                </div>
              </div>

              {plan ? (
                <div>
                  {calendarView === 'week' ? (
                    /* Week View */
                    <div className="calendar-week-grid">
                      {weekdayNames.map((dayName, index) => {
                        const dayNum = index + 1;
                        // Find øvelser for denne specifikke dag
                        const planExsForDay = plan.øvelser.filter(pe => pe.dag === dayNum && pe.uge === activeWeek);
                        
                        return (
                          <div 
                            key={dayName} 
                            className={`calendar-day-card ${dayNum === 3 ? 'today' : ''}`}
                          >
                            <div className="calendar-day-name">
                              {dayName} {dayNum === 3 && <span style={{ fontSize: '0.7rem' }}> (I dag)</span>}
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              {planExsForDay.length > 0 ? (
                                planExsForDay.map(pe => {
                                  const ex = exercises.find(e => e.id === pe.exercise_id);
                                  if (!ex) return null;
                                  
                                  const isCompleted = completedIds.includes(ex.id);
                                  
                                  return (
                                    <div key={pe.exercise_id} style={{ margin: '0.25rem 0' }}>
                                      <Link href={`/exercise/${ex.id}`}>
                                        <div className="calendar-day-content" style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                          {ex.titel}
                                        </div>
                                      </Link>
                                      
                                      <div className="flex justify-between align-center mt-1">
                                        <span className={`badge ${isCompleted ? 'badge-emerald' : 'badge-purple'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                          {isCompleted ? 'Færdig' : `${ex.varighed} min`}
                                        </span>
                                        {!isCompleted && (
                                          <button 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleSkipExercise(ex.id, dayNum);
                                            }}
                                            className="btn btn-secondary btn-sm" 
                                            style={{ padding: '0.1rem 0.3rem', fontSize: '0.65rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                                            title="Flyt til næste dag"
                                          >
                                            Udsæt
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '0.5rem' }}>
                                  Hviledag
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Month View (grid layout of 28 days for 4 weeks) */
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                        {weekdayNames.map(d => (
                          <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{d.substring(0, 3)}</div>
                        ))}
                      </div>
                      <div className="calendar-month-grid">
                        {Array.from({ length: 28 }).map((_, idx) => {
                          const ugeNum = Math.floor(idx / 7) + 1;
                          const dagNum = (idx % 7) + 1;
                          const hasExercise = plan.øvelser.some(pe => pe.uge === ugeNum && pe.dag === dagNum);
                          const allDone = hasExercise && plan.øvelser
                            .filter(pe => pe.uge === ugeNum && pe.dag === dagNum)
                            .every(pe => completedIds.includes(pe.exercise_id));
                            
                          return (
                            <div 
                              key={idx} 
                              className="calendar-month-day"
                              style={{ 
                                background: hasExercise ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                                borderColor: (ugeNum === activeWeek && dagNum === 3) ? 'var(--accent-purple)' : 'var(--border-color)'
                              }}
                            >
                              <span className="calendar-month-number">{idx + 1}</span>
                              {hasExercise && (
                                <div 
                                  className="calendar-month-indicator"
                                  style={{ background: allDone ? 'var(--accent-emerald)' : 'var(--accent-purple)' }}
                                  title={allDone ? "Gennemført" : "Planlagt øvelse"}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* No Plan State */
                <div className="text-center p-3" style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dotted var(--border-color)', margin: '1rem 0' }}>
                  <Sparkles size={36} className="text-purple m-auto mb-2" />
                  <h3>Du har ikke oprettet en læringsplan endnu</h3>
                  <p className="mb-2" style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                    Svar på et par hurtige spørgsmål, og lad Claude AI designe en perfekt 4-ugers træningsplan til dig.
                  </p>
                  <Link href="/onboarding" className="btn btn-primary btn-sm">
                    Opret AI-Læringsplan
                  </Link>
                </div>
              )}
            </div>

            {/* Exercise Catalog (Library) */}
            <div className="glass-card" id="library">
              <div className="flex justify-between align-center mb-2">
                <div className="flex align-center gap-2">
                  <BookOpen className="text-cyan" size={24} />
                  <h2 style={{ fontSize: '1.4rem' }}>Øvelsesbibliotek</h2>
                </div>
                
                {/* Search filters */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    className="form-control" 
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">Alle kategorier</option>
                    <option value="rudiments">Rudiments</option>
                    <option value="groove">Groove</option>
                    <option value="fills">Fills</option>
                    <option value="timing">Timing</option>
                    <option value="koordination">Koordination</option>
                    <option value="stilarter">Stilarter</option>
                  </select>

                  <select 
                    className="form-control" 
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                  >
                    <option value="all">Alle niveauer</option>
                    <option value="begynder">Begynder</option>
                    <option value="mellemniveau">Mellemniveau</option>
                    <option value="øvet">Øvet</option>
                  </select>
                </div>
              </div>

              {/* Grid of exercises */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                {filteredExercises.map(ex => {
                  const isCompleted = completedIds.includes(ex.id);
                  
                  return (
                    <Link href={`/exercise/${ex.id}`} key={ex.id}>
                      <div className="glass-card" style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-card)' }}>
                        <div>
                          <div className="flex justify-between align-center mb-1">
                            <span className="calendar-day-name" style={{ fontSize: '0.7rem' }}>{ex.kategori}</span>
                            {isCompleted && <CheckCircle size={14} className="text-emerald" />}
                          </div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }} className="mb-1">{ex.titel}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mb-2">
                            {ex.beskrivelse.substring(0, 60)}...
                          </p>
                        </div>
                        <div className="flex justify-between align-center mt-2">
                          <span className={`badge ${ex.sværhedsgrad === 'begynder' ? 'badge-cyan' : ex.sværhedsgrad === 'mellemniveau' ? 'badge-purple' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                            {ex.sværhedsgrad}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }} className="text-purple flex align-center gap-1">
                            Øv nu <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Greeting Header from Mockup */}
            <div className="flex align-center justify-between" style={{ padding: '0.5rem 0 0 0' }}>
              <div className="flex align-center gap-2">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--accent-purple)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px var(--accent-purple-glow))' }}>
                  <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6" />
                </svg>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Hej, Anders</h2>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: '1px solid var(--border-color)', background: 'transparent' }}>
                <Bell size={18} className="text-muted-color" />
              </button>
            </div>

            {/* Daily Goal Card */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>DAGLIGT MÅL</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* SVG Donut Circle */}
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                  <svg width="80" height="80" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="3.5"
                    />
                    <path
                      strokeDasharray="75, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--accent-purple)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 4px var(--accent-purple-glow))' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.1rem', fontWeight: 700 }}>
                    75%
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>22 / 30 min</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>Fortsæt det gode arbejde!</p>
                  <Link href="/onboarding" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
                    SE DETALJER &gt;
                  </Link>
                </div>
              </div>
            </div>

            {/* Fortsæt Hvor Du Slap Card */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>FORTSÆT HVOR DU SLAP</h3>
              {todaysExercise ? (
                <Link href={`/exercise/${todaysExercise.id}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Play size={18} fill="white" stroke="white" style={{ marginLeft: '2px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{todaysExercise.titel}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.1rem 0' }}>Lektion {todaysExercise.id.replace('ex-', '')}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div className="progress-bar-container" style={{ margin: 0, height: '4px', flex: 1 }}>
                          <div className="progress-bar-fill" style={{ width: '60%', background: 'var(--accent-purple)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>60%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ingen aktive lektioner fundet.</p>
              )}
            </div>

            {/* Anbefalede Til Dig List */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>ANBEFALEDE TIL DIG</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {exercises.slice(1, 3).map((ex) => (
                  <Link href={`/exercise/${ex.id}`} key={ex.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }} className="hover-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: 'var(--accent-purple)' }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6" />
                          </svg>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{ex.titel}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{ex.kategori === 'rudiments' ? 'Forbedr din timing' : 'Udvid dit vokabular'}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-color" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Børnesikkerhed & Lovgivning */}
            <div className="glass-card" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }} className="text-muted-color">Børnesikkerhed & Lovgivning</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Overholder den danske lovgivning for børn og unge. Alle YouTube-afspillere kører under <b>youtube-nocookie.com</b> (Privacy-Enhanced Mode) og blokerer eksterne sporingscookies samt reklamer.
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Bottom Nav matching Mockup Screen 2 */}
      <div className="bottom-nav">
        <button onClick={() => router.push('/dashboard')} className="bottom-nav-item active">
          <Home size={20} />
          <span>Hjem</span>
        </button>
        <button onClick={() => {
          const el = document.getElementById('library');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} className="bottom-nav-item">
          <BookOpen size={20} />
          <span>Øvelser</span>
        </button>
        <button onClick={() => router.push('/drumkit')} className="bottom-nav-item">
          <Drum size={20} />
          <span>Trommesæt</span>
        </button>
        <button onClick={() => router.push('/onboarding')} className="bottom-nav-item">
          <User size={20} />
          <span>Profil</span>
        </button>
      </div>
    </div>
  );
}
