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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trackSource, setTrackSource] = useState(null); // "country", "continent", or "global"

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

    // Fetch country-specific tracks when country changes
    useEffect(() => {
        if (!country) return;
        
        let mounted = true;
        setLoading(true);
        setError(null);
        
        fetch(`/api/spotify/country-tracks?countryCode=${country}`)
            .then((r) => r.json())
            .then((data) => {
                if (!mounted) return;
                console.debug("/api/spotify/country-tracks ->", data);

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
    }, [country]);

    return (
        <div>
            {/* Show LandingPage overlay if not authenticated */}
            {/* {!accessToken && <LandingPage />} */}
            
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

            {accessToken && isVoting && (
                <section style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 380 }}>
                        <h1 style={{ marginBottom: 12, textAlign: "center" }}>Discover</h1>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "white" }}>
                                <div style={{ fontSize: 24, marginBottom: 12 }}>🎵</div>
                                <div>Loading tracks...</div>
                            </div>
                        ) : error ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
                                <div style={{ fontSize: 24, marginBottom: 12 }}>⚠️</div>
                                <div>Error: {error}</div>
                                <div style={{ fontSize: 14, marginTop: 8, color: "#999" }}>Using sample tracks</div>
                            </div>
                        ) : null}
                        <SwipeDeck
                            tracks={tracks || SAMPLE_TRACKS}
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
                        <div style={{ textAlign: "center", marginTop: 16, color: "white" }}>
                            {country ? (
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                                        {country.toUpperCase()}
                                    </div>
                                    {trackSource && trackSource !== "error" && (
                                        <div style={{ fontSize: 13, opacity: 0.7 }}>
                                            {trackSource === "country" && "🎵 Top songs from this country"}
                                            {trackSource === "continent" && "🌍 Top songs from this continent"}
                                            {trackSource === "global" && "🌐 Global top songs"}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ opacity: 0.7 }}>Click a country on the map</div>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
