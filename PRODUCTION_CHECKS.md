# Production Hardening — To Do

## 1. Rate Limiting

Protect all API routes from abuse — especially auth, search, and write endpoints.

**Approach:** `@upstash/ratelimit` + Vercel KV (or in-memory for single-instance deploys)

- [ ] Add `@upstash/ratelimit` and `@upstash/redis` packages
- [ ] Create `lib/rate-limit.ts` — reusable `rateLimit()` helper
- [ ] Apply to:
  - `POST /api/auth/[...nextauth]` (login — 5 req/min per IP)
  - `GET /api/search` (search — 30 req/min per IP)
  - `POST /api/documents/upload` (uploads — 10 req/min per user)
  - `POST /api/attendance/*`, `POST /api/leave/requests`, etc. (writes — 20 req/min)
- [ ] Return `429 Too Many Requests` with `Retry-After` header

---

## 2. Brute-Force Protection

Prevent credential stuffing and password guessing.

- [ ] Track failed login attempts per email in Vercel KV (or DB `login_attempts` table)
- [ ] Lock account after 5 failed attempts for 15 minutes
- [ ] Implement progressive delay (linear backoff) on login endpoint
- [ ] Log failed attempts with IP and timestamp

---

## 3. CAPTCHA / Bot Detection

Block automated form submissions on public-facing forms.

- [ ] Add Cloudflare Turnstile (free, privacy-friendly) — `<script>` + widget on login page
- [ ] Verify token server-side in `authorize()` callback in `lib/auth.ts`
- [ ] Alternative: Google reCAPTCHA v3 (invisible, score-based)

---

## 4. CSRF Protection

While NextAuth uses `SameSite=Lax` cookies, write endpoints should still validate origin.

- [ ] Add middleware (`middleware.ts`) that:
  - Checks `Origin` / `Referer` header matches allowed origins on POST/PUT/DELETE
  - Rejects cross-origin writes with `403`
- [ ] Or generate CSRF token via NextAuth and validate on mutations

---

## 5. Database Connection Pooling

Neon free tier limits concurrent connections (~10). Without pooling, concurrent users exhaust connections.

- [ ] In Neon Console, enable **PgBouncer** (connection pooler)
- [ ] Update `DATABASE_URL` with `?pgbouncer=true&connection_limit=5`
- [ ] Set `connection_limit` in Prisma datasource block (already defaults to pool size)
- [ ] Add `@prisma/extension-accelerate` or use Prisma Pulse for edge caching (optional)

---

## 6. Cold-Start Mitigation

Serverless functions cool down after inactivity, causing 1–3s latency on first request.

- [ ] Enable Neon's **always-on** (0-scale prevention) in dashboard
- [ ] Or add a cron job (Vercel Cron Jobs or cron-job.org) hitting `/api/dashboard` every 5 minutes
- [ ] Or use Prisma Accelerate for persistent connection pool

---

## 7. Caching Layer

Reduce DB load and speed up repeated queries.

- [ ] Dashboard aggregate queries → SWR stale-while-revalidate or React `cache()`
- [ ] Employee list, department list → ISR with `revalidate: 60` or `export const dynamic = 'force-static'`
- [ ] Option: Vercel SWR (`stale-while-revalidate` header on API responses)
- [ ] Option: Redis-based caching with `@upstash/redis` for computed reports

---

## 8. File Upload — Cloud Storage

Current local-filesystem uploads (`public/uploads/`) are ephemeral on Vercel and don't scale.

- [ ] Replace local write in `app/api/documents/upload/route.ts` with S3-compatible storage:
  - AWS S3
  - Cloudflare R2 (S3 API, no egress fees)
  - Uploadthing (simpler API, built for Next.js)
- [ ] Add env vars: `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`, `STORAGE_ENDPOINT`
- [ ] Generate presigned URLs for downloads instead of public file access

---

## 9. Error & Logging

- [ ] Configure Sentry for error tracking (`@sentry/nextjs`)
- [ ] Add structured logging (pino or `console` with JSON) instead of bare `console.error`
- [ ] Ensure `NEXT_PUBLIC_*` env vars don't leak secrets

---

## 10. Security Headers

Add to `next.config.ts` or `middleware.ts`:

```
Strict-Transport-Security: max-age=63072000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
```

---

## Priority

| Priority | Item |
|----------|------|
| P0 | Rate limiting (login) + Database connection pooling |
| P0 | File uploads → cloud storage (breaks on redeploy) |
| P1 | Security headers + CSRF |
| P1 | CAPTCHA on login |
| P2 | Caching layer |
| P2 | Cold-start mitigation |
| P3 | Sentry + structured logging |
