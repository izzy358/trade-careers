import { NextRequest } from 'next/server';

type RateLimitOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitState>();

export function sanitizeSearchTerm(value: string, maxLength = 80) {
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/[^a-zA-Z0-9\s\-.'&]/g, '');
}

export function sanitizePlainText(value: string, maxLength = 2000) {
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/\u0000/g, '');
}

export function parseNumberInRange(value: string | null, min: number, max: number, fallback: number) {
  const parsed = Number.parseInt(value || '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function getClientIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

export function checkRateLimit(request: NextRequest, options: RateLimitOptions) {
  const now = Date.now();
  const identifier = `${options.key}:${getClientIdentifier(request)}`;
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + options.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });

    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': String(options.maxRequests),
        'X-RateLimit-Remaining': String(options.maxRequests - 1),
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
        'X-RateLimit-Policy': `${options.maxRequests};w=${Math.floor(options.windowMs / 1000)}`,
      },
    };
  }

  existing.count += 1;
  rateLimitStore.set(identifier, existing);
  const remaining = Math.max(options.maxRequests - existing.count, 0);

  return {
    allowed: existing.count <= options.maxRequests,
    headers: {
      'X-RateLimit-Limit': String(options.maxRequests),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(existing.resetAt / 1000)),
      'X-RateLimit-Policy': `${options.maxRequests};w=${Math.floor(options.windowMs / 1000)}`,
      ...(existing.count > options.maxRequests
        ? { 'Retry-After': String(Math.max(Math.ceil((existing.resetAt - now) / 1000), 1)) }
        : {}),
    },
  };
}
