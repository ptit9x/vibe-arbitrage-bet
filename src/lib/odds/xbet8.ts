// 8xBet Odds Scraper
// Uses Playwright to bypass Cloudflare and extract odds from 8xBet's internal API
// Requirements: npx playwright install chromium

import { MarketOdds, OddsData, Match } from "../arbitrage/types";

// 8xBet API base URL (changes periodically - may need update)
const API_BASE = "gw-nwapi-cf.8xdfd3t6f.com";
const SITE_ORIGIN = "https://8xbet1.com";

// Sport ID mapping (8xBet internal IDs)
const SPORT_IDS: Record<string, number> = {
  soccer: 1,
  basketball: 2,
  tennis: 3,
  baseball: 4,
  hockey: 5,
  mma: 7,
  cricket: 8,
  rugby: 9,
};

interface XbetEvent {
  id: number;
  tournamentName?: string;
  homeTeamName: string;
  awayTeamName: string;
  startTime: number;
  sportId: number;
  markets: XbetMarket[];
}

interface XbetMarket {
  marketId: number;
  marketName: string;
  outcomes: XbetOutcome[];
}

interface XbetOutcome {
  outcomeId: number;
  outcomeName: string;
  odds: number; // Decimal odds
  handicap?: number;
  line?: number;
}

/**
 * Fetch odds from 8xBet using direct API call (server-side)
 * Note: May be blocked by Cloudflare - use fetchWithBrowser() as fallback
 */
export async function fetch8xbetOdds(
  sportId: number = 1, // soccer default
  language: string = "en-us"
): Promise<XbetEvent[]> {
  const url = `https://${API_BASE}/product/business/v2/sport/index/menu`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
      Accept: "application/json, text/plain, */*",
      Origin: SITE_ORIGIN,
      Referer: `${SITE_ORIGIN}/sportEvents`,
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`8xBet API error: ${res.status}`);
  }

  const data = await res.json();
  return parseXbetEvents(data, sportId);
}

/**
 * Fetch odds via Playwright browser (bypasses Cloudflare)
 * This is the reliable method but requires a running browser
 */
export async function fetch8xbetOddsBrowser(options?: {
  chromiumPath?: string;
  headless?: boolean;
}): Promise<{ events: XbetEvent[]; raw: unknown }> {
  // Playwright must be installed separately: npm install playwright && npx playwright install chromium
  // This function is intentionally not imported by default to avoid build errors
  // Use: import { fetch8xbetOddsBrowser } from "@/lib/odds/xbet8-browser"
  throw new Error(
    "Playwright not bundled. Use /api/odds/xbet8-browser route or install playwright manually."
  );
}

function extractEventsFromResponses(
  responses: Map<string, unknown>
): XbetEvent[] {
  const events: XbetEvent[] = [];

  for (const [url, data] of responses) {
    if (url.includes("/sport/index/menu") || url.includes("/popular/card")) {
      const parsed = parseXbetMenuResponse(data);
      events.push(...parsed);
    }
  }

  return events;
}

function parseXbetMenuResponse(data: unknown): XbetEvent[] {
  // 8xBet menu response structure (approximate - needs real data to refine)
  const events: XbetEvent[] = [];

  if (typeof data !== "object" || data === null) return events;

  const obj = data as Record<string, unknown>;
  const items = Array.isArray(obj?.data) ? obj.data : [];

  for (const item of items) {
    if (typeof item !== "object" || item === null) continue;
    const i = item as Record<string, unknown>;

    // Navigate nested tournament/match structure
    const tournaments = Array.isArray(i?.tournaments)
      ? i.tournaments
      : Array.isArray(i?.tournamentList)
      ? i.tournamentList
      : [];

    for (const tour of tournaments) {
      if (typeof tour !== "object" || tour === null) continue;
      const t = tour as Record<string, unknown>;
      const matches = Array.isArray(t?.matches) ? t.matches : [];

      for (const match of matches) {
        if (typeof match !== "object" || match === null) continue;
        const m = match as Record<string, unknown>;
        events.push({
          id: (m.id as number) || 0,
          tournamentName: (t.name as string) || undefined,
          homeTeamName: (m.homeTeamName as string) || "Home",
          awayTeamName: (m.awayTeamName as string) || "Away",
          startTime: (m.startTime as number) || 0,
          sportId: (m.sportId as number) || 1,
          markets: parseXbetMarkets(m.markets || m.odds),
        });
      }
    }
  }

  return events;
}

function parseXbetMarkets(
  marketsData: unknown
): XbetMarket[] {
  if (!Array.isArray(marketsData)) return [];

  return marketsData.map((m: Record<string, unknown>) => ({
    marketId: (m.marketId as number) || 0,
    marketName: (m.marketName as string) || "",
    outcomes: Array.isArray(m.outcomes || m.odds)
      ? ((m.outcomes || m.odds) as Record<string, unknown>[]).map((o) => ({
          outcomeId: (o.outcomeId as number) || 0,
          outcomeName: (o.outcomeName as string) || "",
          odds: Number(o.odds || o.price || 0),
          handicap: o.handicap ? Number(o.handicap) : undefined,
          line: o.line ? Number(o.line) : undefined,
        }))
      : [],
  }));
}

function parseXbetEvents(
  data: unknown,
  sportId: number
): XbetEvent[] {
  return parseXbetMenuResponse(data).filter(
    (e) => e.sportId === sportId
  );
}

/**
 * Convert 8xBet events to our internal OddsData format
 */
export function normalizeXbetOdds(
  events: XbetEvent[],
  sportKey: string = "soccer"
): OddsData[] {
  return events.map((event) => {
    const match: Match = {
      id: `8xbet-${event.id}`,
      sport: sportKey as Match["sport"],
      commence_time: event.startTime
        ? new Date(event.startTime).toISOString()
        : new Date().toISOString(),
      home_team: event.homeTeamName,
      away_team: event.awayTeamName,
    };

    const h2h: MarketOdds[] = [];
    const totals: MarketOdds[] = [];
    const spreads: MarketOdds[] = [];

    for (const market of event.markets) {
      const mo: MarketOdds = {
        bookmaker: "8xbet",
        bookmaker_title: "8Xbet",
        last_update: new Date().toISOString(),
        outcomes: market.outcomes.map((o) => ({
          name: o.outcomeName,
          price: o.odds,
          point: o.handicap || o.line,
        })),
      };

      // Classify market type based on name/ID
      const name = market.marketName.toLowerCase();
      if (
        name.includes("over/under") ||
        name.includes("totals") ||
        name.includes("ou") ||
        market.marketId === 3
      ) {
        totals.push(mo);
      } else if (
        name.includes("handicap") ||
        name.includes("spread") ||
        name.includes("hdp") ||
        market.marketId === 2
      ) {
        spreads.push(mo);
      } else if (
        name.includes("1x2") ||
        name.includes("moneyline") ||
        name.includes("match result") ||
        market.marketId === 1
      ) {
        h2h.push(mo);
      }
    }

    return { match, markets: { h2h, spreads, totals } };
  });
}
