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
        
        let mounted = true;
        
        // Build URL with optional user token for better access
        let url = `http://localhost:3000/api/spotify/country-tracks?countryCode=${country}`;
        if (accessToken && typeof(accessToken) == string) {
            console.log(accessToken);
            url += `?&userToken=${encodeURIComponent(accessToken)}`;
        } else {
            url += `?&userToken=${null}`;
        }

        try {
            fetch(url)
                .then((r) => r.json())
                .then((data) => {
                    if (!mounted) return;
                    console.debug("/api/spotify/country-tracks ->", data);
    
                    if (data && data.error) {
                        // fallback to sample tracks so UI remains usable
                        setTracks(SAMPLE_TRACKS);
                    } else {
                        setTracks(data.tracks && data.tracks.length ? data.tracks : []);
                    }
                });
        } catch (err) {
            console.error("Failed to fetch playlist", err);
            if (mounted) {
                setTracks(SAMPLE_TRACKS);
            }
        }

        return () => {
            mounted = false;
        };
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
                    <LogoutButton onLogout={handleLogout} />
                </div>
            )}
            

            {accessToken && isVoting && country (
            // {isVoting && country && (
                <section style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 380 }}>
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

            <MapRender onCountryChange={(c) => {
                setCountry(c);
                setIsVoting(true);
            }} />

            {isLoading && (
                <Loading/>
            )}
        </div>
    );
}
