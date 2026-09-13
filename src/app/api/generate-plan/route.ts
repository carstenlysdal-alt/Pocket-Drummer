import { NextRequest, NextResponse } from 'next/server';
import { generateLearningPlan } from '@/lib/ai';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiSecurity';

const ALLOWED_NIVEAU = new Set(['begynder', 'mellemniveau', 'øvet']);

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, prefix: 'gen-plan' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetSeconds);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Ugyldig request body." }, { status: 400 });
    }

    const { niveau, tidPrDag, tidshorisont, maal } = body as {
      niveau?: unknown;
      tidPrDag?: unknown;
      tidshorisont?: unknown;
      maal?: unknown;
    };
    
    // Runtime validation (F14)
    if (typeof niveau !== 'string' || !ALLOWED_NIVEAU.has(niveau)) {
      return NextResponse.json(
        { error: "Ugyldigt niveau. Tilladte værdier er: 'begynder', 'mellemniveau', 'øvet'." },
        { status: 400 }
      );
    }

    const parsedTidPrDag = Number(tidPrDag);
    if (isNaN(parsedTidPrDag) || parsedTidPrDag < 5 || parsedTidPrDag > 180) {
      return NextResponse.json(
        { error: "Ugyldig daglig øvetid. Angiv et tal mellem 5 og 180 minutter." },
        { status: 400 }
      );
    }

    if (typeof tidshorisont !== 'string' || tidshorisont.trim().length === 0 || tidshorisont.length > 50) {
      return NextResponse.json(
        { error: "Ugyldig tidshorisont. Angiv en gyldig tekststreng (maks. 50 tegn)." },
        { status: 400 }
      );
    }

    const cleanMaal = typeof maal === 'string' && maal.trim().length > 0
      ? maal.slice(0, 200).trim()
      : "Generel forbedring af teknik og timing";

    const plan = await generateLearningPlan({
      maal: cleanMaal,
      niveau: niveau as 'begynder' | 'mellemniveau' | 'øvet',
      tidPrDag: parsedTidPrDag,
      tidshorisont: tidshorisont.trim(),
    });

    return NextResponse.json(plan);
  } catch (e) {
    console.error("API Error in generate-plan:", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Kunne ikke generere læringsplan: " + message },
      { status: 500 }
    );
  }
}
