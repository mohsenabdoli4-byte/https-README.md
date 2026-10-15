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

## Quirks
- Postgres credentials are local dev values generated for the sandbox; they are not secrets.
- Sandbox-only overrides (Vite `allowedHosts`, HMR client port) are gated on `BASE44_PREVIEW_MODE === '1'`
  and are no-ops when the flag is unset.
- Payment runs in **test mode**: orders are stored `unpaid` and no card data is collected. Connecting a
  provider (Stripe / Wix Payments) is required before real payments can be taken.
