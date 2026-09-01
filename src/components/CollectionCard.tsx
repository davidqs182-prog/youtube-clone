"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Collection Card with stacked visual effect and category badge
export default function CollectionCard({ video }: { video: any }) {
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
  
  // Optional: Extract category from video object or fallback to author
  const categoryName = video.category || video.author || "Collection";
  const gifSrc = video.gifUrl;

  return (
    <Link 
      href="/bachata-fuego"
      ref={cardRef}
      className="relative w-full shrink-0 group cursor-pointer pt-3 mb-2 block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stacked Cards Effect */}
      <div className="absolute top-0 left-8 right-8 h-8 bg-white/10 border border-white/5 rounded-t-xl transition-all duration-300 group-hover:-translate-y-1" />
      <div className="absolute top-1.5 left-4 right-4 h-8 bg-white/20 border border-white/10 rounded-t-xl transition-all duration-300 delay-75 group-hover:-translate-y-0.5" />

      {/* Main Video Card */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black z-10 shadow-lg border border-white/5">
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

        {/* Subtle gradient for hover state over text area */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
        
        {/* Collection Category Pill */}
        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center z-20 pointer-events-none">
            <span className="text-white font-semibold text-sm drop-shadow-md">{categoryName}</span>
        </div>
      </div>
    </Link>
  );
}
