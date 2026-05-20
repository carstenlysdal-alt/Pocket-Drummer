# DrumLab 🥁

> **Trommeøve-platform med AI-drevet læringsplan, interaktiv nodevisning og digitalt trommesæt.**  
> *Dansk marked · Web + iOS · Udviklet med Next.js, Tone.js, OSMD og Claude API.*

---

## 🌟 Executive Summary

**DrumLab** er en abonnementsbaseret læringsplatform for trommespillere på alle niveauer – fra grundskoleelever til øvede musikere. Platformen kombinerer et struktureret øvelsesbibliotek med avancerede AI-funktioner for at gøre det sjovere og mere effektivt at øve sig på trommer.

---

## 🛠 Nøglefunktioner

1. **AI-Nodegenerering (Claude API)**
   - Genererer dynamisk fejlfrie MusicXML 4.0 percussion-noder med Claude 3.5 Sonnet.
   - Tilpasser noderne efter sværhedsgrad, ønskede takter, tempo og teknisk fokusområde.

2. **Interaktiv Nodeafspiller (OSMD & VexFlow)**
   - Viser og afspiller noder direkte i browseren via *OpenSheetMusicDisplay*.
   - Dynamisk tempo-controller (BPM), loop-funktion, metronom og visuel markering af det aktive slag under afspilning.

3. **Digitalt Studio Kit (Tone.js)**
   - Et fuldt spilbart 3x3 trommesæt (Hi-Hat, Ride, Crash, Snare, Toms, Stortromme) direkte på skærmen.
   - Spil med musen, touch, eller brug tastatur-hotkeys. Lydene genereres via Web Audio API.

4. **Klangio Drum2Notes Integration**
   - Transskribér lydoptagelser (MP3/WAV) eller YouTube-videoer af trommespil direkte om til spilbare, redigerbare MusicXML-noder.

5. **AI Coach**
   - En indbygget, interaktiv AI-trommetræner, der giver feedback på øvelser, teknik og råd om udstyr eller øvevaner.

6. **Personaliseret Læringsplan**
   - Genererer skræddersyede ugeplaner baseret på brugerens niveau, daglige øvetid og personlige mål.

---

## 💻 Teknologistak

- **Framework**: Next.js 16 (App Router, Server Actions, Dynamic Imports)
- **Audio Engine**: Tone.js (Web Audio API)
- **Notation Rendering**: OpenSheetMusicDisplay (OSMD) & VexFlow
- **Database**: Cloud Firestore (Firebase Client SDK)
- **AI / LLM**: Claude API (Anthropic SDK)
- **Styling**: Premium Custom CSS med moderne mørkt design (Matte Black `#0a0a0a`, Coral-Orange `#ef5a3a` accenter, glasmorfisme og flydende animationer).

---

## 🚀 Kom i gang

### 1. Klon og installer afhængigheder
```bash
git clone https://github.com/carstenlysdal-alt/Drumlab.git
cd Drumlab
npm install
```

### 2. Opsæt miljøvariabler
Kopiér skabelonen for miljøvariabler og indsæt dine egne API-nøgler:
```bash
cp .env.local.example .env.local
```
Rediger `.env.local` og tilføj din `ANTHROPIC_API_KEY` samt Firebase-konfigurationer.

### 3. Kør lokalt
Start Next.js udviklingsserveren:
```bash
npm run dev
```
Åbn [http://localhost:3000](http://localhost:3000) i din browser.

---

## 📂 Projektstruktur
- `src/app/prototype`: Det fuldt interaktive iOS App-mockup/prototype.
- `src/app/admin`: Admin-pipeline til AI-generering og Klangio transskriptioner.
- `src/app/dashboard`: Brugerens personlige dashboard med daglige øvemål.
- `src/app/drumkit`: Interaktivt digitalt trommesæt.
- `src/app/exercise/[id]`: Nodeafspiller med lydsynkronisering.
- `src/lib/firebase.ts`: Initialisering og opsætning af Firestore database.
- `src/lib/claude.ts`: Server-side integration til Claude API (Nodegenerering & Træningsplaner).
