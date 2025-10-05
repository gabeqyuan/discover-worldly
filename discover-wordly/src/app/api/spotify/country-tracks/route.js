import { NextResponse } from "next/server";

// Map country codes to full country names for better search results
const COUNTRY_NAMES = {
  // North America
  US: "United States", CA: "Canada", MX: "Mexico",
  GT: "Guatemala", HN: "Honduras", SV: "El Salvador", NI: "Nicaragua",
  CR: "Costa Rica", PA: "Panama", BZ: "Belize", CU: "Cuba", JM: "Jamaica",
  HT: "Haiti", DO: "Dominican Republic",
  
  // South America
  BR: "Brazil", AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru",
  VE: "Venezuela", EC: "Ecuador", BO: "Bolivia", PY: "Paraguay", UY: "Uruguay",
  GY: "Guyana", SR: "Suriname",
  
  // Europe
  GB: "United Kingdom", DE: "Germany", FR: "France", ES: "Spain", IT: "Italy",
  RU: "Russia", PL: "Poland", NL: "Netherlands", SE: "Sweden", NO: "Norway",
  DK: "Denmark", FI: "Finland", PT: "Portugal", GR: "Greece", AT: "Austria",
  BE: "Belgium", CH: "Switzerland", CZ: "Czech Republic", HU: "Hungary",
  IE: "Ireland", HR: "Croatia", BG: "Bulgaria", RO: "Romania", UA: "Ukraine",
  RS: "Serbia", SK: "Slovakia", SI: "Slovenia", LT: "Lithuania", LV: "Latvia",
  EE: "Estonia", IS: "Iceland", LU: "Luxembourg", MT: "Malta",
  
  // Asia
  JP: "Japan", KR: "South Korea", CN: "China", IN: "India", TH: "Thailand",
  ID: "Indonesia", PH: "Philippines", MY: "Malaysia", SG: "Singapore",
  VN: "Vietnam", PK: "Pakistan", BD: "Bangladesh", MM: "Myanmar", KH: "Cambodia",
  LA: "Laos", NP: "Nepal", LK: "Sri Lanka", AF: "Afghanistan", MN: "Mongolia",
  KZ: "Kazakhstan",
  
  // Middle East
  TR: "Turkey", SA: "Saudi Arabia", AE: "United Arab Emirates", IL: "Israel",
  IQ: "Iraq", IR: "Iran", SY: "Syria", JO: "Jordan", LB: "Lebanon",
  YE: "Yemen", OM: "Oman", KW: "Kuwait", QA: "Qatar", BH: "Bahrain",
  
  // Africa
  ZA: "South Africa", NG: "Nigeria", EG: "Egypt", KE: "Kenya", GH: "Ghana",
  TZ: "Tanzania", UG: "Uganda", ET: "Ethiopia", MA: "Morocco", DZ: "Algeria",
  TN: "Tunisia", LY: "Libya", SD: "Sudan", AO: "Angola", MZ: "Mozambique",
  ZW: "Zimbabwe", CI: "Ivory Coast", CM: "Cameroon", SN: "Senegal", ML: "Mali",
  NE: "Niger", BF: "Burkina Faso", TD: "Chad", BJ: "Benin", RW: "Rwanda",
  SO: "Somalia", MW: "Malawi", ZM: "Zambia",
  
  // Oceania
  AU: "Australia", NZ: "New Zealand", FJ: "Fiji", PG: "Papua New Guinea",
  NC: "New Caledonia", PF: "French Polynesia", WS: "Samoa", TO: "Tonga",
};

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
  NE: "Africa", BF: "Africa", TD: "Africa", BJ: "Africa",
  RW: "Africa", SO: "Africa", MW: "Africa", ZM: "Africa",
  
  // Oceania
  AU: "Oceania", NZ: "Oceania", FJ: "Oceania", PG: "Oceania",
  NC: "Oceania", PF: "Oceania", WS: "Oceania", TO: "Oceania",
};

