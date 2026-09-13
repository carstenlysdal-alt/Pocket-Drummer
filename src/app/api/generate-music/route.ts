import { NextRequest, NextResponse } from 'next/server';
import { generateMusicXML } from '@/lib/ai';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiSecurity';
import { requireAdmin } from '@/lib/serverAuth';

const ALLOWED_LEVELS = new Set(['begynder', 'mellemniveau', 'øvet']);

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, prefix: 'gen-music' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetSeconds);
    }

    const authResult = await requireAdmin(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Ugyldig request body." }, { status: 400 });
    }

    const { titel, kategori, sværhedsgrad, tempo, takter, fokus, systemPrompt } = body as {
      titel?: unknown;
      kategori?: unknown;
      sværhedsgrad?: unknown;
      tempo?: unknown;
      takter?: unknown;
      fokus?: unknown;
      systemPrompt?: unknown;
    };
    
    // Runtime validation (F14)
    if (typeof titel !== 'string' || titel.trim().length === 0 || titel.length > 100) {
      return NextResponse.json({ error: "Ugyldig eller manglende titel (maks. 100 tegn)." }, { status: 400 });
    }
    if (typeof kategori !== 'string' || kategori.trim().length === 0 || kategori.length > 50) {
      return NextResponse.json({ error: "Ugyldig eller manglende kategori." }, { status: 400 });
    }
    if (typeof sværhedsgrad !== 'string' || !ALLOWED_LEVELS.has(sværhedsgrad)) {
      return NextResponse.json({ error: "Ugyldig sværhedsgrad. Tilladte værdier er: begynder, mellemniveau, øvet." }, { status: 400 });
    }

    const parsedTempo = Number(tempo);
    if (isNaN(parsedTempo) || parsedTempo < 30 || parsedTempo > 300) {
      return NextResponse.json({ error: "Ugyldigt tempo. Skal være mellem 30 og 300 BPM." }, { status: 400 });
    }

    const parsedTakter = Number(takter);
    if (isNaN(parsedTakter) || parsedTakter < 1 || parsedTakter > 32) {
      return NextResponse.json({ error: "Ugyldigt taktantal. Skal være mellem 1 og 32 takter." }, { status: 400 });
    }

    const result = await generateMusicXML({
      titel: titel.trim(),
      kategori: kategori.trim(),
      sværhedsgrad: sværhedsgrad as 'begynder' | 'mellemniveau' | 'øvet',
      tempo: parsedTempo,
      takter: parsedTakter,
      fokus: typeof fokus === 'string' && fokus.trim().length > 0 ? fokus.slice(0, 100).trim() : "Generelt groove",
      systemPrompt: typeof systemPrompt === 'string' ? systemPrompt.slice(0, 1000) : undefined,
    });

    return NextResponse.json({ xml: result.xml, source: result.source });
  } catch (e) {
    console.error("API Error in generate-music:", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Kunne ikke generere MusicXML: " + message },
      { status: 500 }
    );
  }
}
