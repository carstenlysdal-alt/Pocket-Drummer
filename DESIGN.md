---
name: Pocket Drummer
description: Personlig trommelæringsplatform med AI-coach og strukturerede øvelsesplaner
colors:
  snare-red: "#F25545"
  snare-red-deep: "#C43425"
  snare-red-soft: "#F2554521"
  streak-emerald: "#5dd39e"
  streak-emerald-soft: "#5dd39e24"
  bg-deep: "#0a0a0a"
  bg-sidebar: "#0e0e10"
  surface: "#141416"
  surface-raised: "#1c1c1f"
  surface-elevated: "#212124"
  text-primary: "#FAF8F5"
  text-muted: "#8a8580"
  text-dim: "#56524c"
  border-subtle: "#FFFFFF0F"
  border-strong: "#FFFFFF21"
typography:
  display:
    fontFamily: "DM Serif Display, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 400
    fontStyle: "italic"
    lineHeight: 1.05
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "10.5px"
    fontWeight: 700
    letterSpacing: "1.8px"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "12px"
  lg: "18px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "36px"
  xxl: "44px"
components:
  button-primary:
    backgroundColor: "{colors.snare-red}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.snare-red-deep}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "12px 22px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "12px 22px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-accent:
    backgroundColor: "{colors.snare-red-soft}"
    textColor: "#f5b8a8"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-success:
    backgroundColor: "{colors.streak-emerald-soft}"
    textColor: "{colors.streak-emerald}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-neutral:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: Pocket Drummer

## 1. Overview

**Creative North Star: "The Coach's Notebook"**

Dette er ikke en app der prøver at underholde. Det er et arbejdsredskab for nogen der mener det alvorligt: annoteret, struktureret, levende. Tænk på en erfaren musikers notesbog — indbinding er slidt, marginer er fulde af præcise observationer, fremskridt er synlige og håndgribelige. Alt i dette system tjener den bruger der sidder med trommesættet foran sig og vil vide nøjagtigt hvad de skal øve i dag.

Mørkt tema er det eneste rigtige valg her. Brugeren øver derhjemme, ofte i svagt belyste rum, med instrumentet som det eneste lyspunkt. Skærmen er et redskab i periferien — ikke noget man kigger på i fuld belysning. Det mørke tema reducerer øjentæthed under øvesessioner og giver Snare Red og Streak Emerald deres rette gennemslagskraft mod dyb baggrund.

Systemet er personligt uden at være legende. Seriøst uden at være koldt. Serif-kursiv til greetings og kategorinavne giver det handskrevne notat-kvalitet. Monospace til data (BPM, XP) giver præcision. Alt imellem er Inter: neutral, pålidelig, ud af vejen.

**Key Characteristics:**
- Mørk som et øverum klokken 22, ikke mørk som et SaaS-dashboard
- Snare Red bruges kun til handling — aldrig som dekoration
- Serif-kursiv markerer personlige og motiverende momenter
- Fire fontroller med tydeligt hierarki; aldrig mere end to på samme flade
- Fremskridt er altid synlige; brugeren ved altid præcist hvor de er
- Ingen glassmorphism, ingen neon, ingen gradientfyld på tekst

## 2. Colors: The Notebook Palette

Et monokromt mørkt fundament med to signalfarver: Snare Red til handling og momentum, Streak Emerald til fremskridt og achievement. Resten er neutrale toner der lager med hinanden.

### Primary
- **Snare Red** (`#F25545`): Accentfarven. Bruges på alle primære handlingsknapper, aktive nav-elementer, streaks og interaktive tilstande. Dens tilstedeværelse på skærmen signalerer "tryk her" eller "du har opnået noget." Begrænset til maks. 10% af enhver flade.
- **Snare Red Deep** (`#C43425`): Hover- og focus-tilstand for Snare Red. Aldrig brugt som primær farve, kun som state-transition.
- **Snare Red Soft** (`rgba(242,85,69,0.13)`): Subtil baggrundstone til aktive kort og valgte elementer. Genkendelig som Snare Red, men tilbagetrukket.

