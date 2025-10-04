'use client';

import SongCard from "./components/SongCard";
import MapRender from "./components/MapRender";
import LogoutButton from "./components/LogoutButton";
import LandingPage from "./components/LandingPage";
import { useAuth } from "./context/AuthContext";

const sampleTrack = {
  title: "Blinding Lights",
  artist: "The Weeknd",
  albumArt: "https://i.scdn.co/image/ab67616d0000b273d4f8e9b8d5a2e0f2b2c6d6d2",
  spotifyId: "0VjIjW4GlUZAMYd2vXMi3b",
};

export default function Home() {
  const { accessToken, profile, setAccessToken, handleLogout } = useAuth();

  return (
    <main className="min-h-screen relative overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 opacity-90">
        <MapRender />
        {/* Brighter overlay for better globe visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </div>

      {!accessToken && <LandingPage />}

      {accessToken && (
        <>
          <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm shadow-sm">
              {profile && (
                <>
                  {profile.images?.[0] && (
                    <img
                      src={profile.images[0].url}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border border-white/20"
                    />
                  )}
                  <div className="text-white text-sm leading-tight">
                    <div className="font-semibold">{profile.display_name || profile.id}</div>
                    <div className="text-white/70">{profile.email}</div>
                  </div>
                </>
              )}
            </div>
            <div className="scale-90 origin-right">
              <LogoutButton onLogout={handleLogout} />
            </div>
          </div>

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
            <SongCard
              track={sampleTrack}
              onLike={(t) => console.log("Liked", t)}
              onSkip={(t) => console.log("Skipped", t)}
            />
          </div>
        </>
      )}
    </main>
  );
}