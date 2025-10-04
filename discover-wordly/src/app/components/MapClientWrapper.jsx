"use client"
import { useState } from "react";
import MapRender from "./MapRender";
import SwipeDeck from "./SwipeDeck";

export default function MapClientWrapper() {
    const [country, setCountry] = useState(null);
    const [isVoting, setIsVoting] = useState(false);
    const likedSongs = [];
    const dislikedSongs = [];

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

    return (
        <div>
            <div style={{ width: "100%", maxWidth: 1000, minHeight: 240 }}>
                <MapRender onCountryChange={(c) => {
                    setCountry(c);
                    setIsVoting(true);
                }} />
            </div>

            {isVoting && <section style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 380 }}>
                <h1 style={{ marginBottom: 12, textAlign: "center" }}>Discover</h1>
                <SwipeDeck
                    tracks={sampleTracks}
                    onLike={(t) => {
                        console.log("Liked", t);
                        likedSongs.push(t);
                    }}
                    onSkip={(t) => {
                        console.log("Skipped", t);
                        dislikedSongs.push(t);
                    }}
                />
                <div style={{ textAlign: "center", marginTop: 8 }}>
                    {country ? <div>Selected country: {country.toUpperCase()}</div> : <div>No country selected</div>}
                </div>
                </div>
            </section>}
        </div>
    );
}
