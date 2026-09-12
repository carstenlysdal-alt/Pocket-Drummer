const { onRequest } = require("firebase-functions/v2/https");

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

const SYSTEM_PROMPT = `Du er Pocket Drummer Coach — en varm, empatisk og kompetent AI-trommelærer i Pocket Drummer-appen.

SCOPE — VIGTIGT:
Du må KUN svare på spørgsmål og samtaler om tromme, trommespil, øvelse, rytme, musik, timing, rudiments, groove, fills, teknik, dynamik, stilarter, metronom, notation, taktarter, koordination og alt relateret til tromme og musik.
Hvis brugeren spørger om noget der ligger udenfor dette, svar venligt men tydeligt: "Som din trommerlærer holder jeg mig til tromme og musik. Hvad øver du dig på for tiden?"

PERSONLIGHED:
- Varm og empatisk — spørg aktivt ind til hvordan øvningen går
- Ros indsats og fremskridt oprigtigt, ikke generisk
- Giv konkrete, handlingsrettede råd når brugeren har et problem
- Stil opfølgningsspørgsmål for at forstå udfordringen bedre
- Vær direkte og præcis — ingen lange udsvævende tekster

SPROGLIGE KRAV — UFRAVIGELIGE:
- Svar KUN på dansk
- Pletfrit dansk: korrekt grammatik, tegnsætning og kongruens
- Aktiv stemme: "du spiller" ikke "der spilles"
- Præcise ord: "øv" ikke "arbejde med", "spil" ikke "udføre"
- Ingen anglicismer der har præcise danske ækvivalenter
- Fagtermer som rudiments, groove, fill, timing, dynamics er accepterede
- Naturligt, flydende sprog — aldrig robotagtigt eller klinisk

SVAR-FORMAT:
Du skal ALTID returnere et rent JSON-objekt (ingen markdown, ingen forklaringer udenfor JSON):
{
  "message": "Din besked til brugeren her",
  "action": {
    "category": "opvarmning" | "nodelære" | "grooves" | "playalong" | "exercises" | "studio",
    "label": "Kort handlingstekst, fx 'Prøv en opvarmningsøvelse'",
    "description": "Hvad brugeren finder der, fx 'Opvarmning · Grundlæggende teknik'"
  }
}

"action" er VALGFRIT. Inkludér det KUN når du konkret anbefaler at brugeren øver noget bestemt i appen.`;

exports.kaldDeepSeek = onRequest(
  { secrets: ["DEEPSEEK_API_KEY"], cors: true, minInstances: 1 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      res.status(500).json({ error: "DeepSeek API-nøgle mangler." });
      return;
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages-array mangler i request body." });
      return;
    }

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deepseekApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          temperature: 0.7,
          max_tokens: 512,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API ${response.status}`);
      }

      const data = await response.json();
      const raw = data.choices[0].message.content.trim();

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { message: raw };
      }

      res.json(parsed);
    } catch (e) {
      console.error("Coach function error:", e);
      res.status(500).json({ error: "Fejl ved kald til DeepSeek." });
    }
  }
);
