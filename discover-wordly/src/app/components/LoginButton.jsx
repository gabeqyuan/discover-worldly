'use client';

import { useState, useEffect } from 'react';
import { getAuthUrl, exchangeCodeForToken } from '../utils/auth';

export default function LoginButton({ onLogin }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Note: Authorization code handling is now done in AuthContext
        // to avoid duplicate code exchanges which cause invalid_grant errors
    }, []);

    const handleLogin = () => {
        window.location.href = getAuthUrl();
    };

    if (!isClient) return null;

    return (
        <button
            onClick={handleLogin}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-montserrat font-semibold text-lg px-7 py-2.5 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
        > 
            Continue with Spotify
        </button>
    );
}
