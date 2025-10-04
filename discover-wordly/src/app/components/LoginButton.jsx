'use client';

import { useState, useEffect } from 'react';
import { getAuthUrl, exchangeCodeForToken } from '../utils/auth';

export default function LoginButton({ onLogin }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            exchangeCodeForToken(code)
                .then(data => {
                    if (data && data.access_token) {
                        localStorage.setItem('access_token', data.access_token);
                        localStorage.setItem('refresh_token', data.refresh_token);
                        onLogin(data.access_token);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else {
                        console.error('Token exchange failed', data);
                    }
                })
                .catch(err => console.error('Failed to fetch token:', err));
        }
    }, [onLogin]);

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
