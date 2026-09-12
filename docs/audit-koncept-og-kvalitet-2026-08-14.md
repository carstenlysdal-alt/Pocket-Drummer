# Pocket Drummer — koncept- og kvalitetsaudit

**Dato:** 14. august 2026

**Scope:** Aktuel `/prototype`, fælles apparkitektur, auth/Firestore, AI-ruter og de styrende produktdokumenter

**Metode:** Koncept-compliance, React/Next.js system-QA, OWASP/auth, mobilarkitektur, AI-kontrakter, UX-audit og Playwright-verifikation i Chrome

**Karakter:** Rapport og anbefalinger — ingen produktimplementering eller deploy

## Executive verdict

**Samlet Health Score: 6/20 · launch-blokerende**

Pocket Drummer har nu et langt stærkere visuelt fundament, en ægte skærmfyldende desktop-Home, tydelig niveau → teknik → øvelse-navigation og et lovende “Start min rejse”-greb. Men appen opfylder endnu ikke det centrale produktløfte: *“Fortæl mig præcist hvad jeg skal øve i dag og bevis at jeg rykker mig.”*

Den vigtigste årsag er ikke mangel på UI. Det er, at flere parallelle produktsystemer ikke hænger sammen:

1. `/prototype` viser en hardkodet dagens lektion og generiske teknikøvelser.
2. Den AI-genererede 4-ugers plan findes i et andet onboardingflow og bruger legacy-indhold.
3. Journey, completion, XP, streak og cloud-sync har forskellige datakilder.
4. Home viser demo-tal som brugerens reelle fremgang.
5. Auth, premium og adminroller er ikke server-autoritativt beskyttet.

Løsningen må derfor ikke lanceres eller få betalt trafik, før P0-fundene er lukket. Den største risiko er ikke kosmetisk: en almindelig bruger kan i den nuværende Firestore-model gøre sig selv til admin eller premium, og offentlige API-ruter kan misbruges uden auth eller rate limits.

| Spor | Score | Vurdering |
|---|---:|---|
| Koncept og roadmap-compliance | 5/20 | Produktløftet er kun delvist realiseret |
| Teknik, sikkerhed og app-standard | 5/20 | Produktionsblokeret |
| AI-moduler og outputkontrakter | 5/20 | Produktionsblokeret |
| UX og intuitivitet | 7/20 | Stærkere design, men fragmenteret kerneflow |
| **Samlet** | **6/20** | **Launch-blokerende** |

## Styrende princip

Auditten bruger følgende kildehierarki, når dokumenterne er uenige:

1. Besluttede/låste valg i `docs/strategisk-brief.md`.
2. Aktiv prioritering i `docs/roadmap.md`.
3. Funktionskontrakter i `docs/app-spec.md` og `docs/rytmeboks-metronom.md`.
4. Aktuel kode og prototypecopy beskriver status — ikke nødvendigvis det ønskede produkt.

Roadmappens eksisterende RICE-score er bevaret. Sikkerheds-, dataintegritets- og sandhedskrav markeres som release gates uden RICE, fordi de ikke kan fravælges på baggrund af reach eller effort.

## 1. Koncept-compliance og gap-matrix

**Status:** Opfyldt / Næsten opfyldt / Delvist / Mangler / Blokeret.

