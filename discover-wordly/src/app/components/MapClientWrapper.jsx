"use client"
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import MapRender from "./MapRender";
import SwipeDeck from "./SwipeDeck";
// import PlaylistBuilder from "./PlaylistBuilder";
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
    const [isLoading, setLoading] = useState(false);
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
                    setTracks(SAMPLE_TRACKS);
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
            

            { isVoting && tracks && tracks.length > 0 && (
                <section style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
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

            <MapRender onCountryChange={(c) => {
                setCountry(c);
                setIsVoting(true);
            }} />
        </div>
    );
}
