"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Add spinner animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default function PlaylistModal({ 
  isOpen, 
  onClose, 
  recommendations, 
  onCreatePlaylist, 
  isCreating = false,
  countryCode 
}) {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");

  if (!isOpen || !recommendations) return null;

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      alert("Please enter a playlist name");
      return;
    }
    
    onCreatePlaylist({
      name: playlistName.trim(),
      description: playlistDescription.trim(),
      tracks: recommendations
    });
  };

  // Generate a default playlist name based on country and current date
  const defaultName = `Discover ${countryCode || 'Music'} • ${new Date().toLocaleDateString()}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
          backdropFilter: "blur(4px)",
          overflowY: "auto",
          minHeight: "100vh"
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
            borderRadius: "24px",
            maxWidth: "700px",
            width: "100%",
            maxHeight: "80vh",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            position: "relative",
            transform: "translateY(0)",
            margin: "auto"
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: "28px 32px",
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h2 style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "white",
                margin: 0,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>🎵 Your AI Playlist</h2>
              <p style={{
                color: "rgba(255, 255, 255, 0.9)",
                marginTop: "6px",
                margin: "6px 0 0 0",
                fontSize: "16px"
              }}>{recommendations.length} songs curated just for you</p>
            </div>
            <button
              onClick={onClose}
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "28px",
                lineHeight: "1",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                cursor: "pointer",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                e.target.style.color = "rgba(255, 255, 255, 0.8)";
              }}
            >
              ×
            </button>
          </div>

          {/* Playlist Details Form */}
          <div style={{
            padding: "28px 32px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)"
          }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "15px",
                fontWeight: "600",
                color: "#fff",
                marginBottom: "10px"
              }}>
                Playlist Name *
              </label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder={defaultName}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "16px",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#fff"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.15)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label style={{
                display: "block",
                fontSize: "15px",
                fontWeight: "600",
                color: "#fff",
                marginBottom: "10px"
              }}>
                Description (Optional)
              </label>
              <textarea
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                placeholder="A personalized playlist created by Discover Worldly based on your music preferences..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  outline: "none",
                  resize: "none",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#fff"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.15)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Track List */}
          <div style={{ overflowY: "auto", maxHeight: "384px" }}>
            {recommendations.map((track, index) => (
              <div key={index} style={{
                padding: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
                <div style={{ flexShrink: 0, width: "32px", textAlign: "center" }}>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "rgba(255,255,255,0.6)"
                  }}>{index + 1}</span>
                </div>
                
                {track.albumArt && (
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src={track.albumArt}
                      alt={`${track.title} cover`}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "4px",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                )}
                
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    margin: 0
                  }}>
                    {track.title}
                  </p>
                  <p style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.7)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    margin: 0
                  }}>
                    {track.artist}
                  </p>
                  {track.reason && (
                    <p style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.5)",
                      marginTop: "4px",
                      margin: "4px 0 0 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {track.reason}
                    </p>
                  )}
                </div>

                <div style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  {track.previewUrl && (
                    <button
                      onClick={() => {
                        const audio = new Audio(track.previewUrl);
                        audio.play().catch(e => console.log('Preview not available'));
                      }}
                      style={{
                        color: "#059669",
                        fontSize: "14px",
                        background: "none",
                        border: "none",
                        cursor: "pointer"
                      }}
                      title="Play preview"
                    >
                      ▶️
                    </button>
                  )}
                  
                  {track.spotifyId ? (
                    <span style={{
                      color: "#10b981",
                      fontSize: "12px"
                    }} title="Available on Spotify">
                      ✓
                    </span>
                  ) : (
                    <span style={{
                      color: "#f59e0b",
                      fontSize: "12px"
                    }} title="Not found on Spotify">
                      ?
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div style={{
            padding: "28px 32px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981"
              }}></span>
              {recommendations.filter(t => t.spotifyId).length} of {recommendations.length} songs found on Spotify
            </div>
            
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "12px 24px",
                  color: "rgba(255,255,255,0.8)",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  border: "2px solid rgba(255,255,255,0.15)",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.3)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.15)";
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.15)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.target.style.color = "rgba(255,255,255,0.8)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={isCreating || !playlistName.trim()}
                style={{
                  padding: "14px 32px",
                  backgroundColor: isCreating || !playlistName.trim() ? "#9ca3af" : "#059669",
                  color: "white",
                  borderRadius: "12px",
                  border: "none",
                  cursor: isCreating || !playlistName.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: "700",
                  fontSize: "16px",
                  boxShadow: isCreating || !playlistName.trim() ? "none" : "0 6px 20px rgba(5, 150, 105, 0.4)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isCreating && playlistName.trim()) {
                    e.target.style.backgroundColor = "#047857";
                    e.target.style.transform = "translateY(-2px) scale(1.02)";
                    e.target.style.boxShadow = "0 8px 25px rgba(5, 150, 105, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCreating && playlistName.trim()) {
                    e.target.style.backgroundColor = "#059669";
                    e.target.style.transform = "translateY(0px) scale(1)";
                    e.target.style.boxShadow = "0 6px 20px rgba(5, 150, 105, 0.4)";
                  }
                }}
              >
                {isCreating ? (
                  <>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid transparent",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>🎵</span>
                    <span>Create Playlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}