| Feature eller beslutning | Status i `/prototype` | Styrende kilde | Konkret gap | RICE / prioritet |
|---|---|---|---|---|
| Én personlig “øv dette i dag”-handling | **Mangler** | `app-spec.md:13,42,55-56`; `strategisk-brief.md:12-18` | Home konkurrerer mellem tre niveauer, en hardkodet lektion, fire quick tiles, resume og bibliotek. Journey påvirker ikke dagens anbefaling. | Release gate · P0 |
| AI-genereret 4-ugers læringsplan på Home | **Mangler i `/prototype`** | `app-spec.md:55-56`; `roadmap.md:63-73` | `/api/generate-plan` bruges kun af legacy `/onboarding`. Journey gemmer en lokalt sammensat plan med tom `øvelser`-liste (`prototype/page.tsx:4422-4431`). | Mobilproduktion 4,5 · P0 |
| AI-lærer der husker bruger og progression | **Delvist** | `app-spec.md:29-30,58-59`; `strategisk-brief.md:16-18` | Coach modtager chat og sprog, men ikke valgt niveau, øvelse eller journey. UI-copy siger alligevel “husker dit niveau”. Coach-actions ignoreres i `/prototype`. | Release gate · P0/P1 |
| Start og fortsæt rejse efter login | **Delvist** | Brugerkrav; `roadmap.md:67-73` | CTA, loading og fejlstate findes. Resume gemmer senest åbnede — ikke næste relevante — øvelse. Cloud-fejl sluges, og completion synkroniseres separat. | Release gate · P0 |
| Minimum 30 kuraterede øvelser | **Delvist på data, mangler i produktet** | `strategisk-brief.md:37`; `roadmap.md:23,75-79` | `curriculum.ts` indeholder 73 lessons, men `/prototype` bruger det ikke. Kategorifladerne har 15 konkrete entries; niveauflowet genererer 96 generiske “Teknik 1–8”-varianter uden kurateret undervisningsindhold. | **5,1 · P0** |
| Ærlig indholdscopy | **Blokeret** | `strategisk-brief.md:50`; `roadmap.md:37,79` | Home viser “312 i biblioteket”; Practice viser “40 gratis”, men de synlige datasæt understøtter ikke tallene. | Indgår i 15,0/5,1 · P0 |
| 7-dages trial, én AI-plan, ubegrænset coach, 50 kr./md | **Mangler** | `strategisk-brief.md:44-50`; `roadmap.md:21,32-37` | Ingen pålidelig trial-, quota- eller betalingsentitlement. Premium kan aktiveres fra klienten. `app-spec.md` beskriver samtidig en forældet “10 gratis lektioner”-model. | **15,0 · P0** |
| Streak, progression-map og 12 badges | **Mangler/delvist** | `strategisk-brief.md:54-60`; `roadmap.md:24,47-61` | Streak/XP findes som fragmenteret localStorage/Firestore-state og demo-copy. Progression-map, badges, streak-frys og push mangler. | **5,1 · P0** |
| Produktionsklar mobilapp | **Delvist** | `roadmap.md:25,63-73` | Safe areas og mobilnavigation er forbedret. Auth, plan, progression, a11y, content og QA er ikke produktionsklare. | **4,5 · P0** |
| Capacitor, iOS/Android og push | **Mangler** | `roadmap.md:22,39-45` | Ingen Capacitor-afhængigheder, config, native projekter, deep links eller push-arkitektur. Google popup-login og intervalbaseret metronom er ikke en færdig WebView/native-strategi. | **12,0 · P0** |
| Unified navigation på mobil/desktop | **Delvist** | `app-spec.md:36-49` | Fem faste destinationer og aktiv state findes. Landing, login, dashboard, `/`, `/onboarding` og `/prototype` har stadig forskellige flows og taksonomier. | Mobil 4,5 · P0/P1 |
| Rigtig desktopoplevelse | **Næsten opfyldt på Home** | `app-spec.md:48,70`; `roadmap.md:26,103` | Playwright bekræfter fuld viewport og venstrerail. Kategori-, coach- og exercise-overlays er stadig mobile arbejdsflader, og noder/video vises ikke konsekvent side om side. | **0,6 · P1** |
| Fire kategorier med søgning/status og +25 | **Delvist** | `app-spec.md:43,61-70` | Søgning, tags og statusfiltre findes. Journey-øvelser bruger ikke samme completion/XP/streak-flow, flere rows mangler tastatursemantik, og indholdet er ikke fuldt lokaliseret. | Mobil 4,5 · P0/P1 |
| Rytmeboks som integreret hjælpeværktøj | **Delvist/næsten** | `app-spec.md:72-85`; `rytmeboks-metronom.md` | Mange v1-kontroller findes. Audio bruger `setInterval` frem for look-ahead scheduling, UI’et er tæt, og værktøjet får for høj vægt i forhold til det guidede læringsjob. | P1/P2 |
| Adminbaseret kurateret content-workflow | **Blokeret** | `app-spec.md:97-107`; `roadmap.md:77-79` | Admin-gate er klientbaseret; API-ruter er offentlige; “publicering” gemmer delvist i localStorage og skriver statiske filer til en ikke-holdbar serverless runtime. | Release gate · P0/P1 |
| Hele produktet følger valgt sprog | **Delvist** | Brugerkrav; `app-spec.md:29-30` | Home, journey og coach skifter. Kategorier, øvelsesdata, rytmeboks, legacy flows, landing, login og flere aria-labels forbliver danske. | Release gate for flersproget launch · P0 |

