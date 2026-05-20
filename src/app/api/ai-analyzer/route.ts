import { NextRequest, NextResponse } from "next/server";
import { fetchMultiSportOdds, normalizeOddsResponse } from "@/lib/odds/theoddsapi";
import { MarketType, OddsData } from "@/lib/arbitrage/types";
import { oddsCache, analysisCache } from "@/lib/cache";

const ODDS_API_KEY = process.env.ODDS_API_KEY || "";

const DEFAULT_SPORTS = [
  "soccer_epl",
  "soccer_champions_league_eu",
  "soccer_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_europa_league",
  "basketball_nba",
  "basketball_euroleague",
  "tennis_atp_wimbledon",
  "tennis_wta_wimbledon",
];

// Cache TTLs
const ODDS_TTL = 60_000; // Raw odds: 60s (fast-changing)
const AI_TTL = 300_000; // AI insights: 5 min (expensive, relatively stable)

export interface OUAnalysis {
  match: {
    id: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    commenceTime: string;
  };
  line: number;
  bookmakerOdds: {
    bookmaker: string;
    bookmakerTitle: string;
    overOdds: number;
    underOdds: number;
    lastUpdate: string;
  }[];
  discrepancy: {
    maxOverOdds: { value: number; bookmaker: string };
    maxUnderOdds: { value: number; bookmaker: string };
    spread: number;
    impliedProbSum: number;
    arbitrageProfit?: number;
    isArbitrage: boolean;
  };
  aiInsight?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sports = searchParams.get("sports")?.split(",") || DEFAULT_SPORTS;
  const minDiscrepancy = parseFloat(searchParams.get("min_discrepancy") || "0");
  const includeAi = searchParams.get("include_ai") === "true";
  const forceRefresh = searchParams.get("force") === "true";

