"use client";

import { useState, useEffect, useRef } from "react";

// Suggested Video Card with auto-playing GIF previews when visible in viewport
export default function SuggestedVideoCard({ video }: { video: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = cardRef.current?.closest('.overflow-y-auto') || null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { 
        root: scrollContainer,
        threshold: 0.15 
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const shouldPlay = isHovered || inView;
  const gifSrc = video.gifUrl;

  return (
    <div 
      ref={cardRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all border border-white/10 shrink-0 bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Static thumbnail image (Always visible at z-0 as solid fallback) */}
      <img 
        src={video.thumbnail} 
        alt={video.title} 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />

      {/* Animated GIF Layer (Rendered at z-10 only when card is visible in viewport or hovered) */}
      {shouldPlay && gifSrc && (
        <img 
          src={gifSrc} 
          alt={video.title} 
          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none transition-opacity duration-300 opacity-100" 
        />
      )}

      {/* Gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
      
      {/* Overlay Text (Title Only) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end z-20 pointer-events-none">
          <h4 className="text-white font-bold text-base line-clamp-2 drop-shadow-lg leading-snug">{video.title}</h4>
      </div>
      
      {/* Time Badge */}
      <div className="absolute top-3 right-3 bg-black/80 text-white font-medium text-[11px] px-2 py-1 rounded-md shadow-sm backdrop-blur-sm z-20 pointer-events-none">10:24</div>
    </div>
  );
}