### Hovedkonklusion fra gap-matricen

Der er ikke primært behov for flere flader. Der er behov for at koble det eksisterende indhold og den eksisterende AI til én autoritativ læringsrejse. At tilføje flere filtre, generiske øvelser eller metronomfunktioner vil øge bibliotek/simulator-retningen og dermed gøre konceptdriften større.

## 2. Dokumentationskonflikter, der skal besluttes

| Emne | Konflikt | Anbefalet source of truth |
|---|---|---|
| Freemium | `app-spec.md:31` siger 10 gratis lektioner; brief/roadmap siger 7-dages fuld trial + én plan. | Strategisk brief og roadmap: 7-dages trial. |
| Primær distribution | `app-spec.md:32` siger web primær; brief/roadmap siger App Store + Google Play primær. | Strategisk brief og roadmap: mobil stores primær. |
| Coach-sprog | `app-spec.md:58-59` siger dansk-only; seneste produktkrav kræver komplet da/en/de/es. | Beslut eksplicit flersproget kontrakt og versionér prompt/content pr. sprog. |
| Niveauer | Prototype: Begynder → Øvet → Rutineret. Landing: Begynder → Mellemniveau → Øvet. Roadmap: Begynder → Rutineret → Øvet → Avanceret. Curriculum: seks niveauer. | Én observerbar niveaumodel, ejet centralt og genbrugt overalt. |
| Tema | `app-spec.md:137` siger mørkt som standard; `/prototype` starter lyst. | Følg app-spec eller opdatér spec efter en dokumenteret brugerbeslutning. |
| Indholdsmængde | UI siger 312/40; roadmap kræver faktisk antal og minimum 30 kuraterede. | Autoritativ content-query og faktisk count. |
| Designsystem | `app-spec.md:141` henviser til `DESIGN.md`, som ikke findes. | Opret én aktiv designkontrakt eller ret henvisningen. |

## 3. P0 — skal lukkes før launch

### P0.1 Firestore tillader admin-eskalering

`isAdmin()` stoler på `users/{uid}.role` (`firestore.rules:16-19`), mens en ny autentificeret bruger må oprette sit eget dokument uden feltvalidering (`firestore.rules:26-30`). Brugeren kan derfor oprette sig selv med `role: "admin"` og derefter få adgang til adminbeskyttede users, exercises og exerciseNotations.

**Krav for lukning:** Rolle må aldrig komme fra klientskrivbare data. Brug Firebase custom claims/serveradministreret rolle, afvis `role` ved create/update, og tilføj emulator-tests for anonym, owner, user og admin.

### P0.2 Premium kan aktiveres uden betaling

Klienten læser `pocketdrummer_premium_active` fra localStorage og skriver det til Firestore (`authContext.tsx:64-70,223-235`). Firestore-reglerne beskytter ikke `isPremium`. Freemium og kvoter kan derfor ikke håndhæves.

**Krav for lukning:** Entitlement skal sættes server-side fra betalings-/trial-hændelser og kun kunne læses af klienten. Plan- og coachkvoter håndhæves på serveren.

### P0.3 Alle privilegerede og omkostningstunge API-ruter er offentlige

Coach, generate-plan, generate-music, scan-sheet-music, transcribe-audio, save-notation og save-sheet-image verificerer hverken Firebase ID-token, admin claim, App Check eller rate limit. Det gør både AI-regningsmisbrug og content-overwrite muligt.

**Krav for lukning:** Fælles server-side auth middleware; admin claim til content/OMR/generering; bruger- og IP-kvoter til coach/plan; App Check; request-size/schema-validering før parsing og eksterne kald.

### P0.4 Den centrale læreroplevelse er ikke integreret i `/prototype`

Den eneste klient for `/api/generate-plan` er legacy-onboarding (`src/app/onboarding/page.tsx:57-87`). `/prototype` sammensætter i stedet en journey uden planøvelser (`prototype/page.tsx:4422-4431`). Home viser en hardkodet anbefaling, som ikke afspejler niveau, mål eller completion.

**Krav for lukning:** Én versioneret planmodel, som genereres fra det aktuelle curriculum, valideres server-side, vises som dagens konkrete handling og opdateres efter completion.

