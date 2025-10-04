'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { exchangeCodeForToken, getSpotifyProfile } from '../utils/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Check for auth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleAuthCallback(code);
    } else {
      // Check for existing token
      const token = localStorage.getItem("access_token");
      if (token) {
        setAccessToken(token);
        fetchProfile(token);
      }
    }
  }, []);

  const handleAuthCallback = async (code) => {
    try {
      const data = await exchangeCodeForToken(code);
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setAccessToken(data.access_token);
        fetchProfile(data.access_token);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Auth callback failed:', error);
      handleLogout();
    }
  };

  const fetchProfile = async (token) => {
    try {
      const data = await getSpotifyProfile(token);
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAccessToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        accessToken, 
        profile, 
        setAccessToken, 
        handleLogout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}