### Secondary
- **Streak Emerald** (`#5dd39e`): Successfarven. Forbeholdt genuint positive tilstande: fuldførte øvelser, aktive streaks, premium-status. Den optræder aldrig dekorativt.
- **Streak Emerald Soft** (`rgba(93,211,158,0.14)`): Baggrundstone til success-badges og premium-indikatorer.

### Neutral
- **Canvas Deep** (`#0a0a0a`): Appens dybeste baggrund. Aldrig ren sort — tintingen mod brand-huet er minimal men til stede.
- **Sidebar Night** (`#0e0e10`): Sidebarens baggrund. Et trin lysere end Canvas Deep; dybdeforskel skabes tonalt, ikke med skygge.
- **Surface** (`#141416`): Primær kortbaggrund. Det niveau brugeren ser mest.
- **Surface Raised** (`#1c1c1f`): Sekundær overflade: inaktive chips, badge-baggrunde, sekundære kortlag.
- **Surface Elevated** (`#212124`): Brugt sparsomt til elementer der skal hæves visuelt inden for en eksisterende flade.
- **Text Primary** (`#FAF8F5`): Varm hvid med minimal tinting — aldrig ren `#ffffff`.
- **Text Muted** (`#8a8580`): Sekundær tekst, labels, subtitles.
- **Text Dim** (`#56524c`): Tertiær tekst, ikoner i hvile, ikke-aktive elementer.
- **Border Subtle** (`rgba(255,255,255,0.06)`): Standardkant på kort og flader.
- **Border Strong** (`rgba(255,255,255,0.13)`): Kant på fokuserede og hæveede elementer.

### Named Rules
**The Snare Red Rule.** Snare Red er brugt på maks. 10% af enhver given skærm. Dens sjældenhed er pointen. Hvis alt er rødt, er intet rødt.

**The Tonal Depth Rule.** Dybde skabes ved at stable `bg-deep` → `bg-sidebar` → `surface` → `surface-raised` → `surface-elevated`. Ingen skygge kræves for at etablere et hierarki.

## 3. Typography

**Display Font:** DM Serif Display, italic (fallback: Georgia, serif)
**Headline Font:** Outfit (fallback: sans-serif)
**Body Font:** Inter (fallback: system-ui, sans-serif)
**Mono Font:** JetBrains Mono (fallback: ui-monospace, monospace)

**Character:** Display er the Coach's handwriting: kursiv, let kondenseret, personlig. Outfit er den trykte overskrift i notesbogen. Inter er brødteksten. JetBrains Mono er tallene i marginen: BPM, XP, lektionsnumre.

### Hierarchy

- **Display** (400, italic, 28-48px, line-height 1.05, letter-spacing -0.5px): Personlige greetings, kategoritnavne på forsiden, hero-momenter. Aldrig til UI-labels eller knapper.
- **Headline** (700, 18-24px, line-height 1.2, letter-spacing -0.02em): Sektionsoverskrifter, kortoverskrifter, sidebar-brandnavn.
- **Body** (400-600, 13-14px, line-height 1.6): Al løbende tekst, beskrivelser, coach-beskeder. Maks. linjelængde 65ch.
- **Label** (700, 10.5px, letter-spacing 1.8px, uppercase): Sektionsnavne (`DAGENS ANBEFALING`, `DIN FREMGANG`). Altid versaler, altid Inter.
- **Mono** (500, 10-11px, line-height 1.4): BPM-værdier, XP-tal, taktangivelser, niveaubadges. Bruges kun til tekniske data.

### Named Rules
**The Two-Font Rule.** Aldrig mere end to fontfamilier aktive på samme flade på én gang. Display + Mono er tilladt (greeting + BPM). Display + Label er tilladt. Label + Mono er tilladt. Display + Headline + Mono er for meget.

