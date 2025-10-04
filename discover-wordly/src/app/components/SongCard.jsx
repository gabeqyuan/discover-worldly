import React, { useRef, useState, useEffect } from "react";

// React component for a Tinder-style swipe card for songs
// Props:
// - track: { title, artist, albumArt, spotifyId }
// - onLike: optional function called when swiped right
// - onSkip: optional function called when swiped left
export default function SongCard({ track = {}, onLike, onSkip }) {
	const { title = "Unknown Title", artist = "Unknown Artist", albumArt = "", spotifyId = "" } = track;

	const cardRef = useRef(null);
	const pointerIdRef = useRef(null);

	const [translate, setTranslate] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [velocity, setVelocity] = useState({ vx: 0, vy: 0 });
	const [released, setReleased] = useState(false);
		const [imgError, setImgError] = useState(false);

	// local helpers
	const threshold = 120; // px required to count as like/skip

	useEffect(() => {
		// Reset released when track changes
		setReleased(false);
		setTranslate({ x: 0, y: 0 });
	}, [spotifyId, title, artist, albumArt]);

	function handlePointerDown(e) {
		// Only allow left mouse button or touch
		if (e.pointerType === "mouse" && e.button !== 0) return;
		pointerIdRef.current = e.pointerId;
		(e.target || e.currentTarget).setPointerCapture(pointerIdRef.current);
		setIsDragging(true);
		setVelocity({ vx: 0, vy: 0 });
		cardRef.current.dataset.startX = e.clientX;
		cardRef.current.dataset.startY = e.clientY;
		e.preventDefault();
	}

	function handlePointerMove(e) {
		if (!isDragging || pointerIdRef.current !== e.pointerId) return;
		const startX = Number(cardRef.current.dataset.startX) || 0;
		const startY = Number(cardRef.current.dataset.startY) || 0;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		setTranslate({ x: dx, y: dy });
		setVelocity({ vx: dx, vy: dy });
	}

	function handlePointerUp(e) {
		if (!isDragging) return;
		setIsDragging(false);
		try {
			(e.target || e.currentTarget).releasePointerCapture(e.pointerId);
		} catch (err) {
			// ignore
		}

		const finalX = translate.x;
		if (finalX > threshold) {
			// liked
			setTranslate({ x: window.innerWidth, y: translate.y });
			setReleased(true);
			if (typeof onLike === "function") onLike(track);
		} else if (finalX < -threshold) {
			// skipped
			setTranslate({ x: -window.innerWidth, y: translate.y });
			setReleased(true);
			if (typeof onSkip === "function") onSkip(track);
		} else {
			// snap back
			setTranslate({ x: 0, y: 0 });
		}
	}

	const rotation = Math.max(-20, Math.min(20, (translate.x / 20)));

	return (
		<div
			ref={cardRef}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerUp}
			role="article"
			aria-label={`${title} by ${artist}`}
			style={{
				width: 320,
				maxWidth: "92vw",
				height: 460,
				borderRadius: 16,
				boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
				background: "#111",
				color: "#fff",
				overflow: "hidden",
				userSelect: "none",
				touchAction: "none",
				position: "relative",
				margin: "16px auto",
				transform: `translate(${translate.x}px, ${translate.y}px) rotate(${rotation}deg)`,
				transition: isDragging || released ? "transform 300ms ease-out" : "transform 200ms ease-in-out",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div style={{ flex: 1, position: "relative" }}>
						{albumArt && !imgError ? (
							<img
								src={albumArt}
								alt={`${title} album art`}
								onError={() => setImgError(true)}
								style={{ width: "100%", height: "100%", objectFit: "cover" }}
								loading="lazy"
								decoding="async"
								draggable={false}
							/>
						) : (
					<div
						style={{
							width: "100%",
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "linear-gradient(135deg,#444,#222)",
						}}
					>
						<div style={{ textAlign: "center", padding: 16 }}>
							<div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
							<div style={{ opacity: 0.8 }}>{artist}</div>
						</div>
					</div>
				)}
			</div>

			<div style={{ padding: 12, background: "#070707" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<div>
						<div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
						<div style={{ fontSize: 13, opacity: 0.85 }}>{artist}</div>
					</div>
					<div style={{ display: "flex", gap: 8 }}>
						<button
							onClick={() => {
								setTranslate({ x: -window.innerWidth, y: 0 });
								setReleased(true);
								if (typeof onSkip === "function") onSkip(track);
							}}
							aria-label="Skip"
							style={{
								border: "none",
								background: "#2b2b2b",
								color: "#fff",
								padding: "8px 10px",
								borderRadius: 8,
								cursor: "pointer",
							}}
						>
							Skip
						</button>
						<button
							onClick={() => {
								setTranslate({ x: window.innerWidth, y: 0 });
								setReleased(true);
								if (typeof onLike === "function") onLike(track);
							}}
							aria-label="Like"
							style={{
								border: "none",
								background: "#1db954",
								color: "#072a10",
								padding: "8px 12px",
								borderRadius: 8,
								cursor: "pointer",
								fontWeight: 700,
							}}
						>
							Like
						</button>
					</div>
				</div>

				{spotifyId ? (
					<div style={{ marginTop: 12 }}>
						<iframe
							title={`spotify-${spotifyId}`}
							src={`https://open.spotify.com/embed/track/${spotifyId}`}
							width="100%"
							height="80"
							frameBorder="0"
							allow="encrypted-media; clipboard-write; fullscreen; picture-in-picture"
							style={{ borderRadius: 8 }}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}
 
