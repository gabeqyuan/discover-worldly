import React, { useState, useCallback, useEffect } from "react";
import SongCard from "./SongCard";

// SwipeDeck: simple stack of SongCard components.
// - Accepts optional `tracks` prop (array of track objects).
// - If `tracks` is not provided, it falls back to a small sample list.
// - Calls `onLike` / `onSkip` callbacks when a card is liked or skipped.
export default function SwipeDeck({ tracks, onLike, onSkip, deckEmpty }) {
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
	const [cards, setCards] = useState(tracks && tracks.length ? tracks : sampleTracks);

	// handleAction: remove the top card and call the appropriate callback.
	// We use useCallback so the handler identity is stable for potential child optimizations.
	const handleAction = useCallback(
		(action, track) => {
			// Remove the first card from the array (the top of the deck).
			setCards((prev) => prev.slice(1));

			// Call the external callbacks if provided. This keeps the deck pure and lets the
			// page decide what to do (e.g., persist liked songs).
			if (action === "like") {
				if (typeof onLike === "function") onLike(track);
			} else if (action === "skip") {
				if (typeof onSkip === "function") onSkip(track);
			}
		},
		[onLike, onSkip]
	);

	// If there are no cards left, render an empty state message.
	// Inform parent about empty/non-empty deck as a side-effect instead of during render.
	useEffect(() => {
		if (typeof deckEmpty === 'function') {
			deckEmpty(!cards || cards.length === 0);
		}
	}, [cards]);

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
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
			<div style={{ position: "relative", width: 340, height: 500 }}>
				{cards
					.slice(0, 3) // show up to 3 cards stacked for visual depth
					.reverse() // reverse so the top card is rendered last (on top in DOM)
					.map((track, idx) => {
						// compute a simple offset for stacked look
						const offset = idx * 8;
						const zIndex = 10 + idx;

						return (
							<div
								key={track.id || track.spotifyId || track.title}
								style={{
									position: "absolute",
									left: offset,
									top: offset,
									zIndex,
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
			<div style={{ display: "flex", gap: 12 }}>
				{/* Quick action buttons that operate on the current top card */}
				<button
					onClick={() => handleAction("skip", cards[0])}
					style={{ padding: "8px 12px", borderRadius: 8 }}
				>
					Skip
				</button>
				<button
					onClick={() => handleAction("like", cards[0])}
					style={{ padding: "8px 12px", borderRadius: 8, background: "#1db954", color: "#fff" }}
				>
					Like
				</button>
			</div>
		</div>
	);
}