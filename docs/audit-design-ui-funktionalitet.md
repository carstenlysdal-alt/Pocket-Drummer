# Pocket Drummer — Design, UI og funktionalitet: Audit

**Dato:** 2026-05-27
**Metode:** Impeccable audit (teknisk kvalitetstjek) + PM-review (strategisk alignment)
**Kildekode:** https://github.com/carstenlysdal-alt/Pocket-Drummer

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|---|---|---|
| 1 | Accessibility | 1/4 | `user-scalable=no` i viewport er WCAG-violation; ingen ARIA gennemgående |
| 2 | Performance | 2/4 | `useFitScale`-hook skalerer 1440×900-desktop til alle viewports — ikke responsivt |
| 3 | Responsive Design | 1/4 | Mobilvisning er en omdirigering til separat view, ikke ægte responsivt layout |
| 4 | Theming | 2/4 | CSS-variabler findes men bruges inkonsistent — hard-coded hex-værdier gennemgående |
| 5 | Anti-Patterns | 1/4 | Glassmorphism overalt, `bounce`-animation, gradient-knapper, 4 fontfamilier |
| **Total** | | **7/20** | **Poor — major overhaul needed** |

---

## Anti-Patterns Verdict

**Ja — dette ser AI-genereret ud.** Specifikke tells:

1. **Glassmorphism som default.** `backdrop-filter: blur(16px)` bruges på kort, modaler og paneler gennemgående — ikke sparsomt og målrettet, men som basisæstetik.
2. **Gradient-knapper.** Primary CTA bruger gradient-baggrund. Dekorativt, ikke meningsfuldt.
3. **`bounce`-keyframe** er eksplicit defineret i globals.css og i brug. Bounce og elastic er absolutte forbudte animationer.
4. **Fire fontfamilier.** Inter + Outfit + DM Serif Display + JetBrains Mono. JetBrains Mono bruges ikke meningsfuldt (ingen kode vises til brugeren). DM Serif Display er inkonsistent med det øvrige sans-serif-identitet.
5. **Brand-navn inkonsistens.** Splash-screen: "DRUMM." — resten af appen: "Pocket Drummer". Klassisk AI-genereret roderi.

---

## Detaljerede fund

### P0 — Blocking

**[P0] `user-scalable=no` i viewport-meta**
- **Location:** `src/app/layout.tsx` — viewport metadata
- **Kategori:** Accessibility
- **Impact:** Brugere med synshandicap kan ikke zoome ind. Direkte WCAG 1.4.4-violation (Level AA). Afvises i App Store review.
- **WCAG:** SC 1.4.4 Resize Text
- **Anbefaling:** Fjern `user-scalable=no` og `maximum-scale=1` fuldstændigt. Design skal håndtere zoom, ikke blokere det.

**[P0] Brand-navn er forkert i onboarding**
- **Location:** `src/app/onboarding/page.tsx` — Step 0 splash
- **Kategori:** Anti-Pattern / Copy
- **Impact:** Første brugeroplevelse introducerer et forkert produktnavn. Ødelægger tillid og brandgenkendelse.
- **Anbefaling:** Erstat "DRUMM." med "Pocket Drummer" i splash-screen.

---

### P1 — Major

**[P1] `useFitScale` er ikke responsivt design**
- **Location:** `src/app/page.tsx` — `useFitScale` hook
- **Kategori:** Responsive Design / Performance
- **Impact:** Appen er bygget til 1440×900 og skaleres ned med CSS transform. På en telefon er alt minificeret, touch-targets krymper proportionelt og tekst er ulæselig uden zoom — som brugeren ikke kan aktivere (P0 ovenfor). Synergien er fatal.
- **Anbefaling:** Afbyg `useFitScale`. Design native breakpoints med `clamp()` og fluid typography. Start med mobil.

**[P1] Mobilvisning er en omdirigering — ikke responsivt layout**
- **Location:** `src/app/page.tsx`
- **Kategori:** Responsive Design
- **Impact:** To separate UI-kodebasar at vedligeholde. Divergerer med tiden. Brugeren oplever skift i UX afhængigt af device.
- **Anbefaling:** Konsolider til ét layout med mobile-first breakpoints.

**[P1] Ingen ARIA-labels på interaktive elementer i onboarding**
- **Location:** `src/app/onboarding/page.tsx`
- **Kategori:** Accessibility
- **Impact:** Skærmlæsere kan ikke formidle mål-tags, niveau-valg eller progress til synshandicappede brugere.
- **WCAG:** SC 4.1.2 Name, Role, Value
- **Anbefaling:** `aria-pressed` på toggle-tags, `<fieldset>/<legend>` om radiogrupper, `role="progressbar"` på step-indikator.

**[P1] Ingen synlige focus-states**
- **Location:** `src/app/globals.css` — mangler `:focus-visible` regler
- **Kategori:** Accessibility
- **Impact:** Tastaturbrugere har ingen visuel indikation af hvor fokus er. WCAG-violation.
- **WCAG:** SC 2.4.7 Focus Visible
- **Anbefaling:** Definér `outline: 2px solid #ef5a3a` på `:focus-visible` globalt. Brug aldrig `outline: none` uden alternativ.

