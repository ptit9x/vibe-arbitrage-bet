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
