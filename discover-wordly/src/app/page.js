"use client";

import SongCard from "./components/SongCard";
import MapRender from "./components/MapRender";

const sampleTrack = {
  title: "Blinding Lights",
  artist: "The Weeknd",
  albumArt: "https://i.scdn.co/image/ab67616d0000b273d4f8e9b8d5a2e0f2b2c6d6d2",
  spotifyId: "0VjIjW4GlUZAMYd2vXMi3b",
};

export default function Home() {
  return (
    <>
      <MapRender />
      <main style={{ padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>Test SongCard</h1>
        <SongCard
          track={sampleTrack}
          onLike={(t) => console.log("Liked", t)}
          onSkip={(t) => console.log("Skipped", t)}
        />
      </main>
    </>
  )
}
