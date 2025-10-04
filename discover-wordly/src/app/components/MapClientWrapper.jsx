"use client"
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import MapRender from "./MapRender";
import SwipeDeck from "./SwipeDeck";
import PlaylistBuilder from "./PlaylistBuilder";
import Loading from "./Loading";
import LandingPage from "./LandingPage";
import LogoutButton from "./LogoutButton";

export default function MapClientWrapper() {
    const { accessToken, profile, handleLogout } = useAuth();
    const [country, setCountry] = useState(null);
    const [isVoting, setIsVoting] = useState(false);
    const [responseMsg, setResponseMsg] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [dislikedSongs, setDislikedSongs] = useState([]);
    const [tracks, setTracks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // small sample track list to pass into the SwipeDeck for testing
    const SAMPLE_TRACKS = [
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

    // We'll fetch the playlist from our Next API route and populate the deck.
    // Switched to a known-public playlist (Today's Top Hits) for testing so the deck populates.
    const DEFAULT_PLAYLIST = "37i9dQZF1DXcBWIGoYBM5M"; // Today's Top Hits

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
        <div>
            {/* Show LandingPage overlay if not authenticated */}
            {!accessToken && <LandingPage />}
            
            {/* Show logout button when authenticated */}
            {accessToken && (
                <div style={{ 
                    position: "absolute", 
                    top: "20px", 
                    right: "20px", 
                    zIndex: 5,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    {profile?.images?.[0]?.url && (
                        <img 
                            src={profile.images[0].url} 
                            alt="Profile" 
                            style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                        />
                    )}
                    <span style={{ color: "white", fontWeight: "500" }}>
                        {profile?.display_name || 'User'}
                    </span>
                    <LogoutButton onLogout={handleLogout} />
                </div>
            )}

            <MapRender onCountryChange={(c) => {
                setCountry(c);
                setIsVoting(true);
            }} />
            
            {/* {!isVoting && (
                <PlaylistBuilder
                    likedSongs={likedSongs}
                    dislikedSongs={dislikedSongs}
                    responseMsg={(e) => 
                        setResponseMsg(e)
                    }
                />
            )} */}
            {/* <Loading /> */}

            {isVoting && (
                <section style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 380 }}>
                        <h1 style={{ marginBottom: 12, textAlign: "center" }}>Discover</h1>
                        <SwipeDeck
                            tracks={SAMPLE_TRACKS}
                            onLike={(t) => {
                                console.log("Liked", t);
                                setLikedSongs((prev) => [...prev, t]);
                            }}
                            onSkip={(t) => {
                                console.log("Skipped", t);
                                setDislikedSongs((prev) => [...prev, t]);
                            }}
                            deckEmpty={(c) => setIsVoting(!c)}
                        />
                        <div style={{ textAlign: "center", marginTop: 8 }}>
                            {country ? <div>Selected country: {country.toUpperCase()}</div> : <div>No country selected</div>}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
