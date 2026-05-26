'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Play, Download, Volume2, ArrowLeft, Disc, Drum, Home, BookOpen, User } from 'lucide-react';

export default function DrumkitPage() {
  const router = useRouter();
  const [kitType, setKitType] = useState<'akustisk' | 'elektronisk'>('akustisk');
  const [volume, setVolume] = useState(-6); // dB
  const [activePad, setActivePad] = useState<string | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<{ drum: string; time: number }[]>([]);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const recordingStartTime = useRef<number>(0);
  const playbackTimers = useRef<NodeJS.Timeout[]>([]);

  // Synthesizers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kickSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snareSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hihatSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tomSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cymbalSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeNodeRef = useRef<any>(null);
  const audioContextStarted = useRef(false);

  const updateVolumes = () => {
    import('tone').then(() => {
      if (volumeNodeRef.current) {
        volumeNodeRef.current.volume.value = volume;
      }

      if (kitType === 'elektronisk') {
        if (kickSynth.current?.oscillator) kickSynth.current.oscillator.type = 'square';
      } else {
        if (kickSynth.current?.oscillator) kickSynth.current.oscillator.type = 'sine';
      }
    });
  };

  const triggerDrum = (drumId: string) => {
    if (!audioContextStarted.current) {
      import('tone').then((Tone) => {
        Tone.start();
        audioContextStarted.current = true;
      });
    }

    setActivePad(drumId);
    setTimeout(() => setActivePad((current) => current === drumId ? null : current), 120);

    if (isRecording) {
      const elapsed = Date.now() - recordingStartTime.current;
      setRecordedNotes(prev => [...prev, { drum: drumId, time: elapsed }]);
    }

    switch (drumId) {
      case 'kick':
        if (kickSynth.current?.triggerAttackRelease) {
          kickSynth.current.triggerAttackRelease(kitType === 'elektronisk' ? 'C1' : 'A0', '8n');
        }
        break;
      case 'snare':
        if (snareSynth.current?.triggerAttack) snareSynth.current.triggerAttack();
        break;
      case 'hihat':
        if (hihatSynth.current?.triggerAttack) hihatSynth.current.triggerAttack();
        break;
      case 'tom1':
        if (tomSynth.current?.triggerAttackRelease) tomSynth.current.triggerAttackRelease('F2', '8n');
        break;
      case 'tom2':
        if (tomSynth.current?.triggerAttackRelease) tomSynth.current.triggerAttackRelease('D2', '8n');
        break;
      case 'floor':
        if (tomSynth.current?.triggerAttackRelease) tomSynth.current.triggerAttackRelease('G1', '8n');
        break;
      case 'crash':
        if (cymbalSynth.current?.triggerAttack) cymbalSynth.current.triggerAttack();
        break;
      case 'ride':
        if (cymbalSynth.current?.triggerAttack) cymbalSynth.current.triggerAttack();
        break;
    }
  };

  useEffect(() => {
    // Dynamic client-side load of Tone.js
    import('tone').then((Tone) => {
      const volNode = new Tone.Volume(volume).toDestination();
      volumeNodeRef.current = volNode;

      kickSynth.current = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 5,
        envelope: { sustain: 0, attack: 0.001, decay: 0.22 }
      }).connect(volNode);

      const snareFilter = new Tone.Filter({
        type: 'bandpass',
        frequency: 1100,
        Q: 1.0
      }).connect(volNode);

      snareSynth.current = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.16, sustain: 0 }
      }).connect(snareFilter);

      const hihat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
        resonance: 6000,
        harmonicity: 6.2
      }).connect(volNode);
      hihat.frequency.value = 250;
      hihatSynth.current = hihat;

      tomSynth.current = new Tone.MembraneSynth({
        pitchDecay: 0.09,
        octaves: 4,
        envelope: { sustain: 0, attack: 0.002, decay: 0.32 }
      }).connect(volNode);

      const cymbal = new Tone.MetalSynth({
        envelope: { attack: 0.002, decay: 0.9, sustain: 0 },
        resonance: 8500,
        harmonicity: 7.2
      }).connect(volNode);
      cymbal.frequency.value = 280;
      cymbalSynth.current = cymbal;

      updateVolumes();
    });

    // Keyboard bindings listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      let drumId = '';

      switch (key) {
        case 'q': drumId = 'crash'; break;
        case 'w': drumId = 'tom1'; break;
        case 'e': drumId = 'tom2'; break;
        case 'r': drumId = 'ride'; break;
        case 'a': drumId = 'hihat'; break;
        case 's': drumId = 'snare'; break;
        case 'd': drumId = 'floor'; break;
        case ' ': // Spacebar for Kick
          e.preventDefault();
          drumId = 'kick'; 
          break;
        default: return;
      }

      if (drumId) {
        triggerDrum(drumId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      playbackTimers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update volume & kit-type variables
  useEffect(() => {
    updateVolumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, kitType]);

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setRecordedNotes([]);
      setIsRecording(true);
      recordingStartTime.current = Date.now();
    }
  };

  const handlePlayback = () => {
    if (recordedNotes.length === 0 || isPlayingBack) return;

    setIsPlayingBack(true);
    playbackTimers.current.forEach(clearTimeout);
    playbackTimers.current = [];

    recordedNotes.forEach(note => {
      const timer = setTimeout(() => {
        triggerDrum(note.drum);
      }, note.time);
      playbackTimers.current.push(timer);
    });

    const lastNoteTime = recordedNotes[recordedNotes.length - 1].time;
    const finalTimer = setTimeout(() => {
      setIsPlayingBack(false);
    }, lastNoteTime + 800);
    playbackTimers.current.push(finalTimer);
  };

  const handleDownloadMIDI = () => {
    if (recordedNotes.length === 0) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordedNotes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `drumm_optagelse_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getPadClass = (padId: string) => {
    return `drum-pad pad-${padId} ${activePad === padId ? 'active' : ''}`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="content-has-bottom-nav">
      <Header />

      <main style={{ flex: 1, background: 'var(--bg-deep)', padding: '2rem' }} className="grid-bg">
        <div className="glass-card" style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2rem' }}>
          
          <div className="flex align-center justify-between mb-4">
            <button onClick={() => router.push('/dashboard')} className="btn btn-secondary btn-sm flex align-center gap-1">
              <ArrowLeft size={16} /> Dashboard
            </button>
            <h2 className="font-title text-center" style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              VIRTUELT TROMMESÆT
            </h2>
            <div style={{ width: '80px' }}></div>
          </div>

          {/* Toggle controls & volume slider */}
          <div className="flex justify-between align-center gap-3 mb-4" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
            
            <div className="flex align-center gap-2">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LYDPROFIL:</span>
              <div className="calendar-toggle" style={{ margin: 0 }}>
                <button 
                  onClick={() => setKitType('akustisk')} 
                  className={`calendar-toggle-btn ${kitType === 'akustisk' ? 'active' : ''}`}
                  style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}
                >
                  Akustisk
                </button>
                <button 
                  onClick={() => setKitType('elektronisk')} 
                  className={`calendar-toggle-btn ${kitType === 'elektronisk' ? 'active' : ''}`}
                  style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}
                >
                  Elektronisk
                </button>
              </div>
            </div>

            <div className="flex align-center gap-2" style={{ minWidth: '200px' }}>
              <Volume2 size={18} className="text-muted-color" />
              <input 
                type="range" 
                min="-24" 
                max="0" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-purple)' }}
              />
              <span style={{ fontSize: '0.8rem', width: '35px', textAlign: 'right', fontFamily: 'monospace' }}>
                {volume === -24 ? 'MUT' : `${volume}dB`}
              </span>
            </div>
          </div>

          {/* Virtual drum kit pads area */}
          <div className="drumkit-container" role="group" aria-label="Virtuelt trommesæt">

            <button onClick={() => triggerDrum('crash')} className={getPadClass('crash')} aria-label="Crash cymbal (tast Q)" aria-pressed={activePad === 'crash'}>
              <div className="pad-label">CRASH</div>
              <div className="pad-key">Q</div>
            </button>

            <button onClick={() => triggerDrum('ride')} className={getPadClass('ride')} aria-label="Ride cymbal (tast R)" aria-pressed={activePad === 'ride'}>
              <div className="pad-label">RIDE</div>
              <div className="pad-key">R</div>
            </button>

            <button onClick={() => triggerDrum('hihat')} className={getPadClass('hihat')} aria-label="Hi-hat (tast A)" aria-pressed={activePad === 'hihat'}>
              <div className="pad-label">HI-HAT</div>
              <div className="pad-key">A</div>
            </button>

            <button onClick={() => triggerDrum('tom1')} className={getPadClass('tom1')} aria-label="Tom 1 (tast W)" aria-pressed={activePad === 'tom1'}>
              <div className="pad-label">TOM 1</div>
              <div className="pad-key">W</div>
            </button>

            <button onClick={() => triggerDrum('tom2')} className={getPadClass('tom2')} aria-label="Tom 2 (tast E)" aria-pressed={activePad === 'tom2'}>
              <div className="pad-label">TOM 2</div>
              <div className="pad-key">E</div>
            </button>

            <button onClick={() => triggerDrum('floor')} className={getPadClass('floor')} aria-label="Floor tom (tast D)" aria-pressed={activePad === 'floor'}>
              <div className="pad-label">FLOOR</div>
              <div className="pad-key">D</div>
            </button>

            <button onClick={() => triggerDrum('snare')} className={getPadClass('snare')} aria-label="Lilletromme (tast S)" aria-pressed={activePad === 'snare'}>
              <div className="pad-label">SNARE</div>
              <div className="pad-key">S</div>
            </button>

            <button onClick={() => triggerDrum('kick')} className={getPadClass('kick')} aria-label="Stortromme (tast Space)" aria-pressed={activePad === 'kick'}>
              <div className="pad-label">BASS</div>
              <div className="pad-key">SPACE</div>
            </button>

          </div>

          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {isRecording ? 'Optagelse startet' : isPlayingBack ? 'Afspiller beat' : ''}
          </div>

          {/* Recording & Session Controller */}
          <div className="flex justify-between align-center p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex align-center gap-2">
              <button 
                onClick={handleRecordToggle} 
                className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'} btn-sm flex align-center gap-1`}
              >
                <Disc size={16} className={isRecording ? 'pulse' : ''} />
                {isRecording ? 'STOP OPTAGELSE' : 'OPTAG BEAT'}
              </button>

              <button 
                onClick={handlePlayback} 
                disabled={recordedNotes.length === 0 || isRecording || isPlayingBack}
                className="btn btn-secondary btn-sm flex align-center gap-1"
              >
                <Play size={16} /> AFSPIL ({recordedNotes.length})
              </button>
            </div>

            <button 
              onClick={handleDownloadMIDI} 
              disabled={recordedNotes.length === 0 || isRecording}
              className="btn btn-primary btn-sm flex align-center gap-1"
            >
              <Download size={16} /> GEM DATA
            </button>
          </div>

          <p className="text-muted-color text-center mt-3" style={{ fontSize: '0.8rem' }}>
            Tip: Du kan spille live med dit tastatur! Brug <b>Space</b> til Stortromme, <b>S</b> til Lilletromme og <b>A</b> til Hi-Hat.
          </p>

        </div>
      </main>

      {/* Floating Bottom Nav matching Mockup */}
      <div className="bottom-nav">
        <button onClick={() => router.push('/dashboard')} className="bottom-nav-item">
          <Home size={20} />
          <span>Hjem</span>
        </button>
        <button onClick={() => router.push('/dashboard#library')} className="bottom-nav-item">
          <BookOpen size={20} />
          <span>Øvelser</span>
        </button>
        <button onClick={() => router.push('/drumkit')} className="bottom-nav-item active">
          <Drum size={20} />
          <span>Trommesæt</span>
        </button>
        <button onClick={() => router.push('/onboarding')} className="bottom-nav-item">
          <User size={20} />
          <span>Profil</span>
        </button>
      </div>

      <style jsx global>{`
        .pulse {
          animation: redPulse 1s infinite alternate;
        }
        @keyframes redPulse {
          0% { opacity: 0.5; }
          100% { opacity: 1; color: #f43f5e; }
        }
      `}</style>
    </div>
  );
}
