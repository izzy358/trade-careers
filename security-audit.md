# Trade Careers Security Audit (2026-02-25)

## Scope
- `src/app/api/jobs/route.ts`
- `src/app/api/jobs/[slug]/route.ts`
- `src/app/api/jobs/[slug]/apply/route.ts`
- `src/app/api/installers/route.ts`
- `src/app/api/installers/[slug]/route.ts`
- `src/app/api/geocode/route.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/test/route.ts`

## Findings and Changes
1. Input validation and sanitization
- Added strict request validation with `zod` for POST/PUT endpoints.
- Added shared sanitization helpers for search terms and free text.
- Added safe integer parsing with limits for pagination and filters.

2. Sensitive data exposure
- Removed `select('*')` usage from public API responses.
- Added explicit public column selection to avoid exposing `manage_token` and other sensitive/internal fields.
- Reduced `/api/test` response to minimal health output without environment details or stack traces.

3. Rate limiting
- Added lightweight request throttling with per-route policies and standard headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `X-RateLimit-Policy`
  - `Retry-After` (when limited)
- Applied limits to read-heavy and write-heavy routes with stricter thresholds on mutation endpoints.

4. Error handling
- Replaced raw database error strings in API responses with user-safe, generic messages.
- Kept detailed errors in server logs only.

5. Supabase query safety
- Supabase SDK calls are parameterized by design.
- Dynamic filters are sanitized before being interpolated into `.or()` / `.ilike()` filter expressions.

6. RLS policy review
- Added `supabase/migrations/007_security_rls_hardening.sql` to ensure public create flows match app behavior:
  - Public can create jobs.
  - Public can submit job applications.
- Existing public read policies for jobs/installers remain in place.

## Residual Notes
- In-memory rate limiting is best-effort for single runtime instances; move to distributed storage (Redis/KV) for production-grade enforcement across instances.
- Consider replacing token-based anonymous update/delete flows with authenticated ownership for stronger access control.
