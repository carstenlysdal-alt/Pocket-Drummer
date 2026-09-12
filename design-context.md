## CLAUDE.md
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

## css_guidelines.txt

--- Guide for css ---
# CSS: Modern Architecture and Performance

These guidelines provide a high-density reference for writing maintainable, performant, and standard-compliant CSS.

1. [1. Foundations](#1-foundations)
2. [2. Inheritance and The Cascade](#2-inheritance-and-the-cascade)
3. [3. Selectors and scoping](#3-selectors-and-scoping)
   1. [Prefer CSS selectors over JS for complex element targeting](#prefer-css-selectors-over-js-for-complex-element-targeting)
   2. [Use `:is()` (or `:where()`) instead of CSS rule duplication for fallbacks](#use-is-or-where-instead-of-css-rule-duplication-for-fallbacks)
   3. [Avoid overmatching](#avoid-overmatching)
   4. [Nesting and scoping](#nesting-and-scoping)
4. [4. Interactivity](#4-interactivity)
   1. [Focus management](#focus-management)
   2. [Touch targets](#touch-targets)
5. [5. Design Tokens and Theming](#5-design-tokens-and-theming)
   1. [Dark mode](#dark-mode)
   2. [Forced Colors Mode](#forced-colors-mode)
   3. [Generating tints](#generating-tints)
   4. [Theming browser-generated UI](#theming-browser-generated-ui)
6. [6. Responsive design](#6-responsive-design)
   1. [Responsive Typography](#responsive-typography)
7. [7. Typography](#7-typography)
   1. [Text wrapping](#text-wrapping)
8. [8. Visual effects](#8-visual-effects)
   1. [Depth and texture](#depth-and-texture)
   2. [Shapes](#shapes)
   3. [Gradients and `color-mix()`](#gradients-and-color-mix)
   4. [Patterns](#patterns)
9. [9. Transitions \& animations](#9-transitions--animations)
   1. [Performance](#performance)
   2. [Accessibility](#accessibility)
10. [10. Generated content](#10-generated-content)


## 1. Foundations

Be allergic to knowledge duplication. Prefer variables over repetition, but whenever possible, prefer built-in conventions such as:
- `currentColor` instead of defining a variable and setting `color` to it
- The `inherit` keyword instead of defining a variable on the parent and using it on the same property across parent and child.
- `em` units instead of `font-size: var(--size)`
- `cqw`/`cqh` (or their logical versions — `cqi`/`cqb`) units instead of repeating box model values.
- Code duplication is not knowledge duplication. The goal is robustness and maintainability, not saving characters.
- Prefer **logical properties and values** over physical ones (e.g. `margin-inline-start` instead of `margin-left`) so that styles adapt to different writing modes and orientations. Even if the page author does not plan to localize, external translation tools often display translated text in context.
- Do not use logical properties indiscriminately — ask yourself "would I want this to flip in RTL?" — if the answer is no, use the physical property instead.
- Consider different viewing modes (dark mode, high contrast mode), different viewport sizes, and different input modes (touch, keyboard, pointer).

## 2. Inheritance and The Cascade

**Avoid** introducing BEM naming conventions to manage specificity.
Instead, use modern CSS features such as cascade layers and `:where()` to make cascade behavior predictable and follow author intent.

Use cascade layers (`@layer`) to define explicit priority zones (e.g., `reset`, `base`, `theme`, `components`, `utilities`), and declare their order upfront (e.g. `@layer reset, base, theme, components, utilities;`).
Within each layer, use `:where()` to make selectors only compete based on meaningful signals, not incidental filters (`:not()` edge cases, remote ancestors, etc.) or for one-off easily overridable defaults.

Use keywords like `inherit`, `initial`, `unset`, or `revert` instead of explicit values to improve maintainability and better express intent.
Examples:
- When specifying a transition on a child that should match the parent's `transition-*` properties, instead of repeating the transition properties on the child, use `transition: inherit` (reduce duplication, improve maintainability)
- Use `initial` to reset a property to its initial value instead of specifying the value explicitly (clearer expression of intent)

## 3. Selectors and scoping

Modern browser-native selectors reduce the need for preprocessors and complex state-tracking in JS.

### Prefer CSS selectors over JS for complex element targeting

- **DO** use `:has()` to style parents based on child state instead of managing classes in JS (e.g. `label:has(:checked)` instead of a manual `label.has-checked` class) For more information, see the guides at `child-state-based-styling` (via `npx -y modern-web-guidance@latest retrieve "child-state-based-styling"`) and `content-based-styling` (via `npx -y modern-web-guidance@latest retrieve "content-based-styling"`).
- **DO NOT** nest `:has()` or use pseudo-elements inside it (browser API limitation)
- Use `:nth-child(<An+B> of <selector>)` when you need to style every n-th element of a certain type. E.g. `details:nth-child(1 of [open])` will style the first open `<details>` element it finds, whereas `details[open]:first-child` would style only the first child if and only if it was open.

### Use `:is()` (or `:where()`) instead of CSS rule duplication for fallbacks

**DO NOT** duplicate CSS rules to provide fallbacks for pseudo-classes that may not be supported — use `:is()` or `:where()` instead and take advantage of their forgiving parsing rules.

```css
/* BAD: duplicate rules instead of using `:where()` */
[popover]:popover-open {
  /* styles for native popovers */
}
[popover].\:popover-open {
  /* same styles again, for polyfilled popovers */
}

/* GOOD */
[popover]:where(:popover-open, .\:popover-open) {
  /* same styles in one rule */
}
```

Do NOT use this for pseudo-elements, as they are not supported in `:is()` or `:where()`.

### Avoid overmatching

Write selectors in a way that expresses _intent_.

#### Use `:not()` instead of overrides to exclude irrelevant states/targets

When the intent is to exclude certain states or elements that are fundamentally irrelevant, use `:not()`.

For example, to apply bottom borders between list items, don't do this:

```css
.fancy-list li {
  border-bottom: 1px solid silver;
}

.fancy-list li:last-child {
  border-bottom: none;
}
```

This can unintentionally overwrite a desirable `border-bottom` set from another rule.
The actual intent was to only apply the bottom border to the non-last `li`s. The code above is a workaround that poorly expresses this intent. Instead, this expresses intent more clearly:

```css
.fancy-list li:not(:last-child) {
  border-bottom: 1px solid silver;
}
```

Similarly, don't do this:

```css
button:hover {
  background: var(--color-blue);
}

button:disabled {
  background: var(--color-neutral);
}
```

If we reorder the two rules, we will get a hover background on disabled buttons!
Instead, do this:

```css
button:hover:not(:disabled) {
  background: var(--color-blue);
}

button:disabled {
  background: var(--color-neutral);
}
```

This works regardless of reordering, as the first rule does not overmatch.

#### Prefer `@scope` over `:not()` for excluding (potentially deeply nested) subtrees

While `:not()` + descendant selectors can exclude subtrees, this works poorly for deeply nested structures.
For example, `.card :not(.content *)` will not work as expected for nested cards.
`@scope` fixes this as it takes hierarchical proximity into account:

```css
@scope (.card) to (.content) {
  /* styles for elements inside .card but not inside .content */
}
```

This will work as expected even for nested cards.

#### Overrides are fine for specialization

This is fine:

```css
button {
  background: var(--color-neutral);
}

button.primary {
  background: var(--color-blue);
}
```

Both rules express legitimate _intent_: buttons are generally neutral, but primary ones are blue.

#### No global resets

**DO NOT** use global resets (styles on `*`) as they cannot be overridden by web components or lower-priority cascade layers (without `!important`). Instead, apply reset styles to specific element types and/or conditions.

### Nesting and scoping

Use native CSS nesting to group related styles to the extent it improves maintainability and readability.

Prefer `@scope` over nesting when proximity should matter more than pure specificity. This is common in selectors that can be nested in any order, but the closest matching one (in element -> ancestor order) should win, e.g. theming classes.

For example this will not work as expected:
```css
.dark .invert { color-scheme: light }
.light .invert { color-scheme: dark }
```

If `.invert` is nested within _both_ `.dark` and `.light`, it will always resolve to dark mode as both rules have the same specificity.
Using `@scope` fixes this:

```css
@scope (.dark) {
  .invert { color-scheme: light }
}

@scope (.light) {
  .invert { color-scheme: dark }
}
```

## 4. Interactivity

### Focus management

- Use `:focus-visible` to define custom focus rings, not `:focus`.
- Do not remove the browser's default focus rings (via `outline: none`) without providing an alternative visible focus style.
- Prefer `outline` over other properties (e.g. `box-shadow`) for focus rings. If you must rely on `box-shadow` for focus rings, provide an `outline`-based fallback for High Contrast Mode using the `forced-colors` media query.
- Pair focus outlines with `outline-offset` to visually separate the ring from the element.

### Touch targets

- Interactive elements should be at least 24×24 CSS pixels (WCAG 2.5.8 AA). Enforce with `min-block-size` / `min-inline-size` or padding rather than `width` / `height`, so content can grow the target but not shrink it.
- Bump targets up on coarse pointers: `@media (pointer: coarse) { ... }`.
- **DON'T** use `touch-action: none` for custom gestures — it disables page scrolling through the element. Scope to the axis you actually need: `pan-y` for horizontal swipes (page still scrolls vertically), `pan-x` for vertical ones. Reserve `none` for elements where no native touch behavior makes sense (e.g. a drawing canvas).

## 5. Design Tokens and Theming

Use CSS custom properties on `:root` to define core design variables (colors, fonts, sizes, etc) used throughout the design, for visual consistency and to scale UI design across teams.
**DO NOT** specify nontrivial styling values inline. E.g. `background: transparent` or `padding: 0` is ok, but `background: #f06` or `padding: .3em` are not.
One exception is use cases where keeping code small and simple is far more important than long-term maintainability and evolution, such as testcases.

Typically these are organized in tiers, with each tier building upon the previous one. For example:
1. Tier 1: Literal design tokens (e.g. `--color-blue-10`, `--color-gray-90`, `--font-sans-serif`, `--size-xl` etc)
2. Tier 2: Semantic design tokens (e.g. `--color-accent`, `--color-neutral`, `--font-body`, `--font-heading` etc)
3. Tier 3: General UI design tokens (e.g. `--ui-border`, `--surface-bg-subtle` etc)
4. Tier 4: Component-specific design tokens (e.g. `--button-bg-primary-hover`, `--button-border-color-secondary` etc)

The smaller the scope of the use case, the fewer tiers it needs. E.g. a quick demo or toy app are fine with one tier. Do not overengineer.
Check for any existing conventions around naming and levels before inventing your own.

### Dark mode

- Use `color-scheme: light dark` on `:root` to enable dark mode support that automatically adapts to the system setting. You can also specify `color-scheme` on individual elements to force a different value for that subtree (`light`/`dark` or `light dark` for the system default)
- Use `light-dark()` to provide alternatives that automatically resolve based on the element's `color-scheme`.
Typically this happens in Tier 2 or Tier 3 tokens.
- IMPORTANT: When using `light-dark()` on an inherited `<color>` property, it will resolve to a specific color based on that element's `color-scheme` and inherit as that resolved color, not as a `light-dark()` value. It will NOT adapt to any descendant-specific `color-scheme` overrides. To keep `light-dark()` color tokens dynamic resolve them as late as possible by only passing them around as unregistered custom properties and avoid relying on inherited color values across `color-scheme` boundaries.

See `dark-mode` (via `npx -y modern-web-guidance@latest retrieve "dark-mode"`) for tips & best practices on supporting dark mode switching and `component-specific-light-dark-theme` (via `npx -y modern-web-guidance@latest retrieve "component-specific-light-dark-theme"`) for more on applying different `color-scheme` modes than the page-wide setting on certain elements.

### Forced Colors Mode

In Forced Colors Mode (High Contrast on Windows), the browser overrides author colors with system keywords and strips `background-image`, `box-shadow`, and `border-image`.

- Define system color fallbacks for color tokens using `@media (forced-colors: active)`.
- **DON'T** rely on `background-image`, `box-shadow`, or `border-image` to convey borders, separators, or state — they disappear in forced colors (and often in print too). If you must, ensure there's an alternative in forced colors mode, such as `outline` or `border` with system color keywords (`CanvasText`, `LinkText`, `ButtonText`, `Highlight`, `GrayText`, etc.).
- Use `forced-color-adjust: none` where color is essential information (syntax highlighter, color picker swatch). **DON'T** use `forced-color-adjust: none` just to preserve aesthetics.


### Generating tints

Before generating tints dynamically, check if you can use an existing, predefined, design token. This allows much more designer control and ensures consistency.

If you need to generate lighter or darker colors dynamically:
- **DO NOT** just adjust the lightness channel in `oklch`/`oklab` or `lch`/`lab`, e.g. `oklab(from var(--primary) 0.9 a b)`. While that is theoretically the correct way, browsers do not yet implement gamut mapping, so the resulting color is unpredictable.
- You can use `color-mix()` to mix with white or black (preferably in `oklab`). This keeps the color safely in gamut, but tends to over-desaturate colors and produce washed out tints and shades.
- You MAY combine lightness adjustment with any of the other methods (e.g. `color-mix(in oklab, oklch(from var(--primary) 0.9 c h), white 30%)`) for a balance between the two, but avoid going above 30% for the lightness adjustment.

### Theming browser-generated UI

Most browser-generated UI can be customized to some extent using CSS.
Even if it requires modern features, it degrades gracefully in older browsers, and thus often does not require a polyfill or fallback.

Before re-creating browser UI (form controls, scrollbars, selections, error messages, etc), first verify that:
1. the browser UI cannot be customized enough for your needs, even with modern CSS,
2. the desired customization is sufficiently critical to justify the tradeoffs of re-creating built-in UI — most notably losing accessible semantics, keyboard handling, IME, and AT integration that the native UI provides for free.

Example customizations that are possible:
- Use `::selection` to customize highlighted text colors.
- **DON'T** apply `user-select: none` to content text — breaks copy-paste, translation tools, and AT "read from here" gestures. Limit it to chrome (drag handles, toolbars, redundant button labels).
- Use `accent-color` to apply the page's accent color to any browser-generated UI.
- Use `color-scheme` to have browser UI adapt to light/dark mode.
- Use `scrollbar-color` to customize scrollbar colors and `scrollbar-width` to control scrollbar thickness — keep the thumb visibly distinct from the track (≥3:1), and don't set `scrollbar-width: none` on scrollable regions (use it only when scrolling is fully replaced by another affordance).
- Use `:user-invalid` / `:user-valid` for validity styling, **not** `:invalid` / `:valid` — they only match after the user has interacted with the field, avoiding the hostile default of flagging required-empty fields as errors on page load.
- Buttons and text fields (including `<textarea>`) can generally be styled as normal elements.
- Use `font-size` to scale and other textual properties to control typography

#### Styling textual fields (`<input>` & `<textarea>`)

For most styling purposes (e.g. colors, borders, backgrounds, typography, etc) treat these elements as normal text containers.

- Use `:placeholder-shown` and `::placeholder` to style input placeholders.
- Use `field-sizing: content` to make text fields size to content.
- For `<textarea>` elements, use `resize: vertical` to disable horizontal resizing or `resize: none` to disable all resizing.

#### Multiple choice controls (select, radios, checkboxes)

- To select one among many options presented in a dropdown: Use a `<select>` + `appearance: base-select` + `::picker(select)`. For more info see `branded-select-styling` (via `npx -y modern-web-guidance@latest retrieve "branded-select-styling"`)
- Selecting one or more among multiple options laid out inline in the page: Use a `<input type=checkbox>` or `<input type=radio>` inside a `<label>` for each option. Style via `label:has(:checked)`.
- Style checkboxes, radios and switches via `appearance: none` + generated content (`::before`/`::after`) or background images to draw the checked state.
<!-- Customizable select listbox version currently buggy + this has much better browser support -->

#### Non-textual `<input>`s (buttons, sliders, file inputs etc.)

- File inputs: Use `::file-selector-button` to style the button.
- Do not use `<input>` with a `type` of `button`, `submit` or `reset`. Use `<button>` instead and style it as a regular element.
- Sliders: Use `appearance: none` + thumb pseudo-elements (`::-webkit-slider-thumb`, `::-moz-range-thumb`, etc) and track pseudo-elements (`::-webkit-slider-runnable-track`, `::-moz-range-track`, etc) for more granular control.

## 6. Responsive design

- Use `@container` queries to create component-driven responsive layouts that adapt to their parent container's size rather than the viewport.
- Use dynamic viewport units (`dvh`, `dvw`) instead of `vh`/`vw` to prevent layout breakage when mobile browser UI elements (like address bars) appear or disappear.
- Use `aspect-ratio` for media elements (like `<img>` and `<video>`) to reserve space during loading and prevent Cumulative Layout Shift (CLS).

### Responsive Typography

- **DO** combine viewport-relative and font-relative units in `clamp()` for font sizes that scale with the viewport size while ensuring they stay within a desired range. For example, `clamp(2rem, 1rem + 5vw, 4rem)`. Adjust the proportion of viewport-relative and font-relative units to control how quickly the font-size changes.
- **DON'T** use `vw` alone for font-size without `clamp()`, as it can scale text too small or too large on extreme screens.

## 7. Typography

- Use unitless numbers for `line-height` (e.g., `1.5`) to ensure relative scaling during font-size inheritance.
- Use `overflow-wrap: break-word` (or `anywhere`) to contain long URLs.
- **DON'T** use `px` for font-size. Prefer `rem` to honor the user's browser font-size preferences (root font size), or `em` for contextual sizing.

### Text wrapping

- Use `text-wrap: balance` for balanced headlines and headline-like content (e.g. `<th>`)
- Use `text-wrap: pretty` for long-form body text (paragraphs, blockquotes, etc.)
- Use `text-wrap: balance` or `text-wrap: pretty` deliberately, **DO NOT** apply it on `*` as it does have a performance cost.
- Avoid `text-wrap: balance` on elements with a visible box (backgrounds, borders, shadows, etc) as it does not change the container's width, it only affects how text wraps *within* that width. This can leave empty space at the end of the container, which is usually undesirable.

## 8. Visual effects

### Depth and texture

- Layer multiple shadows for realistic soft depth effects.
- Use `filter: drop-shadow()` instead of `box-shadow` for non-rectangular shapes or transparent PNGs.
- Use `mix-blend-mode` and `background-blend-mode` for lighting overlays (limit scope with `isolation: isolate`)

```css
.hero {
  background-image: url('texture.png'), linear-gradient(to bottom, #fff, #eee);
  background-blend-mode: soft-light;
}
```

### Shapes

- Use `corner-shape: squircle` for more aesthetically pleasing curves as a progressive enhancement over regular rounded corners.
- Use elliptical `border-radius` (e.g., `10px / 20px`) for proportional curves without extra elements.

### Gradients and `color-mix()`

Use `in oklch` or `in oklab` to explicitly specify the interpolation color space for gradients or `color-mix()`.
- `in oklch` preserves chroma better, but can more easily get out of device gamut, especially for bigger differences between colors
- `in oklab` stays in gamut more easily (assuming in-gamut endpoints) but can create washed out desaturated colors in the middle, especially when interpolating between opposite hues.
- *DON'T* use `in srgb` unless you have a specific reason to do so (e.g. you are building a color picker that needs to interpolate in srgb).

#### Fallback

Some pre-2024 browsers do not support gradient color interpolation space.
To support these browsers, use the token only when its usage is safe by defining a variable:

```css
:root {
  --in-oklab: ;
  --in-oklch: ;
}

@supports (linear-gradient(in oklab, white, black)) {
  :root {
    --in-oklab: in oklab;
    --in-oklch: in oklch;
  }
}
```

Then use like:

```css
.card {
  background: linear-gradient(to bottom var(--in-oklab), var(--accent-color), var(--darker));
}
```

- **Important:** If you use this technique, make sure there is always a non-empty gradient preamble without it, otherwise it will be a syntax error in older browsers.
- You do NOT need this for `color-mix()`. If a browser supports `color-mix()`, it also supports its `in <color-space>` argument.

### Patterns

Many patterns can be created via CSS gradients + hard stops, and these can be more flexible and performant than SVGs or external images as they can have access to CSS variables and lengths from the surrounding context.
You don't need to repeat the position twice — just use `0` or `0%` and gradient fixup will auto-adjust it.

Examples below.

Vertical stripes of `1em` width each:

```css
background: linear-gradient(to right, var(--color-1) 50%, var(--color-2) 0) 0 / 2em;
```

Diagonal stripes of `1em` width each:

```css
background: repeating-linear-gradient(-45deg, var(--color-1) 0 1em, var(--color-2) 0 2em);
```

Checkerboard pattern with `1em` squares:

```css
background: repeating-conic-gradient(var(--color-1) 0 25%, var(--color-2) 0 50%) 0 / 2em 2em;
```

Polka dot with `.5em` radius dots spaced `2em` apart (horizontally/vertically — multiply by `sqrt(2)` for diagonal distance):

```css
--distance: 2em;
--radius: .5em;
--polka: radial-gradient(circle, var(--color-1) var(--radius), transparent calc(var(--radius) + 1px));
background: var(--polka) 0 0, var(--polka) var(--distance) var(--distance) var(--color-2);
background-size: calc(var(--distance) * 2) calc(var(--distance) * 2);
```

Simple pie chart:

```css
.pie {
  --p: 80%;
  width: 60px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: conic-gradient(var(--color-1) var(--p), transparent 0%) var(--color-2);
}
```

**Important:** When using gradients to render charts, ensure there is a textual fallback for screen readers. MANDATORY: You MUST provide a semantic data table as an accessible alternative, as detailed in `accessibility` (via `npx -y modern-web-guidance@latest retrieve "accessibility"`) under the alternate text and media guidelines.

## 9. Transitions & animations

- Use `clip-path` and `mask-image` for custom geometric reveals and smooth fade-outs.
- Use **Scroll-Driven Animations** (`animation-timeline: scroll()`) for non-essential scroll-bound effects instead of JS listeners.
- Use **View Transitions** to animate between complex layout states seamlessly.

### Performance

Rendering performance is critical for smooth user experiences, especially in heavy DOM trees.

- Prefer to animate `opacity` and `transform` (including individual transform properties, e.g. `translate` instead of `left/right/top/bottom`) to ensure animations stay on the compositor thread.
- Use `transition-behavior: allow-discrete` + `@starting-style` to animate layout properties like `display` or `<dialog>` state natively.
- Always pair `content-visibility` with `contain-intrinsic-size` to prevent scrollbar jumps (CLS).
- When setting `contain-intrinsic-size` use the `auto` keyword and a value that’s derived from what is known about the contents (i.e. text size, spacing, size of graphics, character count). Preferably use units such as `rem`, `lh`, `cap`, or `ch` that match values used for the elements within the contents rather than `px`. If the content for items in a group is not consistently sized, then use an average size.
- Use `contain: layout style paint` to isolate component rendering updates.

#### Code Example: Render Optimization

```css
.large-section {
  content-visibility: auto;
  contain-intrinsic-block-size: auto 800px;
}

.row {
  --row-gap: .4rem;
  --title-height: 1lh;
  --description-height: 0.85lh;

  display: grid;
  row-gap: var(--row-gap);
  content-visibility: auto;
  /* The sum of the title height, row gap, and description height should be the size of the contents when skipped for rendering. */
  contain-intrinsic-block-size: auto calc(var(--title-height) + var(--row-gap) + var(--description-height));
}

.popover-reveal {
  /* Allow discrete animations for display transitions */
  transition: display 0.2s allow-discrete;
}
```

### Accessibility

Use `prefers-reduced-motion` media queries to turn off heavy motion for users who prefer it.

**DO NOT** globally apply `animation-duration: 0.01ms;` globally as it can cause certain animations to become _more_ jarring.
Either apply reduced motion versions on a case by case basis, or use a custom property like:

```css
@property --animation-reduced {
  syntax: "*";
  inherits: false;
  initial-value: none;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: var(--animation-reduced) !important;
  }
}
```

Then, reduced motion versions can be kept together with the original animations:

```css
progress:not([value]) {
  animation: slide 1s infinite linear;
  --animation-reduced: slide 20s infinite linear;
}
```

## 10. Generated content

- **DON'T** use `content` to convey meaningful text (labels, state, instructions) — keep that in the DOM (WCAG F87). The alt text argument is harm reduction for cases where decoration accidentally carries meaning, not a license.
- Use the alternative text argument of `content` to provide alt text for screen readers. E.g. `content: url(cloud.svg) / "Save";`
- Use `content: "text" / "";` to prevent purely decorative text from being announced to screen readers.
- **DON'T** use an empty alt text argument for images — they're already presentational by default. E.g. this is wrong: `content: url(cloud.svg) / "";`.
- **DON'T** use the alt text argument to describe emojis unless the description differs from the official emoji name. E.g. don't do `content: "🎉" / "celebration";`, but `content: "🎉" / "Yay!";` is fine.

**ONLY** use the alt text argument when the text is different than the primary value and is not already present in the DOM. I.e. this is wrong:

HTML:
```html
<button class="save">Save</button>
```

CSS:
```css
button.save::before {
  content: url(cloud.svg) / "Save";
}
```

A screen reader would read it out as "Save save".


## package.json
{
  "name": "pocket-drummer",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": "20"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "HOSTNAME=0.0.0.0 next start",
    "lint": "eslint"
  },
  "dependencies": {
    "firebase": "^12.13.0",
    "jspdf": "^2.5.2",
    "lucide-react": "^0.475.0",
    "next": "16.2.6",
    "opensheetmusicdisplay": "^1.8.8",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tone": "^15.0.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "firebase-tools": "^15.18.0",
    "typescript": "^5"
  }
}

## Mappestruktur: src/
  src/app/admin/page.tsx
  src/app/api/coach/route.ts
  src/app/api/generate-music/route.ts
  src/app/api/generate-plan/route.ts
  src/app/api/scan-sheet-music/route.ts
  src/app/api/transcribe-audio/route.ts
  src/app/dashboard/page.tsx
  src/app/drumkit/page.tsx
  src/app/exercise/[id]/page.tsx
  src/app/favicon.ico
  src/app/globals.css
  src/app/layout.tsx
  src/app/login/page.tsx
  src/app/onboarding/page.tsx
  src/app/page.tsx
  src/app/prototype/page.tsx
  src/components/DesktopIcons.tsx
  src/components/FloatingCoach.tsx
  src/components/Header.tsx
  src/components/OsmdRenderer.tsx
  src/components/RhythmHero.tsx
  src/components/TiltCard.tsx
  src/lib/ai.ts
  src/lib/authContext.tsx
  src/lib/curriculum.ts
  src/lib/firebase.ts
  src/lib/firestoreService.ts
  src/lib/gemini.ts
  src/lib/languageContext.tsx
  src/lib/mockData.ts
  src/lib/presetExercises.ts
  src/lib/transcriptionService.ts
  src/lib/translations.ts

## src/app/globals.css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}


:root {
  --bg-deep: #0a0a0a;
  --bg-dark: #121212;
  --bg-card: #1a1a1a;
  --bg-card-hover: #242424;
  --border-color: rgba(255, 255, 255, 0.05);
  --border-focus: rgba(239, 90, 58, 0.5);
  --border-glow: rgba(239, 90, 58, 0.15);
  
  --text-primary: #f8fafc;
  --text-secondary: #9ca3af;
  --text-muted: #52525b;
  
  --accent-purple: #ef5a3a; /* Coral Orange */
  --accent-purple-hover: #d94626;
  --accent-purple-glow: rgba(239, 90, 58, 0.35);
  
  --accent-cyan: #ff7d61; /* Light Coral */
  --accent-cyan-hover: #ef5a3a;
  --accent-cyan-glow: rgba(255, 125, 97, 0.35);
  
  --accent-emerald: #10b981;
  --accent-emerald-glow: rgba(16, 185, 129, 0.2);
  
  --accent-orange: #ef5a3a;
  --accent-rose: #f43f5e;
  
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-title: 'Outfit', sans-serif;
  --font-serif: 'DM Serif Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-glow: 0 0 20px rgba(239, 90, 58, 0.15);
  
  --border-radius-sm: 6px;
  --border-radius-md: 12px;
  --border-radius-lg: 20px;
  --border-radius-full: 9999px;

  /* Semantic Design Token Aliases */
  --color-accent: var(--accent-purple);
  --color-accent-hover: var(--accent-purple-hover);
  --color-accent-light: var(--accent-cyan);
  --color-accent-soft: var(--accent-purple-glow);
  --color-border: var(--border-color);
  --color-bg-deep: var(--bg-deep);
  --color-bg-dark: var(--bg-dark);
  --color-bg-card: var(--bg-card);
  --color-bg-card-hover: var(--bg-card-hover);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body {
  background-color: var(--bg-deep);
  color: var(--text-primary);
  font-family: var(--font-sans);
  min-height: 100vh;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

/* Focus visible — keyboard navigation */
:focus-visible {
  outline: 2px solid var(--accent-purple);
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg-deep);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--accent-purple);
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) var(--bg-deep);
}

/* Base Layout & Grid Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-title);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

p {
  line-height: 1.6;
  color: var(--text-secondary);
}

a {
  color: inherit;
  text-decoration: none;
  transition: var(--transition-fast);
}

/* App Header & Nav styling */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(8, 9, 13, 0.75);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition-normal);
}

.logo {
  font-family: var(--font-title);
  font-weight: 800;
  font-size: 1.6rem;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.95rem;
}
.nav-link:hover, .nav-link.active {
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* Glassmorphism & UI components */
.glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.glass-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: var(--shadow-lg), var(--border-glow);
}

.glass-card-purple {
  border-color: rgba(239, 90, 58, 0.35);
}
.glass-card-cyan {
  border-color: rgba(255, 125, 97, 0.35);
}
.glass-card-emerald {
  border-color: rgba(16, 185, 129, 0.35);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-title);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-normal);
}

.btn-primary {
  background: var(--accent-purple);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(239, 90, 58, 0.3);
}
.btn-primary:hover {
  background: var(--accent-purple-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(239, 90, 58, 0.4);
}
.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-accent {
  background: var(--accent-cyan);
  color: #08090d;
  font-weight: 700;
  box-shadow: 0 4px 14px 0 rgba(255, 125, 97, 0.3);
}
.btn-accent:hover {
  background: var(--accent-cyan-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(255, 125, 97, 0.4);
}

.btn-danger {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--accent-rose);
}
.btn-danger:hover {
  background: rgba(244, 63, 94, 0.2);
  border-color: var(--accent-rose);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: var(--border-radius-sm);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: var(--border-radius-full);
}
.badge-purple {
  background: rgba(139, 92, 246, 0.15);
  color: #c084fc;
  border: 1px solid rgba(139, 92, 246, 0.25);
}
.badge-cyan {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.25);
}
.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}
.badge-orange {
  background: rgba(249, 115, 22, 0.15);
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.25);
}

/* Forms */
.form-group {
  margin-bottom: 1.25rem;
}
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
.form-control {
  width: 100%;
  background: rgba(15, 17, 26, 0.6);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  outline: none;
  transition: var(--transition-fast);
}
.form-control:focus-visible {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(239, 90, 58, 0.2);
  outline: none;
}

/* Custom range input (brand-consistent-forms using accent-color) */
input[type="range"] {
  accent-color: var(--accent-purple);
  cursor: pointer;
}

/* Onboarding tags */
.tag-select {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.tag-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: var(--border-radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}
.tag-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}
.tag-btn.active {
  background: rgba(139, 92, 246, 0.15);
  border-color: var(--accent-purple);
  color: #c084fc;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.15);
}

/* Dashboard layouts */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Progress bar wrapper */
.progress-bar-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-full);
  height: 8px;
  width: 100%;
  overflow: hidden;
  margin: 0.5rem 0;
}
.progress-bar-fill {
  background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
  height: 100%;
  border-radius: var(--border-radius-full);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Calendar styling */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.calendar-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}
.calendar-toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: var(--transition-fast);
}
.calendar-toggle-btn.active {
  background: var(--bg-deep);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.calendar-week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
}
@media (max-width: 768px) {
  .calendar-week-grid {
    grid-template-columns: 1fr;
  }
}
.calendar-day-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: var(--transition-normal);
  cursor: pointer;
}
.calendar-day-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
}
.calendar-day-card.today {
  border-color: var(--accent-purple);
  background: rgba(139, 92, 246, 0.04);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.05);
}
.calendar-day-name {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
}
.calendar-day-card.today .calendar-day-name {
  color: var(--accent-purple);
}
.calendar-day-content {
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-primary);
}

/* Month view grid */
.calendar-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
  margin-top: 1rem;
}
.calendar-month-day {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 0.25rem 0.4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  font-size: 0.75rem;
}
.calendar-month-number {
  font-weight: 600;
  color: var(--text-muted);
}
.calendar-month-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 0 auto;
}

/* Interactive Practice Player layout */
.player-container {
  display: grid;
  grid-template-rows: auto 1fr;
  height: calc(100vh - 64px);
  overflow: hidden;
}

.player-main {
  display: grid;
  grid-template-columns: 4fr 3fr;
  height: 100%;
  overflow: hidden;
}
@media (max-width: 968px) {
  .player-main {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1.2fr;
  }
}

.video-section {
  background: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.youtube-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}
.youtube-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.notation-section {
  display: flex;
  flex-direction: column;
  background: var(--bg-dark);
  border-left: 1px solid var(--border-color);
  height: 100%;
  overflow: hidden;
}

.notation-header {
  padding: 1rem 1.5rem;
  background: rgba(15, 17, 26, 0.8);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notation-scrollable {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: #ffffff; /* OSMD renders nicely on light backgrounds */
  color: #111111;
  border-radius: 0 0 0 var(--border-radius-md);
  position: relative;
}

.tempo-controls-panel {
  padding: 1.25rem 1.5rem;
  background: rgba(15, 17, 26, 0.9);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  color: var(--text-primary);
}

.metronome-visualizer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.metronome-beat {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-color);
  transition: transform var(--transition-fast), background-color var(--transition-fast);
}
.metronome-beat.active {
  background: var(--accent-purple);
  transform: scale(1.3);
  box-shadow: 0 0 10px var(--accent-purple);
}
.metronome-beat.downbeat.active {
  background: var(--accent-cyan);
  box-shadow: 0 0 10px var(--accent-cyan);
}

/* Animations */
@keyframes pulseGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.pulse-border {
  animation: pulseGlow 2.5s infinite ease-in-out;
}

.grid-bg {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Pricing Grid */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 800px;
  margin: 3rem auto;
}

@media (max-width: 640px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(8, 9, 13, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-content {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

/* Admin Console layout */
.admin-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
@media (max-width: 968px) {
  .admin-grid {
    grid-template-columns: 1fr;
  }
}

/* Utility layout classes */
.flex { display: flex; }
.align-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 0.5rem; }
.gap-2 { gap: 1rem; }
.gap-3 { gap: 1.5rem; }
.flex-column { flex-direction: column; }
.w-full { width: 100%; }
.m-auto { margin: 0 auto; }
.text-center { text-align: center; }
.text-purple { color: var(--accent-purple); }
.text-cyan { color: var(--accent-cyan); }
.text-emerald { color: var(--accent-emerald); }
.text-muted-color { color: var(--text-muted); }
.cursor-pointer { cursor: pointer; }
.relative { position: relative; }
.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.p-2 { padding: 2rem; }
.p-3 { padding: 3rem; }

/* Custom Serif & Branding styles */
.text-serif-italic {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
}

.logo-brand {
  font-family: var(--font-title);
  font-weight: 800;
  letter-spacing: -0.05em;
  font-style: italic;
}

/* Bottom Navigation Bar for Mobile Feel */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: #0d0e12;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  padding: 0 1rem;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 500;
  transition: var(--transition-fast);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0.5rem;
}

.bottom-nav-item.active {
  color: var(--accent-purple);
}

.bottom-nav-item:hover {
  color: var(--accent-purple-hover);
}

/* Snare Drum Art styles */
.snare-art-container {
  display: flex;
  justify-content: center;
  margin: 2rem auto;
  position: relative;
  width: 200px;
  height: 200px;
}

/* Adjustment for content margin on screens with bottom-nav */
.content-has-bottom-nav {
  padding-bottom: 80px;
}

/* Virtual Drumkit styles */
.drumkit-container {
  position: relative;
  width: 100%;
  height: 380px;
  background: rgba(0,0,0,0.3);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  margin: 2rem 0;
}

.drum-pad {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #2a2c35, #15161a);
  border: 2px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.08s ease-out;
  user-select: none;
}

.drum-pad:active,
.drum-pad.active {
  transform: scale(0.95);
  border-color: var(--accent-purple);
  box-shadow: 0 0 15px rgba(242, 92, 61, 0.4);
}

.drum-pad .pad-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.drum-pad .pad-key {
  font-size: 0.65rem;
  font-family: monospace;
  font-weight: bold;
  color: var(--accent-purple);
  background: rgba(0, 0, 0, 0.4);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}

/* Pad Positions matching Screen 3/4 layout */
.pad-crash {
  top: 10%;
  left: 8%;
  width: 95px;
  height: 95px;
  background: radial-gradient(circle at 35% 35%, #d4af37, #8c6d12);
}
.pad-crash.active {
  box-shadow: 0 0 25px rgba(212, 175, 55, 0.6);
}

.pad-ride {
  top: 10%;
  right: 8%;
  width: 105px;
  height: 105px;
  background: radial-gradient(circle at 35% 35%, #c5a059, #7a5e30);
}
.pad-ride.active {
  box-shadow: 0 0 25px rgba(197, 160, 89, 0.6);
}

.pad-hihat {
  top: 38%;
  left: 12%;
  width: 85px;
  height: 85px;
  background: radial-gradient(circle at 35% 35%, #d1c295, #6c6347);
}
.pad-hihat.active {
  box-shadow: 0 0 20px rgba(209, 194, 149, 0.5);
}

.pad-tom1 {
  top: 15%;
  left: 30%;
  width: 85px;
  height: 85px;
}

.pad-tom2 {
  top: 15%;
  right: 30%;
  width: 85px;
  height: 85px;
}

.pad-floor {
  top: 48%;
  right: 12%;
  width: 100px;
  height: 100px;
}

.pad-snare {
  top: 48%;
  left: 30%;
  width: 95px;
  height: 95px;
  border: 3px double rgba(255, 255, 255, 0.2);
}

.pad-kick {
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 115px;
  height: 115px;
  border-radius: 12px;
  background: radial-gradient(circle at 50% 50%, #20222a, #0c0d10);
}
.pad-kick:active,
.pad-kick.active {
  transform: translateX(-50%) scale(0.96);
  border-color: var(--accent-purple);
  box-shadow: 0 0 20px rgba(242, 92, 61, 0.3);
}

@media (max-width: 768px) {
  .drumkit-container {
    height: 440px;
  }
  .pad-crash { top: 5%; left: 3%; width: 75px; height: 75px; }
  .pad-ride { top: 5%; right: 3%; width: 80px; height: 80px; }
  .pad-hihat { top: 32%; left: 5%; width: 70px; height: 70px; }
  .pad-tom1 { top: 16%; left: 24%; width: 70px; height: 70px; }
  .pad-tom2 { top: 16%; right: 24%; width: 70px; height: 70px; }
  .pad-floor { top: 50%; right: 5%; width: 85px; height: 85px; }
  .pad-snare { top: 50%; left: 24%; width: 80px; height: 80px; }
  .pad-kick { bottom: 5%; width: 95px; height: 95px; }
}

## src/components/DesktopIcons.tsx
import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  fill?: boolean;
  sw?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const Ic: React.FC<IconProps> = ({ size = 22, color = 'currentColor', children, fill = false, sw = 1.8, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);

export const IcHome: React.FC<IconProps> = (p) => <Ic {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></Ic>;
export const IcBook: React.FC<IconProps> = (p) => <Ic {...p}><path d="M4 4h7a3 3 0 0 1 3 3v13"/><path d="M20 4h-7a3 3 0 0 0-3 3v13"/><path d="M4 4v15h7"/><path d="M20 4v15h-7"/></Ic>;
export const IcSpark: React.FC<IconProps> = (p) => <Ic {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></Ic>;
export const IcUser: React.FC<IconProps> = (p) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Ic>;
export const IcPlay: React.FC<IconProps> = (p) => <Ic {...p} fill><path d="M7 4l13 8-13 8V4z" stroke="none"/></Ic>;
export const IcPause: React.FC<IconProps> = (p) => <Ic {...p} fill><rect x="6" y="4" width="4" height="16" rx="1" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" stroke="none"/></Ic>;
export const IcBack: React.FC<IconProps> = (p) => <Ic {...p}><path d="M15 5l-7 7 7 7"/></Ic>;
export const IcChev: React.FC<IconProps> = (p) => <Ic {...p}><path d="M9 5l7 7-7 7"/></Ic>;
export const IcChevDown: React.FC<IconProps> = (p) => <Ic {...p}><path d="M5 9l7 7 7-7"/></Ic>;
export const IcMore: React.FC<IconProps> = (p) => <Ic {...p}><circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></Ic>;
export const IcCheck: React.FC<IconProps> = (p) => <Ic {...p}><path d="M4 12l5 5L20 6"/></Ic>;
export const IcLock: React.FC<IconProps> = (p) => <Ic {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Ic>;
export const IcSun: React.FC<IconProps> = (p) => <Ic {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Ic>;
export const IcMoon: React.FC<IconProps> = (p) => <Ic {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></Ic>;
export const IcSend: React.FC<IconProps> = (p) => <Ic {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></Ic>;
export const IcPlus: React.FC<IconProps> = (p) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>;
export const IcMetro: React.FC<IconProps> = (p) => <Ic {...p}><path d="M9 3h6l3 18H6L9 3z"/><path d="M12 14L7 7"/></Ic>;
export const IcMic: React.FC<IconProps> = (p) => <Ic {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 12a7 7 0 0 0 14 0M12 19v3"/></Ic>;
export const IcTuner: React.FC<IconProps> = (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M12 12l4-6"/></Ic>;
export const IcVideo: React.FC<IconProps> = (p) => <Ic {...p}><rect x="3" y="6" width="14" height="12" rx="2"/><path d="M17 10l5-3v10l-5-3"/></Ic>;
export const IcFlame: React.FC<IconProps> = (p) => <Ic {...p}><path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s-1 6 4 6 4-4 4-6c0-4-4-7-4-7z"/></Ic>;
export const IcClock: React.FC<IconProps> = (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>;
export const IcTrophy: React.FC<IconProps> = (p) => <Ic {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M5 6H3v2a3 3 0 0 0 3 3M19 6h2v2a3 3 0 0 1-3 3"/><path d="M10 13v3h4v-3M8 20h8"/></Ic>;
export const IcBell: React.FC<IconProps> = (p) => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></Ic>;
export const IcLogout: React.FC<IconProps> = (p) => <Ic {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></Ic>;
export const IcWave: React.FC<IconProps> = (p) => <Ic {...p}><path d="M2 12h2l2-6 4 12 4-16 4 16 2-6h2"/></Ic>;
export const IcCalendar: React.FC<IconProps> = (p) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></Ic>;
export const IcAttach: React.FC<IconProps> = (p) => <Ic {...p}><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3 3 0 1 1 4 4l-9 9a1 1 0 0 1-2-2l8-8"/></Ic>;
export const IcLoop: React.FC<IconProps> = (p) => <Ic {...p}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></Ic>;
export const IcMin: React.FC<IconProps> = (p) => <Ic {...p}><path d="M5 12h14"/></Ic>;

export const TabHome: React.FC<IconProps> = ({ size = 24, color = 'currentColor', sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/>
  </svg>
);

export const TabPractice: React.FC<IconProps> = ({ size = 24, color = 'currentColor', sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
    <path d="M3 12 L5 8 L7 16 L9 6 L11 18 L13 7 L15 17 L17 9 L19 14 L21 12"/>
  </svg>
);

export const TabKit: React.FC<IconProps> = ({ size = 24, color = 'currentColor', sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
    <ellipse cx="8" cy="12" rx="4" ry="2"/>
    <ellipse cx="16" cy="10" rx="4" ry="2"/>
    <path d="M4 12v5M12 12v5M12 10v5M20 10v6"/>
  </svg>
);

export const TabUser: React.FC<IconProps> = ({ size = 24, color = 'currentColor', sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21a8 8 0 0 1 16 0"/>
  </svg>
);

interface DrumNotationProps {
  color?: string;
  width?: number;
  accent?: string;
  active?: number;
}

export const DrumNotation: React.FC<DrumNotationProps> = ({ color = '#f5f5f7', width = 340, accent = '#ef5a3a', active = 2 }) => {
  const top = 28, lineGap = 9;
  const lines = [0, 1, 2, 3, 4].map(i => top + i * lineGap);
  const W = width;
  const startX = 60;
  const endX = W - 18;
  const span = endX - startX;
  const xs = Array.from({ length: 8 }, (_, i) => startX + (span / 8) * (i + 0.5));

  return (
    <svg width={W} height={140} viewBox={`0 0 ${W} 140`} style={{ display: 'block' }}>
      {lines.map((y, i) => (
        <line key={i} x1={14} y1={y} x2={W - 6} y2={y} stroke={color} strokeOpacity="0.5" strokeWidth="1" />
      ))}
      <line x1={14} y1={lines[0]} x2={14} y2={lines[4]} stroke={color} strokeOpacity="0.6" strokeWidth="1.5" />
      <line x1={W - 6} y1={lines[0]} x2={W - 6} y2={lines[4]} stroke={color} strokeOpacity="0.6" strokeWidth="1.5" />
      <text x={22} y={lines[1] + 4} fill={color} fontSize="16" fontWeight="700" fontFamily="Georgia, serif">4</text>
      <text x={22} y={lines[3] + 4} fill={color} fontSize="16" fontWeight="700" fontFamily="Georgia, serif">4</text>

      {xs.map((x, i) => {
        const isActive = i === active;
        return (
          <g key={`hh-${i}`} opacity={isActive ? 1 : 0.85}>
            <path d={`M${x-4},${top - 12} L${x+4},${top - 4} M${x+4},${top - 12} L${x-4},${top - 4}`} stroke={isActive ? accent : color} strokeWidth="1.8" strokeLinecap="round"/>
          </g>
        );
      })}

      {[2, 6].map(i => {
        const x = xs[i];
        const isActive = i === active;
        return (
          <g key={`sn-${i}`}>
            <ellipse cx={x} cy={lines[2]} rx="5" ry="3.6" fill={isActive ? accent : color} transform={`rotate(-18 ${x} ${lines[2]})`}/>
          </g>
        );
      })}

      {[0, 4].map(i => {
        const x = xs[i];
        const isActive = i === active;
        return (
          <ellipse key={`kk-${i}`} cx={x} cy={lines[4] + 12} rx="5" ry="3.6" fill={isActive ? accent : color} transform={`rotate(-18 ${x} ${lines[4] + 12})`}/>
        );
      })}

      {xs.map((x, i) => (
        <line key={`stem-${i}`} x1={x + 4} y1={top - 8} x2={x + 4} y2={top - 28} stroke={color} strokeOpacity="0.8" strokeWidth="1.4"/>
      ))}
      {[0, 2, 4, 6].map(i => (
        <line key={`beam-${i}`} x1={xs[i] + 4} y1={top - 28} x2={xs[i + 1] + 4} y2={top - 28} stroke={color} strokeOpacity="0.8" strokeWidth="3"/>
      ))}

      {[0, 2, 4, 6].map((i, idx) => (
        <text key={`bn-${i}`} x={xs[i]} y={lines[4] + 36} fill={color} opacity="0.45" fontSize="11" fontFamily="ui-monospace, monospace" textAnchor="middle">{idx + 1}</text>
      ))}
    </svg>
  );
};

export const IllSnare: React.FC<IconProps> = ({ size = 280, color = '#ef5a3a', sw = 1.4 }) => {
  const W = size, H = size * 0.95;
  return (
    <svg width={W} height={H} viewBox="0 0 280 266" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="140" cy="220" rx="125" ry="22" opacity="0.18"/>
      <ellipse cx="140" cy="220" rx="95" ry="16" opacity="0.25"/>

      <line x1="60" y1="20" x2="170" y2="120" strokeWidth={sw + 0.6}/>
      <circle cx="60" cy="20" r="5"/>
      <line x1="220" y1="20" x2="110" y2="120" strokeWidth={sw + 0.6}/>
      <circle cx="220" cy="20" r="5"/>

      <ellipse cx="140" cy="142" rx="78" ry="16"/>
      <line x1="62" y1="142" x2="62" y2="200"/>
      <line x1="218" y1="142" x2="218" y2="200"/>
      <path d="M62 200 Q140 230 218 200"/>
      {Array.from({ length: 7 }).map((_, i) => {
        const x = 80 + i * 16.6;
        return <line key={i} x1={x} y1="138" x2={x} y2="150" opacity="0.7"/>;
      })}
      <line x1="62" y1="170" x2="218" y2="170" opacity="0.55"/>
      <line x1="62" y1="180" x2="218" y2="180" opacity="0.35"/>
    </svg>
  );
};

export const IllKit: React.FC<IconProps> = ({ size = 280, color = '#ef5a3a', sw = 1.3 }) => {
  const W = size, H = size * 0.72;
  return (
    <svg width={W} height={H} viewBox="0 0 320 230" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="50" cy="78" rx="34" ry="5"/>
      <line x1="50" y1="78" x2="50" y2="200" opacity="0.7"/>
      <line x1="40" y1="200" x2="60" y2="200"/>

      <ellipse cx="260" cy="50" rx="42" ry="6" transform="rotate(-10 260 50)"/>
      <line x1="260" y1="50" x2="270" y2="200" opacity="0.7"/>
      <line x1="262" y1="200" x2="282" y2="200"/>

      <ellipse cx="290" cy="105" rx="32" ry="5" transform="rotate(8 290 105)"/>

      <ellipse cx="120" cy="110" rx="26" ry="5"/>
      <path d="M94 110 v32 a26 5 0 0 0 52 0 v-32" />

      <ellipse cx="180" cy="110" rx="26" ry="5"/>
      <path d="M154 110 v32 a26 5 0 0 0 52 0 v-32" />

      <ellipse cx="150" cy="170" rx="62" ry="14"/>
      <path d="M88 170 v18 a62 14 0 0 0 124 0 v-18" />

      <ellipse cx="150" cy="172" rx="20" ry="4" opacity="0.6"/>

      <ellipse cx="65" cy="148" rx="22" ry="5"/>
      <path d="M43 148 v22 a22 5 0 0 0 44 0 v-22" />
      <line x1="43" y1="170" x2="87" y2="172" opacity="0.5"/>

      <line x1="65" y1="175" x2="50" y2="208" opacity="0.5"/>
      <line x1="65" y1="175" x2="80" y2="208" opacity="0.5"/>
    </svg>
  );
};

export const IllSticks: React.FC<IconProps> = ({ size = 80, color = '#ef5a3a', sw = 1.6 }) => {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <line x1="6" y1="8" x2="92" y2="50"/>
      <circle cx="6" cy="8" r="3"/>
      <line x1="94" y1="8" x2="8" y2="50"/>
      <circle cx="94" cy="8" r="3"/>
    </svg>
  );
};

interface RadialProgressProps {
  size?: number;
  pct?: number;
  color?: string;
  track?: string;
  sw?: number;
  label?: string;
  sublabel?: string;
  t?: { text?: string };
}

export const RadialProgress: React.FC<RadialProgressProps> = ({ size = 110, pct = 75, color = '#ef5a3a', track = 'rgba(255,255,255,0.08)', sw = 8, label, t }) => {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={sw} fill="none"/>
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth={sw} fill="none"
        strokeDasharray={c} strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      {label && (
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
              fill={t?.text || '#fff'} fontSize="22" fontWeight="700" fontFamily="ui-monospace, monospace">{label}</text>
      )}
    </svg>
  );
};

## src/components/FloatingCoach.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IcSpark, IcSend, IcMin, IcPlay } from '@/components/DesktopIcons';
import { useAuth } from '@/lib/authContext';

interface CoachAction {
  category: string;
  label: string;
  description: string;
}

interface ChatMessage {
  id: number;
  role: 'ai' | 'user';
  text: string;
  action?: CoachAction;
}

const ACCENT = '#EF5A3A';
const ACCENT_SOFT = 'rgba(239,90,58,0.12)';

export default function FloatingCoach() {
  const { user } = useAuth();
  const isPremium = user?.isPremium ?? false;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: 0, role: 'ai', text: 'Hej! Jeg er din personlige trommelærer.\n\nHvordan gik øvningen sidst — og hvad vil du arbejde med i dag?' },
  ]);
  const msgIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = async () => {
    if (!input.trim()) return;
    if (!isPremium && msgs.filter(m => m.role === 'user').length >= 2) return;
    const q = input.trim();
    setInput('');
    const userMsg: ChatMessage = { id: msgIdRef.current++, role: 'user', text: q };
    setMsgs(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const history = [...msgs, userMsg].slice(-12).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTyping(false);
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: data.message, action: data.action }]);
    } catch {
      setTyping(false);
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: 'Beklager, der opstod en fejl. Prøv igen.' }]);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Åbn AI Coach"
        style={{
          position: 'fixed', bottom: 28, right: 24, zIndex: 9999,
          width: 52, height: 52, borderRadius: '50%',
          background: ACCENT, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(239,90,58,0.45)',
        }}
      >
        <IcSpark size={22} color="#fff" />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      width: 340, height: 480, borderRadius: 16,
      background: '#111', border: '1px solid #2a2a2a',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <IcSpark size={15} color={ACCENT} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>AI Coach</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, background: ACCENT_SOFT, padding: '2px 7px', borderRadius: 999 }}>PRO</span>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}>
          <IcMin size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '9px 13px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? ACCENT : '#1e1e1e',
              color: '#fff',
              border: m.role === 'user' ? 'none' : '1px solid #2a2a2a',
              fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
            {m.role === 'ai' && m.action && (
              <button
                style={{
                  marginTop: 6, maxWidth: '82%', width: '100%', padding: '8px 12px',
                  borderRadius: 10, background: ACCENT_SOFT,
                  border: `1px solid ${ACCENT}40`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'system-ui, sans-serif', textAlign: 'left',
                }}
              >
                <IcPlay size={12} color={ACCENT} />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: ACCENT }}>{m.action.label}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{m.action.description}</div>
                </div>
              </button>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 4, padding: '9px 13px', background: '#1e1e1e', borderRadius: 14, width: 'fit-content', border: '1px solid #2a2a2a' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#666', animation: `dotPulse 0.8s ${i * 0.2}s infinite ease-in-out` }} />
            ))}
          </div>
        )}
      </div>

      {/* Chips */}
      <div style={{ padding: '6px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Timing-tip', 'Fills til begyndere', 'Ghost notes'].map(chip => (
          <button key={chip} onClick={() => setInput(chip)} style={{
            padding: '4px 10px', borderRadius: 999, background: '#1e1e1e',
            border: '1px solid #2a2a2a', fontSize: 11, color: '#888',
            cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
          }}>{chip}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px 14px', borderTop: '1px solid #2a2a2a' }}>
        {!isPremium && msgs.filter(m => m.role === 'user').length >= 2 && (
          <div style={{ marginBottom: 8, padding: '7px 11px', background: ACCENT_SOFT, borderRadius: 8, fontSize: 11, color: ACCENT }}>
            Opgrader til Premium for ubegrænset AI Coach adgang.
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Spørg din coach…"
            style={{
              flex: 1, background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 10,
              padding: '8px 12px', color: '#fff', fontFamily: 'system-ui, sans-serif',
              fontSize: 12.5, outline: 'none',
            }}
          />
          <button onClick={send} style={{
            width: 36, height: 36, borderRadius: 10, background: ACCENT, border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239,90,58,0.3)',
          }}>
            <IcSend size={15} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

## src/components/Header.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drum, Award, User } from 'lucide-react';
import { getPremiumStatus } from '@/lib/mockData';

export default function Header() {
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Update state asynchronously after hydration to avoid cascading renders
    const timer = setTimeout(() => {
      setIsPremium(getPremiumStatus());
    }, 0);
    
    const interval = setInterval(() => {
      setIsPremium(getPremiumStatus());
    }, 1000); // Poll status once per second to keep in sync for simple demo
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="app-header">
      <Link href="/" className="logo logo-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Drum size={28} style={{ color: 'var(--color-accent)' }} />
        <span>Pocket Drummer<span style={{ color: 'var(--color-accent)', fontStyle: 'normal' }}>.</span></span>
      </Link>
      
      <nav className="nav-links">
        <Link 
          href="/dashboard" 
          className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
        >
          Mit Dashboard
        </Link>
        <Link 
          href="/drumkit" 
          className={`nav-link ${pathname === '/drumkit' ? 'active' : ''}`}
        >
          Virtuelt Trommesæt
        </Link>
        <Link 
          href="/prototype" 
          className={`nav-link ${pathname === '/prototype' ? 'active' : ''}`}
        >
          Mobil Prototype
        </Link>
        <Link 
          href="/admin" 
          className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}
        >
          Admin Panel
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isPremium ? (
            <span className="badge badge-purple" style={{ gap: '0.25rem' }}>
              <Award size={14} /> Premium Medlem
            </span>
          ) : (
            <span className="badge badge-cyan">
              Gratis Plan
            </span>
          )}
          
          <Link href="/onboarding" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
            <User size={14} /> Skift Profil
          </Link>
        </div>
      </nav>
    </header>
  );
}

## src/components/OsmdRenderer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface OsmdRendererProps {
  xmlData: string;
  zoom?: number;
  currentMeasure: number; // 1-indexed
  onLoadStatus?: (loaded: boolean) => void;
}

export default function OsmdRenderer({ xmlData, zoom = 1.0, currentMeasure, onLoadStatus }: OsmdRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Ryd op i containeren først
    containerRef.current.innerHTML = '';
    setError(null);
    if (onLoadStatus) onLoadStatus(false);

    try {
      // Opret OSMD instans med optimal visning
      const osmd = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        backend: 'svg',
        drawTitle: false,
        drawSubtitle: false,
        drawComposer: false,
        drawMetronomeMarks: true,
        drawPartNames: false,
        coloringEnabled: true,
        cursorsOptions: [{
          type: 0, // standard streg
          color: '#f25c3d',
          alpha: 0.4,
          follow: true
        }]
      });

      osmdRef.current = osmd;

      osmd.load(xmlData).then(
        () => {
          if (!containerRef.current) return;
          
          osmd.render();
          
          // Vis cursor
          osmd.cursor.show();
          osmd.cursor.reset();
          
          if (onLoadStatus) onLoadStatus(true);
        },
        (err) => {
          console.error("OSMD loading error:", err);
          setError("Kunne ikke indlæse nodedata. Kontroller om MusicXML-strukturen er gyldig.");
        }
      );
    } catch (e: unknown) {
      console.error("OSMD creation error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setTimeout(() => {
        setError("Der opstod en fejl under oprettelse af nodemotoren: " + msg);
      }, 0);
    }

    return () => {
      osmdRef.current = null;
    };
  }, [xmlData, onLoadStatus]);

  // Håndter zoom ændringer
  useEffect(() => {
    const osmd = osmdRef.current;
    if (osmd && osmd.Sheet) {
      osmd.Zoom = zoom;
      osmd.render();
    }
  }, [zoom]);

  // Håndter cursor position synkronisering
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !osmd.cursor) return;

    try {
      osmd.cursor.reset();
      
      // Flyt cursor frem til den ønskede takt (1-indexed)
      // Bemærk: osmd.cursor.next() flytter typisk pr. slag eller nodegruppe.
      // For en 4/4 takt er der ca. 4 slag pr takt.
      // Her er en simpel løkke, der flytter cursoren frem:
      const currentC = osmd.cursor;
      
      // Da cursor.next() går et slag frem, kan vi estimere placering eller bare loope
      // For at synkronisere præcist til takter, kan vi tjekke hvilken takt cursoren står i:
      // osmd.cursor.iterator.CurrentMeasureIndex er 0-indexed.
      const targetIndex = currentMeasure - 1; // 0-indexed mål
      
      let attempts = 0;
      while (
        currentC.iterator && 
        currentC.iterator.CurrentMeasureIndex < targetIndex && 
        attempts < 100
      ) {
        currentC.next();
        attempts++;
      }
    } catch (e) {
      console.warn("Fejl ved flytning af cursor:", e);
    }
  }, [currentMeasure, xmlData]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
      {error && (
        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(244,63,94,0.1)', 
          border: '1px solid rgba(244,63,94,0.2)', 
          color: '#f43f5e', 
          borderRadius: '8px', 
          fontSize: '0.9rem',
          margin: '1rem' 
        }}>
          {error}
        </div>
      )}
      <style>{`
        #osmd-svg-container text,
        #osmd-svg-container tspan {
          font-family: var(--font-serif, 'DM Serif Display', Georgia, serif) !important;
        }
        #osmd-svg-container .osmd-title,
        #osmd-svg-container .osmd-subtitle {
          font-family: var(--font-serif, 'DM Serif Display', Georgia, serif) !important;
          font-style: italic;
        }
      `}</style>
      <div
        ref={containerRef}
        id="osmd-svg-container"
        style={{
          width: '100%',
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)',
        }}
      />
    </div>
  );
}

## src/components/TiltCard.tsx
'use client';

import React, { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  maxTilt?: number; // max tilt degrees, default 10
}

export default function TiltCard({ children, style = {}, className = '', onClick, maxTilt = 10 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg) scale(1)');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate within element
    const y = e.clientY - rect.top;  // y coordinate within element
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = x - xc;
    const dy = y - yc;
    
    // Calculate rotation: maps to degree range [-maxTilt, maxTilt]
    const rX = -(dy / yc) * maxTilt;
    const rY = (dx / xc) * maxTilt;
    
    setTransform(`perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.025)`);

    // Glare position
    const percentageX = (x / rect.width) * 100;
    const percentageY = (y / rect.height) * 100;
    setGlareStyle({
      background: `radial-gradient(circle at ${percentageX}% ${percentageY}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 85%)`,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform,
        transition: 'transform 0.12s ease-out, box-shadow 0.12s ease-out',
        transformStyle: 'preserve-3d',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: transform.includes('0deg') ? 'none' : '0 15px 35px rgba(0, 0, 0, 0.35)',
        ...style
      }}
      className={className}
    >
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: style.borderRadius || '18px',
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'opacity 0.15s ease-out',
          ...glareStyle
        }}
      />
      <div style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d', height: '100%', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}

## src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pocket Drummer · Trommeøve-platform med AI-læringsplaner",
  description: "Pocket Drummer er en dansk abonnementsplatform for trommespillere. Få personlige AI-genererede læringsplaner, interaktive trommenoder og PDF-download.",
  keywords: ["trommer", "trommeundervisning", "trommenoder", "pocket drummer", "AI læringsplan", "musikundervisning"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from "@/lib/languageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="h-full">
      <body className="h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}



## src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  IcHome, IcSpark, IcUser, IcPlay, IcBack, IcChev, IcCheck, IcLock,
  IcSun, IcMoon, IcSend, IcFlame, IcClock, IcTrophy,
  TabKit, TabPractice, IllSnare, IllSticks, DrumNotation,
  IcLoop, IcMin,
} from '@/components/DesktopIcons';
import {
  getUserPlan, getCompletedExercises,
  getPremiumStatus, setPremiumStatus, resetMockDatabase,
  UserPlan,
} from '@/lib/mockData';
import {
  LEVELS, MODULES, PILLARS,
} from '@/lib/curriculum';
import { useAuth } from '@/lib/authContext';
import { useLanguage } from '@/lib/languageContext';
import TiltCard from '@/components/TiltCard';


// ─── DESIGN TOKENS ────────────────────────────────────────────
interface T {
  bg: string; sidebar: string; surface: string; surface2: string;
  surfaceElev: string; border: string; borderStrong: string;
  text: string; textMuted: string; textDim: string;
  accent: string; accentDeep: string; accentSoft: string; accentText: string;
  good: string; goodSoft: string; mono: string; font: string; serif: string;
}
const mkT = (dark = true): T => ({
  bg: dark ? '#0a0a0a' : '#FAF8F5',
  sidebar: dark ? '#0e0e10' : '#F3EFE7',
  surface: dark ? '#141416' : '#ffffff',
  surface2: dark ? '#1c1c1f' : '#EBE6DC',
  surfaceElev: dark ? '#212124' : '#ffffff',
  border: dark ? 'rgba(255,255,255,0.06)' : 'rgba(37,37,37,0.08)',
  borderStrong: dark ? 'rgba(255,255,255,0.13)' : 'rgba(37,37,37,0.14)',
  text: dark ? '#FAF8F5' : '#252525',
  textMuted: dark ? '#8a8580' : '#77716B',
  textDim: dark ? '#56524c' : '#A39C94',
  accent: '#F25545',
  accentDeep: '#C43425',
  accentSoft: dark ? 'rgba(242,85,69,0.13)' : 'rgba(242,85,69,0.08)',
  accentText: dark ? '#f5b8a8' : '#C43425',
  good: '#5dd39e',
  goodSoft: dark ? 'rgba(93,211,158,0.14)' : 'rgba(93,211,158,0.14)',
  mono: 'var(--font-mono, monospace)',
  font: 'var(--font-sans, sans-serif)',
  serif: 'var(--font-serif, Georgia, serif)',
});

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────
const Sect = ({ children, t, color, style = {} }: { children: React.ReactNode; t: T; color?: string; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: t.font, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: color || t.textMuted, marginBottom: 14, ...style }}>{children}</div>
);

const Card = ({ children, t, style = {}, onClick, pad = 24 }: { children: React.ReactNode; t: T; style?: React.CSSProperties; onClick?: () => void; pad?: number }) => (
  <div onClick={onClick} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: pad, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.2s', ...style }}>
    {children}
  </div>
);

const Display = ({ children, t, size = 36, style = {} }: { children: React.ReactNode; t: T; size?: number; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: size, lineHeight: 1.05, color: t.text, letterSpacing: -0.5, ...style }}>{children}</div>
);

const Prog = ({ pct, t, h = 5, color }: { pct: number; t: T; h?: number; color?: string }) => (
  <div style={{ width: '100%', height: h, background: t.surface2, borderRadius: 999, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color || t.accent, borderRadius: 999, transition: 'width 0.4s ease' }} />
  </div>
);

const Btn = ({ children, t, onClick, variant = 'primary', icon, size = 'md', wide = false, disabled = false }: {
  children: React.ReactNode; t: T; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; wide?: boolean; disabled?: boolean;
}) => {
  const s = { sm: { p: '7px 16px', fs: 11, ls: 1.4 }, md: { p: '12px 22px', fs: 12, ls: 1.6 }, lg: { p: '15px 28px', fs: 13, ls: 1.8 } }[size];
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      padding: s.p, borderRadius: 999, width: wide ? '100%' : 'auto',
      background: variant === 'primary' ? t.accent : variant === 'ghost' ? 'transparent' : t.surface2,
      color: variant === 'primary' ? '#fff' : t.text,
      border: variant === 'primary' ? 'none' : variant === 'ghost' ? 'none' : `1px solid ${t.borderStrong}`,
      fontFamily: t.font, fontSize: s.fs, fontWeight: 700, letterSpacing: s.ls, textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
      boxShadow: variant === 'primary' ? '0 6px 22px rgba(239,90,58,0.30)' : 'none',
      opacity: disabled ? 0.4 : 1, transition: 'opacity 0.15s, transform 0.1s',
    }}>
      {icon}{children}
    </button>
  );
};