### P0.5 Progression og “fortsæt” har ingen fælles sandhed

Programprogression, category completion, journey-position, XP og streak gemmes forskelligt. Journey registrerer en øvelse ved åbning (`prototype/page.tsx:2031-2034`), ikke ved gennemførelse, og “fortsæt” kan derfor genåbne en allerede afsluttet øvelse. Firestore-fejl sluges (`authContext.tsx:209-220`).

**Krav for lukning:** Ét idempotent completion-event, atomisk opdatering af plan/progression/XP/streak og eksplicit pending/saved/error-state. “Fortsæt” beregner næste ikke-gennemførte aktivitet.

### P0.6 Produktet viser opdigtet fremgang og indholdsmængde

“312 i biblioteket”, “40 gratis”, gæstestreak, 72 minutter, 18 timer og modulprogression er hardkodede demo-data. Det er særligt skadeligt, fordi produktets løfte er at *bevise* brugerens fremgang.

**Krav for lukning:** Fjern alle demo-tal fra produktfladen. Brug autoritative queries eller ærlige tomtilstande. Tilslut mindst 30 faktisk kuraterede launchøvelser til samme contentmodel som planen.

### P0.7 Gemini kan fremstille en falsk nodescanning som succes

Ved manglende `GEMINI_API_KEY` returnerer `scanSheetMusic()` en fast demo-MusicXML (`src/lib/gemini.ts:15-20`). Adminflowet præsenterer derefter scanningen som færdig og klar til publicering. Det er i konflikt med rutens ellers korrekte timeouttekst, som afviser upræcis fallback.

**Krav for lukning:** Ingen fabrikeret OMR-fallback. Returnér en eksplicit error/degraded state og blokér publicering, indtil output har bestået en reel MusicXML-validering og menneskelig godkendelse.

### P0.8 Onboarding, login og canonical route er fragmenteret

Landing gemmer et niveau, som appen ikke læser. Prototype spørger igen. Login går via `/dashboard` → `/` → `/prototype`. Desktop/mobile landing bruger forskellige destinationsruter. Splashens login og kom-i-gang deler handler.

**Krav for lukning:** Ét flow: landing → auth/onboarding → canonical app-route med return URL, overført niveau og samme design/sprog. Legacy-ruter skal server-redirecte uden at loade den gamle app.

### P0.9 Mobil-store-roadmappet er ikke teknisk startet

Capacitor, native projekter, push, deep links og WebView-auth mangler. Dette er roadmappets næsthøjeste RICE-score (12,0) og kan ikke kaldes “senere polish”, hvis App Store/Google Play er primær distribution.

**Krav for lukning:** Når sikkerhed og canonical mobilflow er stabilt: opret Capacitor-shell, native auth/deep links/lifecycle, push-entitlements og store-buildpipeline. Metronomen skal bruge audio look-ahead scheduling, ikke alene `setInterval`.

## 4. P1 — væsentlige kvalitetsproblemer

### P1.1 AI requests og outputs mangler runtime-kontrakter

- Coach antager, at `messages` er et array; roller, længder og indhold valideres ikke.
- Plan og MusicXML validerer kun truthiness, ikke enums, ranges eller strenglængder.
- Brugerens `systemPrompt` kan erstatte serverprompten i MusicXML/OMR-ruter uden server-side admincheck.
- Planoutput køres gennem `JSON.parse`, men valideres ikke mod schema, kendte exercise-id'er, uge/dag eller status.
- Coach validerer kun `message`; en ugyldig action eller rå ikke-JSON tekst kan gå videre.
- MusicXML-kontrollen er regex-baseret, og output uden korrekt root kan stadig returneres/publiceres.

**Anbefaling:** Zod/JSON Schema på request og response; kendte id'er og ranges; streng action-enum; XML-parser med DTD/external entities slået fra; publiceringsgate der fejler lukket.

### P1.2 Fallbacks skjuler systemfejl

Plan- og MusicXML-fallbacks returneres med HTTP 200 uden `source`, `degraded` eller warnings. Planfallbacken ignorerer store dele af brugerinput; MusicXML-fallbacken ignorerer takter/fokus. Standard-MusicXML indeholder desuden fejlmatchende closing tags i `mockData.ts:153-172`.

**Anbefaling:** Alle AI-svar får `source`, `modelVersion`, `degraded`, `warnings` og request-id. En fallback må aldrig præsenteres som personlig analyse eller ægte OMR.

