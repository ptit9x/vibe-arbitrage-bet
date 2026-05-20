// Bookmaker website URLs — used to generate clickable links in the UI
// Keys match TheOddsAPI bookmaker keys

export const BOOKMAKER_URLS: Record<string, string> = {
  // Popular EU/UK
  bet365: "https://www.bet365.com",
  williamhill: "https://www.williamhill.com",
  ladbrokes: "https://www.ladbrokes.com",
  coral: "https://www.coral.co.uk",
  betfair: "https://www.betfair.com/sport",
  paddy_power: "https://www.paddypower.com",
  betvictor: "https://www.betvictor.com",
  boylesports: "https://www.boylesports.com",
  // Popular US
  draftkings: "https://sportsbook.draftkings.com",
  fanduel: "https://sportsbook.fanduel.com",
  betmgm: "https://sports.betmgm.com",
  pointsbet: "https://www.pointsbet.com",
  caesars: "https://sportsbook.caesars.com/us",
  barstool: "https://barstoolSportsbook.com",
  // EU / Asian
  "1xbet": "https://www.1xbet.com",
  betway: "https://www.betway.com",
  unibet: "https://www.unibet.com",
  bwin: "https://www.bwin.com",
  betsson: "https://www.betsson.com",
  betclic: "https://www.betclic.com",
  mybookie: "https://www.mybookie.ag",
  betonline: "https://www.betonline.ag",
  sugarhouse: "https://www.playSugarHouse.com",
  twinspires: "https://www.twinspires.com",
  superbook: "https://www.superbook.com",
  lowvig: "https://www.lowvig.com",
  // Asian
  "8xbet": "https://www.8xbet.com",
  // Fallback
};

/**
 * Get bookmaker URL by key or title
 */
export function getBookmakerUrl(key: string, title?: string): string | null {
  // Try exact key match first
  if (BOOKMAKER_URLS[key]) return BOOKMAKER_URLS[key];

  // Try lowercase key
  const lower = key.toLowerCase();
  if (BOOKMAKER_URLS[lower]) return BOOKMAKER_URLS[lower];

  // Try matching by title
  if (title) {
    const titleLower = title.toLowerCase().replace(/[\s._-]/g, "");
    for (const [k, url] of Object.entries(BOOKMAKER_URLS)) {
      const kClean = k.replace(/[\s._-]/g, "");
      if (titleLower.includes(kClean) || kClean.includes(titleLower)) {
        return url;
      }
    }
  }

  return null;
}