**The Serif-Only-For-Moments Rule.** DM Serif Display bruges udelukkende til brugerpersonlige momenter og kategorinavne. Aldrig til knapper, aldrig til fejlbeskeder, aldrig til systemtekst.

## 4. Elevation

Systemet bruger tonal lagdeling som sin primære dybdemarkør — ikke skygger. Overgangen fra `bg-deep` (#0a0a0a) til `surface-elevated` (#212124) er fem distinkte trin, nok til at etablere et komplet hierarki uden en eneste shadow-property.

Skygger optræder udelukkende som svar på tilstand eller accent-elementer:

### Shadow Vocabulary
- **Accent glow** (`0 6px 22px rgba(239,90,58,0.30)`): Primær knap, hviletilstand. Giver Snare Red en svag udstråling der markerer dens prioritet.
- **Accent glow strong** (`0 6px 20px rgba(239,90,58,0.40)`): Primær knap, hover. En tydelig men ikke dramatisk stigning.
- **Modal ambient** (`0 10px 15px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.05)`): Checkout-modal og overlay-elementer. Eneste sted et egentlig drop-shadow bruges.

### Named Rules
**The Flat-By-Default Rule.** Kort er flade ved hvile. De er adskilt fra hinanden via tonal forskel (border + baggrund), ikke skygge. En ny komponent der "har brug for" en skygge for at skille sig ud er typisk et signal om at layoutet er forkert, ikke at skyggen mangler.

## 5. Components

### Buttons
Den enerådende form er pille (border-radius: 9999px). Knapper er tillidsfulde og kompakte, aldrig overdimensionerede.

- **Primary:** Snare Red baggrund (`#F25545`), hvid tekst, 12px 22px padding (medium), glow-shadow `0 6px 22px rgba(239,90,58,0.30)`. Hover: deep coral (`#C43425`) + translateY(-2px).
- **Secondary:** Surface-raised baggrund (`#1c1c1f`), text-primary tekst, 1px border (borderStrong). Hover: let opacitetsforøgelse + translateY(-2px).
- **Ghost:** Transparent baggrund, text-primary tekst, ingen border. Bruges til tertiære handlinger.
- **Størrelsesvarianter:** sm (7px 16px, 11px), md (12px 22px, 12px), lg (15px 28px, 13px). Teksten er altid uppercase, letter-spacing 1.4-1.8.

### Chips / Tags
- **Standardchip:** Surface-raised baggrund, 1px border (subtle), pill-shape (full). Uvalgt: text-muted. Valgt: snare-red-soft baggrund, border = snare-red, tekst = accent-warm.
- **Filter-chip:** Samme form, bruges i kategori-views til at filtrere øvelser.

### Cards / Containers
Kort er den primære byggesten, men bruges kun til logisk afgrænsede indholdsenheder — aldrig som generisk wrapper.

- **Corner Style:** 18px radius (hardcoded i Card-komponenten; ikke variabel).
- **Background:** `surface` (`#141416`).
- **Border:** 1px `border-subtle` i hvile; `border-strong` ved fokus eller aktiv tilstand.
- **Shadow:** Ingen. Dybde via tonal kontrast.
- **Internal Padding:** Default 24px. Varierer: 16px (kompakte kort), 28px (hero-kort).
- **TiltCard:** Visse kort er wrappedet i TiltCard (3D-tilt ved hover). Bruges sparsomt til fremhævede handlingskort.

### Inputs / Fields
- **Style:** Mørk baggrund (`rgba(15,17,26,0.6)`), 1px border-subtle, radius 12px (--border-radius-md).
- **Focus:** Border skifter til snare-red + box-shadow `0 0 0 3px rgba(239,90,58,0.20)`.
- **Labels:** Inter 13px, 500 weight, text-muted.
- **Placeholder:** Text-dim.

### Navigation (Sidebar)
- **Width:** 240px fast.
- **Background:** `bg-sidebar` (`#0e0e10`).
- **Nav-item hviletilstand:** Transparent baggrund, text-primary tekst, text-muted ikon.
- **Nav-item aktiv:** Snare-red-soft baggrund, snare-red tekst og ikon, lille rød prik til højre.
- **Typografi:** Inter 13.5px, weight 450 (inaktiv) / 600 (aktiv).
- **Auth-sektion (ikke-logget):** Primær CTA "Opret konto" i Snare Red, sekundær "Log ind" med border.

### Progress Bar
- **Height:** 5-6px standard.
- **Background track:** `surface-raised` (`#1c1c1f`).
- **Fill:** Snare Red (`#F25545`). Streak Emerald (`#5dd39e`) når der refereres til success-metrics.
- **Animation:** width 0.4s ease.
- **Shape:** Fully rounded (border-radius: 999) på track og fill.

### Badges
Tre toner med faste semantiske roller:
- **Accent:** Snare-red-soft baggrund, `#f5b8a8` tekst. Bruges til premium og accent-kategorier.
- **Success:** Streak-emerald-soft baggrund, streak-emerald tekst. Bruges til "Begynder"-badge og fuldførte elementer.
- **Neutral:** Surface-raised baggrund, text-muted tekst. Standard, ingen semantisk ladning.

### Accordion (Kategori-øvelser)
Signaturkomponent til øvelselisten i Grooves og Play-along.

- **Lukket tilstand:** Knap-header med rundt ikon-felt (snare-red-soft), titler, højrejusteret badge + BPM + chevron.
- **Åben tilstand:** Header skifter til surface-raised baggrund, border får borderStrong, chevron roterer 90°. Body vises nedenunder med 16px padding.
- **Ét element åbent ad gangen:** Forrige element lukker ved klik på nyt.

## 6. Do's and Don'ts

### Do:
- **Do** brug Snare Red (`#F25545`) udelukkende til handlingsknapper, aktive navigationsmarkeringer og streaks. Aldrig som dekorativ accent.
- **Do** brug DM Serif Display italic til greetings og kategoritnavne. Det er the Coach's handwriting.
- **Do** lav dybde med tonal lagdeling (`bg-deep` → `surface` → `surface-raised`). Skygger er forbeholdt knap-glow og modaler.
- **Do** hold tekst under 65ch per linje i brødtekst.
- **Do** skriv labels i uppercase med Inter 10.5px og 1.8px letter-spacing. Aldrig andet format til sektionstitler.
- **Do** brug Streak Emerald (`#5dd39e`) til genuint positive tilstande. Streak-indikatorer, fuldførte øvelser, premium. Aldrig dekorativt.
- **Do** brug JetBrains Mono udelukkende til tekniske data: BPM, XP, takter, niveaunumre.
- **Do** hold border-radius på 18px for kort, 9999px for knapper og badges.

### Don't:
- **Don't** brug glassmorphism dekorativt. Blur og glass-effects er anti-referencer for dette projekt.
- **Don't** brug gradient-tekst (`background-clip: text`). Aldrig. Brug en enkelt solid farve.
- **Don't** brug side-stripe borders som accent (`border-left` eller `border-right` over 1px i farvet accent).
- **Don't** brug overdreven gamification: badges for alt, animerede confetti, neon-belønningsflows.
- **Don't** lav iden kort-grid (ikon + heading + tekst gentaget identisk). Brug accordions, fliser med forskellig vægt eller listeformater.
- **Don't** brug generisk SaaS-design: hero-metrik-skabeloner (stor tal, lille label, gradient accent) er forbudte.
- **Don't** brug neon-on-black. Snare Red er varm og coral, ikke neon. Mørkt baggrundstema er nødvendigt, men aldrig i kombination med glødende lyseffekter.
- **Don't** eksponér interne implementeringsdetaljer i UI-kopi (f.eks. model-navne som "Claude 3.5 Haiku").
- **Don't** placer ikke-funktionelle UI-elementer (knapper uden handler, ikonet med rød prik uden tilstand). Falske affordances bryder tillid.
