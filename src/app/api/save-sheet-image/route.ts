import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiSecurity';
import { requireAdmin } from '@/lib/serverAuth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
};

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimit = checkRateLimit(req, { limit: 20, windowMs: 60000, prefix: 'save-img' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetSeconds);
    }

    // 2. Authorize admin
    const authResult = await requireAdmin(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const filename = formData.get('filename') as string | null;

    if (!file) return NextResponse.json({ error: 'Manglende fil.' }, { status: 400 });
    if (!filename || typeof filename !== 'string' || filename.trim().length === 0) {
      return NextResponse.json({ error: 'Manglende eller ugyldigt filnavn.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Filen er for stor (maks. 10 MB).' }, { status: 413 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) return NextResponse.json({ error: `Filtype ikke understøttet: ${file.type}` }, { status: 400 });

    const safe = filename.replace(/[^a-zA-Z0-9æøåÆØÅ\-_]/g, '-').replace(/-+/g, '-').toLowerCase();
    const savedName = `${safe}${ext}`;
    const dir = path.join(process.cwd(), 'public', 'content', 'notation');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, savedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ saved: savedName, success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
