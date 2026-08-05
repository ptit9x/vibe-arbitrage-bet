// Odds data types for sports arbitrage

export type Sport = "soccer" | "basketball" | "tennis" | "baseball" | "hockey" | "mma" | "boxing" | "cricket" | "rugby";

export type MarketType = "h2h" | "spreads" | "totals" | "ou"; // head-to-head, spread, over/under

export type Bookmaker = {
  key: string;
  title: string;
  last_update: string;
};

export type Outcome = {
  name: string;
  price: number; // Decimal odds (e.g., 2.10)
  point?: number; // For spreads/totals (e.g., 2.5)
};

export type MarketOdds = {
  bookmaker: string;
  bookmaker_title: string;
  last_update: string;
  outcomes: Outcome[];
};

export type Match = {
  id: string;
  sport: Sport;
  league?: string; // e.g. "Premier League", "NBA"
  commence_time: string;
  home_team: string;
  away_team: string;
};

export type OddsData = {
  match: Match;
  markets: {
    h2h?: MarketOdds[];
    spreads?: MarketOdds[];
    totals?: MarketOdds[];
  };
};

// Arbitrage result types

export type ArbitrageLeg = {
  bookmaker: string;
  bookmaker_title: string;
  outcome: string;
  odds: number;
  point?: number;
  stake: number;       // Calculated stake per unit of total_stake
  payout: number;      // Expected payout
};

export type ArbitrageOpportunity = {
  id: string;
  match: Match;
  market_type: MarketType;
  profit_percent: number;  // e.g., 3.7 means 3.7% guaranteed profit
  legs: ArbitrageLeg[];
  total_stake: number;     // Reference total (default 1,000,000)
  guaranteed_profit: number;
  expires_at?: string;     // When odds were last updated
};

// Totals line result (for showing all lines, not just surebets)

export type TotalsLine = {
  id: string;
  match: Match;
  point: number;             // e.g. 2.5
  bestOver: { odds: number; bookmaker: string; bookmaker_title: string };
  bestUnder: { odds: number; bookmaker: string; bookmaker_title: string };
  impliedTotal: number;      // sum of implied probs (< 1 = surebet)
  profitPercent: number;     // 0 if not arb
  isArbitrage: boolean;
  stakes: number[];          // [overStake, underStake]
  payouts: number[];         // [overPayout, underPayout]
  totalStake: number;
  guaranteedProfit: number;
};

// H2H (1X2) line result — best odds for Home/Draw/Away across bookmakers

export type H2HLine = {
  id: string;
  match: Match;
  bestHome: { odds: number; bookmaker: string; bookmaker_title: string };
  bestDraw: { odds: number; bookmaker: string; bookmaker_title: string };
  bestAway: { odds: number; bookmaker: string; bookmaker_title: string };
  impliedTotal: number;      // sum of implied probs
  margin: number;            // bookmaker margin % (impliedTotal - 1) * 100
};

// Spread/Handicap line result — best odds for each side at a given point

export type SpreadLine = {
  id: string;
  match: Match;
  point: number;             // handicap line e.g. -1.5
  bestHome: { odds: number; bookmaker: string; bookmaker_title: string };
  bestAway: { odds: number; bookmaker: string; bookmaker_title: string };
  impliedTotal: number;
  margin: number;
};
