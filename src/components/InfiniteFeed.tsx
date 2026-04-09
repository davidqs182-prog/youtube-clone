"use client";

import { useEffect, useRef, useState } from "react";
import SmartVideoPlayer from "./SmartVideoPlayer";
import SuggestedVideoCard from "./SuggestedVideoCard";
import CollectionCard from "./CollectionCard";
import CommentsPanel from "./CommentsPanel";

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
  type?: string;
  category?: string;
}

export default function InfiniteFeed({ feedVideos, suggestedVideos }: { feedVideos: VideoData[], suggestedVideos: VideoData[] }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [globalMuted, setGlobalMuted] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndex = useRef<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const id = entry.target.getAttribute("data-id");
            setActiveVideoId(id);
            const idx = feedVideos.findIndex(v => v.id === id);
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
  }, [feedVideos]);

  // Keyboard navigation for jumping between videos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex.current + 1;
        if (nextIndex < feedVideos.length) {
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
  }, [feedVideos]);

  const handleTrailerEnd = (index: number) => {
    if (index < feedVideos.length - 1) {
      const nextRef = videoRefs.current[index + 1];
      if (nextRef) {
        nextRef.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className={`w-full flex justify-center ${isFullscreen ? 'flex-col p-0 gap-0' : 'flex-col xl:flex-row px-4 xl:px-6 py-6 gap-6 xl:gap-10 pb-32'}`}>
      
      {/* Left Column: Infinite Snapping Feed */}
      <div className={`flex-1 w-full flex flex-col ${isFullscreen ? 'gap-0' : 'gap-10 md:gap-16'}`}>
        {feedVideos.map((video, idx) => (
          <div 
            key={video.id} 
            data-id={video.id}
            ref={(el) => { videoRefs.current[idx] = el; }}
            className={`w-full flex flex-col snap-center transition-transform duration-500 ${isFullscreen ? 'h-[100vh] justify-center' : 'gap-4'}`}
            style={{ 
              transform: activeVideoId === video.id || isFullscreen ? "scale(1)" : "scale(0.96)"
            }}
          >
            {/* Google AI / Gemini brand gradient border */}
            <div className={`w-full relative transition-all duration-500 ${isFullscreen ? '' : 'rounded-xl p-[3px] gemini-border'} ${activeVideoId === video.id ? 'opacity-100 gemini-glow' : 'opacity-40'}`}>
              <SmartVideoPlayer 
                video={video} 
                isActive={activeVideoId === video.id}
                onTrailerEnd={() => handleTrailerEnd(idx)} 
                globalMuted={globalMuted}
                setGlobalMuted={setGlobalMuted}
                isCommentsOpen={isCommentsOpen && activeVideoId === video.id}
                onOpenComments={() => setIsCommentsOpen(true)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Suggested Cards Stack or Comments Panel */}
      <div className={`${isFullscreen ? 'hidden' : 'hidden xl:flex'} w-[420px] flex-col gap-4 flex-shrink-0 sticky overflow-y-hidden relative ${isCommentsOpen ? 'top-6 h-[calc(100vh-6.5rem)]' : 'top-0 h-[calc(100vh-3.5rem)] -mt-6'}`}>
        {isCommentsOpen && !isFullscreen ? (
          <CommentsPanel 
            onClose={() => setIsCommentsOpen(false)} 
            video={feedVideos.find(v => v.id === activeVideoId)} 
          />
        ) : (
          <div className="flex flex-col gap-4 pr-2 overflow-y-auto overscroll-contain no-scrollbar h-full pb-10">
            {[...suggestedVideos, ...suggestedVideos, ...suggestedVideos].map((video, idx) => {
               if (video.type === "collection") {
                 return <CollectionCard key={`sug-${video.id}-${idx}`} video={video} />;
               }
               return <SuggestedVideoCard key={`sug-${video.id}-${idx}`} video={video} />
            })}
          </div>
        )}
      </div>
    </div>
  );
}
