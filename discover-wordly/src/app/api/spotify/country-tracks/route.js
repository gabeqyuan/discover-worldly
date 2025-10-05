import { NextResponse } from "next/server";

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
  NE: "Africa", BF: "Africa", TD: "Africa", BJ: "Africa",
  RW: "Africa", SO: "Africa", MW: "Africa", ZM: "Africa",
  
  // Oceania
  AU: "Oceania", NZ: "Oceania", FJ: "Oceania", PG: "Oceania",
  NC: "Oceania", PF: "Oceania", WS: "Oceania", TO: "Oceania",
};

const TOP_SONGS = {
  US: "2d4lZtxOjli4D73GfmGCFA",
  IN: "3fqHSMwCe1j3Z91tnXmuHQ",
  CN: "0n9pUnDvJEIavvDfGnJqJl",
  ID: "68CsCvj1yJdzGv8Fprl7k5",
  PK: "6BymTJF70MjeaIjEbZREfc",
  NG: "6e1PM4vAlhabqCta00ebSg",
  BR: "596Uy4sdomPqDeihQbEojV",
  BD: "51rX1gOpr4X79v0Y3hQapG",
  RU: "6qv7CRaZr9nJaamM8Xtrv6",
  MX: "4GYEN4ZTL60fZIWyVw0uRC",
  ET: "7dM4QqLCVFDWKNHlOtI1fB",
  JP: "4Bsknjekv8HNfUF57ELNot",
  PH: "3pKv7e4IED9iF7OKOogsaB",
  EG: "6kkFwZUEpEmE9NKjmawsNE",
  VN: "6tU1cBMEBs16AcqqzvNXar",
  CD: "1QMQPceQE2evCvFZBEhTKf",
  IR: "6t7RxmqHXhqgGjqcU8A5zD",
  TR: "2ShGT3Q36INUC5cRyCMW8d",
  DE: "0KwsbLDSEy7A5P9xHn1qGu",
  TH: "5ITXdARLNLeuN5JmT2eCwb",
  GB: "2hOekbRxaOqrqBWqlY5gaB",
  FR: "2IgPkhcHbgQ4s4PdCxljAx",
  IT: "6YY4TwrvBGdnLp1XQEfhTJ",
  TZ: "5cmulzRnTs9d1Nlh3XFsKA",
  ZA: "36iYF0nny5q8EpNuEVWZZF",
  MM: "4J8TwKa2p6irrJ1PM4hvNg",
  KE: "2Z26gAgauS8LNM0a6mgxob",
  KR: "4KJCOntsptolLYjUhTcNjv",
  CO: "5bULIS1NivSjkOasIHWdVS",

  ES: "",
  UG: "",
  AR: "",
  DZ: "",
  SD: "",
  UA: "",
  IQ: "",
  AF: "",
  PL: "",
  CA: "",
  MA: "",
  SA: "",
  UZ: "",
  PE: "",
  AO: "",
  MY: "",
  MZ: "",
  GH: "",
  YE: "",
  NP: "",
  VE: ""
}

// GET /api/spotify/country-tracks?countryCode=US&userToken=...
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get("countryCode")?.toUpperCase();
  const userToken = searchParams.get("userToken");
  // console.log(searchParams);

  if (!countryCode) {
    return NextResponse.json(
      { error: "Missing countryCode parameter" },
      { status: 400 }
    );
  }

  // Determine which playlist to use
  let playlistId = TOP_SONGS[countryCode];

  // If no country-specific playlist, fall back to continent
  if (!playlistId) {
    const continent = COUNTRY_TO_CONTINENT[countryCode];
    if (continent) {
      playlistId = CONTINENT_PLAYLISTS[continent];
    }
  }

  // If still no playlist, use global top 50
  if (!playlistId) {
    playlistId = "37vVbInEzfnXJQjVuU7bAZ";
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

    // 🎵 Fetch playlist tracks
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

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

    // Get 10 random tracks
    const shuffled = mapped.sort(() => 0.5 - Math.random());
    const selectedTracks = shuffled.slice(0, 6);

    return NextResponse.json({
      countryCode,
      playlistId,
      tracks: selectedTracks,
      authType: userToken ? "user" : "client_credentials", // Which auth was used
    });
  } catch (error) {
    console.error("Error fetching country tracks:", error);
    return NextResponse.json(
      { error: "internal_error", details: error.message },
      { status: 500 }
    );
  }
}
