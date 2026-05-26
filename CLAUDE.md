# Pocket Drummer — Projektkontekst

## Formål

Pocket Drummer er en abonnementsbaseret læringsplatform til trommespillere på alle niveauer.
Platformen kombinerer et struktureret øvelsesbibliotek med AI-funktioner for at gøre
øvelse mere engagerende og effektiv. Målgruppe: det danske marked via App Store, Google Play og web.

---

## Teknisk stack

- **Framework:** Next.js 16 / TypeScript
- **Database:** Cloud Firestore (Firebase)
- **Lyd:** Tone.js
- **Noder:** OpenSheetMusicDisplay
- **AI:** DeepSeek API (coach + læringsplaner), Gemini (nodeanalyse)
- **Auth:** Firebase email-baseret auth med Firestore-synkronisering
- **Hosting:** Firebase Hosting med Next.js framework support

---

## Kernefunktioner

- AI Coach — personlig trommelærer i chat (DeepSeek)
- AI-generering af læringsplaner (4-ugers forløb)
- Øvelsesbibliotek med interaktive trommenoder (OSMD)
- Digitalt trommesæt / Studio Kit med Tone.js
- Play-along med tempo-kontrol og mixer
- Gemini-baseret nodeanalyse (scan af PDF/billeder)
- Premium-abonnement (50 kr./md — founding member pris)

---

## Strategi (låst)

- **Primær bruger:** Voksen begynder (25–45 år) uden tid/råd til fysisk undervisning
- **Det ene job:** "Fortæl mig præcist hvad jeg skal øve i dag og bevis at jeg rykker mig"
- **North Star:** 30-dages retention
- **Differentiering:** AI-lærer der husker dig og dine fremskridt — på dansk
- **Gamification:** Streak + Progression-map + Badges (ikke implementeret endnu)
- **Distribution:** App Store (iOS) + Google Play + web

Se PM-dokumenter i claudeproject/projects/pocket-drummer/docs/

---

## GitHub

https://github.com/carstenlysdal-alt/Pocket-Drummer

---

## Mappestruktur

```
src/
├── app/
│   ├── page.tsx              ← desktop app (primær)
│   ├── prototype/page.tsx    ← mobilprototype (udgangspunkt for ny mobil)
│   ├── api/
│   │   ├── coach/route.ts    ← DeepSeek coach API
│   │   ├── generate-plan/    ← AI læringsplan
│   │   ├── generate-music/   ← MusicXML generering
│   │   └── scan-sheet-music/ ← Gemini nodeanalyse
│   └── ...
├── components/
│   ├── DesktopIcons.tsx      ← alle SVG-ikoner
│   ├── FloatingCoach.tsx     ← flydende coach (til mobil)
│   └── Header.tsx
└── lib/
    ├── firebase.ts           ← Firebase initialisering
    ├── firestoreService.ts   ← Firestore CRUD
    ├── authContext.tsx       ← Auth context
    ├── ai.ts                 ← DeepSeek kald (plan + MusicXML)
    ├── curriculum.ts         ← Øvelsesstruktur
    └── mockData.ts           ← Datamodeller + localStorage helpers
functions/
└── index.js                  ← Firebase Cloud Function (kaldDeepSeek)
```

---

## Aktuel fase

Pre-launch. Desktop-redesign gennemført (macOS-vindue fjernet). Mobil er næste prioritet.
