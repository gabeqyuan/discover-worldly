import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, description, tracks, userToken } = await req.json();
    
    console.log('[CREATE-PLAYLIST-API] Request received:', { 
      name, 
      description, 
      tracksCount: tracks?.length, 
      hasUserToken: !!userToken 
    });

    if (!userToken) {
      console.log('[CREATE-PLAYLIST-API] No user token provided');
      return NextResponse.json(
        { error: "User token is required" },
        { status: 401 }
      );
    }

    if (!name || !tracks || tracks.length === 0) {
      console.log('[CREATE-PLAYLIST-API] Missing name or tracks:', { name, tracksCount: tracks?.length });
      return NextResponse.json(
        { error: "Playlist name and tracks are required" },
        { status: 400 }
      );
    }

    // Get user profile to get user ID
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (!profileRes.ok) {
      return NextResponse.json(
        { error: "Failed to get user profile" },
        { status: 401 }
      );
    }

    const profile = await profileRes.json();
    const userId = profile.id;

    // Create the playlist
    const createPlaylistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: description || `Generated playlist based on your music taste • Created by Discover Worldly`,
        public: false
      })
    });

    if (!createPlaylistRes.ok) {
      const errorData = await createPlaylistRes.json();
      return NextResponse.json(
        { error: "Failed to create playlist", details: errorData },
        { status: createPlaylistRes.status }
      );
    }

    const playlist = await createPlaylistRes.json();

    // Add tracks to the playlist (only tracks that have Spotify IDs)
    const trackUris = tracks
      .filter(track => track.spotifyId)
      .map(track => `spotify:track:${track.spotifyId}`);

    if (trackUris.length > 0) {
      const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: trackUris
        })
      });

      if (!addTracksRes.ok) {
        const errorData = await addTracksRes.json();
        console.warn('Failed to add some tracks to playlist:', errorData);
        // Don't fail the whole request, just log the warning
      }
    }

    return NextResponse.json({
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        url: playlist.external_urls.spotify,
        tracksAdded: trackUris.length,
        totalTracks: tracks.length
      }
    });

  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: "Failed to create playlist", details: error.message },
      { status: 500 }
    );
  }
}