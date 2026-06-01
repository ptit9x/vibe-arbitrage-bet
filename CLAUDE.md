# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project-specific rules

- This project uses Next.js 16. Before changing Next.js app/router/server APIs, read the relevant guide in `node_modules/next/dist/docs/`; APIs and conventions may differ from older Next.js versions.

## Commands

- `npm install` — install dependencies.
- `npm run dev` — start the Next.js development server.
- `npm run build` — create a production build.
- `npm run start` — run the production server after a build.
- `npm run lint` — run ESLint.

There is no test script configured in `package.json` yet. If tests are added later, document the full-suite and single-test commands here.

Optional 8xBet browser scraping support requires Playwright outside the default dependency set:

```bash
npm i playwright
npx playwright install chromium
```

## Environment

Required for authenticated flows and server-side Supabase helpers:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Required for the scanner API to fetch primary odds:

- `ODDS_API_KEY`

Optional AI provider variables used by `src/lib/ai/provider.ts`:

- GLM/z.ai: `GLM_API_KEY` or `ZAI_API_KEY`; optional `GLM_MODEL`, `GLM_BASE_URL`
- Minimax: `MINIMAX_API_KEY`; optional `MINIMAX_MODEL`, `MINIMAX_BASE_URL`

## Architecture overview

This is a Next.js App Router application for sports arbitrage betting. The main user-facing flows are the public landing/auth pages, an authenticated app shell, a scanner that calls `/api/odds`, and a manual calculator.

- `src/app/` contains App Router pages and route handlers. Public pages include `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/calculator`. Authenticated pages such as `/dashboard`, `/scanner`, `/guide`, `/profile`, and `/change-password` are protected by middleware.
- `src/components/app-shell.tsx` wraps non-public routes with the header/sidebar navigation and language toggle. `src/app/layout.tsx` installs the global `I18nProvider`, `AppShell`, fonts, global CSS, and Vercel Speed Insights.
- `src/middleware.ts` delegates to `src/lib/supabase/middleware.ts`, which refreshes Supabase sessions, redirects logged-in users away from auth pages, and redirects unauthenticated users from protected pages to `/login`. API routes are treated as public by this middleware.
- Supabase helpers live in `src/lib/supabase/`: `client.ts` for browser clients, `server.ts` for server components/actions with cookie integration, and `middleware.ts` for session refresh.
- Internationalization is client-side and lives in `src/lib/i18n/`. `I18nProvider` stores the selected locale in localStorage plus a cookie; translations are in `translations.ts`.

## Odds and arbitrage flow

- `src/app/api/odds/route.ts` is the scanner backend. It reads query params such as `sports`, `min_profit`, `total_stake`, `include_8xbet`, and `force`, fetches odds, caches raw odds, scans for arbitrage, and returns both `opportunities` and `all_totals`.
- `src/lib/odds/theoddsapi.ts` fetches TheOddsAPI data and normalizes it into the internal `OddsData` shape.
- `src/lib/odds/xbet8.ts` contains the direct 8xBet API scraper/normalizer. The browser fallback is intentionally not bundled and throws unless implemented separately with Playwright.
- `src/lib/arbitrage/types.ts` defines the internal domain model: sports, markets, odds, matches, opportunities, and totals-line rows.
- `src/lib/arbitrage/calculator.ts` is the core engine. It calculates implied probabilities, Dutching stakes, best odds per outcome, duplicate-match merging across sources, totals/spreads deduplication, sorted arbitrage opportunities, and the scanner's all-totals listing.
- `src/lib/cache.ts` provides singleton in-memory TTL caches. `oddsCache` defaults to 60s and `analysisCache` defaults to 30s. These reset on server restart or serverless cold start.

## UI conventions

- Styling uses Tailwind CSS v4 classes and shadcn-style primitives in `src/components/ui/`.
- Path alias `@/*` maps to `src/*` via `tsconfig.json`.
- The scanner UI is a client component in `src/app/scanner/page.tsx`; it checks browser auth, calls `/api/odds`, supports auto-refresh every 60s, and renders surebets first from `all_totals`.
