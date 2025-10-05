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
    const [responseMsg, setResponseMsg] = useState("");
    const [likedSongs, setLikedSongs] = useState([]);
    const [dislikedSongs, setDislikedSongs] = useState([]);
    const [tracks, setTracks] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [playlistBuilding, setPlaylistBuilding] = useState(false);

    // Fetch country-specific tracks when country changes
    useEffect(() => {
        if (!country) return;
        
        console.log(`[WRAPPER] Country changed to: ${country}`);
        
        // Immediately clear tracks to force SwipeDeck remount
        setTracks([]);
        
        // Build URL with cache-busting timestamp
        let url = `/api/spotify/country-tracks?countryCode=${country}&t=${Date.now()}`;
        if (accessToken) {
            url += `&userToken=${encodeURIComponent(accessToken)}`;
        }

        console.log(`[WRAPPER] Fetching: ${url}`);

        fetch(url, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        })
            .then((r) => r.json())
            .then((data) => {
                console.log(`[WRAPPER] API Response for ${country}:`, data);

                if (data && data.error) {
                    console.error("API Error:", data.error);
                    if (data.playlistId) {
                        console.error(`Failed playlist ID: ${data.playlistId} (Country: ${data.countryCode}, Source: ${data.source})`);
                    }
                    if (data.status === 404) {
                        console.error("Playlist not found (404). The Spotify playlist ID may be outdated or removed.");
                    }
                    // fallback to sample tracks so UI remains usable
                    setTracks(null);
                } else {
                    const newTracks = data.tracks && data.tracks.length ? data.tracks : [];
                    console.log(`[WRAPPER] Setting ${newTracks.length} tracks for ${country}. First track:`, newTracks[0]);
                    setTracks(newTracks);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch playlist", err);
                setTracks(SAMPLE_TRACKS);
            });
    }, [country]);

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
                    <LogoutButton onLogout={() => {
                        handleLogout;
                        console.log("logging out");
                        isVoting(false);
                        setResponseMsg("");
                        setDislikedSongs([]);
                        setLikedSongs([]);
                    }} />
                </div>
            )}
            

            { accessToken && isVoting && tracks && tracks.length > 0 && (
                <section style={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: 380 }}>
                        <SwipeDeck
                            key={`${country}-${tracks[0]?.spotifyId || 'loading'}`} // Force remount with unique key
                            tracks={tracks}
                            onLike={(t) => {
                                console.log("Liked", t);
                                setLikedSongs((prev) => [...prev, t]);
                            }}
                            onSkip={(t) => {
                                console.log("Skipped", t);
                                setDislikedSongs((prev) => [...prev, t]);
                            }}
                            deckEmpty={(c) => {
                                setIsVoting(!c);
                                // Don't automatically show playlist builder when deck is empty
                                // User should click "Generate AI Playlist" button to trigger it
                            }}
                        />
                    </div>
                </section>
            )}

            {/* Show "Generate AI Playlist" button when voting is done and user has liked songs */}
            {!isVoting && !isLoading && !playlistBuilding && likedSongs.length > 0 && (
                <section style={{ 
                    width: "100%", 
                    height: "100vh", 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 10
                }}>
                    <div style={{
                        padding: "32px",
                        background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                        borderRadius: "20px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        textAlign: "center",
                        maxWidth: "400px",
                        width: "90%"
                    }}>
                        <h3 style={{
                            fontSize: "24px",
                            fontWeight: "600",
                            color: "#fff",
                            marginBottom: "16px",
                            margin: "0 0 16px 0"
                        }}>
                            🎵 Ready to Create Your Playlist?
                        </h3>
                        <p style={{
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.7)",
                            marginBottom: "24px",
                            margin: "0 0 24px 0"
                        }}>
                            You've liked {likedSongs.length} song{likedSongs.length === 1 ? '' : 's'}! 
                            Let our AI create a personalized playlist for you.
                        </p>
                        <button
                            onClick={() => setPlaylistBuilding(true)}
                            style={{
                                padding: "16px 32px",
                                backgroundColor: "#059669",
                                color: "white",
                                borderRadius: "12px",
                                fontWeight: "600",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                margin: "0 auto",
                                boxShadow: "0 6px 20px rgba(5, 150, 105, 0.4)",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#047857";
                                e.target.style.transform = "translateY(-2px) scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#059669";
                                e.target.style.transform = "translateY(0px) scale(1)";
                            }}
                        >
                            <span>🎵</span>
                            <span>Generate AI Playlist</span>
                        </button>
                    </div>
                </section>
            )}

            {isLoading && (
                <Loading/>
            )}

            {playlistBuilding && (
                <section style={{ 
                    width: "100%", 
                    height: "100vh", 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 10
                }}>
                    <PlaylistBuilder likedSongs={likedSongs} 
                    dislikedSongs={dislikedSongs} 
                    responseMsg={(m) => {
                        setResponseMsg(m);
                        setPlaylistBuilding(false);
                    }}
                    isGenerating={(l) => setIsLoading(l)}
                    />
                </section>
            )}

            <MapRender onCountryChange={(c) => {
                setCountry(c);
                setIsVoting(true);
            }} />
        </div>
    );
}
