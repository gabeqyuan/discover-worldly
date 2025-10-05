import { NextResponse } from "next/server";

// Mapping of country codes to Spotify Top 50 playlist IDs
// Format: "COUNTRY_CODE": "PLAYLIST_ID"
const COUNTRY_PLAYLISTS = {
  // North America
  US: "37i9dQZEVXbLRQDuF5jeBp", // USA Top 50
  CA: "37i9dQZEVXbKj23U1GF4IR", // Canada Top 50
  MX: "37i9dQZEVXbO3qyFxbkOE1", // Mexico Top 50
  
  // South America
  BR: "37i9dQZEVXbMXbN3EUUhlg", // Brazil Top 50
  AR: "37i9dQZEVXbMMy2roB9myp", // Argentina Top 50
  CL: "37i9dQZEVXbL0GavIqMTeb", // Chile Top 50
  CO: "37i9dQZEVXbOa2lmxNORXQ", // Colombia Top 50
  
  // Europe
  GB: "37i9dQZEVXbLnolsZ8PSNw", // UK Top 50
  DE: "37i9dQZEVXbJiZcmkrIHGU", // Germany Top 50
  FR: "37i9dQZEVXbIPWwFssbupI", // France Top 50
  ES: "37i9dQZEVXbNFJfN1Vw8d9", // Spain Top 50
  IT: "37i9dQZEVXbIQnj7RRhdSX", // Italy Top 50
  NL: "37i9dQZEVXbKCF6dqVpDkS", // Netherlands Top 50
  SE: "37i9dQZEVXbLoATJ81JYXz", // Sweden Top 50
  NO: "37i9dQZEVXbJvfa0Yxg7E7", // Norway Top 50
  DK: "37i9dQZEVXbL3J0k32lWnN", // Denmark Top 50
  FI: "37i9dQZEVXbMxcczTSoGwZ", // Finland Top 50
  PL: "37i9dQZEVXbN6itCcaL3Tt", // Poland Top 50
  
  // Asia
  JP: "37i9dQZEVXbKXQ4mDTEBXq", // Japan Top 50
  KR: "37i9dQZEVXbNxXF4SkHj9F", // South Korea Top 50
  IN: "37i9dQZEVXbLZ52XmnySJg", // India Top 50
  TH: "37i9dQZEVXbMnz8KIWsvf9", // Thailand Top 50
  ID: "37i9dQZEVXbObFQZ3JLcXt", // Indonesia Top 50
  PH: "37i9dQZEVXbNBz9cRCSFkY", // Philippines Top 50
  MY: "37i9dQZEVXbJlfUljuZExa", // Malaysia Top 50
  SG: "37i9dQZEVXbK4gjvS1FjPY", // Singapore Top 50
  
  // Oceania
  AU: "37i9dQZEVXbJPcfkRz0wJ0", // Australia Top 50
  NZ: "37i9dQZEVXbM8SIrkERIYl", // New Zealand Top 50
  
  // Middle East
  AE: "37i9dQZEVXbM4UZuIrvHvA", // UAE Top 50
  SA: "37i9dQZEVXbLrQBcXqUtaC", // Saudi Arabia Top 50
  TR: "37i9dQZEVXbIVYVBNw9D5K", // Turkey Top 50
  
  // Africa
  ZA: "37i9dQZEVXbMH2jvi6jvjk", // South Africa Top 50
  NG: "37i9dQZEVXbKY7jLzlJ11V", // Nigeria Top 50
  EG: "37i9dQZEVXbLn7RQmT5Xv2", // Egypt Top 50
};

// Continent fallback playlists
const CONTINENT_PLAYLISTS = {
  "North America": "37i9dQZEVXbLRQDuF5jeBp", // USA Top 50
  "South America": "37i9dQZEVXbMXbN3EUUhlg", // Brazil Top 50
  Europe: "37i9dQZEVXbLnolsZ8PSNw", // UK Top 50 (Global)
  Asia: "37i9dQZEVXbLZ52XmnySJg", // India Top 50
  Africa: "37i9dQZEVXbMH2jvi6jvjk", // South Africa Top 50
  Oceania: "37i9dQZEVXbJPcfkRz0wJ0", // Australia Top 50
};

