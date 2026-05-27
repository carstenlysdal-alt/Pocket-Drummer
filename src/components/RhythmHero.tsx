'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/languageContext';
import { Play, RotateCcw, X, Volume2, Award, Zap } from 'lucide-react';

interface RhythmHeroProps {
  onClose: () => void;
  onAwardXP: (xp: number) => void;
  tTokens: any;
}

interface Note {
  id: number;
  time: number; // in milliseconds
  track: 0 | 1 | 2; // 0: Hi-hat (H), 1: Snare (S), 2: Kick (K)
  hit?: boolean;
  score?: 'perfect' | 'good' | 'miss';
}

const TRACKS = [
  { name: 'Hi-hat', key: 'H', color: '#38bdf8' }, // sky blue
  { name: 'Snare', key: 'S', color: '#fb923c' },  // orange
  { name: 'Kick', key: 'K', color: '#f43f5e' }    // rose red
];

export default function RhythmHero({ onClose, onAwardXP, tTokens }: RhythmHeroProps) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [totalNotesCount, setTotalNotesCount] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; color: string; id: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notesRef = useRef<Note[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const bpm = 90;
  const speed = 0.28; // pixels per millisecond
  const noteRadius = 18;
  const hitLineX = 120; // x coordinate of the target line

  // Synthesize drum hits using Web Audio API
  const playSynthSound = (frequency: number, type: 'sine' | 'triangle' | 'noise', duration: number) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'noise') {
        // Noise buffer for snare/hi-hat
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = frequency;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        if (frequency === 60) { // Kick slide down
          osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + duration);
        }
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch (e) {
      // Ignore context errors
    }
  };

  const playDrumSound = (track: number) => {
    if (track === 0) playSynthSound(8000, 'noise', 0.05); // Hihat
    if (track === 1) playSynthSound(1000, 'noise', 0.12); // Snare
    if (track === 2) playSynthSound(60, 'sine', 0.18);    // Kick
  };

  const generateSongNotes = () => {
    const list: Note[] = [];
    const beatMs = (60 / bpm) * 1000;
    let id = 1;
    
    // Generate a structured 16-bar rock groove pattern
    for (let bar = 0; bar < 8; bar++) {
      const barStart = 1500 + bar * beatMs * 4; // Start after 1.5 seconds intro
      
      for (let step = 0; step < 16; step++) {
        const time = barStart + step * (beatMs / 4);
        
        // Always Hi-hat on 8th notes (steps 0, 2, 4, 6, 8, 10, 12, 14)
        if (step % 2 === 0) {
          list.push({ id: id++, time, track: 0 });
        }
        
        // Snare on 2 and 4 (steps 4 and 12)
        if (step === 4 || step === 12) {
          list.push({ id: id++, time, track: 1 });
        }
        
        // Kick on 1 and 3 (step 0 and 8), plus syncopations
        if (step === 0 || step === 8 || (bar % 2 === 1 && step === 10)) {
          list.push({ id: id++, time, track: 2 });
        }
      }
    }
    
    setTotalNotesCount(list.length);
    notesRef.current = list;
  };

  const startGame = () => {
    generateSongNotes();
    setIsPlaying(true);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setGameOver(false);
    setFeedback(null);
    startTimeRef.current = performance.now();
  };

  const triggerFeedback = (text: string, color: string) => {
    setFeedback({ text, color, id: Date.now() });
  };

  const handleHit = (trackIndex: 0 | 1 | 2) => {
    if (!isPlaying || gameOver) return;
    
    playDrumSound(trackIndex);
    
    const now = performance.now() - startTimeRef.current;
    
    // Find the closest unhit note in this track
    const tolerance = 180; // max window in ms
    let closestNote: Note | null = null;
    let minDiff = Infinity;
    
    for (const note of notesRef.current) {
      if (note.track === trackIndex && !note.hit) {
        const diff = Math.abs(note.time - now);
        if (diff < tolerance && diff < minDiff) {
          minDiff = diff;
          closestNote = note;
        }
      }
    }
    
    if (closestNote) {
      closestNote.hit = true;
      setHits(h => h + 1);
      
      let rating: 'perfect' | 'good' = 'good';
      let addedScore = 50;
      let fText = t('good');
      let fColor = '#f59e0b'; // amber
      
      if (minDiff < 60) {
        rating = 'perfect';
        addedScore = 100;
        fText = t('perfect');
        fColor = '#10b981'; // emerald
      }
      
      closestNote.score = rating;
      setScore(s => s + addedScore + combo * 5);
      setCombo(c => {
        const next = c + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      triggerFeedback(fText, fColor);
    } else {
      // Small penalty or no feedback for stray keypresses
    }
  };

  // Listen to keyboard hits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'H') handleHit(0);
      if (key === 'S') handleHit(1);
      if (key === 'K') handleHit(2);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, combo]);

  // Main Canvas render loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const now = performance.now() - startTimeRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw track lines
      const trackHeight = canvas.height / 3;
      for (let i = 0; i < 3; i++) {
        const y = i * trackHeight + trackHeight / 2;
        
        // Track background lane
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, i * trackHeight, canvas.width, trackHeight);
        
        // Center dividing line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
        // Draw the target circle
        ctx.strokeStyle = TRACKS[i].color;
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(hitLineX, y, noteRadius + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Key Indicator Letter
        ctx.fillStyle = TRACKS[i].color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(TRACKS[i].key, hitLineX, y + 4);
        
        // Lane Name Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(TRACKS[i].name, 12, i * trackHeight + 18);
      }

      // Target timing boundary vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hitLineX, 0);
      ctx.lineTo(hitLineX, canvas.height);
      ctx.stroke();

      // Render notes
      const activeNotes = notesRef.current;
      let visibleNotes = 0;
      
      for (const note of activeNotes) {
        // Calculate coordinate X based on remaining time
        const x = hitLineX + (note.time - now) * speed;
        const y = note.track * trackHeight + trackHeight / 2;
        
        // Check if note has scrolled past target screen threshold (200ms grace window)
        if (!note.hit && (now - note.time) > 200) {
          note.hit = true;
          note.score = 'miss';
          setMisses(m => m + 1);
          setCombo(0);
          triggerFeedback(t('miss'), '#f43f5e'); // rose red
        }

        // Draw note if within canvas viewport
        if (x > -50 && x < canvas.width + 50) {
          visibleNotes++;
          if (!note.hit) {
            // Active incoming note glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = TRACKS[note.track].color;
            ctx.fillStyle = TRACKS[note.track].color;
            ctx.beginPath();
            ctx.arc(x, y, noteRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner core
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, noteRadius - 8, 0, Math.PI * 2);
            ctx.fill();
          } else if (note.score === 'perfect' || note.score === 'good') {
            // Hit particle effect / flash
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.beginPath();
            ctx.arc(hitLineX, y, noteRadius + 14, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Check if song has finished (all notes processed)
      const lastNote = activeNotes[activeNotes.length - 1];
      if (lastNote && now > lastNote.time + 1000) {
        setIsPlaying(false);
        setGameOver(true);
        // Calculate XP reward
        const rawXP = Math.floor(score / 50);
        const bonusXP = rawXP > 50 ? 50 : rawXP;
        onAwardXP(bonusXP);
      } else {
        gameLoopRef.current = requestAnimationFrame(render);
      }
    };

    gameLoopRef.current = requestAnimationFrame(render);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, combo, score, t]);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#09090b', zIndex: 300,
      display: 'flex', flexDirection: 'column', color: '#f4f4f5', fontFamily: tTokens.font,
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden'
    }}>
      {/* Top Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#18181b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(242,85,69,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f25545' }}>
            <Zap size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Rytmehelt (Drum Hero)</h3>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Spil med: Lilletromme (S), Stortromme (K) & Hi-hat (H)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: soundEnabled ? '#f25545' : '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Volume2 size={16} />
          </button>
          <button 
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#f4f4f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640, width: '100%', margin: '0 auto', overflowY: 'auto' }}>
        
        {/* Game Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#a1a1aa', letterSpacing: 0.8 }}>Score</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, marginTop: 4, fontFamily: tTokens.mono, color: '#f5b8a8' }}>{score}</div>
          </div>
          <div style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#a1a1aa', letterSpacing: 0.8 }}>Combo</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, marginTop: 4, fontFamily: tTokens.mono, color: '#f25545' }}>{combo} <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 500 }}>max {maxCombo}</span></div>
          </div>
          <div style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#a1a1aa', letterSpacing: 0.8 }}>Nøjagtighed</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, marginTop: 4, fontFamily: tTokens.mono, color: '#5dd39e' }}>
              {hits + misses > 0 ? `${Math.round((hits / (hits + misses)) * 100)}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div style={{ position: 'relative', width: '100%', height: 200, background: '#09090b', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)' }}>
          <canvas ref={canvasRef} width={600} height={200} style={{ width: '100%', height: '100%', display: 'block' }} />
          
          {/* Incoming/Static screen blocker */}
          {!isPlaying && !gameOver && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(9,9,11,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: '0 30px' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Er du klar til udfordringen?</h4>
                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.4 }}>Klik på Start og tryk på H (Hihat), S (Lilletromme) eller K (Stortromme) på dit tastatur præcis når noderne krydser cirklerne.</p>
              </div>
              <button 
                onClick={startGame}
                style={{ background: '#f25545', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 999, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 6px 20px rgba(242,85,69,0.3)' }}
              >
                <Play size={16} fill="#fff" /> Start spil
              </button>
            </div>
          )}

          {/* Timing feedback overlay (Perfect! / Good! / Miss!) */}
          {isPlaying && feedback && (
            <div 
              key={feedback.id}
              style={{
                position: 'absolute', top: 20, left: hitLineX, transform: 'translateX(-50%)',
                color: feedback.color, fontWeight: 800, fontSize: '0.9rem',
                fontFamily: tTokens.serif, fontStyle: 'italic', letterSpacing: 0.5,
                animation: 'floatUpOut 0.4s ease-out forwards', pointerEvents: 'none'
              }}
            >
              {feedback.text}
            </div>
          )}
        </div>

        {/* Legend / Keymap indicators */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', fontSize: '0.75rem', color: '#a1a1aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8' }} /> Hi-hat: Tast <strong>H</strong></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fb923c' }} /> Lilletromme: Tast <strong>S</strong></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e' }} /> Stortromme: Tast <strong>K</strong></div>
        </div>

        {/* Game Over view */}
        {gameOver && (
          <div style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '24px 20px', textAlign: 'center', animation: 'scaleUp 0.3s ease-out' }}>
            <Award size={48} style={{ color: '#fb923c', margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Spil fuldført!</h4>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.5, marginBottom: 20 }}>
              Du klarede øvelsen med en score på <strong>{score}</strong> og ramte <strong>{hits} ud af {totalNotesCount}</strong> noder.
            </p>
            <div style={{ background: 'rgba(93,211,158,0.08)', border: '1px solid rgba(93,211,158,0.2)', borderRadius: 12, padding: '12px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Zap size={18} style={{ color: '#5dd39e' }} />
              <span style={{ fontSize: '0.85rem', color: '#5dd39e', fontWeight: 600 }}>Tildelt: +{Math.min(50, Math.floor(score / 50))} XP til din profil!</span>
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={startGame}
                style={{ flex: 1, background: '#f25545', border: 'none', color: '#fff', padding: '12px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
              >
                <RotateCcw size={16} /> Prøv igen
              </button>
              <button 
                onClick={onClose}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAF8F5', padding: '12px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Luk spil
              </button>
            </div>
          </div>
        )}

      </div>
      
      {/* Styles animation block */}
      <style jsx global>{`
        @keyframes floatUpOut {
          0% { opacity: 0; transform: translate(-50%, 0); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -30px); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
