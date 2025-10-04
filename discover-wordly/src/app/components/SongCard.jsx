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
	const opacity = Math.abs(translate.x) > threshold ? Math.min(0.8, Math.abs(translate.x) / 300) : 0;

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
				width: 360,
				maxWidth: "92vw",
				height: 520,
				borderRadius: 24,
				boxShadow: isDragging 
					? "0 20px 60px rgba(0,0,0,0.5)" 
					: "0 12px 40px rgba(0,0,0,0.3)",
				background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
				color: "#fff",
				overflow: "hidden",
				userSelect: "none",
				touchAction: "none",
				position: "relative",
				margin: "20px auto",
				transform: `translate(${translate.x}px, ${translate.y}px) rotate(${rotation}deg)`,
				transition: isDragging ? "none" : released ? "transform 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "transform 200ms ease-in-out, box-shadow 200ms ease",
				display: "flex",
				flexDirection: "column",
				cursor: isDragging ? "grabbing" : "grab",
				border: "1px solid rgba(255,255,255,0.08)",
			}}
		>
			{/* Swipe direction indicators */}
			<div
				style={{
					position: "absolute",
					top: 40,
					left: 40,
					zIndex: 10,
					opacity: translate.x < -threshold ? opacity : 0,
					transition: "opacity 150ms ease",
					transform: `rotate(-20deg) scale(${1 + opacity * 0.3})`,
					pointerEvents: "none",
				}}
			>
				<div style={{
					background: "rgba(239, 68, 68, 0.9)",
					color: "white",
					padding: "12px 24px",
					borderRadius: 12,
					fontSize: 24,
					fontWeight: 800,
					border: "4px solid white",
					boxShadow: "0 4px 12px rgba(239, 68, 68, 0.5)",
				}}>
					SKIP
				</div>
			</div>
			
			<div
				style={{
					position: "absolute",
					top: 40,
					right: 40,
					zIndex: 10,
					opacity: translate.x > threshold ? opacity : 0,
					transition: "opacity 150ms ease",
					transform: `rotate(20deg) scale(${1 + opacity * 0.3})`,
					pointerEvents: "none",
				}}
			>
				<div style={{
					background: "rgba(29, 185, 84, 0.9)",
					color: "white",
					padding: "12px 24px",
					borderRadius: 12,
					fontSize: 24,
					fontWeight: 800,
					border: "4px solid white",
					boxShadow: "0 4px 12px rgba(29, 185, 84, 0.5)",
				}}>
					LIKE
				</div>
			</div>

			<div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
				{/* Red gradient overlay for skip (left swipe) */}
				<div style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: "linear-gradient(90deg, rgba(239, 68, 68, 0.85) 0%, rgba(239, 68, 68, 0.4) 50%, transparent 100%)",
					opacity: translate.x < 0 ? Math.min(Math.abs(translate.x) / 150, 1) : 0,
					transition: isDragging ? "none" : "opacity 200ms ease",
					pointerEvents: "none",
					zIndex: 10,
				}} />
				
				{/* Green gradient overlay for like (right swipe) */}
				<div style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: "linear-gradient(270deg, rgba(29, 185, 84, 0.85) 0%, rgba(29, 185, 84, 0.4) 50%, transparent 100%)",
					opacity: translate.x > 0 ? Math.min(translate.x / 150, 1) : 0,
					transition: isDragging ? "none" : "opacity 200ms ease",
					pointerEvents: "none",
					zIndex: 10,
				}} />
				
				{albumArt && !imgError ? (
					<>
						<img
							src={albumArt}
							alt={`${title} album art`}
							onError={() => setImgError(true)}
							style={{ 
								width: "100%", 
								height: "100%", 
								objectFit: "cover",
								filter: "brightness(0.85) contrast(1.1)",
								position: "relative",
								zIndex: 1,
							}}
							loading="lazy"
							decoding="async"
							draggable={false}
						/>
						
						{/* Gradient overlay for better text visibility */}
						<div style={{
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							height: "40%",
							background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
							pointerEvents: "none",
							zIndex: 5,
						}} />
					</>
				) : (
					<div
						style={{
							width: "100%",
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						}}
					>
						<div style={{ textAlign: "center", padding: 24 }}>
							<div style={{ 
								fontSize: 28, 
								fontWeight: 700,
								marginBottom: 8,
								textShadow: "0 2px 4px rgba(0,0,0,0.3)",
							}}>
								🎵
							</div>
							<div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
							<div style={{ opacity: 0.9, marginTop: 4 }}>{artist}</div>
						</div>
					</div>
				)}
			</div>

			<div style={{ 
				padding: "20px 24px 24px", 
				background: "linear-gradient(180deg, #0f0f0f, #000)",
				borderTop: "1px solid rgba(255,255,255,0.05)",
			}}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
					<div style={{ flex: 1, marginRight: 16 }}>
						<div style={{ 
							fontSize: 20, 
							fontWeight: 700,
							marginBottom: 4,
							lineHeight: 1.3,
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
						}}>
							{title}
						</div>
						<div style={{ 
							fontSize: 15, 
							opacity: 0.7,
							fontWeight: 500,
						}}>
							{artist}
						</div>
					</div>
					<div style={{ display: "flex", gap: 10 }}>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setTranslate({ x: -window.innerWidth, y: 0 });
								setReleased(true);
								// Delay callback until after animation completes
								setTimeout(() => {
									if (typeof onSkip === "function") onSkip(track);
								}, 1000);
							}}
							aria-label="Skip"
							style={{
								border: "2px solid rgba(239, 68, 68, 0.3)",
								background: "rgba(239, 68, 68, 0.1)",
								color: "#ef4444",
								padding: "10px 14px",
								borderRadius: 50,
								cursor: "pointer",
								fontSize: 20,
								transition: "all 150ms ease",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: 48,
								height: 48,
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
								e.currentTarget.style.transform = "scale(1.1)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
								e.currentTarget.style.transform = "scale(1)";
							}}
						>
							✕
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setTranslate({ x: window.innerWidth, y: 0 });
								setReleased(true);
								// Delay callback until after animation completes
								setTimeout(() => {
									if (typeof onLike === "function") onLike(track);
								}, 1000);
							}}
							aria-label="Like"
							style={{
								border: "2px solid rgba(29, 185, 84, 0.3)",
								background: "#1db954",
								color: "#fff",
								padding: "10px 14px",
								borderRadius: 50,
								cursor: "pointer",
								fontSize: 20,
								fontWeight: 700,
								transition: "all 150ms ease",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: 48,
								height: 48,
								boxShadow: "0 4px 12px rgba(29, 185, 84, 0.3)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = "#1ed760";
								e.currentTarget.style.transform = "scale(1.1)";
								e.currentTarget.style.boxShadow = "0 6px 16px rgba(29, 185, 84, 0.4)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "#1db954";
								e.currentTarget.style.transform = "scale(1)";
								e.currentTarget.style.boxShadow = "0 4px 12px rgba(29, 185, 84, 0.3)";
							}}
						>
							♥
						</button>
					</div>
				</div>

				{spotifyId ? (
					<div style={{ 
						marginTop: 4,
						background: "rgba(255,255,255,0.03)",
						borderRadius: 12,
						padding: 4,
						border: "1px solid rgba(255,255,255,0.05)",
					}}>
						<iframe
							title={`spotify-${spotifyId}`}
							src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
							width="100%"
							height="80"
							frameBorder="0"
							allow="encrypted-media; clipboard-write; fullscreen; picture-in-picture"
							style={{ 
								borderRadius: 10,
								background: "transparent",
							}}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}
 
