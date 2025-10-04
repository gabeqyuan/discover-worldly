"use client";

import MapRender from "./components/MapRender";
import SwipeDeck from "./components/SwipeDeck";

// small sample track list to pass into the SwipeDeck for testing
const sampleTracks = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273d4f8e9b8d5a2e0f2b2c6d6d2",
    spotifyId: "0VjIjW4GlUZAMYd2vXMi3b",
  },
  {
    id: "2",
    title: "Levitating",
    artist: "Dua Lipa",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273c7b7f2f9b4f3b8d9a2a4b5c6",
    spotifyId: "463CkQjx2Zk1yXoBuierM9",
  },
];

export default function Home() {
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
          <SwipeDeck
            tracks={sampleTracks}
            onLike={(t) => console.log("Liked", t)}
            onSkip={(t) => console.log("Skipped", t)}
          />
        </div>
      </section>
    </main>
  );
}
