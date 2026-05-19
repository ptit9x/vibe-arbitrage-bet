import { NextRequest, NextResponse } from "next/server";
import { fetchMultiSportOdds, normalizeOddsResponse } from "@/lib/odds/theoddsapi";
import { scanAllMatches } from "@/lib/arbitrage";
import { MarketType } from "@/lib/arbitrage/types";

const API_KEY = process.env.ODDS_API_KEY || "";

// Default sports to scan
const DEFAULT_SPORTS = [
  "soccer_epl",
  "soccer_champions_league_eu",
  "soccer_la_liga",
  "basketball_nba",
  "tennis_atp_wimbledon",
];

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "ODDS_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = request.nextUrl;
  const sports = searchParams.get("sports")?.split(",") || DEFAULT_SPORTS;
  const markets = (searchParams.get("markets")?.split(",") || ["h2h", "totals"]) as MarketType[];
  const minProfit = parseFloat(searchParams.get("min_profit") || "0.5");
  const totalStake = parseInt(searchParams.get("total_stake") || "1000000");

  try {
    // Fetch odds from TheOddsAPI
    const rawOdds = await fetchMultiSportOdds(API_KEY, sports, markets);

    // Normalize to our format
    const normalized = normalizeOddsResponse(rawOdds);

    // Scan for arbitrage opportunities
    const opportunities = scanAllMatches(normalized, minProfit, totalStake);

    return NextResponse.json({
      success: true,
      scanned_matches: normalized.length,
      opportunities_found: opportunities.length,
      opportunities,
      scanned_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Odds scan error:", error);
    return NextResponse.json(
      { error: "Failed to fetch odds", details: String(error) },
      { status: 500 }
    );
  }
}
