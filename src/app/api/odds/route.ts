import { NextRequest, NextResponse } from "next/server";
import { fetchMultiSportOdds, normalizeOddsResponse } from "@/lib/odds/theoddsapi";
import { normalizeXbetOdds } from "@/lib/odds/xbet8";
import { scanAllMatches } from "@/lib/arbitrage";
import { MarketType, OddsData } from "@/lib/arbitrage/types";

const ODDS_API_KEY = process.env.ODDS_API_KEY || "";

const DEFAULT_SPORTS = [
  "soccer_epl",
  "soccer_champions_league_eu",
  "soccer_la_liga",
  "basketball_nba",
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sports = searchParams.get("sports")?.split(",") || DEFAULT_SPORTS;
  const markets = (searchParams.get("markets")?.split(",") || [
    "h2h",
    "totals",
  ]) as MarketType[];
  const minProfit = parseFloat(searchParams.get("min_profit") || "0.5");
  const totalStake = parseInt(searchParams.get("total_stake") || "1000000");
  const include8xbet = searchParams.get("include_8xbet") === "true";

  const allOdds: OddsData[] = [];
  const errors: string[] = [];

  // 1. Fetch from TheOddsAPI (has 1xBet + 50+ others)
  if (ODDS_API_KEY) {
    try {
      const rawOdds = await fetchMultiSportOdds(ODDS_API_KEY, sports, markets);
      const normalized = normalizeOddsResponse(rawOdds);
      allOdds.push(...normalized);
    } catch (err) {
      errors.push(`TheOddsAPI: ${String(err)}`);
    }
  } else {
    errors.push("ODDS_API_KEY not configured");
  }

  // 2. Fetch from 8xBet (if requested)
  if (include8xbet) {
    try {
      const { fetch8xbetOdds, normalizeXbetOdds: normalize8x } = await import(
        "@/lib/odds/xbet8"
      );
      const xbetEvents = await fetch8xbetOdds(1); // soccer
      const normalized = normalize8x(xbetEvents, "soccer");
      allOdds.push(...normalized);
    } catch (err) {
      errors.push(`8xBet: ${String(err)}`);
    }
  }

  // 3. Scan for arbitrage
  const opportunities = scanAllMatches(allOdds, minProfit, totalStake);

  return NextResponse.json({
    success: true,
    sources: {
      theoddsapi: ODDS_API_KEY ? "active" : "no_api_key",
      xbet8: include8xbet ? "attempted" : "skipped",
    },
    scanned_matches: allOdds.length,
    opportunities_found: opportunities.length,
    opportunities,
    errors: errors.length > 0 ? errors : undefined,
    scanned_at: new Date().toISOString(),
  });
}
