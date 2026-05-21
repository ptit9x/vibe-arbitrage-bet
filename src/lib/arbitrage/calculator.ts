// Core arbitrage detection and calculation engine

import { ArbitrageLeg, ArbitrageOpportunity, MarketOdds, MarketType, Match, OddsData, TotalsLine } from "./types";

/**
 * Calculate implied probability from decimal odds
 * Implied probability = 1 / odds
 */
export function impliedProbability(odds: number): number {
  if (odds <= 0) return Infinity;
  return 1 / odds;
}

/**
 * Calculate total implied probability for a set of outcomes
 * If total < 1 → arbitrage opportunity exists
 */
export function totalImpliedProbability(odds: number[]): number {
  return odds.reduce((sum, o) => sum + impliedProbability(o), 0);
}

/**
 * Check if a set of odds presents an arbitrage opportunity
 */
export function isArbitrage(odds: number[]): boolean {
  return totalImpliedProbability(odds) < 1;
}

/**
 * Calculate profit percentage from implied probability total
 */
export function profitPercent(impliedTotal: number): number {
  if (impliedTotal >= 1) return 0;
  return ((1 - impliedTotal) / impliedTotal) * 100;
}

/**
 * Calculate optimal stakes for each leg of an arbitrage bet
 * Uses the "Dutching" method: stake_i = (1/odds_i) / total_implied * total_stake
 */
export function calculateStakes(
  odds: number[],
  outcomes: string[],
  totalStake: number = 1_000_000
): { stakes: number[]; payouts: number[]; profit: number; profitPercent: number } {
  const impliedTotal = totalImpliedProbability(odds);
  
  if (impliedTotal >= 1) {
    return { stakes: [], payouts: [], profit: 0, profitPercent: 0 };
  }

  const stakes = odds.map((o) => (impliedProbability(o) / impliedTotal) * totalStake);
  const payouts = odds.map((o, i) => stakes[i] * o);
  const profit = payouts[0] - totalStake; // All payouts should be ~equal
  const pProfit = profitPercent(impliedTotal);

  return { stakes, payouts, profit, profitPercent: pProfit };
}

/**
 * Find the best odds for each outcome across multiple bookmakers
 * Returns: { outcome_name → { odds, bookmaker_key, bookmaker_title } }
 */
export function findBestOdds(
  marketOdds: MarketOdds[]
): Map<string, { odds: number; bookmaker: string; bookmaker_title: string; point?: number }> {
  const best = new Map<string, { odds: number; bookmaker: string; bookmaker_title: string; point?: number }>();

  for (const mo of marketOdds) {
    for (const outcome of mo.outcomes) {
      const existing = best.get(outcome.name);
      if (!existing || outcome.price > existing.odds) {
        best.set(outcome.name, {
          odds: outcome.price,
          bookmaker: mo.bookmaker,
          bookmaker_title: mo.bookmaker_title,
          point: outcome.point,
        });
      }
    }
  }

  return best;
}

/**
 * Scan a single match's odds for arbitrage opportunities across all market types
 */
export function scanMatchForArbitrage(
  oddsData: OddsData,
  minProfitPercent: number = 0.5,
  totalStake: number = 1_000_000
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  const marketEntries: [MarketType, MarketOdds[] | undefined][] = [
    ["h2h", oddsData.markets.h2h],
    ["spreads", oddsData.markets.spreads],
    ["totals", oddsData.markets.totals],
  ];

  for (const [marketType, marketOdds] of marketEntries) {
    if (!marketOdds || marketOdds.length < 2) continue;

    // Group totals by point value (e.g., all 2.5 together)
    if (marketType === "totals") {
      const byPoint = new Map<number, MarketOdds[]>();
      for (const mo of marketOdds) {
        const point = mo.outcomes[0]?.point ?? 0;
        if (!byPoint.has(point)) byPoint.set(point, []);
        byPoint.get(point)!.push(mo);
      }
      for (const pointOdds of Array.from(byPoint.values())) {
        const opp = checkMarketArbitrage(oddsData.match, marketType, pointOdds, minProfitPercent, totalStake);
        if (opp) opportunities.push(opp);
      }
    } else {
      // Group spreads by point value too
      if (marketType === "spreads") {
        const byPoint = new Map<number, MarketOdds[]>();
        for (const mo of marketOdds) {
          const point = mo.outcomes[0]?.point ?? 0;
          if (!byPoint.has(point)) byPoint.set(point, []);
          byPoint.get(point)!.push(mo);
        }
        for (const pointOdds of Array.from(byPoint.values())) {
          const opp = checkMarketArbitrage(oddsData.match, marketType, pointOdds, minProfitPercent, totalStake);
          if (opp) opportunities.push(opp);
        }
      } else {
        const opp = checkMarketArbitrage(oddsData.match, marketType, marketOdds, minProfitPercent, totalStake);
        if (opp) opportunities.push(opp);
      }
    }
  }

  return opportunities;
}

