import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const filename = formData.get('filename') as string | null;

    if (!file) return NextResponse.json({ error: 'Manglende fil.' }, { status: 400 });
    if (!filename || typeof filename !== 'string') return NextResponse.json({ error: 'Manglende filnavn.' }, { status: 400 });

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) return NextResponse.json({ error: `Filtype ikke understøttet: ${file.type}` }, { status: 400 });

    const safe = filename.replace(/[^a-zA-Z0-9æøåÆØÅ\-_]/g, '-').replace(/-+/g, '-').toLowerCase();
    const savedName = `${safe}${ext}`;
    const filepath = path.join(process.cwd(), 'public', 'content', 'notation', savedName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ saved: savedName });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
