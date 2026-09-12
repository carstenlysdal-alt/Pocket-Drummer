# Pocket Drummer — Projektkontekst

## Formål

Abonnementsbaseret trommelæringsplatform for det danske marked.
Kombinerer struktureret øvelsesbibliotek med AI-coaching for at gøre øvelse mere engagerende og effektiv.

---

## Strategi (låst)

- **Primær bruger:** Voksen begynder (25–45 år) uden tid/råd til fysisk undervisning
- **Det ene job:** "Fortæl mig præcist hvad jeg skal øve i dag og bevis at jeg rykker mig"
- **North Star:** 30-dages retention
- **Differentiering:** AI-lærer der husker dig og dine fremskridt — på dansk
- **Distribution:** App Store (iOS) + Google Play + web
- **Forretningsmodel:** Freemium → 50 kr./md (founding member-pris)

---

## Teknisk stack

- **Framework:** Next.js 16 / TypeScript
- **Database:** Cloud Firestore (Firebase)
- **Lyd:** Tone.js
- **Noder:** OpenSheetMusicDisplay (OSMD) — renderer MusicXML
- **AI:** DeepSeek `deepseek-chat` (coach + læringsplaner), Gemini 2.5 Flash (nodeanalyse/OMR)
- **Auth:** Firebase Auth — Google + email/password
- **Hosting:** Firebase Hosting (`pocket-drummer.web.app`)

---

## Kernefunktioner

- AI Coach — personlig trommelærer i chat (DeepSeek)
- AI-generering af læringsplaner (4-ugers forløb)
- Øvelsesbibliotek med interaktive noder (OSMD) og videoer (YouTube embed)
- Studio Kit — virtuelt trommesæt med Tone.js
- Play-along med backing tracks og tempo-kontrol
- Gemini OMR — scan PDF/billeder → MusicXML → gem til `public/content/notation/`
- Gamification: streak (dage i træk), point (+25 per øvelse), level (per 200 point)
- Statusfilter på øvelser: Alle / Gennemført / Mangler
- Premium-abonnement (50 kr./md)

---

## Mappestruktur

```
src/
├── app/
│   ├── page.tsx                  ← redirecter alle til /prototype (unified route)
│   ├── prototype/page.tsx        ← unified app (mobil + desktop)
│   ├── admin/page.tsx            ← indholdspipeline (kun admin)
│   ├── login/page.tsx            ← auth (Google + email/password + reset)
│   ├── api/
│   │   ├── coach/route.ts        ← DeepSeek coach
│   │   ├── generate-plan/        ← AI læringsplan
│   │   ├── generate-music/       ← MusicXML generering
│   │   ├── scan-sheet-music/     ← Gemini OMR
│   │   └── save-notation/        ← gem XML til public/content/notation/
│   └── ...
├── components/
│   ├── Header.tsx                ← minimal nav (MIT Dashboard + Admin for admin-rolle)
│   ├── OsmdRenderer.tsx          ← OSMD wrapper
│   └── ...
├── lib/
│   ├── firebase.ts               ← Firebase initialisering
│   ├── firestoreService.ts       ← Firestore CRUD (UserProfile inkl. xp/level/streak)
│   ├── authContext.tsx           ← Auth context med Firestore-fallback
│   ├── ai.ts                     ← DeepSeek kald
│   ├── curriculum.ts             ← Øvelsesstruktur (6 niveauer, 8 søjler)
│   └── mockData.ts               ← Datamodeller + localStorage helpers
└── public/
    └── content/
        ├── videos/               ← videoer (navngivet efter lektions-ID)
        ├── descriptions/         ← beskrivelser (.md)
        └── notation/             ← MusicXML-filer (.xml, navngivet efter lektions-ID)
functions/
└── index.js                      ← Firebase Cloud Function
```

---

## App-arkitektur (unified)

`/prototype/page.tsx` er den unified app der serverer både mobil og desktop:

- **Mobil (< 768px):** bund-tab-bar, fuld viewport, iOS-native feel
- **Desktop (≥ 1024px):** 80px venstresøjle (DesktopRail) + indholdsflade
- **Onboarding:** vises kun på mobil — desktop springer det over
- **Overlays:** `position: absolute, inset: 0` — dækker indholdsflade men ikke venstresøjlen

### Øvelses-indhold-kobling

Øvelser har `notation?: string` der peger på en XML-fil i `public/content/notation/`.
Video-URL mappes via `EXERCISE_VIDEOS[category][id-1]`.
Begge vises i ExerciseDetailPopup under fanerne "Noder" og "Video".

### Notation-workflow (admin)

1. `/admin` → Scan-fanen → upload PDF
2. Gemini 2.5 Flash konverterer til MusicXML
3. "Gem .xml" → `POST /api/save-notation` → `public/content/notation/[filnavn].xml`
4. Øvelse peges på filen via `notation`-feltet i `categoryExercises`

---

## Gamification

- **Point:** +25 per gennemført øvelse, synces til Firestore
- **Level:** hæves per 200 point
- **Streak:** tæller dage i træk med øvelse, nulstilles ved udebleven dag
- Sprog i UI: "point" (ikke XP)

---

## Auth

- Google-login (primær)
- Email/password (skal aktiveres i Firebase Console → Authentication → Sign-in methods)
- Password reset sender til `/login` med `actionCodeSettings`
- `onAuthStateChanged` har Firestore-fallback: sætter bruger fra Firebase Auth ved Firestore-fejl
- Admin-rolle: `carstenlysdal@gmail.com` (hardkodet i Firestore rules + authContext)

---

## Kendte åbne punkter

- Email/password-auth kræver aktivering i Firebase Console
- Firebase email-templates kan ikke redigeres (Identity Platform — rediger via Google Cloud Console)
- `public/content/notation/` skal populeres manuelt via admin-scan-workflow
- RhythmHero + prototype/page.tsx har 5 pre-eksisterende TypeScript-fejl (translation keys) — ikke kritiske
- Desktop UX skal videreudvikles: nuværende layout er funktionelt men ikke poleret

---

## GitHub

https://github.com/carstenlysdal-alt/Pocket-Drummer

## Live URL

https://pocket-drummer.web.app