### P1.3 Produktionskvalitetsporten fejler

- `next.config.mjs:3-5` har `ignoreBuildErrors: true`.
- `npm run lint` fejler aktuelt med **10 errors og 45 warnings**.
- `npx tsc --noEmit` består.
- Der er ingen normal test/QA-script eller fundet CI-workflow, som blokerer release.

**Anbefaling:** Fjern ignoreBuildErrors; afgræns lint korrekt; kræv lint, typecheck, kontrakttests, browser-smoke og build i CI.

### P1.4 `/prototype` er en stor client-monolit

`src/app/prototype/page.tsx` er 4.854 linjer med alle skærme, overlays, coach, admin og metronom samlet. Seneste builddiagnostik viser ca. 1,31 MB ukomprimeret first-load JavaScript for ruten. Auth/Firestore initialiseres globalt.

**Anbefaling:** Del efter route/feature; lazy-load overlays, coach, OSMD og metronom; flyt data/services ud af page-filen; undgå global Firebase Storage, hvor det ikke bruges.

### P1.5 Admin-publicering er ikke holdbar

Admin skriver øvelser til browser-localStorage og noder til `process.cwd()/public/...`, mens UI'et siger “publiceret og synlig for alle”. Det er ikke en holdbar serverless contentdatabase, og `/prototype` læser fortsat hardkodede arrays.

**Anbefaling:** Firestore/Storage-baseret content repository med draft/review/published, revisionshistorik, audit-log og serverbeskyttet publicering.

### P1.6 Accessibility mangler i kernekomponenter

Der findes klikbare `div`-elementer, unavngivne ikonknapper, dialoger uden `role="dialog"`, fokusfælde eller fokusretur, tabs uden tabsemantik og kontroller under anbefalet touchstørrelse. Outline fjernes flere steder uden lokal erstatning.

**Anbefaling:** Én dialogprimitiv, semantiske buttons/links, eksplicit accessible name/state, 44×44 touchmål og axe/keyboard-smoke for alle kerneflows.

### P1.7 Lokalisering er ikke end-to-end

Browseren bekræfter korrekt skift af journey fra dansk til engelsk og korrekt opdatering af `<html lang>`. Men kategorier, exercise metadata, rytmeboks, landing/login og flere labels er stadig danske. “Rytmeboks” oversættes samtidig som “Drum Kit”, hvilket ændrer featurebetydningen.

**Anbefaling:** Én typesikker oversættelses- og contentmodel. Versionsmærk både UI-copy, curriculum og AI-prompts pr. sprog. Tilføj skærm-for-skærm i18n-tests.

### P1.8 Fremtrædende handlinger er upålidelige

- Home “Øvelser” åbner kun Nodelære.
- “Studio Kit” kan åbne Grooves.
- Et søgeresultat åbner kategorien, ikke den valgte øvelse.
- “Gentag”, “Næste” og coach-attachment mangler reel handling.
- XP kan tildeles igen ved gentagen completion af samme øvelse.

**Anbefaling:** Label og destination skal matche 1:1; fjern døde controls; gør completion idempotent server-side.

### P1.9 Desktop er kun færdig på Home

Home er en reel desktopkomposition. De tunge arbejdsflader genbruger dog fuldflade mobile overlays og opfylder ikke kravet om noder/video side om side.

**Anbefaling:** Desktop-workspace med bevaret rail, vedvarende kontekst, maxbredde og side-om-side medier. Desktop er P1 i roadmap og må ikke skubbe mobil-P0'erne væk.

## 5. P2 — hardening og kvalitetsgæld

