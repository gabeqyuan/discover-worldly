// Market coverage test script for Spotify Top 50 playlists per country
// Run with: node test-spotify-playlists.js

const COUNTRY_PLAYLISTS = {
  US: "37i9dQZEVXbLRQDuF5jeBp",
  CA: "37i9dQZEVXbKj23U1GF4IR",
  MX: "37i9dQZEVXbO3qyFxbkOE1",
  BR: "37i9dQZEVXbMXbN3EUUhlg",
  AR: "37i9dQZEVXbMMy2roB9myp",
  CL: "37i9dQZEVXbL0GavIqMTeb",
  CO: "37i9dQZEVXbOa2lmxNORXQ",
  GB: "37i9dQZEVXbLnolsZ8PSNw",
  DE: "37i9dQZEVXbJiZcmkrIHGU",
  FR: "37i9dQZEVXbIPWwFssbupI",
  ES: "37i9dQZEVXbNFJfN1Vw8d9",
  IT: "37i9dQZEVXbIQnj7RRhdSX",
  NL: "37i9dQZEVXbKCF6dqVpDkS",
  SE: "37i9dQZEVXbLoATJ81JYXz",
  NO: "37i9dQZEVXbJvfa0Yxg7E7",
  DK: "37i9dQZEVXbL3J0k32lWnN",
  FI: "37i9dQZEVXbMxcczTSoGwZ",
  PL: "37i9dQZEVXbN6itCcaL3Tt",
  JP: "37i9dQZEVXbKXQ4mDTEBXq",
  KR: "37i9dQZEVXbNxXF4SkHj9F",
  IN: "37i9dQZEVXbLZ52XmnySJg",
  TH: "37i9dQZEVXbMnz8KIWsvf9",
  ID: "37i9dQZEVXbObFQZ3JLcXt",
  PH: "37i9dQZEVXbNBz9cRCSFkY",
  MY: "37i9dQZEVXbJlfUljuZExa",
  SG: "37i9dQZEVXbK4gjvS1FjPY",
  AU: "37i9dQZEVXbJPcfkRz0wJ0",
  NZ: "37i9dQZEVXbM8SIrkERIYl",
  AE: "37i9dQZEVXbM4UZuIrvHvA",
  SA: "37i9dQZEVXbLrQBcXqUtaC",
  TR: "37i9dQZEVXbIVYVBNw9D5K",
  ZA: "37i9dQZEVXbMH2jvi6jvjk",
  NG: "37i9dQZEVXbKY7jLzlJ11V",
  EG: "37i9dQZEVXbLn7RQmT5Xv2",
};

const CONTINENT_PLAYLISTS = {
  "North America": "37i9dQZEVXbLRQDuF5jeBp",
  "South America": "37i9dQZEVXbMXbN3EUUhlg",
  Europe: "37i9dQZEVXbLnolsZ8PSNw",
  Asia: "37i9dQZEVXbLZ52XmnySJg",
  Africa: "37i9dQZEVXbMH2jvi6jvjk",
  Oceania: "37i9dQZEVXbJPcfkRz0wJ0",
};

const COUNTRY_TO_CONTINENT = {
  US: "North America", CA: "North America", MX: "North America",
  BR: "South America", AR: "South America", CL: "South America", CO: "South America",
  GB: "Europe", DE: "Europe", FR: "Europe", ES: "Europe", IT: "Europe", NL: "Europe",
  SE: "Europe", NO: "Europe", DK: "Europe", FI: "Europe", PL: "Europe",
  JP: "Asia", KR: "Asia", IN: "Asia", TH: "Asia", ID: "Asia", PH: "Asia", MY: "Asia", SG: "Asia",
  AE: "Asia", SA: "Asia", TR: "Asia",
  ZA: "Africa", NG: "Africa", EG: "Africa",
  AU: "Oceania", NZ: "Oceania",
};

const MARKETS_TO_TEST = [
  "US", "GB", "JP", "BR", "DE", "FR", "IN", "ID", "AE", "ZA", "NG", "AU", "NZ", "TR", "MX", "CA", "ES", "IT",
  // Include markets with likely fallback usage
  "VN", "PK", "BD", "KE", "GH", "TZ", "OM", "KW", "QA", "BH", "CO", "AR", "CL", "PL", "FI"
];

async function getToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  }
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`token_error:${tokenRes.status}:${text}`);
  }
  const { access_token } = await tokenRes.json();
  return access_token;
}

async function resolvePlaylistId(accessToken, market) {
  const lower = (s) => (typeof s === "string" ? s.toLowerCase() : "");
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/browse/categories/toplists/playlists?country=${encodeURIComponent(market)}&limit=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (res.ok) {
      const json = await res.json();
      const items = json?.playlists?.items || [];
      const pick =
        items.find((p) => lower(p?.name).includes("top 50") && !lower(p?.name).includes("global") && lower(p?.owner?.display_name) === "spotify") ||
        items.find((p) => lower(p?.name).includes("top 50") && lower(p?.owner?.display_name) === "spotify") ||
        items.find((p) => lower(p?.name).includes("top 50") && lower(p?.name).includes("global"));
      if (pick?.id) {
        return { playlistId: pick.id, source: lower(pick.name).includes("global") ? "global" : "toplists" };
      }
    }
  } catch {}

  if (COUNTRY_PLAYLISTS[market]) return { playlistId: COUNTRY_PLAYLISTS[market], source: "country" };
  const continent = COUNTRY_TO_CONTINENT[market];
  if (continent && CONTINENT_PLAYLISTS[continent]) return { playlistId: CONTINENT_PLAYLISTS[continent], source: "continent" };
  return { playlistId: "37i9dQZF1DXcBWIGoYBM5M", source: "global" };
}

async function testMarket(market) {
  try {
    const token = await getToken();
    const { playlistId, source } = await resolvePlaylistId(token, market);
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10&market=${encodeURIComponent(market)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!tracksRes.ok) {
      const details = await tracksRes.text();
      console.log(`❌ ${market} [${source}] -> tracks_error ${tracksRes.status} ${details.slice(0, 120)}...`);
      return;
    }
    const data = await tracksRes.json();
    const count = (data.items || []).length;
    console.log(`✅ ${market} [${source}] -> ${count} tracks (playlist ${playlistId})`);
  } catch (e) {
    console.error(`❌ ${market} error:`, e.message);
  }
}

async function main() {
  console.log("🎵 Testing Spotify markets...\n");
  for (const market of MARKETS_TO_TEST) {
    // eslint-disable-next-line no-await-in-loop
    await testMarket(market);
  }
}

main();