function checkMarketArbitrage(
  match: Match,
  marketType: MarketType,
  marketOdds: MarketOdds[],
  minProfitPercent: number,
  totalStake: number
): ArbitrageOpportunity | null {
  if (marketOdds.length < 2) return null;

  const bestOddsMap = findBestOdds(marketOdds);
  const outcomeNames = Array.from(bestOddsMap.keys());
  const bestOddsArr = outcomeNames.map((name) => bestOddsMap.get(name)!.odds);

  const impliedTotal = totalImpliedProbability(bestOddsArr);
  if (impliedTotal >= 1) return null;

  const pProfit = profitPercent(impliedTotal);
  if (pProfit < minProfitPercent) return null;

  const { stakes, payouts } = calculateStakes(bestOddsArr, outcomeNames, totalStake);

  const legs: ArbitrageLeg[] = outcomeNames.map((name, i) => {
    const best = bestOddsMap.get(name)!;
    return {
      bookmaker: best.bookmaker,
      bookmaker_title: best.bookmaker_title,
      outcome: name,
      odds: best.odds,
      point: best.point,
      stake: Math.round(stakes[i]),
      payout: Math.round(payouts[i]),
    };
  });

  return {
    id: `${match.id}-${marketType}-${Date.now()}`,
    match,
    market_type: marketType,
    profit_percent: Math.round(pProfit * 100) / 100,
    legs,
    total_stake: totalStake,
    guaranteed_profit: Math.round(payouts[0] - totalStake),
    expires_at: marketOdds[0]?.last_update,
  };
}

/**
 * Generate a match identity key from team names + sport.
 * Normalizes team names to lowercase, trimmed, for fuzzy matching.
 */
function matchIdentityKey(match: Match): string {
  const home = match.home_team.toLowerCase().trim();
  const away = match.away_team.toLowerCase().trim();
  const sport = match.sport;
  // Sort teams alphabetically so home/away swap still matches
  const teams = [home, away].sort().join("|");
  return `${sport}:${teams}`;
}

/**
 * Merge OddsData for the same real-world match coming from different sources
 * (e.g. TheOddsAPI + 8xBet). Combines markets and deduplicates bookmaker entries.
 */
export function mergeDuplicateMatches(allOdds: OddsData[]): OddsData[] {
  const merged = new Map<string, OddsData>();

  for (const oddsData of allOdds) {
    const key = matchIdentityKey(oddsData.match);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, oddsData);
      continue;
    }

    // Merge markets: append new bookmaker odds, dedup by (bookmaker + marketType + point)
    const marketTypes = ["h2h", "spreads", "totals"] as const;
    for (const mt of marketTypes) {
      const existingMarket = existing.markets[mt] || [];
      const newMarket = oddsData.markets[mt] || [];

      for (const mo of newMarket) {
        // Check if this bookmaker already has an entry for the same point
        const isDuplicate = existingMarket.some((eMo) => {
          if (eMo.bookmaker !== mo.bookmaker) return false;
          // Same bookmaker — check if point is the same
          const ePoint = eMo.outcomes[0]?.point;
          const mPoint = mo.outcomes[0]?.point;
          // For h2h there's no point, so just dedup by bookmaker
          if (mt === "h2h") return true;
          return ePoint === mPoint;
        });

        if (!isDuplicate) {
          existingMarket.push(mo);
        }
      }

      existing.markets[mt] = existingMarket;
    }
  }

  return Array.from(merged.values());
}

/**
 * Deduplicate totals markets: remove bookmaker entries that have the exact same
 * odds for all outcomes (meaning they offer nothing unique for arbitrage).
 * Only keeps the entry with the best odds for each (outcome, point) combo.
 */
export function deduplicateTotals(oddsData: OddsData[]): OddsData[] {
  return oddsData.map((od) => {
    const newMarkets = { ...od.markets };

    for (const mt of ["totals", "spreads"] as const) {
      const market = newMarkets[mt];
      if (!market || market.length === 0) continue;

      // Group by point, then for each point: deduplicate bookmakers with identical odds
      const byPoint = new Map<number | undefined, MarketOdds[]>();
      for (const mo of market) {
        const point = mo.outcomes[0]?.point;
        if (!byPoint.has(point)) byPoint.set(point, []);
        byPoint.get(point)!.push(mo);
      }

      const deduped: MarketOdds[] = [];
      for (const pointOdds of Array.from(byPoint.values())) {
        if (pointOdds.length <= 1) {
          deduped.push(...pointOdds);
          continue;
        }

        // Remove entries where ALL outcomes have identical odds to another entry
        const seen = new Set<string>();
        for (const mo of pointOdds) {
          const sig = mo.outcomes
            .map((o) => `${o.name}:${o.price}`)
            .sort()
            .join("|");
          if (!seen.has(sig)) {
            seen.add(sig);
            deduped.push(mo);
          }
        }
      }

      newMarkets[mt] = deduped;
    }

    return { ...od, markets: newMarkets };
  });
}

