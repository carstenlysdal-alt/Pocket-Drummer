# Pocket Drummer — UI/Teknisk Audit

**Udført:** Maj 2026
**Metode:** Impeccable audit · Kodebase-analyse
**Scope:** `src/app/page.tsx` (1.842 linjer) + `src/app/prototype/page.tsx` (2.475 linjer)

---

## Audit Health Score

| # | Dimension | Score | Kritisk fund |
|---|-----------|-------|--------------|
| 1 | Accessibility | 1/4 | Næsten nul ARIA i 1.842 linjer |
| 2 | Performance | 2/4 | Monolitisk fil, ingen code splitting |
| 3 | Responsive Design | 1/4 | Fast 1440×900 canvas, ingen produktion på mobil |
| 4 | Theming | 2/4 | Token-system eksisterer men kun i JS, ikke CSS |
| 5 | Anti-Patterns | 3/4 | Distinkt design, få slop-tegn |
| **Total** | | **9/20** | **Poor — significant work needed** |

---

## Anti-Patterns Verdict

Klarer sig bedre end gennemsnittet for AI-genererede apps. macOS-vindue-chrome er et bevidst valg (men er nu besluttet erstattet), orange accent (#EF5A3A) er konsistent, ingen gradient text. Svage punkter: `linear-gradient` i card (linje 205) og radiale spotlight-gradienter brugt som utanktsom atmosfære. Ingen glassmorphism, ingen hero-metric template. **Består AI-slop-testen med forbehold.**

---

## Detaljerede fund

### P1 — Skal fixes inden launch

**[P1] Ikonknapper uden aria-label**
- Placering: Hele `page.tsx` — traffic lights, coach-toggle, theme-toggle, send-knap, sidebar-nav
- `DesktopIcons.tsx` eksporterer SVG-ikoner uden `aria-hidden`, og alle kald-sites mangler `aria-label`
- WCAG: 4.1.2 Name, Role, Value (AA)
- Fix: `aria-label` på alle ikonknapper. `aria-pressed` på toggle-knapper.

**[P1] Range-inputs uden label**
- Placering: BPM-slider (linje 847), mixer-sliders (linje 940, 949), tempo-slider (linje 1297)
- WCAG: 1.3.1 Info and Relationships (AA)
- Fix: `<label htmlFor>` eller `aria-label` + `aria-valuetext` på alle range-inputs.

**[P1] Søgeinput og coach-input mangler label**
- Placering: Søgefelt (linje 165), coach-input (linje 397)
- Inputfelter identificeres kun via placeholder — forsvinder ved fokus
- WCAG: 1.3.1, 3.3.2
- Fix: Visually-hidden `<label>` eller `aria-label`.

**[P1] Monolitisk page.tsx (1.842 linjer)**
- Hele appen loader i ét bundle ved første sidevisning
- Studio, Exercises, Coach, Checkout er alle i samme fil
- Fix: `dynamic(() => import(...), { ssr: false })` for StudioView, ExercisesView og CheckoutModal.

**[P1] `useFitScale` resize-lytter uden debounce**
- Placering: `page.tsx` linje 108–120
- `setState` køres på hvert enkelt resize-pixel — potentielt 100+ renders per sekund
- Fix: Wrap `calc` i `requestAnimationFrame` eller debounce på 100ms.

### P2 — Næste pas

**[P2] Token-system i JS, ikke CSS custom properties**
- `mkT()` funktion gennemgående i `page.tsx`
- Temaet kan ikke bruges i CSS, media queries eller pseudoklasser
- SSR og hydration-mismatch-risiko ved dark-mode
- Fix: Eksportér tokens som CSS custom properties via `:root` og `[data-theme="dark"]`.

**[P2] Hardkodede farver uden for token-system**
- `'#050505'` (linje 1770), `rgba(239,90,58,...)` 8+ steder
- Fix: Alle farver gennem `t.*`-tokens.

**[P2] Ingen produktionsklar mobiloplevelse**
- Alle mobilbrugere sendes til `/prototype`
- Blokerer hele mobilsegmentet ved launch
- Fix: Løft mobilprototype til produktion (se roadmap).

### P3 — Polering

**[P3] Radiale spotlight-gradienter som atmosfære**
- Placering: Linje 473, 1257
- Ubegrundede — bruges som standard baggrundsudfyldning
- Fix: Behold ét, fjern det andet — eller giv dem et funktionelt formål.

**[P3] `coachOpen` defaulter til `true`**
- Placering: `page.tsx` linje 1664
- Coach-panelet åbner automatisk ved app-load
- Fix: Default til `false`.

---

## Systemiske problemer

1. **Nul ARIA-attributter på ikoner** på tværs af hele kodebasen — systematisk, ikke enkelttilfælde.
2. **Inline styles i stedet for CSS** gennemgående i begge page-filer (4.317 linjer samlet). Umuliggør `:focus-visible`, `@media (prefers-reduced-motion)`, `@media (prefers-color-scheme)`.
3. **Alt i to filer** — ingen komponentbibliotek, ingen deling af logik mellem desktop og mobil.

---

## Positive fund

- **Token-arkitekturen er solid.** `T`-interfacet og `mkT()` er et rent fundament — let at migrere til CSS custom properties.
- **`useFitScale` er elegant.** Skaleringslogikken er ren og løser fixed-canvas problemet korrekt.
- **Fallback-strategi på AI-kald.** Alle DeepSeek-kald har lokale fallbacks — appen fungerer uden API-nøgle.
- **Temaet er konsistent.** Orange accent, mørk baggrund og serif-typografi holdes igennem hele appen.
- **Ingen glassmorphism, ingen gradient text.**

---

## Anbefalede kommandoer (prioriteret)

1. `/impeccable harden` — ARIA-labels på alle ikonknapper og inputs
2. `/impeccable optimize` — Code splitting + debounce på resize-lytter
3. `/impeccable extract` — Migrer token-system til CSS custom properties
4. `/impeccable adapt` — Løft mobilprototype til produktionsklar stand
5. `/impeccable distill` — Ryd dekorative gradienter op
6. `/impeccable polish` — Final quality pass inden launch