- **Sikkerhedsheaders:** Ingen eksplicit CSP, `frame-ancestors`, Referrer-Policy eller Permissions-Policy.
- **Uploadvalidering:** Uens størrelse/MIME/magic-byte-kontrol; `formData()` parses før scan-størrelseskontrol; UI siger 20 MB, server 10 MB.
- **Auth-hardening:** Password reset kan falde tilbage til localhost; ingen dokumenteret email-verifikation, admin-step-up eller MFA.
- **Timeout/retry:** DeepSeek-kald mangler AbortController; coach retryer op til tre gange uden backoff. Gemini-timeout er et positivt modstykke.
- **Observability:** Ingen route error boundaries, telemetry eller crash reporting; mange fejl ender kun i `console.error` eller tom `catch`.
- **Kontrast:** Flere lyse tokens ligger under WCAG AA, samtidig med 9–13 px tekst. Lyst tema er default trods app-specens aften-/dark-default krav.
- **Reduced motion:** Global støtte findes delvist, men `.active-pulse` og inline overlayanimationer er ikke dækket.
- **Responsive mellemzone:** 768–1023 px bruger fortsat i høj grad en telefonramme frem for et tablet-layout.
- **Browserhistorik:** Luk af overlay pusher ny state; Tilbage kan derfor genåbne det lukkede overlay.
- **Dokumentationsdrift:** README/CLAUDE og app-spec beskriver flere legacy-navne, forældede fejl og uimplementerede egenskaber som aktuel sandhed.

## 6. P3 — begrænset polish

- Vis provider, modelversion, source og request-id i interne adminlogs.
- Feature-flag mobil/desktop-preview-toggle og “Reset Intro” væk fra produktion.
- Fjern fast versionslabel fra Profil eller generér den fra buildmetadata.
- Foren dobbelte lukmekanismer i overlays.
- Ryd ubrugte ikoner, states, globale fontimports og legacy CSS efter arkitektursplit.

P3 er bevidst kort. Flere dekorative forbedringer vil ikke påvirke North Star, før kerneflow og dataintegritet virker.

## 7. Browserverifikation

Playwright 1.51.1 blev kørt mod den lokale dev-server i branded Chrome.

| Scenario | Resultat |
|---|---|
| Mobil, 390×844, `/prototype?view=mobile` | Ingen horisontal overflow; fempunkts bundnavigation er synlig; niveau → Begynder → Enkeltslag viser præcis 8 øvelser og én journey-CTA. |
| Sprogskift da → en i journey | Tekst, øvelsesmetadata, CTA og `html lang` skifter korrekt i det testede flow. Ingen page errors eller console errors. |
| Mobil overlay/adfærd | Preview-toggle ligger oven på header/indhold. Efter scroll interceptede “Desktop”-knappen et klik på sprogknappen. Bundnavigationen dækkede nederste indhold i screenshots. |
| Desktop, 1440×900, `/prototype?view=desktop` | Body fylder 1440 px uden horisontal overflow. Separat venstrerail og flerkolonne-Home fylder hele viewporten; det er ikke længere en opskaleret mobiltelefon. |
| `/` | Browseren endte på `/prototype`, men først efter klient-side redirect fra den gamle root-app. Canonical routing er derfor visuelt korrekt efter redirect, men teknisk unødigt tung og fragmenteret. |

Google-login og ekstern betalings-/provideradfærd blev ikke udført i browserauditten. Auth, Firestore og API-autorisation er i stedet verificeret statisk i kode og regler.

## 8. UX: intuitivitet for den voksne begynder

### Det, der virker

- Niveau → teknik → nummererede øvelser er let at afkode.
- “Log ind og start min rejse” er en tydelig, forståelig CTA med loading og fejlstate.
- Fast bundnavigation og desktoprail skaber genkendelighed.
- Tilbagekontroller, completed count og markeret resume-punkt er gode orienteringssignaler.
- Designsproget er roligt, kompetent og mere voksent end den tidligere glas-/app-prototype.

### Det, der skaber tvivl

- Home viser seks forskellige kandidater til “næste skridt”.
- “I dag” og “Fortsæt” er demooplevelser uden forbindelse til faktisk journey.
- Niveaumodellen ændrer betydning mellem flader og sprog.
- Generiske “Enkeltslag 1–8” forklarer ikke læringsmål eller beståelseskriterium.
- Login kan føre brugeren gennem flere routes/designs.
- Copy lover cloud-hukommelse, coach-kontekst og publiceret indhold, som state ikke pålideligt understøtter.

### Anbefalet Home-hierarki

1. **Primær:** “Fortsæt Enkeltslag 3 · 6 min · 68 BPM” eller “Start din første øvelse”.
2. **Bevis:** Én sand progression: completion, næste milepæl og streak.
3. **Hjælp:** “Spørg coach om denne øvelse”.
4. **Sekundært:** Bibliotek, play-along og rytmeboks.

Det skærer ikke funktionalitet væk; det sætter lærerrollen over værktøjerne.

## 9. AI-moduler: samlet vurdering

