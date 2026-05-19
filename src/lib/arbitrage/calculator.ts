// Core arbitrage detection and calculation engine

import { ArbitrageLeg, ArbitrageOpportunity, MarketOdds, MarketType, Match, OddsData } from "./types";

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
      for (const [, pointOdds] of byPoint) {
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
        for (const [, pointOdds] of byPoint) {
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
 * Scan multiple matches and return all arbitrage opportunities sorted by profit
 */
export function scanAllMatches(
  allOdds: OddsData[],
  minProfitPercent: number = 0.5,
  totalStake: number = 1_000_000
): ArbitrageOpportunity[] {
  const all: ArbitrageOpportunity[] = [];

  for (const oddsData of allOdds) {
    const opps = scanMatchForArbitrage(oddsData, minProfitPercent, totalStake);
    all.push(...opps);
  }

  // Sort by profit percent descending
  all.sort((a, b) => b.profit_percent - a.profit_percent);
  return all;
}