**[P1] Drum pads mangler ARIA og minimum touch-targets**
- **Location:** `src/app/drumkit/page.tsx`
- **Kategori:** Accessibility + Responsive
- **Impact:** Pads har ingen `aria-label` eller `aria-pressed`. Størrelse er CSS-afhængig og krymper med `useFitScale` på mobil — sandsynligvis under 44×44px.
- **Anbefaling:** `aria-label="Snare, tryk S"`, `aria-pressed={isActive}`, `min-width: 44px; min-height: 44px` uanset skalering.

**[P1] `bounce`-animation er i brug**
- **Location:** `src/app/globals.css` — `@keyframes bounce`
- **Kategori:** Anti-Pattern / Performance
- **Impact:** Bounce-easing signalerer billig UI, ikke polish. Animerer sandsynligvis layout-properties.
- **Anbefaling:** Erstat med `ease-out-quart` eller `cubic-bezier(0.16, 1, 0.3, 1)`.

---

### P2 — Minor

**[P2] Fire fontfamilier**
- **Location:** `src/app/globals.css`
- **Kategori:** Performance + Anti-Pattern
- **Impact:** Ekstra netværksanmodninger. JetBrains Mono bruges ikke meningsfuldt. DM Serif Display skaber stilbrud.
- **Anbefaling:** Drop JetBrains Mono og DM Serif Display. Behold Inter + Outfit.

**[P2] Hard-coded hex-værdier ved siden af CSS-variabler**
- **Location:** `src/app/globals.css` gennemgående
- **Kategori:** Theming
- **Impact:** Farveændringer kræver søg-erstat i hele codebase i stedet for én token-opdatering.
- **Anbefaling:** Konsolider alle farver til CSS custom properties. Ingen `#0a0a0a` eller `#ef5a3a` direkte i regler.

**[P2] Glassmorphism som basisæstetik**
- **Location:** `src/app/globals.css` — `.glass-card`, modal, AI coach panel
- **Kategori:** Anti-Pattern
- **Impact:** Brugt dekorativt overalt, ikke sparsomt. Expensive på low-end mobile (`backdrop-filter`).
- **Anbefaling:** Reservér glassmorphism til max ét primært element pr. view. Erstat card-glassmorphism med solid `#1a1a1a` med subtle border.

**[P2] `pulseGlow`-animation**
- **Location:** `src/app/globals.css`
- **Kategori:** Performance
- **Impact:** Kontinuerlig keyframe-animation på `box-shadow` dræner batteri på mobil.
- **Anbefaling:** Brug `opacity`- eller `transform`-baseret puls i stedet.

**[P2] Dashboard redirecter til `/`**
- **Location:** `src/app/dashboard/page.tsx`
- **Kategori:** Anti-Pattern
- **Impact:** Ingen reel dashboard-view. Signalerer uferdig arkitektur.
- **Anbefaling:** Implementér et decideret dashboard-view eller fjern `/dashboard`-ruten.

---

### P3 — Polish

**[P3] Gradient-tekst på CTA**
- **Location:** `src/app/globals.css` — `.btn-primary`
- **Kategori:** Anti-Pattern
- **Anbefaling:** Solid hvid tekst på coral-orange baggrund.

**[P3] Scrollbar-styling mangler cross-browser**
- **Location:** `src/app/globals.css`
- **Anbefaling:** Tilføj `scrollbar-width: thin; scrollbar-color: #ef5a3a #1a1a1a;` for Firefox.

---

## Mønstre og systemiske problemer

**Responsivitet er arkitektonisk forkert.** `useFitScale` + mobilomdirigering er ikke en responsiv strategi — det er to separate apps. Kombineret med `user-scalable=no` er mobile brugere reelt låst ude fra en god oplevelse. Dette kræver en arkitektonisk beslutning, ikke et isoleret fix.

**Accessibility er ikke påbegyndt.** ARIA, focus-states og semantisk HTML er konsekvent fraværende på tværs af alle screens. Det er et mønster der indikerer at tilgængelighed aldrig har været en del af udviklingsprocessen.

**Token-disciplin mangler.** CSS-variabler er oprettet men bruges ikke konsistent. Design-systemet er halvt bygget.

---

## Positive fund

- **Coral-orange (#ef5a3a)** er en stærk og distinkt brandfarve — differentieret fra domain-reflex (tromme → sort/metal/neon).
- **Inter + Outfit** er et solidt typografisk par med klar hierarkisk forskel.
- **Tastaturshortcuts på drumkit** er en gennemtænkt power-user-feature.
- **Dansk `lang="da"`** i layout er korrekt sat.
- **Breakpoints eksisterer** (1024px, 968px, 768px, 640px) — fundamentet for ægte responsivt design er der.
- **Bottom navigation til mobil** er den rigtige arkitektoniske beslutning for en mobil-primær app.

---

## Anbefalede næste skridt (prioriteret)

1. **[P0] Harden** — Fjern `user-scalable=no`, ret brand-navn i onboarding
2. **[P1] Adapt** — Afbyg `useFitScale`, konsolider til mobile-first responsivt layout
3. **[P1] A11y-gennemgang** — ARIA på onboarding-form, drumkit-pads og focus-states globalt
4. **[P2] Distill** — Fjern to fontfamilier, konsolider glassmorphism, ryd token-rod
5. **[P2] Animate** — Erstat `bounce`/`pulseGlow` med korrekte ease-out-kurver
6. **[P3] Polish** — Afsluttende kvalitetspass
