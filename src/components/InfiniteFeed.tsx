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
  const [globalMuted, setGlobalMuted] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  // currentIndex tracks position in the TRIPLED array (0 … 3N-1)
  const currentIndex = useRef<number>(0);
  const isJumpingRef = useRef<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);

  // Custom Scroll Lock Refs
  const isScrollingRef = useRef<boolean>(false);
  const touchStartRef = useRef<number>(0);

  const N = feedVideos.length;
  // Triple the feed so the user can scroll in both directions indefinitely
  const tripleVideos = [...feedVideos, ...feedVideos, ...feedVideos];

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // On first render, jump to the start of the middle block (index N) instantly
  useEffect(() => {
    if (N === 0) return;
    const startRef = videoRefs.current[N];
    if (startRef) {
      startRef.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });
      currentIndex.current = N;
      setActiveVideoId(tripleVideos[N].id + `-${N}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const rawId = entry.target.getAttribute("data-id");
            const idxAttr = entry.target.getAttribute("data-index");
            const idx = idxAttr !== null ? parseInt(idxAttr, 10) : -1;

            if (idx === -1 || isJumpingRef.current) return;

            setActiveVideoId(rawId);
            currentIndex.current = idx;

            // When approaching first third → silently jump to equivalent in middle third
            if (idx < N) {
              isJumpingRef.current = true;
              const targetRef = videoRefs.current[idx + N];
              if (targetRef) {
                targetRef.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });
                currentIndex.current = idx + N;
                setActiveVideoId(tripleVideos[idx + N].id + `-${idx + N}`);
              }
              setTimeout(() => { isJumpingRef.current = false; }, 100);
            }
            // When approaching last third → silently jump to equivalent in middle third
            else if (idx >= 2 * N) {
              isJumpingRef.current = true;
              const targetRef = videoRefs.current[idx - N];
              if (targetRef) {
                targetRef.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });
                currentIndex.current = idx - N;
                setActiveVideoId(tripleVideos[idx - N].id + `-${idx - N}`);
              }
              setTimeout(() => { isJumpingRef.current = false; }, 100);
            }
          }
        });
      },
      { root: null, threshold: 0.6 }
    );

    videoRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedVideos]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex.current + 1;
        videoRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
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

  // Gestor de navegación 1x1 estricto (Rueda y Táctil)
  useEffect(() => {
    const isScrollablePanel = (target: EventTarget | null) => {
      if (!target) return false;
      const el = target as HTMLElement;
      // Permite el scroll nativo dentro de paneles de sugerencias, descripciones o comentarios
      return el.closest('.overflow-y-auto') || el.closest('.overflow-auto');
    };

    const handleWheel = (e: WheelEvent) => {
      if (isScrollablePanel(e.target)) return;

      // Importante: Secuestra el scroll completo de la ventana
      e.preventDefault();

      if (isScrollingRef.current) return;

      if (e.deltaY > 0) {
        isScrollingRef.current = true;
        const nextIndex = currentIndex.current + 1;
        videoRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => isScrollingRef.current = false, 750);
      } else if (e.deltaY < 0) {
        isScrollingRef.current = true;
        const prevIndex = currentIndex.current - 1;
        if (prevIndex >= 0) {
          videoRefs.current[prevIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setTimeout(() => isScrollingRef.current = false, 750);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isScrollablePanel(e.target)) return;
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrollablePanel(e.target)) return;
      e.preventDefault(); // Detiene "arrastre" libre en la pantalla principal
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollablePanel(e.target)) return;
      if (isScrollingRef.current) return;

      const touchEnd = e.changedTouches[0].clientY;
      const delta = touchStartRef.current - touchEnd;

      if (Math.abs(delta) > 40) { // Distancia mínima para considerar un swipe
        if (delta > 0) {
          isScrollingRef.current = true;
          const nextIndex = currentIndex.current + 1;
          videoRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => isScrollingRef.current = false, 750);
        } else {
          isScrollingRef.current = true;
          const prevIndex = currentIndex.current - 1;
          if (prevIndex >= 0) {
            videoRefs.current[prevIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          setTimeout(() => isScrollingRef.current = false, 750);
        }
      }
    };

    // passive: false permite cancelar el evento con preventDefault
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleTrailerEnd = (tripleIdx: number) => {
    const nextRef = videoRefs.current[tripleIdx + 1];
    if (nextRef) {
      nextRef.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className={`w-full flex justify-center ${isFullscreen && !isCommentsOpen ? 'flex-col p-0 gap-0' : 'flex-col xl:flex-row px-4 xl:px-6 py-6 gap-6 xl:gap-10 pb-32'}`}>
      
      {/* Left Column: Infinite Snapping Feed */}
      <div className={`flex-1 w-full flex flex-col ${isFullscreen && !isCommentsOpen ? 'gap-0' : 'gap-10 md:gap-16'}`}>
        {tripleVideos.map((video, idx) => {
          const compositeId = `${video.id}-${idx}`;
          const isActive = activeVideoId === compositeId;
          return (
            <div 
              key={compositeId}
              data-id={compositeId}
              data-index={idx}
              ref={(el) => { videoRefs.current[idx] = el; }}
              className={`w-full flex flex-col snap-center transition-transform duration-500 ${isFullscreen && !isCommentsOpen ? 'h-[100vh] justify-center' : 'gap-4'}`}
              style={{ 
                transform: isActive || (isFullscreen && !isCommentsOpen) ? "scale(1)" : "scale(0.96)"
              }}
            >
              {/* Google AI / Gemini brand gradient border */}
              <div className={`w-full relative transition-all duration-500 ${isFullscreen && !isCommentsOpen ? '' : 'rounded-xl p-[3px] gemini-border'} ${isActive ? 'opacity-100 gemini-glow' : 'opacity-40'}`}>
                <SmartVideoPlayer 
                  video={video} 
                  isActive={isActive}
                  onTrailerEnd={() => handleTrailerEnd(idx)} 
                  globalMuted={globalMuted}
                  setGlobalMuted={setGlobalMuted}
                  isCommentsOpen={isCommentsOpen && isActive}
                  onOpenComments={() => setIsCommentsOpen(true)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Suggested Cards Stack or Comments Panel */}
      <div className={`${isFullscreen && !isCommentsOpen ? 'hidden' : 'hidden xl:flex'} w-[420px] flex-col gap-4 flex-shrink-0 sticky overflow-y-hidden relative top-6 h-[calc(100vh-6.5rem)]`}>
        {isCommentsOpen ? (
          <CommentsPanel 
            onClose={() => setIsCommentsOpen(false)} 
            video={feedVideos.find(v => activeVideoId?.startsWith(v.id))} 
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
