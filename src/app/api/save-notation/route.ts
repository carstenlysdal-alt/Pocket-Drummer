import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiSecurity';
import { requireAdmin } from '@/lib/serverAuth';
import { hasScorePartwise } from '@/lib/musicXml';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 1. Check rate limit
    const rateLimit = checkRateLimit(req, { limit: 30, windowMs: 60000, prefix: 'save-not' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetSeconds);
    }

    // 2. Authorize admin
    const authResult = await requireAdmin(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    // 3. Parse and validate payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Ugyldig request body.' }, { status: 400 });
    }

    const { filename, xml } = body as { filename?: unknown; xml?: unknown };

    if (!filename || typeof filename !== 'string' || filename.trim().length === 0) {
      return NextResponse.json({ error: 'Manglende eller ugyldigt filnavn.' }, { status: 400 });
    }
    if (!xml || typeof xml !== 'string' || xml.trim().length === 0) {
      return NextResponse.json({ error: 'Manglende XML-indhold.' }, { status: 400 });
    }

    if (!hasScorePartwise(xml)) {
      return NextResponse.json({ error: 'XML mangler gyldig <score-partwise> struktur.' }, { status: 400 });
    }

    // 4. Sanitize filename — kun bogstaver, tal, bindestreg og underscore
    const safe = filename.replace(/[^a-zA-Z0-9æøåÆØÅ\-_]/g, '-').replace(/-+/g, '-').toLowerCase();
    const dir = path.join(process.cwd(), 'public', 'content', 'notation');
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, `${safe}.xml`);
    fs.writeFileSync(filepath, xml, 'utf-8');

    return NextResponse.json({ saved: `${safe}.xml`, success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
