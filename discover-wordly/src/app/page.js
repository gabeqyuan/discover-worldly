'use client';

import { useState, useEffect } from "react";
import SongCard from "./components/SongCard";
import MapRender from "./components/MapRender";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import { getSpotifyProfile } from "./utils/auth";

const sampleTrack = {
  title: "Blinding Lights",
  artist: "The Weeknd",
  albumArt: "https://i.scdn.co/image/ab67616d0000b273d4f8e9b8d5a2e0f2b2c6d6d2",
  spotifyId: "0VjIjW4GlUZAMYd2vXMi3b",
};

export default function Home() {
  const [accessToken, setAccessToken] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('access_token');
    if (token) {
      setAccessToken(token);
      getSpotifyProfile(token)
        .then(data => setProfile(data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setAccessToken(null);
        });
    }
  }, []);

  if (!isClient) return null; // prevent SSR flash

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapRender />
      </div>

      {!accessToken && (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center">
          <div className="text-center mb-12">
            <h1 className="text-8xl font-bold text-white mb-4 tracking-tight leading-none">
              Discover Worldly
            </h1>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-white/0 via-white to-white/0"></div>
          </div>
          
          <div 
            className="max-w-2xl w-full px-12 py-10 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            }}
          >
            <div className="space-y-8">
              <p className="text-2xl text-white/90 text-center">
                Your Musical Journey Around the World
              </p>
              <ul className="text-lg text-white/80 space-y-3">
                <li className="flex items-center">
                  <span className="mr-3">🌍</span> Explore music from every corner of the Earth
                </li>
                <li className="flex items-center">
                  <span className="mr-3">🎵</span> Find hidden gems from local artists
                </li>
                <li className="flex items-center">
                  <span className="mr-3">✨</span> Create your own global playlist
                </li>
              </ul>
              <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
                <LoginButton onLogin={setAccessToken} />
              </div>
            </div>
          </div>
        </div>
      )}

      {accessToken && (
        <>
          <div className="fixed top-6 right-24 z-50">
            <div 
              className="flex items-center gap-6 p-4 rounded-2xl backdrop-blur-lg bg-white/5 border border-white/20 shadow-lg"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              }}
            >
              {profile && (
                <div className="flex items-center gap-4">
                  {profile.images?.[0] && (
                    <img 
                      src={profile.images[0].url} 
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg"
                    />
                  )}
                  <div className="text-white">
                    <div className="font-semibold text-lg">{profile.display_name || profile.id}</div>
                    <div className="text-sm text-white/75">{profile.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="fixed top-6 right-6 z-50">
            <LogoutButton onLogout={() => { 
              setAccessToken(null);
              setProfile(null);
            }} />
          </div>
        </>
      )}

      {accessToken && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div 
            className="backdrop-blur-lg bg-white/5 border border-white/20 rounded-2xl p-4 shadow-lg"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            }}
          >
            <SongCard
              track={sampleTrack}
              onLike={(t) => console.log("Liked", t)}
              onSkip={(t) => console.log("Skipped", t)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
