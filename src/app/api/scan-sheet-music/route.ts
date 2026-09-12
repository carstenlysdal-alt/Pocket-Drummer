import { NextRequest, NextResponse } from 'next/server';
import { scanSheetMusic } from '@/lib/gemini';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiSecurity';

export const maxDuration = 120;

const MAX_SCAN_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, { limit: 10, windowMs: 60000, prefix: 'scan-omr' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetSeconds);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const systemPrompt = formData.get('systemPrompt') as string | null;

    if (!file) {
      return NextResponse.json({ error: "Ingen fil modtaget i anmodningen." }, { status: 400 });
    }

    if (file.size > MAX_SCAN_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Filen er for stor til hurtig OMR-scanning. Brug en fil under 10 MB eller beskær/komprimér nodearket." },
        { status: 413 }
      );
    }

    const mimeType = file.type || 'image/jpeg';
    
    // Convert browser file to base64 buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Run the OMR processing via Gemini
    const xml = await scanSheetMusic({ 
      base64Data, 
      mimeType, 
      systemPrompt: systemPrompt || undefined 
    });

    return NextResponse.json({ xml });
  } catch (error) {
    console.error("Fejl i /api/scan-sheet-music:", error);
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("Gemini API timeout")) {
      return NextResponse.json(
        {
          error: "Gemini OMR nåede ikke at transskribere nodearket. Der er ikke gemt eller vist nogen fallback-node, fordi den ville være upræcis. Prøv et skarpere/beskåret billede, én side ad gangen, eller importer en MusicXML-fil direkte."
        },
        { status: 504 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
