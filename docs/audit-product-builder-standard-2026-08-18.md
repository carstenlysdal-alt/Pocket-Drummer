# Pocket Drummer — audit mod product-builder-standard

**Dato:** 18. august 2026

**Spørgsmål:** Ville Pocket Drummer bestå den research- og designdisciplin, som `product-builder`-skillet kræver, hvis produktet var bygget gennem skillet fra dag ét?

**Metode:** `strategisk-brief.md`, `roadmap.md`, `app-spec.md` og `PRODUCT.md` holdt op mod `research-standards.md` (evidenstaksonomi, kildekrav, valideringskrav). Den kørende app testet live i browser (desktop 1280px og mobil 375px, guest-mode på `/prototype`) holdt op mod `design-principles.md` (anti-generisk tjekliste, hierarki, konsistens, tilgængelighed).

**Forhold til tidligere audits:** Denne audit bekræfter uafhængigt størstedelen af fundene i [audit-koncept-og-kvalitet-2026-08-14.md](audit-koncept-og-kvalitet-2026-08-14.md) — fra en anden vinkel (produktstandard, ikke launch-readiness) — og tilføjer tre nye, konkret reproducerbare UI-fejl som ikke stod i den rapport.

## Executive verdict

**Produktet er ikke bygget med product-builder-disciplin. Det er bygget med produktbeslutninger først og evidens aldrig.**

Research-sporet fejler ikke på detaljer — det fejler på metode. Hver strategisk beslutning i `strategisk-brief.md` står som låst fakta uden en eneste Fact/Assumption-mærkning, uden kildehenvisning og uden et eneste dokumenteret valideringsforsøg. Design-sporet fejler mere konkret: den kørende app har to visuelt urelaterede brandsprog afhængigt af skærmstørrelse, og et flydende debug-element overlapper en aktiv login-knap på mobil.

| Spor | Ville bestå product-builder-standard? | Kernefund |
|---|---|---|
| Research-disciplin | Nej | Ingen evidenstaksonomi, ingen kilder, ingen valideringstest bag låste beslutninger |
| Design-disciplin | Nej | To brandsprog i samme app, overlappende UI-elementer, dokumenteret designsystem ikke implementeret |

## 1. Research-sporet: evidensdisciplin

`research-standards.md` kræver at ethvert ikke-trivielt claim mærkes **[Fact]**, **[Analysis]**, **[Assumption]** eller **[Unknown]**, at kilder er navngivne og efterprøvelige, og at load-bearing assumptions parres med hvad der ville bekræfte eller vælte dem. `strategisk-brief.md` markerer sig selv som "Besluttet" og præsenterer alt som låst — hverken segment, pris eller North Star er mærket.

| Beslutning i strategisk-brief.md | Reel evidensstatus | Hvad product-builder ville kræve |
|---|---|---|
| Segment: voksne 25–45 år, ingen tid/råd til lærer | **[Assumption]** — ingen interview, survey eller kildehenvisning i noget dokument | `customer-segments` eller `review-mining`: mindst ét datapunkt fra faktiske brugere, ikke kun formuleret persona |
| Drumeo: 249 kr./md, "overvældende, dyrt" | **[Assumption]** fremstillet som **[Fact]** — ingen dato, ingen kilde, ingen skærmbillede | `competitor-teardown`: sourcet pris med dato, fordi abonnementspriser ændrer sig |
| Privat lærer: 400–600 kr./time | **[Assumption]** — ingen kilde | Samme som ovenfor |
| Pris: 50 kr./md (penetration) | **[Assumption]** — ingen prisfølsomhedstest, ingen willingness-to-pay-data | `pricing-research`: mindst én cheap validation experiment (fx landing page-test af pris) før prisen låses |
| North Star: 30-dages retention | **[Analysis]** uden benchmark — intet tal for hvad "godt" retention ser ud for kategorien | `north-star-metric`: kræver validering mod de 7 kriterier og et branche-benchmark, ikke kun en formuleret ambition |
| Markedsstørrelse (dansk marked for trommeundervisning) | **[Unknown]** — findes slet ikke i noget dokument | `tam-sam-som`: aldrig kørt. Der er ingen sourcet vurdering af hvor mange potentielle brugere findes i Danmark |
| "Founding members trommer allerede i dag" (landing page-copy) | **[Unknown]** om der er reelle brugere bag claimet, eller om det er placeholder-copy | Social proof-copy skal være **[Fact]** eller fjernes — ellers er det præcis den type ærlig-copy-brud, `audit-koncept-og-kvalitet-2026-08-14.md` allerede flager som launch-blokerende andetsteds i produktet |

**Konsekvens:** Ingen af de låste beslutninger kan i dag skelnes fra et kvalificeret gæt. Det er ikke ensbetydende med at beslutningerne er forkerte — men product-builder-standarden ville have krævet mindst én billig valideringstest (prisside-eksperiment, 10 brugerinterviews, eller en Drumeo-pris med skærmbillede og dato) før noget blev markeret "låst". Intet af det findes.

## 2. Design-sporet: anti-generisk tjekliste og konsistens

Testet live på `localhost:3000` — landing (desktop), `/prototype` guest-mode (desktop 1280px), samme route (mobil 375px).

### 2.1 To brandsprog i samme produkt — ny fund

