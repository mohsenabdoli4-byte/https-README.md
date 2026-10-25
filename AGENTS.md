# Maison Fraise — project notes for agents

Premium patisserie e-commerce demo. React (Vite) storefront + Express/Postgres API.

## Layout
- `web/` — Vite + React 18 + React Router + Tailwind. Dev server on 5173, exposed on host port 3000.
- `server/` — Express + `pg`. API on 8000. Routes in `server/src/routes/`.
- `docker-compose.base44.yml` — sandbox runbook (db + migrate + api + web).

## Running it here
```
docker compose -f docker-compose.base44.yml up -d --build
```
- `migrate` applies `server/src/schema.sql` and seeds demo data, then exits. `api` waits for it (`service_completed_successfully`).
- Seed only runs when the `products` table is empty, so restarting does not duplicate data.
- The storefront talks to the API through Vite's `/api` proxy (single origin), so auth cookies work in the preview.

## Verifying it works
- `curl -s localhost:3000/api/health` → `{"ok":true,...}` (proxied through Vite).
- `curl -s localhost:3000/` → the storefront HTML.
- Sign in with the seeded accounts: `admin@maisonfraise.test` / `Maison123!` (admin) and
  `demo@maisonfraise.test` / `Demo123!` (customer).

## Localization (Persian / RTL)
- The storefront and the admin dashboard are Persian. `<html lang="fa" dir="rtl">` is set in
  `web/index.html`; the whole app inherits the direction from there.
- Typography is **Vazirmatn** (Google Fonts); every Tailwind font stack in `web/tailwind.config.js`
  leads with it, so Persian renders correctly while Latin brand text still falls back.
- Prices are stored as minor units in the database and displayed in **Toman with Persian digits** by
  `money()` in `web/src/lib/format.js`. `faNum()` converts numbers and `formatDate()` uses the Persian
  (Jalali) calendar. Calculation, tax and payment logic are unchanged — only the display format.
- Layout uses CSS logical properties (`ms-*`/`me-*`/`start-*`/`end-*`/`text-start`/`text-end`) and a
  `rtl:` Tailwind variant (e.g. `rtl:-scale-x-100`) to mirror directional arrows. The `.ltr` utility
  keeps emails, phone numbers and codes readable inside RTL text. Flex/grid mirror automatically.
- Seed content (`server/src/migrate.js`) and default settings (`server/src/settings.js`) are Persian.
  Seeding is gated by `SEED_VERSION`: bumping it re-syncs the demo categories, products, sample
  testimonials and settings once on the next `migrate` run, then leaves admin edits alone.

## Home hero — scroll-driven video (`web/src/components/ScrollHero.jsx`)
- The hero is a scroll-scrubbed clip: `scroll progress -> video.currentTime`. It is **never played**
  (no `play()`, no autoplay, no loop); an `onPlay` guard pauses it if anything ever tries.
- Layout: `<section class="hero-pin">` is 300vh tall (260vh ≤767px, see `.hero-pin` in
  `web/src/index.css`) with a `sticky top-0` child at `100vh`, so progress maps 0→first frame and
  1→last frame exactly.
- Perf contract: the passive scroll listener only stores a target progress; one `requestAnimationFrame`
  loop (started/stopped by an IntersectionObserver) eases it and writes `currentTime` only when the
  value moved by ≥ `SEEK_EPSILON`. Copy fade uses direct style writes — never React state — so
  scrolling does not re-render.
- `prefers-reduced-motion: reduce` or a failed load swaps in a static hero (video poster, or the
  configured hero image on error). Nothing is unmounted from the rest of the page.
- Media: `web/public/video/hero-desktop.mp4|webm` (864x480) and `hero-mobile.mp4` (640x360), picked in
  JS by `matchMedia('(max-width: 767px)')`. `hero-poster.jpg` is the first frame (poster + loading
  backdrop). Assets are git-tracked, ~11 MB total.
- The source clip had a **single keyframe**, which stutters badly when scrubbing. These encodes use a
  keyframe every 6 frames (0.25s), CRF 20/23, yuv420p, `+faststart`, no audio. Re-encode the same way
  if the clip is replaced, e.g.:
  `ffmpeg -i in.mp4 -an -c:v libx264 -crf 20 -preset slow -g 6 -keyint_min 6 -sc_threshold 0 -movflags +faststart out.mp4`
- Seeking needs HTTP range requests (`206 Partial Content`). The Vite dev server supports them; a
  production host/CDN must too, otherwise the whole file is downloaded before the first seek.

## Quirks
- Postgres credentials are local dev values generated for the sandbox; they are not secrets.
- Sandbox-only overrides (Vite `allowedHosts`, HMR client port) are gated on `BASE44_PREVIEW_MODE === '1'`
  and are no-ops when the flag is unset.
- Payment runs in **test mode**: orders are stored `unpaid` and no card data is collected. Connecting a
  provider (Stripe / Wix Payments) is required before real payments can be taken.
