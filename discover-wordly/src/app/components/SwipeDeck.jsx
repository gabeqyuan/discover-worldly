"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import SongCard from "./SongCard";
import { motion, AnimatePresence } from "framer-motion";

// SwipeDeck: simple stack of SongCard components.
// - Accepts optional `tracks` prop (array of track objects).
// - If `tracks` is not provided, it falls back to a small sample list.
// - Calls `onLike` / `onSkip` callbacks when a card is liked or skipped.
export default function SwipeDeck({ tracks, onLike, onSkip, deckEmpty, onBackToMap }) {
	// If no tracks prop is provided, use a minimal local sample so the UI can be tested.
	const sampleTracks = [
		{
			id: "1",
			title: "Blinding Lights",
			artist: "The Weeknd",
			albumArt: "https://i.scdn.co/image/ab67616d0000b273d4f8e9b8d5a2e0f2b2c6d6d2",
			spotifyId: "0VjIjW4GlUZAMYd2vXMi3b",
		},
		{
			id: "2",
			title: "Levitating",
			artist: "Dua Lipa",
			albumArt: "https://i.scdn.co/image/ab67616d0000b273c7b7f2f9b4f3b8d9a2a4b5c6",
			spotifyId: "463CkQjx2Zk1yXoBuierM9",
		},
	];

	// Maintain the list of remaining cards in state so we can remove the top card on swipe.
	// Initialize from `tracks` prop when available, otherwise fall back to sampleTracks.
	const [cards, setCards] = useState(() => {
		console.log(`[SWIPEDECK] Initializing with ${tracks?.length || 0} tracks`);
		return tracks && tracks.length ? tracks : sampleTracks;
	});		// animating state: when a card is liked/skipped we animate it off-screen first,
		// then remove it from the deck after the animation completes.
		const [animating, setAnimating] = useState({ action: null, trackId: null });

	// likedTracks persist liked songs in localStorage so likes survive page reloads.
	// Start with empty array and load from localStorage after mount to avoid hydration mismatch
	const [likedTracks, setLikedTracks] = useState([]);

	// keep a ref to the removal timeout so we can clear if the component unmounts
	const timeoutRef = useRef(null);

	// Load liked tracks from localStorage after component mounts (client-side only)
	useEffect(() => {
		try {
			const raw = localStorage.getItem("likedTracks");
			if (raw) {
				setLikedTracks(JSON.parse(raw));
			}
		} catch (error){
			console.error(error);
		};
	}, []);

	useEffect(() => {
		if (typeof deckEmpty === 'function') {
			deckEmpty(!cards || cards.length === 0);
		}
	}, [cards]);		// handleAction: trigger animation and schedule removal + callback
		const handleAction = useCallback(
			(action, track) => {
				// ignore if already animating a card
				if (animating.action) return;

				// mark which track is animating and which action (like/skip)
				setAnimating({ action, trackId: track.id || track.spotifyId || track.title });

				// schedule removal after animation (400ms) and call external callbacks
				timeoutRef.current = setTimeout(() => {
					setCards((prev) => prev.slice(1));

					// persist liked tracks to localStorage
					if (action === "like") {
						setLikedTracks((prev) => {
							const next = [track, ...prev];
							try {
								localStorage.setItem("likedTracks", JSON.stringify(next));
							} catch (e) {}
							return next;
						});
					}

					// call external callbacks after removal
					if (action === "like") {
						if (typeof onLike === "function") onLike(track);
					} else if (action === "skip") {
						if (typeof onSkip === "function") onSkip(track);
					}

					// reset animating state
					setAnimating({ action: null, trackId: null });
				}, 420);
			},
			[animating.action, onLike, onSkip]
		);

		// cleanup on unmount
		useEffect(() => {
			return () => {
				if (timeoutRef.current) clearTimeout(timeoutRef.current);
			};
		}, []);

	// If there are no cards left, render an empty state message.
		if (!cards || cards.length === 0) {
		return (
			<div style={{ padding: 24, textAlign: "center", color: "#aaa" }}>
				No more songs — try refreshing or adding more tracks.
			</div>
		);
	}

	// Render the stack: show the first card as the top card and the rest as a faint stack behind it.
		return (
			<div 
				style={{ 
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "rgba(0, 0, 0, 0.3)",
					display: "flex", 
					justifyContent: "center", 
					alignItems: "center",
					zIndex: 1000
				}}
				onClick={onBackToMap}
			>
				<div 
					onClick={e => e.stopPropagation()}
					style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative" }}
				>
					{/* Back to Map button */}
					<button
						onClick={onBackToMap}
						style={{
							position: "absolute",
							top: "-60px",
							right: "0px",
							background: "rgba(0,0,0,0.6)",
							color: "#fff",
							border: "2px solid rgba(255,255,255,0.2)",
							borderRadius: "20px",
							padding: "8px 16px",
							fontSize: "14px",
							fontWeight: "500",
							cursor: "pointer",
							backdropFilter: "blur(10px)",
							transition: "all 0.2s ease",
							display: "flex",
							alignItems: "center",
							gap: "6px"
						}}
						onMouseEnter={(e) => {
							e.target.style.background = "rgba(0,0,0,0.8)";
							e.target.style.borderColor = "rgba(255,255,255,0.4)";
						}}
						onMouseLeave={(e) => {
							e.target.style.background = "rgba(0,0,0,0.6)";
							e.target.style.borderColor = "rgba(255,255,255,0.2)";
						}}
					>
						<span>←</span>
						<span>Back to Map</span>
					</button>
					<div style={{ position: "relative", width: 340, height: 500 }}>
					{cards
						.slice(0, 3) // show up to 3 cards stacked for visual depth
						.reverse()
						.map((track, idx) => {
							// Compute position in the original cards array for stable key
							const cardIndex = cards.indexOf(track);
							// compute a simple offset for stacked look (bottom card offset is larger)
							const offset = idx * 8;
							const zIndex = 10 + idx;
							const topTrack = cards[0];
							const isTop = topTrack && (topTrack.id || topTrack.spotifyId || topTrack.title) === (track.id || track.spotifyId || track.title);

							// If this is the currently animating card, apply a transform to slide it off-screen
							let transformStyle = undefined;
							if (isTop && animating.action && animating.trackId === (track.id || track.spotifyId || track.title)) {
								const distance = typeof window !== "undefined" ? window.innerWidth : 1000;
								const direction = animating.action === "like" ? distance : -distance;
								transformStyle = `translateX(${direction}px) rotate(${animating.action === "like" ? 25 : -25}deg)`;
							}

							return (
								<div
									key={track.spotifyId ?? track.id ?? track.title}
									style={{
										position: "absolute",
										left: 0,
										top: 0,
										zIndex,
										transition: isTop ? "transform 420ms ease-out" : "none",
										transform: transformStyle || `translate(${offset}px, ${offset}px)`,
									}}
								>
									{/*
										Each SongCard is interactive (client component). We pass small handlers
										that call handleAction with the chosen action. The SongCard itself
										supports both drag gestures and buttons; here we forward those events.
									*/}
									<SongCard
										track={track}
										onLike={() => handleAction("like", track)}
										onSkip={() => handleAction("skip", track)}
									/>
								</div>
							);
						})}
				</div>
				</div>
			</div>
		);
}