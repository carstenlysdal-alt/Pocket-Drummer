import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Rens periodisk forældede poster for at forhindre memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  prefix?: string;
}

export function checkRateLimit(req: NextRequest, options: RateLimitOptions): {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
} {
  const ip = getClientIp(req);
  const prefix = options.prefix || 'global';
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (record.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: options.limit - record.count,
    resetSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(resetSeconds: number): NextResponse {
  return NextResponse.json(
    { error: `For mange anmodninger. Prøv igen om ${resetSeconds} sekunder.` },
    {
      status: 429,
      headers: {
        'Retry-After': String(resetSeconds),
      },
    }
  );
}