// GET /api/spotify/country-tracks?countryCode=US&userToken=...
export async function GET(req) {
  console.log("[ROUTE] country-tracks GET function called");
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get("countryCode")?.toUpperCase();
  const userToken = searchParams.get("userToken");
  console.log(`[ROUTE] countryCode=${countryCode}, userToken=${userToken ? 'provided' : 'none'}`);

  if (!countryCode) {
    return NextResponse.json(
      { error: "Missing countryCode parameter" },
      { status: 400 }
    );
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
    let accessToken = userToken;

    // Get access token if not provided
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

    // Search for community playlists (NOT Spotify-owned)
    let playlistId = null;
    let source = "community";
    
    // Get full country name for better search results
    const countryName = COUNTRY_NAMES[countryCode] || countryCode;
    console.log(`[COUNTRY-TRACKS] Searching for community playlists in ${countryName} (${countryCode})`);
    
    try {
      // Search using full country name for better results
      const searchQueries = [
        `top hits ${countryName}`,
        `popular ${countryName}`,
        `best of ${countryName}`,
        `${countryName} music`,
        `top ${countryName}`
      ];
      
      for (const query of searchQueries) {
        console.log(`[SEARCH] Trying query: "${query}"`);
        const searchRes = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&market=${countryCode}&limit=50`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log(`[SEARCH] Response status: ${searchRes.status}`);

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const allPlaylists = searchData.playlists?.items || [];
          
          // Filter for community playlists only (NOT Spotify-owned)
          const communityPlaylists = allPlaylists.filter(p => 
            p && p.owner?.id !== "spotify" && p.tracks?.total > 10
          );

          console.log(`[SEARCH] Found ${allPlaylists.length} total, ${communityPlaylists.length} community playlists`);
          
          // Try first community playlist and get 7 random tracks
          for (const playlist of communityPlaylists.slice(0, 1)) {
            console.log(`[TEST] "${playlist.name}" by ${playlist.owner.display_name || playlist.owner.id} (${playlist.tracks?.total} tracks)`);
            
            // Get 50 tracks and we'll randomly pick 7
            const tracksRes = await fetch(
              `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=50&market=${countryCode}`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            if (tracksRes.ok) {
              const tracksData = await tracksRes.json();
              const items = tracksData.items || [];
              console.log(`[SUCCESS] ✓ Got ${items.length} tracks from "${playlist.name}"`);
              
              if (items.length > 0) {
                // Transform tracks to expected format
                const mapped = items
                  .map((item) => {
                    const t = item.track || {};
                    return {
                      id: t.id,
                      title: t.name,
                      artist: t.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
                      albumArt: t.album?.images?.[0]?.url || "",
                      spotifyId: t.id,
                    };
                  })
                  .filter((t) => !!t.spotifyId);

                console.log(`[FORMAT] Mapped ${mapped.length} valid tracks`);
                
                // Shuffle and take 7 random tracks
                const shuffled = mapped.sort(() => 0.5 - Math.random());
                const selectedTracks = shuffled.slice(0, 7);
                
                console.log(`[COMPLETE] Returning ${selectedTracks.length} random tracks`);
                
                return NextResponse.json({
                  tracks: selectedTracks,
                  country: countryCode,
                  source: "community",
                  playlistName: playlist.name,
                  playlistOwner: playlist.owner.display_name || playlist.owner.id,
                  message: `${selectedTracks.length} tracks from community playlist: ${playlist.name}`
                }, {
                  headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                  }
                });
              }
            } else {
              console.log(`[TEST] ✗ Failed with status ${tracksRes.status}`);
            }
          }
        }
      }
      
      console.log(`[WARNING] No accessible community playlists found after trying all search queries`);
    } catch (searchError) {
      console.error("[ERROR] Search failed:", searchError);
    }

    // Fallback to hardcoded mappings if Browse didn't work
    if (!playlistId) {
      playlistId = COUNTRY_PLAYLISTS[countryCode];
      source = "country";
    }

    if (!playlistId) {
      const continent = COUNTRY_TO_CONTINENT[countryCode];
      if (continent) {
        playlistId = CONTINENT_PLAYLISTS[continent];
        source = "continent";
      }
    }

    if (!playlistId) {
      playlistId = "37vVbInEzfnXJQjVuU7bAZ";
      source = "global";
    }

    // Fetch playlist tracks with market filter
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&market=${countryCode}`,
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
    const selectedTracks = shuffled.slice(0, 10);

    return NextResponse.json({
      countryCode,
      source, // "country", "continent", or "global"
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