const Badge = ({ children, t, tone = 'default' }: { children: React.ReactNode; t: T; tone?: 'accent' | 'good' | 'default' }) => {
  const c = tone === 'accent' ? { bg: t.accentSoft, fg: t.accentText } : tone === 'good' ? { bg: t.goodSoft, fg: t.good } : { bg: t.surface2, fg: t.textMuted };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.fg, padding: '4px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: t.font, letterSpacing: 0.4 }}>{children}</span>;
};

// ─── MACWINDOW CHROME ─────────────────────────────────────────
const TrafficLights = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    {['#ff736a', '#febc2e', '#19c332'].map((bg, i) => (
      <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: bg, border: '0.5px solid rgba(0,0,0,0.12)' }} />
    ))}
  </div>
);

// ─── SCALE HOOK ───────────────────────────────────────────────
function useFitScale(w: number, h: number, mg = 0) {
  const [sc, setSc] = useState(1);
  useEffect(() => {
    const calc = () => {
      const s = Math.min((window.innerWidth - mg * 2) / w, (window.innerHeight - mg * 2) / h, 1);
      setSc(s > 0 ? s : 1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [w, h, mg]);
  return sc;
}

// ─── SIDEBAR ──────────────────────────────────────────────────
type ViewId = 'home' | 'category' | 'exercises' | 'studio' | 'profile';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NAV_ITEMS: { id: ViewId; label: string; icon: React.FC<any>; category?: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' }[] = [
  { id: 'home', label: 'Hjem', icon: IcHome },
  { id: 'category', label: 'Play-along', icon: IcPlay, category: 'playalong' },
  { id: 'exercises', label: 'Øvelser', icon: TabPractice },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { id: 'studio', label: 'Studio Kit', icon: ({ size, color, sw }: any) => <TabKit size={size} color={color} sw={sw} /> },
  { id: 'profile', label: 'Profil', icon: IcUser },
];

function Sidebar({ t, view, onView, selectedCategory, setSelectedCategory, isPremium, onUpgrade }: {
  t: T;
  view: ViewId;
  onView: (v: ViewId) => void;
  selectedCategory: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null;
  setSelectedCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null) => void;
  dark: boolean;
  isPremium: boolean;
  onUpgrade: () => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage, t: translate } = useLanguage();
  const { user } = useAuth();
  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const languages: { code: typeof language; flag: string }[] = [
    { code: 'da', flag: '🇩🇰' },
    { code: 'en', flag: '🇬🇧' },
    { code: 'de', flag: '🇩🇪' },
    { code: 'es', flag: '🇪🇸' },
  ];

  return (
    <div style={{ width: 240, height: '100%', flexShrink: 0, background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', padding: '18px 14px 16px' }}>
      {/* Brand */}
      <div style={{ padding: '4px 6px 24px' }}>
        <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 22, letterSpacing: -0.5, color: t.text, display: 'flex', alignItems: 'baseline', gap: 2 }}>
          Pocket Drummer<span style={{ color: t.accent, fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{ fontSize: 10, fontFamily: t.mono, color: t.textDim, letterSpacing: 0.5, marginTop: 2 }}>ACADEMY</div>
      </div>

      {/* Search */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.textDim} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input ref={searchRef} placeholder="Søg..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontFamily: t.font, fontSize: 12, padding: 0, margin: 0 }} />
        <span style={{ fontFamily: t.mono, fontSize: 9, color: t.textDim, padding: '1px 5px', borderRadius: 4, border: `1px solid ${t.border}` }}>⌘K</span>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Sect t={t} style={{ marginBottom: 8 }}>{translate('home')}</Sect>
        {NAV_ITEMS.map(it => {
          const active = it.id === 'category'
            ? (view === 'category' && selectedCategory === it.category)
            : (view === it.id);
          
          const labelTranslated = it.id === 'home' ? translate('home') :
                                  it.id === 'exercises' ? translate('practice') :
                                  it.id === 'category' ? translate('playalong') :
                                  it.id === 'studio' ? translate('kit') :
                                  it.id === 'profile' ? translate('profile') : it.label;

          return (
            <button key={it.label} onClick={() => {
              if (it.id === 'category' && it.category) {
                setSelectedCategory(it.category);
              } else {
                setSelectedCategory(null);
              }
              onView(it.id);
            }} aria-current={active ? 'page' : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px',
              background: active ? t.accentSoft : 'transparent',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              color: active ? t.accent : t.text, fontFamily: t.font,
              fontSize: 13.5, fontWeight: active ? 600 : 450, textAlign: 'left', width: '100%',
            }}>
              <it.icon size={17} color={active ? t.accent : t.textMuted} sw={active ? 1.8 : 1.4} />
              <span style={{ flex: 1 }}>{labelTranslated}</span>
              {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.accent }} />}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Language Switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, padding: '0 6px', justifyContent: 'center' }}>
        {languages.map(l => (
          <button 
            key={l.code} 
            onClick={() => setLanguage(l.code)}
            style={{
              background: language === l.code ? t.accentSoft : 'transparent',
              border: `1px solid ${language === l.code ? t.accent : 'transparent'}`,
              borderRadius: 8,
              padding: '6px 8px',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <span>{l.flag}</span>
          </button>
        ))}
      </div>


      {/* Premium CTA or status */}
      {!isPremium ? (
        <div style={{
          background: `linear-gradient(135deg, ${t.accentSoft} 0%, rgba(255,255,255,0.01) 100%)`,
          border: `1px solid ${t.accent}`,
          borderRadius: 14, padding: '16px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <IcSpark size={14} color={t.accent} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: t.accent }}>Premium</span>
          </div>
          <p style={{ fontSize: 11.5, margin: '0 0 12px', color: t.textMuted, lineHeight: 1.5, fontFamily: t.font }}>
            AI-læringsplaner, 300+ øvelser og play-alongs.
          </p>
          <button onClick={onUpgrade} style={{
            width: '100%', background: t.accent, color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 12px', fontSize: 11, fontWeight: 700,
            letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239,90,58,0.35)',
          }}>
            Opgrader nu
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 14px', background: t.goodSoft, borderRadius: 12, border: `1px solid rgba(93,211,158,0.2)` }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: t.good, marginBottom: 4 }}>✦ Premium aktiv</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>Fuld adgang til alt indhold.</div>
        </div>
      )}

      {/* Auth / User chip */}
      <div style={{ borderTop: `1px solid ${t.border}`, marginTop: 12, paddingTop: 14 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.displayName}
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, fontFamily: t.mono }}>
                {translate('level')} {user.level || 1} · {isPremium ? 'PRO' : 'FREE'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 6px' }}>
            <a href="/login" style={{
              display: 'block', textAlign: 'center', padding: '9px 12px',
              background: t.accent, color: '#fff', borderRadius: 8,
              fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,90,58,0.35)',
            }}>
              Opret konto
            </a>
            <a href="/login" style={{
              display: 'block', textAlign: 'center', padding: '8px 12px',
              border: `1px solid ${t.borderStrong}`, color: t.textMuted, borderRadius: 8,
              fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              Log ind
            </a>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── AI COACH PANEL ───────────────────────────────────────────
interface CoachAction {
  category: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | 'exercises' | 'studio';
  label: string;
  description: string;
}
interface ChatMessage { id: number; role: 'ai' | 'user'; text: string; action?: CoachAction }

type CategoryId = 'opvarmning' | 'nodelære' | 'grooves' | 'playalong';

function CoachPanel({ t, open, onToggle, isPremium, onUpgrade, onNavigate }: {
  t: T; dark: boolean; open: boolean; onToggle: () => void;
  isPremium: boolean; onUpgrade: () => void;
  onNavigate: (view: ViewId, category?: CategoryId) => void;
}) {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: 0, role: 'ai', text: 'Hej! Jeg er din personlige trommelærer.\n\nHvordan gik øvningen sidst — og hvad vil du arbejde med i dag?' },
  ]);
  const msgIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = async () => {
    if (!input.trim()) return;
    if (!isPremium && msgs.filter(m => m.role === 'user').length >= 2) { onUpgrade(); return; }
    const q = input.trim();
    setInput('');
    const userMsg: ChatMessage = { id: msgIdRef.current++, role: 'user', text: q };
    setMsgs(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const history = [...msgs, userMsg].slice(-12).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTyping(false);
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: data.message, action: data.action }]);
    } catch {
      setTyping(false);
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: 'Beklager, der opstod en fejl. Prøv igen.' }]);
    }
  };

  const handleAction = (action: CoachAction) => {
    if (action.category === 'exercises') { onNavigate('exercises'); return; }
    if (action.category === 'studio') { onNavigate('studio'); return; }
    onNavigate('category', action.category as CategoryId);
  };

  if (!open) return (
    <button onClick={onToggle} style={{
      position: 'absolute', bottom: 28, right: 28, width: 48, height: 48, borderRadius: '50%',
      background: t.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(239,90,58,0.45)', zIndex: 100,
    }}>
      <IcSpark size={20} color="#fff" />
    </button>
  );

  return (
    <div style={{
      position: 'absolute', bottom: 88, right: 28, zIndex: 100,
      width: 340, height: 480, borderRadius: 16,
      background: t.sidebar, border: `1px solid ${t.border}`,
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IcSpark size={15} color={t.accent} />
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>AI Coach</span>
            <Badge t={t} tone="accent">PRO</Badge>
          </div>
          <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 2 }}>Personlig trommelærer</div>
        </div>
        <button onClick={onToggle} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 4 }}>
          <IcMin size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? t.accent : t.surface,
              color: m.role === 'user' ? '#fff' : t.text,
              border: m.role === 'user' ? 'none' : `1px solid ${t.border}`,
              fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
            {m.role === 'ai' && m.action && (
              <button
                onClick={() => handleAction(m.action!)}
                style={{
                  marginTop: 6, maxWidth: '82%', width: '100%', padding: '9px 13px',
                  borderRadius: 10, background: t.accentSoft,
                  border: `1px solid ${t.accent}40`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 9,
                  fontFamily: t.font, textAlign: 'left',
                }}
              >
                <IcPlay size={13} color={t.accent} />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: t.accentText }}>{m.action.label}</div>
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>{m.action.description}</div>
                </div>
              </button>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: t.surface, borderRadius: 14, width: 'fit-content', border: `1px solid ${t.border}` }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: t.textMuted, animation: `dotPulse 0.8s ${i * 0.2}s infinite ease-in-out` }} />)}
          </div>
        )}
      </div>

      {/* Chips */}
      <div style={{ padding: '8px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Vis timing-tip', 'Fills til begyndere', 'Ghost notes'].map(chip => (
          <button key={chip} onClick={() => { setInput(chip); }} style={{
            padding: '5px 11px', borderRadius: 999, background: t.surface2, border: `1px solid ${t.border}`,
            fontSize: 11, color: t.textMuted, cursor: 'pointer', fontFamily: t.font,
          }}>{chip}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px 16px', borderTop: `1px solid ${t.border}` }}>
        {!isPremium && msgs.filter(m => m.role === 'user').length >= 2 && (
          <div style={{ marginBottom: 8, padding: '8px 12px', background: t.accentSoft, borderRadius: 8, fontSize: 11, color: t.accentText }}>
            Opgrader til Premium for ubegrænset AI Coach adgang.
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Spørg din coach…"
            style={{
              flex: 1, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
              padding: '9px 13px', color: t.text, fontFamily: t.font, fontSize: 12.5, outline: 'none',
            }}
          />
          <button onClick={send} style={{
            width: 38, height: 38, borderRadius: 10, background: t.accent, border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239,90,58,0.3)',
          }}>
            <IcSend size={16} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeView({ t, dark, setDark, onView, isPremium, onUpgrade, onSelectCategory }: {
  t: T;
  dark: boolean;
  setDark: (d: boolean) => void;
  onView: (v: ViewId) => void;
  isPremium: boolean;
  onUpgrade: () => void;
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
}) {
  const { user } = useAuth();
  const { t: translate } = useLanguage();
  const today = new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
  const displayName = user?.displayName || 'trommeslager';

  const xp = user?.xp !== undefined ? user.xp : 0;
  const level = user?.level || 1;
  const streak = user?.streak !== undefined ? user.streak : 0;
  const xpPct = ((xp % 200) / 200) * 100;
  const xpToNext = 200 - (xp % 200);

  const hour = new Date().getHours();
  const greeting =
    hour < 10 ? translate('greetingMorning') :
    hour < 17 ? translate('greetingDay') :
    translate('greetingEvening');

  const CATEGORIES = [
    {
      id: 'opvarmning' as const,
      title: translate('warmup'),
      tagline: translate('warmupTagline'),
      icon: <IllSticks size={52} color={t.accent} />,
    },
    {
      id: 'nodelære' as const,
      title: translate('musicTheory'),
      tagline: translate('theoryTagline'),
      icon: <div style={{ transform: 'scale(0.8)', marginTop: -20, marginBottom: -10 }}><DrumNotation color={t.text} width={140} accent={t.accent} active={2} /></div>,
    },
    {
      id: 'grooves' as const,
      title: translate('grooves'),
      tagline: translate('groovesTagline'),
      icon: <IllSnare size={62} color={t.accent} />,
    },
    {
      id: 'playalong' as const,
      title: translate('playalong'),
      tagline: translate('playalongTagline'),
      icon: <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcPlay size={20} fill color={t.accent} /></div>,
    },
  ];

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font, maxWidth: 1100 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted, marginBottom: 10 }}>
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </div>
          <Display t={t} size={48}>{greeting}, {displayName}.</Display>
        </div>
        <button onClick={() => setDark(!dark)} style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dark ? <IcSun size={15} /> : <IcMoon size={15} />}
        </button>
      </div>

      {/* Hero grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 36 }}>
        {/* Recommended Daily Exercise */}
        <TiltCard style={{ borderRadius: '18px' }}>
          <Card t={t} pad={0} style={{ overflow: 'hidden', display: 'flex', border: `1px solid ${t.accentDeep}`, height: '100%' }}>
            <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Sect t={t} color={t.accent}>{translate('todayRecommendation')}</Sect>
                <Display t={t} size={30} style={{ marginBottom: 8 }}>Paradiddle Grooves</Display>
                <div style={{ fontSize: 11, color: t.textMuted, fontFamily: t.mono, letterSpacing: 0.5, marginBottom: 12 }}>12 MIN · LET ØVET</div>
                <p style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5, margin: '0 0 16px' }}>
                  Styrk din koordination og fingerkontrol med fokuserede paradiddle-grooves.
                </p>
              </div>
              <div>
                <Btn t={t} onClick={() => onSelectCategory('grooves')} icon={<IcPlay size={11} />}>{translate('startExercise')}</Btn>
              </div>
            </div>
            <div style={{ width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? '#101012' : '#F3EFE7', borderLeft: `1px solid ${t.border}`, flexShrink: 0 }}>
              <IllSnare size={110} color={t.accent} sw={1.4} />
            </div>
          </Card>
        </TiltCard>

        {/* Streak + Progression */}
        <TiltCard style={{ borderRadius: '18px' }}>
          <Card t={t} pad={24} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <Sect t={t}>{translate('yourProgress')}</Sect>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: t.text, fontFamily: t.font }}>🔥 {streak}</span>
                <span style={{ fontSize: 13, color: t.textMuted }}>{translate('daysActive')}</span>
              </div>
              <p style={{ fontSize: 12, color: t.textMuted, marginBottom: 20, lineHeight: 1.5 }}>
                {streak === 0
                  ? translate('startStreakToday')
                  : streak < 7
                  ? translate('keepItUp')
                  : translate('onFire')}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5 }}>
                <span>{translate('level')} {level}</span>
                <span>{xp % 200} / 200 XP</span>
              </div>
              <Prog pct={xpPct} t={t} h={6} />
              <p style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>
                {xpToNext} XP {translate('toNextLevel')}
              </p>
            </div>
          </Card>
        </TiltCard>
      </div>

      {/* Choose practice category */}
      <Sect t={t} style={{ marginBottom: 18 }}>{translate('choosePracticeTrack')}</Sect>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
        {CATEGORIES.map((cat) => (
          <TiltCard key={cat.id} onClick={() => onSelectCategory(cat.id)} style={{ borderRadius: '18px' }}>
            <Card t={t} pad={24} style={{ display: 'flex', alignItems: 'center', gap: 20, height: '100%', cursor: 'pointer' }}>
              <div style={{ width: 80, height: 80, borderRadius: 14, background: t.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: `1px solid ${t.border}` }}>
                {cat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <Display t={t} size={20} style={{ marginBottom: 4 }}>{cat.title}</Display>
                <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.4, fontStyle: 'italic' }}>{cat.tagline}</div>
              </div>
              <IcChev size={16} color={t.textDim} />
            </Card>
          </TiltCard>
        ))}
      </div>

    </div>
  );
}

