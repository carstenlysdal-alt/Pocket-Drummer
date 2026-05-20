'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  Download, 
  Volume2, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  SkipForward
} from 'lucide-react';
import { 
  getSavedExercises, 
  toggleExerciseCompleted, 
  getCompletedExercises,
  getUserPlan,
  saveUserPlan,
  Exercise 
} from '@/lib/mockData';
import { jsPDF } from 'jspdf';
import * as Tone from 'tone';

// Hent OsmdRenderer dynamisk uden SSR for at undgå 'window is not defined' fejl
const OsmdRenderer = dynamic(() => import('@/components/OsmdRenderer'), { ssr: false });

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExercisePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Player states
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [currentMeasure, setCurrentMeasure] = useState(1);
  
  // Tone.js MIDI states
  const [midiPlaying, setMidiPlaying] = useState(false);
  const [tempo, setTempo] = useState(100);
  const [activeBeat, setActiveBeat] = useState(0); // 0-3 for visual metronome
  const [metronomeSound, setMetronomeSound] = useState(true);

  // Refs
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const toneLoopRef = useRef<Tone.Loop | null>(null);
  const bassSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const snareSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const hihatSynthRef = useRef<Tone.MetalSynth | null>(null);

  useEffect(() => {
    const exercises = getSavedExercises();
    const found = exercises.find(e => e.id === id);
    setTimeout(() => {
      if (found) {
        setExercise(found);
        setTempo(found.tempo);
        const completedList = getCompletedExercises();
        setCompleted(completedList.includes(found.id));
      }
      setLoading(false);
    }, 0);
  }, [id]);

  // Ryd op i lyde, når komponenten fjernes
  useEffect(() => {
    return () => {
      stopMidiPlayback();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const syncMeasureWithTime = (time: number) => {
      if (!exercise) return;
      const secondsPerBeat = 60 / exercise.tempo;
      const secondsPerMeasure = 4 * secondsPerBeat; // 4/4 takt
      
      // Beregn taktnummer
      const calculatedMeasure = Math.floor((time % (exercise.takter * secondsPerMeasure)) / secondsPerMeasure) + 1;
      setCurrentMeasure(calculatedMeasure);
    };

    const handleYoutubeIframeState = () => {
      if (videoPlaying) {
        // Start polling af video tid (YouTube IFrame Player API postMessage)
        videoIntervalRef.current = setInterval(() => {
          // En simpel simulation af tid, hvis vi ikke har komplet API hook
          setVideoTime(prev => {
            const nextTime = prev + 0.1;
            syncMeasureWithTime(nextTime);
            return nextTime;
          });
        }, 100);
      } else {
        if (videoIntervalRef.current) {
          clearInterval(videoIntervalRef.current);
          videoIntervalRef.current = null;
        }
      }
    };

    handleYoutubeIframeState();
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [videoPlaying, exercise]);

  const handleToggleCompleted = () => {
    if (!exercise) return;
    const isCompleted = toggleExerciseCompleted(exercise.id);
    setCompleted(isCompleted);
  };

  const handleAdjustPlan = () => {
    const plan = getUserPlan();
    if (!plan) return;

    // AI-justering: Claude replanlægger
    // Vi shuffler eller fjerner vanskelige øvelser (fx ex-7 eller ex-8 hvis begynder, og erstatter med ex-1/ex-2)
    const adjustedExercises = plan.øvelser.map(pe => {
      // Hvis det er en øvet øvelse, erstat den med en nemmere rudiment
      if (pe.exercise_id === 'ex-7' || pe.exercise_id === 'ex-8') {
        return { ...pe, exercise_id: 'ex-1' }; // Erstat med Single Stroke Roll
      }
      return pe;
    });

    const updatedPlan = {
      ...plan,
      fokustema: "AI Justeret: Fokuseret stikteknik og groove (Niveau tilpasset)",
      milepæl: "Spil stabil rockgroove ved 95 BPM i 2 minutter",
      øvelser: adjustedExercises
    };

    saveUserPlan(updatedPlan);
    alert("Claude AI har justeret din læringsplan! Vi har erstattet de sværeste øvelser med mere fundamentale rudimenter og sænket temposkiven.");
    router.push('/dashboard');
  };

  // Tone.js MIDI syntetisering af trommelyde
  const initToneSynths = () => {
    if (bassSynthRef.current) return;

    // Bass drum synth
    bassSynthRef.current = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).toDestination();

    // Snare drum noise synth
    snareSynthRef.current = new Tone.NoiseSynth({
      volume: -6,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
    }).toDestination();

    // Hi-hat metal synth
    hihatSynthRef.current = new Tone.MetalSynth({
      volume: -12,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0 }
    }).toDestination();
  };

  const startMidiPlayback = async () => {
    await Tone.start();
    initToneSynths();
    stopMidiPlayback(); // Sikr ingen overskrivende loops

    // Opdater tempoet i Tone Transport
    Tone.getTransport().bpm.value = tempo;

    // Vi laver en 8.-dels trigger (8 slag pr. 4/4 takt)
    let step = 0;
    
    toneLoopRef.current = new Tone.Loop((time) => {
      const beatNum = Math.floor(step / 2); // 0-3 beats
      const isOffbeat = step % 2 !== 0;     // og-slag
      
      // Opdater visuel metronom på beatsene
      if (!isOffbeat) {
        Tone.Draw.schedule(() => {
          setActiveBeat(beatNum);
          // Hver takt har 4 beats, så opdater nodemarkøren
          if (beatNum === 0) {
            setCurrentMeasure(prev => {
              if (exercise && prev >= exercise.takter) return 1;
              return prev + 1;
            });
          }
        }, time);
      }

      if (metronomeSound) {
        // Spil trommelyde ud fra øvelseskategori
        if (exercise?.kategori === 'rudiments') {
          // Rudiment Single Stroke Roll (højre/venstre)
          // Spiller 16. dele, så vi trigger på alle trin
          snareSynthRef.current?.triggerAttack(time);
        } else if (exercise?.kategori === 'fills' && step >= 8) {
          // Anden takt i fills: spil tam-tam overgange
          // Vi simulerer snare på beat 1, tom 1 på beat 2, tom 2 på beat 3, floor tom på beat 4
          if (beatNum === 0) snareSynthRef.current?.triggerAttack(time);
          if (beatNum === 1) bassSynthRef.current?.triggerAttack(time, 150); // tom 1
          if (beatNum === 2) bassSynthRef.current?.triggerAttack(time, 100); // tom 2
          if (beatNum === 3) bassSynthRef.current?.triggerAttack(time, 70);  // floor tom
        } else {
          // Standard Rock/Groove mønster:
          // Hi-hat på alle 8. dele
          hihatSynthRef.current?.triggerAttack(time);
          
          // Stortromme på 1 og 3 (trin 0 og 4)
          if (step === 0 || step === 4 || step === 5) {
            bassSynthRef.current?.triggerAttack(time, "C1");
          }
          
          // Lilletromme på 2 og 4 (trin 2 og 6)
          if (step === 2 || step === 6) {
            snareSynthRef.current?.triggerAttack(time);
          }
        }
      }

      // Gå til næste step i en takt (0-7 for 8. dele)
      step = (step + 1) % 8;
    }, "8n");

    toneLoopRef.current.start(0);
    Tone.getTransport().start();
    setMidiPlaying(true);
  };

  function stopMidiPlayback() {
    if (toneLoopRef.current) {
      toneLoopRef.current.stop();
      toneLoopRef.current.dispose();
      toneLoopRef.current = null;
    }
    Tone.getTransport().stop();
    setMidiPlaying(false);
    setActiveBeat(0);
  }

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    if (midiPlaying) {
      Tone.getTransport().bpm.value = newTempo;
    }
  };

  const handleMidiToggle = () => {
    if (midiPlaying) {
      stopMidiPlayback();
    } else {
      startMidiPlayback();
    }
  };

  // PDF Eksport af nodearket
  const handlePdfExport = () => {
    if (!exercise) return;

    // Hent SVG noden
    const svgElement = document.querySelector('#osmd-svg-container svg') as SVGElement;
    if (!svgElement) {
      alert("Noderne er ikke færdigindlæst endnu. Prøv igen om et øjeblik.");
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Højopløselig konvertering
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        // A4 dimensioner er 210 x 297 mm
        const imgWidth = 190;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("DRUMLAB - INTERAKTIVE NODER", 15, 20);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text(`Øvelse: ${exercise.titel} (${exercise.sværhedsgrad})`, 15, 28);
        pdf.text(`Standard Tempo: ${exercise.tempo} BPM · Kategori: ${exercise.kategori}`, 15, 34);
        
        pdf.addImage(imgData, 'PNG', 10, 45, imgWidth, imgHeight);
        
        pdf.setFontSize(9);
        pdf.text("Genereret via DrumLab v1.2. Alle rettigheder forbeholdes.", 15, 280);
        
        pdf.save(`DrumLab_${exercise.titel.replace(/\s+/g, '_')}.pdf`);
      };
    } catch (e) {
      console.error("PDF Export error:", e);
      alert("Kunne ikke eksportere til PDF. Denne browser understøtter muligvis ikke funktionen.");
    }
  };

  if (loading) {
    return (
      <div className="grid-bg flex flex-column justify-between" style={{ minHeight: '100vh' }}>
        <Header />
        <div className="text-center p-3">Indlæser øvelse...</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="grid-bg flex flex-column justify-between" style={{ minHeight: '100vh' }}>
        <Header />
        <div className="text-center p-3">
          <AlertTriangle size={48} className="text-purple m-auto mb-2" />
          <h2>Øvelsen blev ikke fundet</h2>
          <Link href="/dashboard" className="btn btn-primary mt-2">Gå til Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      {/* Player Layout */}
      <div className="player-container">
        
        {/* Top bar with controls */}
        <div style={{ background: 'rgba(8, 9, 13, 0.9)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 2.0rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex align-center gap-2">
            <Link href="/dashboard" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <div>
              <h2 style={{ fontSize: '1.2rem' }}>{exercise.titel}</h2>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{exercise.kategori}</span>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginLeft: '0.25rem' }}>{exercise.sværhedsgrad}</span>
            </div>
          </div>
          
          <div className="flex align-center gap-2">
            <button 
              onClick={handleAdjustPlan} 
              className="btn btn-secondary btn-sm text-purple" 
              style={{ borderColor: 'var(--accent-purple)' }}
            >
              <Sparkles size={14} /> For svær? AI-justér plan
            </button>

            <button 
              onClick={handleToggleCompleted} 
              className={`btn btn-sm ${completed ? 'btn-secondary' : 'btn-primary'}`}
            >
              <CheckCircle size={14} /> 
              {completed ? 'Gennemført ✓' : 'Markér som gennemført'}
            </button>
          </div>
        </div>

        {/* Split Screen Video + Sheet Music */}
        <div className="player-main">
          
          {/* Left panel: YouTube player */}
          <div className="video-section">
            <div className="youtube-wrapper">
              <iframe 
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${exercise.youtube_video_id}?enablejsapi=1&rel=0&autoplay=0&showinfo=0`}
                title={exercise.titel}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Controls Sync Simulator */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <button 
                onClick={() => setVideoPlaying(!videoPlaying)} 
                className="btn btn-primary btn-sm"
              >
                {videoPlaying ? <Pause size={14} /> : <Play size={14} />} Video Sync {videoPlaying ? 'Aktiv' : 'Slå til'}
              </button>
              <span style={{ fontSize: '0.8rem', color: '#bbb' }}>
                Cursor synkroniseres automatisk med videoafspilleren
              </span>
            </div>
          </div>

          {/* Right panel: OSMD interactive sheet music */}
          <div className="notation-section">
            <div className="notation-header">
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>INTERAKTIVE NODER (OSMD)</span>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', minWidth: '30px' }}
                >
                  -
                </button>
                <span style={{ fontSize: '0.8rem', alignSelf: 'center', color: 'var(--text-secondary)' }}>
                  Zoom: {Math.round(zoom * 100)}%
                </span>
                <button 
                  onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', minWidth: '30px' }}
                >
                  +
                </button>

                <button 
                  onClick={handlePdfExport} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.3rem 0.6rem' }}
                >
                  <Download size={14} /> Hent PDF
                </button>
              </div>
            </div>

            {/* OSMD Sheet Music container */}
            <div className="notation-scrollable">
              {exercise.musicxml_data && (
                <OsmdRenderer 
                  xmlData={exercise.musicxml_data} 
                  zoom={zoom} 
                  currentMeasure={currentMeasure}
                />
              )}
            </div>

            {/* Metronome & MIDI Tone.js playback controls */}
            <div className="tempo-controls-panel">
              <div className="flex align-center gap-2">
                <button 
                  onClick={handleMidiToggle} 
                  className={`btn ${midiPlaying ? 'btn-danger' : 'btn-accent'} btn-sm`}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {midiPlaying ? <Pause size={14} /> : <Play size={14} />} Lyt til noder (MIDI)
                </button>

                {midiPlaying && (
                  <div className="metronome-visualizer">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`metronome-beat ${i === 0 ? 'downbeat' : ''} ${activeBeat === i ? 'active' : ''}`}
                      ></span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tempo Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '250px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '60px' }}>{tempo} BPM</span>
                <input 
                  type="range" 
                  min="50" 
                  max="180" 
                  value={tempo} 
                  onChange={(e) => handleTempoChange(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={() => setMetronomeSound(!metronomeSound)} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: metronomeSound ? 'var(--accent-purple)' : 'var(--text-muted)' }}
                  title="Slå metrononlyd til/fra"
                >
                  <Volume2 size={18} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
