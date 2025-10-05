'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PlaylistBuilder({ likedSongs, dislikedSongs, responseMsg, isGenerating }) {
    console.log('building playlist');
  const { accessToken, profile } = useAuth();

  const generateAndCreatePlaylist = async () => {
    if (!accessToken || !profile) {
      setError('You must be logged in to create a playlist');
      return;
    }

    if (likedSongs.length === 0) {
      setError('Please like at least one song to generate a playlist');
      return;
    }

    isGenerating(true);

    try {
      // Step 1: Call the generate-playlist API
      const generateResponse = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likedSongs: likedSongs.map(song => `${song.title} by ${song.artist}`),
          dislikedSongs: dislikedSongs.map(song => `${song.title} by ${song.artist}`),
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate playlist recommendations');
      }

      const { recommendations } = await generateResponse.json();
      
      // Parse the recommendations (assuming it returns a JSON-style list)
      let songList;
      try {
        songList = JSON.parse(recommendations);
      } catch {
        // If parsing fails, try to extract song names from text
        const match = recommendations.match(/\[(.*)\]/s);
        if (match) {
          songList = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
        } else {
          throw new Error('Could not parse recommendations');
        }
      }

      // Step 2: Search for each song on Spotify to get track URIs
      const trackUris = [];
      for (const songName of songList) {
        try {
          const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.tracks.items.length > 0) {
              trackUris.push(searchData.tracks.items[0].uri);
            }
          }
        } catch (err) {
          console.warn(`Could not find track: ${songName}`, err);
        }
      }

      if (trackUris.length === 0) {
        throw new Error('No tracks could be found on Spotify');
      }


      // Step 3: Create a new playlist in the user's account
      const createPlaylistResponse = await fetch(
        `https://api.spotify.com/v1/users/${profile.id}/playlists`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `Discover ${countryName} - ${new Date().toLocaleDateString()}`,
            description: `Generated playlist based on your music preferences from ${countryName}`,
            public: false,
          }),
        }
      );

      if (!createPlaylistResponse.ok) {
        const errorData = await createPlaylistResponse.json();
        throw new Error(errorData.error?.message || 'Failed to create playlist');
      }

      const playlist = await createPlaylistResponse.json();

      // Step 4: Add tracks to the playlist
      
      const addTracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: trackUris,
          }),
        }
      );

      if (!addTracksResponse.ok) {
        throw new Error('Failed to add tracks to playlist');
      }

      setPlaylistUrl(playlist.external_urls.spotify);
      
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError(err.message || 'An error occurred while creating the playlist');
    } finally {
      isGenerating(false);
    }
  };

  return (
    <></>
  )
}