  if (!ODDS_API_KEY) {
    return NextResponse.json(
      { success: false, error: "ODDS_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Build cache key from params
  const sportsKey = sports.sort().join(",");
  const oddsCacheKey = `odds:totals:${sportsKey}`;

  // Fetch odds (cached for 60s)
  const allOdds: OddsData[] = [];
  const errors: string[] = [];

  if (forceRefresh) {
    oddsCache.delete(oddsCacheKey);
  }

  try {
    const normalized = await oddsCache.getOrFetch(
      oddsCacheKey,
      async () => {
        const rawOdds = await fetchMultiSportOdds(
          ODDS_API_KEY,
          sports,
          ["totals"] as MarketType[]
        );
        return normalizeOddsResponse(rawOdds);
      },
      ODDS_TTL
    );
    allOdds.push(...normalized);
  } catch (err) {
    errors.push(`TheOddsAPI: ${String(err)}`);
  }

  // Build analysis cache key
  const analysisCacheKey = `analysis:${sportsKey}:${minDiscrepancy}`;

  // Check if we have cached analysis (and odds haven't expired)
  let analyses: OUAnalysis[];

  if (!forceRefresh && analysisCache.has(analysisCacheKey)) {
    analyses = analysisCache.get<OUAnalysis[]>(analysisCacheKey)!;
  } else {
    analyses = analyzeOdds(allOdds, minDiscrepancy);
    analysisCache.set(analysisCacheKey, analyses);
  }

  // AI insights (separate cache, longer TTL)
  if (includeAi && analyses.length > 0) {
    const { getAIProvider } = await import("@/lib/ai/provider");
    const { available } = getAIProvider();

    if (available) {
      const aiCacheKey = `ai:${sportsKey}:${minDiscrepancy}`;
      const cachedAi = oddsCache.get<string>(aiCacheKey);

      if (cachedAi && !forceRefresh) {
        for (let i = 0; i < Math.min(analyses.length, 10); i++) {
          analyses[i].aiInsight = cachedAi;
        }
      } else {
        try {
          const { fetchAiInsights } = await import("@/lib/ai/provider");
          const topAnalyses = analyses.slice(0, 10);
          const prompt = buildAiPrompt(topAnalyses);
          const aiResponse = await fetchAiInsights(prompt);
          oddsCache.set(aiCacheKey, aiResponse, AI_TTL);
          for (let i = 0; i < topAnalyses.length; i++) {
            analyses[i].aiInsight = aiResponse;
          }
        } catch {
          // AI insights are optional, don't fail
        }
      }
    }
  }

  // Cache stats for debugging
  const cacheStats = {
    odds: oddsCache.getStats(),
    analysis: analysisCache.getStats(),
  };

  return NextResponse.json({
    success: true,
    cached: !forceRefresh,
    totalMatches: allOdds.length,
    analysesCount: analyses.length,
    arbitrageCount: analyses.filter((a) => a.discrepancy.isArbitrage).length,
    analyses,
    errors: errors.length > 0 ? errors : undefined,
    scannedAt: new Date().toISOString(),
    _cache: cacheStats,
  });
}

function analyzeOdds(allOdds: OddsData[], minDiscrepancy: number): OUAnalysis[] {
  const analyses: OUAnalysis[] = [];

  for (const oddsData of allOdds) {
    const totalsMarkets = oddsData.markets.totals;
    if (!totalsMarkets || totalsMarkets.length === 0) continue;

    // Group by line (e.g., 2.5, 3.0, 3.5)
    const lineMap = new Map<number, OUAnalysis["bookmakerOdds"]>();

    for (const market of totalsMarkets) {
      const overOutcome = market.outcomes.find((o) => o.name === "Over");
      const underOutcome = market.outcomes.find((o) => o.name === "Under");
      if (!overOutcome || !underOutcome || !overOutcome.point) continue;

      const line = overOutcome.point;
      if (!lineMap.has(line)) {
        lineMap.set(line, []);
      }

      lineMap.get(line)!.push({
        bookmaker: market.bookmaker,
        bookmakerTitle: market.bookmaker_title,
        overOdds: overOutcome.price,
        underOdds: underOutcome.price,
        lastUpdate: market.last_update,
      });
    }

    // Analyze each line
    for (const [line, bookmakerOdds] of lineMap) {
      if (bookmakerOdds.length < 2) continue;

      const bestOver = bookmakerOdds.reduce((best, curr) =>
        curr.overOdds > best.overOdds ? curr : best
      );
      const bestUnder = bookmakerOdds.reduce((best, curr) =>
        curr.underOdds > best.underOdds ? curr : best
      );

      const overImplied = 1 / bestOver.overOdds;
      const underImplied = 1 / bestUnder.underOdds;
      const impliedProbSum = overImplied + underImplied;
      const spread = Math.abs(overImplied - underImplied);
      const isArbitrage = impliedProbSum < 1.0;
      const arbitrageProfit = isArbitrage
        ? (1 / impliedProbSum - 1) * 100
        : undefined;

      if (spread < minDiscrepancy / 100 && !isArbitrage) continue;

      analyses.push({
        match: {
          id: oddsData.match.id,
          sport: oddsData.match.sport,
          homeTeam: oddsData.match.home_team,
          awayTeam: oddsData.match.away_team,
          commenceTime: oddsData.match.commence_time,
        },
        line,
        bookmakerOdds: bookmakerOdds.sort((a, b) => b.overOdds - a.overOdds),
        discrepancy: {
          maxOverOdds: {
            value: bestOver.overOdds,
            bookmaker: bestOver.bookmakerTitle,
          },
          maxUnderOdds: {
            value: bestUnder.underOdds,
            bookmaker: bestUnder.bookmakerTitle,
          },
          spread,
          impliedProbSum,
          arbitrageProfit,
          isArbitrage,
        },
      });
    }
  }

  // Sort: arbitrage first, then by spread (highest first)
  analyses.sort((a, b) => {
    if (a.discrepancy.isArbitrage && !b.discrepancy.isArbitrage) return -1;
    if (!a.discrepancy.isArbitrage && b.discrepancy.isArbitrage) return 1;
    return b.discrepancy.spread - a.discrepancy.spread;
  });

  return analyses;
}

function buildAiPrompt(analyses: OUAnalysis[]): string {
  const matchesText = analyses
    .map(
      (a, i) =>
        `${i + 1}. ${a.match.homeTeam} vs ${a.match.awayTeam} (${a.match.sport})
   Line: ${a.line} | Best Over: ${a.discrepancy.maxOverOdds.value} (${a.discrepancy.maxOverOdds.bookmaker}) | Best Under: ${a.discrepancy.maxUnderOdds.value} (${a.discrepancy.maxUnderOdds.bookmaker})
   Implied Prob Sum: ${(a.discrepancy.impliedProbSum * 100).toFixed(1)}% | Arbitrage: ${a.discrepancy.isArbitrage ? `Yes (${a.discrepancy.arbitrageProfit?.toFixed(2)}%)` : "No"}`
    )
    .join("\n");

  return `You are a sports betting analyst specializing in over/under (totals) markets. Analyze these matches and their O/U odds discrepancies:

${matchesText}

Provide:
1. Which matches have the most exploitable O/U discrepancies and why
2. Key factors that could affect the total goals/points (team form, injuries, weather, head-to-head)
3. Risk assessment for each recommended bet
4. Overall market sentiment (are bookmakers leaning over or under?)

Keep your analysis concise and actionable. Use Vietnamese language.`;
}