// ─── CATEGORY DETAIL VIEW ──────────────────────────────────────
interface CategoryDetailViewProps {
  t: T;
  category: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong';
  onBack: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

function CategoryDetailView({ t, category, onBack }: CategoryDetailViewProps) {
  const [activeChip, setActiveChip] = useState('Alle');
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [bpm, setBpm] = useState(90);
  const [metroPlaying, setMetroPlaying] = useState(false);
  const [subdivision, setSubdivision] = useState<'quarter' | 'eighth'>('quarter');
  const [currentBeat, setCurrentBeat] = useState(0);

  // Play-along states
  const [playalongPlaying, setPlayalongPlaying] = useState(false);
  const [playalongSpeed, setPlayalongSpeed] = useState<80 | 90 | 100 | 110>(100);
  const [mixerVols, setMixerVols] = useState({ drums: 70, music: 60 });
  const [playalongBeat, setPlayalongBeat] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Metronome Sound loop
  useEffect(() => {
    if (!metroPlaying) return;
    const intervalTime = (60 / bpm) * (subdivision === 'eighth' ? 500 : 1000);
    const intervalId = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = subdivision === 'eighth' ? (prev + 1) % 8 : (prev + 1) % 4;
        try {
          const ctx = getAudioCtx();
          // Synthesize tick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const isDownbeat = nextBeat === 0;
          const isSub = subdivision === 'eighth' && nextBeat % 2 !== 0;
          
          osc.frequency.setValueAtTime(isDownbeat ? 1000 : isSub ? 450 : 600, ctx.currentTime);
          gain.gain.setValueAtTime(isDownbeat ? 0.2 : isSub ? 0.04 : 0.09, ctx.currentTime);
          
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.stop(ctx.currentTime + 0.06);
        } catch {}
        return nextBeat;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [metroPlaying, bpm, subdivision]);

  // Backing Track Synthesizer loop
  useEffect(() => {
    if (!playalongPlaying) return;
    
    // Base tempo is 105 BPM, speed alters it
    const actualBpm = 105 * (playalongSpeed / 100);
    const intervalTime = (60 / actualBpm) * 500; // eighth notes
    
    const intervalId = setInterval(() => {
      setPlayalongBeat(prev => {
        const nextBeat = (prev + 1) % 32; // 4 measures of 8 eighth notes (32 clicks total)
        
        let section = 'Intro';
        if (nextBeat >= 8 && nextBeat < 24) section = 'Verse';
        else if (nextBeat >= 24 && nextBeat < 28) section = 'Chorus';
        else if (nextBeat >= 28 && nextBeat < 30) section = 'Fill Cue';
        else section = 'Outro';
        
        try {
          const ctx = getAudioCtx();
          const now = ctx.currentTime;
          
          // Drums synthesis
          if (mixerVols.drums > 0) {
            const subBeat = nextBeat % 8;
            if (subBeat === 0 || subBeat === 4) {
              const kick = ctx.createOscillator();
              const kickGain = ctx.createGain();
              kick.connect(kickGain);
              kickGain.connect(ctx.destination);
              kick.frequency.setValueAtTime(140, now);
              kick.frequency.exponentialRampToValueAtTime(45, now + 0.08);
              kickGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.35, now);
              kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
              kick.start();
              kick.stop(now + 0.2);
            }
            
            if (subBeat === 4) {
              const snare = ctx.createOscillator();
              const snareGain = ctx.createGain();
              snare.connect(snareGain);
              snareGain.connect(ctx.destination);
              snare.type = 'triangle';
              snare.frequency.setValueAtTime(240, now);
              snareGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.22, now);
              snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
              snare.start();
              snare.stop(now + 0.1);
            }
            
            const hh = ctx.createOscillator();
            const hhGain = ctx.createGain();
            hh.connect(hhGain);
            hhGain.connect(ctx.destination);
            hh.type = 'sine';
            hh.frequency.setValueAtTime(8000, now);
            hhGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.02, now);
            hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            hh.start();
            hh.stop(now + 0.04);
          }
          
          // Music synth backing chords
          if (mixerVols.music > 0 && nextBeat % 2 === 0) {
            const synth = ctx.createOscillator();
            const synthGain = ctx.createGain();
            synth.connect(synthGain);
            synthGain.connect(ctx.destination);
            synth.type = 'sine';
            
            let baseFreq = 130.81; // C3
            if (section === 'Verse') baseFreq = 146.83; // D3
            else if (section === 'Chorus') baseFreq = 164.81; // E3
            else if (section === 'Fill Cue') baseFreq = 196.00; // G3
            else if (section === 'Outro') baseFreq = 130.81; // C3
            
            const harmony = ctx.createOscillator();
            harmony.connect(synthGain);
            harmony.type = 'sine';
            harmony.frequency.setValueAtTime(baseFreq * 1.5, now); // fifth
            
            synth.frequency.setValueAtTime(baseFreq, now);
            synthGain.gain.setValueAtTime((mixerVols.music / 100) * 0.06, now);
            synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            synth.start();
            harmony.start();
            synth.stop(now + 0.45);
            harmony.stop(now + 0.45);
          }
        } catch {}
        return nextBeat;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [playalongPlaying, playalongSpeed, mixerVols]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const categoryChips = {
    opvarmning: ['Alle', '5 min', '10 min', 'Hænder', 'Fødder', 'Single strokes', 'Double strokes', 'Paradiddles', 'Accenter', 'Dynamik', 'Tempo-ladder', 'Venstre hånd', 'Stortrommekontrol'],
    nodelære: ['Alle', 'Fjerdedele', 'Ottendedele', 'Sekstendedele', 'Pauser', 'Accenter', 'Ghost notes', 'Taktarter', '4/4', '3/4', '6/8', 'Shuffle-notation', 'Charts', 'Prima vista', 'Læs og spil', 'Nodequiz'],
    grooves: ['Alle', 'Basic rock', 'Pop', 'Funk', 'Jazz', 'Blues', 'Shuffle', 'Samba', 'Songo', 'Latin', 'Reggae', 'Hip-hop', 'Metal', 'Brushes', 'Ghost notes', 'Linear grooves', 'Fills', 'Overgange', 'Odd meters', 'Koordination'],
    playalong: ['Alle', 'Rock tracks', 'Pop tracks', 'Funk tracks', 'Blues tracks', 'Jazz tracks', 'Latin tracks', 'No-drums tracks', 'Guided play-alongs', 'Call and response', 'Begyndertracks', 'Mellemtracks', 'Øvede tracks', 'Formtræning', 'Vers/omkvæd', 'Fill cues']
  }[category];

  const categoryExercises = {
    opvarmning: [
      { id: 1, title: '5 minutters teknik-start', sub: 'Single strokes og håndkontrol', dur: '5 min', bpm: 80, tags: ['5 min', 'Single strokes'], level: 'Begynder' },
      { id: 2, title: 'Hånd-hastighed & kontrol', sub: 'Dobbelt slag og paradiddle kontrol', dur: '10 min', bpm: 100, tags: ['10 min', 'Hænder', 'Double strokes', 'Paradiddles'], level: 'Mellemniveau' },
      { id: 3, title: 'Stortromme styrke & kontrol', sub: 'Fodkontrol og udholdenhed', dur: '12 min', bpm: 90, tags: ['Fødder', 'Stortrommekontrol'], level: 'Øvet' },
      { id: 4, title: 'Tempo-ladder udfordring', sub: 'Øg tempoet gradvist', dur: '15 min', bpm: '80-140', tags: ['Tempo-ladder', 'Dynamik'], level: 'Øvet' },
    ],
    nodelære: [
      { id: 1, title: 'Læs fjerdedele & pauser', sub: 'Grundlæggende nodelæsning', dur: '5 min', bpm: 80, tags: ['Fjerdedele', 'Pauser'], level: 'Begynder' },
      { id: 2, title: 'Ottendedele syncopation', sub: 'Udfordr din timing', dur: '8 min', bpm: 90, tags: ['Ottendedele', 'Accenter'], level: 'Mellemniveau' },
      { id: 3, title: 'Sekstendedele ghost notes', sub: 'Avanceret nodeforståelse', dur: '12 min', bpm: 96, tags: ['Sekstendedele', 'Ghost notes'], level: 'Øvet' },
      { id: 4, title: 'Taktartsskift (4/4 til 3/4)', sub: 'Leg med taktarter', dur: '10 min', bpm: 100, tags: ['Taktarter', '3/4'], level: 'Øvet' },
    ],
    grooves: [
      { id: 1, title: 'Basic Rock Beat', sub: 'Klassisk 8.-dels groove', dur: '6 min', bpm: 90, tags: ['Basic rock', 'Pop'], level: 'Begynder' },
      { id: 2, title: 'Funk Pocket Groove', sub: 'Syncoperet 16.-dels hi-hat groove', dur: '10 min', bpm: 95, tags: ['Funk', 'Ghost notes'], level: 'Mellemniveau' },
      { id: 3, title: 'Jazz Swing comping', sub: 'Swing-feel og ride bækken mønster', dur: '12 min', bpm: 120, tags: ['Jazz', 'Brushes'], level: 'Øvet' },
      { id: 4, title: 'Linear Funk Pattern', sub: 'Linear timing uden overlappende slag', dur: '15 min', bpm: 100, tags: ['Funk', 'Linear grooves'], level: 'Øvet' },
    ],
    playalong: [
      { id: 1, title: 'Classic Rock 4/4 Beat', sub: 'Spil med et stærkt rock backing track', dur: '3 min', bpm: 92, tags: ['Rock tracks', 'Begyndertracks'], level: 'Begynder', nodrums: true },
      { id: 2, title: 'Funk Groove Odyssey', sub: 'Super funky synth-backing track', dur: '4 min', bpm: 105, tags: ['Funk tracks', 'Mellemtracks', 'Formtræning'], level: 'Mellemniveau', nodrums: true },
      { id: 3, title: 'Modern Jazz swing along', sub: 'Swing med bas og piano', dur: '5 min', bpm: 130, tags: ['Jazz tracks', 'Øvede tracks'], level: 'Øvet', nodrums: true },
    ]
  }[category];

  const categoryTitle = {
    opvarmning: 'Opvarmning',
    nodelære: 'Nodelære',
    grooves: 'Groove',
    playalong: 'Play-along'
  }[category];

  const categoryBlurb = {
    opvarmning: 'Start med hænder, fødder, kontrol og timing. Skab et solidt fundament for dit trommespil.',
    nodelære: 'Forstå rytmer, taktarter og trommenotation. Lær at læse og spille noder flydende.',
    grooves: 'Spil beats, fills, overgange og genrer. Udvid dit rytmiske ordforråd på tværs af musikstile.',
    playalong: 'Spil med musik, backing tracks og form. Anvend dine øvelser direkte i musikalske formforløb.'
  }[category];

  const filteredExercises = categoryExercises.filter(ex => {
    if (activeChip === 'Alle') return true;
    return ex.tags.some(tag => tag.toLowerCase().includes(activeChip.toLowerCase()));
  });

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font, maxWidth: 1100 }}>
      {/* Back button and Category Header */}
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 1.2, padding: '4px 0', marginBottom: 20
      }}>
        <IcBack size={15} color={t.textMuted} /> Tilbage til Hjem
      </button>

      <div style={{ marginBottom: 32 }}>
        <Display t={t} size={48} style={{ marginBottom: 12 }}>{categoryTitle}</Display>
        <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6, maxWidth: 650 }}>{categoryBlurb}</p>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 28, flexWrap: 'wrap', scrollbarWidth: 'none' }}>
        {categoryChips.map(chip => {
          const active = activeChip === chip;
          return (
            <button key={chip} onClick={() => setActiveChip(chip)} style={{
              padding: '8px 16px', borderRadius: 999, border: `1px solid ${active ? t.accent : t.border}`,
              background: active ? t.accentSoft : t.surface, color: active ? t.accent : t.textMuted,
              fontFamily: t.font, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s ease'
            }}>{chip}</button>
          );
        })}
      </div>

      {/* Interactive metronome widget for Nodelære */}
      {category === 'nodelære' && (
        <Card t={t} pad={24} style={{ marginBottom: 36, borderLeft: `4px solid ${t.accent}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.accent, marginBottom: 4 }}>Interaktiv Nodelæser</div>
              <Display t={t} size={24}>Metronom & Node-øvebænk</Display>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setSubdivision('quarter'); setCurrentBeat(0); }} style={{
                padding: '6px 12px', borderRadius: 6, border: `1.5px solid ${subdivision === 'quarter' ? t.accent : t.border}`,
                background: subdivision === 'quarter' ? t.accentSoft : 'transparent', color: subdivision === 'quarter' ? t.accent : t.textMuted,
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: t.font
              }}>Fjerdedele</button>
              <button onClick={() => { setSubdivision('eighth'); setCurrentBeat(0); }} style={{
                padding: '6px 12px', borderRadius: 6, border: `1.5px solid ${subdivision === 'eighth' ? t.accent : t.border}`,
                background: subdivision === 'eighth' ? t.accentSoft : 'transparent', color: subdivision === 'eighth' ? t.accent : t.textMuted,
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: t.font
              }}>Ottendedele</button>
            </div>
          </div>

          <div style={{ background: '#FAF8F5', border: `1px solid ${t.border}`, borderRadius: 16, padding: '24px 16px', position: 'relative', marginBottom: 24, overflow: 'hidden' }}>
            {/* Playhead SVG overlay */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, pointerEvents: 'none' }}>
              <svg width="100%" height="100%">
                {(() => {
                  const beatsCount = subdivision === 'eighth' ? 8 : 4;
                  const startX = 64;
                  const step = (800 - startX) / beatsCount;
                  const x = startX + step * (currentBeat + 0.5);
                  if (!metroPlaying) return null;
                  return (
                    <line x1={x} y1="0" x2={x} y2="100%" stroke={t.accent} strokeWidth="2.5" opacity="0.85" />
                  );
                })()}
              </svg>
            </div>

            {/* Static Drum Notation Rendering */}
            <div style={{ color: '#16161a' }}>
              <DrumNotation color="#16161a" width={800} accent={t.accent} active={metroPlaying ? currentBeat : -1} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => setMetroPlaying(!metroPlaying)} style={{
                width: 52, height: 52, borderRadius: '50%', background: t.accent, border: 'none', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(242,85,69,0.35)', transition: 'all 0.15s ease'
              }}>
                {metroPlaying ? <span style={{ fontSize: 16 }}>◼</span> : <IcPlay size={16} fill color="#fff" />}
              </button>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{metroPlaying ? 'Spiller…' : 'Start metronom'}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>Mål timing på subdivisioner</div>
              </div>
            </div>

            <div style={{ flex: 1, maxWidth: 350, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.textMuted }}>BPM:</span>
              <button onClick={() => setBpm(Math.max(40, bpm - 5))} style={{ width: 28, height: 28, borderRadius: '50%', background: t.surface2, border: 'none', color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>-</button>
              <input type="range" min={40} max={220} value={bpm} onChange={e => setBpm(+e.target.value)} style={{ flex: 1, accentColor: t.accent }} />
              <button onClick={() => setBpm(Math.min(220, bpm + 5))} style={{ width: 28, height: 28, borderRadius: '50%', background: t.surface2, border: 'none', color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
              <span style={{ fontFamily: t.mono, fontSize: 14, fontWeight: 700, width: 60, textAlign: 'right' }}>{bpm} BPM</span>
            </div>
          </div>
        </Card>
      )}

      {/* Interactive Backing Track Player for Play-along */}
      {category === 'playalong' && (
        <Card t={t} pad={24} style={{ marginBottom: 36, borderLeft: `4px solid ${t.accent}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.accent, marginBottom: 4 }}>Tromme Backing Track Player</div>
              <Display t={t} size={24}>Funk Groove Odyssey</Display>
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>105 BPM · Let øvet · Modalt loop</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([80, 90, 100, 110] as const).map(speed => (
                <button key={speed} onClick={() => setPlayalongSpeed(speed)} style={{
                  padding: '5px 10px', borderRadius: 4, border: `1.5px solid ${playalongSpeed === speed ? t.accent : t.border}`,
                  background: playalongSpeed === speed ? t.accentSoft : 'transparent', color: playalongSpeed === speed ? t.accent : t.textMuted,
                  fontSize: 10.5, fontFamily: t.mono, fontWeight: 700, cursor: 'pointer'
                }}>{speed}%</button>
              ))}
            </div>
          </div>

          {/* Form timeline visualizer */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 8 }}>
              <span>FORM FORLØB TIMELINE</span>
              <span style={{ color: playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.textMuted }}>
                {playalongBeat >= 28 && playalongBeat < 30 ? '⚠️ GØR KLAR TIL FILL CUE!' : 'Næste sektion: Chorus'}
              </span>
            </div>

            {/* Timeline bars */}
            <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', background: t.surface2, border: `1px solid ${t.border}`, position: 'relative' }}>
              <div style={{ width: '25%', background: playalongBeat < 8 ? t.accentSoft : 'rgba(0,0,0,0.03)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>Intro (1)</div>
              <div style={{ width: '50%', background: playalongBeat >= 8 && playalongBeat < 24 ? t.accentSoft : 'rgba(0,0,0,0.03)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>Verse (2)</div>
              <div style={{ width: '12.5%', background: playalongBeat >= 24 && playalongBeat < 28 ? t.accentSoft : 'rgba(0,0,0,0.03)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>Chorus</div>
              <div style={{ width: '6.25%', background: playalongBeat >= 28 && playalongBeat < 30 ? '#F2554533' : 'rgba(0,0,0,0.03)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, color: t.accent }}>Fill</div>
              <div style={{ width: '6.25%', background: playalongBeat >= 30 ? t.accentSoft : 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>Outro</div>

              {/* Progress marker */}
              {playalongPlaying && (
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${(playalongBeat / 32) * 100}%`, width: 3, background: t.accent,
                  boxShadow: '0 0 10px #F25545', transition: 'left 0.15s linear'
                }} />
              )}
            </div>

            {/* Prompt banner */}
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: playalongBeat >= 28 && playalongBeat < 30 ? t.accentSoft : t.surface,
              border: `1px solid ${playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.border}`,
              textAlign: 'center', fontSize: 13.5, fontWeight: 700,
              color: playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.text
            }}>
              {playalongBeat < 8 && 'AKTIV: INTRO — Lyt til timingen og start roligt med fjerdedele.'}
              {playalongBeat >= 8 && playalongBeat < 24 && 'AKTIV: VERS — Spil en stabil basic funk beat med ghost notes.'}
              {playalongBeat >= 24 && playalongBeat < 28 && 'AKTIV: OMKVÆD (CHORUS) — Mere energi! Åbn hi-hatten.'}
              {playalongBeat >= 28 && playalongBeat < 30 && 'FILL CUE — Spil et 16.-dels snare roll fill med et crash på 1!'}
              {playalongBeat >= 30 && 'AKTIV: OUTRO — Dæmp energien og spil grooves mod slutningen.'}
            </div>
          </div>

          {/* Controls Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => setPlayalongPlaying(!playalongPlaying)} style={{
                width: 52, height: 52, borderRadius: '50%', background: t.accent, border: 'none', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(242,85,69,0.35)'
              }}>
                {playalongPlaying ? <span style={{ fontSize: 16 }}>◼</span> : <IcPlay size={16} fill color="#fff" />}
              </button>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{playalongPlaying ? 'Backing track spiller…' : 'Afspil backing track'}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>BPM: {Math.round(105 * (playalongSpeed / 100))} (mål: 105)</div>
              </div>
            </div>

            {/* Mixer drums volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>
                <span>GUIDE TROMMER</span>
                <span style={{ fontFamily: t.mono }}>{mixerVols.drums}%</span>
              </div>
              <input type="range" min={0} max={100} value={mixerVols.drums} onChange={e => setMixerVols(prev => ({ ...prev, drums: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
            </div>

            {/* Mixer music volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>
                <span>BACKING TRACK</span>
                <span style={{ fontFamily: t.mono }}>{mixerVols.music}%</span>
              </div>
              <input type="range" min={0} max={100} value={mixerVols.music} onChange={e => setMixerVols(prev => ({ ...prev, music: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
            </div>
          </div>
        </Card>
      )}

      {/* Grid of exercises */}
      <Sect t={t}>Lektioner ({filteredExercises.length})</Sect>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredExercises.map((ex, idx) => {
          const exKey = `${category}-${idx}`;
          const isOpen = openExerciseId === exKey;
          return (
            <div key={exKey} style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${isOpen ? t.borderStrong : t.border}`, transition: 'border-color 0.2s' }}>
              {/* Accordion header — klikbar */}
              <button
                onClick={() => setOpenExerciseId(isOpen ? null : exKey)}
                style={{
                  width: '100%', background: isOpen ? t.surface2 : t.surface,
                  border: 'none', cursor: 'pointer', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, textAlign: 'left' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IcPlay size={13} color={t.accent} fill />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 2 }}>{ex.title}</div>
                    <div style={{ fontSize: 11.5, color: t.textMuted }}>{ex.sub}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <Badge t={t} tone={ex.level === 'Begynder' ? 'good' : ex.level === 'Mellemniveau' ? 'default' : 'accent'}>{ex.level}</Badge>
                  <span style={{ fontFamily: t.mono, fontSize: 10, color: t.textDim }}>{ex.dur} · {ex.bpm} BPM</span>
                  <div style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: t.textMuted }}>
                    <IcChev size={14} color={t.textMuted} />
                  </div>
                </div>
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div style={{ padding: '0 20px 20px', background: t.surface2, borderTop: `1px solid ${t.border}` }}>
                  <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ex.tags.map(tag => (
                        <span key={tag} style={{ padding: '3px 8px', borderRadius: 4, background: t.surface, fontSize: 10, fontFamily: t.mono, color: t.textMuted, border: `1px solid ${t.border}` }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Btn t={t} size="sm" icon={<IcPlay size={11} />}>
                        Start øvelse
                      </Btn>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: t.textMuted }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 13 }}>Ingen lektioner matcher filteret &quot;{activeChip}&quot;.</div>
        </div>
      )}
    </div>
  );
}



// ─── EXERCISES VIEW ───────────────────────────────────────────
function ExercisesView({ t, isPremium, onUpgrade, completedIds }: { t: T; isPremium: boolean; onUpgrade: () => void; completedIds: string[] }) {
  const [catFilter, setCatFilter] = useState('all');
  const [lvlFilter, setLvlFilter] = useState('all');
  const CATS = ['all', 'rudiments', 'groove', 'fills', 'timing', 'koordination', 'stilarter'];
  const LVLS = ['all', 'begynder', 'mellemniveau', 'øvet'];
  const allLessons = MODULES.flatMap(m => m.lessons);
  const filtered = allLessons.filter(l => {
    if (catFilter !== 'all' && !l.skills.some(s => s.includes(catFilter))) return false;
    if (lvlFilter !== 'all') {
      const lvlMap: Record<string, number[]> = { begynder: [0, 1], mellemniveau: [2, 3], øvet: [4, 5] };
      if (!lvlMap[lvlFilter]?.includes(l.level)) return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font }}>
      <Display t={t} size={48} style={{ marginBottom: 8 }}>Øvelsesbibliotek</Display>
      <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 28 }}>{allLessons.length} øvelser · {allLessons.filter(l => !l.premium).length} gratis · {allLessons.filter(l => l.premium).length} premium</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: '7px 16px', borderRadius: 999, fontFamily: t.font, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            background: catFilter === c ? t.accent : t.surface2,
            color: catFilter === c ? '#fff' : t.textMuted,
            border: `1px solid ${catFilter === c ? t.accent : t.border}`,
            textTransform: 'capitalize',
          }}>{c === 'all' ? 'Alle kategorier' : c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {LVLS.map(l => (
          <button key={l} onClick={() => setLvlFilter(l)} style={{
            padding: '7px 16px', borderRadius: 999, fontFamily: t.font, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
            background: lvlFilter === l ? t.surface : 'transparent',
            color: lvlFilter === l ? t.text : t.textMuted,
            border: `1px solid ${lvlFilter === l ? t.borderStrong : 'transparent'}`,
            textTransform: 'capitalize',
          }}>{l === 'all' ? 'Alle niveauer' : l}</button>
        ))}
      </div>

      {/* Exercise grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {filtered.map((lesson) => {
          const done = completedIds.includes(lesson.id);
          const locked = lesson.premium && !isPremium;
          const lv = LEVELS[lesson.level];
          return (
            <Card key={lesson.id} t={t} pad={20} onClick={locked ? onUpgrade : undefined} style={{ cursor: 'pointer', position: 'relative' }}>
              {done && (
                <div style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, borderRadius: '50%', background: t.goodSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IcCheck size={12} color={t.good} />
                </div>
              )}
              {locked && (
                <div style={{ position: 'absolute', top: 16, right: 16 }}><IcLock size={14} color={t.textDim} /></div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: lv?.color || t.accent }} />
                <span style={{ fontSize: 9.5, fontFamily: t.mono, fontWeight: 700, letterSpacing: 1, color: t.textMuted, textTransform: 'uppercase' }}>Niv. {lesson.level} · {lesson.duration} min</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 8, lineHeight: 1.35 }}>{lesson.title}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {lesson.format.map(f => (
                  <span key={f} style={{ padding: '3px 8px', borderRadius: 4, background: t.surface2, fontSize: 9.5, fontFamily: t.mono, color: t.textDim, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f}</span>
                ))}
                {lesson.bpm && (
                  <span style={{ padding: '3px 8px', borderRadius: 4, background: t.surface2, fontSize: 9.5, fontFamily: t.mono, color: t.textDim }}>{lesson.bpm.min}–{lesson.bpm.max} BPM</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: t.textMuted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14 }}>Ingen øvelser matcher dine filtre.</div>
        </div>
      )}
    </div>
  );
}

// ─── STUDIO VIEW ─────────────────────────────────────────────
function StudioView({ t }: { t: T; dark?: boolean }) {
  const pads = [
    { label: 'Hi-hat', sub: 'Lukket', desc: 'Holdes lukket med foden. Giver en skarp, kort lyd. Bruges til at markere 8.-dele og 16.-dele.' },
    { label: 'Hi-hat', sub: 'Åben', desc: 'Åbnes med foden for en længere, svævende lyd. Bruges til accenter og variation i grooves.' },
    { label: 'Crash', desc: 'Cymbal med skarp, eksplosiv lyd. Bruges til at markere slag og overgange — typisk på takt 1.' },
    { label: 'Lilletromme', desc: 'Kernen i de fleste grooves. Spilles typisk på slag 2 og 4 i 4/4-takt. Snare-lyd.' },
    { label: 'Tom 1', sub: '10"', desc: 'Lille tom — høj toneleje. Bruges i fills fra høj til lav. Placeret tæt på bækkenet.' },
    { label: 'Tom 2', sub: '12"', desc: 'Mellemtom. Lidt dybere end Tom 1. Del af standard fill-bevægelsen nedad.' },
    { label: 'Gulvtom', sub: '14"', desc: 'Dyb, kraftfuld lyd. Sidder på gulvet til højre. Bruges som afslutning på fills og i tunge grooves.' },
    { label: 'Ride', sub: '20"', desc: 'Cymbal til rytmisk fremføring. Bruges i jazz og som alternativ til hi-hat. Giver en tydelig "ping"-lyd.' },
    { label: 'Stortromme', desc: 'Spilles med foden via en pedal. Markerer takt 1 og 3 i standard rock — fundamentet i alle grooves.' },
  ];
  const [selectedPad, setSelectedPad] = useState<number | null>(null);
  return (
    <div style={{ padding: '28px 44px 60px', color: t.text, fontFamily: t.font }}>
      <div style={{ marginBottom: 28 }}>
        <Sect t={t} color={t.accent}>Lær trommesættet at kende</Sect>
        <Display t={t} size={44}>Trommesættet</Display>
        <p style={{ fontSize: 13, color: t.textMuted, marginTop: 10, maxWidth: 520 }}>
          Tryk på en del af trommesættet for at se hvad den hedder og hvordan den bruges.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Pad grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, alignContent: 'start' }}>
          {pads.map((pad, i) => {
            const isSelected = selectedPad === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedPad(isSelected ? null : i)}
                style={{
                  padding: '20px 10px 16px',
                  borderRadius: 14,
                  border: `1.5px solid ${isSelected ? t.accent : t.border}`,
                  background: isSelected ? t.accentSoft : t.surface,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s',
                  transform: isSelected ? 'scale(0.97)' : 'scale(1)',
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? t.accent : t.text, textAlign: 'center' }}>{pad.label}</div>
                {pad.sub && <div style={{ fontSize: 9.5, fontFamily: t.mono, color: t.textDim }}>{pad.sub}</div>}
              </button>
            );
          })}
        </div>

        {/* Info panel */}
        <Card t={t} pad={24} style={{ alignSelf: 'start', minHeight: 200 }}>
          {selectedPad !== null ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: t.accent, marginBottom: 8 }}>
                {pads[selectedPad].label}{pads[selectedPad].sub ? ` — ${pads[selectedPad].sub}` : ''}
              </div>
              <p style={{ fontSize: 14, color: t.text, lineHeight: 1.7, margin: 0 }}>
                {pads[selectedPad].desc}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 160, color: t.textMuted, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🥁</div>
              <div style={{ fontSize: 13 }}>Tryk på en del af trommesættet for at lære om den.</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────
function ProfileView({ t, dark, setDark, isPremium, onUpgrade, completedIds, onReset, onNavigateExercises }: { t: T; dark: boolean; setDark: (d: boolean) => void; isPremium: boolean; onUpgrade: () => void; completedIds: string[]; onReset: () => void; onNavigateExercises?: () => void }) {
  const { user, login, logout } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoginLoading(true);
    try {
      await login();
    } catch {
      setErrorMsg('Fejl under login med Google. Prøv igen.');
    } finally {
      setLoginLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div style={{ padding: '36px 44px 60px', color: t.text, fontFamily: t.font }}>
      {/* User profile / Login form */}
      {!user ? (
        <div style={{ display: 'flex', gap: 40, marginBottom: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, maxWidth: 460 }}>
            <Sect t={t} color={t.accent}>Brugerstyring</Sect>
            <Display t={t} size={36} style={{ marginBottom: 14 }}>Log ind eller opret profil</Display>
            <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
              Log ind med din Google-konto for at gemme dine øvelser, fremskridt og skræddersyede AI-træningsplaner i skyen, så du kan tilgå dem fra enhver enhed.
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loginLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    background: t.surface,
                    border: `1px solid ${t.borderStrong}`,
                    borderRadius: 12,
                    padding: '12px 24px',
                    color: t.text,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: t.font,
                    outline: 'none',
                    cursor: loginLoading ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                  onMouseOver={(e) => { if (!loginLoading) e.currentTarget.style.background = t.surface2; }}
                  onMouseOut={(e) => { if (!loginLoading) e.currentTarget.style.background = t.surface; }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.56 2.69-3.86 2.69-6.57z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.33-1.58-5.04-3.71H.94v2.3C2.42 16.03 5.48 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.96 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.94A8.99 8.99 0 000 9c0 1.45.35 2.82.94 4.04l3.02-2.3z"/>
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.41 0 9 0 5.48 0 2.42 1.97.94 4.96l3.02 2.3c.71-2.13 2.69-3.71 5.04-3.71z"/>
                  </svg>
                  {loginLoading ? 'Logger ind...' : 'Fortsæt med Google'}
                </button>
              </div>
              {errorMsg && (
                <div style={{ color: t.accent, fontSize: 12, fontWeight: 500 }}>{errorMsg}</div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', marginTop: 24 }}>
            <Btn t={t} variant="secondary" onClick={() => setDark(!dark)} icon={dark ? <IcSun size={14} /> : <IcMoon size={14} />}>
              {dark ? 'Lys tilstand' : 'Mørk tilstand'}
            </Btn>
          </div>
        </div>
      ) : (
        /* Logged in state */
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 40 }}>
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              style={{ 
                width: 110, height: 110, borderRadius: '50%', 
                objectFit: 'cover', border: `3px solid ${t.accent}`,
                boxShadow: '0 16px 40px rgba(239,90,58,0.25)'
              }} 
            />
          ) : (
            <div style={{ 
              width: 110, height: 110, borderRadius: '50%', background: t.accent, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: '#fff', fontFamily: t.serif, fontStyle: 'italic', fontSize: 42, 
              boxShadow: '0 16px 40px rgba(239,90,58,0.4)' 
            }}>
              {getInitials(user.displayName)}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Sect t={t} color={t.accent} style={{ marginBottom: 0 }}>
                {user.role === 'admin' ? 'Administrator' : `Niveau 1 · ${isPremium ? 'PRO' : 'Gratis'}`}
              </Sect>
              {isPremium ? <Badge t={t} tone="good">✦ Premium</Badge> : <Badge t={t} tone="accent">Gratis plan</Badge>}
            </div>
            <Display t={t} size={52}>{user.displayName}</Display>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>{user.email}</div>
            
            {user.role === 'admin' && (
              <div style={{ marginTop: 12 }}>
                <a href="/admin" style={{ 
                  color: t.accent, textDecoration: 'none', fontSize: 13, 
                  fontWeight: 600, borderBottom: `1px solid ${t.accent}` 
                }}>
                  Gå til Admin-panel →
                </a>
              </div>
            )}
            
            <div style={{ marginTop: 16, maxWidth: 380 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5 }}>
                <span>Niv. 1</span><span>120 / 200 XP</span><span>Niv. 2</span>
              </div>
              <Prog pct={60} t={t} h={6} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isPremium && <Btn t={t} onClick={onUpgrade}>Køb Premium</Btn>}
            <Btn t={t} variant="secondary" onClick={logout}>Log ud</Btn>
            <Btn t={t} variant="secondary" onClick={() => setDark(!dark)} icon={dark ? <IcSun size={14} /> : <IcMoon size={14} />}>
              {dark ? 'Lys tilstand' : 'Mørk tilstand'}
            </Btn>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
        {[
          { icon: <IcFlame size={15} color={t.accent} />, value: '7', label: 'Streak dage' },
          { icon: <IcClock size={15} />, value: '18t', label: 'Total øvetid' },
          { icon: <IcTrophy size={15} />, value: `${completedIds.length}`, label: 'Lektioner ✓' },
          { icon: <IcCheck size={15} color={t.good} />, value: '2/10', label: 'Moduler i gang' },
        ].map((s, i) => (
          <Card key={i} t={t} pad={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${t.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>{s.icon}</div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 38, lineHeight: 1, color: t.text }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Pillars progress */}
      <Sect t={t} style={{ marginBottom: 18 }}>Fremskridt per søjle</Sect>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 40 }}>
        {PILLARS.map(p => {
          const pillarLessons = MODULES.filter(m => m.pillarId === p.id).flatMap(m => m.lessons);
          const done = pillarLessons.filter(l => completedIds.includes(l.id)).length;
          const pct = pillarLessons.length ? Math.round((done / pillarLessons.length) * 100) : 0;
          return (
            <Card
              key={p.id}
              t={t}
              pad={18}
              onClick={onNavigateExercises}
              style={{ cursor: onNavigateExercises ? 'pointer' : 'default', transition: 'border-color 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: t.textMuted, fontFamily: t.mono }}>{done}/{pillarLessons.length} lektioner</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: t.mono, fontSize: 12, fontWeight: 700, color: pct > 0 ? t.accent : t.textDim }}>{pct}%</span>
                  {onNavigateExercises && <IcChev size={12} color={t.textDim} />}
                </div>
              </div>
              <Prog pct={pct} t={t} h={4} />
            </Card>
          );
        })}
      </div>

      {/* Settings */}
      <Sect t={t}>Indstillinger & Data</Sect>
      <Card t={t} pad={20}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={onReset} style={{
            background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 10,
            padding: '12px 16px', color: t.textMuted, fontSize: 12.5, cursor: 'pointer',
            textAlign: 'left', fontFamily: t.font, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <IcLoop size={15} /> Nulstil lokal database og premium status
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── CHECKOUT MODAL ───────────────────────────────────────────
function CheckoutModal({ t, onClose, onSuccess }: { t: T; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<'pricing' | 'method' | 'processing' | 'success'>('pricing');
  const [method, setMethod] = useState<'card' | 'mobilepay'>('card');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [phone, setPhone] = useState('');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => { setPremiumStatus(true); onSuccess(); setStep('success'); }, 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: 24, padding: '40px 44px', width: 520, maxWidth: '90vw',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)', position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: t.surface2, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✕</button>

        {step === 'pricing' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent, marginBottom: 12 }}>Pocket Drummer Premium</div>
              <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 40, color: t.text, lineHeight: 1.1, marginBottom: 8 }}>Fuld adgang til alt</div>
              <p style={{ color: t.textMuted, fontSize: 13.5, lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>AI-læringsplaner, 300+ øvelser, play-alongs og din personlige AI Coach.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              {[
                { name: 'Gratis', price: '0 kr.', period: 'for altid', features: ['10 begynderlektioner', 'Statiske noder', 'Simpel play-along', 'Basis Studio Kit'], cta: 'Aktiv plan', disabled: true },
                { name: 'Premium', price: '50 kr.', period: 'pr. måned', features: ['300+ øvelser', 'AI-læringsplan', 'Interaktive noder', 'Play-along Academy', 'Ubegrænset AI Coach'], cta: 'Start 4-ugers prøve', highlight: true },
              ].map((plan, i) => (
                <div key={i} style={{
                  padding: '22px 20px', borderRadius: 16,
                  border: `1.5px solid ${plan.highlight ? t.accent : t.border}`,
                  background: plan.highlight ? t.accentSoft : t.surface2,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: plan.highlight ? t.accent : t.textMuted, marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontFamily: t.mono, fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 }}>{plan.price}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 18, fontFamily: t.mono }}>{plan.period}</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, flex: 1 }}>
                    {plan.features.map((f, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: plan.highlight ? t.text : t.textMuted }}>
                        <IcCheck size={13} color={plan.highlight ? t.accent : t.textDim} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => !plan.disabled && setStep('method')} disabled={plan.disabled} style={{
                    padding: '11px 18px', borderRadius: 10,
                    background: plan.highlight ? t.accent : 'transparent',
                    color: plan.highlight ? '#fff' : t.textMuted,
                    border: `1px solid ${plan.highlight ? t.accent : t.border}`,
                    fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                    cursor: plan.disabled ? 'default' : 'pointer',
                    boxShadow: plan.highlight ? '0 6px 20px rgba(239,90,58,0.3)' : 'none',
                    opacity: plan.disabled ? 0.5 : 1,
                  }}>
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: t.textDim }}>Ingen binding · Opsig når som helst · Sikker betaling via Stripe</p>
          </>
        )}

        {step === 'method' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <button onClick={() => setStep('pricing')} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: 0, marginBottom: 20 }}>
                <IcBack size={14} /> Tilbage
              </button>
              <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 28, color: t.text, marginBottom: 6 }}>Vælg betalingsmetode</div>
              <p style={{ color: t.textMuted, fontSize: 12.5 }}>4-ugers prøveperiode — derefter 50 kr./md.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {(['card', 'mobilepay'] as const).map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{
                  flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${method === m ? t.accent : t.border}`,
                  background: method === m ? t.accentSoft : t.surface2,
                  color: method === m ? t.accent : t.textMuted,
                  fontFamily: t.font, fontSize: 13, fontWeight: 600,
                }}>
                  {m === 'card' ? '💳 Kreditkort' : '📱 MobilePay'}
                </button>
              ))}
            </div>
            {method === 'card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Kortnummer</label>
                  <input value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="4242 4242 4242 4242" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Udløb</label>
                    <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/ÅÅ" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>CVC</label>
                    <input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="CVC" style={{ width: '100%', background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.text, fontFamily: t.mono, fontSize: 14, outline: 'none' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', background: t.surface2, borderRadius: 12, marginBottom: 24 }}>
                <p style={{ color: t.textMuted, marginBottom: 12, fontSize: 13 }}>Indtast dit telefonnummer:</p>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+45 12 34 56 78" style={{ background: 'transparent', border: 'none', outline: 'none', color: t.text, fontFamily: t.mono, fontSize: 22, fontWeight: 700, textAlign: 'center', width: '100%' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn t={t} variant="secondary" onClick={onClose} wide>Annuller</Btn>
              <Btn t={t} onClick={handlePay} wide>Godkend betaling</Btn>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 52, height: 52, border: `4px solid ${t.border}`, borderTop: `4px solid ${t.accent}`, borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 0.8s linear infinite' }} />
            <Display t={t} size={24} style={{ marginBottom: 8 }}>Behandler betaling…</Display>
            <p style={{ color: t.textMuted, fontSize: 13 }}>Opretter sikkert abonnement via Stripe</p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <Display t={t} size={32} style={{ marginBottom: 12 }}>Velkommen til Premium!</Display>
            <p style={{ color: t.textMuted, fontSize: 13.5, lineHeight: 1.6, marginBottom: 28 }}>
              Din konto er nu opgraderet. Du har fuld adgang til alle lektioner, AI Coach og play-alongs.
            </p>
            <Btn t={t} onClick={onClose} wide size="lg">Begynd at øve</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const router = useRouter();
  const { user, syncCompletedExercises, syncPremiumStatus } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dark, setDark] = useState(false); // Default to Light mode
  const [selectedCategory, setSelectedCategory] = useState<'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null>(null);
  const [view, setView] = useState<ViewId>('home');
  const [coachOpen, setCoachOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [, setPlan] = useState<UserPlan | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const t = useMemo(() => mkT(dark), [dark]);
  // Sync state with user profile
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        setCompletedIds(user.completedExercises || []);
        setIsPremium(user.isPremium || false);
      } else {
        setCompletedIds(getCompletedExercises());
        setIsPremium(getPremiumStatus());
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (mobile) {
      router.replace('/prototype');
      return;
    }

    const timer = setTimeout(() => {
      setMounted(true);
      setIsMobile(mobile);
      setPlan(getUserPlan());
      if (!user) {
        setCompletedIds(getCompletedExercises());
        setIsPremium(getPremiumStatus());
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [router, user]);

  const openCheckout = () => setShowCheckout(true);
  const handlePremiumSuccess = () => {
    setIsPremium(true);
    syncPremiumStatus(true);
  };
  const handleReset = () => {
    resetMockDatabase();
    setIsPremium(false);
    setCompletedIds([]);
    setPlan(null);
    if (user) {
      syncCompletedExercises([]);
      syncPremiumStatus(false);
    }
  };

  // Loading / redirect state
  if (!mounted || isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#252525' }}>
          Pocket Drummer<span style={{ color: '#F25545' }}>.</span>
        </div>
      </div>
    );
  }

  // Render current view
  let content: React.ReactNode;
  if (view === 'home') {
    content = (
      <HomeView
        t={t}
        dark={dark}
        setDark={setDark}
        onView={setView}
        isPremium={isPremium}
        onUpgrade={openCheckout}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setView('category');
        }}
      />
    );
  }
  else if (view === 'category') {
    content = (
      <CategoryDetailView
        t={t}
        category={selectedCategory || 'opvarmning'}
        onBack={() => { setView('home'); setSelectedCategory(null); }}
        isPremium={isPremium}
        onUpgrade={openCheckout}
      />
    );
  }
  else if (view === 'exercises') content = <ExercisesView t={t} isPremium={isPremium} onUpgrade={openCheckout} completedIds={completedIds} />;
  else if (view === 'studio') content = <StudioView t={t} dark={dark} />;
  else if (view === 'profile') content = <ProfileView t={t} dark={dark} setDark={setDark} isPremium={isPremium} onUpgrade={openCheckout} completedIds={completedIds} onReset={handleReset} onNavigateExercises={() => setView('exercises')} />;

  const hideCoach = view === 'studio';

  return (
    <div style={{ width: '100vw', height: '100vh', background: t.bg, color: t.text, fontFamily: t.font, display: 'flex', overflow: 'hidden' }}>
      <Sidebar
        t={t}
        view={view}
        onView={setView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dark={dark}
        isPremium={isPremium}
        onUpgrade={openCheckout}
      />
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {content}
        {!hideCoach && (
          <CoachPanel
            t={t}
            dark={dark}
            open={coachOpen}
            onToggle={() => setCoachOpen(!coachOpen)}
            isPremium={isPremium}
            onUpgrade={openCheckout}
            onNavigate={(v, cat) => {
              if (cat) { setSelectedCategory(cat); setView('category'); }
              else setView(v);
              setCoachOpen(false);
            }}
          />
        )}
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal t={t} onClose={() => setShowCheckout(false)} onSuccess={handlePremiumSuccess} />
      )}

    </div>
  );
}


## src/app/onboarding/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { saveUserGoal, saveUserPlan } from '@/lib/mockData';

const GOAL_TAGS = [
  "Hi-hat kontrol",
  "Rudiments & Hvirvler",
  "Jazz Swing",
  "Funk Syncoper",
  "Koordination",
  "Fills og kombinationer",
];

// step: 0 = mål, 1 = niveau, 2 = øvetid
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyserer dine mål...");
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeTextGoal, setFreeTextGoal] = useState("");
  const [level, setLevel] = useState<'begynder' | 'mellemniveau' | 'øvet'>('begynder');
  const [practiceMinutes, setPracticeMinutes] = useState(20);
  const [timeframe, setTimeframe] = useState("3 måneder");

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => { if (step > 0) setStep(s => s - 1); };

  const handleSubmit = async () => {
    setErrorMsg('');
    setLoading(true);
    setLoadingMessage("Din personlige trommelærer analyserer dine mål...");

    const timers = [
      setTimeout(() => setLoadingMessage("Tilpasser øvelserne til dit niveau..."), 1500),
      setTimeout(() => setLoadingMessage("Sammensætter din 4-ugers plan..."), 3000),
      setTimeout(() => setLoadingMessage("Færdiggør milepæle og kalender..."), 4500),
    ];

    try {
      const compiledGoalDescription =
        freeTextGoal.trim() ||
        (selectedTags.length > 0 ? `Forbedre: ${selectedTags.join(', ')}` : "Generel tromme progression");

      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maal: compiledGoalDescription,
          niveau: level,
          tidPrDag: practiceMinutes,
          tidshorisont: timeframe,
        }),
      });

      if (!response.ok) throw new Error("Kunne ikke oprette læringsplan");

      const planData = await response.json();

      saveUserGoal({
        beskrivelse: compiledGoalDescription,
        tidshorisont: timeframe,
        aktiv: true,
        oprettet: new Date().toISOString(),
        delmål: selectedTags.length > 0
          ? selectedTags.slice(0, 3)
          : ["Følg daglige øvelser", "Styrk timing", "Øv med metronom"],
      });

      saveUserPlan({
        goal_id: 'active-goal',
        uge_start: new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long' }),
        fokustema: planData.fokustema || "Uge 1: Grundlæggende færdigheder",
        milepæl: planData.milepæl || "Kunne gennemføre ugens øvelser stabilt",
        øvelser: planData.øvelser || [],
      });

      timers.forEach(t => clearTimeout(t));
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      timers.forEach(t => clearTimeout(t));
      setLoading(false);
      setErrorMsg("Der skete en fejl under plan-genereringen. Tjek din internetforbindelse og prøv igen.");
    }
  };

  const goalsValid = selectedTags.length > 0 || freeTextGoal.trim().length > 0;

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem' }}>

          {loading ? (
            <div className="text-center p-3">
              <div style={{
                border: '4px solid rgba(255, 255, 255, 0.1)',
                borderTop: '4px solid var(--accent-purple)',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                animation: 'spin 1.2s linear infinite',
                margin: '2rem auto',
              }} />
              <h2 className="mb-2" style={{ fontSize: '1.8rem' }}>Skaber din læringsplan</h2>
              <p className="text-purple" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{loadingMessage}</p>
              <style jsx global>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div>
              {/* Progress dots — 3 trin */}
              <div
                role="progressbar"
                aria-valuenow={step + 1}
                aria-valuemin={1}
                aria-valuemax={3}
                aria-label={`Trin ${step + 1} af 3`}
                style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}
              >
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: i === step ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i <= step ? 'var(--accent-purple)' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.25s ease',
                  }} />
                ))}
              </div>

              {/* Trin 0: Mål */}
              {step === 0 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvad vil du gerne blive bedre til?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Vælg et eller flere fokusområder — eller skriv dit eget mål nedenfor.
                  </p>

                  <div className="tag-select mb-3" role="group" aria-label="Fokusområder">
                    {GOAL_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                        aria-pressed={selectedTags.includes(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="form-group mt-3">
                    <label className="form-label" htmlFor="free-text-goal">Eget mål (valgfrit)</label>
                    <input
                      id="free-text-goal"
                      type="text"
                      className="form-control"
                      placeholder="F.eks. lære at spille 'In The Air Tonight'..."
                      value={freeTextGoal}
                      onChange={(e) => setFreeTextGoal(e.target.value)}
                      aria-label="Skriv dit eget mål"
                    />
                  </div>

                  {!goalsValid && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Vælg mindst ét fokusområde, eller skriv dit eget mål.
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                      onClick={handleNext}
                      className="btn btn-primary"
                      disabled={!goalsValid}
                    >
                      Næste <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 1: Niveau */}
              {step === 1 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvad er dit nuværende niveau?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Det afgør sværhedsgraden af de øvelser din plan indeholder.
                  </p>

                  <div role="radiogroup" aria-label="Vælg dit niveau" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
                    <label
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderColor: level === 'begynder' ? 'var(--accent-cyan)' : 'var(--border-color)', padding: '1.25rem' }}
                    >
                      <input type="radio" name="level" value="begynder" checked={level === 'begynder'} onChange={() => setLevel('begynder')} className="sr-only" />
                      <div>
                        <h4 className="text-cyan">Begynder</h4>
                        <p style={{ fontSize: '0.85rem' }}>0–2 år. Grundlæggende rytmer og stikteknik er i fokus.</p>
                      </div>
                    </label>

                    <label
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderColor: level === 'mellemniveau' ? 'var(--accent-purple)' : 'var(--border-color)', padding: '1.25rem' }}
                    >
                      <input type="radio" name="level" value="mellemniveau" checked={level === 'mellemniveau'} onChange={() => setLevel('mellemniveau')} className="sr-only" />
                      <div>
                        <h4 className="text-purple">Mellemniveau</h4>
                        <p style={{ fontSize: '0.85rem' }}>2–5 år. Spiller måske i band — vil udfordres på dynamik og fills.</p>
                      </div>
                    </label>

                    <label
                      className="glass-card flex align-center gap-2 cursor-pointer"
                      style={{ borderColor: level === 'øvet' ? 'var(--accent-emerald)' : 'var(--border-color)', padding: '1.25rem' }}
                    >
                      <input type="radio" name="level" value="øvet" checked={level === 'øvet'} onChange={() => setLevel('øvet')} className="sr-only" />
                      <div>
                        <h4 className="text-emerald">Øvet</h4>
                        <p style={{ fontSize: '0.85rem' }}>5+ år. Kender rudiments — vil mestre uafhængighed og stilarter.</p>
                      </div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button onClick={handleBack} className="btn btn-secondary">
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button onClick={handleNext} className="btn btn-primary">
                      Næste <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 2: Øvetid */}
              {step === 2 && (
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.8rem' }}>Hvor meget kan du øve dig?</h2>
                  <p className="text-muted-color mb-3" style={{ fontSize: '0.9rem' }}>
                    Din daglige rutine tilpasses din hverdag — ikke omvendt.
                  </p>

                  <div className="form-group mb-3">
                    <label className="form-label flex justify-between">
                      <span>Daglig øvetid</span>
                      <span className="text-purple" style={{ fontWeight: 700 }}>{practiceMinutes} minutter</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      className="w-full"
                      value={practiceMinutes}
                      onChange={(e) => setPracticeMinutes(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-muted-color" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      <span>5 min</span>
                      <span>30 min</span>
                      <span>60 min</span>
                    </div>
                  </div>

                  <div className="form-group mt-3">
                    <label className="form-label">Tidshorisont</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      {["1 måned", "3 måneder", "6 måneder", "1 år"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`btn ${timeframe === time ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => setTimeframe(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {errorMsg && (
                    <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', fontSize: '0.875rem', color: '#f87171' }}>
                      {errorMsg}
                      <button
                        onClick={() => { setErrorMsg(''); handleSubmit(); }}
                        style={{ marginLeft: '0.75rem', background: 'none', border: 'none', color: '#f87171', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Prøv igen
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <button onClick={handleBack} className="btn btn-secondary">
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button onClick={handleSubmit} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' }}>
                      Skab min læringsplan <Sparkles size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

## src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import Header from '@/components/Header';

type Mode = 'login' | 'signup' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const { login, signUpWithEmail, signInWithEmail, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) { setErrorMsg('Skriv dit navn.'); setLoading(false); return; }
        await signUpWithEmail(email, password, displayName.trim());
        router.push('/dashboard');
      } else if (mode === 'login') {
        await signInWithEmail(email, password);
        router.push('/dashboard');
      } else {
        await resetPassword(email);
        setSuccessMsg('Vi har sendt et link til at nulstille dit kodeord.');
        setMode('login');
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') setErrorMsg('Denne email er allerede registreret. Log ind i stedet.');
      else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setErrorMsg('Forkert kodeord. Prøv igen eller nulstil det.');
      else if (code === 'auth/user-not-found') setErrorMsg('Vi kan ikke finde en konto med den email.');
      else if (code === 'auth/weak-password') setErrorMsg('Kodeordet skal være mindst 6 tegn.');
      else if (code === 'auth/invalid-email') setErrorMsg('Ugyldig email-adresse.');
      else setErrorMsg('Der opstod en fejl. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login();
      router.push('/dashboard');
    } catch {
      setErrorMsg('Google-login fejlede. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
              {mode === 'signup' ? 'Opret konto' : mode === 'reset' ? 'Nulstil kodeord' : 'Log ind'}
            </h1>
            <p className="text-muted-color" style={{ fontSize: '0.9rem' }}>
              {mode === 'signup'
                ? 'Lav en konto og start din rejse som trommeslager.'
                : mode === 'reset'
                ? 'Vi sender dig et link til at vælge et nyt kodeord.'
                : 'Velkommen tilbage.'}
            </p>
          </div>

          {successMsg && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.875rem', color: '#5dd39e' }}>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', fontSize: '0.875rem', color: '#f87171' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="displayName">Dit navn</label>
                <input
                  id="displayName"
                  type="text"
                  className="form-control"
                  placeholder="Hvad skal vi kalde dig?"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="din@email.dk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'email' : 'username'}
              />
            </div>

            {mode !== 'reset' && (
              <div className="form-group">
                <label className="form-label" htmlFor="password">Kodeord</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder={mode === 'signup' ? 'Mindst 6 tegn' : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading
                ? 'Arbejder...'
                : mode === 'signup'
                ? 'Opret konto'
                : mode === 'reset'
                ? 'Send nulstillingslink'
                : 'Log ind'}
            </button>
          </form>

          {mode !== 'reset' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span className="text-muted-color" style={{ fontSize: '0.8rem' }}>eller</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="btn btn-secondary w-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Fortsæt med Google
              </button>
            </>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('signup'); setErrorMsg(''); }} className="btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent-purple)' }}>
                  Har du ikke en konto? Opret dig
                </button>
                <button onClick={() => { setMode('reset'); setErrorMsg(''); }} className="btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Glemt kodeord?
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button onClick={() => { setMode('login'); setErrorMsg(''); }} className="btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent-purple)' }}>
                Har du allerede en konto? Log ind
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => { setMode('login'); setErrorMsg(''); }} className="btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent-purple)' }}>
                Tilbage til login
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

## src/app/exercise/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  Download, 
  Volume2, 
  Sparkles, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  getSavedExercises, 
  toggleExerciseCompleted, 
  getCompletedExercises,
  getUserPlan,
  saveUserPlan,
  Exercise 
} from '@/lib/mockData';
import { jsPDF } from 'jspdf';
import * as Tone from 'tone';

// Hent OsmdRenderer dynamisk uden SSR for at undgå 'window is not defined' fejl
const OsmdRenderer = dynamic(() => import('@/components/OsmdRenderer'), { ssr: false });

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExercisePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);
  
  // Player states
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [, setVideoTime] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [currentMeasure, setCurrentMeasure] = useState(1);
  
  // Tone.js MIDI states
  const [midiPlaying, setMidiPlaying] = useState(false);
  const [tempo, setTempo] = useState(100);
  const [activeBeat, setActiveBeat] = useState(0); // 0-3 for visual metronome
  const [metronomeSound, setMetronomeSound] = useState(true);

  // Refs
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const toneLoopRef = useRef<Tone.Loop | null>(null);
  const bassSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const snareSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const hihatSynthRef = useRef<Tone.MetalSynth | null>(null);

  useEffect(() => {
    const exercises = getSavedExercises();
    const found = exercises.find(e => e.id === id);
    setTimeout(() => {
      if (found) {
        setExercise(found);
        setTempo(found.tempo);
        const completedList = getCompletedExercises();
        setCompleted(completedList.includes(found.id));
      }
      setLoading(false);
    }, 0);
  }, [id]);

  // Ryd op i lyde, når komponenten fjernes
  useEffect(() => {
    return () => {
      stopMidiPlayback();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const syncMeasureWithTime = (time: number) => {
      if (!exercise) return;
      const secondsPerBeat = 60 / exercise.tempo;
      const secondsPerMeasure = 4 * secondsPerBeat; // 4/4 takt
      
      // Beregn taktnummer
      const calculatedMeasure = Math.floor((time % (exercise.takter * secondsPerMeasure)) / secondsPerMeasure) + 1;
      setCurrentMeasure(calculatedMeasure);
    };

    const handleYoutubeIframeState = () => {
      if (videoPlaying) {
        // Start polling af video tid (YouTube IFrame Player API postMessage)
        videoIntervalRef.current = setInterval(() => {
          // En simpel simulation af tid, hvis vi ikke har komplet API hook
          setVideoTime(prev => {
            const nextTime = prev + 0.1;
            syncMeasureWithTime(nextTime);
            return nextTime;
          });
        }, 100);
      } else {
        if (videoIntervalRef.current) {
          clearInterval(videoIntervalRef.current);
          videoIntervalRef.current = null;
        }
      }
    };

    handleYoutubeIframeState();
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [videoPlaying, exercise]);

  const handleToggleCompleted = () => {
    if (!exercise) return;
    const isCompleted = toggleExerciseCompleted(exercise.id);
    setCompleted(isCompleted);
  };

  const handleAdjustPlan = () => {
    const plan = getUserPlan();
    if (!plan) return;

    // AI-justering: Claude replanlægger
    // Vi shuffler eller fjerner vanskelige øvelser (fx ex-7 eller ex-8 hvis begynder, og erstatter med ex-1/ex-2)
    const adjustedExercises = plan.øvelser.map(pe => {
      // Hvis det er en øvet øvelse, erstat den med en nemmere rudiment
      if (pe.exercise_id === 'ex-7' || pe.exercise_id === 'ex-8') {
        return { ...pe, exercise_id: 'ex-1' }; // Erstat med Single Stroke Roll
      }
      return pe;
    });

    const updatedPlan = {
      ...plan,
      fokustema: "AI Justeret: Fokuseret stikteknik og groove (Niveau tilpasset)",
      milepæl: "Spil stabil rockgroove ved 95 BPM i 2 minutter",
      øvelser: adjustedExercises
    };

    saveUserPlan(updatedPlan);
    setToast({ msg: "Læringsplanen er justeret — øvelserne er tilpasset dit niveau.", type: 'success' });
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  // Tone.js MIDI syntetisering af trommelyde
  const initToneSynths = () => {
    if (bassSynthRef.current) return;

    // Bass drum synth
    bassSynthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 5,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).toDestination();

    // Snare drum noise synth with a bandpass shaper
    const snareFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 1100,
      Q: 1.0
    }).toDestination();

    snareSynthRef.current = new Tone.NoiseSynth({
      volume: -3,
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.14, sustain: 0 }
    }).connect(snareFilter);

    // Hi-hat metal synth with realistic metallic sweep
    const hihatSynth = new Tone.MetalSynth({
      volume: -10,
      envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
      resonance: 6000,
      harmonicity: 5.2
    }).toDestination();
    hihatSynth.frequency.value = 250;
    hihatSynthRef.current = hihatSynth;
  };

  const startMidiPlayback = async () => {
    await Tone.start();
    initToneSynths();
    stopMidiPlayback(); // Sikr ingen overskrivende loops

    // Opdater tempoet i Tone Transport
    Tone.getTransport().bpm.value = tempo;

    // Vi laver en 8.-dels trigger (8 slag pr. 4/4 takt)
    let step = 0;
    
    toneLoopRef.current = new Tone.Loop((time) => {
      const beatNum = Math.floor(step / 2); // 0-3 beats
      const isOffbeat = step % 2 !== 0;     // og-slag
      
      // Opdater visuel metronom på beatsene
      if (!isOffbeat) {
        Tone.Draw.schedule(() => {
          setActiveBeat(beatNum);
          // Hver takt har 4 beats, så opdater nodemarkøren
          if (beatNum === 0) {
            setCurrentMeasure(prev => {
              if (exercise && prev >= exercise.takter) return 1;
              return prev + 1;
            });
          }
        }, time);
      }

      if (metronomeSound) {
        // Spil trommelyde ud fra øvelseskategori
        if (exercise?.kategori === 'rudiments') {
          // Rudiment Single Stroke Roll (højre/venstre)
          // Spiller 16. dele, så vi trigger på alle trin
          snareSynthRef.current?.triggerAttack(time);
        } else if (exercise?.kategori === 'fills' && step >= 8) {
          // Anden takt i fills: spil tam-tam overgange
          // Vi simulerer snare på beat 1, tom 1 på beat 2, tom 2 på beat 3, floor tom på beat 4
          if (beatNum === 0) snareSynthRef.current?.triggerAttack(time);
          if (beatNum === 1) bassSynthRef.current?.triggerAttack(time, 150); // tom 1
          if (beatNum === 2) bassSynthRef.current?.triggerAttack(time, 100); // tom 2
          if (beatNum === 3) bassSynthRef.current?.triggerAttack(time, 70);  // floor tom
        } else {
          // Standard Rock/Groove mønster:
          // Hi-hat på alle 8. dele
          hihatSynthRef.current?.triggerAttack(time);
          
          // Stortromme på 1 og 3 (trin 0 og 4)
          if (step === 0 || step === 4 || step === 5) {
            bassSynthRef.current?.triggerAttack(time, "C1");
          }
          
          // Lilletromme på 2 og 4 (trin 2 og 6)
          if (step === 2 || step === 6) {
            snareSynthRef.current?.triggerAttack(time);
          }
        }
      }

      // Gå til næste step i en takt (0-7 for 8. dele)
      step = (step + 1) % 8;
    }, "8n");

    toneLoopRef.current.start(0);
    Tone.getTransport().start();
    setMidiPlaying(true);
  };

  function stopMidiPlayback() {
    if (toneLoopRef.current) {
      toneLoopRef.current.stop();
      toneLoopRef.current.dispose();
      toneLoopRef.current = null;
    }
    Tone.getTransport().stop();
    setMidiPlaying(false);
    setActiveBeat(0);
  }

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    if (midiPlaying) {
      Tone.getTransport().bpm.value = newTempo;
    }
  };

  const handleMidiToggle = () => {
    if (midiPlaying) {
      stopMidiPlayback();
    } else {
      startMidiPlayback();
    }
  };

  // PDF Eksport af nodearket
  const handlePdfExport = () => {
    if (!exercise) return;

    // Hent SVG noden
    const svgElement = document.querySelector('#osmd-svg-container svg') as SVGElement;
    if (!svgElement) {
      alert("Noderne er ikke færdigindlæst endnu. Prøv igen om et øjeblik.");
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Højopløselig konvertering
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        // A4 dimensioner er 210 x 297 mm
        const imgWidth = 190;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("POCKET DRUMMER - INTERAKTIVE NODER", 15, 20);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.text(`Øvelse: ${exercise.titel} (${exercise.sværhedsgrad})`, 15, 28);
        pdf.text(`Standard Tempo: ${exercise.tempo} BPM · Kategori: ${exercise.kategori}`, 15, 34);
        
        pdf.addImage(imgData, 'PNG', 10, 45, imgWidth, imgHeight);
        
        pdf.setFontSize(9);
        pdf.text("Genereret via Pocket Drummer v1.2. Alle rettigheder forbeholdes.", 15, 280);
        
        pdf.save(`Pocket_Drummer_${exercise.titel.replace(/\s+/g, '_')}.pdf`);
      };
    } catch (e) {
      console.error("PDF Export error:", e);
      alert("Kunne ikke eksportere til PDF. Denne browser understøtter muligvis ikke funktionen.");
    }
  };

  if (loading) {
    return (
      <div className="grid-bg flex flex-column justify-between" style={{ minHeight: '100vh' }}>
        <Header />
        <div className="text-center p-3">Indlæser øvelse...</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="grid-bg flex flex-column justify-between" style={{ minHeight: '100vh' }}>
        <Header />
        <div className="text-center p-3">
          <AlertTriangle size={48} className="text-purple m-auto mb-2" />
          <h2>Øvelsen blev ikke fundet</h2>
          <Link href="/dashboard" className="btn btn-primary mt-2">Gå til Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 200, background: toast.type === 'success' ? '#10b981' : '#3b82f6', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      {/* Player Layout */}
      <div className="player-container">
        
        {/* Top bar with controls */}
        <div style={{ background: 'rgba(8, 9, 13, 0.9)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 2.0rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex align-center gap-2">
            <Link href="/dashboard" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <div>
              <h2 style={{ fontSize: '1.2rem' }}>{exercise.titel}</h2>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{exercise.kategori}</span>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginLeft: '0.25rem' }}>{exercise.sværhedsgrad}</span>
            </div>
          </div>
          
          <div className="flex align-center gap-2">
            <button 
              onClick={handleAdjustPlan} 
              className="btn btn-secondary btn-sm text-purple" 
              style={{ borderColor: 'var(--accent-purple)' }}
            >
              <Sparkles size={14} /> For svær? AI-justér plan
            </button>

            <button 
              onClick={handleToggleCompleted} 
              className={`btn btn-sm ${completed ? 'btn-secondary' : 'btn-primary'}`}
            >
              <CheckCircle size={14} /> 
              {completed ? 'Gennemført ✓' : 'Markér som gennemført'}
            </button>
          </div>
        </div>

        {/* Split Screen Video + Sheet Music */}
        <div className="player-main">
          
          {/* Left panel: YouTube player */}
          <div className="video-section">
            <div className="youtube-wrapper">
              <iframe 
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${exercise.youtube_video_id}?enablejsapi=1&rel=0&autoplay=0&showinfo=0`}
                title={exercise.titel}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Controls Sync Simulator */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <button 
                onClick={() => setVideoPlaying(!videoPlaying)} 
                className="btn btn-primary btn-sm"
              >
                {videoPlaying ? <Pause size={14} /> : <Play size={14} />} Video Sync {videoPlaying ? 'Aktiv' : 'Slå til'}
              </button>
              <span style={{ fontSize: '0.8rem', color: '#bbb' }}>
                Cursor synkroniseres automatisk med videoafspilleren
              </span>
            </div>
          </div>

          {/* Right panel: OSMD interactive sheet music */}
          <div className="notation-section">
            <div className="notation-header">
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>INTERAKTIVE NODER (OSMD)</span>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', minWidth: '30px' }}
                >
                  -
                </button>
                <span style={{ fontSize: '0.8rem', alignSelf: 'center', color: 'var(--text-secondary)' }}>
                  Zoom: {Math.round(zoom * 100)}%
                </span>
                <button 
                  onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', minWidth: '30px' }}
                >
                  +
                </button>

                <button 
                  onClick={handlePdfExport} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.3rem 0.6rem' }}
                >
                  <Download size={14} /> Hent PDF
                </button>
              </div>
            </div>

            {/* OSMD Sheet Music container */}
            <div className="notation-scrollable">
              {exercise.musicxml_data && (
                <OsmdRenderer 
                  xmlData={exercise.musicxml_data} 
                  zoom={zoom} 
                  currentMeasure={currentMeasure}
                />
              )}
            </div>

            {/* Metronome & MIDI Tone.js playback controls */}
            <div className="tempo-controls-panel">
              <div className="flex align-center gap-2">
                <button 
                  onClick={handleMidiToggle} 
                  className={`btn ${midiPlaying ? 'btn-danger' : 'btn-accent'} btn-sm`}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {midiPlaying ? <Pause size={14} /> : <Play size={14} />} Lyt til noder (MIDI)
                </button>

                {midiPlaying && (
                  <div className="metronome-visualizer">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`metronome-beat ${i === 0 ? 'downbeat' : ''} ${activeBeat === i ? 'active' : ''}`}
                      ></span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tempo Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '250px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '60px' }}>{tempo} BPM</span>
                <input 
                  type="range" 
                  min="50" 
                  max="180" 
                  value={tempo} 
                  onChange={(e) => handleTempoChange(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={() => setMetronomeSound(!metronomeSound)} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: metronomeSound ? 'var(--accent-purple)' : 'var(--text-muted)' }}
                  title="Slå metrononlyd til/fra"
                >
                  <Volume2 size={18} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

## src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';

export default function DashboardRedirect() {
  redirect('/');
}

## src/app/drumkit/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Play, Download, Volume2, ArrowLeft, Disc, Drum, Home, BookOpen, User } from 'lucide-react';

export default function DrumkitPage() {
  const router = useRouter();
  const [kitType, setKitType] = useState<'akustisk' | 'elektronisk'>('akustisk');
  const [volume, setVolume] = useState(-6); // dB
  const [activePad, setActivePad] = useState<string | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<{ drum: string; time: number }[]>([]);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const recordingStartTime = useRef<number>(0);
  const playbackTimers = useRef<NodeJS.Timeout[]>([]);

  // Synthesizers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kickSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snareSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hihatSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tomSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cymbalSynth = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeNodeRef = useRef<any>(null);
  const audioContextStarted = useRef(false);

  const updateVolumes = () => {
    import('tone').then(() => {
      if (volumeNodeRef.current) {
        volumeNodeRef.current.volume.value = volume;
      }

      if (kitType === 'elektronisk') {
        if (kickSynth.current?.oscillator) kickSynth.current.oscillator.type = 'square';
      } else {
        if (kickSynth.current?.oscillator) kickSynth.current.oscillator.type = 'sine';
      }
    });
  };

  const triggerDrum = (drumId: string) => {
    if (!audioContextStarted.current) {
      import('tone').then((Tone) => {
        Tone.start();
        audioContextStarted.current = true;
      });
    }

    setActivePad(drumId);
    setTimeout(() => setActivePad((current) => current === drumId ? null : current), 120);

    if (isRecording) {
      const elapsed = Date.now() - recordingStartTime.current;
      setRecordedNotes(prev => [...prev, { drum: drumId, time: elapsed }]);
    }

    switch (drumId) {
      case 'kick':
        if (kickSynth.current?.triggerAttackRelease) {
          kickSynth.current.triggerAttackRelease(kitType === 'elektronisk' ? 'C1' : 'A0', '8n');
        }
        break;
      case 'snare':
        if (snareSynth.current?.triggerAttack) snareSynth.current.triggerAttack();
        break;
      case 'hihat':
        if (hihatSynth.current?.triggerAttack) hihatSynth.current.triggerAttack();
        break;
      case 'tom1':
        if (tomSynth.current?.triggerAttackRelease) tomSynth.current.triggerAttackRelease('F2', '8n');
        break;
      case 'tom2':
        if (tomSynth.current?.triggerAttackRelease) tomSynth.current.triggerAttackRelease('D2', '8n');
        break;
      case 'floor':
        if (tomSynth.current?.triggerAttackRelease) tomSynth.current.triggerAttackRelease('G1', '8n');
        break;
      case 'crash':
        if (cymbalSynth.current?.triggerAttack) cymbalSynth.current.triggerAttack();
        break;
      case 'ride':
        if (cymbalSynth.current?.triggerAttack) cymbalSynth.current.triggerAttack();
        break;
    }
  };

  useEffect(() => {
    // Dynamic client-side load of Tone.js
    import('tone').then((Tone) => {
      const volNode = new Tone.Volume(volume).toDestination();
      volumeNodeRef.current = volNode;

      kickSynth.current = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 5,
        envelope: { sustain: 0, attack: 0.001, decay: 0.22 }
      }).connect(volNode);

      const snareFilter = new Tone.Filter({
        type: 'bandpass',
        frequency: 1100,
        Q: 1.0
      }).connect(volNode);

      snareSynth.current = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.16, sustain: 0 }
      }).connect(snareFilter);

      const hihat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
        resonance: 6000,
        harmonicity: 6.2
      }).connect(volNode);
      hihat.frequency.value = 250;
      hihatSynth.current = hihat;

      tomSynth.current = new Tone.MembraneSynth({
        pitchDecay: 0.09,
        octaves: 4,
        envelope: { sustain: 0, attack: 0.002, decay: 0.32 }
      }).connect(volNode);

      const cymbal = new Tone.MetalSynth({
        envelope: { attack: 0.002, decay: 0.9, sustain: 0 },
        resonance: 8500,
        harmonicity: 7.2
      }).connect(volNode);
      cymbal.frequency.value = 280;
      cymbalSynth.current = cymbal;

      updateVolumes();
    });

    // Keyboard bindings listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      let drumId = '';

      switch (key) {
        case 'q': drumId = 'crash'; break;
        case 'w': drumId = 'tom1'; break;
        case 'e': drumId = 'tom2'; break;
        case 'r': drumId = 'ride'; break;
        case 'a': drumId = 'hihat'; break;
        case 's': drumId = 'snare'; break;
        case 'd': drumId = 'floor'; break;
        case ' ': // Spacebar for Kick
          e.preventDefault();
          drumId = 'kick'; 
          break;
        default: return;
      }

      if (drumId) {
        triggerDrum(drumId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      playbackTimers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update volume & kit-type variables
  useEffect(() => {
    updateVolumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, kitType]);

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setRecordedNotes([]);
      setIsRecording(true);
      recordingStartTime.current = Date.now();
    }
  };

  const handlePlayback = () => {
    if (recordedNotes.length === 0 || isPlayingBack) return;

    setIsPlayingBack(true);
    playbackTimers.current.forEach(clearTimeout);
    playbackTimers.current = [];

    recordedNotes.forEach(note => {
      const timer = setTimeout(() => {
        triggerDrum(note.drum);
      }, note.time);
      playbackTimers.current.push(timer);
    });

    const lastNoteTime = recordedNotes[recordedNotes.length - 1].time;
    const finalTimer = setTimeout(() => {
      setIsPlayingBack(false);
    }, lastNoteTime + 800);
    playbackTimers.current.push(finalTimer);
  };

  const handleDownloadMIDI = () => {
    if (recordedNotes.length === 0) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordedNotes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `drumm_optagelse_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getPadClass = (padId: string) => {
    return `drum-pad pad-${padId} ${activePad === padId ? 'active' : ''}`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="content-has-bottom-nav">
      <Header />

      <main style={{ flex: 1, background: 'var(--bg-deep)', padding: '2rem' }} className="grid-bg">
        <div className="glass-card" style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2rem' }}>
          
          <div className="flex align-center justify-between mb-4">
            <button onClick={() => router.push('/dashboard')} className="btn btn-secondary btn-sm flex align-center gap-1">
              <ArrowLeft size={16} /> Dashboard
            </button>
            <h2 className="font-title text-center" style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              VIRTUELT TROMMESÆT
            </h2>
            <div style={{ width: '80px' }}></div>
          </div>

          {/* Toggle controls & volume slider */}
          <div className="flex justify-between align-center gap-3 mb-4" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
            
            <div className="flex align-center gap-2">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LYDPROFIL:</span>
              <div className="calendar-toggle" style={{ margin: 0 }}>
                <button 
                  onClick={() => setKitType('akustisk')} 
                  className={`calendar-toggle-btn ${kitType === 'akustisk' ? 'active' : ''}`}
                  style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}
                >
                  Akustisk
                </button>
                <button 
                  onClick={() => setKitType('elektronisk')} 
                  className={`calendar-toggle-btn ${kitType === 'elektronisk' ? 'active' : ''}`}
                  style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}
                >
                  Elektronisk
                </button>
              </div>
            </div>

            <div className="flex align-center gap-2" style={{ minWidth: '200px' }}>
              <Volume2 size={18} className="text-muted-color" />
              <input 
                type="range" 
                min="-24" 
                max="0" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-purple)' }}
              />
              <span style={{ fontSize: '0.8rem', width: '35px', textAlign: 'right', fontFamily: 'monospace' }}>
                {volume === -24 ? 'MUT' : `${volume}dB`}
              </span>
            </div>
          </div>

          {/* Virtual drum kit pads area */}
          <div className="drumkit-container" role="group" aria-label="Virtuelt trommesæt">

            <button onClick={() => triggerDrum('crash')} className={getPadClass('crash')} aria-label="Crash cymbal (tast Q)" aria-pressed={activePad === 'crash'}>
              <div className="pad-label">CRASH</div>
              <div className="pad-key">Q</div>
            </button>

            <button onClick={() => triggerDrum('ride')} className={getPadClass('ride')} aria-label="Ride cymbal (tast R)" aria-pressed={activePad === 'ride'}>
              <div className="pad-label">RIDE</div>
              <div className="pad-key">R</div>
            </button>

            <button onClick={() => triggerDrum('hihat')} className={getPadClass('hihat')} aria-label="Hi-hat (tast A)" aria-pressed={activePad === 'hihat'}>
              <div className="pad-label">HI-HAT</div>
              <div className="pad-key">A</div>
            </button>

            <button onClick={() => triggerDrum('tom1')} className={getPadClass('tom1')} aria-label="Tom 1 (tast W)" aria-pressed={activePad === 'tom1'}>
              <div className="pad-label">TOM 1</div>
              <div className="pad-key">W</div>
            </button>

            <button onClick={() => triggerDrum('tom2')} className={getPadClass('tom2')} aria-label="Tom 2 (tast E)" aria-pressed={activePad === 'tom2'}>
              <div className="pad-label">TOM 2</div>
              <div className="pad-key">E</div>
            </button>

            <button onClick={() => triggerDrum('floor')} className={getPadClass('floor')} aria-label="Floor tom (tast D)" aria-pressed={activePad === 'floor'}>
              <div className="pad-label">FLOOR</div>
              <div className="pad-key">D</div>
            </button>

            <button onClick={() => triggerDrum('snare')} className={getPadClass('snare')} aria-label="Lilletromme (tast S)" aria-pressed={activePad === 'snare'}>
              <div className="pad-label">SNARE</div>
              <div className="pad-key">S</div>
            </button>

            <button onClick={() => triggerDrum('kick')} className={getPadClass('kick')} aria-label="Stortromme (tast Space)" aria-pressed={activePad === 'kick'}>
              <div className="pad-label">BASS</div>
              <div className="pad-key">SPACE</div>
            </button>

          </div>

          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {isRecording ? 'Optagelse startet' : isPlayingBack ? 'Afspiller beat' : ''}
          </div>

          {/* Recording & Session Controller */}
          <div className="flex justify-between align-center p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex align-center gap-2">
              <button 
                onClick={handleRecordToggle} 
                className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'} btn-sm flex align-center gap-1`}
              >
                <Disc size={16} className={isRecording ? 'pulse' : ''} />
                {isRecording ? 'STOP OPTAGELSE' : 'OPTAG BEAT'}
              </button>

              <button 
                onClick={handlePlayback} 
                disabled={recordedNotes.length === 0 || isRecording || isPlayingBack}
                className="btn btn-secondary btn-sm flex align-center gap-1"
              >
                <Play size={16} /> AFSPIL ({recordedNotes.length})
              </button>
            </div>

            <button 
              onClick={handleDownloadMIDI} 
              disabled={recordedNotes.length === 0 || isRecording}
              className="btn btn-primary btn-sm flex align-center gap-1"
            >
              <Download size={16} /> GEM DATA
            </button>
          </div>

          <p className="text-muted-color text-center mt-3" style={{ fontSize: '0.8rem' }}>
            Tip: Du kan spille live med dit tastatur! Brug <b>Space</b> til Stortromme, <b>S</b> til Lilletromme og <b>A</b> til Hi-Hat.
          </p>

        </div>
      </main>

      {/* Floating Bottom Nav matching Mockup */}
      <div className="bottom-nav">
        <button onClick={() => router.push('/dashboard')} className="bottom-nav-item">
          <Home size={20} />
          <span>Hjem</span>
        </button>
        <button onClick={() => router.push('/dashboard#library')} className="bottom-nav-item">
          <BookOpen size={20} />
          <span>Øvelser</span>
        </button>
        <button onClick={() => router.push('/drumkit')} className="bottom-nav-item active">
          <Drum size={20} />
          <span>Trommesæt</span>
        </button>
        <button onClick={() => router.push('/onboarding')} className="bottom-nav-item">
          <User size={20} />
          <span>Profil</span>
        </button>
      </div>

      <style jsx global>{`
        .pulse {
          animation: redPulse 1s infinite alternate;
        }
        @keyframes redPulse {
          0% { opacity: 0.5; }
          100% { opacity: 1; color: #f43f5e; }
        }
      `}</style>
    </div>
  );
}

## src/app/prototype/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/lib/authContext';
import { useLanguage } from '@/lib/languageContext';
import TiltCard from '@/components/TiltCard';
import RhythmHero from '@/components/RhythmHero';


// ─────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────
const tokens = (dark: boolean) => ({
  bg: dark ? '#0a0a0a' : '#FAF8F5',
  bgGradient: dark ? '#0a0a0a' : '#FAF8F5',
  surface: dark ? '#161618' : '#ffffff',
  surface2: dark ? '#1f1f22' : '#EBE6DC',
  surfaceElev: dark ? '#262629' : '#ffffff',
  border: dark ? 'rgba(255,255,255,0.07)' : 'rgba(37,37,37,0.08)',
  borderStrong: dark ? 'rgba(255,255,255,0.14)' : 'rgba(37,37,37,0.14)',
  text: dark ? '#f4f1ec' : '#252525',
  textMuted: dark ? '#8a8580' : '#77716B',
  textDim: dark ? '#56524c' : '#A39C94',
  accent: '#F25545',         // coral red
  accentDeep: '#C43425',
  accentSoft: dark ? 'rgba(242,85,69,0.13)' : 'rgba(242,85,69,0.08)',
  accentText: dark ? '#f5b8a8' : '#C43425',
  good: '#5dd39e',
  goodSoft: dark ? 'rgba(93,211,158,0.13)' : 'rgba(93,211,158,0.14)',
  mono: 'var(--font-mono, monospace)',
  font: 'var(--font-sans, sans-serif)',
  serif: 'var(--font-serif, Georgia, serif)',
});

type ThemeTokens = ReturnType<typeof tokens>;

interface ScreenProps {
  t: ThemeTokens;
  dark: boolean;
}

interface HomeScreenProps extends ScreenProps {
  setDark: (dark: boolean) => void;
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
  onOpenCoach: () => void;
  onPlayRhythmHero: () => void;
  guestXp: number;
}

interface PracticeScreenProps extends ScreenProps {
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong') => void;
  onPlayRhythmHero: () => void;
}

interface TrackDetailProps extends ScreenProps {
  trackId: string;
  onClose: () => void;
  onOpenLesson: (id: string) => void;
  onOpenCoach: () => void;
}

interface LessonDetailProps extends ScreenProps {
  lessonId: string;
  onClose: () => void;
  onOpenCoach: () => void;
}

interface StudioKitScreenProps extends ScreenProps {
  onOpenPads: () => void;
}

interface KitPadViewProps extends ScreenProps {
  onClose: () => void;
}

interface CoachScreenProps extends ScreenProps {
  onClose: () => void;
}

interface ProfileScreenProps extends ScreenProps {
  setDark: (dark: boolean) => void;
  guestXp: number;
}

interface TabBarProps {
  tab: string;
  onTab: (tab: string) => void;
  t: ThemeTokens;
  dark: boolean;
  isMobile: boolean;
  onSelectCategory: (cat: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null) => void;
}


// ─────────────────────────────────────────────────────────────
// Icons & illustrations
// ─────────────────────────────────────────────────────────────
interface IcProps extends Omit<React.SVGProps<SVGSVGElement>, 'fill'> {
  size?: number;
  color?: string;
  fill?: boolean;
  sw?: number;
}

const Ic: React.FC<IcProps> = ({ size = 22, color = 'currentColor', children, fill = false, sw = 1.8, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);


const IcSpark = (p: IcProps) => <Ic {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></Ic>;
// const _IcUser = (p: IcProps) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Ic>;
const IcPlay = (p: IcProps) => <Ic {...p} fill><path d="M7 4l13 8-13 8V4z" stroke="none"/></Ic>;
const IcPause = (p: IcProps) => <Ic {...p} fill><rect x="6" y="4" width="4" height="16" rx="1" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" stroke="none"/></Ic>;
const IcBack = (p: IcProps) => <Ic {...p}><path d="M15 5l-7 7 7 7"/></Ic>;
const IcChev = (p: IcProps) => <Ic {...p}><path d="M9 5l7 7-7 7"/></Ic>;
const IcMore = (p: IcProps) => <Ic {...p}><circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></Ic>;
const IcCheck = (p: IcProps) => <Ic {...p}><path d="M4 12l5 5L20 6"/></Ic>;
const IcLock = (p: IcProps) => <Ic {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Ic>;
const IcSun = (p: IcProps) => <Ic {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Ic>;
const IcMoon = (p: IcProps) => <Ic {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></Ic>;
const IcSend = (p: IcProps) => <Ic {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></Ic>;
const IcPlus = (p: IcProps) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>;
const IcMetro = (p: IcProps) => <Ic {...p}><path d="M9 3h6l3 18H6L9 3z"/><path d="M12 14L7 7"/></Ic>;
const IcMic = (p: IcProps) => <Ic {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 12a7 7 0 0 0 14 0M12 19v3"/></Ic>;
const IcTuner = (p: IcProps) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M12 12l4-6"/></Ic>;
const IcFlame = (p: IcProps) => <Ic {...p}><path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s-1 6 4 6 4-4 4-6c0-4-4-7-4-7z"/></Ic>;
const IcClock = (p: IcProps) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>;
const IcTrophy = (p: IcProps) => <Ic {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M5 6H3v2a3 3 0 0 0 3 3M19 6h2v2a3 3 0 0 1-3 3"/><path d="M10 13v3h4v-3M8 20h8"/></Ic>;
const IcBell = (p: IcProps) => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></Ic>;
const IcLogout = (p: IcProps) => <Ic {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></Ic>;
const IcWave = (p: IcProps) => <Ic {...p}><path d="M2 12h2l2-6 4 12 4-16 4 16 2-6h2"/></Ic>;
const IcCalendar = (p: IcProps) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></Ic>;
const IcAttach = (p: IcProps) => <Ic {...p}><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3 3 0 1 1 4 4l-9 9a1 1 0 0 1-2-2l8-8"/></Ic>;
const IcLoop = (p: IcProps) => <Ic {...p}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></Ic>;
const IcMin = (p: IcProps) => <Ic {...p}><path d="M5 12h14"/></Ic>;

function TabHome({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/>
    </svg>
  );
}
function TabPractice({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <path d="M3 12 L5 8 L7 16 L9 6 L11 18 L13 7 L15 17 L17 9 L19 14 L21 12"/>
    </svg>
  );
}
function TabKit({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <ellipse cx="8" cy="12" rx="4" ry="2"/>
      <ellipse cx="16" cy="10" rx="4" ry="2"/>
      <path d="M4 12v5M12 12v5M12 10v5M20 10v6"/>
    </svg>
  );
}
function TabUser({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    </svg>
  );
}

function TabPlayalong({ size = 24, color = 'currentColor', sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Line-art drum illustrations
// ─────────────────────────────────────────────────────────────
function IllSnare({ size = 280, color = '#ef5a3a', sw = 1.4 }) {
  const W = size, H = size * 0.95;
  return (
    <svg width={W} height={H} viewBox="0 0 280 266" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="140" cy="220" rx="125" ry="22" opacity="0.18"/>
      <ellipse cx="140" cy="220" rx="95" ry="16" opacity="0.25"/>
      <line x1="60" y1="20" x2="170" y2="120" strokeWidth={sw + 0.6}/>
      <circle cx="60" cy="20" r="5"/>
      <line x1="220" y1="20" x2="110" y2="120" strokeWidth={sw + 0.6}/>
      <circle cx="220" cy="20" r="5"/>
      <ellipse cx="140" cy="142" rx="78" ry="16"/>
      <line x1="62" y1="142" x2="62" y2="200"/>
      <line x1="218" y1="142" x2="218" y2="200"/>
      <path d="M62 200 Q140 230 218 200"/>
      {[0, 1, 2, 3, 4, 5, 6].map(i => {
        const x = 80 + i * 16.6;
        return <line key={i} x1={x} y1="138" x2={x} y2="150" opacity="0.7"/>;
      })}
      <line x1="62" y1="170" x2="218" y2="170" opacity="0.55"/>
      <line x1="62" y1="180" x2="218" y2="180" opacity="0.35"/>
    </svg>
  );
}

function IllKit({ size = 280, color = '#ef5a3a', sw = 1.3 }) {
  const W = size, H = size * 0.72;
  return (
    <svg width={W} height={H} viewBox="0 0 320 230" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="50" cy="78" rx="34" ry="5"/>
      <line x1="50" y1="78" x2="50" y2="200" opacity="0.7"/>
      <line x1="40" y1="200" x2="60" y2="200"/>
      <ellipse cx="260" cy="50" rx="42" ry="6" transform="rotate(-10 260 50)"/>
      <line x1="260" y1="50" x2="270" y2="200" opacity="0.7"/>
      <line x1="262" y1="200" x2="282" y2="200"/>
      <ellipse cx="290" cy="105" rx="32" ry="5" transform="rotate(8 290 105)"/>
      <ellipse cx="120" cy="110" rx="26" ry="5"/>
      <path d="M94 110 v32 a26 5 0 0 0 52 0 v-32" />
      <ellipse cx="180" cy="110" rx="26" ry="5"/>
      <path d="M154 110 v32 a26 5 0 0 0 52 0 v-32" />
      <ellipse cx="150" cy="170" rx="62" ry="14"/>
      <path d="M88 170 v18 a62 14 0 0 0 124 0 v-18" />
      <ellipse cx="150" cy="172" rx="20" ry="4" opacity="0.6"/>
      <ellipse cx="65" cy="148" rx="22" ry="5"/>
      <path d="M43 148 v22 a22 5 0 0 0 44 0 v-22" />
      <line x1="43" y1="170" x2="87" y2="172" opacity="0.5"/>
      <line x1="65" y1="175" x2="50" y2="208" opacity="0.5"/>
      <line x1="65" y1="175" x2="80" y2="208" opacity="0.5"/>
    </svg>
  );
}

function IllSticks({ size = 80, color = '#ef5a3a', sw = 1.6 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <line x1="6" y1="8" x2="92" y2="50"/>
      <circle cx="6" cy="8" r="3"/>
      <line x1="94" y1="8" x2="8" y2="50"/>
      <circle cx="94" cy="8" r="3"/>
    </svg>
  );
}



interface DrumNotationProps {
  color?: string;
  width?: number;
  accent?: string;
  active?: number;
}

const DrumNotation: React.FC<DrumNotationProps> = ({ color = '#f5f5f7', width = 340, accent = '#ef5a3a', active = 2 }) => {
  const top = 28, lineGap = 9;
  const lines = [0, 1, 2, 3, 4].map(i => top + i * lineGap);
  const W = width;
  const startX = 60;
  const endX = W - 18;
  const span = endX - startX;
  const xs = Array.from({ length: 8 }, (_, i) => startX + (span / 8) * (i + 0.5));

  return (
    <svg width={W} height={130} viewBox={`0 0 ${W} 130`} style={{ display: 'block' }}>
      {lines.map((y, i) => (
        <line key={i} x1={14} y1={y} x2={W - 6} y2={y} stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      ))}
      <line x1={14} y1={lines[0]} x2={14} y2={lines[4]} stroke={color} strokeOpacity="0.5" strokeWidth="1.5" />
      <line x1={W - 6} y1={lines[0]} x2={W - 6} y2={lines[4]} stroke={color} strokeOpacity="0.5" strokeWidth="1.5" />
      <text x={22} y={lines[1] + 4} fill={color} fontSize="16" fontWeight="700" fontFamily="Georgia, serif">4</text>
      <text x={22} y={lines[3] + 4} fill={color} fontSize="16" fontWeight="700" fontFamily="Georgia, serif">4</text>

      {xs.map((x, i) => {
        const isActive = i === active;
        return (
          <g key={`hh-${i}`} opacity={isActive ? 1 : 0.6}>
            <path d={`M${x-4},${top - 12} L${x+4},${top - 4} M${x+4},${top - 12} L${x-4},${top - 4}`} stroke={isActive ? accent : color} strokeWidth="1.8" strokeLinecap="round"/>
          </g>
        );
      })}

      {[2, 6].map(i => {
        const x = xs[i];
        const isActive = i === active;
        return (
          <g key={`sn-${i}`}>
            <ellipse cx={x} cy={lines[2]} rx="5" ry="3.6" fill={isActive ? accent : color} transform={`rotate(-18 ${x} ${lines[2]})`}/>
          </g>
        );
      })}

      {[0, 4].map(i => {
        const x = xs[i];
        const isActive = i === active;
        return (
          <ellipse key={`kk-${i}`} cx={x} cy={lines[4] + 12} rx="5" ry="3.6" fill={isActive ? accent : color} transform={`rotate(-18 ${x} ${lines[4] + 12})`}/>
        );
      })}

      {xs.map((x, i) => (
        <line key={`stem-${i}`} x1={x + 4} y1={top - 8} x2={x + 4} y2={top - 28} stroke={color} strokeOpacity="0.5" strokeWidth="1.4"/>
      ))}
      {[0, 2, 4, 6].map(i => (
        <line key={`beam-${i}`} x1={xs[i] + 4} y1={top - 28} x2={xs[i + 1] + 4} y2={top - 28} stroke={color} strokeOpacity="0.5" strokeWidth="3"/>
      ))}

      {[0, 2, 4, 6].map((i, idx) => (
        <text key={`bn-${i}`} x={xs[i]} y={lines[4] + 32} fill={color} opacity="0.45" fontSize="11" fontFamily="ui-monospace, monospace" textAnchor="middle">{idx + 1}</text>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Design Components
// ─────────────────────────────────────────────────────────────
function SectionLabel({ children, t, color }: { children: React.ReactNode; t: ThemeTokens; color?: string }) {
  return (
    <div style={{
      fontFamily: t.font, fontSize: 11, fontWeight: 600, letterSpacing: 1.8,
      textTransform: 'uppercase', color: color || t.textMuted, marginBottom: 12,
    }}>{children}</div>
  );
}

function Card({ children, t, style = {}, onClick, padding = 18 }: { children: React.ReactNode; t: ThemeTokens; style?: React.CSSProperties; onClick?: () => void; padding?: number }) {
  return (
    <div onClick={onClick} style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 20, padding, cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

function Pill({ children, t, tone = 'default' }: { children: React.ReactNode; t: ThemeTokens; tone?: 'default' | 'accent' | 'good' }) {
  const map = {
    default: { bg: t.surface2, fg: t.textMuted },
    accent: { bg: t.accentSoft, fg: t.accentText },
    good: { bg: t.goodSoft, fg: t.good },
  };
  const c = map[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: c.bg, color: c.fg, padding: '4px 9px',
      borderRadius: 999, fontSize: 11, fontWeight: 600,
      fontFamily: t.font, letterSpacing: 0.2,
    }}>{children}</span>
  );
}

function Progress({ pct, t, h = 6, color }: { pct: number; t: ThemeTokens; h?: number; color?: string }) {
  return (
    <div style={{ width: '100%', height: h, background: t.surface2, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || t.accent, borderRadius: 999 }} />
    </div>
  );
}

function CTA({ children, t, onClick, variant = 'primary', icon }: { children: React.ReactNode; t: ThemeTokens; onClick?: () => void; variant?: 'primary' | 'secondary'; icon?: React.ReactNode }) {
  const isPrimary = variant === 'primary';
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '16px 18px', borderRadius: 999,
      background: isPrimary ? t.accent : 'transparent',
      color: isPrimary ? '#fff' : t.text,
      border: isPrimary ? 'none' : `1px solid ${t.borderStrong}`,
      fontFamily: t.font, fontSize: 13, fontWeight: 700,
      letterSpacing: 2, textTransform: 'uppercase',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: isPrimary ? '0 8px 24px rgba(239,90,58,0.3)' : 'none',
    }}>
      {icon}{children}
    </button>
  );
}

function Display({ children, t, size = 32, style = {} }: { children: React.ReactNode; t: ThemeTokens; size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: t.serif, fontStyle: 'italic', fontSize: size,
      lineHeight: 1.05, color: t.text, letterSpacing: -0.3, ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// iOS Frame components
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      display: 'flex', gap: 154, alignItems: 'center', padding: '21px 24px 19px', boxSizing: 'border-box',
      position: 'relative', zIndex: 20, width: '100%',
    }}>
      <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', paddingTop: 1.5 }}>
        <span style={{
          fontFamily: '-apple-system, "SF Pro", system-ui', fontWeight: 590,
          fontSize: 17, lineHeight: '22px', color: c,
        }}>{time}</span>
      </div>
      <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', gap: 7, paddingTop: 1, paddingRight: 1 }}>
        <svg width="19" height="12" viewBox="0 0 19 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c}/>
          <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c}/>
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c}/>
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c}/>
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/>
          <circle cx="8.5" cy="10.5" r="1.5" fill={c}/>
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c}/>
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screens
// ─────────────────────────────────────────────────────────────

// 1. Onboarding Splash
function OnboardingScreen({ t, onStart }: { t: ThemeTokens; dark: boolean; onStart: () => void }) {
  const { language } = useLanguage();
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, background: t.bg,
      color: t.text, fontFamily: t.font,
      paddingTop: 'calc(var(--safe-top, 62px) + 28px)',
      paddingBottom: 'calc(var(--safe-bottom, 0px) + 32px)',
      paddingLeft: 28, paddingRight: 28,
      display: 'flex', flexDirection: 'column', }}>
      <div>
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 56, letterSpacing: -1,
          lineHeight: 1, display: 'flex', alignItems: 'baseline',
        }}>
          Pocket Drummer<span style={{ color: t.accent, fontStyle: 'normal' }}>.</span>
        </div>
        <div style={{
          fontFamily: t.font, fontSize: 12, fontWeight: 700, letterSpacing: 2.4,
          textTransform: 'uppercase', color: t.textMuted, marginTop: 6,
        }}>
          {language === 'da' ? 'Spil. Øv. Udvikl dig.' : language === 'en' ? 'Play. Practice. Progress.' : language === 'de' ? 'Spielen. Üben. Fortschreiten.' : 'Tocar. Practicar. Progresar.'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1 }}>
        <div style={{
          position: 'absolute', width: 280, height: 280,
          background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 70%)`,
          borderRadius: '50%', filter: 'blur(10px)',
        }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IllSticks size={130} color={t.accent} sw={1.8} />
          <div style={{ marginTop: -10 }}>
            <IllSnare size={250} color={t.accent} sw={1.5} />
          </div>
        </div>
      </div>

      <div>
        <Display t={t} size={22} style={{ textAlign: 'center', marginBottom: 10 }}>
          {language === 'da' ? 'Din rejse begynder her' : language === 'en' ? 'Your journey starts here' : language === 'de' ? 'Deine Reise beginnt hier' : 'Tu viaje comienza aquí'}
        </Display>
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.7,
          textAlign: 'center', lineHeight: 1.4, marginBottom: 24, padding: '0 12px',
        }}>
          {language === 'da' ? 'Uanset dit niveau, hjælper vi dig med at blive en bedre trommeslager.' : language === 'en' ? 'No matter your level, we help you become a better drummer.' : language === 'de' ? 'Egal welches Niveau, wir helfen dir ein besserer Schlagzeuger zu werden.' : 'No importa tu nivel, te ayudamos a convertirte en un mejor baterista.'}
        </div>

        <CTA t={t} onClick={onStart}>{language === 'da' ? 'Kom i gang' : language === 'en' ? 'Get Started' : language === 'de' ? 'Loslegen' : 'Comenzar'}</CTA>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onStart} style={{
            background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase',
            fontFamily: t.font,
          }}>
            {language === 'da' ? 'Har du allerede en konto? Log ind' : language === 'en' ? 'Already have an account? Log in' : language === 'de' ? 'Hast du bereits ein Konto? Anmelden' : '¿Ya tienes una cuenta? Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Home Screen
function HomeScreen({ t, dark, setDark, onSelectCategory, onOpenCoach, onPlayRhythmHero, guestXp }: HomeScreenProps) {
  const { user } = useAuth();
  const displayName = user ? user.displayName : 'Astrid';
  const { language, setLanguage, t: translate } = useLanguage();

  const greeting = language === 'da' ? 'Hej' : language === 'en' ? 'Hello' : language === 'de' ? 'Hallo' : 'Hola';
  const dateLang = language === 'da' ? 'da-DK' : language === 'en' ? 'en-US' : language === 'de' ? 'de-DE' : 'es-ES';
  const todayRaw = new Date().toLocaleDateString(dateLang, { weekday: 'long', day: 'numeric', month: 'long' });
  const todayStr = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

  const xp = user?.xp !== undefined ? user.xp : guestXp;
  const level = user ? (user.level || 1) : Math.floor(xp / 200) + 1;
  const streak = user?.streak !== undefined ? user.streak : 7;
  const xpPct = ((xp % 200) / 200) * 100;

  return (
    <div style={{ padding: '8px 20px 40px', color: t.text, fontFamily: t.font }}>
      {/* Top bar with Greeting and theme/coach toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>👋</span>
            <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 24, fontWeight: 'normal' }}>{greeting}, {displayName}</span>
          </div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>{todayStr}</div>
          
          {/* Flag language switcher */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {[
              { code: 'da', flag: '🇩🇰' },
              { code: 'en', flag: '🇬🇧' },
              { code: 'de', flag: '🇩🇪' },
              { code: 'es', flag: '🇪🇸' }
            ].map(l => (
              <button 
                key={l.code} 
                onClick={() => setLanguage(l.code as any)}
                style={{
                  background: language === l.code ? t.accentSoft : 'transparent',
                  border: `1px solid ${language === l.code ? t.accent : 'transparent'}`,
                  borderRadius: 6,
                  padding: '2px 5px',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  lineHeight: 1
                }}
              >
                {l.flag}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDark(!dark)} style={{
            width: 38, height: 38, borderRadius: '50%', background: t.surface,
            border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {dark ? <IcSun size={16} /> : <IcMoon size={16} />}
          </button>
          <button onClick={onOpenCoach} style={{
            width: 38, height: 38, borderRadius: '50%', background: t.surface,
            border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <IcSpark size={16} color={t.accent} />
          </button>
        </div>
      </div>

      {/* Dagens anbefaling */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel t={t}>{language === 'da' ? 'Dagens anbefaling' : language === 'en' ? "Today's recommendation" : language === 'de' ? 'Tagesempfehlung' : 'Recomendación del día'}</SectionLabel>
        <TiltCard style={{ borderRadius: '18px' }}>
          <Card t={t} padding={20} style={{ borderLeft: `4px solid ${t.accent}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.textMuted }}>
                  {language === 'da' ? 'DAGENS ØVELSE' : language === 'en' ? 'DAILY EXERCISE' : language === 'de' ? 'TÄGLICHE ÜBUNG' : 'EJERCICIO DIARIO'}
                </span>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 20, marginTop: 2, color: t.text }}>Paradiddle Grooves</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
                  12 min · {language === 'da' ? 'Let øvet' : language === 'en' ? 'Intermediate' : language === 'de' ? 'Mittelstufe' : 'Intermedio'}
                </div>
              </div>
            </div>
            <CTA t={t} onClick={() => onSelectCategory('grooves')}>
              {language === 'da' ? 'Fortsæt' : language === 'en' ? 'Continue' : language === 'de' ? 'Weiter' : 'Continuar'}
            </CTA>
          </Card>
        </TiltCard>
      </div>

      {/* Vælg øvespor */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel t={t}>{language === 'da' ? 'Vælg øvespor' : language === 'en' ? 'Choose Practice Path' : language === 'de' ? 'Übungspfad wählen' : 'Elegir ruta de práctica'}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { id: 'opvarmning' as const, title: translate('warmup'), desc: translate('warmupDesc'), icon: <IcWave size={20} /> },
            { id: 'nodelære' as const, title: translate('musicTheory'), desc: translate('theoryDesc'), icon: <IcMetro size={20} /> },
            { id: 'grooves' as const, title: translate('grooves'), desc: translate('groovesDesc'), icon: <TabKit size={20} color={t.accent} /> },
            { id: 'playalong' as const, title: translate('playalong'), desc: translate('playalongDesc'), icon: <TabPlayalong size={20} color={t.accent} /> }
          ].map((cat) => (
            <TiltCard key={cat.id} onClick={() => onSelectCategory(cat.id)} style={{ borderRadius: '18px' }}>
              <div style={{
                background: t.surface, border: `1px solid ${t.border}`,
                borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'pointer', transition: 'border-color 0.2s', height: '100%'
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: t.accentSoft, color: t.accent, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 18, color: t.text }}>{cat.title}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2, lineHeight: 1.3 }}>{cat.desc}</div>
                </div>
                <IcChev size={16} color={t.textDim} />
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Din progression */}
      <div>
        <SectionLabel t={t}>{language === 'da' ? 'Din progression' : language === 'en' ? 'Your Progression' : language === 'de' ? 'Dein Fortschritt' : 'Tu progresión'}</SectionLabel>
        <TiltCard style={{ borderRadius: '16px' }}>
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 13, color: t.text }}>
              {language === 'da' ? 'Denne uge' : language === 'en' ? 'This week' : language === 'de' ? 'Diese Woche' : 'Esta semana'}:{' '}
              <span style={{ fontWeight: 600 }}>3 {language === 'da' ? 'øvedage' : language === 'en' ? 'practice days' : language === 'de' ? 'Übungstage' : 'días de práctica'}</span> ·{' '}
              <span style={{ fontWeight: 600 }}>72 min</span> ·{' '}
              <span style={{ fontWeight: 600 }}>{translate('level')} {level}</span>
            </div>
            <div style={{ width: 60 }}><Progress pct={xpPct} t={t} h={6} /></div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

// 3. Practice Catalog Screen
const practiceTracks = [
  {
    id: 'rytme-timing',
    title: 'Rytme & Timing',
    subtitle: 'Forbedr din timing',
    blurb: 'Styrk din indre puls og få bedre kontrol over rytme, tempo og dynamik.',
    lessonCount: 15,
    level: 'Fra begynder til øvet',
    ill: 'sticks',
    progress: 27,
  },
  {
    id: 'fills-grooves',
    title: 'Fills & Grooves',
    subtitle: 'Udvid dit vokabular',
    blurb: 'Byg et bibliotek af fills og pocket grooves du kan trække i hvilken som helst situation.',
    lessonCount: 22,
    level: 'Niveau 3 og op',
    ill: 'snare',
    progress: 12,
  },
  {
    id: 'jazz-brush',
    title: 'Jazz & Brushwork',
    subtitle: 'Subtil dynamik',
    blurb: 'Lær brushteknikker, swing-feel og dynamisk kontrol i jazztraditionen.',
    lessonCount: 14,
    level: 'Niveau 5+',
    ill: 'sticks',
    progress: 0,
  },
  {
    id: 'odd-time',
    title: 'Skæve taktarter',
    subtitle: 'Ud over 4/4',
    blurb: 'Naviger 5/8, 7/8 og 11/16 — fra polyrytmer til moderne progrock.',
    lessonCount: 12,
    level: 'Niveau 6+',
    ill: 'snare',
    progress: 0,
  },
];

function PracticeScreen({ t, onSelectCategory, onPlayRhythmHero }: PracticeScreenProps) {
  const [search, setSearch] = useState('');
  const { language, t: translate } = useLanguage();
  const [activeChip, setActiveChip] = useState<'Alle' | 'opvarmning' | 'nodelære' | 'grooves' | 'playalong'>('Alle');

  const allExercises = [
    { id: 'warmup-1', cat: 'opvarmning' as const, title: language === 'da' ? '5 min teknik-start' : language === 'en' ? '5 min tech startup' : language === 'de' ? '5 Min. Technik-Start' : 'Inicio técnico de 5 min', sub: language === 'da' ? 'Single strokes og håndkontrol' : language === 'en' ? 'Single strokes and hand control' : language === 'de' ? 'Single Strokes und Handkontrolle' : 'Single strokes y control de manos', dur: '5 min', bpm: '80', level: 'Begynder', tags: ['5 min', 'Single strokes'] },
    { id: 'warmup-2', cat: 'opvarmning' as const, title: language === 'da' ? 'Hånd-hastighed & kontrol' : language === 'en' ? 'Hand Speed & Control' : language === 'de' ? 'Handgeschwindigkeit & Kontrolle' : 'Velocidad y control de manos', sub: language === 'da' ? 'Dobbelt slag og paradiddle kontrol' : language === 'en' ? 'Double strokes and paradiddle control' : language === 'de' ? 'Doppelschläge und Paradiddle-Kontrolle' : 'Golpes dobles y control de paradiddle', dur: '10 min', bpm: '100', level: 'Mellemniveau', tags: ['10 min', 'Hænder', 'Double strokes', 'Paradiddles'] },
    { id: 'warmup-3', cat: 'opvarmning' as const, title: language === 'da' ? 'Stortromme styrke' : language === 'en' ? 'Bass Drum Power' : language === 'de' ? 'Bassdrum-Stärke' : 'Fuerza de bombo', sub: language === 'da' ? 'Fodkontrol og udholdenhed' : language === 'en' ? 'Foot control and endurance' : language === 'de' ? 'Fußkontrolle und Ausdauer' : 'Control de pie y resistencia', dur: '12 min', bpm: '90', level: 'Øvet', tags: ['Fødder', 'Stortrommekontrol'] },
    { id: 'notes-1', cat: 'nodelære' as const, title: language === 'da' ? 'Læs fjerdedele & pauser' : language === 'en' ? 'Read Quarter Notes & Rests' : language === 'de' ? 'Viertelnoten & Pausen lesen' : 'Leer negras y silencios', sub: language === 'da' ? 'Grundlæggende nodelæsning' : language === 'en' ? 'Basic sheet music reading' : language === 'de' ? 'Grundlegendes Notenlesen' : 'Lectura básica de partituras', dur: '5 min', bpm: '80', level: 'Begynder', tags: ['Fjerdedele', 'Pauser'] },
    { id: 'notes-2', cat: 'nodelære' as const, title: language === 'da' ? 'Ottendedele syncopation' : language === 'en' ? 'Eighth Note Syncopation' : language === 'de' ? 'Achtelnoten-Synkopen' : 'Síncopa de corcheas', sub: language === 'da' ? 'Udfordr din timing' : language === 'en' ? 'Challenge your timing' : language === 'de' ? 'Fordere dein Timing heraus' : 'Desafía tu tempo', dur: '8 min', bpm: '90', level: 'Mellemniveau', tags: ['Ottendedele', 'Accenter'] },
    { id: 'notes-3', cat: 'nodelære' as const, title: language === 'da' ? 'Sekstendedele ghost notes' : language === 'en' ? 'Sixteenth Note Ghost Notes' : language === 'de' ? 'Sechzehntel-Ghostnotes' : 'Notas fantasma de semicorcheas', sub: language === 'da' ? 'Avanceret nodeforståelse' : language === 'en' ? 'Advanced notation comprehension' : language === 'de' ? 'Fortgeschrittenes Notenverständnis' : 'Comprensión avanzada de notación', dur: '12 min', bpm: '96', level: 'Øvet', tags: ['Sekstendedele', 'Ghost notes'] },
    { id: 'grooves-1', cat: 'grooves' as const, title: 'Basic Rock Beat', sub: language === 'da' ? 'Klassisk 8.-dels groove' : language === 'en' ? 'Classic 8th note groove' : language === 'de' ? 'Klassischer Achtelgroove' : 'Groove clásico de corcheas', dur: '6 min', bpm: '90', level: 'Begynder', tags: ['Basic rock', 'Pop'] },
    { id: 'grooves-2', cat: 'grooves' as const, title: 'Funk Pocket Groove', sub: language === 'da' ? 'Syncoperet 16.-dels hi-hat groove' : language === 'en' ? 'Syncopated 16th note hi-hat groove' : language === 'de' ? 'Synkopierter Sechzehntel-Hi-Hat-Groove' : 'Groove sincopado de semicorcheas en hi-hat', dur: '10 min', bpm: '95', level: 'Mellemniveau', tags: ['Funk', 'Ghost notes'] },
    { id: 'grooves-3', cat: 'grooves' as const, title: 'Linear Funk Pattern', sub: language === 'da' ? 'Linear timing uden overlappende slag' : language === 'en' ? 'Linear timing without overlapping hits' : language === 'de' ? 'Lineares Timing ohne überlappende Schläge' : 'Tempo lineal sin golpes superpuestos', dur: '15 min', bpm: '100', level: 'Øvet', tags: ['Funk', 'Linear grooves'] },
    { id: 'playalong-1', cat: 'playalong' as const, title: 'Classic Rock 4/4 Beat', sub: language === 'da' ? 'Spil med et stærkt rock backing track' : language === 'en' ? 'Play along with a strong rock backing track' : language === 'de' ? 'Spiele zu einem starken Rock-Backing-Track' : 'Toca con una fuerte pista de acompañamiento de rock', dur: '3 min', bpm: '92', level: 'Begynder', tags: ['Rock tracks', 'Begyndertracks'] },
    { id: 'playalong-2', cat: 'playalong' as const, title: 'Funk Groove Odyssey', sub: language === 'da' ? 'Super funky synth-backing track' : language === 'en' ? 'Super funky synth backing track' : language === 'de' ? 'Super funky Synth-Backing-Track' : 'Pista de acompañamiento de sintetizador súper funky', dur: '4 min', bpm: '105', level: 'Mellemniveau', tags: ['Funk tracks', 'Formtræning'] },
  ];

  const getLevelLabel = (lvl: string) => {
    if (lvl === 'Begynder') return translate('beginner');
    if (lvl === 'Mellemniveau') return translate('intermediate');
    if (lvl === 'Øvet') return translate('advanced');
    return lvl;
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'opvarmning') return translate('warmup');
    if (cat === 'nodelære') return translate('musicTheory');
    if (cat === 'grooves') return translate('grooves');
    if (cat === 'playalong') return translate('playalong');
    return cat;
  };

  const filtered = allExercises.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(search.toLowerCase()) || ex.sub.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeChip === 'Alle') return true;
    return ex.cat === activeChip;
  });

  const chips = [
    { id: 'Alle' as const, label: language === 'da' ? 'Alle' : language === 'en' ? 'All' : language === 'de' ? 'Alle' : 'Todos' },
    { id: 'opvarmning' as const, label: translate('warmup') },
    { id: 'nodelære' as const, label: translate('musicTheory') },
    { id: 'grooves' as const, label: translate('grooves') },
    { id: 'playalong' as const, label: translate('playalong') }
  ];

  return (
    <div style={{ color: t.text, fontFamily: t.font, padding: '4px 0 40px' }}>
      <div style={{ padding: '4px 20px 14px' }}>
        <Display t={t} size={28} style={{ marginBottom: 16 }}>
          {language === 'da' ? 'Øvelsesbibliotek' : language === 'en' ? 'Exercise Library' : language === 'de' ? 'Übungsbibliothek' : 'Biblioteca de ejercicios'}
        </Display>

        {/* Rhythm Hero card */}
        <TiltCard style={{ borderRadius: '18px', marginBottom: 20 }}>
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 18, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(242,85,69,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: t.accent,
                fontSize: 18
              }}>
                🎮
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 16, color: t.text, fontWeight: 'bold' }}>
                  {translate('rhythmHero')}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.3 }}>
                  {translate('rhythmHeroSub')}
                </div>
              </div>
            </div>
            <button 
              onClick={onPlayRhythmHero}
              style={{
                width: '100%',
                background: t.accent,
                border: 'none',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background 0.2s',
                fontFamily: t.font
              }}
            >
              Start Game (+XP)
            </button>
          </div>
        </TiltCard>
        
        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type="text"
            placeholder={language === 'da' ? 'Søg efter øvelser, teknik...' : language === 'en' ? 'Search exercises, techniques...' : language === 'de' ? 'Übungen, Techniken suchen...' : 'Buscar ejercicios, técnicas...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 14,
              border: `1px solid ${t.borderStrong}`,
              background: t.surface,
              color: t.text,
              fontSize: 14,
              outline: 'none',
              fontFamily: t.font,
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer',
              fontSize: 14
            }}>✕</button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {chips.map(chip => {
            const active = activeChip === chip.id;
            return (
              <button key={chip.id} onClick={() => setActiveChip(chip.id)} style={{
                padding: '8px 14px', borderRadius: 999, border: `1px solid ${active ? t.accent : t.border}`,
                background: active ? t.accentSoft : t.surface, color: active ? t.accent : t.textMuted,
                fontFamily: t.font, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.15s ease'
              }}>{chip.label}</button>
            );
          })}
        </div>
      </div>

      {/* Exercises list */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((ex) => (
          <div key={ex.id} onClick={() => onSelectCategory(ex.cat)} style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 18, padding: 18, cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: ex.cat === 'opvarmning' ? 'rgba(93,211,158,0.1)' : ex.cat === 'nodelære' ? 'rgba(66,135,245,0.1)' : ex.cat === 'grooves' ? 'rgba(242,85,69,0.1)' : 'rgba(155,89,182,0.1)',
                color: ex.cat === 'opvarmning' ? '#3eaf7c' : ex.cat === 'nodelære' ? '#4287f5' : ex.cat === 'grooves' ? t.accent : '#9b59b6',
                textTransform: 'uppercase', letterSpacing: 0.5
              }}>
                {getCategoryLabel(ex.cat)}
              </span>
              <span style={{ fontSize: 11, color: t.textMuted, fontFamily: t.mono }}>{ex.dur} · {ex.bpm} BPM</span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>{ex.title}</div>
            <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.4 }}>{ex.sub}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ fontSize: 10.5, color: t.textMuted }}>{getLevelLabel(ex.level)}</span>
              </div>
              <button style={{
                width: 32, height: 32, borderRadius: '50%', background: t.accentSoft,
                border: 'none', color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <IcPlay size={12} fill color={t.accent} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: t.textMuted }}>
            <span style={{ fontSize: 24 }}>🔍</span>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              {language === 'da' ? 'Ingen øvelser matcher din søgning.' : language === 'en' ? 'No exercises match your search.' : language === 'de' ? 'Keine Übungen entsprechen Ihrer Suche.' : 'No hay ejercicios que coincidan con tu búsqueda.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MobileCategoryDetailProps {
  t: ThemeTokens;
  dark: boolean;
  category: 'opvarmning' | 'nodelære' | 'grooves' | 'playalong';
  onClose: () => void;
  onOpenCoach: () => void;
}

