# Reviewevidens — 13. september 2026

Bilag til [review og optimeringsplan](../review-optimeringsplan-2026-09-13.md). Alle kørsler brugte en midlertidig kopi af commit `b9e6303b1ab4ef81902bf599b2ba2d6bd9dc98ef`. Ingen appkode, produktionsdata eller rigtige konti blev ændret.

| Fil | Indhold |
|---|---|
| [checks.json](checks.json) | Miljø, udførte kontroller, afgrænsninger, pakkeversioner og SHA-256 af begge oprindelige lockfiler |
| [build.log](build.log) | Bestået Next.js-build med fiktiv Firebase-konfiguration |
| [lint.log](lint.log) | Projektets faktiske `npm run lint`: 10 fejl og 45 advarsler, inklusive designarkiv |
| [npm-audit-root.json](npm-audit-root.json) | npm-audit af hele hovedlockfilen |
| [npm-audit-production.json](npm-audit-production.json) | Samme audit med `--omit=dev`; jsPDF, Tone og OSMD står i devDependencies og er derfor ikke dækket som deres faktiske brug tilsiger |
| [npm-audit-functions.json](npm-audit-functions.json) | Audit af Functions-lockfilen |
| [npm-outdated-root.json](npm-outdated-root.json) | Datostemplede opdateringskandidater; ingen opdateringer udført |
| [npm-outdated-functions.json](npm-outdated-functions.json) | Opdateringskandidater for Functions; “current” mangler, fordi Functions-node_modules ikke blev installeret. Låst version findes i checks.json |
| [handler-probes.json](handler-probes.json) | Resultater fra direkte lokale kald til appens faktiske route handlers uden auth og AI-nøgler |
| [browser-observations.log](browser-observations.log) | Gæste-Home, teknikspor, øvelsespopup og mobil-landing; alle eksterne browserrequests var blokeret |
| [desktop-home.png](desktop-home.png) | Frisk desktop-gæst. Animationer afsluttet ved screenshot; eksterne webfonte var blokeret |
| [desktop-program.png](desktop-program.png) | Tekniksporet Enkeltslag som gæst |
| [mobile-landing.png](mobile-landing.png) | Landing ved 390×844 |

Handlerproberne viser blandt andet anonym lagring/overskrivning, accept af ugyldige planparametre, coachfejl ved forkert datatype og opdigtet lydanalyse. Alle filskrivninger skete i den midlertidige kopi. Resultaterne dokumenterer kodeadfærd, ikke produktionsmiljøets faktiske eksponering.

Browserloggen har `DONE_BUTTON_COUNT 0`, fordi den første test forventede en anden knaptekst. Den viser derfor ikke en gennemført completion-test. Testen blev efterfølgende tilpasset, men kørslen af completion og coach-kontekst/historik blev afvist af automatisk godkendelseskontrol på grund af en forbrugsgrænse. Rapportens fund om disse handlinger bygger på kodegennemgang. Login, rigtige AI-kald, videoindhold og lydkvalitet på fysiske enheder er heller ikke browserverificeret.

npm-audit-resultater er observationer fra denne dato og kan ændre sig. De indeholder både advisories og afledte pakkeposter. Deres severity er ikke automatisk appens konkrete exploitability; anvendelighed og opdateringsvej diskuteres i hovedrapporten.
