# Pocket Drummer — App-specifikation

**Version:** 1.1  
**Opdateret:** Juli 2026  
**Status:** Pre-launch

---

## Koncept

Pocket Drummer er en abonnementsbaseret læringsplatform til trommespillere på det danske marked. Platformen kombinerer struktureret øvelsesindhold med AI-coaching og et integreret rytmeredskab for at gøre trommeøvelse mere tilgængeligt, målretbart og fastholdende.

Det ene job platformen løser: *Fortæl mig præcist hvad jeg skal øve i dag og bevis at jeg rykker mig.*

---

## Bruger

**Primær:** Voksen begynder, 25–45 år. Vil lære at spille trommer, men har hverken tid eller råd til fysisk undervisning. Øver derhjemme med trommesættet foran sig — ofte om aftenen i svagt lys. Har brug for konkret struktur, ikke åbne muligheder.

**Sekundær:** Selvlært trommeslager på begynder/mellemniveau der ønsker systematisk fremgang.

**Ikke målgruppen:** Professionelle musikere, studerende på musikkonservatorie, børn.

---

## Strategi

- **North Star:** 30-dages retention
- **Differentiering:** AI-lærer der husker brugeren og dennes fremskridt — på dansk
- **Forretningsmodel:** Freemium. 7-dages fuld trial (1 AI-plan + fuld adgang) → derefter premium til 50 kr./md (founding member-pris)
- **Distribution:** Web (primær), App Store (iOS), Google Play

---

## Navigation

Appen er unified: samme kodebase til mobil og desktop, med responsivt layout.

| Fane | Indhold |
|------|---------|
| **Hjem** | Daglig anbefaling, læringsplan, streak, kategorier |
| **Øvelser** | Søgbart bibliotek med statusfilter (Alle / Gennemført / Mangler) |
| **Play-along** | Backing tracks med tempo-kontrol |
| **Rytmeboks** | Metronom med avancerede træningstilstande |
| **Profil** | Brugerdata, fremgang, sprog, log ud |

**Desktop (≥ 1024px):** 80px venstresøjle med ikoner. Overlays dækker indholdsfladen men ikke navigationen.  
**Mobil (< 768px):** Bund-tab-bar, fuld viewport.

---

## Kernefunktioner

### Læringsplan
AI-genereret 4-ugers forløb baseret på brugerens niveau og mål. Genereres via DeepSeek API. Vises på hjemskærmen som "Fortsæt projekt" med fremgangsindikator.

### AI Coach
Chat med en dansk AI-trommelærer (DeepSeek `deepseek-chat`). Starter frisk ved hver session — ingen historik bevares på tværs af sessioner. Tiltaler brugeren ved fornavn fra `user.displayName`. Svarer udelukkende på spørgsmål om tromme og musik. Returnerer JSON med `{ message, action? }` hvor `action` kan pege på en kategori i appen.

### Øvelsesbibliotek
Øvelser organiseret i fire kategorier: Opvarmning, Nodelære, Grooves, Play-along. Hver øvelse har:

- Video (YouTube embed)
- Noder (MusicXML, renderet via OSMD)
- BPM-indikator og sværhedsgrad
- Tags til filtrering
- "Marker som gennemført" med +25 point og streak-opdatering

På desktop vises noder og video side om side.

### Rytmeboks (metronom)
Integreret metronom tilgængelig via fanen **Rytmeboks**. Mellemrumstast starter/stopper (undtagen når BPM-felt er fokuseret).

- BPM 20–400 med 0,5-trins præcision via input-felt
- Tap tempo, nudge ±1 og ±5, hurtigvalg 60/80/100/120
- Taktarter: 2/4, 3/4, 4/4, 5/4, 6/4, 6/8, 7/8, 9/8
- Underdelinger: kvartnoder, ottendedele, 16.-dele, trioler
- Beat-visualizer: alle cirkler animerer ved hvert slag — Snare Red på slag 1, grøn på øvrige
- Subdivision-prikker vises under visualizeren ved underdeling > kvart
- Kliklyde: klik, træblok, hi-hat. Underdelinger spiller dybere variant (42–45% frekvens, lowpass-filter på hi-hat)
- Træningstilstande: Normal, Gap (X takter til/Y takter fra), Backbeat (kun slag 2 og 4), Ramp (gradvis BPM-stigning)
- Swing 50–70% (synlig ved ottendedele og 16.-dele)

