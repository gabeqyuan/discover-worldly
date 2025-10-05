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
        background: "linear-gradient(145deg, #1e1e1e 0%, #0d1117 50%, #000000 100%)",
        borderRadius: "32px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
        border: "1px solid rgba(96, 165, 250, 0.2)",
        color: "#fff",
        maxWidth: "520px",
        width: "100%",
        position: "relative",
        backdropFilter: "blur(20px)",
        transform: "translateY(0px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>
        {/* Back to Map button */}
        <button
          onClick={onBackToMap}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            padding: "8px",
            fontSize: "16px",
            fontWeight: "400",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.9))";
            e.target.style.color = "#fff";
            e.target.style.transform = "scale(1.1) rotate(90deg)";
            e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))";
            e.target.style.color = "rgba(255,255,255,0.8)";
            e.target.style.transform = "scale(1) rotate(0deg)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
        >
          ×
        </button>
        <div style={{ textAlign: "center" }}>
          <h3 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "12px",
            margin: "0 0 12px 0",
            background: "linear-gradient(135deg, #60a5fa, #3b82f6, #1d4ed8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            letterSpacing: "-0.02em"
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
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#fecaca",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: "500",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            animation: "fadeIn 0.3s ease-out"
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={generatePlaylist}
          disabled={!canGenerate || isGenerating || !userToken}
          style={{
            padding: "18px 36px",
            background: (!canGenerate || isGenerating || !userToken) 
              ? "linear-gradient(135deg, #6b7280, #4b5563)" 
              : "linear-gradient(135deg, #10b981, #059669, #047857)",
            color: "white",
            borderRadius: "20px",
            fontWeight: "700",
            fontSize: "17px",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: (!canGenerate || isGenerating || !userToken) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: (!canGenerate || isGenerating || !userToken) 
              ? "0 4px 12px rgba(0,0,0,0.2)" 
              : "0 8px 32px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
            letterSpacing: "0.02em",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)"
          }}
          onMouseEnter={(e) => {
            if (canGenerate && !isGenerating && userToken) {
              e.target.style.background = "linear-gradient(135deg, #059669, #047857, #065f46)";
              e.target.style.transform = "translateY(-4px) scale(1.05)";
              e.target.style.boxShadow = "0 12px 40px rgba(16, 185, 129, 0.6), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (canGenerate && !isGenerating && userToken) {
              e.target.style.background = "linear-gradient(135deg, #10b981, #059669, #047857)";
              e.target.style.transform = "translateY(0px) scale(1)";
              e.target.style.boxShadow = "0 8px 32px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)";
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
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            margin: 0,
            fontWeight: "500",
            background: "linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(59, 130, 246, 0.05))",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(96, 165, 250, 0.2)",
            backdropFilter: "blur(5px)"
          }}>
            👆 Swipe right on songs you like to create a playlist
          </p>
        )}
        
        {!userToken && (
          <p style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            margin: 0,
            fontWeight: "500",
            background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(251, 191, 36, 0.2)",
            backdropFilter: "blur(5px)"
          }}>
            🔑 Please log in to create playlists on Spotify
          </p>
        )}
      </div>

    </div>
  );
}