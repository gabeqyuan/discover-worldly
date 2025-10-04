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
            className="bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
            Log in with Spotify
        </button>
    );
}
