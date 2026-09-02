"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SmartVideoPlayer from "./SmartVideoPlayer";
import SuggestedVideoCard from "./SuggestedVideoCard";
import CollectionCard from "./CollectionCard";
import CommentsPanel from "./CommentsPanel";

interface Highlight {
  start: number;
  end: number;
  caption: string;
  webmUrl?: string;
}

interface VideoData {
  id: string;
  youtubeId?: string;
  url: string;
  title: string;
  author: string;
  avatar: string;
  views: string;
  publishedAt: string;
  likes?: string;
  comments?: string;
  description?: string;
  thumbnail?: string;
  highlights: Highlight[];
}

interface SuggestedVideo {
  id: string;
  youtubeId: string;
  title: string;
  channelName: string;
  views: string;
  timestamp: string;
  avatarUrl: string;
  thumbnailUrl: string;
  videoUrl?: string;
  gifUrl?: string;
  duration?: string;
  badges?: string[];
  type?: string;
  videosCount?: string;
}

interface InfiniteFeedProps {
  feedVideos: VideoData[];
  suggestedVideos: SuggestedVideo[];
  title?: string;
  showBackButton?: boolean;
}

export default function InfiniteFeed({ feedVideos, suggestedVideos, title, showBackButton }: InfiniteFeedProps) {
  const N = feedVideos.length;
  // Triple the feed so the user can scroll in both directions indefinitely
  const tripleVideos = [...feedVideos, ...feedVideos, ...feedVideos];

  const [activeVideoId, setActiveVideoId] = useState<string | null>(() => N > 0 ? tripleVideos[N].id + `-${N}` : null);
  const [globalMuted, setGlobalMuted] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndex = useRef<number>(N);
  const isScrollingRef = useRef<boolean>(false);
  const touchStartRef = useRef<number>(0);
  const isJumpingRef = useRef<boolean>(false);
  const isExpandingRef = useRef<boolean>(false);

  // Freeze IntersectionObserver during layout transition (fullscreen/comments)
  useEffect(() => {
    isExpandingRef.current = true;
    const timer = setTimeout(() => {
      isExpandingRef.current = false;
    }, 700);
    return () => clearTimeout(timer);
  }, [isFullscreen, isCommentsOpen]);

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

  // Handle Fullscreen listener
  useEffect(() => {
    const handleFs = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  // When exiting fullscreen layout, ensure current active video is centered in view
  useEffect(() => {
    if (!isFullscreen) {
      const activeEl = videoRefs.current[currentIndex.current];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });
      }
    }
  }, [isFullscreen]);

  // IntersectionObserver finding the most visible card in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        let maxRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        });

        if (bestEntry && maxRatio >= 0.35 && !isJumpingRef.current && !isExpandingRef.current) {
          const rawId = (bestEntry as IntersectionObserverEntry).target.getAttribute("data-id");
          const idxAttr = (bestEntry as IntersectionObserverEntry).target.getAttribute("data-index");
          const idx = idxAttr !== null ? parseInt(idxAttr, 10) : -1;

          if (rawId && idx !== -1) {
            setActiveVideoId(rawId);
            currentIndex.current = idx;
          }
        }
      },
      { root: null, threshold: [0.1, 0.35, 0.6, 0.8, 1.0] }
    );

    videoRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedVideos]);

  // Silent infinite looping scroll jump
  const performSilentJumpIfNeeded = (index: number) => {
    if (N === 0) return;

    if (index < N) {
      isJumpingRef.current = true;
      const targetIndex = index + N;
      const targetRef = videoRefs.current[targetIndex];
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });
        currentIndex.current = targetIndex;
        setActiveVideoId(tripleVideos[targetIndex].id + `-${targetIndex}`);
      }
      setTimeout(() => { isJumpingRef.current = false; }, 50);
    } else if (index >= 2 * N) {
      isJumpingRef.current = true;
      const targetIndex = index - N;
      const targetRef = videoRefs.current[targetIndex];
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });
        currentIndex.current = targetIndex;
        setActiveVideoId(tripleVideos[targetIndex].id + `-${targetIndex}`);
      }
      setTimeout(() => { isJumpingRef.current = false; }, 50);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex.current + 1;
        if (videoRefs.current[nextIndex]) {
          videoRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
          performSilentJumpIfNeeded(nextIndex);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex.current - 1;
        if (prevIndex >= 0 && videoRefs.current[prevIndex]) {
          videoRefs.current[prevIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
          performSilentJumpIfNeeded(prevIndex);
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
      return el.closest('.overflow-y-auto') || el.closest('.overflow-auto');
    };

    const handleWheel = (e: WheelEvent) => {
      if (isScrollablePanel(e.target)) return;
      e.preventDefault();

      if (isScrollingRef.current) return;

      if (e.deltaY > 0) {
        isScrollingRef.current = true;
        const nextIndex = currentIndex.current + 1;
        if (videoRefs.current[nextIndex]) {
          videoRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setTimeout(() => {
          isScrollingRef.current = false;
          performSilentJumpIfNeeded(currentIndex.current);
        }, 750);
      } else if (e.deltaY < 0) {
        isScrollingRef.current = true;
        const prevIndex = currentIndex.current - 1;
        if (prevIndex >= 0 && videoRefs.current[prevIndex]) {
          videoRefs.current[prevIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setTimeout(() => {
          isScrollingRef.current = false;
          performSilentJumpIfNeeded(currentIndex.current);
        }, 750);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isScrollablePanel(e.target)) return;
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrollablePanel(e.target)) return;
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollablePanel(e.target)) return;
      if (isScrollingRef.current) return;

      const touchEnd = e.changedTouches[0].clientY;
      const delta = touchStartRef.current - touchEnd;

      if (Math.abs(delta) > 40) {
        if (delta > 0) {
          isScrollingRef.current = true;
          const nextIndex = currentIndex.current + 1;
          if (videoRefs.current[nextIndex]) {
            videoRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          setTimeout(() => {
            isScrollingRef.current = false;
            performSilentJumpIfNeeded(currentIndex.current);
          }, 750);
        } else {
          isScrollingRef.current = true;
          const prevIndex = currentIndex.current - 1;
          if (prevIndex >= 0 && videoRefs.current[prevIndex]) {
            videoRefs.current[prevIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          setTimeout(() => {
            isScrollingRef.current = false;
            performSilentJumpIfNeeded(currentIndex.current);
          }, 750);
        }
      }
    };

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
    const nextIdx = tripleIdx + 1;
    if (nextIdx < tripleVideos.length) {
      const nextCompositeId = `${tripleVideos[nextIdx].id}-${nextIdx}`;
      setActiveVideoId(nextCompositeId);
      currentIndex.current = nextIdx;

      const nextRef = videoRefs.current[nextIdx];
      if (nextRef) {
        nextRef.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      performSilentJumpIfNeeded(nextIdx);
    }
  };

  return (
    <div className={`w-full ${isFullscreen && !isCommentsOpen ? 'flex flex-col p-0 gap-0' : 'grid grid-cols-12 px-4 xl:px-6 py-6 gap-4 xl:gap-6 pb-32'}`}>
      
      {/* Left Column: Main Playback Video Feed (Spans 9 Columns of 12) */}
      <div className={`${isFullscreen && !isCommentsOpen ? 'w-full flex flex-col gap-0' : 'col-span-12 xl:col-span-9 w-full flex flex-col gap-10 md:gap-16'}`}>
        
        {/* Collection Header (Fixed/Sticky circular button + title, moved 4px up) */}
        {(showBackButton || title) && (
          <div className="sticky top-1 z-40 flex items-center gap-3 mb-1 -mt-1 shrink-0 py-0.5">
            {showBackButton && (
              <Link 
                href="/" 
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all flex items-center justify-center border border-white/15 shadow-xl active:scale-95 shrink-0"
                title="Volver a Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            {title && (
              <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2 drop-shadow-lg bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                {title}
              </h1>
            )}
          </div>
        )}

        {tripleVideos.map((video, idx) => {
          const compositeId = `${video.id}-${idx}`;
          const isActive = activeVideoId === compositeId;

          // In fullscreen mode without comments, hide non-active cards to eliminate thumbnail flash
          if (isFullscreen && !isCommentsOpen && !isActive) {
            return (
              <div 
                key={compositeId}
                data-id={compositeId}
                data-index={idx}
                ref={(el) => { videoRefs.current[idx] = el; }}
                className="hidden"
              />
            );
          }

          return (
            <div 
              key={compositeId}
              data-id={compositeId}
              data-index={idx}
              ref={(el) => { videoRefs.current[idx] = el; }}
              className={`w-full flex flex-col snap-center snap-always transition-transform duration-500 ${isFullscreen && !isCommentsOpen ? 'h-[100vh] justify-center' : 'gap-4'}`}
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
                  onExpand={() => {
                    const mainEl = document.querySelector('main');
                    if (mainEl && !document.fullscreenElement) {
                      mainEl.requestFullscreen().catch(() => {});
                    } else if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Suggested Cards Stack or Comments Panel (Spans 3 Columns of 12) */}
      <div className={`${isFullscreen && !isCommentsOpen ? 'hidden' : 'hidden xl:flex'} col-span-12 xl:col-span-3 w-full flex-col gap-4 sticky overflow-y-hidden relative top-6 h-[calc(100vh-6.5rem)]`}>
        {isCommentsOpen ? (
          <CommentsPanel 
            onClose={() => setIsCommentsOpen(false)} 
            video={feedVideos.find(v => activeVideoId?.startsWith(v.id))} 
          />
        ) : (
          <div className="flex flex-col gap-4 pr-2 overflow-y-auto overscroll-contain no-scrollbar h-full pb-10 w-full">
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