// Map country codes to continents
const COUNTRY_TO_CONTINENT = {
  // North America
  US: "North America", CA: "North America", MX: "North America",
  GT: "North America", HN: "North America", SV: "North America",
  NI: "North America", CR: "North America", PA: "North America",
  BZ: "North America", CU: "North America", JM: "North America",
  HT: "North America", DO: "North America",
  
  // South America
  BR: "South America", AR: "South America", CL: "South America",
  CO: "South America", PE: "South America", VE: "South America",
  EC: "South America", BO: "South America", PY: "South America",
  UY: "South America", GY: "South America", SR: "South America",
  
  // Europe
  GB: "Europe", DE: "Europe", FR: "Europe", ES: "Europe",
  IT: "Europe", NL: "Europe", SE: "Europe", NO: "Europe",
  DK: "Europe", FI: "Europe", PL: "Europe", PT: "Europe",
  GR: "Europe", AT: "Europe", BE: "Europe", CH: "Europe",
  CZ: "Europe", HU: "Europe", RO: "Europe", UA: "Europe",
  IE: "Europe", HR: "Europe", BG: "Europe", RS: "Europe",
  SK: "Europe", LT: "Europe", SI: "Europe", LV: "Europe",
  EE: "Europe", IS: "Europe", LU: "Europe", MT: "Europe",
  
  // Asia
  JP: "Asia", KR: "Asia", IN: "Asia", TH: "Asia",
  ID: "Asia", PH: "Asia", MY: "Asia", SG: "Asia",
  CN: "Asia", VN: "Asia", PK: "Asia", BD: "Asia",
  MM: "Asia", KH: "Asia", LA: "Asia", NP: "Asia",
  LK: "Asia", AF: "Asia", MN: "Asia", KZ: "Asia",
  
  // Middle East (part of Asia)
  AE: "Asia", SA: "Asia", TR: "Asia", IL: "Asia",
  IQ: "Asia", IR: "Asia", SY: "Asia", JO: "Asia",
  LB: "Asia", YE: "Asia", OM: "Asia", KW: "Asia",
  QA: "Asia", BH: "Asia",
  
  // Africa
  ZA: "Africa", NG: "Africa", EG: "Africa", KE: "Africa",
  GH: "Africa", TZ: "Africa", UG: "Africa", ET: "Africa",
  MA: "Africa", DZ: "Africa", TN: "Africa", LY: "Africa",
  SD: "Africa", AO: "Africa", MZ: "Africa", ZW: "Africa",
  CI: "Africa", CM: "Africa", SN: "Africa", ML: "Africa",
  
  // Oceania
  AU: "Oceania", NZ: "Oceania", FJ: "Oceania", PG: "Oceania",
  NC: "Oceania", PF: "Oceania", WS: "Oceania", TO: "Oceania",
};

// GET /api/spotify/country-tracks?countryCode=US&userToken=...
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get("countryCode")?.toUpperCase();
  const userToken = searchParams.get("userToken"); // Optional user access token

  if (!countryCode) {
    return NextResponse.json(
      { error: "Missing countryCode parameter" },
      { status: 400 }
    );
  }

  // Determine which playlist to use
  let playlistId = COUNTRY_PLAYLISTS[countryCode];
  let source = "country";

  // If no country-specific playlist, fall back to continent
  if (!playlistId) {
    const continent = COUNTRY_TO_CONTINENT[countryCode];
    if (continent) {
      playlistId = CONTINENT_PLAYLISTS[continent];
      source = "continent";
    }
  }

  // If still no playlist, use global top 50
  if (!playlistId) {
    playlistId = "37i9dQZF1DXcBWIGoYBM5M"; // Today's Top Hits (Global)
    source = "global";
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET" },
      { status: 500 }
    );
  }

  try {
    let accessToken = userToken; // Try to use user token first
    let authType = userToken ? "user" : "client_credentials";

    // If no user token provided, fall back to Client Credentials
    if (!accessToken) {
      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
        body: "grant_type=client_credentials",
      });

      if (!tokenRes.ok) {
        const text = await tokenRes.text();
        return NextResponse.json(
          { error: "token_error", status: tokenRes.status, details: text },
          { status: 500 }
        );
      }

      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
    }

    // 🎵 Fetch playlist tracks (with region-aware market). If user token fails, fall back to client credentials once.
    const buildTracksUrl = (marketCode) => {
      const url = new URL(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`);
      url.searchParams.set("limit", "50");
      if (marketCode) url.searchParams.set("market", marketCode);
      return url.toString();
    };

    const initialMarket = authType === "user" ? "from_token" : (countryCode || "US");
    let tracksRes = await fetch(buildTracksUrl(initialMarket), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // If we attempted with a user token and got auth error, retry once with client credentials
    if (authType === "user" && (tracksRes.status === 401 || tracksRes.status === 403)) {
      const tokenRes2 = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
        body: "grant_type=client_credentials",
      });

      if (!tokenRes2.ok) {
        const text = await tokenRes2.text();
        return NextResponse.json(
          { error: "token_error", status: tokenRes2.status, details: text },
          { status: 500 }
        );
      }
      const tokenData2 = await tokenRes2.json();
      accessToken = tokenData2.access_token;
      authType = "client_credentials";
      // Retry with a deterministic market for CC flow (use requested country or US)
      tracksRes = await fetch(buildTracksUrl(countryCode || "US"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    if (!tracksRes.ok) {
      const text = await tracksRes.text();
      return NextResponse.json(
        { error: "tracks_error", status: tracksRes.status, details: text },
        { status: tracksRes.status }
      );
    }

    const tracksJson = await tracksRes.json();
    const items = tracksJson.items || [];

    const mapped = items
      .map((item) => {
        const t = item.track || {};
        return {
          id: t.id,
          title: t.name,
          artist: t.artists?.map((a) => a.name).join(", ") || "",
          albumArt: t.album?.images?.[0]?.url || "",
          spotifyId: t.id,
        };
      })
      .filter((t) => !!t.spotifyId);

    // Deterministic Top 10 (first 10 in playlist order)
    const selectedTracks = mapped.slice(0, 10);

    return NextResponse.json({
      countryCode,
      source, // "country", "continent", or "global"
      playlistId,
      tracks: selectedTracks,
      authType, // "user" or "client_credentials"
    });
  } catch (error) {
    console.error("Error fetching country tracks:", error);
    return NextResponse.json(
      { error: "internal_error", details: error.message },
      { status: 500 }
    );
  }
}
