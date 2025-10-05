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
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "16px"
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            maxWidth: "672px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden"
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#111827",
                margin: 0
              }}>Your AI-Generated Playlist</h2>
              <p style={{
                color: "#6b7280",
                marginTop: "4px",
                margin: "4px 0 0 0"
              }}>{recommendations.length} songs curated based on your taste</p>
            </div>
            <button
              onClick={onClose}
              style={{
                color: "#9ca3af",
                fontSize: "24px",
                lineHeight: "1",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              ×
            </button>
          </div>

          {/* Playlist Details Form */}
          <div style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb"
          }}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px"
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
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Description (Optional)
              </label>
              <textarea
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                placeholder="A personalized playlist created by Discover Worldly based on your music preferences..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  outline: "none",
                  resize: "none"
                }}
              />
            </div>
          </div>

          {/* Track List */}
          <div style={{ overflowY: "auto", maxHeight: "384px" }}>
            {recommendations.map((track, index) => (
              <div key={index} style={{
                padding: "16px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
                <div style={{ flexShrink: 0, width: "32px", textAlign: "center" }}>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#6b7280"
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
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    margin: 0
                  }}>
                    {track.title}
                  </p>
                  <p style={{
                    fontSize: "14px",
                    color: "#6b7280",
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
                      color: "#9ca3af",
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
            padding: "24px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{
              fontSize: "14px",
              color: "#6b7280"
            }}>
              {recommendations.filter(t => t.spotifyId).length} of {recommendations.length} songs found on Spotify
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  color: "#374151",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={isCreating || !playlistName.trim()}
                style={{
                  padding: "8px 24px",
                  backgroundColor: isCreating || !playlistName.trim() ? "#9ca3af" : "#059669",
                  color: "white",
                  borderRadius: "6px",
                  border: "none",
                  cursor: isCreating || !playlistName.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {isCreating ? (
                  <>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid transparent",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Add to Spotify</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}