| Modul | Vigtigste styrke | Vigtigste risiko | Status |
|---|---|---|---|
| Coach | JSON mode, 12-beskedsvindue, fire lokaliserede fallbacks | Offentlig, ingen quotas, svag request/action-validering, rå modeltekst kan vises, mangler bruger-/journeykontekst | P0/P1 |
| Generate plan | Dansk 4-ugers prompt og lokal fallback | Ikke integreret i `/prototype`, intet response-schema, legacy exercise-id'er, fallback maskeres som personlig plan | P0/P1 |
| Scan sheet music | 60 s server-timeout, 10 MB-grænse, fence-ekstraktion | Offentlig adminfunktion, bruger kan erstatte systemprompt, alle MIME-typer, fabrikeret demo ved manglende key, svag XML-validering | P0 |
| Generate music | Lav temperatur og XML-ekstraktion | Offentlig, prompt override, ingen ranges/timeout, invalid root kan returneres, fallback skjules | P0/P1 |

### Positive AI-fund

- API-nøgler er server-side miljøvariabler og eksponeres ikke i klientbundle.
- Coach bruger JSON mode og begrænser historikken.
- Gemini har en reel server-timeout.
- `extractXmlPayload()` kan fjerne almindelige markdown fences og isolere et score-fragment.
- Admin har preview og rå XML-visning før publicering.
- De auditerede ruter persisterer ikke chat eller filer lokalt; data sendes dog til DeepSeek/Gemini og kræver synlig privacy-/DPA-afklaring.

## 10. Gamle audits: status

| Tidligere mønster | Status 14. august 2026 |
|---|---|
| Zoom blokeret | **Rettet** — viewport tillader zoom. |
| Ingen global focus-visible | **Rettet** — global regel findes. |
| Onboarding uden ARIA | **Markant forbedret**. |
| Desktop er kun skaleret mobil | **Rettet for Home ved ≥1024 px**; overlays mangler endnu. |
| Monolit/ingen code splitting | **Forværret** — prototypefilen er vokset markant. |
| Klikbare divs og unavngivne controls | **Stadig gældende**. |
| Inline styles/hardkodede farver | **Stadig gældende**. |
| Resize uden debounce | **Stadig gældende** flere steder. |
| For mange fontfamilier | **Forværret globalt** — otte Google-familier importeres. |
| Glass/pulse/bounce | **Delvist rettet i prototype**; legacy CSS/motion består. |
| Dashboard som redirect | **Stadig gældende**, nu med ekstra hop gennem `/`. |

## 11. Systemiske mønstre

1. **UI-copy er foran systemet.** Appen lover plan, hukommelse, progression og publicering, før datamodellen kan bevise det.
2. **Flere sandhedskilder.** Curriculum, prototype-arrays, legacy mockData, localStorage, learningPlans og user profile beskriver forskellige versioner af samme produkt.
3. **Tre konkurrerende produkter.** Lærer, bibliotek og tromme/metronomværktøj har næsten samme visuelle vægt.
4. **Klienten er betroet for meget.** Admin, premium, XP og dele af content/progression kan manipuleres klient-side.
5. **Nye flows lægges oven på legacy.** Landing, onboarding, login, dashboard, root og prototype er ikke konsolideret.
6. **Lokalisering sker komponentvist.** Nye områder oversættes, men indhold, ældre skærme og AI-kontrakter versioneres ikke samlet.
7. **Monolitten skjuler tværgående krav.** A11y, responsive behavior, fejlstate, i18n og performance gentages inkonsistent i tusindvis af inline styles.

## 12. Positive fund

- Home er blevet en rigtig, skærmfyldende desktopoplevelse.
- Mobil har safe-area, `100dvh`, fast fempunktsnavigation og ingen horisontal overflow i det testede flow.
- Journey har tydelig CTA, loading, alert og resume-markering.
- Sprogvalg gemmes, og dokumentets `lang` opdateres.
- URL-state understøtter deep links til tab, kategori, coach, niveau og teknik.
- TypeScript strict mode er aktiv, og separat typecheck består.
- Firebase owner-read-regler er et brugbart fundament, når rolle- og feltvalidering strammes.
- Secrets er placeret server-side.
- Filnavne saniteres mod simpel path traversal.
- Gemini-timeout og OMR-timeoutcopy viser god retning for ærlige fejl.
- YouTube bruger privacy-enhanced embed-domænet.
- Designsproget er roligt og egnet til en voksen målgruppe; problemet er primært produktlogik og systemintegritet, ikke mangel på visuel identitet.