/**
 * Scan multiple matches and return all arbitrage opportunities sorted by profit
 */
export function scanAllMatches(
  allOdds: OddsData[],
  minProfitPercent: number = 0.5,
  totalStake: number = 1_000_000
): ArbitrageOpportunity[] {
  // 1. Merge same real-world matches from different sources
  const merged = mergeDuplicateMatches(allOdds);

  // 2. Deduplicate totals/spreads with identical odds across bookmakers
  const deduped = deduplicateTotals(merged);

  const all: ArbitrageOpportunity[] = [];

  for (const oddsData of deduped) {
    const opps = scanMatchForArbitrage(oddsData, minProfitPercent, totalStake);
    all.push(...opps);
  }

  // Sort by profit percent descending
  all.sort((a, b) => b.profit_percent - a.profit_percent);
  return all;
}

/**
 * List ALL totals lines (surebet + non-surebet), sorted by implied total ascending
 */
export function listAllTotals(
  allOdds: OddsData[],
  totalStake: number = 100
): TotalsLine[] {
  const merged = mergeDuplicateMatches(allOdds);
  const deduped = deduplicateTotals(merged);
  const results: TotalsLine[] = [];

  for (const oddsData of deduped) {
    const totals = oddsData.markets.totals;
    if (!totals || totals.length < 2) continue;

    // Group by point
    const byPoint = new Map<number, MarketOdds[]>();
    for (const mo of totals) {
      const point = mo.outcomes[0]?.point ?? 0;
      if (!byPoint.has(point)) byPoint.set(point, []);
      byPoint.get(point)!.push(mo);
    }

    for (const [point, pointOdds] of Array.from(byPoint.entries())) {
      if (pointOdds.length < 2) continue;

      const bestOver = pointOdds.reduce((best, mo) => {
        const o = mo.outcomes.find(out => out.name === "Over");
        return o && o.price > best.odds ? { odds: o.price, bookmaker: mo.bookmaker, bookmaker_title: mo.bookmaker_title } : best;
      }, { odds: 0, bookmaker: "", bookmaker_title: "" });

      const bestUnder = pointOdds.reduce((best, mo) => {
        const u = mo.outcomes.find(out => out.name === "Under");
        return u && u.price > best.odds ? { odds: u.price, bookmaker: mo.bookmaker, bookmaker_title: mo.bookmaker_title } : best;
      }, { odds: 0, bookmaker: "", bookmaker_title: "" });

      if (bestOver.odds <= 0 || bestUnder.odds <= 0) continue;

      const impliedTotal = totalImpliedProbability([bestOver.odds, bestUnder.odds]);
      const isArb = impliedTotal < 1;
      const pProfit = isArb ? profitPercent(impliedTotal) : 0;

      const overStake = (1 / bestOver.odds) / impliedTotal * totalStake;
      const underStake = (1 / bestUnder.odds) / impliedTotal * totalStake;
      const overPayout = overStake * bestOver.odds;
      const underPayout = underStake * bestUnder.odds;
      const minPayout = Math.min(overPayout, underPayout);
      const guaranteedProfit = isArb ? minPayout - totalStake : 0;

      results.push({
        id: `${oddsData.match.id}-totals-${point}`,
        match: oddsData.match,
        point,
        bestOver,
        bestUnder,
        impliedTotal: Math.round(impliedTotal * 10000) / 10000,
        profitPercent: Math.round(pProfit * 100) / 100,
        isArbitrage: isArb,
        stakes: [Math.round(overStake), Math.round(underStake)],
        payouts: [Math.round(overPayout), Math.round(underPayout)],
        totalStake,
        guaranteedProfit: Math.round(guaranteedProfit),
      });
    }
  }

  // Sort: surebets first (by profit desc), then non-surebets (by implied total asc)
  results.sort((a, b) => {
    if (a.isArbitrage && !b.isArbitrage) return -1;
    if (!a.isArbitrage && b.isArbitrage) return 1;
    if (a.isArbitrage && b.isArbitrage) return b.profitPercent - a.profitPercent;
    return a.impliedTotal - b.impliedTotal;
  });

  return results;
}
