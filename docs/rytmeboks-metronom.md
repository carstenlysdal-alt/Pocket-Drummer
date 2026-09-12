# Rytmeboks — Metronom

Implementeret som en del af Pocket Drummer. Tilgås via fanen **Rytmeboks** i navigation.

---

## Implementeret (v1)

### BPM
- Område: 20–400 BPM
- Decimaler: 0,5-trins præcision via input-felt (fx 92,5)
- Nudge: −5, −1, +1, +5
- Hurtigvalg: 60, 80, 100, 120
- Tap tempo: beregner gennemsnit over de seneste 6 tryk (vindue: 4 sek.)

### Taktarter
| Taktart | Status |
|---------|--------|
| 2/4 | ✓ |
| 3/4 | ✓ |
| 4/4 | ✓ |
| 5/4 | ✓ |
| 6/4 | ✓ |
| 6/8 | ✓ |
| 7/8 | ✓ |
| 9/8 | ✓ |

### Underdelinger
| Underdeling | Multiplikator |
|-------------|---------------|
| Kvartnoder | ×1 |
| Ottendedele | ×2 |
| 16.-dele | ×4 |
| Trioler | ×3 |

### Kliklyde
- **Klik** — klassisk oscillator-klik
- **Træblok** — mel. frekvens, perkussiv
- **Hi-hat** — noise burst, highpass-filtreret

### Beat-visualisering
- Cirkler for hvert pulsslag — Snare Red på slag 1, grøn på øvrige
- Sekundære prikker for underdelinger

### Træningstilstande
| Tilstand | Funktion |
|----------|----------|
| Normal | Standard metronom |
| Gap | Klik på X takter, pause i Y takter — træner intern puls |
| Backbeat | Klik kun på slag 2 og 4 |
| Ramp | Gradvis stigning fra X BPM til Y BPM over Z takter |

### Swing
- Synlig og justerbar når underdeling er ottendedele eller 16.-dele
- 50% = lige, 66% = klassisk shuffle, 70% = tung shuffle

---

## Planlagt (Phase 2 — post-launch)

- Accent-kontrol: vælg hvilke slag der accentueres
- Random tempo trainer: spil inden for et defineret BPM-interval
- Tempo-cykler: sekvenser af tempoer pr. takter
- Groove-presets: straight, swing, shuffle, bossa, samba m.fl.
- Human feel: timing- og velocity-variation
- Volumen pr. lag (accent vs. puls vs. underdeling)
- Displaced click (klik på offbeats)
- Mute enkeltslag i et underdelingsmønster

## Ikke planlagt (ikke relevant for primær bruger)

Polyrhythm, polymetric, custom sample import, panorering, 13-tuplets og andre professionelle features er eksplicit fravalgt. Primær bruger er begynder (25–45 år) — kompleksitet over dette niveau forringer oplevelsen.

---

## Teknisk

- Web Audio API — `AudioContext` + `OscillatorNode` / `BufferSourceNode`
- Timing via `setInterval` (tilstrækkelig præcision for læringsformål)
- Ramp-mode genstarter interval ved hvert bar-skift med nyt BPM
- Komponent: `StudioKitScreen` i `src/app/prototype/page.tsx`
- Tab-ID: `'kit'`, translation key: `kit` → "Rytmeboks" i `src/lib/translations.ts`
