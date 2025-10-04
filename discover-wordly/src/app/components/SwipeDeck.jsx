import React, { useState, useCallback, useEffect } from "react";
import SongCard from "./SongCard";
import { motion, AnimatePresence } from "framer-motion";

export default function SwipeDeck({ tracks = [], onLike, onSkip }) {
  const [cards, setCards] = useState(tracks);

  const handleAction = useCallback((action, track) => {
    setCards((prev) => prev.slice(1));
    if (action === "like" && typeof onLike === "function") {
      onLike(track);
    } else if (action === "skip" && typeof onSkip === "function") {
      onSkip(track);
    }
  }, [onLike, onSkip]);

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center text-white/60">
        No more songs to discover in this region
      </div>
    );
  }

  return (
    <div className="relative w-[400px]">
      <AnimatePresence>
        {cards.slice(0, 3).map((track, index) => {
          const isTop = index === 0;
          
          return (
            <motion.div
              key={track.id || track.spotifyId}
              className="absolute origin-bottom"
              style={{
                width: "100%",
                height: "100%",
              }}
              animate={{
                scale: 1 - index * 0.05,
                y: index * 8,
                zIndex: cards.length - index,  
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              exit={{ 
                x: Math.random() > 0.5 ? -400 : 400,
                opacity: 0,
                transition: { duration: 0.2 }
              }}
            >
              <SongCard
                key={track.id || track.spotifyId}
                track={track}
                isActive={isTop}
                onLike={() => handleAction("like", track)}
                onSkip={() => handleAction("skip", track)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}