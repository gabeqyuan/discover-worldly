// Test script to verify Spotify playlist IDs work
// Run with: node test-spotify-playlists.js

const playlistsToTest = {
  US: "37i9dQZEVXbLRQDuF5jeBp",
  JP: "37i9dQZEVXbKXQ4mDTEBXq",
  BR: "37i9dQZEVXbMXbN3EUUhlg",
  GB: "37i9dQZEVXbLnolsZ8PSNw",
};

async function testPlaylist(countryCode, playlistId) {
  // You need to set these in .env.local
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
    return;
  }

  try {
    // Get token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const { access_token } = await tokenRes.json();

    // Get playlist
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!playlistRes.ok) {
      console.log(`❌ ${countryCode}: Playlist not found or private`);
      return;
    }

    const playlist = await playlistRes.json();
    console.log(`✅ ${countryCode}: "${playlist.name}" - ${playlist.tracks.total} tracks`);
  } catch (error) {
    console.error(`❌ ${countryCode}: Error -`, error.message);
  }
}

async function testAll() {
  console.log("🎵 Testing Spotify Playlists...\n");
  
  for (const [code, id] of Object.entries(playlistsToTest)) {
    await testPlaylist(code, id);
  }
}

testAll();
