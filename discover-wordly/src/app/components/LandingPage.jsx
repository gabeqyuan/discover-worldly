'use client';

import { useAuth } from '../context/AuthContext';
import LoginButton from './LoginButton';

export default function LandingPage() {
  const { setAccessToken, authError } = useAuth();
  
  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-center text-center backdrop-blur-sm">
      <h1 className="text-[6rem] leading-[1.1] font-black text-white tracking-tight font-sans mb-3 drop-shadow-md">
        Discover the World<br />Through Music
      </h1>
      <p className="text-white/80 text-2xl font-medium mb-5 font-montserrat">
        Global sounds, local vibes — all in one place.
      </p>
      
      {authError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-5 max-w-md mx-auto">
          <p className="text-red-200 text-sm font-medium mb-2">Authentication Error:</p>
          <p className="text-red-100 text-sm">{authError}</p>
          {authError.includes('Development Mode') && (
            <p className="text-red-100 text-xs mt-2 italic">
              The app is currently in development. Public access will be available soon!
            </p>
          )}
        </div>
      )}
      
      <div className="mt-1">
        <LoginButton onLogin={setAccessToken} />
      </div>
    </div>
  );
}