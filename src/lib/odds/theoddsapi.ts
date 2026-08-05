// TheOddsAPI client — fetches live odds from multiple bookmakers
// Free tier: 500 requests/month, 10+ bookmakers, multiple sports

import { Sport, MarketType, MarketOdds, OddsData, Match } from "../arbitrage/types";

const BASE_URL = "https://api.the-odds-api.com/v4";

// Map our sport keys to TheOddsAPI sport keys
const SPORT_MAP: Record<string, string> = {
  soccer: "soccer_epl",           // English Premier League (most popular)
  soccer_champions: "soccer_champions_league_eu",
  soccer_la_liga: "soccer_la_liga",
  soccer_series_a: "soccer_italy_serie_a",
  soccer_bundesliga: "soccer_germany_bundesliga",
  basketball: "basketball_nba",
  tennis: "tennis_atp_wimbledon",
  baseball: "baseball_mlb",
  hockey: "icehockey_nhl",
  mma: "mma_mixed_martial_arts",
};

const MARKET_MAP: Record<MarketType, string> = {
  h2h: "h2h",
  spreads: "spreads",
  totals: "totals",
  ou: "totals",
};

export type OddsApiResponse = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    last_update: string;
    markets: {
      key: string;
      last_update: string;
      outcomes: {
        name: string;
        price: number;
        point?: number;
      }[];
    }[];
  }[];
};

/**
 * Fetch odds from TheOddsAPI for a given sport and markets
 */
export async function fetchOdds(
  apiKey: string,
  sport: string = "soccer_epl",
  markets: MarketType[] = ["h2h", "totals"],
  regions: string[] = ["eu", "uk"]  // EU + UK for best decimal odds coverage
): Promise<OddsApiResponse[]> {
  const marketsParam = markets.map((m) => MARKET_MAP[m]).join(",");
  const regionsParam = regions.join(",");
  const url = `${BASE_URL}/sports/${sport}/odds/?apiKey=${apiKey}&regions=${regionsParam}&markets=${marketsParam}&oddsFormat=decimal`;

  const res = await fetch(url, { next: { revalidate: 60 } }); // Cache 60s

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TheOddsAPI error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Fetch odds for multiple sports and combine results
 */
export async function fetchMultiSportOdds(
  apiKey: string,
  sports: string[] = ["soccer_epl", "basketball_nba"],
  markets: MarketType[] = ["h2h", "totals"]
): Promise<OddsApiResponse[]> {
  const results = await Promise.allSettled(
    sports.map((sport) => fetchOdds(apiKey, sport, markets))
  );

  const all: OddsApiResponse[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      all.push(...result.value);
    }
  }
  return all;
}

/**
 * Convert TheOddsAPI response to our internal OddsData format
 */
export function normalizeOddsResponse(responses: OddsApiResponse[]): OddsData[] {
  return responses.map((resp) => {
    const match: Match = {
      id: resp.id,
      sport: mapSportKey(resp.sport_key),
      league: resp.sport_title,
      commence_time: resp.commence_time,
      home_team: resp.home_team,
      away_team: resp.away_team,
    };

    const h2h: MarketOdds[] = [];
    const spreads: MarketOdds[] = [];
    const totals: MarketOdds[] = [];

    for (const bm of resp.bookmakers) {
      for (const market of bm.markets) {
        const mo: MarketOdds = {
          bookmaker: bm.key,
          bookmaker_title: bm.title,
          last_update: market.last_update || bm.last_update,
          outcomes: market.outcomes.map((o) => ({
            name: o.name,
            price: o.price,
            point: o.point,
          })),
        };

        if (market.key === "h2h") h2h.push(mo);
        else if (market.key === "spreads") spreads.push(mo);
        else if (market.key === "totals") totals.push(mo);
      }
    }

    return { match, markets: { h2h, spreads, totals } };
  });
}

function mapSportKey(apiKey: string): Sport {
  if (apiKey.startsWith("soccer")) return "soccer";
  if (apiKey.startsWith("basketball")) return "basketball";
  if (apiKey.startsWith("tennis")) return "tennis";
  if (apiKey.startsWith("baseball")) return "baseball";
  if (apiKey.startsWith("icehockey")) return "hockey";
  if (apiKey.startsWith("mma")) return "mma";
  return "soccer";
}

/**
 * Get available sports from TheOddsAPI
 */
export async function getAvailableSports(apiKey: string) {
  const url = `${BASE_URL}/sports/?apiKey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sports: ${res.status}`);
  return res.json() as Promise<{ key: string; title: string; description: string; active: boolean }[]>;
}
