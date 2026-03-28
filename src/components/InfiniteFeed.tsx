"use client";

import { useEffect, useRef, useState } from "react";
import SmartVideoPlayer from "./SmartVideoPlayer";
import SuggestedVideoCard from "./SuggestedVideoCard";

interface Highlight {
  start: number;
  end: number;
  caption: string;
}

interface VideoData {
  id: string;
  url: string;
  title: string;
  author: string;
  avatar: string;
  views: string;
  publishedAt: string;
  likes?: string;
  comments?: string;
  description?: string;
  thumbnail: string;
  highlights: Highlight[];
}

export default function InfiniteFeed({ videos }: { videos: VideoData[] }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [globalMuted, setGlobalMuted] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndex = useRef<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const id = entry.target.getAttribute("data-id");
            setActiveVideoId(id);
            const idx = videos.findIndex(v => v.id === id);
            if (idx !== -1) currentIndex.current = idx;
          }
        });
      },
      {
        root: null,
        threshold: 0.6,
      }
    );

    videoRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [videos]);

  // Keyboard navigation for jumping between videos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex.current + 1;
        if (nextIndex < videos.length) {
          videoRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex.current - 1;
        if (prevIndex >= 0) {
          videoRefs.current[prevIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videos]);

  const handleTrailerEnd = (index: number) => {
    if (index < videos.length - 1) {
      const nextRef = videoRefs.current[index + 1];
      if (nextRef) {
        nextRef.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row justify-center px-4 xl:px-6 py-6 gap-6 xl:gap-10 pb-32">
      
      {/* Left Column: Infinite Snapping Feed */}
      <div className="flex-1 w-full flex flex-col gap-10 md:gap-16">
        {videos.map((video, idx) => (
          <div 
            key={video.id} 
            data-id={video.id}
            ref={(el) => { videoRefs.current[idx] = el; }}
            className="w-full flex flex-col gap-4 snap-center transition-transform duration-500"
            style={{ 
              transform: activeVideoId === video.id ? "scale(1)" : "scale(0.96)"
            }}
          >
            {/* Ambient Lighting Edge / Container Effect */}
            <div className={`w-full relative rounded-xl p-[4px] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-teal-500/30 shadow-[0_0_50px_rgba(100,100,255,0.1)] transition-opacity duration-500 ${activeVideoId === video.id ? 'opacity-100' : 'opacity-40'}`}>
              <SmartVideoPlayer 
                video={video} 
                isActive={activeVideoId === video.id}
                onTrailerEnd={() => handleTrailerEnd(idx)} 
                globalMuted={globalMuted}
                setGlobalMuted={setGlobalMuted}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Suggested Cards Stack */}
      <div className="hidden xl:flex w-[420px] flex-col gap-4 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto no-scrollbar pb-10">
        <div className="flex flex-col gap-4 pr-2">
          {[...videos, ...videos, ...videos].map((video, idx) => (
             <SuggestedVideoCard key={`sug-${video.id}-${idx}`} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}
