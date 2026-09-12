# Pocket Drummer — retteliste

**Dato:** 18. august 2026
**Kilde:** Konsoliderer `docs/audit-koncept-og-kvalitet-2026-08-14.md` og `docs/audit-product-builder-standard-2026-08-18.md` til én prioriteret handlingsliste. De tre fund fra sidstnævnte (forkert bibliotekstal, efterladt preview-toggle, fejlagtig FloatingCoach-antagelse) er allerede rettet og indgår ikke her.

**Princip for rækkefølge:** Sikkerhed og dataintegritet kommer før produktoplevelse, fordi de ikke kan fravælges på reach/effort. Herefter følger det centrale produktløfte, så freemium/betaling, så evidensgrundlaget bag de strategiske valg.

---

## P0 — Sikkerhed og dataintegritet (launch-blokerende, ret først)

### 1. Privilege escalation: enhver bruger kan gøre sig selv til admin

**Fil:** `firestore.rules:27`

```
match /users/{userId} {
  allow read: if isOwner(userId) || isAdmin();
  allow create: if isOwner(userId);
  allow update: if isOwner(userId) && (request.resource.data.role == resource.data.role || isAdmin());
}
```

`allow create` validerer ikke `role`-feltet. En bruger kan oprette sit eget `/users/{uid}`-dokument med `role: "admin"` ved første skrivning — `update`-reglens beskyttelse gælder først efter dokumentet findes. `isAdmin()` i samme regelsæt læser præcis dette felt.

**Ret:** Tilføj eksplicit validering i `create`: `request.resource.data.role == 'user'`. Sæt admin-rolle serverside (Cloud Function eller manuel Firestore-console), aldrig via klientens create-kald.

### 2. Premium-status styres af klienten

**Fil:** `src/lib/authContext.tsx:64,80,96`

`pocketdrummer_premium_active` læses og skrives til `localStorage` og bruges til at afgøre premium-adgang. Enhver bruger kan sætte flaget i browserens devtools.

**Ret:** Flyt premium-status til et Firestore-felt der kun kan skrives af en betroet kilde (webhook fra betalingsudbyder eller Cloud Function), og lad Firestore-reglerne blokere klient-skrivning til feltet — samme mønster som `role` ovenfor.

### 3. Offentlige API-ruter uden auth eller rate-limit

**Filer:** `src/app/api/coach/route.ts`, `src/app/api/generate-plan/`, `src/app/api/generate-music/`, `src/app/api/scan-sheet-music/`, `src/app/api/save-notation/`

Ingen af ruterne verificerer et Firebase Auth-token eller begrænser kaldsfrekvens. `scan-sheet-music` og `generate-music` kalder betalte AI-tjenester (Gemini, DeepSeek) — uden rate-limit kan enhver anonym klient generere ubegrænset regning.

**Ret:** Verificér Firebase ID-token på hver rute (`Authorization`-header → `getAuth().verifyIdToken()`), og læg et simpelt rate-limit pr. bruger/IP på de AI-kaldende ruter.

---

## P1 — Det centrale produktløfte er ikke indfriet i koden

Løftet: *"Fortæl mig præcist hvad jeg skal øve i dag og bevis at jeg rykker mig."* Ingen af nedenstående kræver ny infrastruktur — det er en konsolidering af data, der allerede findes flere steder.

### 4. Hjemskærmen har ingen entydig anbefaling

**Fil:** `src/app/prototype/page.tsx` (HomeScreen, linje ~857 og frem)

Home viser samtidig: tre niveaukort ("Vælg dit niveau"), en hardkodet "I dag"-lektion ("Grooves & fills del 1" — statisk, ikke koblet til brugerens journey), og fire ligestillede quick-tiles (Øvelser, Play-along, Rytmeboks, AI Coach). Ingen af dem er markeret som primær handling.

**Ret:** Én sektion øverst: dagens anbefalede øvelse, udledt af `journey`-state (linje ~4292), ikke en hardkodet streng. Niveauvalg og quick-tiles flyttes ned som sekundære muligheder.

### 5. AI-genereret læringsplan bruges ikke i appen

`/api/generate-plan` kaldes kun fra det gamle `/onboarding`-flow. `/prototype` gemmer en lokalt sammensat plan med tom øvelsesliste (jf. `audit-koncept-og-kvalitet-2026-08-14.md:53`, `prototype/page.tsx:4422-4431`).

