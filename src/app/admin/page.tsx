'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';
import { 
  Sparkles, 
  Settings, 
  Upload, 
  CheckCircle2, 
  Eye, 
  Code,
  FileCode,
  Save,
  Lock,
  Music,
  Library
} from 'lucide-react';
import {
  getSavedExercises,
  saveExercise,
  Exercise
} from '@/lib/mockData';
import { useAuth } from '@/lib/authContext';
import { presetExercises, getPresetMusicXML } from '@/lib/presetExercises';
import { extractXmlPayload, hasScorePartwise } from '@/lib/musicXml';
import Link from 'next/link';

// Hent OsmdRenderer dynamisk uden SSR
const OsmdRenderer = dynamic(() => import('@/components/OsmdRenderer'), { ssr: false });

const SCAN_REQUEST_TIMEOUT_MS = 80_000;

function getCleanPdfUrl(url: string) {
  const separator = url.includes('#') ? '&' : '#';
  return `${url}${separator}toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
}

function normalizeMusicXmlResponse(xml: unknown, source: string): { xml: string; warning?: string } {
  if (typeof xml !== 'string' || !xml.trim()) {
    throw new Error(`Ugyldigt MusicXML modtaget fra ${source}: Tomt XML-svar`);
  }

  const cleanedXml = extractXmlPayload(xml);

  if (!/<[A-Za-z_][\w:.-]*(?:\s[^>]*)?>/.test(cleanedXml)) {
    throw new Error(`Ugyldigt MusicXML modtaget fra ${source}: Kunne ikke finde XML-indhold`);
  }

  if (!hasScorePartwise(cleanedXml)) {
    return {
      xml: cleanedXml,
      warning: `⚠️ XML fra ${source} mangler <score-partwise>. Forsøger preview alligevel.`
    };
  }

  return { xml: cleanedXml };
}

function isMusicXmlFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.xml') ||
    name.endsWith('.musicxml') ||
    file.type === 'application/vnd.recordare.musicxml+xml' ||
    file.type === 'application/xml' ||
    file.type === 'text/xml'
  );
}

// PDF sendes direkte til Gemini — Gemini 2.5 Flash understøtter PDF nativt.
// Client-side pdfjs-konvertering fjernet da den er inkompatibel med Turbopack/Next.js 16.

export default function AdminPage() {
  const { user, login, logout, loading: authLoadingState } = useAuth();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [, setExercises] = useState<Exercise[]>([]);
  
  // Dashboard Tool Tab Selection
  const [toolTab, setToolTab] = useState<'deepseek' | 'gemini' | 'transcribe' | 'presets'>('deepseek');

  // DeepSeek / AI generation state
  const [title, setTitle] = useState("Moderne Paradiddle Groove");
  const [category, setCategory] = useState<'rudiments' | 'groove' | 'fills' | 'timing' | 'koordination' | 'stilarter'>('groove');
  const [difficulty, setDifficulty] = useState<'begynder' | 'mellemniveau' | 'øvet'>('mellemniveau');
  const [tempo, setTempo] = useState(100);
  const [measures, setMeasures] = useState(2);
  const [focus, setFocus] = useState("Ghost notes og svage snare beats");
  const [genre, setGenre] = useState("Rock");
  const [youtubeId, setYoutubeId] = useState("");
  const [scanDescription, setScanDescription] = useState("");
  
  // Prompts
  const [systemPrompt, setSystemPrompt] = useState(`Du er Pocket Drummer AI, en ekspert i trommenotering og MusicXML 4.0-struktur.
Du skal generere en syntaktisk komplet og valid MusicXML-fil for en tromme-øvelse.
Regler for noteringen:
- Instrument: Trommesæt (Drums)
- Nøglesignatur: percussion (<sign>percussion</sign>) på linje 2.
- Stortromme (Bass drum): display-step = F, display-octave = 4.
- Lilletromme (Snare drum): display-step = C, display-octave = 5.
- Hi-hat: display-step = G, display-octave = 5, notehoved skal være x (<notehead>x</notehead>).`);

  const [scanSystemPrompt, setScanSystemPrompt] = useState(`Du er en ekspert i Optical Music Recognition (OMR) og trommenoder.
Analysér det vedhæftede billede af en trommenode og transskriber den til en gyldig, komplet MusicXML 4.0-streng.

Vigtige regler:
1. Returner KUN den rå XML-streng uden nogen Markdown-formatering eller forklaringer.
2. Noderne skal være skrevet i percussion clef i 4/4 takt.
3. Brug standard General MIDI trommenotations-standarder.
4. Hvis billedet indeholder mange takter, transskriber de første 8 takter præcist frem for at forsøge hele siden upræcist.`);

  // Gemini OMR scan state
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [notationFilename, setNotationFilename] = useState('');
  const [saveNotationLoading, setSaveNotationLoading] = useState(false);
  const [saveNotationMsg, setSaveNotationMsg] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'opvarmning' | 'nodelære' | 'grooves' | 'playalong'>('grooves');
  
  // Audio & YouTube Transcribe state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeLog, setTranscribeLog] = useState<string[]>([]);

  // Common preview states
  const [xmlData, setXmlData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'xml'>('preview');
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (scanFile && (scanFile.type === 'application/pdf' || scanFile.name.toLowerCase().endsWith('.pdf'))) {
      const url = URL.createObjectURL(scanFile);
      setPdfPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfPreviewUrl(null);
    }
  }, [scanFile]);

  useEffect(() => {
    setTimeout(() => {
      setExercises(getSavedExercises());
    }, 0);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await login();
    } catch {
      setAuthError('Fejl under login med Google. Prøv igen.');
    } finally {
      setAuthLoading(false);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    setSuccessMsg("");
    setLogs([]);
    setXmlData("");
    addLog("Opretter forbindelse til DeepSeek V3 API...");
    
    const logTimers = [
      setTimeout(() => addLog("Sender prompts og parametre..."), 1000),
      setTimeout(() => addLog("DeepSeek analyserer sværhedsgrad og taktarter..."), 2200),
      setTimeout(() => addLog("Genererer gyldig MusicXML 4.0 percussion clef..."), 3500),
      setTimeout(() => addLog("Server-side validering: Checker xml integritet..."), 4800)
    ];

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titel: title,
          kategori: category,
          sværhedsgrad: difficulty,
          tempo,
          takter: measures,
          fokus: focus,
          systemPrompt: systemPrompt
        })
      });

      if (!response.ok) {
        throw new Error("Fejl under nodegenerering");
      }

      const data = await response.json();
      
      const validation = normalizeMusicXmlResponse(data.xml, "DeepSeek API");

      logTimers.forEach(t => clearTimeout(t));
      if (validation.warning) {
        addLog(validation.warning);
      } else {
        addLog("MusicXML validering succesfuld!");
      }
      addLog("Indlæser node-preview...");
      setXmlData(validation.xml);
    } catch (e) {
      console.error(e);
      logTimers.forEach(t => clearTimeout(t));
      const message = e instanceof Error ? e.message : String(e);
      addLog(`❌ FEJL: Server-side validering afviste XML-strukturen (${message})`);
    } finally {
      setLoading(false);
    }
  };

  const addScanLog = (msg: string) => {
    setScanLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleScanSheetMusic = async () => {
    if (!scanFile) {
      alert("Vælg venligst en fil (billede eller PDF) at scanne.");
      return;
    }

    setScanLoading(true);
    setScanLog([]);
    setSuccessMsg("");
    setXmlData("");

    addScanLog("Klargør nodeark til scanning...");
    addScanLog(`Valgt fil: ${scanFile.name} (${(scanFile.size / 1024).toFixed(1)} KB)`);

    if (isMusicXmlFile(scanFile)) {
      try {
        addScanLog("MusicXML-fil registreret. Indlæser direkte uden Gemini...");
        const xml = await scanFile.text();
        const validation = normalizeMusicXmlResponse(xml, "MusicXML-upload");
        if (validation.warning) {
          addScanLog(validation.warning);
        }
        setXmlData(validation.xml);
        const baseName = scanFile.name.replace(/\.(musicxml|xml)$/i, "");
        setTitle(baseName);
        setNotationFilename(baseName);
        setSaveNotationMsg('');
        setActiveTab('preview');
        addScanLog("MusicXML indlæst og klar til preview.");
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        addScanLog(`❌ FEJL under XML-import: ${message}`);
      } finally {
        setScanLoading(false);
      }
      return;
    }

    const logTimers = [
      setTimeout(() => addScanLog("Uploader fil til Gemini OMR API..."), 800),
      setTimeout(() => addScanLog("Gemini 2.5 Flash analyserer nodelinjer og symboler..."), 2000),
      setTimeout(() => addScanLog("Ekstraherer takter, tempo og General MIDI percussion mapping..."), 3500),
      setTimeout(() => addScanLog("Genererer gyldig MusicXML 4.0 percussion clef..."), 5000),
      setTimeout(() => addScanLog("Gemini arbejder stadig på konverteringen..."), 12000),
      setTimeout(() => addScanLog("Store PDF'er og scannede billeder kan tage 30-60 sekunder..."), 25000),
      setTimeout(() => addScanLog("Afventer stadig svar fra Gemini OMR API..."), 45000),
      setTimeout(() => addScanLog("Gemini bruger længere tid end normalt. Fallback aktiveres snart hvis der ikke kommer svar..."), 60000)
    ];

    let requestTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const formData = new FormData();
      formData.append("file", scanFile);
      formData.append("systemPrompt", scanSystemPrompt);

      const controller = new AbortController();
      requestTimeout = setTimeout(() => controller.abort(), SCAN_REQUEST_TIMEOUT_MS);

      const response = await fetch('/api/scan-sheet-music', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(requestTimeout);
      requestTimeout = undefined;

      logTimers.forEach(t => clearTimeout(t));

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        addScanLog(`❌ FEJL under scanning: ${errorData?.error || "Fejl under scanning af noder"}`);
        return;
      }

      const data = await response.json();

      if (data.error) {
        addScanLog(`❌ FEJL under scanning: ${data.error}`);
        return;
      }

      const validation = normalizeMusicXmlResponse(data.xml, "scanner");

      addScanLog("Scanning og konvertering færdig!");
      if (data.warning) {
        addScanLog(`⚠️ ${data.warning}`);
      }
      if (validation.warning) {
        addScanLog(validation.warning);
      }
      addScanLog("Indlæser node-preview...");
      setXmlData(validation.xml);

      const baseName = scanFile.name.replace(/\.[^/.]+$/, "");
      setTitle(`Scannet: ${baseName}`);
      setNotationFilename(baseName);
      setSaveNotationMsg('');
      setActiveTab('preview');
    } catch (e) {
      logTimers.forEach(t => clearTimeout(t));
      const message = e instanceof Error && e.name === 'AbortError'
        ? `Timeout efter ${Math.round(SCAN_REQUEST_TIMEOUT_MS / 1000)} sekunder. Prøv et mindre/skarpt billede eller en kortere PDF.`
        : e instanceof Error ? e.message : String(e);
      addScanLog(`❌ FEJL under scanning: ${message}`);
    } finally {
      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }
      setScanLoading(false);
    }
  };

  const handleSaveNotation = async () => {
    if (!xmlData || !notationFilename.trim()) return;
    setSaveNotationLoading(true);
    setSaveNotationMsg('');
    try {
      const res = await fetch('/api/save-notation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: notationFilename.trim(), xml: xmlData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ukendt fejl');
      setSaveNotationMsg(`✓ Gemt som ${data.saved}`);
    } catch (e) {
      setSaveNotationMsg(`❌ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaveNotationLoading(false);
    }
  };

  const addTranscribeLog = (msg: string) => {
    setTranscribeLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleTranscribeAudio = async () => {
    if (!audioFile && !youtubeUrl.trim()) {
      alert("Vælg venligst en video-/lydfil eller angiv en YouTube-url.");
      return;
    }

    setTranscribeLoading(true);
    setTranscribeLog([]);
    setSuccessMsg("");
    setXmlData("");

    addTranscribeLog("Starter transskriberingspipeline...");
    if (audioFile) {
      addTranscribeLog(`Uploader fil: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      addTranscribeLog(`Forbinder til YouTube URL: ${youtubeUrl}`);
    }

    const logTimers = [
      setTimeout(() => addTranscribeLog("Ekstraherer lydspor og frekvenser..."), 1000),
      setTimeout(() => addTranscribeLog("Klangio AI genkender trommeslag (Bass, Snare, Hihat)..."), 2500),
      setTimeout(() => addTranscribeLog("Konverterer anslagstider til MusicXML taktstruktur..."), 4500),
      setTimeout(() => addTranscribeLog("Validerer rytme mod standard General MIDI layout..."), 6500)
    ];

    try {
      const formData = new FormData();
      if (audioFile) {
        formData.append("file", audioFile);
      } else {
        formData.append("youtubeUrl", youtubeUrl);
      }

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData
      });

      logTimers.forEach(t => clearTimeout(t));

      if (!response.ok) {
        throw new Error("Fejl under lyd-transskribering");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const validation = normalizeMusicXmlResponse(data.xml, "transskription");

      addTranscribeLog("Transskription og OMR konvertering fuldført!");
      if (validation.warning) {
        addTranscribeLog(validation.warning);
      }
      addTranscribeLog("Indlæser node-preview...");
      setXmlData(validation.xml);
      
      const defaultTitle = audioFile
        ? audioFile.name.replace(/\.[^/.]+$/, "")
        : `YouTube: Transskriberet`;
      setTitle(defaultTitle);
      setActiveTab('preview');
    } catch (e) {
      console.error(e);
      logTimers.forEach(t => clearTimeout(t));
      const message = e instanceof Error ? e.message : String(e);
      addTranscribeLog(`❌ FEJL under transskribering: ${message}`);
    } finally {
      setTranscribeLoading(false);
    }
  };

  const handleLoadPreset = (preset: typeof presetExercises[0]) => {
    setSuccessMsg("");
    const xml = getPresetMusicXML(preset);
    setXmlData(xml);
    setTitle(preset.titel);
    setCategory(preset.kategori);
    setDifficulty(preset.sværhedsgrad);
    setTempo(preset.tempo);
    setMeasures(preset.takter);
    setFocus(preset.beskrivelse);
    setGenre(preset.genre);
    setActiveTab('preview');
    setSuccessMsg(`Preset '${preset.titel}' indlæst! Klik 'Gem & Publicér øvelse' til højre for at udgive den.`);
  };

  const handlePublish = () => {
    if (!xmlData) return;

    const newExId = `ex-ai-${Date.now()}`;
    const newExercise: Exercise = {
      id: newExId,
      titel: title,
      kategori: category,
      sværhedsgrad: difficulty,
      varighed: measures * 3,
      youtube_video_id: youtubeId.trim() || "84G2yU_q1c0",
      musicxml_data: xmlData,
      tempo,
      takter: measures,
      ai_genereret: true,
      godkendt: true,
      genre: genre,
      beskrivelse: scanDescription || `AI-genereret øvelse med fokus på: ${focus}. Rytmen spilles ved ${tempo} BPM i ${measures} takter.`
    };

    saveExercise(newExercise);
    setExercises(getSavedExercises());
    setSuccessMsg(`Øvelsen '${title}' er nu publiceret i databasen og synlig for alle Premium-brugere!`);
  };

  if (authLoadingState) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', color: '#f8fafc', fontFamily: 'var(--font-sans)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(239, 90, 58, 0.2)', borderTopColor: '#ef5a3a', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, color: '#9ca3af', letterSpacing: '0.05em' }}>KONTROLLERER ADGANG...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user && (user.role === 'admin' || user.email.toLowerCase() === 'carstenlysdal@gmail.com');

  if (!isAdmin) {
    return (
      <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', fontFamily: 'var(--font-sans)' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', background: 'rgba(20, 20, 22, 0.6)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 90, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Lock size={28} style={{ color: '#ef5a3a' }} />
            </div>
            
            {!user ? (
              <>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: '#FAF8F5', fontFamily: 'var(--font-title)' }}>Admin Login</h2>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Log ind med din administrator Google-konto for at få adgang til indholdspipelinen og AI-nodegenereringen.
                </p>
                
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {authError && (
                    <div style={{ color: '#f43f5e', fontSize: '0.85rem', fontWeight: 500, textAlign: 'left' }}>
                      {authError}
                    </div>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-full"
                    disabled={authLoading}
                    style={{ background: '#ef5a3a', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#ffffff" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.56 2.69-3.86 2.69-6.57z"/>
                      <path fill="#ffffff" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.33-1.58-5.04-3.71H.94v2.3C2.42 16.03 5.48 18 9 18z"/>
                      <path fill="#ffffff" d="M3.96 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.94A8.99 8.99 0 000 9c0 1.45.35 2.82.94 4.04l3.02-2.3z"/>
                      <path fill="#ffffff" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.41 0 9 0 5.48 0 2.42 1.97.94 4.96l3.02 2.3c.71-2.13 2.69-3.71 5.04-3.71z"/>
                    </svg>
                    {authLoading ? 'Verificerer...' : 'Log ind med Google'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: '#FAF8F5', fontFamily: 'var(--font-title)' }}>Adgang Nægtet</h2>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Du er logget ind som <strong style={{ color: '#FAF8F5' }}>{user.email}</strong>, men denne konto har ikke administratorrettigheder.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                  <button 
                    onClick={() => logout()}
                    className="btn btn-secondary w-full"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FAF8F5', borderRadius: '12px', padding: '12px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Log ud af denne konto
                  </button>
                  <Link 
                    href="/" 
                    className="btn btn-primary w-full"
                    style={{ background: '#ef5a3a', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', display: 'block', textAlign: 'center' }}
                  >
                    Gå til forsiden
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '2rem 2.5rem' }}>
        
        {/* Admin Header */}
        <section style={{ maxWidth: '1400px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="flex align-center gap-2 mb-1">
              <Settings size={28} style={{ color: '#ef5a3a' }} />
              <h1 style={{ fontSize: '2.0rem' }}>Admin Indholdspipeline (Pocket Drummer Owner)</h1>
            </div>
            <p className="text-muted-color" style={{ fontSize: '0.95rem' }}>
              Tilføj og publicer nye trommeøvelser i databasen via AI, scanner eller præ-konfigurerede noder.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => logout()}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FAF8F5', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Log ud ({user.displayName})
            </button>
          </div>
        </section>

        {successMsg && (
          <div style={{ maxWidth: '1400px', margin: '0 auto 1.5rem auto', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 className="text-emerald" size={24} />
            <span className="text-emerald" style={{ fontWeight: 600 }}>{successMsg}</span>
          </div>
        )}

        {/* Form and Preview Grid */}
        <div className="admin-grid">
          
          {/* Left: Configuration Form and Tool Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Tool Selection Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={() => setToolTab('deepseek')} 
                style={{ 
                  background: toolTab === 'deepseek' ? '#ef5a3a' : 'transparent', 
                  color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' 
                }}
              >
                <Sparkles size={14} /> AI Gen
              </button>
              <button 
                onClick={() => setToolTab('gemini')} 
                style={{ 
                  background: toolTab === 'gemini' ? '#ef5a3a' : 'transparent', 
                  color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' 
                }}
              >
                <Upload size={14} /> Scan
              </button>
              <button 
                onClick={() => setToolTab('transcribe')} 
                style={{ 
                  background: toolTab === 'transcribe' ? '#ef5a3a' : 'transparent', 
                  color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' 
                }}
              >
                <Music size={14} /> Video
              </button>
              <button 
                onClick={() => setToolTab('presets')} 
                style={{ 
                  background: toolTab === 'presets' ? '#ef5a3a' : 'transparent', 
                  color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' 
                }}
              >
                <Library size={14} /> Presets
              </button>
            </div>

            {/* Common Details Fields (rendered for AI / Scanner / Lyd tools to pre-populate public details) */}
            {toolTab !== 'presets' && (
              <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '-0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#FAF8F5' }}>Offentlige detaljer (Til Databasen)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '3px' }}>Titel</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '3px' }}>Genre</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '3px' }}>Kategori</label>
                    <select 
                      className="form-control" 
                      style={{ padding: '7px 10px', fontSize: '0.85rem' }}
                      value={category}
                      onChange={(e) => setCategory(e.target.value as typeof category)}
                    >
                      <option value="groove">Groove</option>
                      <option value="rudiments">Rudiments</option>
                      <option value="fills">Fills</option>
                      <option value="timing">Timing</option>
                      <option value="koordination">Koordination</option>
                      <option value="stilarter">Stilarter</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '3px' }}>Sværhedsgrad</label>
                    <select 
                      className="form-control" 
                      style={{ padding: '7px 10px', fontSize: '0.85rem' }}
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                    >
                      <option value="begynder">Begynder</option>
                      <option value="mellemniveau">Mellemniveau</option>
                      <option value="øvet">Øvet</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '3px' }}>Tempo (BPM)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      value={tempo}
                      onChange={(e) => setTempo(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* YouTube video ID */}
                <div className="form-group" style={{ marginBottom: 0, marginTop: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '3px' }}>YouTube Video ID (valgfrit)</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder="F.eks. dQw4w9WgXcQ"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: 1. DeepSeek AI generation form */}
            {toolTab === 'deepseek' && (
              <div className="glass-card">
                <div className="flex align-center gap-2 mb-2">
                  <Sparkles size={20} style={{ color: '#ef5a3a' }} />
                  <h3 style={{ fontSize: '1.1rem' }}>AI-Nodegenerering (DeepSeek-V3)</h3>
                </div>

                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Antal takter</label>
                    <select 
                      className="form-control" 
                      value={measures}
                      onChange={(e) => setMeasures(Number(e.target.value))}
                    >
                      <option value="1">1 takt</option>
                      <option value="2">2 takter</option>
                      <option value="4">4 takter</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Fokusområde / AI prompt hint</label>
                  <textarea 
                    className="form-control" 
                    style={{ height: '70px', resize: 'none' }}
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="F.eks. Stortromme syncoper på 2-og slagene..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">AI Model Systeminstruktioner</label>
                  <textarea 
                    className="form-control" 
                    style={{ height: '90px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleGenerateAI} 
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Genererer noder via AI...' : 'Generér MusicXML med DeepSeek'}
                </button>
              </div>
            )}

            {/* TAB CONTENT: 2. Gemini Flash Node-Scanner */}
            {toolTab === 'gemini' && (
              <div className="glass-card">
                <div className="flex align-center gap-2 mb-2">
                  <Upload size={20} style={{ color: '#ef5a3a' }} />
                  <h3 style={{ fontSize: '1.1rem' }}>Billede & PDF Node-Scanner (Gemini 2.5 Flash)</h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-3">
                  Scan et billede/PDF af en trommenode eller importér en eksisterende MusicXML-fil.
                </p>

                <div className="form-group">
                  <div style={{ 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: '8px', 
                    padding: '1.5rem', 
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => document.getElementById('sheet-upload-input')?.click()}
                  >
                    <input 
                      type="file" 
                      id="sheet-upload-input"
                      accept="image/*,application/pdf,.xml,.musicxml,application/vnd.recordare.musicxml+xml"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setScanFile(e.target.files[0]);
                        }
                      }}
                    />
                    {scanFile ? (
                      <div>
                        <FileCode size={32} style={{ color: '#ef5a3a', margin: 'auto', marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef5a3a' }}>
                          {scanFile.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Klik for at vælge en anden fil
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} className="text-muted-color m-auto mb-1" />
                        <p style={{ fontSize: '0.85rem' }}>
                          Træk fil hertil eller klik for at vælge
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Understøtter JPG, PNG, PDF op til 20MB
                          {' '}samt XML/MusicXML
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {pdfPreviewUrl && (
                  <div className="form-group">
                    <label className="form-label">PDF-forhåndsvisning</label>
                    <iframe
                      src={getCleanPdfUrl(pdfPreviewUrl)}
                      style={{
                        width: '100%',
                        height: '72vh',
                        border: 'none',
                        borderRadius: 0,
                        background: '#fff',
                        display: 'block',
                      }}
                      title="PDF forhåndsvisning"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Scanner Systeminstruktioner (Gemini OMR)</label>
                  <textarea 
                    className="form-control" 
                    style={{ height: '80px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                    value={scanSystemPrompt}
                    onChange={(e) => setScanSystemPrompt(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Beskrivelse (vises til elever)</label>
                  <textarea 
                    className="form-control" 
                    style={{ height: '60px', resize: 'none' }}
                    value={scanDescription}
                    onChange={(e) => setScanDescription(e.target.value)}
                    placeholder="Beskriv denne uploadede trommeøvelse..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-control"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as typeof uploadCategory)}
                  >
                    <option value="opvarmning">Opvarmning</option>
                    <option value="nodelære">Nodelære</option>
                    <option value="grooves">Grooves</option>
                    <option value="playalong">Play-along</option>
                  </select>
                </div>

                <button
                  onClick={handleScanSheetMusic}
                  className="btn btn-primary w-full"
                  disabled={scanLoading || !scanFile}
                >
                  {scanLoading ? 'Scanner og analyserer noder...' : 'Start Node-Scanning med Gemini'}
                </button>

                {scanLog.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', marginTop: '1rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {scanLog.map((log, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: log.includes('❌') ? 'var(--accent-rose)' : '#ef5a3a', margin: '0.15rem 0' }}>{log}</div>
                    ))}
                  </div>
                )}

                {xmlData && (
                  <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div className="flex align-center gap-2 mb-2">
                      <Save size={16} style={{ color: '#ef5a3a' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Gem til notation-mappe</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="form-control"
                        style={{ flex: 1, fontSize: '0.85rem' }}
                        value={notationFilename}
                        onChange={(e) => setNotationFilename(e.target.value)}
                        placeholder="filnavn (uden .xml)"
                      />
                      <button
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={handleSaveNotation}
                        disabled={saveNotationLoading || !notationFilename.trim()}
                      >
                        {saveNotationLoading ? 'Gemmer...' : 'Gem .xml'}
                      </button>
                    </div>
                    {saveNotationMsg && (
                      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: saveNotationMsg.startsWith('✓') ? '#5dd39e' : 'var(--accent-rose)' }}>
                        {saveNotationMsg}
                      </p>
                    )}
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      Gemmes i <code>public/content/notation/[filnavn].xml</code>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. Audio & YouTube Transcriber */}
            {toolTab === 'transcribe' && (
              <div className="glass-card">
                <div className="flex align-center gap-2 mb-2">
                  <Music size={20} style={{ color: '#ef5a3a' }} />
                  <h3 style={{ fontSize: '1.1rem' }}>Video & YouTube AI Transskription</h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-3">
                  Upload en video- eller lydfil af en trommeoptagelse, eller paste et YouTube-link for at transskribere indholdet direkte til MusicXML.
                </p>

                <div className="form-group">
                  <label className="form-label">Valgmulighed A: Upload video eller lyd (MP4, MOV, MP3, WAV...)</label>
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    className="form-control"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAudioFile(e.target.files[0]);
                        setYoutubeUrl('');
                      }
                    }}
                  />
                </div>

                <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>— ELLER —</div>

                <div className="form-group">
                  <label className="form-label">Valgmulighed B: YouTube URL</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      setAudioFile(null);
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-control"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as typeof uploadCategory)}
                  >
                    <option value="opvarmning">Opvarmning</option>
                    <option value="nodelære">Nodelære</option>
                    <option value="grooves">Grooves</option>
                    <option value="playalong">Play-along</option>
                  </select>
                </div>

                <button
                  onClick={handleTranscribeAudio}
                  className="btn btn-primary w-full"
                  disabled={transcribeLoading || (!audioFile && !youtubeUrl.trim())}
                >
                  {transcribeLoading ? 'Transskriberer...' : 'Kør AI Video/Lyd-Transskription'}
                </button>

                {transcribeLog.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', marginTop: '1rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {transcribeLog.map((log, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: log.includes('❌') ? 'var(--accent-rose)' : '#ef5a3a', margin: '0.15rem 0' }}>{log}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. Presets Import */}
            {toolTab === 'presets' && (
              <div className="glass-card">
                <div className="flex align-center gap-2 mb-2">
                  <Library size={20} style={{ color: '#ef5a3a' }} />
                  <h3 style={{ fontSize: '1.1rem' }}>Frie Nodedatabaser (Preset Import)</h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-3">
                  Importér øjeblikkeligt højopløselige noder for standardgrooves, rudiments og fills helt uden API-omkostninger.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                  {presetExercises.map((preset, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleLoadPreset(preset)}
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        borderRadius: '10px', 
                        padding: '12px', 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,90,58,0.08)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FAF8F5' }}>{preset.titel}</span>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          background: preset.sværhedsgrad === 'begynder' ? '#10b981' : preset.sværhedsgrad === 'mellemniveau' ? '#f59e0b' : '#ef4444', 
                          color: '#fff', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          fontWeight: 700
                        }}>{preset.sværhedsgrad}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{preset.beskrivelse}</p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: '#ef5a3a', fontWeight: 600, marginTop: '2px' }}>
                        <span>Tempo: {preset.tempo} BPM</span>
                        <span>Takter: {preset.takter}</span>
                        <span>Genre: {preset.genre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
          
          {/* Right: Validation Logs and OSMD Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Live Preview Tabs */}
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between align-center mb-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab('preview')} 
                    className={`btn btn-sm ${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <Eye size={14} /> Nodevisning
                  </button>
                  <button 
                    onClick={() => setActiveTab('xml')} 
                    className={`btn btn-sm ${activeTab === 'xml' ? 'btn-primary' : 'btn-secondary'}`}
                    disabled={!xmlData}
                  >
                    <Code size={14} /> Raw MusicXML
                  </button>
                </div>

                {xmlData && (
                  <button 
                    onClick={handlePublish} 
                    className="btn btn-accent btn-sm"
                    style={{ background: '#10b981', borderColor: '#10b981' }}
                  >
                    <Save size={14} /> Gem & Publicer øvelse
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div style={{ flex: 1, minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {xmlData ? (
                  activeTab === 'preview' ? (
                    <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '8px' }}>
                      <OsmdRenderer 
                        xmlData={xmlData} 
                        currentMeasure={1} 
                      />
                    </div>
                  ) : (
                    <textarea 
                      className="form-control" 
                      style={{ flex: 1, minHeight: '350px', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre', overflowX: 'auto', background: 'rgba(0,0,0,0.4)', color: '#FAF8F5' }}
                      value={xmlData}
                      readOnly
                    />
                  )
                ) : (
                  <div className="text-center text-muted-color" style={{ padding: '40px 0' }}>
                    <FileCode size={48} className="m-auto mb-2" />
                    <p>Intet nodedata indlæst.</p>
                    <p style={{ fontSize: '0.8rem' }}>Generér noder med DeepSeek, scan med Gemini, kør lydtransskription eller vælg en preset for at se noden her.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation logs panel */}
            <div className="glass-card" style={{ maxHeight: '200px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem' }} className="mb-1">Server-Side MusicXML Valideringslog</h4>
              <div style={{ flex: 1, background: '#07080c', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', overflowY: 'auto', maxHeight: '130px' }}>
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: log.includes('❌') ? 'var(--accent-rose)' : 'var(--accent-emerald)', margin: '0.15rem 0' }}>{log}</div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    [Klar] Venter på input...
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
