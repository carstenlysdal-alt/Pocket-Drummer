# Pocket Drummer — Produktroadmap

**Status:** Aktiv · Pre-launch
**Opdateret:** Maj 2026
**North Star:** 30-dages retention

---

## Strategisk kontekst

Mobil er primær platform. Launch via App Store + Google Play. Alt herunder tjener én ting: at en begynder øver i dag, i morgen og ugen efter.

---

## RICE-prioritering

*Reach = andel af brugerbase påvirket (1–10) · Impact = effekt på North Star (1–3) · Confidence = sikkerhed på estimat · Effort = udviklingsuger*

| Initiative | Reach | Impact | Conf. | Effort | RICE | Prioritet |
|---|---|---|---|---|---|---|
| Freemium-grænse redesign | 10 | 2 | 75% | 1 uge | **15,0** | P0 |
| App Store-wrapper (Capacitor) | 10 | 3 | 80% | 2 uger | **12,0** | P0 |
| Øvelsesbibliotek: min. 30 øvelser | 8 | 2 | 95% | 3 uger | **5,1** | P0 |
| Gamification: streak + progression-map + badges | 10 | 3 | 85% | 5 uger | **5,1** | P0 |
| Mobilapp til produktionsklar stand | 10 | 3 | 90% | 6 uger | **4,5** | P0 |
| Desktop/iPad som responsiv udvidelse | 4 | 1 | 70% | 5 uger | **0,6** | P1 |

---

## Committed — Launch-blokerende

### 1. Freemium-grænse redesign · 1 uge

Ny model:
- **Gratis:** 7-dages fuldt adgang (onboarding trial) — 1 AI-genereret læringsplan + ubegrænset coach
- **Premium (50 kr./md):** Fuld adgang, ubegrænsede planer, fuldt bibliotek, alle gamification-features
- Copy: Ret "300+ øvelser" til faktisk antal

### 2. App Store-wrapper · 2 uger

Valg: **Capacitor** (ikke PWA) — giver native push notifications til streak-mekanik.

- Opsæt Capacitor + iOS/Android build pipeline
- Definer splash screen, app icon, App Store-screenshots
- Indsend til Apple App Store (2–4 ugers godkendelsestid — start tidligt)

### 3. Gamification · 5 uger

**Streak (uge 1–2)**
- Daglig øve-streak med tæller og visuel ild-indikator
- Push notification: "Din streak er i fare 🥁"
- Streak-frys: 1 pr. uge for premium

**Progression-map (uge 2–4)**
- Visuelt kort: Begynder → Rutineret → Øvet → Avanceret
- Nuværende position markeret
- Næste milestone synlig: "15 BPM til næste level"

**Badges (uge 4–5)**
- 12 badges ved launch: "Første groove," "7-dages streak," "100 BPM," "Paradiddle mestret," "Første fill," "30 dage aktiv" m.fl.
- Badge-unlock animeres — belønningsmoment

### 4. Mobilapp til produktionsklar stand · 6 uger

`/prototype` løftes til produktion. macOS-desktop-designet erstattes.

MVP-scope mobil:
- Auth-flow (login/logout via Firestore)
- Læringsplan integreret
- Øvelsesbibliotek funktionelt
- Coach fuldt integreret
- Gamification-komponenter (streak, progression-map, badges)
- Design: `/prototype` er udgangspunktet

### 5. Øvelsesbibliotek · løbende

- Minimum 30 kuraterede øvelser ved launch (begynder: 15, mellemniveau: 10, øvet: 5)
- AI-generering som buffer — alt godkendes redaktionelt
- Copy opdateres til faktisk antal

---

## Afhængigheder

```
Freemium-redesign
    ↓
App Store-wrapper ← kræver færdigt mobildesign
    ↓
Gamification ← kræver Firestore (eksisterer ✓)
    ↓
Mobilapp produktion ← integrerer gamification
    ↓
LAUNCH
    ↓
Desktop/iPad (post-launch)
```

---

## Directional — Inden 90 dage efter launch

- **Desktop + iPad som responsiv udvidelse** · 5 uger — bygget oven på mobildesign
- **Onboarding-optimering** · 2 uger — mål trial-completion rate, redesign hvis < 40%
- **Retention-dashboard (intern)** · 1 uge — DAU, streak-længder, churn-dag via Firebase

---

## Speculative — Fase 2

- B2B musikskole-licens — kun ved inbound efterspørgsel
- Social features — del streak, sammenlign progression
- Leaderboards — ugentlig top-praktikanter i dit niveau
- Video-lektioner — hvis retention-data viser behov

---

## Risici

| Risiko | Sandsynlighed | Konsekvens | Mitigering |
|---|---|---|---|
| Apple afviser app | Middel | 2–4 ugers forsinkelse | Indsend tidligt, følg Apples IAP-guidelines |
| Streak driver churn ved brud | Høj | Øger churn frem for at reducere | Streak-frys ind fra start |
| 30 øvelser ikke nok til uge 3–4 | Middel | Brugere løber tør for indhold | AI-generering som buffer |
| Mobilprototype kræver > 6 uger | Middel | Forsinker launch | Definér og lås MVP-scope |
