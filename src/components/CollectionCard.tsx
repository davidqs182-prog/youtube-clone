"use client";

import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";

// Collection Card with stacked visual effect and category badge
export default function CollectionCard({ video }: { video: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeoutId = setTimeout(() => {
            setInView(true);
          }, 500);
        } else {
          clearTimeout(timeoutId);
          setInView(false);
        }
      },
      { threshold: 0.6 } 
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
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
      origin: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      loop: 1,
      playlist: video.youtubeId
    }
  };

  const shouldPlay = isHovered || inView;
  
  // Optional: Extract category from video object or fallback to author
  const categoryName = video.category || video.author || "Collection";

  return (
    <div 
      ref={cardRef}
      className="relative w-full shrink-0 group cursor-pointer pt-3 mb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stacked Cards Effect */}
      <div className="absolute top-0 left-8 right-8 h-8 bg-white/10 border border-white/5 rounded-t-xl transition-all duration-300 group-hover:-translate-y-1" />
      <div className="absolute top-1.5 left-4 right-4 h-8 bg-white/20 border border-white/10 rounded-t-xl transition-all duration-300 delay-75 group-hover:-translate-y-0.5" />

      {/* Main Video Card */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black z-10 shadow-lg border border-white/5">
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

        {/* Subtle gradient for hover state over text area */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
        
        {/* Collection Category Pill */}
        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center z-20 pointer-events-none">
            <span className="text-white font-semibold text-sm drop-shadow-md">{categoryName}</span>
        </div>
      </div>
    </div>
  );
}