## 13. Krydstjek mod “Hvad dette ikke er”

Anbefalingerne ovenfor er bevidst filtreret mod `strategisk-brief.md:74-79` og `app-spec.md:157-159`.

| Fravalgt retning | Auditkonsekvens |
|---|---|
| Ikke et øvelsesbibliotek | Byg ikke flere filtre/tags som hovedsvar. Brug de 30 kuraterede øvelser som råmateriale til én guidet plan. |
| Ikke en videoplatform | Video er støtte i en konkret øvelse, ikke en ny indholdsfeed eller produktsøjle. |
| Ikke en trommesimulator | Rytmeboks/studio-kit er sekundært og helst åbnet med dagens tempo/øvelse som kontekst. |
| Ikke en professionel metronom | Prioritér timing, stabil audio og en enkel default frem for flere pro-kontroller. |
| Ikke socialt netværk | Ingen anbefaling kræver deling, leaderboard eller community før retention er bevist. |
| Ikke B2B | Admin/content-arbejdet handler om intern kuratering, ikke skolelicenser eller organisationsfunktioner. |

## 14. Anbefalet rækkefølge

Roadmappens RICE-rækkefølge er relevant, men sikkerhed og dataintegritet skal lægges foran som release gates.

### Trin 0 — stop launch-risiko

1. Luk admin- og premium-eskalering i Firestore.
2. Beskyt og rate-limit alle API-ruter.
3. Fjern falsk OMR-succes og demo-tal fra produktfladen.
4. Slå lint/typecheck/test/build til som ufravigelige gates.

### Trin 1 — byg én autoritativ lærerrejse

1. Beslut én niveau- og freemiummodel.
2. Gør `/prototype` til canonical route og konsolider landing/auth/onboarding.
3. Definér én versioneret content-, plan- og progressionsmodel.
4. Integrér AI-planen med aktuelt curriculum og dagens konkrete handling.
5. Gør completion → XP/streak → næste øvelse → cloud sync atomisk og synlig.

### Trin 2 — gør indholdet sandt

1. Kuratér og publicér mindst 30 reelle øvelser gennem et serverbeskyttet repository.
2. Giv hver øvelse læringsmål, instruktion, beståelseskriterium og næste skridt.
3. Versionér content og AI-prompts for da/en/de/es.
4. Vis kun faktiske counts, tider og progression.

### Trin 3 — færdiggør mobilproduktet

1. Luk a11y, kontrast, dialog/fokus og mobile overlap.
2. Feature-flag prototypeværktøjer væk.
3. Implementér Capacitor, native auth/deep links/push og audio scheduling.
4. Udvid derefter desktop-workspaces uden at flytte fokus fra mobilen.

## 15. Launch-kriterier

Pocket Drummer er klar til release-kandidat, når følgende kan demonstreres i en ren testkonto:

- Brugeren gennemfører ét sammenhængende landing → auth → onboarding → dagens øvelse-flow.
- Serveren vælger en valideret plan fra det aktuelle, publicerede curriculum.
- Completion kan ikke dobbeltbelønnes og synkroniserer næste aktivitet, XP og streak på tværs af enheder.
- Ingen klient kan selv ændre adminrolle eller premiumstatus.
- Alle AI/content-ruter kræver korrekt token/claim og håndhæver kvoter.
- AI- og XML-output fejler lukket ved ugyldige schemas; fallbacks er synligt markerede.
- Mindst 30 kuraterede øvelser findes og count vises fra samme repository.
- Hele den valgte sprogversion består screen-by-screen browsertest.
- Mobilnavigation, preview-controls og dialogs har ingen overlap og kan bruges med tastatur/skærmlæser.
- Lint, typecheck, tests og production build består i CI uden ignore-flags.
- Capacitor/native lifecycle, auth, deep links, push og audio er afprøvet på fysisk iOS- og Android-enhed.

## Konklusion

Pocket Drummer har nu en troværdig visuel retning og flere af de rigtige råkomponenter. Den korteste vej til et stærkt produkt er ikke at bygge mere bredde. Det er at gøre én rejse sand, sikker og sammenhængende: **én plan, én dagens handling, én completion-model og ét ærligt bevis på fremgang.**
