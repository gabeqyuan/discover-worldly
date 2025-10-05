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
                                setLoading(true);
                                setPlaylistBuilding(true);
                                setTimeout(() => {
                                    setLoading(false);
                                }, 5000);
                            }}
                        />
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
