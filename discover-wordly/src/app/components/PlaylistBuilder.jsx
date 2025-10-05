"use client";

import React, { useState, useEffect } from "react";

// Add animations if not already present
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('playlist-builder-animations');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'playlist-builder-animations';
    style.textContent = `
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

export default function PlaylistBuilder({ 
  likedSongs = [], 
  dislikedSongs = [], 
  countryCode,
  userToken,
  onPlaylistCreated,
  onBackToMap
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePlaylist = async () => {
    if (!likedSongs || likedSongs.length === 0) {
      setError("You need to like at least one song to generate a playlist!");
      return;
    }

    if (!userToken) {
      setError("You need to be logged in to create a playlist");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('[PLAYLIST-BUILDER] Starting playlist generation...', {
        likedCount: likedSongs.length,
        dislikedCount: dislikedSongs.length,
        countryCode,
        hasToken: !!userToken
      });

      // Step 1: Generate AI recommendations
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likedSongs,
          dislikedSongs,
          countryCode,
          userToken
        }),
      });

      const data = await response.json();
      console.log('[PLAYLIST-BUILDER] AI generation response:', { 
        ok: response.ok, 
        status: response.status, 
        dataKeys: Object.keys(data) 
      });

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        throw new Error(errorMsg || 'Failed to generate playlist');
      }

      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid response format from AI service');
      }

      console.log('[PLAYLIST-BUILDER] Successfully generated', data.recommendations.length, 'recommendations');
      
      // Step 2: Create playlist directly with default name
      const playlistName = `Discover ${countryCode || 'Music'}`;
      const playlistDescription = `A personalized playlist created by Discover Worldly based on your music preferences • Generated ${new Date().toLocaleDateString()}`;
      
      console.log('[PLAYLIST-BUILDER] Creating playlist with name:', playlistName);
      console.log('[PLAYLIST-BUILDER] Tracks to add:', data.recommendations.filter(t => t.spotifyId).length, 'of', data.recommendations.length);
      
      const createResponse = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          tracks: data.recommendations,
          userToken
        }),
      });

      console.log('[PLAYLIST-BUILDER] Playlist creation response status:', createResponse.status);
      const playlistData = await createResponse.json();
      console.log('[PLAYLIST-BUILDER] Playlist creation response data:', playlistData);

      if (!createResponse.ok) {
        console.error('[PLAYLIST-BUILDER] Playlist creation failed:', playlistData);
        throw new Error(playlistData.error || 'Failed to create playlist');
      }

      // Success!
      console.log('[PLAYLIST-BUILDER] Playlist created successfully:', playlistData.playlist);
      
      if (onPlaylistCreated) {
        onPlaylistCreated(playlistData.playlist);
      }

      // Show success message with details
      const successMessage = `🎉 Playlist "${playlistData.playlist.name}" created successfully!\n\n` +
        `📊 ${playlistData.playlist.tracksAdded} of ${playlistData.playlist.totalTracks} songs were added to your Spotify library.\n\n` +
        `🎵 Open Spotify to listen to your new playlist!`;
      
      alert(successMessage);
      
      // Optionally go back to map after success
      if (onBackToMap) {
        setTimeout(() => onBackToMap(), 2000);
      }
    } catch (err) {
      console.error('[PLAYLIST-BUILDER] Error during playlist generation/creation:', err);
      
      // Provide more user-friendly error messages
      let userMessage = 'Failed to create playlist. Please try again.';
      
      if (err.message.includes('GEMINI_API_KEY')) {
        userMessage = 'AI service is not configured. Please contact support.';
      } else if (err.message.includes('parse')) {
        userMessage = 'AI service returned invalid data. Please try again.';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.includes('token')) {
        userMessage = 'Authentication failed. Please try logging in again.';
      } else if (err.message.length > 0) {
        userMessage = err.message;
      }
      
      setError(userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = likedSongs && likedSongs.length > 0;

  return (
    <div 
      className="playlist-builder-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={onBackToMap}
    >
      {/* Generate Playlist Button */}
      <div 
        onClick={e => e.stopPropagation()}
        style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "24px",
        background: "#1a1a1a",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        border: "1px solid #333",
        color: "#fff",
        maxWidth: "500px",
        width: "100%",
        position: "relative"
      }}>
        {/* Back to Map button */}
        <button
          onClick={onBackToMap}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "4px",
            fontSize: "24px",
            fontWeight: "300",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#333";
          }}
        >
          ×
        </button>
        <div style={{ textAlign: "center" }}>
          <h3 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#fff",
            marginBottom: "8px",
            margin: "0 0 8px 0",
            textAlign: "center"
          }}>
            🎵 Create Your Personalized Playlist
          </h3>
          <p style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.8)",
            marginBottom: "20px",
            margin: "0 0 20px 0",
            lineHeight: "1.5",
            textAlign: "center"
          }}>
            {likedSongs.length > 0 
              ? `Based on ${likedSongs.length} liked song${likedSongs.length === 1 ? '' : 's'}${dislikedSongs.length > 0 ? ` and ${dislikedSongs.length} disliked` : ''}`
              : "Like some songs first to generate a personalized playlist"
            }
          </p>
        </div>

        {error && (
          <div style={{
            width: "100%",
            padding: "12px 16px",
            background: "#dc2626",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
            textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={generatePlaylist}
          disabled={!canGenerate || isGenerating || !userToken}
          style={{
            padding: "14px 28px",
            background: (!canGenerate || isGenerating || !userToken) ? "#6b7280" : "#059669",
            color: "white",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "16px",
            border: "none",
            cursor: (!canGenerate || isGenerating || !userToken) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "background-color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            if (canGenerate && !isGenerating && userToken) {
              e.target.style.background = "#047857";
            }
          }}
          onMouseLeave={(e) => {
            if (canGenerate && !isGenerating && userToken) {
              e.target.style.background = "#059669";
            }
          }}
        >
          {isGenerating ? (
            <>
              <div style={{
                width: "20px",
                height: "20px",
                border: "2px solid transparent",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              <span>Creating Playlist...</span>
            </>
          ) : (
            <>
              <span>🎵</span>
              <span>Create Spotify Playlist</span>
            </>
          )}
        </button>

        {!canGenerate && (
          <p style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            margin: 0
          }}>
            Swipe right on songs you like to create a playlist
          </p>
        )}
        
        {!userToken && (
          <p style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            margin: 0
          }}>
            Please log in to create playlists on Spotify
          </p>
        )}
      </div>

    </div>
  );
}