**Ret:** Kobl `/prototype`'s "Fortsæt lektion"-flow til den faktiske output fra `/api/generate-plan`, eller fjern planen fra copy indtil den er koblet.

### 6. AI-coachen kender ikke brugerens niveau eller øvelse

**Fil:** `src/app/api/coach/route.ts` — systempromptet (linje 11-45) indeholder ingen felter for brugerens valgte niveau, aktuelle øvelse eller journey-fremgang. UI-copy siger alligevel "husker dit niveau".

**Ret:** Send `selectedLevel`, aktuel øvelse og journey-status med i coach-kaldet, eller ret copy til at afspejle at coachen kun kender den aktuelle samtale.

### 7. Ærlig indholdscopy — resterende brud

`audit-koncept-og-kvalitet-2026-08-14.md` flagede flere copy-tal der ikke matcher det reelle datasæt end blot "312"-fejlen (allerede rettet). Gennemgå Home og Practice for øvrige tal ("40 gratis" m.fl. — `roadmap.md:37`) og match dem til faktisk indhold.

---

## P2 — Freemium og forretningsmodel

### 8. Ingen pålidelig trial-, quota- eller betalingsentitlement

Hænger sammen med punkt 2. Der findes ingen server-autoritativ model for hvornår en brugers 7-dages trial udløber, eller hvor mange AI-planer/coach-beskeder en gratis bruger må bruge.

**Ret:** Definér entitlement-model i Firestore (trial-startdato, plan-forbrug) og håndhæv den i API-ruterne fra punkt 3 — ikke kun i UI.

### 9. Dokumentationskonflikt: freemium-model

`app-spec.md:31` siger stadig "10 gratis lektioner", mens `strategisk-brief.md` og `roadmap.md` siger "7-dages fuld trial". Koden følger ingen af delene konsistent.

**Ret:** Opdatér `app-spec.md` til at matche det låste valg i `strategisk-brief.md`, implementér dét som entitlement-model.

---

## P3 — Designsprog (kræver beslutning før implementering)

### 10. Tre konkurrerende designsystemer

- `src/app/landing/page.tsx` — eget token-system, "Bricolage Grotesque"/"Hanken Grotesk", lys baggrund
- `src/app/prototype/page.tsx` (OnboardingScreen m.fl.) — andet token-system, mørk baggrund, kursiv serif-wordmark
- `app-spec.md`/`CLAUDE.md` — et tredje, dokumenteret men ikke implementeret system (DM Serif Display/Outfit/Inter/JetBrains Mono, mørkt tema som standard, Snare Red kun til handling)

**Kræver et valg, ikke en mekanisk rettelse:** hvilket af de tre systemer er facit? Anbefaling: brug `impeccable shape` til at lægge det endelige token-system fast, før nogen af de to kodebaser rettes — ellers opstår et fjerde system.

---

## P4 — Evidensgrundlag bag strategien

Ingen af disse blokerer launch teknisk, men de betyder at segment, pris og differentiering i dag er ubekræftede antagelser præsenteret som låste beslutninger (uddybet i `audit-product-builder-standard-2026-08-18.md`, afsnit 1).

### 11. Konkurrentpriser er ikke kildehenvist

Drumeo (249 kr./md) og privatlærer (400-600 kr./time) i `strategisk-brief.md` har ingen dato eller kilde.

**Ret:** Tilføj kilde og dato, eller markér eksplicit som estimat.

### 12. Ingen markedsstørrelse

Intet dokument indeholder en vurdering af det danske marked for trommeundervisning (TAM/SAM/SOM).

**Ret:** Kør en `tam-sam-som`-vurdering, om end med brede intervaller — bedre end intet tal.

### 13. Prisen (50 kr./md) er ikke testet

Ingen dokumenteret willingness-to-pay-test eller landing page-eksperiment bag prisvalget.

**Ret:** Design et billigt valideringsforsøg (fx en prisside-A/B-test) med en defineret fail-tærskel, før prisen forlader "founding member"-fasen.

---

## Anbefalet rækkefølge

1. P0 (1-3) — kan rettes uafhængigt af alt andet, ren sikkerhed
2. P1 (4-7) — kræver ingen designbeslutning, kun datakobling
3. P3 (10) — designvalget skal ligge fast, før P1's UI-arbejde bygges færdigt oven på det forkerte system
4. P2 (8-9) — hænger på P0.2's entitlement-model
5. P4 (11-13) — kan køre parallelt, blokerer intet teknisk
