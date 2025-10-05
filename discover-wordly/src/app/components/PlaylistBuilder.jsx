"use client";

import React, { useState } from "react";
import PlaylistModal from "./PlaylistModal";

export default function PlaylistBuilder({ 
  likedSongs = [], 
  dislikedSongs = [], 
  countryCode,
  userToken,
  onPlaylistCreated,
  onBackToMap
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [error, setError] = useState(null);

  const generatePlaylist = async () => {
    if (!likedSongs || likedSongs.length === 0) {
      setError("You need to like at least one song to generate a playlist!");
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
      console.log('[PLAYLIST-BUILDER] API response:', { 
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
      setRecommendations(data.recommendations);
      setShowModal(true);
    } catch (err) {
      console.error('Playlist generation error:', err);
      
      // Provide more user-friendly error messages
      let userMessage = 'Failed to generate playlist. Please try again.';
      
      if (err.message.includes('GEMINI_API_KEY')) {
        userMessage = 'AI service is not configured. Please contact support.';
      } else if (err.message.includes('parse')) {
        userMessage = 'AI service returned invalid data. Please try again.';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.length > 0) {
        userMessage = err.message;
      }
      
      setError(userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePlaylist = async (playlistData) => {
    if (!userToken) {
      setError("You need to be logged in to create a playlist");
      return;
    }

    setIsCreatingPlaylist(true);
    setError(null);

    try {
      const response = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...playlistData,
          userToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create playlist');
      }

      // Success! Close modal and notify parent
      setShowModal(false);
      if (onPlaylistCreated) {
        onPlaylistCreated(data.playlist);
      }

      // Show success message
      alert(`Playlist "${data.playlist.name}" created successfully! ${data.playlist.tracksAdded} tracks were added to your Spotify library.`);

    } catch (err) {
      console.error('Playlist creation error:', err);
      setError(err.message || 'Failed to create playlist. Please try again.');
    } finally {
      setIsCreatingPlaylist(false);
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
        background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.08)",
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
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255,255,255,0.15)";
            e.target.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <div style={{ textAlign: "center" }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#fff",
            marginBottom: "8px",
            margin: "0 0 8px 0"
          }}>
            Create Your Personalized Playlist
          </h3>
          <p style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "16px",
            margin: "0 0 16px 0"
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
            padding: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            borderRadius: "10px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <button
          onClick={generatePlaylist}
          disabled={!canGenerate || isGenerating}
          style={{
            padding: "14px 28px",
            backgroundColor: (!canGenerate || isGenerating) ? "#9ca3af" : "#059669",
            color: "white",
            borderRadius: "12px",
            fontWeight: "600",
            border: "none",
            cursor: (!canGenerate || isGenerating) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "16px",
            boxShadow: (!canGenerate || isGenerating) ? "none" : "0 6px 20px rgba(5, 150, 105, 0.4)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            if (canGenerate && !isGenerating) {
              e.target.style.backgroundColor = "#047857";
              e.target.style.transform = "translateY(-2px) scale(1.02)";
              e.target.style.boxShadow = "0 8px 25px rgba(5, 150, 105, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (canGenerate && !isGenerating) {
              e.target.style.backgroundColor = "#059669";
              e.target.style.transform = "translateY(0px) scale(1)";
              e.target.style.boxShadow = "0 6px 20px rgba(5, 150, 105, 0.4)";
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
              <span>Generating with AI...</span>
            </>
          ) : (
            <>
              <span>🎵</span>
              <span>Generate AI Playlist</span>
            </>
          )}
        </button>

        {!canGenerate && (
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            margin: 0
          }}>
            Swipe right on songs you like to enable playlist generation
          </p>
        )}
      </div>

      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        recommendations={recommendations}
        onCreatePlaylist={handleCreatePlaylist}
        isCreating={isCreatingPlaylist}
        countryCode={countryCode}
      />
    </div>
  );
}