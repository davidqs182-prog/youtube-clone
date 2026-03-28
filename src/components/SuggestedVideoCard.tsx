"use client";

import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";

// Suggested Video Card with auto-playing video previews
export default function SuggestedVideoCard({ video }: { video: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger inView if the card is mostly visible
        setInView(entry.isIntersecting);
      },
      { threshold: 0.6 } 
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const ytOptions = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      playsinline: 1,
      mute: 1,
      origin: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    }
  };

  const shouldPlay = isHovered || inView;

  return (
    <div 
      ref={cardRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all border border-white/10 shrink-0 bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Static image that fades out when hovered so the video shows behind it */}
      <img 
        src={video.thumbnail} 
        alt={video.title} 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 z-0 ${shouldPlay ? 'scale-105 opacity-0 delay-[600ms]' : 'scale-100 opacity-100'}`} 
      />

      {/* Inner Video Trailer Layer - Rendered conditionally */}
      {shouldPlay && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {video.youtubeId ? (
            <div className="w-full h-full grid place-items-center bg-black">
               <YouTube 
                 videoId={video.youtubeId} 
                 opts={ytOptions} 
                 className="w-full h-full scale-[1.35]" 
               />
            </div>
          ) : (
            <video
              src={video.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover bg-black"
            />
          )}
        </div>
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
