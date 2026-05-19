# ⚡ Arbitrage Bet

Sports arbitrage betting scanner — find guaranteed profit opportunities by comparing odds across multiple bookmakers.

**Live:** [vibe-arbitrage-bet.vercel.app](https://vibe-arbitrage-bet.vercel.app)

## What is Surebet / Arbitrage?

Arbitrage betting exploits odds differences between bookmakers. When the total implied probability across all outcomes is **less than 100%**, you can bet on every outcome and guarantee a profit regardless of the result.

**Example:**
| Bookmaker | Over 2.5 | Under 2.5 |
|-----------|----------|-----------|
| 1xBet     | **2.10** | 1.75      |
| 8xBet     | 1.85     | **2.05**  |

→ Bet Over at 1xBet + Under at 8xBet → **~3.7% guaranteed profit**

## Features

- 🔍 **Surebet Scanner** — Realtime scan across 50+ bookmakers
- 🧮 **Calculator** — Manual 2-way / 3-way arbitrage calculator
- 📊 **Multi-source odds** — TheOddsAPI (1xBet, Pinnacle, etc.) + 8xBet scraper
- 🔐 **Auth** — Login, Register, Password Reset, Profile management
- 🌙 **Dark theme** — Clean, mobile-first UI

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth & Database:** Supabase
- **UI:** shadcn/ui + Tailwind CSS v4 + Lucide Icons
- **Language:** TypeScript
- **Odds Sources:**
  - [TheOddsAPI](https://the-odds-api.com) — 50+ bookmakers (1xBet, Pinnacle, Betfair, DraftKings...)
  - [8xBet](https://8xbet.com) — Custom scraper with Cloudflare bypass

## Odds Sources

### TheOddsAPI (Primary)
- Free tier: 500 requests/month
- 50+ bookmakers across US, UK, EU, AU regions
- Includes: 1xBet, Pinnacle, Betfair, Betway, DraftKings, FanDuel, William Hill...
- Markets: h2h (1X2), spreads (handicap), totals (over/under)

### 8xBet (Asian bookmaker)
- Custom scraper with Playwright browser fallback
- Requires: `npm i playwright && npx playwright install chromium`
- Enable via checkbox in Scanner UI

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home dashboard
│   ├── scanner/              # Surebet scanner (realtime)
│   ├── calculator/           # Manual arbitrage calculator
│   ├── api/odds/             # Odds fetch API route
│   ├── login/                # Sign in
│   ├── register/             # Sign up
│   ├── forgot-password/      # Request reset link
│   ├── reset-password/       # Set new password
│   ├── change-password/      # Change password
│   └── profile/              # User profile
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── logout-button.tsx
├── lib/
│   ├── arbitrage/            # Core engine
│   │   ├── types.ts          # Type definitions
│   │   ├── calculator.ts     # Implied prob, surebet detection, Dutching stakes
│   │   └── index.ts          # Exports
│   ├── odds/                 # Odds providers
│   │   ├── theoddsapi.ts     # TheOddsAPI client
│   │   └── xbet8.ts          # 8xBet scraper
│   ├── supabase/             # Client, Server, Middleware
│   └── utils.ts
└── middleware.ts              # Auth middleware
```

## Getting Started

```bash
# Install dependencies
npm install

# (Optional) Install Playwright for 8xBet scraping
npm i playwright && npx playwright install chromium

# Set up environment variables
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# TheOddsAPI (required for scanner)
# Sign up free: https://the-odds-api.com
ODDS_API_KEY=your_odds_api_key
```

## API Endpoints

### `GET /api/odds`

Scan for arbitrage opportunities.

**Parameters:**
| Param        | Default | Description                          |
|--------------|---------|--------------------------------------|
| `sports`     | epl, ucl, la_liga, nba | Comma-separated sport keys |
| `markets`    | h2h, totals | Markets to scan (h2h, spreads, totals) |
| `min_profit` | 0.5     | Minimum profit percentage            |
| `total_stake`| 1000000 | Reference stake in VND               |
| `include_8xbet` | false | Enable 8xBet scraper              |

## How Arbitrage Detection Works

1. **Fetch odds** from multiple bookmakers for the same match
2. **Find best odds** for each outcome (Over/Under, Home/Draw/Away)
3. **Calculate implied probability**: `1 / odds`
4. **Sum probabilities**: if total < 1.0 → surebet exists
5. **Calculate stakes** using Dutching: `stake_i = (1/odds_i) / total_implied × bankroll`
6. **Guaranteed profit**: `profit = (1 / total_implied - 1) × 100%`

## Deploy

Deployed on [Vercel](https://vercel.com). Push to `main` to auto-deploy.

GitHub: [ptit9x/vibe-arbitrage-bet](https://github.com/ptit9x/vibe-arbitrage-bet)

## License

MIT
