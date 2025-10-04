"use client";

import MapRender from "./components/MapRender";
import SwipeDeck from "./components/SwipeDeck";
import { useEffect, useState } from "react";

// Fallback sample tracks shown when the Spotify API is unavailable (local dev without env vars)
const SAMPLE_TRACKS = [
  {
    id: "s1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273d4f8e9b8d5a2e0f2b2c6d6d2",
    spotifyId: "0VjIjW4GlUZAMYd2vXMi3b",
  },
  {
    id: "s2",
    title: "Levitating",
    artist: "Dua Lipa",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273c7b7f2f9b4f3b8d9a2a4b5c6",
    spotifyId: "463CkQjx2Zk1yXoBuierM9",
  },
];

// We'll fetch the playlist from our Next API route and populate the deck.
// Switched to a known-public playlist (Today's Top Hits) for testing so the deck populates.
const DEFAULT_PLAYLIST = "37i9dQZF1DXcBWIGoYBM5M"; // Today's Top Hits

export default function Home() {
  const [tracks, setTracks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch(`/api/spotify/playlist?playlistId=${DEFAULT_PLAYLIST}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        // log full response for debugging in dev
        console.debug("/api/spotify/playlist ->", data);

        if (data && data.error) {
          // API returned an error (likely missing env vars or token problem)
          setError(data.error + (data.details ? `: ${data.details}` : ""));
          // fallback to sample tracks so UI remains usable
          setTracks(SAMPLE_TRACKS);
        } else {
          setTracks(data.tracks && data.tracks.length ? data.tracks : []);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch playlist", err);
        if (mounted) {
          setError(String(err));
          setTracks(SAMPLE_TRACKS);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    // Single-column, centered layout. Content will be stacked vertically and centered.
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px",
        justifyContent: "flex-start", // ensure content starts nearer the top
      }}
    >
      {/* Map centered with a max width so it doesn't stretch too wide */}
      <div style={{ width: "100%", maxWidth: 1000, minHeight: 240 }}>
        <MapRender />
      </div>

      {/* Center the SwipeDeck below the map */}
      <section style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 380 }}>
          <h1 style={{ marginBottom: 12, textAlign: "center" }}>Discover</h1>

          {/* Visible error banner when the API returned an error (helps debug env / token issues) */}
          {error ? (
            <div style={{ marginBottom: 12, padding: 10, background: "#ffe6e6", color: "#800", borderRadius: 6 }}>
              <strong>API error:</strong> {String(error)}
            </div>
          ) : null}

          {/* Small badge showing how many tracks were loaded (useful to confirm API result) */}
          {!loading && tracks ? (
            <div style={{ marginBottom: 8, textAlign: "center", color: "#666" }}>Loaded tracks: {tracks.length}</div>
          ) : null}

          {loading ? (
            <div style={{ textAlign: "center", color: "#888" }}>Loading tracks…</div>
          ) : (
            <SwipeDeck
              tracks={tracks}
              onLike={(t) => console.log("Liked", t)}
              onSkip={(t) => console.log("Skipped", t)}
            />
          )}
        </div>
      </section>
    </main>
  );
}
