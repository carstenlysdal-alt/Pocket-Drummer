import { NextRequest, NextResponse } from 'next/server';
import { generateLearningPlan } from '@/lib/ai';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiSecurity';

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, prefix: 'gen-plan' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetSeconds);
    }

    const body = await request.json();
    
    // Forventer: maal, niveau, tidPrDag, tidshorisont
    if (!body.niveau || !body.tidPrDag || !body.tidshorisont) {
      return NextResponse.json(
        { error: "Manglende påkrævede parametre (niveau, tidPrDag, tidshorisont)" },
        { status: 400 }
      );
    }

    const plan = await generateLearningPlan({
      maal: body.maal || "Generel forbedring",
      niveau: body.niveau,
      tidPrDag: Number(body.tidPrDag),
      tidshorisont: body.tidshorisont
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