Desktop-landingsiden er lys (cremehvid baggrund, sans-serif, kortbaseret), rolig og godt disciplineret — tre niveaukort med tydelig hierarki, én primær CTA. Mobilens onboarding-skærm er en **helt anden visuel verden**: sort baggrund, glødende rød trommestik-line-art, stor kursiv serif-logotype, mikro-tracked versaltekst ("SPIL. ØV. UDVIKL DIG."). Ingen delt farvepalet, ingen delt typografi, ingen delt komponentsprog mellem de to skærmbilleder en almindelig bruger møder i samme brugerrejse (desktop-visning → mobil-onboarding).

Dette er selve definitionen af det `design-principles.md` kalder et konsistensbrud: "Reuse the same token or component for the same kind of decision everywhere it recurs." Her er det ikke en enkelt komponent — det er hele designsystemet, der skifter identitet med viewport. `app-spec.md` og `CLAUDE.md` beskriver ét designsystem (Snare Red kun til handling, mørkt tema som standard, DM Serif/Outfit/Inter/JetBrains Mono) — men det dokumenterede system er ikke det, brugeren faktisk møder konsekvent.

### 2.2 Flydende element overlapper aktiv CTA — ny fund, reproducerbar

På mobil (375×812, `/prototype` onboarding) overlapper en flydende "N"-avatar (FloatingCoach-komponenten) direkte "Har du allerede en konto? Log ind"-linket i bunden af skærmen. Linket er stadig teknisk klikbart (bekræftet via `read_page`), men visuelt delvist skjult af coach-widgeten. Det er ikke et overflow-problem (scrollWidth = viewport-width, ingen horisontal scroll) — det er et lag/z-index-problem: et sekundært hjælpeelement er placeret oven på en primær navigationshandling.

`design-principles.md`: "Icons used as decoration rather than functional wayfinding" og accessibility-baseline'ens krav om at enhver interaktiv handling skal være entydigt operabel — begge brydes her.

### 2.3 Prototype-artefakt tilbage i live-fladen

En flydende "Mobil / Desktop"-toggle-pille ligger ovenpå heroet på begge viewports. Det ligner et internt viewport-preview-værktøj efterladt i produktionskoden, ikke en brugervendt kontrol — der findes ingen forklaring på hvorfor en slutbruger skulle skifte mellem "Mobil" og "Desktop" manuelt, når appen allerede er responsiv. `CLAUDE.md`'s egen liste over kendte åbne punkter bekræfter mønstret: "Desktop UX skal videreudvikles: nuværende layout er funktionelt men ikke poleret."

### 2.4 Bekræftede fund fra 14. august — stadig til stede

Live-testen bekræfter at Home stadig konkurrerer mellem tre niveauer, en hardkodet "I dag"-anbefaling og fire ligestillede quick-tiles (Øvelser, Play-along, Rytmeboks, AI Coach) — præcis det mønster `audit-koncept-og-kvalitet-2026-08-14.md` allerede har markeret som "Én personlig 'øv dette i dag'-handling: Mangler · Release gate · P0". `design-principles.md`'s informationshierarki-regel ("One primary number or action per view") er stadig brudt.

"312 i biblioteket"-teksten er stadig synlig på Øvelser-tilen — bekræfter at det tidligere flagede ærlig-copy-brud ikke er lukket.

## 3. Hvad product-builder-processen ville have gjort anderledes

Havde Pocket Drummer været bygget gennem skillet fra start, ville rækkefølgen have været:

1. `customer-segments` + `review-mining` før segmentet blev låst — mindst ét sourcet datapunkt om den danske voksne begynder, ikke kun en formuleret persona.
2. `tam-sam-som` før North Star og forretningsmodel blev fastlagt — uden markedsstørrelse er 50 kr./md og "founding member"-strategien et gæt, ikke en beslutning.
3. `competitor-teardown` med daterede, sourcet priser for Drumeo og privatundervisning — ikke ucitrede tal i en tabel.
4. `demand-validation` med mindst ét billigt eksperiment og en defineret fail-tærskel, før "låst" blev skrevet i dokumentet.
5. `dashboard-blueprint` som fælles udgangspunkt for *både* desktop og mobil, med produktkarakteren ("rolig, kompetent, handlingsklar" fra `PRODUCT.md`) fastlagt først — det ville have forhindret at onboarding og desktop-landing endte i to forskellige visuelle systemer.
6. Anti-generisk tjekliste og accessibility-baseline som gate før merge — ville have fanget FloatingCoach-overlappet og "Mobil/Desktop"-artefaktet før de nåede en levende URL.

## Anbefaling

Ikke: gør produktet om. Strategien i `strategisk-brief.md` kan sagtens vise sig rigtig — men den står i dag som en påstand, ikke en undersøgt beslutning. To ting bør ske, uafhængigt af launch-arbejdet i 14. august-audittens P0-liste:

1. **Retrofit evidens på de tre tungeste låste beslutninger** — segment, pris, differentiering — med enten en kilde eller et billigt valideringsforsøg, før flere ressourcer bruges på at bygge oven på dem.
2. **Fjern de to prototype-artefakter** (FloatingCoach-overlap, Mobil/Desktop-toggle) og **saml de to visuelle sprog** til ét designsystem, der matcher det allerede dokumenterede i `app-spec.md`.
