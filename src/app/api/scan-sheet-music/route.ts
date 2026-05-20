import { NextRequest, NextResponse } from 'next/server';
import { scanSheetMusic } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const systemPrompt = formData.get('systemPrompt') as string | null;

    if (!file) {
      return NextResponse.json({ error: "Ingen fil modtaget i anmodningen." }, { status: 400 });
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
