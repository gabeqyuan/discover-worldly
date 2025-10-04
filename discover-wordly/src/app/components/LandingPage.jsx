'use client';

import { useAuth } from '../context/AuthContext';
import LoginButton from './LoginButton';

export default function LandingPage() {
  const { setAccessToken } = useAuth();
  
  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-center text-center backdrop-blur-sm">
      <h1 className="text-[6rem] leading-[1.1] font-black text-white tracking-tight font-sans mb-3 drop-shadow-md">
        Discover the World<br />Through Music
      </h1>
      <p className="text-white/80 text-2xl font-medium mb-5 font-montserrat">
        Global sounds, local vibes — all in one place.
      </p>
      <div className="mt-1">
        <LoginButton onLogin={setAccessToken} />
      </div>
    </div>
  );
}