function MobileCategoryDetail({ t, category, onClose, onOpenCoach }: MobileCategoryDetailProps) {
  const [activeChip, setActiveChip] = useState('Alle');
  const [bpm, setBpm] = useState(category === 'playalong' ? 105 : 90);
  const [metroPlaying, setMetroPlaying] = useState(false);
  const [subdivision, setSubdivision] = useState<'quarter' | 'eighth'>('quarter');
  const [currentBeat, setCurrentBeat] = useState(0);

  // Play-along states
  const [playalongPlaying, setPlayalongPlaying] = useState(false);
  const [playalongSpeed, setPlayalongSpeed] = useState<80 | 90 | 100 | 110>(100);
  const [mixerVols, setMixerVols] = useState({ drums: 70, music: 60 });
  const [playalongBeat, setPlayalongBeat] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Metronome Sound loop
  useEffect(() => {
    if (!metroPlaying) return;
    const intervalTime = (60 / bpm) * (subdivision === 'eighth' ? 500 : 1000);
    const intervalId = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = subdivision === 'eighth' ? (prev + 1) % 8 : (prev + 1) % 4;
        try {
          const ctx = getAudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const isDownbeat = nextBeat === 0;
          const isSub = subdivision === 'eighth' && nextBeat % 2 !== 0;
          
          osc.frequency.setValueAtTime(isDownbeat ? 1000 : isSub ? 450 : 600, ctx.currentTime);
          gain.gain.setValueAtTime(isDownbeat ? 0.2 : isSub ? 0.04 : 0.09, ctx.currentTime);
          
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.stop(ctx.currentTime + 0.06);
        } catch {}
        return nextBeat;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [metroPlaying, bpm, subdivision]);

  // Backing Track Synthesizer loop
  useEffect(() => {
    if (!playalongPlaying) return;
    
    const actualBpm = 105 * (playalongSpeed / 100);
    const intervalTime = (60 / actualBpm) * 500; // eighth notes
    
    const intervalId = setInterval(() => {
      setPlayalongBeat(prev => {
        const nextBeat = (prev + 1) % 32;
        
        let section = 'Intro';
        if (nextBeat >= 8 && nextBeat < 24) section = 'Verse';
        else if (nextBeat >= 24 && nextBeat < 28) section = 'Chorus';
        else if (nextBeat >= 28 && nextBeat < 30) section = 'Fill Cue';
        else section = 'Outro';
        
        try {
          const ctx = getAudioCtx();
          const now = ctx.currentTime;
          
          if (mixerVols.drums > 0) {
            const subBeat = nextBeat % 8;
            if (subBeat === 0 || subBeat === 4) {
              const kick = ctx.createOscillator();
              const kickGain = ctx.createGain();
              kick.connect(kickGain);
              kickGain.connect(ctx.destination);
              kick.frequency.setValueAtTime(140, now);
              kick.frequency.exponentialRampToValueAtTime(45, now + 0.08);
              kickGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.35, now);
              kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
              kick.start();
              kick.stop(now + 0.2);
            }
            
            if (subBeat === 4) {
              const snare = ctx.createOscillator();
              const snareGain = ctx.createGain();
              snare.connect(snareGain);
              snareGain.connect(ctx.destination);
              snare.type = 'triangle';
              snare.frequency.setValueAtTime(240, now);
              snareGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.22, now);
              snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
              snare.start();
              snare.stop(now + 0.1);
            }
            
            const hh = ctx.createOscillator();
            const hhGain = ctx.createGain();
            hh.connect(hhGain);
            hhGain.connect(ctx.destination);
            hh.type = 'sine';
            hh.frequency.setValueAtTime(8000, now);
            hhGain.gain.setValueAtTime((mixerVols.drums / 100) * 0.02, now);
            hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            hh.start();
            hh.stop(now + 0.04);
          }
          
          if (mixerVols.music > 0 && nextBeat % 2 === 0) {
            const synth = ctx.createOscillator();
            const synthGain = ctx.createGain();
            synth.connect(synthGain);
            synthGain.connect(ctx.destination);
            synth.type = 'sine';
            
            let baseFreq = 130.81;
            if (section === 'Verse') baseFreq = 146.83;
            else if (section === 'Chorus') baseFreq = 164.81;
            else if (section === 'Fill Cue') baseFreq = 196.00;
            else if (section === 'Outro') baseFreq = 130.81;
            
            const harmony = ctx.createOscillator();
            harmony.connect(synthGain);
            harmony.type = 'sine';
            harmony.frequency.setValueAtTime(baseFreq * 1.5, now);
            
            synth.frequency.setValueAtTime(baseFreq, now);
            synthGain.gain.setValueAtTime((mixerVols.music / 100) * 0.06, now);
            synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            synth.start();
            harmony.start();
            synth.stop(now + 0.45);
            harmony.stop(now + 0.45);
          }
        } catch {}
        return nextBeat;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [playalongPlaying, playalongSpeed, mixerVols]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const categoryChips = {
    opvarmning: ['Alle', '5 min', '10 min', 'Hænder', 'Fødder', 'Single strokes', 'Double strokes', 'Paradiddles', 'Accenter', 'Dynamik', 'Tempo-ladder', 'Venstre hånd', 'Stortrommekontrol'],
    nodelære: ['Alle', 'Fjerdedele', 'Ottendedele', 'Sekstendedele', 'Pauser', 'Accenter', 'Ghost notes', 'Taktarter', '4/4', '3/4', '6/8', 'Shuffle-notation', 'Charts', 'Prima vista', 'Læs og spil', 'Nodequiz'],
    grooves: ['Alle', 'Basic rock', 'Pop', 'Funk', 'Jazz', 'Blues', 'Shuffle', 'Samba', 'Songo', 'Latin', 'Reggae', 'Hip-hop', 'Metal', 'Brushes', 'Ghost notes', 'Linear grooves', 'Fills', 'Overgange', 'Odd meters', 'Koordination'],
    playalong: ['Alle', 'Rock tracks', 'Pop tracks', 'Funk tracks', 'Blues tracks', 'Jazz tracks', 'Latin tracks', 'No-drums tracks', 'Guided play-alongs', 'Call and response', 'Begyndertracks', 'Mellemtracks', 'Øvede tracks', 'Formtræning', 'Vers/omkvæd', 'Fill cues']
  }[category];

  const categoryExercises = {
    opvarmning: [
      { id: 1, title: '5 minutters teknik-start', sub: 'Single strokes og håndkontrol', dur: '5 min', bpm: 80, tags: ['5 min', 'Single strokes'], level: 'Begynder' },
      { id: 2, title: 'Hånd-hastighed & kontrol', sub: 'Dobbelt slag og paradiddle kontrol', dur: '10 min', bpm: 100, tags: ['10 min', 'Hænder', 'Double strokes', 'Paradiddles'], level: 'Mellemniveau' },
      { id: 3, title: 'Stortromme styrke & kontrol', sub: 'Fodkontrol og udholdenhed', dur: '12 min', bpm: 90, tags: ['Fødder', 'Stortrommekontrol'], level: 'Øvet' },
      { id: 4, title: 'Tempo-ladder udfordring', sub: 'Øg tempoet gradvist', dur: '15 min', bpm: '80-140', tags: ['Tempo-ladder', 'Dynamik'], level: 'Øvet' },
    ],
    nodelære: [
      { id: 1, title: 'Læs fjerdedele & pauser', sub: 'Grundlæggende nodelæsning', dur: '5 min', bpm: 80, tags: ['Fjerdedele', 'Pauser'], level: 'Begynder' },
      { id: 2, title: 'Ottendedele syncopation', sub: 'Udfordr din timing', dur: '8 min', bpm: 90, tags: ['Ottendedele', 'Accenter'], level: 'Mellemniveau' },
      { id: 3, title: 'Sekstendedele ghost notes', sub: 'Avanceret nodeforståelse', dur: '12 min', bpm: 96, tags: ['Sekstendedele', 'Ghost notes'], level: 'Øvet' },
      { id: 4, title: 'Taktartsskift (4/4 til 3/4)', sub: 'Leg med taktarter', dur: '10 min', bpm: 100, tags: ['Taktarter', '3/4'], level: 'Øvet' },
    ],
    grooves: [
      { id: 1, title: 'Basic Rock Beat', sub: 'Klassisk 8.-dels groove', dur: '6 min', bpm: 90, tags: ['Basic rock', 'Pop'], level: 'Begynder' },
      { id: 2, title: 'Funk Pocket Groove', sub: 'Syncoperet 16.-dels hi-hat groove', dur: '10 min', bpm: 95, tags: ['Funk', 'Ghost notes'], level: 'Mellemniveau' },
      { id: 3, title: 'Jazz Swing comping', sub: 'Swing-feel og ride bækken mønster', dur: '12 min', bpm: 120, tags: ['Jazz', 'Brushes'], level: 'Øvet' },
      { id: 4, title: 'Linear Funk Pattern', sub: 'Linear timing uden overlappende slag', dur: '15 min', bpm: 100, tags: ['Funk', 'Linear grooves'], level: 'Øvet' },
    ],
    playalong: [
      { id: 1, title: 'Classic Rock 4/4 Beat', sub: 'Spil med et stærkt rock backing track', dur: '3 min', bpm: 92, tags: ['Rock tracks', 'Begyndertracks'], level: 'Begynder', nodrums: true },
      { id: 2, title: 'Funk Groove Odyssey', sub: 'Super funky synth-backing track', dur: '4 min', bpm: 105, tags: ['Funk tracks', 'Mellemtracks', 'Formtræning'], level: 'Mellemniveau', nodrums: true },
      { id: 3, title: 'Modern Jazz swing along', sub: 'Swing med bas og piano', dur: '5 min', bpm: 130, tags: ['Jazz tracks', 'Øvede tracks'], level: 'Øvet', nodrums: true },
    ]
  }[category];

  const categoryTitle = {
    opvarmning: 'Pocket Opvarmning',
    nodelære: 'Pocket Nodelære',
    grooves: 'Pocket Groove',
    playalong: 'Pocket Play-along'
  }[category];

  const categoryBlurb = {
    opvarmning: 'Start med hænder, fødder, kontrol og timing.',
    nodelære: 'Forstå rytmer, taktarter og trommenotation.',
    grooves: 'Spil beats, fills, overgange og genrer.',
    playalong: 'Spil med musik, backing tracks og form.'
  }[category];

  const filteredExercises = categoryExercises.filter(ex => {
    if (activeChip === 'Alle') return true;
    return ex.tags.some(tag => tag.toLowerCase().includes(activeChip.toLowerCase()));
  });

  return (
    <div className="ios-screen-overlay" style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 120,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      {/* Header */}
      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}` }}>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}><IcBack size={16} /></button>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' }}>Øvespor</div>
          <Display t={t} size={18} style={{ marginTop: 2 }}>{categoryTitle}</Display>
        </div>
        <button onClick={onOpenCoach} style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}><IcSpark size={16} color={t.accent} /></button>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 60px' }}>
        <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 20, lineHeight: 1.5 }}>
          {categoryBlurb}
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, marginBottom: 20, scrollbarWidth: 'none' }}>
          {categoryChips.map(chip => {
            const active = activeChip === chip;
            return (
              <button key={chip} onClick={() => setActiveChip(chip)} style={{
                padding: '6px 12px', borderRadius: 999, border: `1px solid ${active ? t.accent : t.border}`,
                background: active ? t.accentSoft : t.surface, color: active ? t.accent : t.textMuted,
                fontFamily: t.font, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.15s ease'
              }}>{chip}</button>
            );
          })}
        </div>

        {/* Nodelære Interactive metronome widget */}
        {category === 'nodelære' && (
          <Card t={t} padding={16} style={{ marginBottom: 24, borderLeft: `3px solid ${t.accent}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.accent }}>Interaktiv Nodelæser</div>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 16, marginTop: 2 }}>Øvebænk & Timing</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setSubdivision('quarter'); setCurrentBeat(0); }} style={{
                  padding: '4px 8px', borderRadius: 4, border: `1px solid ${subdivision === 'quarter' ? t.accent : t.border}`,
                  background: subdivision === 'quarter' ? t.accentSoft : 'transparent', color: subdivision === 'quarter' ? t.accent : t.textMuted,
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: t.font
                }}>4.-dele</button>
                <button onClick={() => { setSubdivision('eighth'); setCurrentBeat(0); }} style={{
                  padding: '4px 8px', borderRadius: 4, border: `1px solid ${subdivision === 'eighth' ? t.accent : t.border}`,
                  background: subdivision === 'eighth' ? t.accentSoft : 'transparent', color: subdivision === 'eighth' ? t.accent : t.textMuted,
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: t.font
                }}>8.-dele</button>
              </div>
            </div>

            <div style={{ background: '#FAF8F5', border: `1px solid ${t.border}`, borderRadius: 12, padding: '16px 8px', position: 'relative', marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, pointerEvents: 'none' }}>
                <svg width="100%" height="100%">
                  {(() => {
                    const beatsCount = subdivision === 'eighth' ? 8 : 4;
                    const startX = 60;
                    const step = (340 - startX - 18) / beatsCount;
                    const x = startX + step * (currentBeat + 0.5);
                    if (!metroPlaying) return null;
                    return (
                      <line x1={x} y1="0" x2={x} y2="100%" stroke={t.accent} strokeWidth="2" opacity="0.8" />
                    );
                  })()}
                </svg>
              </div>

              <div style={{ color: '#16161a' }}>
                <DrumNotation color="#16161a" width={320} accent={t.accent} active={metroPlaying ? currentBeat : -1} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setMetroPlaying(!metroPlaying)} style={{
                  width: 40, height: 40, borderRadius: '50%', background: t.accent, border: 'none', color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(242,85,69,0.3)', transition: 'all 0.15s ease'
                }}>
                  {metroPlaying ? <span style={{ fontSize: 12 }}>◼</span> : <IcPlay size={12} fill color="#fff" />}
                </button>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{metroPlaying ? 'Spiller…' : 'Start'}</div>
                  <div style={{ fontSize: 9, color: t.textMuted }}>Mål din timing</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setBpm(Math.max(40, bpm - 5))} style={{ width: 24, height: 24, borderRadius: '50%', background: t.surface2, border: 'none', color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>-</button>
                <span style={{ fontFamily: t.mono, fontSize: 12, fontWeight: 700, width: 54, textAlign: 'center' }}>{bpm} BPM</span>
                <button onClick={() => setBpm(Math.min(220, bpm + 5))} style={{ width: 24, height: 24, borderRadius: '50%', background: t.surface2, border: 'none', color: t.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>+</button>
              </div>
            </div>
          </Card>
        )}

        {category === 'playalong' && (
          <Card t={t} padding={16} style={{ marginBottom: 24, borderLeft: `3px solid ${t.accent}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.accent }}>Backing Track Player</div>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 16, marginTop: 2 }}>Funk Groove Odyssey</div>
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>105 BPM · Let øvet · Formtræning</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {([80, 100, 110] as const).map(speed => (
                  <button key={speed} onClick={() => setPlayalongSpeed(speed)} style={{
                    padding: '3px 6px', borderRadius: 4, border: `1px solid ${playalongSpeed === speed ? t.accent : t.border}`,
                    background: playalongSpeed === speed ? t.accentSoft : 'transparent', color: playalongSpeed === speed ? t.accent : t.textMuted,
                    fontSize: 9, fontFamily: t.mono, fontWeight: 700, cursor: 'pointer'
                  }}>{speed}%</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: t.textMuted, marginBottom: 6 }}>
                <span>FORM</span>
                <span style={{ color: playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.textMuted }}>
                  {playalongBeat >= 28 && playalongBeat < 30 ? '⚠️ CUE: FILL!' : 'Næste: Chorus'}
                </span>
              </div>

              <div style={{ display: 'flex', height: 20, borderRadius: 6, overflow: 'hidden', background: t.surface2, border: `1px solid ${t.border}`, position: 'relative' }}>
                <div style={{ width: '25%', background: playalongBeat < 8 ? t.accentSoft : 'rgba(0,0,0,0.02)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600 }}>Intro</div>
                <div style={{ width: '50%', background: playalongBeat >= 8 && playalongBeat < 24 ? t.accentSoft : 'rgba(0,0,0,0.02)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600 }}>Verse</div>
                <div style={{ width: '12.5%', background: playalongBeat >= 24 && playalongBeat < 28 ? t.accentSoft : 'rgba(0,0,0,0.02)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600 }}>Chorus</div>
                <div style={{ width: '6.25%', background: playalongBeat >= 28 && playalongBeat < 30 ? '#F2554533' : 'rgba(0,0,0,0.02)', borderRight: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: t.accent }}>Fill</div>
                <div style={{ width: '6.25%', background: playalongBeat >= 30 ? t.accentSoft : 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600 }}>Outro</div>

                {playalongPlaying && (
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: `${(playalongBeat / 32) * 100}%`, width: 2, background: t.accent,
                    transition: 'left 0.15s linear'
                  }} />
                )}
              </div>

              <div style={{
                marginTop: 10, padding: '8px 10px', borderRadius: 8,
                background: playalongBeat >= 28 && playalongBeat < 30 ? t.accentSoft : t.surface,
                border: `1px solid ${playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.border}`,
                fontSize: 11, fontWeight: 600, color: playalongBeat >= 28 && playalongBeat < 30 ? t.accent : t.text,
                lineHeight: 1.3
              }}>
                {playalongBeat < 8 && 'AKTIV: INTRO — Lyt til timingen og start roligt.'}
                {playalongBeat >= 8 && playalongBeat < 24 && 'AKTIV: VERS — Spil en stabil basic funk beat.'}
                {playalongBeat >= 24 && playalongBeat < 28 && 'AKTIV: OMKVÆD (CHORUS) — Mere energi!'}
                {playalongBeat >= 28 && playalongBeat < 30 && 'FILL CUE — Spil et fill! Crash på 1!'}
                {playalongBeat >= 30 && 'AKTIV: OUTRO — Dæmp energien mod slutningen.'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setPlayalongPlaying(!playalongPlaying)} style={{
                  width: 40, height: 40, borderRadius: '50%', background: t.accent, border: 'none', color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(242,85,69,0.3)'
                }}>
                  {playalongPlaying ? <span style={{ fontSize: 12 }}>◼</span> : <IcPlay size={12} fill color="#fff" />}
                </button>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{playalongPlaying ? 'Spiller track…' : 'Afspil backing track'}</div>
                  <div style={{ fontSize: 9, color: t.textMuted }}>BPM: {Math.round(105 * (playalongSpeed / 100))}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: t.textMuted, marginBottom: 2 }}>
                    <span>TROMMER</span>
                    <span style={{ fontFamily: t.mono }}>{mixerVols.drums}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={mixerVols.drums} onChange={e => setMixerVols(prev => ({ ...prev, drums: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: t.textMuted, marginBottom: 2 }}>
                    <span>MUSIK</span>
                    <span style={{ fontFamily: t.mono }}>{mixerVols.music}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={mixerVols.music} onChange={e => setMixerVols(prev => ({ ...prev, music: +e.target.value }))} style={{ width: '100%', accentColor: t.accent }} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Exercises List */}
        <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Lektioner & Øvelser ({filteredExercises.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredExercises.map(ex => (
            <div key={ex.id} style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                  background: ex.level === 'Begynder' ? 'rgba(93,211,158,0.1)' : ex.level === 'Mellemniveau' ? 'rgba(37,37,37,0.06)' : 'rgba(242,85,69,0.1)',
                  color: ex.level === 'Begynder' ? '#3eaf7c' : ex.level === 'Mellemniveau' ? t.text : t.accent,
                  textTransform: 'uppercase', letterSpacing: 0.5
                }}>{ex.level}</span>
                <span style={{ fontFamily: t.mono, fontSize: 10, color: t.textDim }}>{ex.dur} · {ex.bpm} BPM</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{ex.title}</div>
                <div style={{ fontSize: 11.5, color: t.textMuted, marginTop: 2 }}>{ex.sub}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                {ex.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '2px 6px', borderRadius: 4, background: t.surface2, fontSize: 9,
                    fontFamily: t.mono, color: t.textMuted
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: t.textMuted }}>
              <div style={{ fontSize: 12 }}>Ingen øvelser matcher chip &quot;{activeChip}&quot;.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. Track Detail Overlay
function TrackDetail({ t, trackId, onClose, onOpenLesson, onOpenCoach }: TrackDetailProps) {
  const track = practiceTracks.find(x => x.id === trackId) || practiceTracks[0];
  const lessonList = [
    { n: 1, title: 'Indre puls — fod og hånd', dur: '6 min', done: true },
    { n: 2, title: 'Click på 2 & 4', dur: '8 min', done: true },
    { n: 3, title: 'Subdivisioner i 4/4', dur: '10 min', done: true },
    { n: 4, title: '16-dele hi-hat', dur: '12 min', done: false, active: true },
    { n: 5, title: 'Tempo-flytning', dur: '14 min', done: false },
    { n: 6, title: 'Polyrytme 3:2', dur: '15 min', done: false, locked: true },
    { n: 7, title: 'Polyrytme 4:3', dur: '16 min', done: false, locked: true },
  ];

  return (
    <div className="ios-screen-overlay" style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 100,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '0 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcBack size={16} /></button>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted }}>Forløb</div>
        <button style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 40px' }}>
        <div style={{ display: 'flex', margin: '4px 0 10px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 180, height: 130 }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 65%)`,
              borderRadius: '50%',
            }} />
            <div style={{ position: 'relative' }}>
              <IllSticks size={120} color={t.accent} sw={1.7}/>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Display t={t} size={34} style={{ marginBottom: 6 }}>{track.title}</Display>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent }}>{track.subtitle}</div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.85, lineHeight: 1.45 }}>
          {track.blurb}
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: <IcClock size={18} />, title: `${track.lessonCount} lektioner`, sub: track.level },
            { icon: <IcWave size={18} />, title: 'Interaktive øvelser', sub: 'Spil med og få feedback' },
            { icon: <IcTrophy size={18} />, title: 'Fremgangssporing', sub: 'Se din udvikling over tid' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                border: `1px solid ${t.borderStrong}`, color: t.accent,
                display: 'flex', alignItems: 'center', }}>{f.icon}</div>
              <div>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.1 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <SectionLabel t={t}>Lektioner</SectionLabel>
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 18, overflow: 'hidden',
          }}>
            {lessonList.map((l, i) => (
              <div key={i} onClick={() => !l.locked && onOpenLesson(`${track.id}-${l.n}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderBottom: i < lessonList.length - 1 ? `1px solid ${t.border}` : 'none',
                opacity: l.locked ? 0.45 : 1,
                cursor: l.locked ? 'default' : 'pointer',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: l.done ? t.accent : l.active ? t.accentSoft : 'transparent',
                  border: l.done || l.active ? 'none' : `1px solid ${t.borderStrong}`,
                  color: l.done ? '#fff' : l.active ? t.accent : t.textMuted,
                  display: 'flex', alignItems: 'center', fontFamily: t.mono, fontSize: 11, fontWeight: 700,
                }}>
                  {l.done ? <IcCheck size={13} /> : l.locked ? <IcLock size={11} /> : l.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2, fontFamily: t.mono, letterSpacing: 0.5 }}>{l.dur.toUpperCase()}</div>
                </div>
                {l.active && <Pill t={t} tone="accent">I GANG</Pill>}
                {!l.locked && <IcChev size={14} color={t.textDim} />}
              </div>
            ))}
          </div>
        </div>

        <div onClick={onOpenCoach} style={{
          marginTop: 18, padding: 14, borderRadius: 16,
          border: `1px solid ${t.border}`, background: t.surface,
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcSpark size={16} color="#fff" />
          </div>
          <div style={{ flex: 1, fontSize: 13 }}>
            <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 15 }}>Spørg AI Coach</span>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>Få hjælp med dette forløb</div>
          </div>
          <IcChev size={14} color={t.textDim} />
        </div>
      </div>

      <div style={{
        padding: '12px 20px 30px', borderTop: `1px solid ${t.border}`,
        background: t.bg,
      }}>
        <CTA t={t} onClick={() => onOpenLesson(`${track.id}-4`)} icon={<IcPlay size={13} fill color="#fff"/>}>
          {track.progress > 0 ? 'Fortsæt forløb' : 'Start forløb'}
        </CTA>
      </div>
    </div>
  );
}

// 5. Lesson Detail Overlay
function LessonDetail({ t, onClose, onOpenCoach }: LessonDetailProps) {
  const [tab, setTab] = useState('noder');
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(92);
  const [beat, setBeat] = useState(0);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1");

  useEffect(() => {
    if (!playing) return;
    const interval = (60 / bpm) * 500;
    const id = setInterval(() => setBeat(b => (b + 1) % 8), interval);
    return () => clearInterval(id);
  }, [playing, bpm]);

  const timeToSeconds = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const handleChapterClick = (timeStr: string) => {
    const seconds = timeToSeconds(timeStr);
    setVideoUrl(`https://www.youtube-nocookie.com/embed/8T_87k23Q1E?rel=0&modestbranding=1&autoplay=1&start=${seconds}`);
  };

  const exercises = [
    { title: 'Spil takten i 60 BPM', detail: '8 takter uden stop', done: true },
    { title: 'Øg til 80 BPM', detail: '8 takter uden stop', done: true },
    { title: 'Spil i 92 BPM', detail: 'Måltempo · 16 takter', done: false },
    { title: 'Spil med metronom på 2 & 4', detail: '32 takter uden fejl', done: false },
    { title: 'Optag og evaluér', detail: '1 fuld take', done: false },
  ];

  return (
    <div className="ios-screen-overlay" style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 110,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcBack size={16} /></button>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1.8, textTransform: 'uppercase' }}>Lektion 04</div>
          <Display t={t} size={16} style={{ marginTop: 2 }}>16-dele hi-hat</Display>
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', background: t.surface, borderRadius: 999, padding: 4, border: `1px solid ${t.border}` }}>
          {[
            { id: 'noder', label: 'Noder' },
            { id: 'video', label: 'Video' },
            { id: 'ovelser', label: 'Øvelser' },
          ].map(tt => (
            <button key={tt.id} onClick={() => setTab(tt.id)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 999, border: 'none',
              background: tab === tt.id ? t.accent : 'transparent',
              color: tab === tt.id ? '#fff' : t.textMuted,
              fontWeight: tab === tt.id ? 700 : 500, fontSize: 12,
              letterSpacing: tab === tt.id ? 1.5 : 0.3, textTransform: tab === tt.id ? 'uppercase' : 'none',
              fontFamily: t.font, cursor: 'pointer',
            }}>{tt.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px 24px' }}>
        {tab === 'noder' && (
          <div>
            <div style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: '18px 8px',
            }}>
              <div style={{ display: 'flex', padding: '0 12px 12px', alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Takt 1 af 8</div>
                <Pill t={t} tone="accent">4/4 · {bpm} BPM</Pill>
              </div>
              <DrumNotation width={340} color={t.text} accent={t.accent} active={playing ? beat : 99} />
              <DrumNotation width={340} color={t.text} accent={t.accent} active={99} />
            </div>

            <div style={{
              marginTop: 14, background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button style={{
                    width: 40, height: 40, borderRadius: '50%', background: t.surface2,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', }}><IcLoop size={16} /></button>
                  <div>
                    <div style={{ fontFamily: t.mono, fontSize: 22, fontWeight: 600 }}>{bpm}</div>
                    <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>BPM</div>
                  </div>
                </div>

                <button onClick={() => setPlaying(!playing)} style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: t.accent, border: 'none', color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 10px 28px rgba(239,90,58,0.45)',
                }}>
                  {playing ? <IcPause size={22} fill color="#fff" /> : <IcPlay size={22} fill color="#fff" />}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setBpm(Math.max(40, bpm - 4))} style={{
                    width: 36, height: 36, borderRadius: '50%', background: t.surface2,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', }}><IcMin size={14} /></button>
                  <button onClick={() => setBpm(Math.min(220, bpm + 4))} style={{
                    width: 36, height: 36, borderRadius: '50%', background: t.surface2,
                    border: 'none', color: t.text, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', }}><IcPlus size={14} /></button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22, fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.text, opacity: 0.8, lineHeight: 1.5, textAlign: 'center', padding: '0 12px' }}>
              &quot;Hold venstre hånd afslappet. Tæl højt 1-e-og-a mens du spiller — det hjælper med at sætte 16-delene præcist.&quot;
            </div>
          </div>
        )}

        {tab === 'video' && (
          <div>
            <div style={{
              aspectRatio: '16/9', borderRadius: 18, position: 'relative',
              background: '#000',
              border: `1px solid ${t.border}`, overflow: 'hidden',
            }}>
              <iframe
                width="100%"
                height="100%"
                src={videoUrl}
                title="Trommelektion - 16-dele Hi-Hat"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: '0' }}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <Display t={t} size={20}>16-dele hi-hat</Display>
              <Display t={t} size={20} style={{ opacity: 0.5 }}>— forklaret enkelt</Display>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8, letterSpacing: 0.5 }}>Mikkel Holm · Drum School DK · 124k visninger</div>
            </div>

            <div style={{ marginTop: 24 }}>
              <SectionLabel t={t}>Kapitler (Klik for at afspille stempel)</SectionLabel>
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { time: '0:00', title: 'Introduktion' },
                  { time: '1:42', title: 'Højre hånd alene' },
                  { time: '4:18', title: 'Tilføj kick og snare' },
                  { time: '7:55', title: 'Spil med click' },
                  { time: '10:30', title: 'Almindelige fejl' },
                ].map((c, i, arr) => (
                  <div key={i} onClick={() => handleChapterClick(c.time)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none', cursor: 'pointer',
                  }}>
                    <div style={{ fontFamily: t.mono, fontSize: 12, fontWeight: 600, color: t.accent, width: 44 }}>{c.time}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.title}</div>
                    <IcPlay size={11} color={t.textDim} fill />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {tab === 'ovelser' && (
          <div>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.8, lineHeight: 1.5, marginBottom: 18, textAlign: 'center', padding: '0 16px' }}>
              Fem trin der bygger dig op til at spille grooven flydende i måltempo.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exercises.map((ex, i) => {
                const isNext = !ex.done && exercises.findIndex(e => !e.done) === i;
                return (
                  <div key={i} style={{
                    background: t.surface, border: `1px solid ${isNext ? t.accent : t.border}`,
                    borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: ex.done ? 'none' : `1.5px solid ${t.borderStrong}`,
                      background: ex.done ? t.accent : 'transparent',
                      display: 'flex', alignItems: 'center', color: ex.done ? '#fff' : t.textMuted, fontFamily: t.mono, fontWeight: 700,
                      fontSize: 12, flexShrink: 0,
                    }}>
                      {ex.done ? <IcCheck size={14} /> : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.title}</div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{ex.detail}</div>
                    </div>
                    <IcChev size={14} color={t.textDim} />
                  </div>
                );
              })}
            </div>

            <div onClick={onOpenCoach} style={{
              marginTop: 22, background: t.accentSoft, border: `1px solid ${t.accent}`,
              borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: t.accent,
                display: 'flex', alignItems: 'center', }}><IcSpark size={18} color="#fff" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.accentText }}>Spørg AI Coach</div>
                <div style={{ fontSize: 11, color: t.accentText, opacity: 0.85, marginTop: 1 }}>Få hjælp til denne lektion</div>
              </div>
              <IcChev size={14} color={t.accentText} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 6. Studio Kit Screen
function StudioKitScreen({ t, onOpenPads }: StudioKitScreenProps) {
  const { language, t: translate } = useLanguage();
  return (
    <div style={{ color: t.text, fontFamily: t.font, padding: '4px 0 40px' }}>
      <div style={{ padding: '4px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted }}>{translate('kit') || 'Trommesæt'}</div>
        <button style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', margin: '10px 0 14px', position: 'relative' }}>
          <div style={{
            position: 'absolute', width: 240, height: 180,
            background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 65%)`,
            borderRadius: '50%', top: 0,
          }} />
          <div style={{ position: 'relative' }}>
            <IllKit size={300} color={t.accent} sw={1.3}/>
          </div>
        </div>

        <Display t={t} size={36} style={{ marginBottom: 6 }}>Studio Kit</Display>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent, marginBottom: 14 }}>
          {language === 'da' ? 'Dit virtuelle trommesæt' : language === 'en' ? 'Your virtual drum kit' : language === 'de' ? 'Dein virtuelles Schlagzeug' : 'Tu batería virtual'}
        </div>

        <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 15, color: t.text, opacity: 0.8, lineHeight: 1.5 }}>
          {language === 'da' ? 'Et professionelt trommesæt med realistisk lyd og respons.' : language === 'en' ? 'A professional drum kit with realistic sound and response.' : language === 'de' ? 'Ein professionelles Schlagzeug mit realistischem Sound und Ansprechverhalten.' : 'Una batería profesional con sonido y respuesta realistas.'}
        </div>

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { 
              icon: <IcWave size={18} />, 
              title: language === 'da' ? 'Realistisk lyd' : language === 'en' ? 'Realistic Sound' : language === 'de' ? 'Realistischer Sound' : 'Sonido realista', 
              sub: language === 'da' ? 'Optaget i studiekvalitet' : language === 'en' ? 'Recorded in studio quality' : language === 'de' ? 'In Studioqualität aufgenommen' : 'Grabado en calidad de estudio' 
            },
            { 
              icon: <IcTuner size={18} />, 
              title: language === 'da' ? 'Tilpas dit kit' : language === 'en' ? 'Customize your kit' : language === 'de' ? 'Passe dein Kit an' : 'Personaliza tu kit', 
              sub: language === 'da' ? 'Justér lyd og opsætning' : language === 'en' ? 'Adjust sound and setup' : language === 'de' ? 'Sound und Setup anpassen' : 'Ajustar sonido y configuración' 
            },
            { 
              icon: <IcMic size={18} />, 
              title: language === 'da' ? 'Responsiv følelse' : language === 'en' ? 'Responsive feel' : language === 'de' ? 'Reaktionsschnelles Gefühl' : 'Sensación receptiva', 
              sub: language === 'da' ? 'Naturlig spiloplevelse' : language === 'en' ? 'Natural playing experience' : language === 'de' ? 'Natürliches Spielerlebnis' : 'Experiencia de juego natural' 
            },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                border: `1px solid ${t.borderStrong}`, color: t.accent,
                display: 'flex', alignItems: 'center', }}>{f.icon}</div>
              <div>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1.1 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30 }}>
          <CTA t={t} onClick={onOpenPads} icon={<IcPlay size={13} fill color="#fff"/>}>
            {language === 'da' ? 'Åbn trommesæt' : language === 'en' ? 'Open drum kit' : language === 'de' ? 'Schlagzeug öffnen' : 'Abrir batería'}
          </CTA>
        </div>
      </div>
    </div>
  );
}

// 7. Pad view overlay
const pads = [
  { label: 'Hi-hat', sub: 'Closed', color: '#ef5a3a', accent: true, key: 'h' },
  { label: 'Hi-hat', sub: 'Open',   color: '#ef5a3a', key: 'g' },
  { label: 'Crash',  sub: '16"',    color: '#ef5a3a', key: 'c' },
  { label: 'Snare',  sub: 'Center', color: '#ef5a3a', accent: true, key: 's' },
  { label: 'Tom 1',  sub: '10"',    color: '#ef5a3a', key: 't' },
  { label: 'Tom 2',  sub: '12"',    color: '#ef5a3a', key: 'y' },
  { label: 'Floor',  sub: '14"',    color: '#ef5a3a', key: 'f' },
  { label: 'Ride',   sub: '20"',    color: '#ef5a3a', key: 'r' },
  { label: 'Kick',   sub: 'Bass',   color: '#ef5a3a', accent: true, key: 'k' },
];

interface CustomWindow extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
  __kitAudio?: AudioContext;
}

function KitPadView({ t, onClose }: KitPadViewProps) {
  const [active, setActive] = useState<Record<number, number>>({});
  const [recording, setRecording] = useState(false);
  const { language } = useLanguage();

  const hit = (i: number) => {
    setActive(a => ({ ...a, [i]: Date.now() }));
    setTimeout(() => setActive(a => {
      const next = { ...a };
      delete next[i];
      return next;
    }), 240);

    // Audio synthesizer synthesis
    try {
      if (typeof window !== 'undefined') {
        const win = window as unknown as CustomWindow;
        const AudioCtx = win.AudioContext || win.webkitAudioContext;
        if (AudioCtx) {
          const ctx = win.__kitAudio || (win.__kitAudio = new AudioCtx());
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const isKick = pads[i].label === 'Kick';
          const isSnare = pads[i].label === 'Snare';
          o.type = isKick ? 'sine' : isSnare ? 'triangle' : 'square';
          o.frequency.value = isKick ? 60 : isSnare ? 200 : (300 + i * 40);
          g.gain.value = 0.06;
          o.connect(g); g.connect(ctx.destination);
          o.start();
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (isKick ? 0.18 : 0.08));
          o.stop(ctx.currentTime + 0.2);
        }
      }
    } catch {
      // Ignore audio synthesis errors
    }
  };

  // Keyboard triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = pads.findIndex(p => p.key === e.key.toLowerCase());
      if (idx !== -1) {
        hit(idx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 150,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: '50%', background: 'transparent',
          border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcBack size={16} /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1.8, textTransform: 'uppercase' }}>Studio Kit</div>
          <Display t={t} size={16} style={{ marginTop: 2 }}>
            {language === 'da' ? 'Live-spil' : language === 'en' ? 'Live Play' : language === 'de' ? 'Live-Spiel' : 'Juego en vivo'}
          </Display>
        </div>
        <button onClick={() => setRecording(!recording)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: recording ? t.accent : 'transparent',
          border: `1px solid ${recording ? t.accent : t.border}`,
          color: recording ? '#fff' : t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', }}><IcMic size={16} /></button>
      </div>

      <div style={{ display: 'flex', padding: '6px 0 16px', position: 'relative' }}>
        <div style={{
          position: 'absolute', width: 200, height: 130,
          background: `radial-gradient(circle, ${t.accentSoft} 0%, transparent 60%)`,
          borderRadius: '50%', top: 0,
        }} />
        <div style={{ position: 'relative' }}>
          <IllKit size={200} color={t.accent} sw={1.3}/>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px', overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {pads.map((p, i) => {
            const isActive = active[i];
            return (
              <button key={i} onMouseDown={() => hit(i)} onTouchStart={() => hit(i)} style={{
                aspectRatio: '1', borderRadius: 18,
                background: isActive ? t.accent : t.surface,
                border: `1px solid ${isActive ? t.accent : (p.accent ? t.borderStrong : t.border)}`,
                color: isActive ? '#fff' : t.text, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: t.font, transition: 'all 0.08s ease-out',
                transform: isActive ? 'scale(0.96)' : 'scale(1)',
                boxShadow: isActive ? '0 0 30px rgba(239,90,58,0.4)' : 'none',
                padding: 0,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.7 }}>{p.sub}</div>
                <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 22, marginTop: 4, lineHeight: 1 }}>{p.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 18, padding: 14,
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: recording ? t.accent : t.textDim }} />
            <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              {recording ? (language === 'da' ? 'Optager' : language === 'en' ? 'Recording' : language === 'de' ? 'Aufnahme' : 'Grabando') : (language === 'da' ? 'Klar' : language === 'en' ? 'Ready' : language === 'de' ? 'Bereit' : 'Listo')}
            </div>
          </div>
          <div style={{ fontFamily: t.mono, fontSize: 14, fontWeight: 600 }}>00:00</div>
          <button style={{
            background: 'transparent', border: `1px solid ${t.border}`, color: t.text,
            padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: t.font,
          }}><IcMetro size={12} /> 92 BPM</button>
        </div>
      </div>
    </div>
  );
}

// 8. Coach Screen Overlay
interface CoachMessage {
  role: string;
  text: string;
  typing?: boolean;
}

function CoachScreen({ t, onClose }: CoachScreenProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([
    { role: 'ai', text: 'Hej Astrid 👋\nJeg er din AI Coach. Jeg har set, du arbejder med 16-dele hi-hat lige nu. Hvordan går det?' },
    { role: 'user', text: 'Det er svært at holde tempo når jeg tilføjer kick. Højre hånd bliver hurtig.' },
    { role: 'ai', text: 'Det er en klassisk udfordring — kroppen vil gerne synkronisere bevægelserne. Prøv det her:\n\n1.   Sæt metronomen til 70 BPM\n2.   Spil KUN hi-hat 16-dele i 8 takter\n3.   Hold tempo, og tilføj så kun kick på 1\n\nFokuser bevidst på at hi-hat-hånden IKKE accelererer. Vil du have, jeg åbner en øvelse til dig?' },
    { role: 'user', text: 'Ja tak.' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', text: input }];
    setInput('');
    setMessages(next);
    setTimeout(() => {
      setMessages([...next, { role: 'ai', text: 'Lad mig finde den…', typing: true }]);
      setTimeout(() => {
        setMessages([...next, { role: 'ai', text: 'Klar — jeg har bygget et 4-trins forløb til dig: starter i 60 BPM og bygger op til 100 BPM. Tryk Start når du er klar.' }]);
      }, 1100);
    }, 250);
  };

  const suggested = [
    'Forklar synkoper',
    'Vis paradiddle',
    'Hvad skal jeg øve i dag?',
    'Hjælp med 16-dele',
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: t.bg, zIndex: 130,
      display: 'flex', flexDirection: 'column', color: t.text, fontFamily: t.font,
      animation: 'slideUp 0.3s ease-out', overflow: 'hidden',
    }}>
      <div style={{ height: 'var(--safe-top, 62px)' }} />

      <div style={{ padding: '4px 16px 14px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            width: 38, height: 38, borderRadius: '50%', background: 'transparent',
            border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', }}><IcBack size={16} /></button>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: t.accent, color: '#fff',
            display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(239,90,58,0.35)',
          }}><IcSpark size={20} color="#fff" /></div>
          <div style={{ flex: 1 }}>
            <Display t={t} size={20} style={{ lineHeight: 1 }}>AI Coach</Display>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.good }} />
              <span style={{ fontSize: 11, color: t.textMuted }}>Online · husker dit niveau</span>
            </div>
          </div>
          <button style={{
            width: 38, height: 38, borderRadius: '50%', background: 'transparent',
            border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', }}><IcMore size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '18px 16px 8px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', marginBottom: 12,
          }}>
            <div style={{
              maxWidth: '82%',
              padding: '11px 14px', borderRadius: 18,
              borderBottomRightRadius: m.role === 'user' ? 6 : 18,
              borderBottomLeftRadius: m.role === 'ai' ? 6 : 18,
              background: m.role === 'user' ? t.accent : t.surface,
              color: m.role === 'user' ? '#fff' : t.text,
              border: m.role === 'ai' ? `1px solid ${t.border}` : 'none',
              fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              fontWeight: m.role === 'user' ? 500 : 400,
            }}>
              {m.text}
              {m.typing && <span style={{ marginLeft: 4, opacity: 0.5 }}>•••</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '8px 16px 4px', display: 'flex', gap: 8, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {suggested.map((s, i) => (
          <button key={i} onClick={() => setInput(s)} style={{
            flexShrink: 0, padding: '8px 13px', borderRadius: 999,
            background: 'transparent', border: `1px solid ${t.border}`,
            color: t.textMuted, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            fontFamily: t.font, whiteSpace: 'nowrap',
          }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: '10px 16px 22px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 999, padding: '6px 6px 6px 16px',
        }}>
          <button style={{
            width: 32, height: 32, borderRadius: '50%', background: 'transparent',
            border: 'none', color: t.textMuted, cursor: 'pointer',
            display: 'flex', alignItems: 'center', }}><IcAttach size={18} /></button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Stil et spørgsmål…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: t.font, fontSize: 14, color: t.text, padding: '8px 0',
            }}
          />
          <button onClick={send} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: input.trim() ? t.accent : t.surface2,
            border: 'none', color: input.trim() ? '#fff' : t.textDim,
            cursor: 'pointer', display: 'flex', alignItems: 'center', }}><IcSend size={16} /></button>
        </div>
      </div>
    </div>
  );
}

// 9. Profile Screen
function ProfileScreen({ t, dark, setDark, guestXp }: ProfileScreenProps) {
  const { user, login, logout } = useAuth();
  const { language, setLanguage, t: translate } = useLanguage();
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoginLoading(true);
    try {
      await login();
    } catch {
      setErrorMsg(language === 'da' ? 'Fejl under login med Google. Prøv igen.' : 'Error during Google sign-in. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const xp = user?.xp !== undefined ? user.xp : guestXp;
  const level = user ? (user.level || 1) : Math.floor(xp / 200) + 1;
  const streak = user?.streak !== undefined ? user.streak : 7;
  const xpPct = ((xp % 200) / 200) * 100;
  const isPremium = user ? (user.isPremium || false) : false;

  return (
    <div style={{ color: t.text, fontFamily: t.font, padding: '4px 0 40px' }}>
      <div style={{ padding: '4px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.textMuted }}>
          {translate('profile') || 'Profil'}
        </div>
      </div>

      {!user ? (
        /* Login view */
        <div style={{ padding: '30px 20px 10px' }}>
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 20, padding: 24, textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
            <Display t={t} size={22} style={{ marginBottom: 8 }}>
              {language === 'da' ? 'Gem dine fremskridt' : language === 'en' ? 'Save Your Progress' : language === 'de' ? 'Speichere deinen Fortschritt' : 'Guarda tu progreso'}
            </Display>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 20, lineHeight: 1.5 }}>
              {translate('loginGoogleSub')}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleGoogleLogin}
                disabled={loginLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: t.surface2,
                  border: `1px solid ${t.borderStrong}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  color: t.text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loginLoading ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                  fontFamily: t.font,
                  outline: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 18 18" style={{ marginRight: 4 }}>
                  <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.56 2.69-3.86 2.69-6.57z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.33-1.58-5.04-3.71H.94v2.3C2.42 16.03 5.48 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.96 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.94A8.99 8.99 0 000 9c0 1.45.35 2.82.94 4.04l3.02-2.3z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.41 0 9 0 5.48 0 2.42 1.97.94 4.96l3.02 2.3c.71-2.13 2.69-3.71 5.04-3.71z"/>
                </svg>
                {loginLoading ? (language === 'da' ? 'Logger ind...' : 'Signing in...') : translate('loginGoogle')}
              </button>
              {errorMsg && (
                <div style={{ color: t.accent, fontSize: 11, fontWeight: 500, marginTop: 4 }}>{errorMsg}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Logged in view */
        <>
          <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  style={{ 
                    width: 96, height: 96, borderRadius: '50%', 
                    objectFit: 'cover', border: `3px solid ${t.accent}`,
                    boxShadow: '0 10px 28px rgba(239,90,58,0.25)',
                  }} 
                />
              ) : (
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: t.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.serif, fontStyle: 'italic', fontSize: 36, color: '#fff',
                  boxShadow: '0 10px 28px rgba(239,90,58,0.4)',
                }}>{getInitials(user.displayName)}</div>
              )}
            </div>
            <Display t={t} size={28} style={{ marginTop: 16 }}>{user.displayName}</Display>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t.accent, marginTop: 6 }}>
              {user.role === 'admin' ? (translate('adminPanel') || 'Administrator') : `${translate('level')} ${level} · ${isPremium ? 'PRO' : (translate('freePlan') || 'Gratis')}`}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>{user.email}</div>

            {user.role === 'admin' && (
              <div style={{ marginTop: 12 }}>
                <a href="/admin" style={{ 
                  color: t.accent, textDecoration: 'none', fontSize: 12, 
                  fontWeight: 600, borderBottom: `1px solid ${t.accent}` 
                }}>
                  {translate('adminPanel')} →
                </a>
              </div>
            )}

            <div style={{ marginTop: 18, padding: '0 12px' }}>
              <div style={{ display: 'flex', fontSize: 10, color: t.textMuted, marginBottom: 6, fontFamily: t.mono, fontWeight: 600, letterSpacing: 0.5, justifyContent: 'space-between' }}>
                <span>{translate('level').toUpperCase()} {level}</span>
                <span>{xp % 200} / 200 XP</span>
                <span>{translate('level').toUpperCase()} {level + 1}</span>
              </div>
              <Progress pct={xpPct} t={t} h={6} />
            </div>
          </div>

          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: <IcFlame size={16} color={t.accent} />, value: String(streak), label: language === 'da' ? 'Dage streak' : language === 'en' ? 'Day Streak' : language === 'de' ? 'Tage am Stück' : 'Racha de días' },
                { icon: <IcClock size={16} color={t.text} />, value: '18t', label: language === 'da' ? 'Total øvetid' : language === 'en' ? 'Total Practice' : language === 'de' ? 'Gesamtübungszeit' : 'Práctica total' },
                { icon: <IcCalendar size={16} color={t.text} />, value: '3/10', label: language === 'da' ? 'Moduler i gang' : language === 'en' ? 'Active Modules' : language === 'de' ? 'Aktive Module' : 'Módulos activos' },
                { icon: <IcTrophy size={16} color={t.text} />, value: `${user.completedExercises?.length || 0}`, label: language === 'da' ? 'Lektioner ✓' : language === 'en' ? 'Lessons Completed' : language === 'de' ? 'Lektionen ✓' : 'Lecciones ✓' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: 16, padding: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.icon}
                    <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                  <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 26, marginTop: 6, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Settings section */}
      <div style={{ padding: '26px 20px 0' }}>
        <SectionLabel t={t}>
          {language === 'da' ? 'Indstillinger' : language === 'en' ? 'Settings' : language === 'de' ? 'Einstellungen' : 'Configuraciones'}
        </SectionLabel>
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 18, overflow: 'hidden',
        }}>
          {/* Dark Mode Switcher Row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', border: `1px solid ${t.borderStrong}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text,
            }}>{dark ? <IcMoon size={14} /> : <IcSun size={14} />}</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
              {language === 'da' ? 'Mørkt tema' : language === 'en' ? 'Dark Theme' : language === 'de' ? 'Dunkles Design' : 'Tema oscuro'}
            </div>
            <button onClick={() => setDark(!dark)} style={{
              width: 46, height: 26, borderRadius: 999, position: 'relative',
              background: dark ? t.accent : t.surface2,
              border: 'none', cursor: 'pointer', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: dark ? 22 : 2, transition: 'left 0.2s',
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }} />
            </button>
          </div>

          {/* Language Switcher Setting Row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', border: `1px solid ${t.borderStrong}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text,
              fontSize: 14
            }}>🌐</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
              {language === 'da' ? 'Sprog' : language === 'en' ? 'Language' : language === 'de' ? 'Sprache' : 'Idioma'}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { code: 'da', flag: '🇩🇰' },
                { code: 'en', flag: '🇬🇧' },
                { code: 'de', flag: '🇩🇪' },
                { code: 'es', flag: '🇪🇸' }
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as any)}
                  style={{
                    background: language === l.code ? t.accentSoft : 'transparent',
                    border: `1px solid ${language === l.code ? t.accent : 'transparent'}`,
                    borderRadius: 6,
                    padding: '4px 6px',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {l.flag}
                </button>
              ))}
            </div>
          </div>

          {[
            { icon: <IcBell size={14} />, label: language === 'da' ? 'Notifikationer' : language === 'en' ? 'Notifications' : language === 'de' ? 'Benachrichtigungen' : 'Notificaciones', detail: 'Hver dag kl. 18' },
            { icon: <IcMetro size={14} />, label: language === 'da' ? 'Standard metronom' : language === 'en' ? 'Default Metronome' : language === 'de' ? 'Standard-Metronom' : 'Metrónomo predeterminado', detail: '92 BPM' },
            ...(user ? [{ icon: <IcLogout size={14} />, label: translate('logout'), onClick: logout }] : [])
          ].map((s, i, arr) => (
            <div key={i} onClick={s.onClick} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none',
              cursor: s.onClick ? 'pointer' : 'default',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', border: `1px solid ${t.borderStrong}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text,
              }}>{s.icon}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{s.label}</div>
              {s.detail && <span style={{ fontSize: 12, color: t.textMuted, marginRight: 2 }}>{s.detail}</span>}
              {!s.onClick && <IcChev size={14} color={t.textDim} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 28, fontSize: 10, color: t.textDim, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase' }}>
        Pocket Drummer v1.2.0
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App Tab bar & Shell Wrapper
// ─────────────────────────────────────────────────────────────
function TabBar({ tab, onTab, t, dark, isMobile, onSelectCategory }: TabBarProps) {
  const { t: translate } = useLanguage();
  const tabs = [
    { id: 'home', label: translate('home') || 'Hjem', icon: TabHome },
    { id: 'practice', label: translate('practice') || 'Øvelser', icon: TabPractice },
    { id: 'playalong', label: translate('playalong') || 'Play-along', icon: TabPlayalong },
    { id: 'kit', label: translate('kit') || 'Trommesæt', icon: TabKit },
    { id: 'profile', label: translate('profile') || 'Profil', icon: TabUser },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
      paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 8px)' : 24,
      paddingTop: 14, paddingLeft: 0, paddingRight: 0,
      background: dark
        ? 'linear-gradient(to top, rgba(10,10,10,1) 50%, rgba(10,10,10,0.85) 80%, rgba(10,10,10,0))'
        : 'linear-gradient(to top, rgba(250,248,245,1) 50%, rgba(250,248,245,0.85) 80%, rgba(250,248,245,0))',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 4px',
      }}>
        {tabs.map(tt => {
          const active = tab === tt.id;
          const Icon = tt.icon;
          return (
            <button key={tt.id} onClick={() => {
              if (tt.id === 'playalong') {
                onSelectCategory('playalong');
              } else {
                onTab(tt.id);
              }
            }} style={{
              flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '6px 0', fontFamily: t.font,
              color: active ? t.accent : t.textMuted,
            }}>
              <Icon size={24} color={active ? t.accent : t.textMuted} sw={active ? 1.8 : 1.4} />
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: 0.2,
              }}>{tt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function useFitScale(w: number, h: number, margin = 24) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const s = Math.min(
        (window.innerWidth - margin * 2) / w,
        (window.innerHeight - margin * 2) / h,
        1
      );
      setScale(s > 0 ? s : 1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [w, h, margin]);
  return scale;
}

export default function MobilePrototype() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState('home');
  const [trackId, setTrackId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const [padsOpen, setPadsOpen] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'opvarmning' | 'nodelære' | 'grooves' | 'playalong' | null>(null);
  const [rhythmHeroOpen, setRhythmHeroOpen] = useState(false);
  const [guestXp, setGuestXp] = useState(120);

  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize guest XP and onboarded status client-side
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const valXp = localStorage.getItem('pocketdrummer_xp');
        if (valXp) setGuestXp(Number(valXp));

        const valOnboard = localStorage.getItem('pocketdrummer-onboarded');
        setTimeout(() => {
          setOnboarded(valOnboard === '1');
        }, 0);
      }
    } catch {
      // Ignore errors silently on SSR
    }
  }, []);

  const handleAwardXp = async (awardedXp: number) => {
    try {
      if (user) {
        const nextXp = (user.xp || 0) + awardedXp;
        const nextLevel = Math.floor(nextXp / 200) + 1;
        const { firestoreService } = await import('@/lib/firestoreService');
        await firestoreService.saveUserProfile(user.uid, {
          xp: nextXp,
          level: nextLevel
        });
      } else {
        const nextXp = guestXp + awardedXp;
        setGuestXp(nextXp);
        localStorage.setItem('pocketdrummer_xp', String(nextXp));
      }
    } catch (err) {
      console.error("Error awarding RhythmHero XP:", err);
    }
  };

  const t = tokens(dark);
  const scale = useFitScale(402, 874);

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [tab]);

  const completeOnboarding = () => {
    try {
      localStorage.setItem('pocketdrummer-onboarded', '1');
    } catch {
      // Ignore errors silently
    }
    setOnboarded(true);
  };

  const handleResetOnboarding = () => {
    try {
      localStorage.removeItem('pocketdrummer-onboarded');
    } catch {
      // Ignore errors silently
    }
    setOnboarded(false);
  };

  const safeVars = {
    '--safe-top': isMobile ? 'calc(env(safe-area-inset-top) + 12px)' : '62px',
    '--safe-bottom': isMobile ? 'env(safe-area-inset-bottom)' : '0px',
  } as React.CSSProperties;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050505' }}>
      <Header />

      {/* Main Studio Frame container */}
      <div style={isMobile ? {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: t.bg,
        overflow: 'hidden'
      } : {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        background: 'radial-gradient(circle at center, #111 0%, #050505 100%)',
        overflow: 'hidden'
      }}>
        {/* Reset button to clear localStorage onboarding state */}
        <button 
          onClick={handleResetOnboarding}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            padding: '6px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: t.mono,
            zIndex: 90
          }}
        >
          Reset Intro
        </button>

        {/* Scaled Device Shell */}
        <div style={isMobile ? {
          width: '100%',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          ...safeVars
        } : {
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: 402,
          height: 874,
          ...safeVars
        }}>
          <div style={isMobile ? {
            width: '100%',
            height: '100%',
            position: 'relative',
            background: t.bg,
            fontFamily: t.font,
            WebkitFontSmoothing: 'antialiased',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          } : {
            width: 402,
            height: 874,
            borderRadius: 48,
            overflow: 'hidden',
            position: 'relative',
            background: dark ? '#000' : '#F2F2F7',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 12px rgba(15,15,15,1)',
            fontFamily: t.font,
            WebkitFontSmoothing: 'antialiased'
          }}>
            {/* Dynamic island */}
            {!isMobile && (
              <div style={{
                position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
                width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 180,
              }} />
            )}

            {/* Page background */}
            <div style={{
              position: 'absolute', inset: 0, background: t.bg, transition: 'background 0.3s',
            }} />

            {/* Status bar */}
            {!isMobile && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 170 }}>
                <IOSStatusBar dark={dark} />
              </div>
            )}

            {/* Content area */}
            <div ref={contentRef} style={{
              position: 'absolute',
              top: 'var(--safe-top)',
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'auto',
              paddingBottom: 'calc(var(--safe-bottom) + 100px)',
            }}>
              {tab === 'home' && (
                <HomeScreen t={t} dark={dark} setDark={setDark}
                  onSelectCategory={(id) => setSelectedCategory(id)}
                  onOpenCoach={() => setCoachOpen(true)}
                  onPlayRhythmHero={() => setRhythmHeroOpen(true)}
                  guestXp={guestXp} />
              )}
              {tab === 'practice' && (
                <PracticeScreen t={t} dark={dark} 
                  onSelectCategory={(id) => setSelectedCategory(id)}
                  onPlayRhythmHero={() => setRhythmHeroOpen(true)} />
              )}
              {tab === 'kit' && (
                <StudioKitScreen t={t} dark={dark} onOpenPads={() => setPadsOpen(true)} />
              )}
              {tab === 'profile' && (
                <ProfileScreen t={t} dark={dark} setDark={setDark} guestXp={guestXp} />
              )}
            </div>

            {/* Tab bar */}
            <TabBar tab={tab} onTab={setTab} t={t} dark={dark} isMobile={isMobile}
              onSelectCategory={(cat) => setSelectedCategory(cat)} />

            {/* Category detail overlay */}
            {selectedCategory && (
              <MobileCategoryDetail t={t} dark={dark} category={selectedCategory}
                onClose={() => setSelectedCategory(null)}
                onOpenCoach={() => { setSelectedCategory(null); setCoachOpen(true); }} />
            )}

            {/* Track detail overlay */}
            {trackId && (
              <TrackDetail t={t} dark={dark} trackId={trackId}
                onClose={() => setTrackId(null)}
                onOpenLesson={(id: string) => setLessonId(id)}
                onOpenCoach={() => { setTrackId(null); setCoachOpen(true); }} />
            )}

            {/* Lesson detail overlay */}
            {lessonId && (
              <LessonDetail t={t} dark={dark} lessonId={lessonId}
                onClose={() => setLessonId(null)}
                onOpenCoach={() => { setLessonId(null); setCoachOpen(true); }} />
            )}

            {/* Coach overlay */}
            {coachOpen && (
              <CoachScreen t={t} dark={dark} onClose={() => setCoachOpen(false)} />
            )}

            {/* Pad view overlay */}
            {padsOpen && (
              <KitPadView t={t} dark={dark} onClose={() => setPadsOpen(false)} />
            )}

            {/* Onboarding (covers everything) */}
            {!onboarded && (
              <OnboardingScreen t={t} dark={dark} onStart={completeOnboarding} />
            )}

            {/* Rhythm Hero overlay */}
            {rhythmHeroOpen && (
              <RhythmHero 
                onClose={() => setRhythmHeroOpen(false)}
                onAwardXP={handleAwardXp}
                tTokens={t}
              />
            )}

            {/* Home indicator */}
            {!isMobile && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 160,
                height: 34, display: 'flex', alignItems: 'flex-end',
                paddingBottom: 8, pointerEvents: 'none',
              }}>
                <div style={{
                  width: 139, height: 5, borderRadius: 100,
                  background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.3)',
                }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

