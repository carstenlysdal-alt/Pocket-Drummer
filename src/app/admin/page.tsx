'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';
import { 
  Sparkles, 
  Settings, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Eye, 
  Code,
  FileCode,
  Save
} from 'lucide-react';
import { 
  getSavedExercises, 
  saveExercise, 
  getStandardDrumMusicXML,
  Exercise 
} from '@/lib/mockData';

// Hent OsmdRenderer dynamisk uden SSR
const OsmdRenderer = dynamic(() => import('@/components/OsmdRenderer'), { ssr: false });

export default function AdminPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  // DeepSeek / AI generation state
  const [title, setTitle] = useState("Moderne Paradiddle Groove");
  const [category, setCategory] = useState<'rudiments' | 'groove' | 'fills' | 'timing' | 'koordination' | 'stilarter'>('groove');
  const [difficulty, setDifficulty] = useState<'begynder' | 'mellemniveau' | 'øvet'>('mellemniveau');
  const [tempo, setTempo] = useState(100);
  const [measures, setMeasures] = useState(2);
  const [focus, setFocus] = useState("Ghost notes og svage snare beats");
  
  // Custom Prompts & Genres
  const [systemPrompt, setSystemPrompt] = useState(`Du er DrumLab AI, en ekspert i trommenotering og MusicXML 4.0-struktur.
Du skal generere en syntaktisk komplet og valid MusicXML-fil for en tromme-øvelse.
Regler for noteringen:
- Instrument: Trommesæt (Drums)
- Nøglesignatur: percussion (<sign>percussion</sign>) på linje 2.
- Stortromme (Bass drum): display-step = F, display-octave = 4.
- Lilletromme (Snare drum): display-step = C, display-octave = 5.
- Hi-hat: display-step = G, display-octave = 5, notehoved skal være x (<notehead>x</notehead>).`);

  const [scanSystemPrompt, setScanSystemPrompt] = useState(`Du er en ekspert i Optical Music Recognition (OMR) og trommenoder.
Analysér det vedhæftede billede eller PDF af en trommenode og transskriber den til en gyldig, komplet MusicXML 4.0-streng.

Vigtige regler:
1. Returner KUN den rå XML-streng uden nogen Markdown-formatering eller forklaringer.
2. Noderne skal være skrevet i percussion clef i 4/4 takt.
3. Brug standard General MIDI trommenotations-standarder.`);

  const [genre, setGenre] = useState("Rock");
  const [scanDescription, setScanDescription] = useState("");
  
  // Klangio simulation state
  const [audioUrl, setAudioUrl] = useState("");
  const [klangioLoading, setKlangioLoading] = useState(false);
  const [klangioLog, setKlangioLog] = useState<string[]>([]);

  // Gemini OMR scan state
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanLog, setScanLog] = useState<string[]>([]);
  
  // Common states
  const [xmlData, setXmlData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'xml'>('preview');
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setExercises(getSavedExercises());
    }, 0);
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const addKlangioLog = (msg: string) => {
    setKlangioLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    setSuccessMsg("");
    setLogs([]);
    setXmlData("");
    addLog("Opretter forbindelse til DeepSeek V3 API...");
    
    // Simuler lidt forsinkelse til valideringstesten (server-side validering)
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
      
      // Valider MusicXML overordnet
      if (!data.xml || !data.xml.includes('<score-partwise>')) {
        throw new Error("Ugyldigt MusicXML modtaget fra API: Mangler rod-elementer");
      }

      logTimers.forEach(t => clearTimeout(t));
      addLog("MusicXML validering succesfuld!");
      addLog("Indlæser node-preview...");
      setXmlData(data.xml);
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

    const logTimers = [
      setTimeout(() => addScanLog("Uploader fil til Gemini OMR API..."), 800),
      setTimeout(() => addScanLog("Gemini 2.5 Flash analyserer nodelinjer og symboler..."), 2000),
      setTimeout(() => addScanLog("Ekstraherer takter, tempo og General MIDI percussion mapping..."), 3500),
      setTimeout(() => addScanLog("Genererer gyldig MusicXML 4.0 percussion clef..."), 5000)
    ];

    try {
      const formData = new FormData();
      formData.append("file", scanFile);
      formData.append("systemPrompt", scanSystemPrompt);

      const response = await fetch('/api/scan-sheet-music', {
        method: 'POST',
        body: formData
      });

      logTimers.forEach(t => clearTimeout(t));

      if (!response.ok) {
        throw new Error("Fejl under scanning af noder");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.xml || !data.xml.includes('<score-partwise>')) {
        throw new Error("Ugyldigt MusicXML modtaget fra scanner: Mangler rod-elementer");
      }

      addScanLog("Scanning og konvertering færdig!");
      addScanLog("Indlæser node-preview...");
      setXmlData(data.xml);
      
      const baseName = scanFile.name.replace(/\.[^/.]+$/, "");
      setTitle(`Scannet: ${baseName}`);
      setActiveTab('preview');
    } catch (e) {
      console.error(e);
      logTimers.forEach(t => clearTimeout(t));
      const message = e instanceof Error ? e.message : String(e);
      addScanLog(`❌ FEJL under scanning: ${message}`);
    } finally {
      setScanLoading(false);
    }
  };

  const handleKlangioSimulate = () => {
    if (!audioUrl) {
      alert("Indtast venligst en lydfil URL eller YouTube link.");
      return;
    }

    setKlangioLoading(true);
    setKlangioLog([]);
    setSuccessMsg("");
    setXmlData("");

    addKlangioLog("Uploader lydfil til Klangio Drum2Notes API proxy...");
    
    // Simuler den fulde klangio transskription pipeline
    setTimeout(() => addKlangioLog("Uddrager trommespor (AI separation)..."), 1000);
    setTimeout(() => addKlangioLog("Detekterer anslagstider & MIDI-noter..."), 2000);
    setTimeout(() => addKlangioLog("Kvantiserer rytmer til 4/4 grid..."), 3500);
    setTimeout(() => {
      addKlangioLog("Transskription færdig! Omdanner MIDI til MusicXML...");
      const simulatedXml = getStandardDrumMusicXML(
        `Klangio: ${audioUrl.split('/').pop() || 'Trommelyd'}`, 
        110, 
        'fill'
      );
      setXmlData(simulatedXml);
      addKlangioLog("MusicXML succesfuldt hentet til admin-panelet.");
      setKlangioLoading(false);
    }, 5000);
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
      youtube_video_id: "84G2yU_q1c0", // Standard video til demo
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

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '2rem' }}>
        
         {/* Admin Header */}
        <section style={{ maxWidth: '1400px', margin: '0 auto 2rem auto' }}>
          <div className="flex align-center gap-2 mb-1">
            <Settings size={28} className="text-purple" />
            <h1 style={{ fontSize: '2.0rem' }}>Admin Indholdspipeline (DrumLab Owner)</h1>
          </div>
          <p className="text-muted-color" style={{ fontSize: '0.95rem' }}>
            Brug dette panel til at berige øvelsesbiblioteket via DeepSeek V3 nodegenerering, Gemini 2.5 Flash node-scanning eller transskribere noder via Klangio Drum2Notes.
          </p>
        </section>

        {successMsg && (
          <div style={{ maxWidth: '1400px', margin: '0 auto 1.5rem auto', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 className="text-emerald" size={24} />
            <span className="text-emerald" style={{ fontWeight: 600 }}>{successMsg}</span>
          </div>
        )}

        {/* Form and Preview Grid */}
        <div className="admin-grid">
          
          {/* Left: Configuration Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. DeepSeek AI generation form */}
            <div className="glass-card">
              <div className="flex align-center gap-2 mb-2">
                <Sparkles size={20} className="text-purple" />
                <h3 style={{ fontSize: '1.2rem' }}>AI-Nodegenerering (DeepSeek-V3)</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Titel på øvelse</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Kategori</label>
                  <select 
                    className="form-control" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'rudiments' | 'groove' | 'fills' | 'timing' | 'koordination' | 'stilarter')}
                  >
                    <option value="groove">Groove</option>
                    <option value="rudiments">Rudiments</option>
                    <option value="fills">Fills</option>
                    <option value="timing">Timing</option>
                    <option value="koordination">Koordination</option>
                    <option value="stilarter">Stilarter</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Sværhedsgrad</label>
                  <select 
                    className="form-control" 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'begynder' | 'mellemniveau' | 'øvet')}
                  >
                    <option value="begynder">Begynder</option>
                    <option value="mellemniveau">Mellemniveau</option>
                    <option value="øvet">Øvet</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Standard Tempo (BPM)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="50" 
                    max="180"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                  />
                </div>
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
                <label className="form-label">AI Model Systeminstruktioner (System Prompt)</label>
                <textarea 
                  className="form-control" 
                  style={{ height: '90px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Systeminstruktioner til DeepSeek..."
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

            {/* 2. Gemini Flash Node-Scanner */}
            <div className="glass-card">
              <div className="flex align-center gap-2 mb-2">
                <Upload size={20} className="text-purple" />
                <h3 style={{ fontSize: '1.2rem' }}>AI Billede & PDF Node-Scanner (Gemini 2.5 Flash)</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-2">
                Scan et billede (PNG/JPG) eller en PDF af en trommenode og omdan den direkte til spilbart MusicXML.
              </p>

              <div className="form-group">
                <label className="form-label">Upload Billede eller PDF</label>
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
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setScanFile(e.target.files[0]);
                      }
                    }}
                  />
                  {scanFile ? (
                    <div>
                      <FileCode size={32} className="text-purple m-auto mb-1" />
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
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
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Scanner Systeminstruktioner (Gemini OMR Prompt)</label>
                <textarea 
                  className="form-control" 
                  style={{ height: '80px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  value={scanSystemPrompt}
                  onChange={(e) => setScanSystemPrompt(e.target.value)}
                  placeholder="Instruktioner til Gemini OMR..."
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Musikgenre (Upload-only)</label>
                  <select 
                    className="form-control" 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    <option value="Rock">Rock</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Funk">Funk</option>
                    <option value="Pop">Pop</option>
                    <option value="Blues">Blues</option>
                    <option value="Metal">Metal</option>
                    <option value="Latinsk / Bossa Nova">Latinsk / Bossa Nova</option>
                    <option value="Skæve taktarter">Skæve taktarter</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Beskrivelse (Upload-only, vises til elever)</label>
                <textarea 
                  className="form-control" 
                  style={{ height: '60px', resize: 'none' }}
                  value={scanDescription}
                  onChange={(e) => setScanDescription(e.target.value)}
                  placeholder="Beskriv denne uploadede trommeøvelse..."
                />
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
                    <div key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: log.includes('❌') ? 'var(--accent-rose)' : 'var(--accent-purple)', margin: '0.15rem 0' }}>{log}</div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Klangio Transcription Sim */}
            <div className="glass-card">
              <div className="flex align-center gap-2 mb-2">
                <Upload size={20} className="text-cyan" />
                <h3 style={{ fontSize: '1.2rem' }}>Klangio Drum2Notes Pipeline (Admin-only)</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-2">
                Upload lydoptagelse af tromme-patterns og transskriber til redigerbart MusicXML format.
              </p>

              <div className="form-group">
                <label className="form-label">MP3 / WAV Lydfil eller YouTube URL</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="https://eksempel.com/audio/drumloop.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                />
              </div>

              <button 
                onClick={handleKlangioSimulate} 
                className="btn btn-secondary w-full"
                disabled={klangioLoading}
              >
                {klangioLoading ? 'Klangio analyserer lyd...' : 'Start Lyd-til-Node Transskription'}
              </button>

              {klangioLog.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', marginTop: '1rem', maxHeight: '120px', overflowY: 'auto' }}>
                  {klangioLog.map((log, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-cyan)', margin: '0.15rem 0' }}>{log}</div>
                  ))}
                </div>
              )}
            </div>

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
                  >
                    <Save size={14} /> Gem & Publicér øvelse
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
                      style={{ flex: 1, minHeight: '350px', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre', overflowX: 'auto', background: 'rgba(0,0,0,0.4)' }}
                      value={xmlData}
                      readOnly
                    />
                  )
                ) : (
                  <div className="text-center text-muted-color">
                    <FileCode size={48} className="m-auto mb-2" />
                    <p>Intet nodedata indlæst.</p>
                    <p style={{ fontSize: '0.8rem' }}>Generér noder med DeepSeek, scan noder med Gemini eller kør Klangio simulationen til venstre for at se preview her.</p>
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
