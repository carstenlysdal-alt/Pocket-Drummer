import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiSecurity';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, { limit: 30, windowMs: 60000, prefix: 'save-not' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetSeconds);
    }

    const { filename, xml } = await req.json();

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Manglende filnavn.' }, { status: 400 });
    }
    if (!xml || typeof xml !== 'string') {
      return NextResponse.json({ error: 'Manglende XML-indhold.' }, { status: 400 });
    }

    // Sanitér filnavn — kun bogstaver, tal, bindestreg og underscore
    const safe = filename.replace(/[^a-zA-Z0-9æøåÆØÅ\-_]/g, '-').replace(/-+/g, '-').toLowerCase();
    const filepath = path.join(process.cwd(), 'public', 'content', 'notation', `${safe}.xml`);

    fs.writeFileSync(filepath, xml, 'utf-8');

    return NextResponse.json({ saved: `${safe}.xml` });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
