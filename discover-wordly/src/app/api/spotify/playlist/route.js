import { NextResponse } from "next/server";

// GET /api/spotify/playlist?playlistId=...&market=US&userToken=...
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let playlistId = searchParams.get("playlistId") || "37i9dQZF1DXcBWIGoYBM5M"; // fallback: Today’s Top Hits
  const market = (searchParams.get("market") || "US").toUpperCase();
  const userToken = searchParams.get("userToken");

  // Extract playlistId from different formats
  if (playlistId) {
    const urlMatch = playlistId.match(/playlist\/([a-zA-Z0-9]+)(?:\?|$)/);
    const spotifyUriMatch = playlistId.match(/spotify:playlist:([a-zA-Z0-9]+)/);
    if (urlMatch?.[1]) playlistId = urlMatch[1];
    else if (spotifyUriMatch?.[1]) playlistId = spotifyUriMatch[1];
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET" },
      { status: 500 }
    );
  }

  // 🔑 Get access token: prefer user token, fall back to Client Credentials
  let accessToken = userToken;
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

  // 🔍 First, check if playlist metadata is accessible in requested market
  const playlistRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}?market=${encodeURIComponent(market)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!playlistRes.ok) {
    const text = await playlistRes.text();
    return NextResponse.json(
      {
        error:
          playlistRes.status === 404
            ? "playlist_not_found_or_private"
            : "playlist_error",
        status: playlistRes.status,
        details: text,
      },
      { status: playlistRes.status }
    );
  }

  const playlistMeta = await playlistRes.json();

  // 🎵 Now fetch tracks in requested market
  const tracksRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&market=${encodeURIComponent(
      market
    )}`,
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

  return NextResponse.json({
    playlist: {
      id: playlistMeta.id,
      name: playlistMeta.name,
      owner: playlistMeta.owner?.display_name || "Unknown",
      public: playlistMeta.public,
    },
    tracks: mapped,
    market,
    authType: userToken ? "user" : "client_credentials",
  });
}
