# Localfluence

A two-sided marketplace web app connecting local businesses with city-based influencers (food, fitness, fashion, beauty, etc.). Businesses post campaigns and discover creators by location/category/followers; influencers accept or reject collaboration requests; both sides chat in 1:1 messages.

## Stack
- **Web**: React + Vite + Wouter + TanStack Query v5 + Tailwind v4 + shadcn/ui + framer-motion
- **API**: Express 5 (TypeScript, esbuild bundle)
- **DB**: PostgreSQL via Drizzle ORM (`pnpm --filter @workspace/db run push`)
- **Auth**: JWT (HS256) signed with `SESSION_SECRET`. Token persisted to `localStorage["lf_token"]` and sent as `Authorization: Bearer`.
- **Codegen**: OpenAPI (`lib/api-spec/openapi.yaml`) → Orval → typed React Query hooks in `@workspace/api-client-react`. Re-run with `pnpm --filter @workspace/api-spec run codegen`.

## Artifacts
- `artifacts/localfluence` — web app, preview path `/`
- `artifacts/api-server` — Express API mounted under `/api`
- `artifacts/mockup-sandbox` — design sandbox

## Roles
- `business` — creates campaigns, sends collaboration requests, marks accepted requests complete
- `influencer` — has a public profile (city, area, category, followers, social links), accepts/rejects pending requests

## Seed data
Run `pnpm --filter @workspace/scripts run seed`. Test logins (password `password123`):
- Business: `hello@golden-bean.com`
- Influencer: `maya@local.test`

## Key files
- `lib/api-spec/openapi.yaml` — API contract
- `lib/db/src/schema/` — Drizzle tables (`users`, `profiles`, `campaigns`, `requests`, `messages`)
- `artifacts/api-server/src/lib/auth.ts` — JWT helpers + `tryAuth` / `requireAuth` / `requireRole` middlewares
- `artifacts/api-server/src/routes/` — auth, profiles, influencers, campaigns, requests, messages, dashboard
- `artifacts/localfluence/src/hooks/useAuth.tsx` — auth context (must stay `.tsx` since it returns JSX)
- `lib/api-client-react/src/custom-fetch.ts` — wired to read `lf_token`, prefix `/api`, redirect to `/login` on 401
