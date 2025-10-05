"use client";

import React, { useState } from "react";
import PlaylistModal from "./PlaylistModal";

export default function PlaylistBuilder({ 
  likedSongs = [], 
  dislikedSongs = [], 
  countryCode,
  userToken,
  onPlaylistCreated 
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
    <div className="playlist-builder">
      {/* Generate Playlist Button */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "24px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ textAlign: "center" }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "8px",
            margin: "0 0 8px 0"
          }}>
            Create Your Personalized Playlist
          </h3>
          <p style={{
            fontSize: "14px",
            color: "#6b7280",
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
            backgroundColor: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            borderRadius: "6px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <button
          onClick={generatePlaylist}
          disabled={!canGenerate || isGenerating}
          style={{
            padding: "12px 24px",
            backgroundColor: (!canGenerate || isGenerating) ? "#9ca3af" : "#059669",
            color: "white",
            borderRadius: "8px",
            fontWeight: "500",
            border: "none",
            cursor: (!canGenerate || isGenerating) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
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
            color: "#6b7280",
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