**Teknisk note:** `METRO_TIME_SIGS` og `METRO_SUBDIVISIONS` er defineret uden for komponenten som konstanter. Objektreferencer inde i komponenter genoptrages ved hvert render og ville genstarte `useEffect` ved hvert slag, hvilket nulstillede beat-tælleren. Dependencies bruger primitive værdier (`totalBeats`, `subMult`).

Se [rytmeboks-metronom.md](rytmeboks-metronom.md) for fuld specifikation og roadmap.

### Gamification
- **Point:** +25 pr. gennemført øvelse
- **Level:** nyt level per 200 point
- **Streak:** tæller dage i træk med øvelse
- Synkroniseres til Firestore ved login

---

## Indholds-workflow (admin)

Indhold uploades og publiceres via `/admin` (kun tilgængeligt for admin-rolle):

1. **Scan-tab:** Upload PDF-node → Gemini 2.5 Flash konverterer til MusicXML → vælg kategori → gem til `public/content/notation/[filnavn].xml`
2. **Video-tab:** Upload video (MP4, MOV) eller lyd (MP3, WAV) eller YouTube-URL → AI transskriberer → vælg kategori
3. **AI Gen-tab:** Generer MusicXML via DeepSeek med prompt og parametre
4. **Presets-tab:** Importér præ-konfigurerede node-øvelser

Notationsfiler: `public/content/notation/` (statiske filer, commities til git)  
Videofiler: kobles via `EXERCISE_VIDEOS`-mapping i `prototype/page.tsx`

---

## Teknisk stack

| Lag | Teknologi |
|-----|-----------|
| Framework | Next.js 16 / TypeScript |
| Database | Cloud Firestore (Firebase) |
| Auth | Firebase Auth — Google + email/password |
| Hosting | Firebase Hosting (`pocket-drummer.web.app`) |
| AI Coach | DeepSeek `deepseek-chat` |
| AI Nodeanalyse | Gemini 2.5 Flash (OMR) |
| Noder | OpenSheetMusicDisplay (OSMD) |
| Lyd | Web Audio API (metronom) |

---

## Auth

- Google-login og email/password
- Admin-rolle: `carstenlysdal@gmail.com`
- `onAuthStateChanged` med Firestore-fallback: bruger sættes fra Firebase Auth ved Firestore-fejl
- Dashboard (`/dashboard`) venter på auth-state inden redirect — ingen race condition

---

## Designsystem

Mørkt tema som standard. Snare Red (`#F25545`) bruges udelukkende til handlingsknapper og aktive tilstande — aldrig dekorativt. Streak Emerald (`#5dd39e`) til gennemførelse og fremgang.

Typografi: DM Serif Display (greetings), Outfit (overskrifter), Inter (brødtekst), JetBrains Mono (BPM, point, tekniske data).

Se `DESIGN.md` ved projektets rod for fuldt designsystem.

---

## Åbne punkter

| Punkt | Note |
|-------|------|
| Email/password-auth | Kræver aktivering i Firebase Console → Authentication → Sign-in methods |
| Firebase email-templates | Redigeres via Google Cloud Console (ikke Firebase Console) pga. Identity Platform |
| `public/content/notation/` | Skal populeres manuelt via admin-scan-workflow |
| Rytmeboks Phase 2 | Accent-kontrol, groove-presets, random tempo, human feel |
| TypeScript | 5 pre-eksisterende fejl i RhythmHero og prototype — ikke kritiske |

---

## Hvad der ikke er appen

Pocket Drummer er ikke en standalone professionel metronom-app, ikke et nodeark-bibliotek, ikke et DAW-plugin og ikke et socialt netværk. Den løser ét job for én bruger: begynderen der vil øve struktureret og se konkrete fremskridt.
