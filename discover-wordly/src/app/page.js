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
          <div className="text-center mb-16">
            <div className="relative inline-block">
              <h1 className="text-9xl font-black text-white mb-4 tracking-tight leading-none">
                Discover Worldly
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 blur-2xl -z-10 rounded-full"></div>
            </div>
            <div className="flex justify-center items-center gap-3 mt-6">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
              <span className="text-white/60 text-xl tracking-wide">CONNECT • EXPLORE • DISCOVER</span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
            </div>
          </div>
          
          <div className="max-w-2xl w-full px-12 py-12 backdrop-blur-xl bg-black/20 border border-white/10 rounded-3xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
            <div className="space-y-10">
              <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-semibold text-center">
                Your Musical Journey Around the World
              </p>
              <ul className="text-xl text-white/90 space-y-6">
                <li className="flex items-center transform hover:translate-x-2 transition-transform duration-200">
                  <span className="mr-4 text-2xl">🌍</span> Explore music from every corner of the Earth
                </li>
                <li className="flex items-center transform hover:translate-x-2 transition-transform duration-200">
                  <span className="mr-4 text-2xl">🎵</span> Find hidden gems from local artists
                </li>
                <li className="flex items-center transform hover:translate-x-2 transition-transform duration-200">
                  <span className="mr-4 text-2xl">✨</span> Create your own global playlist
                </li>
              </ul>
              <div className="flex justify-center mt-8">
                <div className="transform hover:scale-105 hover:rotate-1 transition-all duration-300">
                  <LoginButton onLogin={setAccessToken} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {accessToken && (
        <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3">
          <div className="flex items-center gap-4 py-2.5 px-4 rounded-xl backdrop-blur-md bg-black/20 border border-white/10 shadow-lg hover:bg-black/30 transition-colors duration-200">
            {profile && (
              <>
                {profile.images?.[0] && (
                  <img 
                    src={profile.images[0].url} 
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-white/30 shadow-lg"
                  />
                )}
                <div className="text-white">
                  <div className="font-semibold text-sm">{profile.display_name || profile.id}</div>
                  <div className="text-xs text-white/75">{profile.email}</div>
                </div>
              </>
            )}
          </div>
          
          <div className="scale-90 origin-right">
            <LogoutButton onLogout={() => { 
              setAccessToken(null);
              setProfile(null);
            }} />
          </div>
        </div>
      )}

      {accessToken && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
          <SongCard
            track={sampleTrack}
            onLike={(t) => console.log("Liked", t)}
            onSkip={(t) => console.log("Skipped", t)}
          />
        </div>
      )}
    </main>
  );
}
