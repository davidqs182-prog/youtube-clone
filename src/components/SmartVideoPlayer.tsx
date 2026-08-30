"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import YouTube, { YouTubePlayer } from "react-youtube";

interface Highlight {
  start: number;
  end: number;
  caption: string;
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
  singleWebmUrl?: string;
  singleMp4Url?: string;
  highlights: Highlight[];
}

interface SmartVideoPlayerProps {
  video: VideoData;
  isActive: boolean;
  onTrailerEnd: () => void;
  globalMuted: boolean;
  setGlobalMuted: (val: boolean) => void;
  isCommentsOpen?: boolean;
  onOpenComments?: () => void;
  onExpand?: () => void;
}

export default function SmartVideoPlayer({ 
  video, 
  isActive, 
  onTrailerEnd, 
  globalMuted, 
  setGlobalMuted, 
  isCommentsOpen, 
  onOpenComments, 
  onExpand 
}: SmartVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ytPlayer, setYtPlayer] = useState<YouTubePlayer>(null);
  const isPlayerReadyRef = useRef(false);
  const hasEndedRef = useRef(false);
  const [videoError, setVideoError] = useState(false);
  
  // Trailer mode vs Full YouTube Playback mode
  const [isTrailerMode, setIsTrailerMode] = useState(true);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [highlightProgress, setHighlightProgress] = useState(0);
  const [trailerLoopCount, setTrailerLoopCount] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrubberContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrubberThumbRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);
  const durationRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [idleHidden, setIdleHidden] = useState(false);

  // Reset states whenever video changes or becomes inactive
  useEffect(() => {
    isPlayerReadyRef.current = false;
    setYtPlayer(null);
    setIsTrailerMode(true);
    setCurrentHighlightIndex(0);
    setHighlightProgress(0);
    hasEndedRef.current = false;
  }, [video.youtubeId, isActive]);

  useEffect(() => {
    if (!isCommentsOpen && trailerLoopCount > 0) {
      onTrailerEnd();
      setTrailerLoopCount(0);
    }
  }, [isCommentsOpen, trailerLoopCount, onTrailerEnd]);

  /** Reset 4s idle timer for full player controls */
  const resetIdleTimer = () => {
    if (!isActive || isTrailerMode) return;
    if (idleHidden) setIdleHidden(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setIdleHidden(true), 4000);
  };

  const handleMouseLeave = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIdleHidden(false);
  };

  useEffect(() => {
    if (!isActive || isTrailerMode) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setIdleHidden(false);
    }
  }, [isActive, isTrailerMode]);

  useEffect(() => {
    if (isActive && isPlaying && !isTrailerMode) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setIdleHidden(false);
      hideTimerRef.current = setTimeout(() => setIdleHidden(true), 4000);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isActive, isPlaying, isTrailerMode]);

  const callYt = (method: string, ...args: any[]) => {
    if (!ytPlayer || !isPlayerReadyRef.current) return 0;
    try {
      const fn = (ytPlayer as any)[method];
      if (typeof fn === 'function') {
        const res = fn.bind(ytPlayer)(...args);
        if (res && typeof res.catch === 'function') res.catch(() => {});
        return res;
      }
    } catch (_) {}
    return 0;
  };

  const forceApplyMute = (muted: boolean, playerInstance?: any) => {
    const p = playerInstance ?? ytPlayer;
    if (!p) return;
    try {
      if (muted) (p as any).mute?.();
      else (p as any).unMute?.();
    } catch (_) {}
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleCanPlay = () => {
    const v = videoRef.current;
    if (v && isActive && isTrailerMode && v.paused) {
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    }
  };

  // Programmatic Playback Control for Single MP4 Trailer Video
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive && isTrailerMode) {
      hasEndedRef.current = false;
      videoEl.muted = globalMuted;
      if (videoEl.ended) {
        videoEl.currentTime = 0;
      }
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          videoEl.muted = true;
          if (videoEl.ended) videoEl.currentTime = 0;
          videoEl.play().catch(() => {});
        });
      }
    } else {
      videoEl.pause();
    }
  }, [isActive, isTrailerMode, globalMuted, isFullscreen]);

  // Single HTML5 MP4 Video Time Update & Highlight Segment Calculation
  const handleTrailerTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || isNaN(v.duration) || v.duration <= 0) return;

    const numHighlights = video.highlights.length || 1;
    const segmentDuration = v.duration / numHighlights;
    const currentTime = v.currentTime;

    const activeIdx = Math.min(numHighlights - 1, Math.floor(currentTime / segmentDuration));
    const segmentTime = currentTime % segmentDuration;
    const segmentProgress = segmentTime / segmentDuration;

    setCurrentHighlightIndex(activeIdx);
    setHighlightProgress(segmentProgress);
  };

  const handleTrailerEnded = () => {
    if (!hasEndedRef.current) {
      if (isCommentsOpen) {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
        setCurrentHighlightIndex(0);
        setHighlightProgress(0);
        setTrailerLoopCount(prev => prev + 1);
      } else {
        hasEndedRef.current = true;
        onTrailerEnd();
      }
    }
  };

  // Full YouTube Player Progress Loop
  useEffect(() => {
    if (isTrailerMode || !isActive) return;
    let animationFrameId: number;
    
    const checkTime = () => {
      let currentTime = 0;
      let duration = 0;
      if (video.youtubeId && ytPlayer) {
        currentTime = callYt('getCurrentTime') || 0;
        duration = callYt('getDuration') || 0;
      }

      durationRef.current = duration;

      if (duration > 0 && !isDraggingRef.current) {
         const percentage = (currentTime / duration) * 100;
         if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${percentage / 100})`;
         if (scrubberThumbRef.current) scrubberThumbRef.current.style.left = `${percentage}%`;
         if (timeTextRef.current) timeTextRef.current.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
      }

      animationFrameId = requestAnimationFrame(checkTime);
    };

    animationFrameId = requestAnimationFrame(checkTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, isTrailerMode, ytPlayer, video]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // When clicking card during trailer mode -> Switch to Full YouTube Mode
    if (isTrailerMode) {
      setIsTrailerMode(false);
      setIsPlaying(true);
      if (video.youtubeId && ytPlayer) {
        callYt('seekTo', 0, true);
        callYt('playVideo');
      }
      return;
    }
    
    // Toggle play/pause in full player mode
    if (isPlaying) {
      if (video.youtubeId && ytPlayer) {
        callYt('pauseVideo');
      }
      setIsPlaying(false);
    } else {
      if (video.youtubeId && ytPlayer) {
         callYt('playVideo');
      }
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (onExpand) {
      onExpand();
      return;
    }
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().catch(err => console.error(err));
      }
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const updateScrubberFromEvent = (e: React.PointerEvent | PointerEvent) => {
    if (!scrubberContainerRef.current) return;
    const rect = scrubberContainerRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * durationRef.current;
    
    if (video.youtubeId && ytPlayer) {
      callYt('seekTo', newTime, true);
    }

    if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${percent})`;
    if (scrubberThumbRef.current) scrubberThumbRef.current.style.left = `${percent * 100}%`;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isTrailerMode) setIsTrailerMode(false);
    isDraggingRef.current = true;
    updateScrubberFromEvent(e);
    
    if (video.youtubeId && ytPlayer) callYt('pauseVideo');
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      updateScrubberFromEvent(e);
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (!isPlaying) {
          togglePlay();
        } else {
          if (video.youtubeId && ytPlayer) callYt('playVideo');
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isPlaying, video, ytPlayer]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuteState = !globalMuted;
    setGlobalMuted(newMuteState);
    forceApplyMute(newMuteState);
    if (videoRef.current) videoRef.current.muted = newMuteState;
  };

  const onYtReady = (event: any) => {
    isPlayerReadyRef.current = true;
    setYtPlayer(event.target);
    forceApplyMute(globalMuted, event.target);
    if (!isTrailerMode) {
      event.target.playVideo();
    }
  };

  const onYtStateChange = (event: any) => {
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
  };

  const ytOptions = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 1,
      mute: globalMuted ? 1 : 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      loop: 1,
      playlist: video.youtubeId
    }
  };

  const showGroupClass = !idleHidden || isTrailerMode;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-[10px] overflow-hidden aspect-video bg-black cursor-pointer ${showGroupClass ? 'group' : 'cursor-none'}`}
      onClick={togglePlay}
      onMouseMove={resetIdleTimer}
      onMouseLeave={handleMouseLeave}
    >
      {/* 0. Static HD Thumbnail (ALWAYS mounted at z-0 as solid background fallback) */}
      <img
        src={video.thumbnail}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 1. Single HTML5 MP4 Video Trailer Highlight Mode (version 3 .mp4) */}
      {isTrailerMode && isActive && (
        <video
          ref={videoRef}
          autoPlay
          muted={globalMuted}
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          onCanPlay={handleCanPlay}
          onLoadedData={handleCanPlay}
          onTimeUpdate={handleTrailerTimeUpdate}
          onEnded={handleTrailerEnded}
          onError={handleTrailerEnded}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 transform-gpu will-change-transform"
        >
          {video.singleMp4Url && <source src={video.singleMp4Url} type="video/mp4" />}
        </video>
      )}

      {/* 2. Full YouTube Playback Mode (Renders at z-20 when user clicks card to play full video) */}
      {!isTrailerMode && video.youtubeId && isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
           <YouTube 
             videoId={video.youtubeId} 
             opts={ytOptions} 
             onReady={onYtReady} 
             onStateChange={onYtStateChange}
             onError={() => setVideoError(true)}
             className="w-[100%] h-[100%] scale-[1.35] transition-opacity duration-300 pointer-events-none [&>iframe]:pointer-events-none [&>iframe]:w-full [&>iframe]:h-full" 
           />
        </div>
      )}


      {/* Controls Hover Overlay Container */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none" />

      {/* Title and Description */}
      <div className={`absolute left-0 right-16 px-6 pt-6 pb-0 flex flex-col justify-end pointer-events-none z-20 transition-all duration-200 bottom-[24px] group-hover:bottom-[100px] ${isTrailerMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <h2 className="text-white text-xl md:text-2xl font-bold leading-tight drop-shadow-lg line-clamp-2">
           {video.title}
        </h2>
        <p className="text-gray-300 text-sm mt-2 line-clamp-2 drop-shadow-md">
           {video.description}
        </p>
      </div>

      {/* Controls (Revealed on hover, red scrubber bar hidden in trailer mode) */}
      <div 
        className="absolute bottom-0 left-0 right-0 px-4 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 flex flex-col gap-2 cursor-default pointer-events-none group-hover:pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrubber Area (Only in full YouTube video playback mode) */}
        {!isTrailerMode && (
          <div 
             ref={scrubberContainerRef}
             className="w-full h-[24px] flex items-center cursor-pointer group/scrubber relative"
             onPointerDown={handlePointerDown}
          >
              <div className="w-full relative flex items-center h-full">
                 <div className="absolute w-full h-[4px] bg-white/40 rounded-full" />
                 <div 
                   ref={progressBarRef} 
                   className="absolute h-[4px] bg-[#ff0000] rounded-l-full will-change-transform" 
                   style={{ width: "100%", transform: 'scaleX(0)', transformOrigin: '0 0' }}
                 />
                 <div 
                   ref={scrubberThumbRef}
                   className="absolute w-[14px] h-[14px] bg-[#ff0000] rounded-full shadow-sm will-change-left"
                   style={{ left: '0%', transform: "translateX(-50%)" }}
                 />
              </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="p-[4px] bg-black/50 backdrop-blur-md rounded-full text-white">
               <button onClick={togglePlay} className="p-[4px] hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                 {isPlaying ? 
                   <svg height="36" version="1.1" viewBox="0 0 36 36" width="36" className="fill-current"><path d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path></svg> : 
                   <svg height="36" version="1.1" viewBox="0 0 36 36" width="36" className="fill-current"><path d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"></path></svg>
                 }
               </button>
             </div>
             <div className="p-[4px] bg-black/50 backdrop-blur-md rounded-full text-white">
               <button onClick={toggleMute} className="p-[4px] hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                 {globalMuted ? 
                   <svg height="36" version="1.1" viewBox="0 0 36 36" width="36" className="fill-current"><path d="m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .05,-0.2 .05,-0.4 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.14 1.03,-2.46 1.03,-3.86 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,5.42 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 h 4 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.49,2.51 1.27,-1.27 -17.18,-17.18 z m 8.73,1.64 v 3.09 L 14.16,9.89 l 3.82,-3.52 z"></path></svg> : 
                   <svg height="36" version="1.1" viewBox="0 0 36 36" width="36" className="fill-current"><path d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.53 21.5,20.08 21.5,18 C21.5,15.92 20.48,14.47 19,14 Z"></path></svg>
                 }
               </button>
             </div>
             <div className="px-4 py-[16px] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white font-medium tracking-wide">
                <span ref={timeTextRef} style={{fontFamily: "Roboto, Arial, sans-serif", fontSize: "14px"}}>0:00 / 0:00</span>
             </div>
           </div>

           <div className="flex items-center bg-black/50 backdrop-blur-md rounded-full p-[4px] gap-[16px] text-white mr-2">
             <div onClick={toggleFullscreen} className="p-[4px] cursor-pointer hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
               <svg width="36" height="36" viewBox="-2 -2 28 28" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                 <polyline points="9 5 5 5 5 9" />
                 <line x1="5" y1="5" x2="11" y2="11" />
                 <polyline points="15 19 19 19 19 15" />
                 <line x1="19" y1="19" x2="13" y2="13" />
               </svg>
             </div>
           </div>
        </div>
      </div>

      {/* Right Side Interaction Bar (TikTok style) */}
      <div className={`absolute top-1/2 -translate-y-1/2 right-3 md:right-5 flex flex-col items-center gap-5 z-20 pointer-events-auto transition-opacity duration-500 ${idleHidden && !isTrailerMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
         {/* Profile Badge */}
         <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform mb-2">
            <div className="relative">
               <img src={video.avatar} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" alt="Avatar"/>
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--yt-brand)] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                  +
               </div>
            </div>
         </div>

         {/* Like / Dislike */}
         <div className="flex flex-col items-center gap-1.5">
            <div className="flex flex-col items-center bg-black/30 backdrop-blur-md rounded-full overflow-hidden border border-white/10 shadow-lg">
              <button
                onClick={(e) => { e.stopPropagation(); setLiked(l => !l); if (!liked) setDisliked(false); }}
                className={`flex flex-col items-center gap-0.5 px-3 pt-3 pb-2 w-full hover:bg-white/10 transition-all duration-200 ${
                  liked ? 'text-blue-400' : 'text-white'
                }`}
              >
                <ThumbsUp
                  size={24}
                  fill={liked ? 'currentColor' : 'none'}
                  strokeWidth={liked ? 0 : 2}
                  className="transition-transform duration-200 active:scale-90"
                />
                <span className="text-[11px] font-semibold tabular-nums">
                  {video.likes || '10K'}
                </span>
              </button>

              <div className="w-full h-px bg-white/15" />

              <button
                onClick={(e) => { e.stopPropagation(); setDisliked(d => !d); if (!disliked) setLiked(false); }}
                className={`flex flex-col items-center gap-0.5 px-3 pt-2 pb-3 w-full hover:bg-white/10 transition-all duration-200 ${
                  disliked ? 'text-red-400' : 'text-white'
                }`}
              >
                <ThumbsDown
                  size={24}
                  fill={disliked ? 'currentColor' : 'none'}
                  strokeWidth={disliked ? 0 : 2}
                  className="transition-transform duration-200 active:scale-90 mt-0.5"
                />
              </button>
            </div>
         </div>

         {/* Comment */}
         <div 
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
            onClick={(e) => {
               e.stopPropagation();
               if (onOpenComments) onOpenComments();
            }}
         >
            <div className="w-12 h-12 bg-black/10 group-hover:bg-black/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
               <MessageSquare size={24} fill="currentColor" className="opacity-100"/>
            </div>
            <span className="text-white text-[12px] font-semibold drop-shadow-md">{video.comments || "120"}</span>
         </div>

         {/* Share */}
         <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-12 h-12 bg-black/10 group-hover:bg-black/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
               <Share2 size={24} fill="currentColor" className="opacity-100"/>
            </div>
            <span className="text-white text-[12px] font-semibold drop-shadow-md">Share</span>
         </div>

         {/* More */}
         <div className="flex flex-col items-center cursor-pointer group mt-1">
            <div className="w-12 h-12 bg-black/10 group-hover:bg-black/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
               <MoreHorizontal size={24} />
            </div>
         </div>
      </div>

      {/* Top Segmented Progress Bar for Highlights in Trailer Mode */}
      {isTrailerMode && isActive && video.highlights && (
         <div className="absolute top-0 left-0 right-0 flex gap-1.5 p-3 pointer-events-none z-30">
            {video.highlights.map((_, idx) => {
              let widthPercent = 0;
              if (idx < currentHighlightIndex) {
                widthPercent = 100;
              } else if (idx === currentHighlightIndex) {
                widthPercent = Math.min(100, Math.max(0, highlightProgress * 100));
              }

              return (
                <div 
                  key={idx} 
                  className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden shadow-md backdrop-blur-sm"
                >
                  <div 
                    className="h-full bg-white transition-all duration-75"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              );
            })}
         </div>
      )}
    </div>
  );
}
