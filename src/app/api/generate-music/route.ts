import { NextResponse } from 'next/server';
import { generateMusicXML } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forventer: titel, kategori, sværhedsgrad, tempo, takter, fokus
    if (!body.titel || !body.kategori || !body.sværhedsgrad || !body.tempo || !body.takter) {
      return NextResponse.json(
        { error: "Manglende påkrævede parametre (titel, kategori, sværhedsgrad, tempo, takter)" },
        { status: 400 }
      );
    }

    const xml = await generateMusicXML({
      titel: body.titel,
      kategori: body.kategori,
      sværhedsgrad: body.sværhedsgrad,
      tempo: Number(body.tempo),
      takter: Number(body.takter),
      fokus: body.fokus || "Generelt groove"
    });

    return NextResponse.json({ xml });
  } catch (e) {
    console.error("API Error in generate-music:", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Kunne ikke generere MusicXML: " + message },
      { status: 500 }
    );
  }
}
